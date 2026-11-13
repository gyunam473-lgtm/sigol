/* 마당일: 장작 마련과 논농사 (모양은 world/yard.js). 밭일 작업 화면(손가락 안내, 단계, 게이지)을 같이 써요.
   장작: 땔감 숲 쓰러진 나무 톱질(통나무 3) → 모탕에서 도끼질(통나무 하나에 두 번, 장작 4) → 지붕 있는 장작가리에 쌓여요 (창고에 수량)
         땔감 숲엔 날마다 나무 3그루가 새로 생겨요. 부뚜막 요리 1개, 아궁이 3개(겨울 6개). 겨울밤 구들을 안 때면 아침에 추워요
   논: 모(씨앗가게) → 써레질 → 물 대기 → 모내기 → 자라기 → 벼 베기 → 벼 털기 → 쌀 */

let PD=null; // 지금 하는 마당일
const woodToday=()=>{const d=dayKey(new Date());if(S.woodDay!==d){S.woodDay=d;S.woodGone=[];S.woodAt={}}return S.woodGone};
// 벤 자리엔 FUEL.regrow 초 뒤 다시 쓰러진 나무가 생겨요. 생긴 게 있으면 true
function woodRegrow(){const g=woodToday();S.woodAt=S.woodAt||{};const now=Date.now(),n=g.length;
  S.woodGone=g.filter(i=>{if(!S.woodAt[i])S.woodAt[i]=now+FUEL.regrow*1000;if(now<S.woodAt[i])return true;delete S.woodAt[i];return false});
  if(S.woodGone.length!==n){save();return true}return false}
const winterNow=()=>seasonOf(new Date())===3;
const ondolNeed=()=>winterNow()?FUEL.ondolWinter:FUEL.ondol;
function applyWoodLand(){woodRegrow();const gone=woodToday();woodTrees.forEach((t,i)=>t.visible=mode==="home"&&!gone.includes(i));
  motang.visible=woodpile.visible=mode==="home";drawWoodpile();drawPaddy()}

/* ---------- 손동작 단계 ---------- */
// g: rub(좌우 슥슥) · tap(콕콕) · hold(누르고 있다가 떼기) · down(위에서 아래로 내리찍기)
const CH={
  saw:{name:"톱질",g:"rub",n:4,guide:n=>`쓰러진 나무에 톱을 대고 좌우로 쓱싹쓱싹 · ${n}번 남음`,pop:"쓱싹",sfx:"scrape"},
  chop:{name:"도끼질",g:"down",guide:n=>`도끼를 들어 통나무 한가운데를 위에서 아래로 내리찍어요 · ${n}번 남음`},
  sseore:{name:"써레질",g:"rub",n:3,guide:n=>`써레로 논흙을 좌우로 고르게 펴요 · ${n}번 남음`,pop:"척척",sfx:"scrape"},
  mul:{name:"물 대기",g:"hold",guide:()=>"꾹 누르고 있다가 물이 알맞게 차면(초록 칸) 손을 떼요"},
  monae:{name:"모내기",g:"tap",guide:()=>"동그라미 자리를 콕콕 눌러 모를 한 줌씩 꽂아요"},
  beda:{name:"벼 베기",g:"rub",n:4,guide:n=>`낫으로 누런 벼를 좌우로 슥슥 베어요 · ${n}번 남음`,pop:"싹둑",sfx:"scrape"},
  teol:{name:"벼 털기",g:"tap",guide:()=>"볏단을 홀태에 콕콕 훑어 낟알을 털어요"}};
const _pv=new THREE.Vector3();
function sp(v){_pv.copy(v).project(camera);return {x:(_pv.x+1)/2*wEl.clientWidth,y:(1-_pv.y)/2*wEl.clientHeight}}
function spR(v,d=0.15){const a=sp(v),b=sp(v.clone().add(new THREE.Vector3(d,0,0)));return Math.max(20,Math.hypot(b.x-a.x,b.y-a.y))}

function startChore(job){
  stashHold();PD=Object.assign({si:-1,scores:[],g:new THREE.Group(),busy:false},job);scene.add(PD.g);
  me.g.visible=false;document.querySelector(".top").hidden=true;document.querySelector(".bottom").hidden=true;wEl.hidden=false;
  $("wSteps").innerHTML=PD.steps.map(s=>`<li>${CH[s].name}</li>`).join("");$("wCare").textContent="";
  if(PD.setup)PD.setup();nextChore();
}
function endChore(msg){if(!PD)return;scene.remove(PD.g);if(PD.cleanup)PD.cleanup();PD=null;
  me.g.visible=true;wEl.hidden=true;wSvg.innerHTML="";$("wGauge").hidden=true;document.querySelector(".top").hidden=false;document.querySelector(".bottom").hidden=false;
  save();refresh();applyWoodLand();if(msg)toast(msg);if(lvQueue!=null)setTimeout(showLevelUp,700)}
{const q=$("wQuit").onclick;$("wQuit").onclick=()=>PD?endChore("다음에 마저 해요"):q()}
function nextChore(){
  PD.si++;wSvg.innerHTML="";PD.st={};PD.hint=true;PD.busy=false;const s=PD.steps[PD.si];
  if(!s){PD.busy=true;setTimeout(()=>{if(PD)PD.finish()},500);return}
  const d=CH[s],st=PD.st;[...$("wSteps").children].forEach((li,k)=>li.className=k<PD.si?"done":k===PD.si?"on":"");
  $("wGauge").hidden=d.g!=="hold";
  if(d.g==="rub"){st.need=d.n;st.n=0;st.run=0;st.dir=0}
  if(d.g==="tap"){st.t=PD.targets(s).map(p=>({p,el:svgEl("circle","wtarget"),done:false}))}
  if(d.g==="hold"){st.g=0;st.z=PD.zone||[0.5,0.85];$("wZone").style.left=st.z[0]*100+"%";$("wZone").style.width=(st.z[1]-st.z[0])*100+"%";$("wFill").style.width="0%"}
  if(d.g==="down"){st.need=PD.chops;st.n=0}
  wFinger.className="finger "+({rub:"f-till",tap:"f-seed",hold:"f-water",down:"f-chop"}[d.g]);
  if(PD.stepSetup)PD.stepSetup(s);choreGuide();
}
function choreGuide(){const s=PD.steps[PD.si],st=PD.st;$("wGuide").textContent=CH[s].guide(st.need-st.n)}
function choreDone(score,msg){PD.scores.push(score);PD.busy=true;const s=PD.steps[PD.si];sweat(s==="chop"?3:2);
  const c=sp(PD.focus);wPop(c.x,c.y-50,msg||"좋아요");$("wCare").textContent="정성 "+careDots(avg(PD.scores));setTimeout(()=>{if(PD)nextChore()},600)}

wEl.addEventListener("pointerdown",e=>{if(!PD||PD.busy||e.target.closest("button"))return;e.preventDefault();try{wEl.setPointerCapture(e.pointerId)}catch(_){}
  const p=wpt(e);PD.down=true;PD.path=[p];PD.last=p;const s=PD.steps[PD.si],d=CH[s],st=PD.st;
  if(d.g==="rub"){st.dir=0;st.run=0}
  if(d.g==="hold")st.hold=true;
  if(d.g==="tap"){let best=null,bd=1e9;st.t.forEach(t=>{if(t.done)return;const q=sp(t.p),dd=Math.hypot(p.x-q.x,p.y-q.y);if(dd<bd){bd=dd;best=t}});
    const R=best?spR(best.p):0;if(!best||bd>R*1.6){wPop(p.x,p.y-30,"동그라미를 눌러요");return}
    best.done=true;best.el.remove();PD.hint=false;buzz(12);workT=0.5;PD.onTap(s,best,st.t.filter(t=>t.done).length);
    if(st.t.every(t=>t.done))choreDone(Math.max(0.6,1-bd/(R*1.6)*0.4))}});
wEl.addEventListener("pointermove",e=>{if(!PD||!PD.down||PD.busy)return;const p=wpt(e),l=PD.last;PD.path.push(p);PD.last=p;const s=PD.steps[PD.si],d=CH[s],st=PD.st;
  if(d.g==="rub"){const dv=p.x-l.x,sg=Math.sign(dv);if(!sg)return;if(sg!==st.dir){st.dir=sg;st.run=0;st.counted=false}
    st.run+=Math.abs(dv);if(!st.counted&&st.run>=45){st.counted=true;st.n++;PD.hint=false;buzz(10);sfx(d.sfx);wPop(p.x,p.y-30,d.pop);PD.onRub(s,st.n,st.need);choreGuide();if(st.n>=st.need)choreDone(1)}}});
const chUp=e=>{if(!PD||!PD.down)return;PD.down=false;if(PD.busy)return;const p=wpt(e),s=PD.steps[PD.si],d=CH[s],st=PD.st;
  if(d.g==="hold"){st.hold=false;if(st.g<0.2)return;const ok=st.g>=st.z[0]&&st.g<=st.z[1];sfx("water");PD.onHold(st.g);const ms=d.msgs||["물이 알맞아요!","조금 얕지만 괜찮아요","물이 조금 많아요"];choreDone(ok?1:(d.miss??0.6),ok?ms[0]:st.g<st.z[0]?ms[1]:ms[2])}
  if(d.g==="down"){const a=PD.path[0],dy=p.y-a.y;if(dy<60){wPop(p.x,p.y-30,"위에서 아래로 내리찍어요");return}
    const c=sp(PD.chopAt()),mid=PD.path.reduce((q,v)=>Math.abs(v.y-c.y)<Math.abs(q.y-c.y)?v:q,a),off=Math.abs(mid.x-c.x),R=spR(PD.chopAt(),0.25);
    if(off>R){sfx("scrape");wPop(p.x,p.y-30,"빗맞았어요! 가운데를 노려요");buzz(8);return}
    st.n++;PD.hint=false;buzz(25);PD.scores.push(Math.max(0.5,1-off/R*0.5));PD.onChop(st.n);choreGuide();workT=0.5;
    if(st.n>=st.need){PD.busy=true;sweat(3);setTimeout(()=>{if(PD)nextChore()},700)}}};
wEl.addEventListener("pointerup",chUp);wEl.addEventListener("pointercancel",chUp);

function choreFrame(dt,now){
  if(!PD)return;const s=PD.steps[PD.si];if(PD.frame)PD.frame(dt,now);if(!s)return;const d=CH[s],st=PD.st;let f=null;
  if(d.g==="tap")st.t.forEach(t=>{if(t.done)return;const q=sp(t.p),R=spR(t.p);t.el.setAttribute("cx",q.x);t.el.setAttribute("cy",q.y);t.el.setAttribute("r",R);if(!f)f=q});
  if(d.g==="rub"||d.g==="hold")f=sp(PD.focus);
  if(d.g==="down"){const c=sp(PD.chopAt());f={x:c.x,y:c.y-60}}
  if(d.g==="hold"&&st.hold&&!PD.busy){st.g+=dt/(PD.holdSec||2.2);$("wFill").style.width=Math.min(100,st.g*100)+"%";if(PD.onHolding)PD.onHolding(st.g);
    if(st.g>=1){st.hold=false;PD.down=false;PD.onHold(1);choreDone(d.miss??0.4,d.over||"물이 넘쳤어요!")}}
  const show=PD.hint&&!PD.busy&&f;wFinger.style.display=show?"block":"none";if(show){wFinger.style.left=f.x+"px";wFinger.style.top=f.y+"px"}
}

/* ---------- 장작: 땔감 숲 톱질 ---------- */
function useWoodTree(i){
  const t=woodTrees[i],P=t.position;
  startChore({steps:["saw"],focus:new THREE.Vector3(P.x,0.5,P.z),cam:new THREE.Vector3(P.x+0.6,2.4,P.z+3.2),look:new THREE.Vector3(P.x,0.4,P.z),
    onRub(s,k,n){t.rotation.z=Math.sin(k*2)*0.04;const c=sp(this.focus);for(let j=0;j<4;j++){const b=sph(0.03,0xe8d4a0,P.x+(Math.random()-.5)*0.6,0.5,P.z+0.3);b.userData.v=1+Math.random();this.g.add(b)}},
    frame(dt){this.g.children.forEach(b=>{if(b.userData.v!==undefined){b.position.y-=dt*b.userData.v;if(b.position.y<0.02)b.userData.v=0}})},
    finish(){woodToday().push(i);S.woodAt=S.woodAt||{};S.woodAt[i]=Date.now()+FUEL.regrow*1000;S.inv.tongnamu=(S.inv.tongnamu||0)+FUEL.logsPerTree;
      endChore(`통나무 ${FUEL.logsPerTree}개를 얻었어요. 모탕에서 도끼로 패요 · 이 자리엔 ${Math.round(FUEL.regrow/60)}분 뒤 또 쓰러진 나무가 생겨요`)}})}

/* ---------- 장작: 모탕에서 도끼질 ---------- */
function useMotang(){
  const have=S.inv.tongnamu||0,room=FUEL.pileMax-(S.inv.jangjak||0);
  if(!have){toast("팰 통나무가 없어요. 집 뒤 땔감 숲에서 쓰러진 나무를 톱질해 와요");return}
  if(room<FUEL.piecesPerLog){toast("장작가리가 꽉 찼어요 ("+FUEL.pileMax+"개). 부뚜막이나 아궁이에 쓰고 나서 패요");return}
  const logs=Math.min(have,3,Math.floor(room/FUEL.piecesPerLog)),M0=motang.position;
  let cur=null,half=[];
  const newLog=()=>{cur=cyl(0.16,0.16,0.5,0xb08a5a,M0.x,0.78,M0.z,10);PDg().add(cur);half=[]};
  const PDg=()=>PD.g;
  motang.userData.axe.visible=false;
  startChore({steps:["chop"],chops:logs*2,focus:new THREE.Vector3(M0.x,0.8,M0.z),cam:new THREE.Vector3(M0.x+0.2,1.9,M0.z+2.0),look:new THREE.Vector3(M0.x,0.6,M0.z),
    chopAt:()=>new THREE.Vector3(M0.x,0.85,M0.z),
    stepSetup(){newLog()},
    onChop(n){sfx("chop");sfx("scrape");const c=sp(this.focus);wPop(c.x,c.y-60,"쩍!");
      if(n%2===1){this.g.remove(cur);half=[-1,1].map(d=>{const h=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,0.5,10,1,false,d<0?0:Math.PI,Math.PI),M(0xb08a5a));h.position.set(M0.x+d*0.05,0.78,M0.z);h.userData.d=d;h.userData.t=0;this.g.add(h);return h})}
      else{half.forEach(h=>{h.userData.fly=1});setTimeout(()=>{if(PD&&n<this.chops)newLog()},350)}},
    frame(dt){this.g.children.forEach(h=>{if(h.userData.d===undefined)return;if(h.userData.fly){h.position.x+=h.userData.d*dt*2.5;h.position.y=Math.max(0.05,h.position.y-dt*2);h.rotation.z+=h.userData.d*dt*6}
      else if(h.userData.t<1){h.userData.t+=dt*4;h.position.x=M0.x+h.userData.d*(0.05+0.12*Math.min(1,h.userData.t));h.rotation.z=h.userData.d*0.35*Math.min(1,h.userData.t)}})},
    cleanup(){motang.userData.axe.visible=true},
    finish(){const n=logs*FUEL.piecesPerLog;S.inv.tongnamu-=logs;S.inv.jangjak=(S.inv.jangjak||0)+n;
      endChore(`장작 ${n}개를 패서 장작가리에 쌓았어요 · 지금 장작 ${S.inv.jangjak}개`+(winterNow()?" · 겨울엔 아궁이에 "+FUEL.ondolWinter+"개씩 들어요":""))}})}

/* ---------- 논농사 ---------- */
const PADDY_CAM=()=>({cam:new THREE.Vector3(PADDY.x,4.2,PADDY.z+4.6),look:new THREE.Vector3(PADDY.x,0.2,PADDY.z+0.7),focus:new THREE.Vector3(PADDY.x,0.3,PADDY.z+0.8)});
function usePaddy(){
  if(mode!=="home"){toast("이웃 논이에요. 벼가 잘 익었네요");return}
  const st=paddyStage();
  if(st==="empty"||st==="stubble"){if(!(S.inv.mo>0)){toast("모가 없어요. 장터 씨앗가게 할아버지한테 모 한 판 사 와요");return}
    const spots=[[-1.8,1.0],[-0.6,1.0],[0.6,1.0],[1.8,1.0],[-1.2,1.6],[0,1.6],[1.2,1.6]].map(([x,z])=>new THREE.Vector3(PADDY.x+x,0.3,PADDY.z+z));
    let water=null;
    startChore(Object.assign(PADDY_CAM(),{steps:["sseore","mul","monae"],
      setup(){S.paddyStubble=false;drawPaddy(true);paddy.userData.water.visible=false},
      onRub(s,k,n){paddySoil.color.setHex(0x9c7a52).lerp(new THREE.Color(0x5e4430),k/n)},
      stepSetup(s){if(s==="mul"){water=paddy.userData.water;water.visible=true;water.scale.y=0.1;paddyWaterMat.opacity=0}},
      onHolding(g){paddyWaterMat.opacity=Math.min(0.8,g*0.9)},onHold(g){paddyWaterMat.opacity=Math.min(0.8,g*0.9)},
      targets:()=>spots,
      onTap(s,t){if(s==="monae"){const c=riceClump("mo");c.position.copy(t.p).setY(0.22);this.g.add(c);sfx("seed")}},
      finish(){S.inv.mo--;S.paddy={pt:Date.now(),care:avg(this.scores)};paddyWaterMat.opacity=0.75;drawPaddy(true);
        endChore("모내기를 마쳤어요! 물 댄 논에서 벼가 자라요 (초안 3분 · 실제로는 여름 내내)")}}));return}
  if(st!=="ripe"){const left=Math.ceil(RICE.grow-(Date.now()-S.paddy.pt)/1000);toast((st==="mo"?"모가 뿌리를 내리는 중":"벼가 푸르게 자라는 중")+"이에요 · "+left+"초 남음");return}
  let sheaf=null;
  startChore(Object.assign(PADDY_CAM(),{steps:["beda","teol"],
    onRub(s,k,n){riceG.children.filter(c=>c.userData.spark).forEach(c=>c.visible=false);const all=riceG.children.filter(c=>!c.userData.spark); // 앞줄부터 쓰러져요
      all.slice(0,Math.ceil(all.length*k/n)).forEach(c=>{if(!c.userData.cut){c.userData.cut=true;c.rotation.z=1.4;c.position.y=0.25}})},
    stepSetup(s){if(s==="teol"){riceG.children.forEach(c=>c.visible=false);sheaf=new THREE.Group();for(let i=0;i<9;i++){const c=cone(0.05,0.9,0xd8b44a,(i%3-1)*0.06,0.45,(Math.floor(i/3)-1)*0.06,4);sheaf.add(c)}
      sheaf.add(cyl(0.12,0.12,0.06,0xc9a64a,0,0.35,0,8));sheaf.position.set(PADDY.x,0.25,PADDY.z+1.6);sheaf.rotation.z=0.3;this.g.add(sheaf)}},
    targets:s=>[0,1,2].map(i=>new THREE.Vector3(PADDY.x-0.25+i*0.25,0.75,PADDY.z+1.6)),
    onTap(s,t){sfx("pluck");for(let i=0;i<8;i++){const g=sph(0.025,0xf2d27a,t.p.x+(Math.random()-.5)*0.2,t.p.y,t.p.z);g.userData.v=1.5+Math.random();this.g.add(g)}const c=sp(t.p);wPop(c.x,c.y-30,"우수수")},
    frame(dt){this.g.children.forEach(b=>{if(b.userData.v){b.position.y-=dt*b.userData.v;if(b.position.y<0.25)b.userData.v=0}})},
    finish(){const care=S.paddy.care==null?0.5:S.paddy.care,good=Math.random()<qualityChance((care+avg(this.scores))/2),n=RICE.yield+(good?2:0);
      S.inv.ssal=(S.inv.ssal||0)+n;S.inv.jip=(S.inv.jip||0)+6;S.paddy=null;S.paddyStubble=true;drawPaddy(true);
      endChore(`쌀 ${n}되를 거뒀어요!`+(good?" 알이 굵어요":"")+" · 볏짚 6단도 나왔어요(툇마루에서 짚공예) · 부뚜막에서 가마솥 밥을 지어요")}}));
}

/* ---------- 땔감 쓰기와 겨울 구들 ---------- */
function useWood(n,what){if((S.inv.jangjak||0)<n){toast("장작이 모자라요 ("+what+"에 "+n+"개). 모탕에서 패 오거나 목공소에서 한 짐 사 와요");return false}
  S.inv.jangjak-=n;drawWoodpile();return true}
// 겨울엔 밤새 구들을 안 때면 아침에 추워요 (하루 한 번, 든든함 조금)
function checkCold(){if(!winterNow())return;const d=dayKey(new Date()),h=hourNow();if(S.coldDay===d||h<5)return;S.coldDay=d;
  if(S.ondolAt&&Date.now()-S.ondolAt<20*3600e3)return;S.full=Math.max(0,fullNow()-10);save();
  setTimeout(()=>toast("밤새 방이 추웠어요… (든든함 -10) 겨울엔 저녁에 아궁이에 장작 "+FUEL.ondolWinter+"개를 때 두세요"),2600)}
