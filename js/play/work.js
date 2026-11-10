/* 작업 화면: 밭 한 칸을 가까이 보면서 손동작으로 농사지어요 (DESIGN.md 3번)
   심기: 밭 갈기 → 이랑 만들기 → 씨 심기 → 흙 덮기 → 물 주기 · 다 자라면 하나씩 따서 거두기
   손동작이 정확할수록 "정성"이 쌓이고, 정성이 높으면 거둘 때 상품(하나 더)이 나와요.
   대충 해도 작물은 다 자라요. 잘하면 보상이 조금 더 있을 뿐이에요. */

const SPOTS=[[-0.45,-0.45],[0.45,-0.45],[-0.45,0.45],[0.45,0.45]]; // 한 칸에 네 포기
const ROWS=[-0.45,0.45]; // 이랑 두 줄
const SOIL_HARD=new THREE.Color(0x9a6b45),SOIL_SOFT=new THREE.Color(0x6e4a2e),SOIL_WET=new THREE.Color(0x4a2f1c);
const STEP_NAME={weed:"김매기",bug:"벌레 잡기",till:"밭 갈기",ridge:"이랑",seed:"씨 심기",cover:"흙 덮기",water:"물 주기",harvest:"거두기",drain:"물꼬 트기",stake:"지주대 묶기",vinyl:"비닐 덮기"};
const SWEAT={weed:2,bug:1,till:2,ridge:1,seed:1,cover:1,water:1,drain:2,stake:2,vinyl:2};
// 궂은 날씨 대비(play/storm.js)는 손동작이 이미 있는 것과 같아요: 물꼬 = 줄 긋기, 지주대 = 콕콕, 비닐 = 쓸기
const GEST={drain:"ridge",stake:"seed",vinyl:"cover",weed:"seed",bug:"seed"},gest=s=>GEST[s]||s;
const DRAIN_ROWS=[-0.8,0.8]; // 밭 칸 가장자리 고랑
// 레벨이 오르면 손이 빨라져요
// 출출하거나 목마르면 한 번 더, 새참 기운이 나면 한 번 덜 (play/meal.js)
const handAdj=()=>boosted()?-1:(hungry()?1:0)+(thirsty()?1:0); // 배고프고 목마르면 두 번 더
const tillNeed=()=>Math.max(1,(myLv()>=1?2:3)+handAdj());
const coverNeed=()=>Math.max(1,(myLv()>=2?1:2)+handAdj());
const waterZone=()=>{const z=myLv()>=3?[0.48,0.86]:[0.56,0.8];return boosted()?[z[0]-0.05,Math.min(0.95,z[1]+0.05)]:z};
const qualityChance=care=>Math.max(0.05,(care-0.4)*1.2); // 정성 1이면 72%, 0.6이면 24%

let W=null; // 지금 하는 작업 (없으면 null)
const wEl=$("work"),wSvg=$("wLayer"),wFinger=$("wFinger");
const SVGNS="http://www.w3.org/2000/svg";
function svgEl(tag,cls){const e=document.createElementNS(SVGNS,tag);e.setAttribute("class",cls);wSvg.appendChild(e);return e}
const _v=new THREE.Vector3();
function wp(lx,ly,lz){const g=W.P.g.position;_v.set(g.x+lx,ly,g.z+lz).project(camera);return {x:(_v.x+1)/2*wEl.clientWidth,y:(1-_v.y)/2*wEl.clientHeight}} // 밭 칸 위의 점 → 화면 위치
function buzz(p){try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}}
function wPop(x,y,t){const e=document.createElement("span");e.className="wpop";e.textContent=t;e.style.left=x+"px";e.style.top=y+"px";wEl.appendChild(e);setTimeout(()=>e.remove(),900)}
const avg=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0.5;
const careDots=v=>{const n=Math.round(v*5);return "●".repeat(n)+"○".repeat(5-n)};
const meLabel=()=>me.g.children.find(c=>c.isSprite);

/* ---------- 시작과 끝 ---------- */
function startWork(i,kind){ // kind: plant(빈 칸 심기) · water(심어 둔 칸 물 주기) · harvest(거두기) · prep(궂은 날씨 대비)
  const P=plots[i],p=S.plots[i];stashHold();const ev=kind==="prep"?stormWarn():null;
  const steps=kind==="plant"?["till","ridge","seed","cover","water"]:kind==="water"?["water"]:kind==="prep"?[WX_EV[ev.kind].step]:kind==="tend"?["weed","bug","dry"].filter(k=>activeIssues(p).some(x=>x.k===k)).map(k=>ISSUE[k].step):["harvest"];
  W={i,P,kind,crop:p?p.crop:S.sel,steps,si:-1,scores:[],g:new THREE.Group(),fly:[],planted:kind!=="plant",
     mat:new THREE.MeshLambertMaterial({color:kind==="plant"?SOIL_HARD:SOIL_SOFT})};
  W.ev=ev;P.g.add(W.g);P.soil.material=W.mat;P.crop.visible=kind==="water"||kind==="prep"||kind==="tend";if(kind==="tend")P.crop.children.forEach(c=>{if(c.isSprite||c.userData.iss)c.visible=false});
  if(kind==="plant")for(let k=0;k<7;k++){const c=box(0.24,0.1,0.18,0x8a5e3c,(Math.random()-.5)*1.4,0.28,(Math.random()-.5)*1.4);c.rotation.y=Math.random()*3;c.userData.clod=true;W.g.add(c)} // 굳은 흙덩이
  const lab=meLabel();if(lab)lab.visible=false;
  document.querySelector(".bottom").hidden=true;document.querySelector(".top").hidden=true;wEl.hidden=false;
  $("wSteps").innerHTML=steps.map(s=>`<li>${STEP_NAME[s]}</li>`).join("");
  $("wCare").textContent=kind==="harvest"||kind==="tend"?"정성 "+careDots(p.care==null?0.5:p.care)+" · 돌봄 "+careDots(tendScore(p)):"";
  nextStep();
}
function endWork(msg){
  if(!W)return;const i=W.i;W.P.g.remove(W.g);W.P.crop.visible=true;W=null;drawPlot(i,true);
  wEl.hidden=true;wSvg.innerHTML="";document.querySelector(".bottom").hidden=false;document.querySelector(".top").hidden=false;
  const lab=meLabel();if(lab)lab.visible=true;
  refresh();if(msg)toast(msg);
  if(lvQueue!=null)setTimeout(showLevelUp,700);
}
$("wQuit").onclick=()=>endWork(W&&W.planted&&W.kind==="plant"?"씨는 심어 뒀어요. 물은 다음에 줘도 돼요":"다음에 마저 해요");

/* ---------- 단계 ---------- */
function nextStep(){
  W.si++;wSvg.innerHTML="";W.st={};W.hint=true;W.busy=false;
  const s=W.steps[W.si],st=W.st;
  if(!s&&W.kind==="prep"){const p=S.plots[W.i];if(p)p.prep={ev:W.ev.id};save();const E=WX_EV[W.ev.kind];endWork(E.prep+" 했어요! 이제 "+josa(E.name,"이","가")+" 와도 이 칸은 끄떡없어요");return}
  if(!s&&W.kind==="tend"){endWork(pickOne(["잘 돌봐 줬어요! 다시 쑥쑥 자라요","밭이 한결 깔끔해졌어요","정성껏 돌봤어요. 특상이 나올지도 몰라요"])+" · 돌봄 "+careDots(tendScore(S.plots[W.i])));return}
  if(!s){endWork(W.rain?"비가 와서 물은 하늘이 줬어요. 이제 기다리면 자라요":"다 심었어요. 이제 기다리면 자라요");return}
  [...$("wSteps").children].forEach((li,k)=>li.className=k<W.si?"done":k===W.si?"on":"");
  wFinger.className="finger f-"+gest(s);
  $("wGauge").hidden=s!=="water";
  if(s==="till"){st.need=tillNeed();st.n=0;st.run=0;st.dir=0}
  if(gest(s)==="ridge"){st.rows=s==="drain"?DRAIN_ROWS:ROWS;st.done=[0,0];st.sc=[];st.lines=st.rows.map(()=>svgEl("line","wguide"))}
  if(gest(s)==="seed"){st.pos=s==="weed"?WEED_POS:SPOTS;st.t=st.pos.map(([x,z])=>({el:svgEl("circle","wtarget"),done:false,g:s==="weed"?weedTuft(x,z,W.g,0.28):s==="bug"?bugMesh(x+0.08,z,W.g,0.62):null}));st.sc=[]}
  if(gest(s)==="cover"){st.need=s==="vinyl"?3:coverNeed();st.n=0;st.len=0}
  if(s==="water"){st.g=0;st.z=waterZone();st.tick=0;$("wZone").style.left=st.z[0]*100+"%";$("wZone").style.width=(st.z[1]-st.z[0])*100+"%";$("wFill").style.width="0%"}
  if(s==="harvest")st.t=SPOTS.map(([x,z])=>{const g=new THREE.Group();g.position.set(x,0.25,z);ripeAt(g,W.crop,0,0);W.g.add(g);return {g,el:svgEl("circle","wtarget"),done:false}});
  guide();
}
function guide(){
  const s=W.steps[W.si],st=W.st,c=CROPS[W.crop].name;
  $("wGuide").textContent={till:`호미로 흙을 좌우로 슥슥 문질러요 · ${st.need-st.n}번 남음`,ridge:"점선을 따라 손가락으로 길게 그어 이랑을 만들어요",
    seed:`동그라미 자리를 콕콕 눌러 ${c} 씨를 넣어요`,cover:`손으로 흙을 살살 쓸어 씨를 덮어요 · ${st.need-st.n}번 남음`,
    water:"꾹 누르고 있다가 초록 칸에서 손을 떼요",harvest:`잘 자란 ${c}를 하나씩 톡톡 따요`,
    weed:"잡초를 콕콕 눌러 뿌리째 쑥 뽑아요",bug:`${c} 잎에 붙은 벌레를 콕콕 눌러 떼어 내요`,
    drain:"밭 가장자리 점선을 따라 그어 물이 빠질 고랑을 터요",stake:"동그라미를 콕콕 눌러 포기마다 지주대를 꽂고 묶어요",vinyl:`손으로 쓸어 비닐을 덮어요 · ${st.need-st.n}번 남음`}[s];
}
function stepDone(score){
  const s=W.steps[W.si];W.scores.push(score);W.busy=true;sweat(SWEAT[s]);
  const c=wp(0,0.3,0);wPop(c.x,c.y+50,"땀방울 +"+SWEAT[s]);
  if(W.kind!=="harvest")$("wCare").textContent="정성 "+careDots(avg(W.scores));
  if(s==="cover")commitPlant();
  setTimeout(()=>{if(W)nextStep()},550);
}
// 흙까지 덮으면 씨앗이 밭에 들어간 거예요. 여기서 그만둬도 심은 건 남아요
function commitPlant(){
  const c=W.crop;S.seeds[c]--;S.plots[W.i]={crop:c,wat:null,care:avg(W.scores),pt:Date.now()};W.planted=true;
  if(weather.kind==="비"||weather.kind==="눈"){wetFromWeather(true);W.rain=true;W.steps=W.steps.slice(0,W.si+1)}
  save();refresh();
}

/* ---------- 손동작 받기 ---------- */
function wpt(e){const r=wEl.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top}}
wEl.addEventListener("pointerdown",e=>{if(!W||W.busy||e.target.closest("button"))return;e.preventDefault();try{wEl.setPointerCapture(e.pointerId)}catch(_){}
  const p=wpt(e);W.down=true;W.path=[p];W.last=p;onDown(p)});
wEl.addEventListener("pointermove",e=>{if(!W||!W.down||W.busy)return;const p=wpt(e);W.path.push(p);onMove(p,W.last);if(W)W.last=p});
const wUp=e=>{if(!W||!W.down)return;W.down=false;if(!W.busy)onUp(wpt(e))};
wEl.addEventListener("pointerup",wUp);wEl.addEventListener("pointercancel",wUp);

function onDown(p){
  const s=W.steps[W.si],st=W.st;
  if(s==="till"){st.dir=0;st.run=0}
  if(s==="water")st.hold=true;
  if(gest(s)==="seed"||s==="harvest"){
    let best=null,bd=1e9;st.t.forEach(t=>{if(t.done)return;const d=Math.hypot(p.x-t.sx,p.y-t.sy);if(d<bd){bd=d;best=t}});
    if(!best||bd>best.r*1.4){wPop(p.x,p.y-30,"동그라미를 눌러요");return}
    best.done=true;best.el.remove();W.hint=false;workT=0.5;
    if(s==="stake")stakeIn(best);else if(s==="seed")plantSeed(best,bd);else if(s==="weed"||s==="bug")pluckIssue(best,s);else pick(best,p);
  }
}
function onMove(p,l){
  const s=W.steps[W.si],st=W.st;
  if(s==="till"){const dx=p.x-l.x,d=Math.sign(dx);if(!d)return;
    if(d!==st.dir){st.dir=d;st.run=0;st.counted=false}
    st.run+=Math.abs(dx);if(!st.counted&&st.run>=50){st.counted=true;tillStroke(p)}}
  if(gest(s)==="cover"){st.len+=Math.hypot(p.x-l.x,p.y-l.y);if(st.len>=150){st.len=0;coverStroke(p)}}
}
function onUp(p){
  const s=W.steps[W.si];
  if(gest(s)==="ridge")ridgeLine();
  if(s==="water")waterRelease();
}

/* 밭 갈기: 좌우로 한 번 문지를 때마다 흙덩이가 부서지고 흙이 부드러워져요 */
function tillStroke(p){
  const st=W.st;st.n++;W.hint=false;sfx("scrape");buzz(12);workT=0.5;wPop(p.x,p.y-30,"슥");
  const clods=W.g.children.filter(c=>c.userData.clod),k=Math.ceil(clods.length/(st.need-st.n+1));
  clods.slice(0,k).forEach(c=>W.g.remove(c));
  W.mat.color.copy(SOIL_HARD).lerp(SOIL_SOFT,st.n/st.need);guide();
  if(st.n>=st.need)stepDone(1);
}
/* 이랑: 점선을 따라 그은 줄이 곧을수록 정성이 높아요 */
function ridgeLine(){
  const st=W.st,P=W.path;if(P.length<3)return;
  const rows=st.rows.map(z=>{const A=wp(-0.8,0.32,z),B=wp(0.8,0.32,z),L=Math.hypot(B.x-A.x,B.y-A.y);
    const dev=P.reduce((s,q)=>s+Math.abs((B.x-A.x)*(A.y-q.y)-(A.x-q.x)*(B.y-A.y))/L,0)/P.length;return {A,B,L,dev}});
  const span=Math.hypot(P[P.length-1].x-P[0].x,P[P.length-1].y-P[0].y),mid=P[Math.floor(P.length/2)];
  let r=rows[0].dev<rows[1].dev?0:1;if(st.done[r])r=1-r;if(st.done[r])return;
  const R=rows[r];
  if(R.dev>R.L*0.45){wPop(mid.x,mid.y-30,"점선을 따라 그어요");return}
  if(span<R.L*0.5){wPop(mid.x,mid.y-30,"조금 더 길게 그어요");return}
  const sc=Math.max(0.3,Math.min(1,1-R.dev/(R.L*0.18)));
  st.done[r]=1;st.sc.push(sc);st.lines[r].classList.add("done");W.hint=false;
  if(W.steps[W.si]==="drain"){W.g.add(box(1.75,0.04,0.2,0x3a2a1c,0,0.26,st.rows[r]));W.g.add(box(1.6,0.02,0.1,0x6fa8c8,0,0.285,st.rows[r]));sfx("pour")} // 고랑과 빠지는 물
  else{const m=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.14,0.42),W.mat);m.position.set(0,0.3,ROWS[r]);m.castShadow=m.receiveShadow=true;W.g.add(m)}
  sfx("scrape");buzz(15);workT=0.5;wPop(mid.x,mid.y-30,W.steps[W.si]==="drain"?"물이 빠져요":sc>0.8?"곧은 이랑!":sc>0.55?"좋아요":"조금 삐뚤어요");
  if(st.done[0]&&st.done[1])stepDone(avg(st.sc));
}
/* 씨 심기: 동그라미 가운데에 가까울수록 정성이 높아요 */
function plantSeed(t,d){
  const st=W.st,k=st.t.indexOf(t),[x,z]=SPOTS[k];
  st.sc.push(Math.max(0.5,1-d/(t.r*1.4)*0.5));
  const h=cyl(0.09,0.09,0.02,0x3a2416,x,0.375,z);h.userData.seedBit=true;W.g.add(h);
  const s=sph(0.05,0xe8d8a8,x,0.4,z);s.userData.seedBit=true;W.g.add(s);
  sfx("seed");buzz(10);wPop(t.sx,t.sy-30,"쏙");
  if(st.t.every(t=>t.done))stepDone(avg(st.sc));
}
/* 김매기·벌레 잡기: 하나씩 콕 눌러 없애요 */
function pluckIssue(t,s){if(t.g)W.fly.push(t.g);sfx(s==="weed"?"scrape":"pluck");buzz(12);workT=0.5;wPop(t.sx,t.sy-30,s==="weed"?"쑥":"톡");
  if(W.st.t.every(t=>t.done)){resolveIssue(S.plots[W.i],s==="weed"?"weed":"bug");save();stepDone(1)}}
/* 지주대: 포기 옆에 대나무를 꽂고 끈으로 묶어요 */
function stakeIn(t){const st=W.st,k=st.t.indexOf(t),[x,z]=SPOTS[k];const m=stakeMesh(x,z);m.position.y=0.25;W.g.add(m);sfx("seed");buzz(12);workT=0.5;wPop(t.sx,t.sy-30,"꽉");
  if(st.t.every(t=>t.done))stepDone(1)}
/* 흙 덮기: 살살 쓸면 씨앗 자리가 흙으로 덮여요 */
function coverStroke(p){
  if(W.steps[W.si]==="vinyl"){const st=W.st;st.n++;W.hint=false;sfx("scrape");buzz(10);workT=0.5;wPop(p.x,p.y-30,"사락");
    W.g.children.filter(c=>c.userData.vinyl).forEach(c=>W.g.remove(c));const v=vinylMesh(st.n/st.need);v.userData.vinyl=true;v.position.y=0.25;W.g.add(v);guide();if(st.n>=st.need)stepDone(1);return}
  const st=W.st;st.n++;W.hint=false;sfx("scrape");buzz(10);workT=0.5;wPop(p.x,p.y-30,"살살");
  const bits=W.g.children.filter(c=>c.userData.seedBit),k=st.n>=st.need?bits.length:Math.ceil(bits.length/2);
  bits.slice(0,k).forEach(c=>W.g.remove(c));
  if(st.n>=st.need)SPOTS.forEach(([x,z])=>{const m=new THREE.Mesh(new THREE.SphereGeometry(0.13,10,8),W.mat);m.scale.y=0.45;m.position.set(x,0.37,z);W.g.add(m)});
  guide();if(st.n>=st.need)stepDone(1);
}
/* 물 주기: 누르고 있는 동안 물이 차요. 초록 칸에서 떼면 딱 알맞아요 */
function waterRelease(){
  const st=W.st;st.hold=false;const c=wp(0,0.3,0);
  if(st.g<0.25){if(st.g>0)wPop(c.x,c.y-40,"조금 더 줘요");return}
  const [a,b]=st.z,ok=st.g>=a&&st.g<=b;
  waterDone(ok?1:st.g<a?0.55+0.4*st.g/a:0.6,ok?"딱 알맞게 줬어요!":st.g<a?"조금 적지만 괜찮아요":"조금 많았어요");
}
function waterDone(score,msg){
  const p=S.plots[W.i];if(W.kind==="tend")resolveIssue(p,"dry");else{p.wat=Date.now();if(!p.iss)planIssues(p)}p.care=((p.care==null?0.5:p.care)*4+score)/5;
  W.hint=false;sfx("water");buzz(20);const c=wp(0,0.3,0);wPop(c.x,c.y-40,msg);
  save();refresh();stepDone(score);
}
/* 거두기: 하나씩 톡 따요. 다 따면 정성에 따라 상품이 나올 수 있어요 */
function pick(t,p){
  W.fly.push(t.g);sfx("pluck");buzz(15);wPop(t.sx,t.sy-30,"톡");
  if(W.st.t.every(t=>t.done)){W.busy=true;setTimeout(finishHarvest,450)}
}
// 거두기: 정성 + 돌봄 → 특상 몇 개, 아주 가끔 왕 작물 (play/tend.js)
function finishHarvest(){
  if(!W)return;const c=W.crop,p=S.plots[W.i],care=p.care==null?0.5:p.care,good=Math.random()<qualityChance(care),G=harvestGrade(p);
  const extra=boosted()&&Math.random()<0.5?1:0; // 새참 기운: 하나 더
  const n=CROPS[c].yield+(good?1:0)+extra,name=CROPS[c].name,top=Math.min(n,Math.round(n*G.topFrac)),king=Math.random()<G.king;
  S.inv[c]+=n-top;if(top)S.inv[c+"_top"]=(S.inv[c+"_top"]||0)+top;
  S.cropDex=S.cropDex||{};const d=S.cropDex[c]=S.cropDex[c]||{n:0,top:0,king:0};d.n+=n;d.top+=top;let kg=0;
  if(king){const [a,b]=KING_KG[c];kg=a+Math.random()*(b-a);S.inv[c+"_king"]=(S.inv[c+"_king"]||0)+1;d.king++;d.kg=Math.max(d.kg||0,kg)}
  S.plots[W.i]=null;sweat(2+(good?1:0)+(top?1:0));save();
  endWork((extra?"새참 기운으로 하나 더! ":"")+(top===n?`전부 특상 ${name}! `:top?`특상 ${name} ${top}개! `:"")+`${name} ${n}개를 거뒀어요`+(top?"":G.q<0.6?" · 자라는 동안 잘 돌보면 특상이 나와요":""));
  if(king)setTimeout(()=>showKing(c,kg),700);
}

/* ---------- 매 순간: 화면 위 안내(점선, 동그라미, 손가락)를 3D 밭 위치에 맞춰요 ---------- */
function workFrame(dt){
  if(!W)return;const s=W.steps[W.si],st=W.st;if(!s)return;const c=wp(0,0.3,0);let f=null;
  if(gest(s)==="ridge")st.rows.forEach((z,r)=>{const A=wp(-0.8,0.32,z),B=wp(0.8,0.32,z),l=st.lines[r];
    l.setAttribute("x1",A.x);l.setAttribute("y1",A.y);l.setAttribute("x2",B.x);l.setAttribute("y2",B.y);
    if(!f&&!st.done[r]){f=A;wFinger.style.setProperty("--dx",(B.x-A.x)+"px");wFinger.style.setProperty("--dy",(B.y-A.y)+"px")}});
  if(gest(s)==="seed"||s==="harvest"){const y=s==="seed"?0.38:s==="stake"?0.6:s==="weed"?0.38:s==="bug"?0.62:0.75;
    st.t.forEach((t,k)=>{const [x,z]=(st.pos||SPOTS)[k],q=wp(x+(s==="bug"?0.08:0),y,z),e=wp(x+0.25,y,z);t.sx=q.x;t.sy=q.y;t.r=Math.max(18,Math.hypot(e.x-q.x,e.y-q.y));
      if(!t.done){t.el.setAttribute("cx",q.x);t.el.setAttribute("cy",q.y);t.el.setAttribute("r",t.r);if(!f)f=q}})}
  if(s==="till"||gest(s)==="cover"||s==="water")f=c;
  const show=W.hint&&!W.busy&&f;wFinger.style.display=show?"block":"none";
  if(show){wFinger.style.left=f.x+"px";wFinger.style.top=f.y+"px"}
  if(s==="water"&&st.hold&&!W.busy){
    st.g+=dt/1.6;$("wFill").style.width=Math.min(100,st.g*100)+"%";
    W.mat.color.copy(SOIL_SOFT).lerp(SOIL_WET,Math.min(1,st.g/0.7));
    st.tick-=dt;if(st.tick<=0){st.tick=0.3;const g=W.P.g.position;splash(g.x,g.z);sfx("pour")}
    if(st.g>=1){st.hold=false;W.down=false;
      const pud=cyl(0.8,0.8,0.02,0x6fa8c8,0,0.27,0,20);pud.material=new THREE.MeshLambertMaterial({color:0x6fa8c8,transparent:true,opacity:0.6});W.g.add(pud);
      waterDone(0.35,"넘쳤어요! 다음엔 조금 일찍 떼요")}
  }
  W.fly=W.fly.filter(g=>{g.position.y+=dt*3;g.scale.multiplyScalar(1-dt*4);if(g.scale.x<0.1){W.g.remove(g);return false}return true});
}
