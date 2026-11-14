/* 냇가 낚시: 반복해서 즐기는 일 (철이 바뀌길 기다리는 동안). 냇가 오른쪽 아래 "낚시하기"를 누르면 그 자리 물가에서, 낚시터 좌대를 누르면 좌대에서 시작해요
   1. 던지기: 꾹 누르면 게이지가 오르내려요. 손을 떼면 찌가 날아가요 (초록 칸이면 깊은 데라 귀한 고기가 잘 물어요)
   2. 입질 기다리기: 찌가 까딱까딱(헛입질)할 땐 참고, 쑥 들어갈 때 콕! 너무 일찍 채면 도망가요
   3. 끌어올리기: 꾹 누르면 감아요. 줄 팽팽함(게이지)을 초록 칸에 두면 끌려와요. 끝까지 당기면 툭 끊어지고, 너무 풀면 놓쳐요
   잡은 고기: 망태에 넣기(창고, 생선 트럭 아저씨가 사 줘요) 또는 풀어 주기(숙련도 조금 더). 물고기 도감에 최고 크기 기록.
   숙련도(FISH_LV)가 오르면 초록 칸이 넓어지고 귀한 고기가 더 잘 물어요. 물고기 종류·크기·값은 data.js 의 FRESH */

let FS=null;
const FISH_SPOT={x:-1.4,z:-0.75};
const fishXp=()=>S.skill.fish||0;
const fishLv=()=>{let l=0;FISH_LV.forEach((L,i)=>{if(fishXp()>=L.xp)l=i});return l};
const RARE_XP={songsari:1,pirami:1,bungeo:2,kkeokji:4,megi:5,ssogari:8,baemjang:10,hwanggeum:30};

// 냇가 물가 어디서든 낚시해요 (x: 서는 자리). 다른 사람과 자리가 겹치지 않게 넓게
const fishBankX=x=>{x=Math.max(-15,Math.min(15,x));if(x>4.4&&x<8.4)x=x<6.4?4.4:8.4;return x}; // 너럭바위는 피해요
function startFishing(sx){
  const st=stormActive();if(st&&st.kind!=="frost"){toast("궂은 날씨엔 냇가가 위험해요");return}
  stashHold();
  FS={g:new THREE.Group(),stage:null,power:0,dir:1,t:0};scene.add(FS.g);
  const x=fishBankX(sx==null?me.g.position.x:sx),z=FISH_SPOT.z;FS.spot={x,z};me.g.position.set(x,0,z);me.tx=x;me.tz=z;me.g.rotation.y=Math.PI;me.moving=false;
  // 낚싯대, 줄, 찌
  const rod=cyl(0.01,0.02,2.3,0x6b4a2e,0,0,0,6);rod.position.set(x+0.25,1.55,z-0.75);rod.rotation.x=-0.95;FS.g.add(rod);
  FS.tip=new THREE.Vector3(x+0.25,1.55+Math.cos(0.95)*1.15,z-0.75-Math.sin(0.95)*1.15);
  FS.bob=new THREE.Group();FS.bob.add(sph(0.05,0xf4f4f0,0,0,0));FS.bob.add(sph(0.04,0xd8312a,0,0.05,0));FS.bob.add(cyl(0.006,0.006,0.12,0xd8312a,0,0.12,0,4));FS.bob.visible=false;FS.g.add(FS.bob);
  FS.ring=new THREE.Mesh(new THREE.RingGeometry(0.06,0.09,20),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0}));FS.ring.rotation.x=-Math.PI/2;FS.g.add(FS.ring);
  FS.line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([FS.tip,FS.tip]),new THREE.LineBasicMaterial({color:0xf0f0f0}));FS.g.add(FS.line);
  FS.cam=new THREE.Vector3(x+1.8,2.4,z+1.7);FS.look=new THREE.Vector3(x-0.3,0.1,z-2.7);
  // 낚시하는 동안 둘레 이름표(나, 낚시터 …)는 숨겨요
  FS.hid=[];const sp0=new THREE.Vector3(x,1,z);scene.traverse(o=>{if(o.isSprite&&o.visible&&o.parent!==skyG){const p=new THREE.Vector3();o.getWorldPosition(p);if(p.distanceTo(sp0)<4.5){o.visible=false;FS.hid.push(o)}}});
  document.querySelector(".top").hidden=true;document.querySelector(".bottom").hidden=true;wEl.hidden=false;wSvg.innerHTML="";
  $("wSteps").innerHTML=["던지기","입질 기다리기","끌어올리기"].map(s=>`<li>${s}</li>`).join("");
  setFishStage("cast");
}
function endFishing(msg){if(!FS)return;scene.remove(FS.g);FS.hid.forEach(o=>o.visible=true);FS=null;wEl.hidden=true;$("wGauge").hidden=true;wFinger.style.display="none";
  document.querySelector(".top").hidden=false;document.querySelector(".bottom").hidden=false;save();refresh();if(msg)toast(msg);if(lvQueue!=null)setTimeout(showLevelUp,700)}
{const q=$("wQuit").onclick;$("wQuit").onclick=()=>FS?endFishing("오늘 낚시는 여기까지. 손맛 좋았어요"):q()}

function setFishStage(s){
  FS.stage=s;FS.t=0;const idx={cast:0,wait:1,reel:2}[s];[...$("wSteps").children].forEach((li,k)=>li.className=k<idx?"done":k===idx?"on":"");
  const lv=fishLv();$("wCare").textContent=FISH_LV[lv].name;
  if(s==="cast"){FS.bob.visible=false;FS.power=0;FS.dir=1;FS.charging=false;$("wGauge").hidden=false;$("wZone").style.left="58%";$("wZone").style.width="22%";$("wFill").style.width="0%";
    $("wGuide").textContent="화면을 꾹 누르고 있다가 손을 떼면 찌를 던져요. 초록 칸에서 떼면 깊은 데로 날아가요";wFinger.className="finger f-water"}
  if(s==="wait"){$("wGauge").hidden=true;FS.biting=false;planBites();$("wGuide").textContent="찌가 까딱까딱할 땐 참고, 쑥 들어가면 그때 콕 눌러요!";wFinger.className="finger f-seed"}
  if(s==="reel"){const L=0.3+0.04*lv;FS.zone=[0.55-L/2,0.55+L/2];FS.T=0.45;FS.P=0;FS.slack=0;FS.pullT=0.8;
    $("wGauge").hidden=false;$("wZone").style.left=FS.zone[0]*100+"%";$("wZone").style.width=L*100+"%";
    $("wGuide").textContent="꾹 누르면 감아요. 게이지를 초록 칸에 맞춰요! 끝까지 가면 줄이 끊어져요";wFinger.className="finger f-water"}
  FS.hint=true;
}
// 입질: 헛입질 몇 번 뒤에 진짜 입질
function planBites(){const n=Math.floor(Math.random()*3);FS.ev=[];let t=1.2+Math.random()*1.5;
  for(let i=0;i<n;i++){FS.ev.push({t,type:"nib"});t+=0.9+Math.random()*1.4}
  FS.ev.push({t,type:"bite"});FS.window=0.85+fishLv()*0.08}
// 어떤 고기가 물었나 (철, 밤낮, 깊은 데, 숙련도)
function pickFresh(){
  const lv=fishLv(),night=skyNow.night>0.5,se=seasonOf(new Date());
  const L=Object.entries(FRESH).filter(([k,f])=>(!f.season||f.season.includes(se))&&(f.when!=="night"||night)&&unlocked("fish",k,fishLv()));
  const wts=L.map(([k,f])=>f.w*(f.w<12?(1+0.3*lv)*(FS.deep?1.5:1):1)*(k==="hwanggeum"?1+0.5*lv:1));
  let r=Math.random()*wts.reduce((a,b)=>a+b,0),i=0;while(r>wts[i]){r-=wts[i];i++}
  const [k,f]=L[Math.min(i,L.length-1)],cm=Math.round(f.cm[0]+(f.cm[1]-f.cm[0])*Math.pow(Math.random(),Math.max(0.7,1.6-lv*0.12)));
  return {k,f,cm}}

/* ---------- 손 ---------- */
wEl.addEventListener("pointerdown",e=>{if(!FS||e.target.closest("button"))return;e.preventDefault();try{wEl.setPointerCapture(e.pointerId)}catch(_){}FS.down=true;FS.hint=false;
  if(FS.stage==="cast"&&!FS.flying)FS.charging=true;
  if(FS.stage==="wait"){if(FS.biting)hookFish();else if(FS.bob.visible&&!FS.flying){sfx("pop");wPopAt("너무 일찍 챘어요! 고기가 놀라 도망갔어요");FS.biting=false;FS.ev=[];setTimeout(()=>{if(FS&&FS.stage==="wait")planBites()},1200);FS.t=0}}});
const fsUp=()=>{if(!FS)return;FS.down=false;if(FS.stage==="cast"&&FS.charging){FS.charging=false;castBob()}};
wEl.addEventListener("pointerup",fsUp);wEl.addEventListener("pointercancel",fsUp);
function wPopAt(t){const c=sp(FS.bob.visible?FS.bob.position:FS.look);wPop(c.x,c.y-50,t)}

function castBob(){const p=FS.power,x=FS.spot.x-0.2,z=FS.spot.z-1.15-3.1*p;FS.deep=p>=0.58&&p<=0.8;FS.flying=true;sfx("pluck");
  FS.from=FS.tip.clone();FS.to=new THREE.Vector3(x,0.05,z);FS.ft=0;FS.bob.visible=true;FS.home=FS.to.clone();$("wGauge").hidden=true}
function hookFish(){FS.biting=false;FS.fish=pickFresh();buzz(30);sfx("scrape");wPopAt("걸렸다!");sweat(1);
  // 물속에서 버둥대는 고기 그림자
  const m=fishGroup(FS.fish.k,false);m.scale.setScalar(Math.max(0.6,FS.fish.cm/100/FISH[FS.fish.k].L*0.9));m.rotation.x=-Math.PI/2;m.traverse(o=>{if(o.isMesh){o.material=o.material.map?o.material:o.material}});
  FS.fishM=m;m.position.copy(FS.bob.position).setY(-0.05);FS.g.add(m);setFishStage("reel")}
function caught(){
  const {k,f,cm}=FS.fish,d=S.fishDex[k]||{n:0,best:0},rec=cm>d.best,big=cm>=f.cm[0]+(f.cm[1]-f.cm[0])*0.8,wol=k==="bungeo"&&cm>=30;
  d.n++;if(rec)d.best=cm;S.fishDex[k]=d;S.inv[k]=(S.inv[k]||0)+1;S.bag.push({k,cm});const pr=fishPrice(k,cm);
  const lv0=fishLv(),xp=RARE_XP[k]+(big?2:0);S.skill.fish=fishXp()+xp;const lv1=fishLv();
  sfx("level");buzz([30,40,30]);save();refresh();
  // 낚싯대 끝에 대롱대롱
  const m=FS.fishM;m.rotation.set(0,0,Math.PI/2);m.position.copy(FS.tip).add(new THREE.Vector3(0,-0.4,0));FS.dangle=m;FS.bob.visible=false;
  const tag=k==="hwanggeum"?"전설의 황금 잉어!!":wol?"월척!":big?"대물!":"";
  openSheet(`<h2>${f.name} ${cm}cm${tag?" · "+tag:""}</h2><p class="hint">${f.desc}</p>
    <div class="item"><div>${rec?"새 최고 기록이에요!":"내 최고 기록 "+d.best+"cm"}<small>지금까지 ${f.name} ${d.n}마리 · 이 크기면 생선 트럭 아저씨가 <b>${pr.p.toLocaleString()}원</b>${pr.tag?" ("+pr.tag+" 값)":""}에 사 줘요</small></div></div>
    <div class="item"><div>낚시 숙련도 +${xp}<small>${FISH_LV[lv1].name} · ${fishXp()}${FISH_LV[lv1+1]?" / "+FISH_LV[lv1+1].xp:""}</small></div></div>
    <div class="sitbtns"><button class="close" id="fRelease">풀어 주기 (숙련도 +1)</button><button class="close go" id="fKeep">망태에 넣기</button></div>`);
  sheet.querySelector("#closeBtn").remove();
  const next=()=>{closeSheet();if(FS){FS.next=null;FS.g.remove(FS.dangle);FS.dangle=null;FS.fishM=null;setFishStage("cast")}};
  $("fKeep").onclick=next;FS.next=next;
  $("fRelease").onclick=()=>{S.inv[k]--;S.bag.pop();S.skill.fish=fishXp()+1;sfx("water");save();refresh();next();toast(f.name+"를 냇물에 놓아줬어요. 잘 가~")};
  if(lv1>lv0)setTimeout(()=>toast("낚시 숙련도가 올랐어요! 이제 '"+FISH_LV[lv1].name+"'"+newlyOpen("fish",lv1,k=>FRESH[k].name)),600);
}
function lostFish(msg){if(FS.fishM){FS.g.remove(FS.fishM);FS.fishM=null}sfx("pop");wPopAt(msg);buzz(10);setTimeout(()=>{if(FS)setFishStage("cast")},900)}

/* ---------- 매 순간 ---------- */
function fishFrame(dt,now){
  if(!FS)return;FS.t+=dt;const b=FS.bob,W=0.05;
  // 줄
  const end=b.visible?b.position:FS.dangle?FS.dangle.position:FS.tip;FS.line.geometry.setFromPoints([FS.tip,end]);
  if(FS.ring.material.opacity>0){FS.ring.material.opacity-=dt*0.8;FS.ring.scale.multiplyScalar(1+dt*1.5)}
  if(FS.flying){FS.ft+=dt*1.6;const e=Math.min(1,FS.ft);b.position.lerpVectors(FS.from,FS.to,e);b.position.y+=Math.sin(e*Math.PI)*1.2;
    if(e>=1){FS.flying=false;sfx("water");ripple();setFishStage("wait")}}
  if(FS.stage==="cast"&&FS.charging){FS.power+=FS.dir*dt*0.85;if(FS.power>=1){FS.power=1;FS.dir=-1}if(FS.power<=0){FS.power=0;FS.dir=1}$("wFill").style.width=FS.power*100+"%"}
  if(FS.stage==="wait"&&b.visible&&!FS.flying){
    let dip=Math.sin(now/400)*0.006;
    FS.ev.forEach(e=>{const d=FS.t-e.t;if(d<0)return;
      if(e.type==="nib"&&d<0.3){dip-=Math.sin(d/0.3*Math.PI)*0.025;if(!e.done){e.done=1;ripple(0.4)}}
      if(e.type==="bite"){if(d<FS.window){dip-=0.12;if(!e.done){e.done=1;FS.biting=true;ripple(1);sfx("water");buzz(15)}}
        else if(FS.biting){FS.biting=false;wPopAt("놓쳤어요. 다시 기다려요");FS.ev=[];FS.t=0;planBites()}}});
    // 입질이 끊겨 찌만 떠 있으면(폰에서 멈춘 것처럼 보였어요) 다시 입질이 오게 해요 (2026-11-14)
    const lastT=FS.ev.length?FS.ev[FS.ev.length-1].t+FS.window+1.5:0;if(!FS.biting&&FS.t>Math.max(lastT,6)){FS.ev=[];FS.t=0;planBites()}
    b.position.y=W+dip}
  if(FS.stage==="reel"&&FS.fish){
    const f=FS.fish.f,[z0,z1]=FS.zone;
    FS.T+=(FS.down?0.85:-0.65)*dt;FS.pullT-=dt;if(FS.pullT<=0){FS.pullT=0.5+Math.random()*(1.1-f.pull*0.5);FS.T+=f.pull*(0.12+Math.random()*0.16);buzz(8)} // 고기가 확 당겨요
    FS.T=Math.max(0,FS.T);$("wFill").style.width=Math.min(100,FS.T*100)+"%";
    if(FS.T>=1){FS.stage="lost";lostFish("툭! 줄이 끊어졌어요");return}
    if(FS.T>=z0&&FS.T<=z1)FS.P+=dt*(0.26-f.pull*0.12+fishLv()*0.012);else if(FS.T<z0)FS.P=Math.max(0,FS.P-dt*0.04);
    FS.slack=FS.T<0.08?FS.slack+dt:0;if(FS.slack>2.2){FS.stage="lost";lostFish("줄이 느슨해서 놓쳤어요");return}
    // 찌와 고기가 물가 쪽으로 끌려와요
    b.position.lerpVectors(FS.home,new THREE.Vector3(FS.spot.x-0.1,W,FS.spot.z-0.9),Math.min(1,FS.P));b.position.y=W-0.06+Math.sin(now/90)*0.02;
    if(FS.fishM){FS.fishM.position.set(b.position.x+Math.sin(now/150)*0.12,-0.03,b.position.z-0.15);FS.fishM.rotation.z=Math.sin(now/110)*0.5}
    $("wCare").textContent=FISH_LV[fishLv()].name+" · "+"●".repeat(Math.round(FS.P*5))+"○".repeat(5-Math.round(FS.P*5));
    if(FS.P>=1){FS.stage="done";caught()}}
  // 잡은 고기 창을 바깥(어두운 곳)을 눌러 닫으면 멈춰 있었어요 → 망태에 넣은 걸로 하고 다시 던지기로 (2026-11-14)
  if(FS.stage==="done"&&FS.next&&$("modal").hidden){FS.next();toast("망태에 넣었어요. 다시 던져 볼까요?")}
  const c=sp(FS.stage==="wait"&&b.visible?b.position:FS.look);const show=FS.hint&&FS.stage!=="done";wFinger.style.display=show?"block":"none";if(show){wFinger.style.left=c.x+"px";wFinger.style.top=c.y+"px"}
}
function ripple(s=0.7){FS.ring.position.set(FS.bob.position.x,0.06,FS.bob.position.z);FS.ring.scale.setScalar(1);FS.ring.material.opacity=s}

/* ---------- 물고기 도감 (도감 창에 붙여요) ---------- */
function fishDexHtml(){const lv=fishLv();
  let h=`<h3>물고기 도감 · 낚시 숙련도 ${FISH_LV[lv].name} (${fishXp()}${FISH_LV[lv+1]?"/"+FISH_LV[lv+1].xp:""})</h3>`;
  Object.entries(FRESH).forEach(([k,f])=>{const d=S.fishDex[k];
    const lk=(UNLOCK.fish[k]||0)>lv;
    h+=`<div class="item${lk?" locked":""}"><div>${d?f.name:lk?"🔒 ???":"???"}<small>${lk?"낚시 숙련도 '"+FISH_LV[UNLOCK.fish[k]].name+"'가 되면 물기 시작해요":d?`${d.n}마리 · 최고 ${d.best}cm · ${f.desc}`:(f.when==="night"?"밤에만 물어요":f.season?f.season.map(s=>SEASON_NAME[s]).join("·")+"에 나와요":"냇가 어딘가에")}</small></div>${d?'<span class="done">잡았어요</span>':""}</div>`});
  return h}
