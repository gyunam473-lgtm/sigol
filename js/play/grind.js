/* 끝없이 할 수 있는 일 (2026-11-10): 할 때마다 결과가 다르고, 할수록 늘고, 모으는 재미
   1) 곤충 채집: 냇가·분교·뒷산에 곤충이 날아다녀요. 누르면 다가가서 잠자리채 휘두르기(꾹 눌렀다 초록 칸에서 떼기)
      철·낮밤 따라 다른 곤충, 크기 기록, 곤충 도감, 채집 숙련도 5단계. 분교 선생님이 사 줘요
   2) 짚공예: 집 툇마루에 앉아 볏짚으로 새끼줄·짚신·소쿠리·멍석. 목수 할아버지가 사 줘요
   3) 마을 품삯 일: 회관 게시판에서 일거리를 받고, 그 장소의 반짝이는 자리에서 해요. 10분마다 새 일거리
   4) 30초 장작 패기 도전: 모탕에서 최고 기록 도전
   5) 냇가 다슬기 줍기: 물가 돌을 뒤집어 다슬기를 주워요. 국밥집 아주머니가 사 줘요
   (밭 김매기·벌레 잡기는 play/tend.js) */

// 손동작 더하기 (chore.js 의 CH)
Object.assign(CH,{
  net:{name:"잠자리채",g:"hold",guide:()=>"꾹 눌러 잠자리채를 들고, 초록 칸에서 떼면 휙!",msgs:["잡았다!","너무 일찍 휘둘렀어요","한발 늦었어요"],miss:0,over:"날아가 버렸어요"},
  kkoda:{name:"새끼 꼬기",g:"rub",n:6,guide:n=>`두 손바닥으로 볏짚을 좌우로 비벼 꼬아요 · ${n}번 남음`,pop:"싹싹",sfx:"scrape"},
  eokki:{name:"엮기",g:"tap",guide:()=>"동그라미 자리를 콕콕 눌러 짚을 엮어요"},
  dadeum:{name:"다듬기",g:"rub",n:4,guide:n=>`삐져나온 짚을 슥슥 다듬어요 · ${n}번 남음`,pop:"슥",sfx:"scrape"},
  gama:{name:"번쩍 들기",g:"hold",guide:()=>"꾹 눌러 힘을 모았다가 초록 칸에서 떼면 번쩍!",msgs:["번쩍!","힘이 조금 모자랐어요","너무 힘줬어요, 허리 조심"],over:"털썩, 놓쳤어요"},
  pull:{name:"풀 뽑기",g:"tap",guide:()=>"풀을 콕콕 눌러 뿌리째 뽑아요"},
  water2:{name:"물 주기",g:"hold",guide:()=>"꾹 눌러 물뿌리개를 기울이고 초록 칸에서 떼요"},
  pick:{name:"줍기",g:"tap",guide:()=>"떨어진 걸 콕콕 눌러 주워요"},
  sweep:{name:"쓸기",g:"rub",n:5,guide:n=>`빗자루로 좌우로 쓱쓱 쓸어요 · ${n}번 남음`,pop:"쓱",sfx:"scrape"},
  dish:{name:"닦기",g:"rub",n:5,guide:n=>`행주로 좌우로 뽀득뽀득 닦아요 · ${n}번 남음`,pop:"뽀득",sfx:"scrape"},
  dol:{name:"돌 뒤집기",g:"tap",guide:()=>"물속 돌을 콕 눌러 뒤집어요"},
  seulgi:{name:"다슬기 줍기",g:"tap",guide:()=>"돌에 붙은 다슬기를 콕콕 주워요"}});
const noop=()=>{};
const tierOf=(L,xp)=>{let l=0;L.forEach((v,i)=>{if(xp>=v.xp)l=i});return l};
function skillUp(key,L,add,what){S.skill=S.skill||{};const a=tierOf(L,S.skill[key]||0);S.skill[key]=(S.skill[key]||0)+add;const b=tierOf(L,S.skill[key]);
  if(b>a)setTimeout(()=>{sfx("level");toast(what+" 숙련도가 올랐어요! 이제 \""+L[b].name+"\"")},1400)}
const near=(c,r)=>Array.from({length:r.n},(_,i)=>{const a=i/r.n*TAU+fr(-0.3,0.3),d=r.d*(0.6+Math.random()*0.5);return new THREE.Vector3(c.x+Math.cos(a)*d,c.y,c.z+Math.sin(a)*d*0.7)});
// 작업 카메라: 그 자리를 앞에서 내려다봐요
const camAt=(x,y,z,back=1.9,up=1.5)=>({focus:new THREE.Vector3(x,y,z),cam:new THREE.Vector3(x+0.3,y+up,z+back),look:new THREE.Vector3(x,y-0.1,z)});

/* ================= 1) 곤충 채집 ================= */
const BUG_SPOTS={stream:[[-10,1.6],[-5.5,2.6],[2,3.2],[8.5,2.4],[12.5,1.2],[-13.5,4]],school:[[-6,4],[4,-4],[7,3],[-4,-6],[1,5.5],[-7,0.5],[9,-6]],dwitsan:[[-5,3],[5,0.5],[-7,-5],[6,-8],[-3,-10],[3,-13],[-9,-2]]};
const BUG_STATE={};let BUGS=[];
const bugLv=()=>tierOf(BUG_LV,(S.skill||{}).bug||0);
const nightNow=()=>(skyNow.night||0)>0.5;
function rollBug(place){const se=seasonOf(new Date()),n=nightNow(),lv=bugLv();
  const L=Object.entries(INSECTS).filter(([k,b])=>b.season.includes(se)&&b.where.includes(place)&&(b.time==="any"||(b.time==="night")===n));if(!L.length)return null;
  const w=L.map(([k,b])=>b.w*(b.w<10?1+0.35*lv:1));let r=Math.random()*w.reduce((a,b)=>a+b,0),i=0;while(r>w[i]){r-=w[i];i++}return L[Math.min(i,L.length-1)][0]}
let _bsm=null; // 곤충 위 반짝이 (어디 있는지 잘 보이게)
function bugSparkMat(){if(_bsm)return _bsm;const c=document.createElement("canvas");c.width=c.height=64;const x=c.getContext("2d"),g=x.createRadialGradient(32,32,2,32,32,30);g.addColorStop(0,"rgba(255,250,200,1)");g.addColorStop(0.35,"rgba(255,236,140,.6)");g.addColorStop(1,"rgba(255,236,140,0)");x.fillStyle=g;x.fillRect(0,0,64,64);
  _bsm=new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false});return _bsm}
function bugMesh3(k){const b=INSECTS[k],g=new THREE.Group(),[c1,c2]=b.col,s=new THREE.Group();g.add(s);
  if(b.wing){const body=cyl(0.02,0.02,0.16,c2,0,0,0,6);body.rotation.x=Math.PI/2;s.add(body);
    [-1,1].forEach(d=>{const w=new THREE.Mesh(new THREE.PlaneGeometry(0.18,0.16),new THREE.MeshLambertMaterial({color:c1,side:THREE.DoubleSide}));w.geometry.translate(d*0.09,0,0);w.rotation.x=-Math.PI/2;w.userData.wing=d;s.add(w)})}
  else if(b.drag){const body=cyl(0.018,0.012,0.3,c1,0,0,0,6);body.rotation.x=Math.PI/2;s.add(body);s.add(sph(0.03,c1,0,0,0.15));
    [-0.05,0.04].forEach(z=>[-1,1].forEach(d=>{const w=new THREE.Mesh(new THREE.PlaneGeometry(0.22,0.05),new THREE.MeshLambertMaterial({color:c2,transparent:true,opacity:0.6,side:THREE.DoubleSide}));w.geometry.translate(d*0.11,0,0);w.rotation.x=-Math.PI/2;w.position.z=z;w.userData.wing=d*0.4;s.add(w)}))}
  else if(b.hop){const body=box(0.06,0.06,0.22,c1,0,0,0);s.add(body);[-1,1].forEach(d=>{const l=box(0.01,0.1,0.14,c2,d*0.04,0.02,-0.05);l.rotation.x=0.5;s.add(l)})}
  else if(b.beetle){const sh=sph(0.07,c1,0,0,0);sh.scale.set(1,0.6,1.3);s.add(sh);s.add(sph(0.035,c2,0,0,0.09));if(k==="saseum"||k==="pungdeng"){const h=cone(0.015,0.12,c2,0,0.04,0.16,4);h.rotation.x=1.2;s.add(h)}
    if(k==="mudang")for(let i=0;i<4;i++)s.add(sph(0.015,0x111111,(i%2-0.5)*0.06,0.04,(Math.floor(i/2)-0.5)*0.06))}
  else if(b.glow){const m=new THREE.Mesh(new THREE.SphereGeometry(0.05,8,6),new THREE.MeshBasicMaterial({color:c1}));m.userData.glow=1;s.add(m);s.add(sph(0.025,c2,0,0,-0.04))}
  s.scale.setScalar(b.glow?1.8:3); // 잘 보이게 실제보다 크게
  const sp=new THREE.Sprite(bugSparkMat());sp.scale.set(0.45,0.45,1);sp.position.y=0.35;sp.userData.spark=1;g.add(sp);
  const hit=new THREE.Mesh(new THREE.SphereGeometry(0.75,8,6),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));g.add(hit);
  g.userData={kind:"poke"};return g}
// 지금 장소의 곤충 놓기 (장소에 들어갈 때, 그리고 1초마다 잡힌 자리 다시 채우기)
function applyBugs(){BUGS.forEach(b=>b.g.parent&&b.g.parent.remove(b.g));BUGS=[];const sp=BUG_SPOTS[mode];if(!sp)return;
  const st=BUG_STATE[mode]=BUG_STATE[mode]||sp.map(()=>({k:null,until:0,night:null})),now=Date.now(),n=nightNow();
  sp.forEach(([x,z],i)=>{const s=st[i];if(now<s.until)return;if(!s.k||s.night!==n){s.k=rollBug(mode);s.night=n}if(!s.k){s.until=now+20000;return}
    const g=bugMesh3(s.k),h=mode==="dwitsan"?sanH(x,z):0;g.position.set(x,h+(INSECTS[s.k].hop||INSECTS[s.k].beetle?0.15:1.2),z);PLACES[mode].g.add(g);
    const b={k:s.k,i,g,home:[x,z],ph:Math.random()*10,state:s};g.userData.poke=()=>catchBug(b);g.userData.at=[x+0.9,z+0.9];BUGS.push(b)})}
function bugsFrame(dt,now){const t=now/1000;BUGS.forEach(b=>{if(b.hold)return;const B=INSECTS[b.k],g=b.g,[hx,hz]=b.home,ph=b.ph,h=mode==="dwitsan"?sanH(g.position.x,g.position.z):0;
  if(B.wing||B.drag||B.glow){const r=B.drag?1.6:1.1;g.position.set(hx+Math.sin(t*0.5+ph)*r,h+1.1+Math.sin(t*1.3+ph)*0.35,hz+Math.sin(t*0.37+ph*2)*r*0.8);g.rotation.y=t*0.5+ph+Math.PI/2}
  else if(B.hop){const u=(t*0.6+ph)%1;g.position.set(hx+Math.sin(Math.floor(t*0.6+ph))*0.8,h+0.12+Math.max(0,Math.sin(u*Math.PI))*0.4*(u<0.3?1:0),hz+Math.cos(Math.floor(t*0.6+ph)*1.7)*0.8)}
  g.children[0].children.forEach(w=>{if(w.userData.wing)w.rotation.y=Math.sin(t*(B.drag?40:14)+ph)*0.7*Math.sign(w.userData.wing);if(w.userData.glow)w.material.color.setHSL(0.16,0.9,0.45+0.35*Math.max(0,Math.sin(t*3+ph)))});
  const sk=g.children.find(c=>c.userData.spark);if(sk)sk.scale.setScalar(0.35+0.15*Math.sin(t*4+ph));g.userData.at=[g.position.x+0.8,g.position.z+0.8]})}
function catchBug(b){if(!BUGS.includes(b)){toast("날아가 버렸어요");return}
  if(FS||PD||SIT)return;b.hold=true;const B=INSECTS[b.k],p=b.g.position,lv=bugLv(),rare=B.w<10,wd=(rare?0.13:B.w<20?0.2:0.28)+0.03*lv,c=0.55+Math.random()*0.25;
  faceTo(p);startChore(Object.assign(camAt(p.x,p.y,p.z,1.8,0.9),{steps:["net"],zone:[c-wd/2,Math.min(0.97,c+wd/2)],
    onHold(g){sfx("scrape")},onTap:noop,onRub:noop,
    finish(){const ok=this.scores[0]===1;b.hold=false;
      if(!ok){b.state.until=Date.now()+15000;b.state.k=null;applyBugs();skillUp("bug",BUG_LV,1,"채집");endChore("휙… "+B.name+"가 날아가 버렸어요. 다시 해 봐요");return}
      const [a,z]=B.cm,cm=Math.round((a+(z-a)*Math.pow(Math.random(),1.4-0.1*lv))*10)/10;
      S.inv["bug_"+b.k]=(S.inv["bug_"+b.k]||0)+1;S.bugDex=S.bugDex||{};const d=S.bugDex[b.k]=S.bugDex[b.k]||{n:0,best:0};const first=!d.n,rec=cm>d.best;d.n++;d.best=Math.max(d.best,cm);
      b.state.until=Date.now()+25000;b.state.k=null;applyBugs();skillUp("bug",BUG_LV,rare?6:B.w<20?3:1,"채집");sfx("level");buzz([30,30,60]);
      endChore(`${B.name}를 잡았어요! ${cm}cm`+(first?" · 곤충 도감에 새로 담았어요":rec?" · 최고 기록!":"")+" · 분교 선생님이 사 줘요")}}))}
function bugDexHtml(){const L=Object.entries(INSECTS);let h=`<h3>곤충 도감 · ${L.filter(([k])=>(S.bugDex||{})[k]).length}/${L.length} · ${BUG_LV[bugLv()].name}</h3><div class="goods">`;
  L.forEach(([k,b])=>{const d=(S.bugDex||{})[k];h+=`<div class="good"><div class="gname">${d?b.name:"???"}<small>${d?`${d.n}마리 · 최고 ${d.best}cm`:["봄","여름","가을","겨울"].filter((_,i)=>b.season.includes(i)).join("·")+" "+(b.time==="night"?"밤":"낮")+" · "+b.where.map(w=>PLACES[w].name).join("·")}</small></div></div>`});
  return h+"</div>"}
// 분교 선생님: 곤충 사 주기 (자연 학습 표본)
function openTeacher(line){const have=Object.keys(INSECTS).filter(k=>S.inv["bug_"+k]>0);let b='<div class="goods">';
  if(S.inv.gaje>0)b+=goods("가재",`${S.inv.gaje}마리 · 한 마리 ${ITEMS.gaje.price}원`,`<button class="go" data-gj="1">다</button>`);
  have.forEach(k=>{const n=S.inv["bug_"+k];b+=goods(INSECTS[k].name,`${n}마리 · 한 마리 ${INSECTS[k].sell}원`,`<button class="go" data-bs="${k}">1마리</button><button data-ba="${k}" ${n>1?"":"disabled"}>다</button>`)});
  b+=`</div><p class="hint">${have.length||S.inv.gaje>0?"아이들 자연 학습에 쓸 거예요":"잡아 온 곤충이 없어요. 냇가·분교·뒷산에서 날아다니는 곤충을 눌러 잡아요"} · 낮과 밤, 철마다 나오는 곤충이 달라요</p>`;
  shopSheet("teacher",line||pickOne(["곤충 잡아 왔어요? 아이들이 좋아하겠네요","가을 운동회 준비하고 있어요. 그날은 마을 사람 다 모여요!","그네 타 보셨어요? 어른이 타도 재밌어요"]),b);
  const sell=(k,n)=>{S.inv["bug_"+k]-=n;const got=INSECTS[k].sell*n;S.money+=got;sfx("coin");save();refresh();openTeacher(`${INSECTS[k].name} ${n}마리, ${got.toLocaleString()}원 드릴게요. 아이들이 신나겠어요!`)};
  if(sheet.querySelector("[data-gj]"))sheet.querySelector("[data-gj]").onclick=()=>{const n=S.inv.gaje||0;S.inv.gaje=0;S.money+=n*ITEMS.gaje.price;sfx("coin");save();refresh();openTeacher(`가재 ${n}마리! 아이들이 집게 보고 깜짝 놀라겠어요. ${(n*ITEMS.gaje.price).toLocaleString()}원`)};
  sheet.querySelectorAll("[data-bs]").forEach(x=>x.onclick=()=>sell(x.dataset.bs,1));sheet.querySelectorAll("[data-ba]").forEach(x=>x.onclick=()=>sell(x.dataset.ba,S.inv["bug_"+x.dataset.ba]))}
SHOPS.teacher.open=l=>openTeacher(l);SHOPS.teacher.role="곤충 사 줘요 · 마을 행사";

/* ================= 2) 짚공예 ================= */
const jipLv=()=>tierOf(JIP_LV,(S.skill||{}).jip||0);
function openJipCraft(){let h=`<h2>짚공예</h2><p class="hint">볏짚은 벼를 털면 나오고, 방앗간에서도 팔아요 · 가진 볏짚 ${S.inv.jip||0}단 · ${JIP_LV[jipLv()].name}</p><div class="goods">`;
  Object.entries(JIP).forEach(([k,r])=>{const ok=Object.entries(r.need).every(([i,n])=>(S.inv[i]||0)>=n);
    h+=`<div class="good ${ok?"":"lack"}"><div class="gname">${r.name}<small>${r.desc} · ${Object.entries(r.need).map(([i,n])=>ITEMS[i].name+" "+(S.inv[i]||0)+"/"+n).join(", ")} · 목수 할아버지가 ${r.sell}원 · 가진 것 ${S.inv[k]||0}</small></div><div class="gbtn"><button class="go" data-jip="${k}" ${ok?"":"disabled"}>만들기</button></div></div>`});
  openSheet(h+"</div>");sheet.querySelectorAll("[data-jip]").forEach(b=>b.onclick=()=>{closeSheet();if(SIT)standUp();startJip(b.dataset.jip)})}
function startJip(k){const r=JIP[k],x=HF.x-1.3,z=HF.z-1.2;let bundle,woven=0;
  startChore(Object.assign(camAt(x,0.75,z,1.5,1.1),{steps:r.steps.slice(),
    setup(){bundle=new THREE.Group();for(let i=0;i<14;i++){const c=cyl(0.012,0.012,0.6,0xd8b860,(i%5-2)*0.02,0,(Math.floor(i/5)-1)*0.02,4);c.rotation.z=Math.PI/2;bundle.add(c)}bundle.position.set(x,0.75,z);this.g.add(bundle)},
    targets:()=>near(new THREE.Vector3(x,0.76,z),{n:5,d:0.28}),
    onRub(s,n,need){bundle.rotation.x+=0.6;bundle.scale.y=1-0.5*n/need},
    onTap(s,t){sfx("seed");woven++;const m=box(0.08,0.012,0.08,0xc8a850,t.p.x,0.77,t.p.z);m.rotation.y=woven;this.g.add(m)},
    onHold:noop,
    finish(){Object.entries(r.need).forEach(([i,n])=>S.inv[i]-=n);const sc=avg(this.scores),n=1+(jipLv()>=2&&sc>0.85&&Math.random()<0.35?1:0);S.inv[k]=(S.inv[k]||0)+n;
      skillUp("jip",JIP_LV,r.steps.length*2,"짚공예");endChore(`${r.name} ${n}개를 만들었어요!`+(n>1?" 손이 익어서 하나 더":"")+" · 목공소 목수 할아버지가 사 줘요")}}))}
// 목수 할아버지: 짚공예도 사 줘요 (가구 창 위에 덧붙여요)
SHOPS.furniture.open=line=>{openFurniture(line);const have=Object.keys(JIP).filter(k=>S.inv[k]>0);if(!have.length)return;
  let h=`<h3>짚공예 사 줘요</h3><div class="goods">`;have.forEach(k=>h+=goods(JIP[k].name,`${S.inv[k]}개 · 하나에 ${JIP[k].sell}원`,`<button class="go" data-js="${k}">1개 팔기</button>`));
  sheet.querySelector(".talkhead").insertAdjacentHTML("afterend",h+"</div>");
  sheet.querySelectorAll("[data-js]").forEach(x=>x.onclick=()=>{const k=x.dataset.js;if(!(S.inv[k]>0))return;S.inv[k]--;S.money+=JIP[k].sell;sfx("coin");save();refresh();SHOPS.furniture.open(pickOne([`허허, ${JIP[k].name} 솜씨가 제법이구먼. ${JIP[k].sell}원`,`요즘 이런 거 만드는 사람 귀하지. ${JIP[k].sell}원 줌세`]))})};

/* ================= 3) 마을 품삯 일 ================= */
function jobsNow(){let s=Math.floor(Date.now()/600000)%9973;const ids=JOBS.map(j=>j.id),out=[];while(out.length<3){s=(s*7919+17)%9973;const id=ids[s%ids.length];if(!out.includes(id))out.push(id)}return out.map(id=>JOBS.find(j=>j.id===id))}
const jobMark=new THREE.Group();
{const r=new THREE.Mesh(new THREE.TorusGeometry(0.6,0.06,8,28),new THREE.MeshBasicMaterial({color:0xf6d54a}));r.rotation.x=-Math.PI/2;r.position.y=0.08;jobMark.add(r);
  const hit=new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,1.6,10),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));hit.position.y=0.8;jobMark.add(hit);
  jobMark.userData={kind:"poke",poke:()=>startJob()};jobMark.visible=false}
function jobsBoardHtml(){const now=jobsNow(),cur=S.job&&JOBS.find(j=>j.id===S.job.id),left=Math.ceil((600000-Date.now()%600000)/60000);
  let h=`<h3>품삯 일거리 · ${left}분 뒤 새로 붙어요 · 지금까지 ${S.jobsDone||0}번</h3>`;
  if(cur)h+=`<div class="item"><div>하는 중: ${cur.title}<small>${PLACES[cur.place].name}에 가면 바닥에 노란 동그라미가 있어요 · 품삯 ${cur.pay}원</small></div><button data-jobx="1">그만두기</button></div>`;
  now.forEach(j=>h+=`<div class="item"><div>${j.title}<small>${j.who} · ${PLACES[j.place].name} · 품삯 ${j.pay}원</small></div><button class="go" data-job="${j.id}" ${cur?"disabled":""}>${cur&&cur.id===j.id?"하는 중":"맡기"}</button></div>`);
  return h}
function bindJobs(){sheet.querySelectorAll("[data-job]").forEach(b=>b.onclick=()=>{const j=JOBS.find(x=>x.id===b.dataset.job);S.job={id:j.id,t:Date.now()};save();closeSheet();sfx("pop");toast(`"${j.title}" 맡았어요. 마을 지도로 ${PLACES[j.place].name}에 가서 노란 동그라미를 눌러요`);placeJobMark()});
  sheet.querySelectorAll("[data-jobx]").forEach(b=>b.onclick=()=>{S.job=null;save();placeJobMark();openBoard()})}
function placeJobMark(){const j=S.job&&JOBS.find(x=>x.id===S.job.id),P=j&&PLACES[j.place];
  if(!j||mode!==j.place){jobMark.visible=false;return}
  if(!jobMark.userData.lab){const l=label("품삯 일 · "+j.title,0.8);l.position.y=1.6;jobMark.add(l);jobMark.userData.lab=l}
  if(jobMark.userData.labFor!==j.id){jobMark.remove(jobMark.userData.lab);const l=label("품삯 일 · "+j.title,0.8);l.position.y=1.6;jobMark.add(l);jobMark.userData.lab=l;jobMark.userData.labFor=j.id}
  if(jobMark.parent!==P.g)P.g.add(jobMark);jobMark.visible=true;jobMark.position.set(j.at[0],j.place==="dwitsan"?sanH(...j.at):0,j.at[1]);jobMark.userData.at=[j.at[0]+0.2,j.at[1]+1.0]}
["stream","school","dwitsan"].forEach(k=>{const c=PLACES[k].clicks;PLACES[k].clicks=()=>c().concat(BUGS.map(b=>b.g))});
Object.keys(PLACES).forEach(k=>{const c=PLACES[k].clicks;PLACES[k].clicks=()=>c().concat(jobMark.visible&&jobMark.parent===PLACES[k].g?[jobMark]:[])});
function startJob(){const j=S.job&&JOBS.find(x=>x.id===S.job.id);if(!j||PD||SIT)return;const [x,z]=j.at,F=new THREE.Vector3(x,0.15,z);let sack=null;
  startChore(Object.assign(camAt(x,0.4,z,2.0,1.6),{steps:j.steps.slice(),
    targets:s=>near(F,{n:s==="pick"?4:5,d:0.45}),
    stepSetup(s){this.g.children.slice().forEach(c=>{if(c.userData.tmp)this.g.remove(c)});
      if(s==="pull")this.st.t.forEach(t=>{const w=weedTuft(t.p.x,t.p.z,this.g,0.02);w.userData.tmp=1;t.m=w});
      if(s==="pick")this.st.t.forEach((t,i)=>{const m=box(0.1,0.04,0.07,[0xe8e0d0,0x6a8aaa,0xc8572f,0x8a6a48][i%4],t.p.x,0.04,t.p.z);m.rotation.y=i;m.userData.tmp=1;this.g.add(m);t.m=m});
      if(s==="gama"){sack=box(0.6,0.35,0.4,0xe8dcb0,x,0.2,z);sack.userData.tmp=1;this.g.add(sack)}},
    onTap(s,t){sfx(s==="pull"?"scrape":"pluck");if(t.m)this.g.remove(t.m)},
    onRub(s,n,need){for(let i=0;i<3;i++){const d=sph(0.03,0xc8b890,x+fr(-0.4,0.4),0.1,z+fr(-0.3,0.3));d.userData.tmp=1;d.userData.v=1;this.g.add(d)}},
    onHolding(g){if(sack)sack.position.y=0.2+g*0.6},onHold(g){if(sack)sack.position.y=0.2},
    frame(dt){this.g.children.forEach(c=>{if(c.userData.v)c.position.y+=dt*0.8})},
    finish(){const sc=avg(this.scores),pay=Math.round(j.pay*(sc>=0.9?1.2:1));S.money+=pay;S.jobsDone=(S.jobsDone||0)+1;S.job=null;jobMark.visible=false;
      endChore(`${j.who}: "수고했어요!" 품삯 ${pay}원`+(sc>=0.9?" (솜씨가 좋아 웃돈까지)":"")+` · 지금까지 품삯 일 ${S.jobsDone}번 · 회관 게시판에 일거리가 또 있어요`)}}))}

/* ================= 4) 30초 장작 패기 도전 ================= */
function openMotangMenu(){const logs=S.inv.tongnamu||0;
  openSheet(`<h2>모탕</h2><div class="goods">${goods("통나무 패기",`통나무 ${logs}개 · 하나에 장작 ${FUEL.piecesPerLog}개`,`<button class="go" id="mtChop" ${logs?"":"disabled"}>패기</button>`)}
    ${goods("30초 장작 패기 도전",`연습용 토막을 30초 동안 몇 번이나 쪼갤까요 · 최고 기록 ${S.chopBest||0}번 · 두 번에 장작 하나`,`<button class="go" id="mtRace">도전</button>`)}</div>`);
  $("mtChop").onclick=()=>{closeSheet();useMotang()};$("mtRace").onclick=()=>{closeSheet();startChopRace()}}
function startChopRace(){const M0=motang.position;let cur=null,half=[],t=0,ended=false;const LIM=30;
  const newLog=()=>{cur=cyl(0.16,0.16,0.5,0xb08a5a,M0.x,0.78,M0.z,10);PD.g.add(cur);half=[]};
  motang.userData.axe.visible=false;
  startChore({steps:["chop"],chops:999,focus:new THREE.Vector3(M0.x,0.8,M0.z),cam:new THREE.Vector3(M0.x+0.2,1.9,M0.z+2.0),look:new THREE.Vector3(M0.x,0.6,M0.z),
    chopAt:()=>new THREE.Vector3(M0.x,0.85,M0.z),stepSetup(){newLog()},onTap:noop,onRub:noop,onHold:noop,
    onChop(n){sfx("chop");const c=sp(this.focus);wPop(c.x,c.y-60,n+"!");
      if(n%2===1){this.g.remove(cur);half=[-1,1].map(d=>{const h=box(0.15,0.5,0.3,0xb08a5a,M0.x+d*0.1,0.78,M0.z);h.userData.d=d;this.g.add(h);return h})}
      else{half.forEach(h=>h.userData.fly=1);newLog()}},
    frame(dt){this.g.children.forEach(h=>{if(h.userData.fly){h.position.x+=h.userData.d*dt*3;h.position.y=Math.max(0.05,h.position.y-dt*2)}});
      if(ended)return;t+=dt;const n=this.st&&this.st.n||0;$("wGuide").textContent=`남은 시간 ${Math.max(0,Math.ceil(LIM-t))}초 · ${n}번 쪼갰어요 · 최고 ${S.chopBest||0}번`;
      if(t>=LIM){ended=true;this.busy=true;setTimeout(()=>{if(PD===this)this.finish()},0)}},
    cleanup(){motang.userData.axe.visible=true},
    finish(){const n=this.st.n||0,best=S.chopBest||0,rec=n>best,room=FUEL.pileMax-(S.inv.jangjak||0),got=Math.max(0,Math.min(room,Math.floor(n/2)));
      S.inv.jangjak=(S.inv.jangjak||0)+got;if(rec){S.chopBest=n;if(n>=10){S.money+=100}}sweat(Math.min(8,Math.ceil(n/4)));if(rec)sfx("level");
      endChore(`30초에 ${n}번 쪼갰어요!`+(rec?` 새 기록!${n>=10?" 이장님이 상금 100원을 주셨어요":""}`:` (최고 ${best}번)`)+` · 장작 ${got}개를 쌓았어요`)}})}

/* ================= 5) 냇가 다슬기 줍기 ================= */
const SEULGI_ROCKS=[[-14,-1.75],[-10.5,-1.8],[-7.6,-1.75],[8.8,-1.8],[11.6,-1.75],[14.6,-1.8]];
const seulgiRocks=SEULGI_ROCKS.map(([x,z],i)=>{const g=new THREE.Group();[[0,0,0.3],[0.25,0.1,0.18],[-0.2,-0.12,0.2]].forEach(([a,b,r])=>{const s=sph(r,0x8a8578,a,r*0.35,b);s.scale.y=0.55;g.add(s)});
  const hit=new THREE.Mesh(new THREE.SphereGeometry(0.8,8,6),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));g.add(hit);
  g.position.set(x,0,z);g.userData={kind:"poke",poke:()=>useSeulgi(i),at:[x,-0.85]};stream.add(g);return g});
addToPlace("stream",seulgiRocks,[]);
function useSeulgi(i){S.seulgiAt=S.seulgiAt||{};if(Date.now()<(S.seulgiAt[i]||0)){toast("방금 뒤집어 본 돌이에요. 조금 뒤에 다시 와요 · 다른 돌을 찾아봐요");return}
  const R=seulgiRocks[i],[x,z]=SEULGI_ROCKS[i],F=new THREE.Vector3(x,0.12,z);let snails=[];
  startChore(Object.assign(camAt(x,0.15,z,1.6,1.3),{steps:["dol","seulgi"],
    targets:s=>s==="dol"?[F.clone()]:snails.map(m=>m.position.clone()),
    setup(){R.visible=false;const g=new THREE.Group();R.children.slice(0,3).forEach(c=>g.add(c.clone()));g.position.set(x,0,z);this.g.add(g);this.rock=g;
      const n=3+Math.floor(Math.random()*3);for(let k=0;k<n;k++){const m=cone(0.035,0.08,0x2a3a2a,x+fr(-0.35,0.35),0.04,z+fr(-0.25,0.25),6);m.rotation.x=Math.PI/2;m.visible=false;this.g.add(m);snails.push(m)}},
    stepSetup(s){if(s==="seulgi")snails.forEach(m=>m.visible=true)},
    onTap(s,t){if(s==="dol"){sfx("scrape");this.rock.rotation.z=Math.PI*0.8;this.rock.position.x+=0.3;return}
      sfx("pluck");const m=snails.reduce((a,q)=>q.visible&&q.position.distanceTo(t.p)<(a?a.position.distanceTo(t.p):1e9)?q:a,null);if(m)m.visible=false},
    onRub:noop,onHold:noop,cleanup(){R.visible=true},
    finish(){const n=snails.length+(Math.random()<0.3?1:0);S.inv.daseulgi=(S.inv.daseulgi||0)+n;S.seulgiAt[i]=Date.now()+60000;
      endChore(`다슬기 ${n}개를 주웠어요 · 지금 ${S.inv.daseulgi}개 · 장터 국밥집 아주머니가 사 줘요`)}}))}
// 국밥집 아주머니: 다슬기 사 주기
// 냇가에서 건진 것 팔기 (여러 가게 같이 써요)
function sellBox(shop,ks,reopen,say){const have=ks.filter(k=>S.inv[k]>0);if(!have.length)return "";
  setTimeout(()=>sheet.querySelectorAll("[data-sx]").forEach(b=>b.onclick=()=>{const k=b.dataset.sx,n=S.inv[k]||0;if(!n)return;S.inv[k]=0;const got=n*ITEMS[k].price;S.money+=got;sfx("coin");save();refresh();reopen(say(k,n,got))}),0);
  return `<div class="goods">${have.map(k=>goods(ITEMS[k].name,`가진 것 ${S.inv[k]} · 하나에 ${ITEMS[k].price.toLocaleString()}원`,`<button class="go" data-sx="${k}">다 팔기</button>`)).join("")}</div>`}
SHOPS.jumak.open=line=>{const b=sellBox("jumak",["daseulgi","jaecheop","saeu"],SHOPS.jumak.open,(k,n,g)=>`${ITEMS[k].name} ${n}, ${g.toLocaleString()}원! ${{daseulgi:"시원하게 해장국 끓여야겠다",jaecheop:"재첩국 맑게 끓이면 최고지",saeu:"새우탕 얼큰하게 끓여야겠네"}[k]}`);
  shopSheet("jumak",line||pickOne(["아무 데나 앉어~ 국밥 한 그릇 말아 줄게","다슬기·재첩 있으면 가져와. 국 끓이게","오늘 순대가 아주 잘 됐어"]),
    (b||`<p class="hint">냇가 물가 돌을 뒤집거나 냇물 바닥을 훑으면 다슬기·재첩·민물새우가 나와요. 가져오면 사 줘요</p>`)+`<p class="hint">천막 긴 상에 앉으면 국밥·순대를 시켜 먹어요</p>`)};
SHOPS.store.open=line=>{openStore(line);const b=sellBox("store",["dongjeon","sageum"],l=>SHOPS.store.open(l),(k,n,g)=>k==="sageum"?`아이고 금이여 금! ${g.toLocaleString()}원 쳐줄게`:`이게 내 어릴 적 돈이여! 반갑네. ${g.toLocaleString()}원 줄게`);
  if(b)sheet.querySelector(".talkhead").insertAdjacentHTML("afterend","<h3>냇가에서 주운 귀한 것</h3>"+b)};

/* ---------- 매 순간 ---------- */
let grindT=0,grindMode=null;
function grindFrame(dt,now){bugsFrame(dt,now);wadeFrame();
  if(grindMode!==mode){grindMode=mode;applyBugs();placeJobMark()}
  grindT+=dt;if(grindT>1){grindT=0;const st=BUG_STATE[mode];if(st&&!PD&&st.some((s,i)=>!BUGS.some(b=>b.i===i)&&Date.now()>=s.until))applyBugs();placeJobMark()}}

/* ================= 6) 냇물에 들어가 바닥 훑기 (2026-11-11) =================
   냇가에선 물속까지 걸어 들어가요(얕은 냇물, 발목까지 잠겨요). 물속에 서 있으면 오른쪽 아래 "바닥 훑기"
   → 두 손으로 모래를 좌우로 훑으면 뭐가 나올지 몰라요: 흙더미뿐, 돌뿐, 다슬기, 재첩, 민물새우, 예쁜 조약돌,
   올챙이(놓아줘요), 쓰레기(주워서 깨끗하게), 가재, 옛날 동전, 아주 가끔 사금! 할수록 눈썰미가 늘어 귀한 게 조금 더 잘 나와요 */
const WATER_Z=[-4.95,-1.45]; // 냇물 (z 범위)
const inWater=()=>mode==="stream"&&me&&me.g.position.z>WATER_Z[0]&&me.g.position.z<WATER_Z[1];
const HULGI=[ // k, 이름, 무게, 말
  ["mud","흙더미",26,"흙더미뿐이에요… 흙탕물만 일었어요"],
  ["stone","돌",20,"돌뿐이네요. 반들반들한 돌멩이만"],
  ["daseulgi","다슬기",18,""],
  ["jaecheop","재첩",10,""],
  ["saeu","민물새우",7,""],
  ["pebble","예쁜 조약돌",8,""],
  ["olchaengi","올챙이",5,"꼬물꼬물 올챙이예요. 살살 놓아줬어요"],
  ["trash","쓰레기",4,"누가 버린 깡통이에요. 주워 왔어요. 냇가가 깨끗해졌어요"],
  ["gaje","가재",2.2,""],
  ["dongjeon","옛날 동전",0.9,""],
  ["sageum","사금",0.25,""]];
const PEBBLES=[["하얀 조약돌",0xf2f0e8],["초록 조약돌",0x6a9a7a],["붉은 조약돌",0xb8574a],["줄무늬 조약돌",0x9a8a7a],["하트 조약돌",0xe8a0a8]];
Object.assign(ITEMS,{jaecheop:{name:"재첩",price:25,stuff:true},saeu:{name:"민물새우",price:40,stuff:true},gaje:{name:"가재",price:180,stuff:true},
  dongjeon:{name:"옛날 동전",price:400,stuff:true},sageum:{name:"사금 한 톨",price:1500,stuff:true},pebble:{name:"예쁜 조약돌",price:0,stuff:true}});
CH.hulgi={name:"바닥 훑기",g:"rub",n:3,guide:n=>`두 손으로 바닥 모래를 좌우로 훑어요 · ${n}번 남음`,pop:"촤악",sfx:"pour"};
const hulgiEye=()=>Math.min(1,((S.hulgi||{}).n||0)/150); // 눈썰미: 150번이면 최고
function rollHulgi(){const e=hulgiEye(),w=HULGI.map(([k,,w])=>w*(w<3?1+1.5*e:1)*(k==="mud"||k==="stone"?1-0.3*e:1));
  let r=Math.random()*w.reduce((a,b)=>a+b,0),i=0;while(r>w[i]){r-=w[i];i++}return HULGI[Math.min(i,HULGI.length-1)]}
function foundMesh(k,peb){const g=new THREE.Group();
  if(k==="mud"){const m=sph(0.12,0x6a4a2e,0,0,0);m.scale.y=0.6;g.add(m)}
  else if(k==="stone"){const m=sph(0.1,0x8a8578,0,0,0);m.scale.set(1.3,0.6,1);g.add(m)}
  else if(k==="daseulgi")for(let i=0;i<3;i++){const c=cone(0.03,0.08,0x2a3a2a,(i-1)*0.07,0,0,6);c.rotation.x=Math.PI/2;g.add(c)}
  else if(k==="jaecheop")for(let i=0;i<2;i++){const s=sph(0.045,0x6a5a3a,(i-0.5)*0.1,0,0);s.scale.y=0.45;g.add(s)}
  else if(k==="saeu"){const b=cyl(0.015,0.025,0.12,0xd8c0a8,0,0,0,6);b.rotation.z=1.2;g.add(b)}
  else if(k==="pebble"){const s=sph(0.06,PEBBLES[peb][1],0,0,0);s.scale.set(1.2,0.6,1);g.add(s)}
  else if(k==="olchaengi"){g.add(sph(0.03,0x2a2a2a,0,0,0));g.add(box(0.06,0.005,0.015,0x2a2a2a,0.04,0,0))}
  else if(k==="trash"){g.add(cyl(0.04,0.04,0.12,0xb8bcc0,0,0,0,10))}
  else if(k==="gaje"){const b=sph(0.05,0x8a3a22,0,0,0);b.scale.set(0.8,0.6,1.8);g.add(b);[-1,1].forEach(d=>g.add(sph(0.03,0x9a4a2a,d*0.06,0,0.1)))}
  else if(k==="dongjeon"){const c=cyl(0.04,0.04,0.008,0xb87333,0,0,0,16);c.rotation.x=Math.PI/2;g.add(c)}
  else if(k==="sageum"){const m=new THREE.Mesh(new THREE.SphereGeometry(0.03,8,6),new THREE.MeshBasicMaterial({color:0xffd84a}));g.add(m)}
  return g}
function useHulgi(){if(!inWater()||PD||SIT||FS)return;const p=me.g.position,x=p.x,z=p.z;let mud=[];
  startChore({steps:["hulgi"],focus:new THREE.Vector3(x,0.05,z),cam:new THREE.Vector3(x+0.35,1.5,z+1.5),look:new THREE.Vector3(x,0,z-0.1),
    onRub(s,n){sfx("pour");for(let i=0;i<4;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(0.08,8,6),new THREE.MeshLambertMaterial({color:0x8a6a48,transparent:true,opacity:0.55}));
      m.position.set(x+fr(-0.25,0.25),0.06,z+fr(-0.2,0.2));m.userData.mud=1;this.g.add(m);mud.push(m)}},
    onTap:noop,onHold:noop,
    frame(dt){mud.forEach(m=>{m.scale.multiplyScalar(1+dt*0.8);m.material.opacity=Math.max(0,m.material.opacity-dt*0.25)});
      if(this.found){const f=this.found;f.position.y=Math.min(0.55,f.position.y+dt*0.9);f.rotation.y+=dt*2}},
    finish(){const [k,name,,say]=rollHulgi(),H=S.hulgi=S.hulgi||{n:0,got:{}};H.n++;H.got[k]=(H.got[k]||0)+1;let msg=say,peb=0,big=false;
      if(["daseulgi","jaecheop","saeu"].includes(k)){const n=k==="saeu"?1+Math.floor(Math.random()*2):1+Math.floor(Math.random()*3);S.inv[k]=(S.inv[k]||0)+n;msg=`${name} ${n}${k==="saeu"?"마리":"개"}를 건졌어요!`}
      if(k==="pebble"){peb=Math.random()<0.06?4:Math.floor(Math.random()*4);S.inv.pebble=(S.inv.pebble||0)+1;H.peb=H.peb||{};const first=!H.peb[peb];H.peb[peb]=(H.peb[peb]||0)+1;msg=`${PEBBLES[peb][0]}을 주웠어요`+(first?" · 조약돌 모음에 새로!":"");big=peb===4}
      if(k==="trash"){S.money+=10;msg+=" · 이장님이 고맙다고 10원"}
      if(k==="gaje"){S.inv.gaje=(S.inv.gaje||0)+1;msg="가재다! 집게를 번쩍 들고 있어요 · 분교 선생님이 사 줘요";big=true}
      if(k==="dongjeon"){S.inv.dongjeon=(S.inv.dongjeon||0)+1;msg="옛날 동전이에요! 녹슨 십 원짜리 · 구멍가게 할머니가 반가워하실 거예요";big=true}
      if(k==="sageum"){S.inv.sageum=(S.inv.sageum||0)+1;msg="반짝… 사금이에요!! 모래 속에 금 한 톨! · 구멍가게 할머니가 사 줘요";big=true}
      sweat(1);this.found=foundMesh(k,peb);this.found.position.set(x,0.05,z);this.g.add(this.found);
      if(big){sfx("level");buzz([40,30,80])}else sfx(k==="mud"||k==="stone"?"scrape":"pop");
      const done=()=>endChore(msg+(H.n%25===0?` · 지금까지 ${H.n}번 훑었어요. 눈썰미가 늘었어요`:""));setTimeout(()=>{if(PD===this)done()},1100)}})}
// 오른쪽 아래 단추 (물속에 있을 때만)
{const br=document.querySelector(".br");br.insertAdjacentHTML("afterbegin",'<button class="chip big go" id="hulgiBtn" hidden>바닥 훑기</button><button class="chip big" id="sipBtn" hidden>냇물 마시기</button>');
  $("hulgiBtn").onclick=useHulgi;$("sipBtn").onclick=()=>{if(inWater())drinkStream()}}
let wading=false;
function wadeFrame(){const w=inWater()&&!SIT&&!PD&&!FS&&!W;
  if(w!==wading){wading=w;$("hulgiBtn").hidden=$("sipBtn").hidden=!w;if(mode==="stream")$("fishBtn").hidden=w;
    if(w&&!S.wadeTip){S.wadeTip=1;save();toast("냇물에 들어왔어요. 발이 시원해요! 오른쪽 아래 '바닥 훑기'로 바닥을 훑어봐요")}}
  if(me&&!SIT&&!PD)me.b.position.y=inWater()?-0.3:me.b.position.y<0?0:me.b.position.y} // 물에 들어가면 발목까지 잠겨요
// 냇가 바닥 도감
function hulgiDexHtml(){const H=S.hulgi||{n:0,got:{}};let h=`<h3>냇가 바닥에서 찾은 것 · ${H.n}번 훑었어요</h3><div class="goods">`;
  HULGI.forEach(([k,name])=>{const n=H.got[k]||0;h+=`<div class="good"><div class="gname">${n||k==="mud"||k==="stone"?name:"???"}<small>${n}번</small></div></div>`});
  h+=`</div><h3>조약돌 모음 · ${Object.keys(H.peb||{}).length}/${PEBBLES.length}</h3><div class="goods">`;
  PEBBLES.forEach(([nm],i)=>{const n=(H.peb||{})[i]||0;h+=`<div class="good"><div class="gname">${n?nm:"???"}<small>${n}개</small></div></div>`});return h+"</div>"}
