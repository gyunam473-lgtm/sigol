/* 마을 다같이 (2026-11-13): 사람들이 모이는 곳에 깔아 두는 은근한 힐링
   1) 분교 운동장 큰 모닥불: 해가 지면 불이 피어요. 통나무 의자 두 겹(스무 자리 넘게)에 앉아 불멍, 장작을 보태면 불이 커지고 곁에 앉으면 덜 지쳐요
   2) 당산나무 소원 매듭: 장터 느티나무에 한마디 적은 천을 매달고, 남이 단 것도 읽어요
   3) 마을 꽃길: 장터 남쪽 길가·냇가 둑 빈자리에 꽃씨를 심으면 마을이 점점 예뻐져요 (누가 심었는지 살짝)
   5) 노을 정자: 해 질 녘 장터 정자·꼭대기 정자에 앉으면 "노을 보기"
   6) 공동 김장: 입동·소설 무렵 넓힌 마을회관 앞마당에서 크게. 배추를 보태고 일손을 거들어 100포기를 채우면 마을 잔치
   지금은 예시 이웃·장터 사람이 같이 하는 모습. 서버가 붙으면 진짜 사람들이 보태요 */

const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);

/* ================= 1) 분교 운동장 큰 모닥불 (캠프파이어) =================
   마을에서 제일 넓은 분교 운동장 한가운데. 불이 크고, 통나무 의자가 두 겹으로 둘러 있어 여럿이 모여 앉아요.
   운동장 들어오는 쪽(앞)은 통로로 비워 뒀어요. 밤엔 마을 사람들이 둘레에 모여 서 있어요 */
const FIRE={x:0,z:-1,decay:300000,scale:2.4}; // 장작 하나(+0.35)가 5분에 0.1씩 사그라들어요
const fireG=new THREE.Group();fireG.position.set(FIRE.x,0,FIRE.z);school.add(fireG);
const fireCore=new THREE.Group();fireCore.scale.setScalar(FIRE.scale);fireG.add(fireCore);
const flames=[],fireSparks=[];let fireLight;
(function(){
  for(let i=0;i<12;i++){const a=i/12*TAU,s=sph(0.17,i%2?0x7a7570:0x8a857e,Math.cos(a)*0.75,0.08,Math.sin(a)*0.75);s.scale.y=0.6;fireCore.add(s)}
  [0,0.8,1.6,2.4].forEach(a=>{const l=cyl(0.08,0.09,1.0,0x5a3a22,0,0.16,0,6);l.rotation.z=Math.PI/2;l.rotation.y=a;fireCore.add(l)});
  fireCore.add(cyl(0.55,0.55,0.02,0x2a1a10,0,0.03,0,16));
  [[0.42,1.1,0xff6a10,0.9],[0.3,0.9,0xffa020,0.85],[0.17,0.6,0xffe080,0.9]].forEach(([r,h,c,o])=>{const m=new THREE.Mesh(new THREE.ConeGeometry(r,h,8),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,depthWrite:false,blending:THREE.AdditiveBlending}));
    m.geometry.translate(0,h/2,0);m.position.y=0.18;fireCore.add(m);flames.push(m)});
  for(let i=0;i<30;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(0.025,5,4),new THREE.MeshBasicMaterial({color:0xffb040}));s.userData.ph=Math.random();fireCore.add(s);fireSparks.push(s)}
  fireLight=new THREE.PointLight(0xff8a3a,0,30,2);fireLight.position.y=2.4;fireG.add(fireLight);
  fireG.add(hitBox(4.2,3,4.2,0,1.5,0));poke(fireG,()=>addFireWood(),[FIRE.x+2.4,FIRE.z+2.6]);
})();
// 통나무 의자 두 겹: 안쪽 12개(반지름 4.2), 바깥 16개(6.2). 앞쪽(+z, 들어오는 쪽)은 비워요
const FIRE_LOGS=[];
[[4.2,12],[6.2,16]].forEach(([R,n],ring)=>{for(let k=0;k<n;k++){const a=k/n*TAU+(ring?0.1:0),x=FIRE.x+Math.cos(a)*R,z=FIRE.z+Math.sin(a)*R;
  if(Math.abs(x-FIRE.x)<1.6&&z>FIRE.z)continue;FIRE_LOGS.push({i:FIRE_LOGS.length,x,z,R,ring,face:Math.atan2(FIRE.x-x,FIRE.z-z)})}});
const fireLogMeshes=FIRE_LOGS.map(L=>{const g=new THREE.Group();const c=cyl(0.2,0.22,1.1,0x7a5434,0,0.22,0,10);c.rotation.z=Math.PI/2;g.add(c);g.add(cyl(0.19,0.19,0.01,0xc8a070,0.555,0.22,0,10).rotateZ(Math.PI/2));
  g.position.set(L.x,0,L.z);g.rotation.y=L.face+Math.PI/2;g.userData={kind:"seat",seat:"fireLog"+L.i};school.add(g);
  FREE_SEATS["fireLog"+L.i]={title:"운동장 모닥불 곁",where:"school",note:"타닥타닥 장작 타는 소리. 둘러앉은 사람들 얼굴이 불빛에 붉어요.",
    get:()=>({pos:[L.x,0.42,L.z],face:L.face,stand:[L.x-Math.sin(L.face)*0.9,L.z-Math.cos(L.face)*0.9],cam:L.ring?[2.0,1.9,-1.3]:[1.7,1.4,-1.0],look:[-0.4,0.1,L.R]}),
    panel:firePanel,bind:fireBind};return g});
addToPlace("school",[fireG,...fireLogMeshes],[[FIRE.x-2.0,FIRE.z-2.0,FIRE.x+2.0,FIRE.z+2.0],...FIRE_LOGS.map(L=>[L.x-0.35,L.z-0.35,L.x+0.35,L.z+0.35])]);
PLACES.school.way=[[-8,4],[8,4],[-8,-7],[7,-6],[-3,7.5],[3,7.5],[-10,1],[10,1],[0,8.5]]; // 동네 사람들은 모닥불 둘레 밖으로 다녀요
PLACES.school.sub="넓은 운동장 · 큰 모닥불(밤에 다같이) · 그네 · 스탠드";
PLACES.school.hint="운동장 한가운데 큰 모닥불이 있어요. 통나무에 앉아 불멍, 장작을 보태요. 그네·스탠드·학교 종도 있어요.";
// 밤에 모닥불 둘레에 모여 선 마을 사람들 (처음 분교에 들어갈 때 만들어요)
let fireCrowd=null;
function fireCrowdApply(){if(mode!=="school"||!me)return;
  if(!fireCrowd)fireCrowd=[["동네 할아버지",0x7a6a54,{hat:true,hair:0xdedad2}],["동네 아주머니",0xc87a6a,{scarf:0xf2e6c8}],["윗마을 청년",0x4a6a8a,{cap:0x2a3a4a}],["새댁",0xd8a0b0,{hat:false,hair:0x2a1a14}],
    ["동네 아이",0xf2c040,{cap:0xd8321e}],["읍내 손님",0x6a6a6a,{hat:false,hair:0x3a332c}],["이웃 할머니",0x9a7aa8,{hat:false,hair:0xc9c4bc}],["귀농 새내기",0x5a8a6a,{}]]
    .map(([n,c,o],k)=>{const p=person(c,n,Object.assign({style:"nb"},o));scene.remove(p.g);const a=-Math.PI/2+(k-3.5)*0.42,R=7.6;p.g.position.set(FIRE.x+Math.cos(a)*R,0,FIRE.z+Math.sin(a)*R);
      p.g.rotation.y=Math.atan2(FIRE.x-p.g.position.x,FIRE.z-p.g.position.z);if(k%3)p.label.visible=false;school.add(p.g);return p});
  const on=fireBase()>0;fireCrowd.forEach(p=>p.g.visible=on)}
function fireBase(){return (skyNow.night||0)>0.35?0.35:0} // 밤엔 마을 사람들이 늘 지펴 둬요
function fireOwn(){const f=S.fire;if(!f)return 0;return Math.max(0,f.lv-(Date.now()-f.t)/FIRE.decay*0.1)}
const fireLv=()=>Math.min(1,Math.max(fireBase(),fireOwn()));
function addFireWood(who){if(!who){if(!((S.inv.jangjak||0)>0)){toast("장작이 없어요. 모탕에서 패 오거나 목공소에서 한 짐 사 와요");return false}S.inv.jangjak--}
  S.fire={lv:Math.min(1,Math.max(fireOwn(),fireBase())+0.35),t:Date.now()};save();refresh();burst(0.5,700,0.16);burst(0.12,3000,0.06,0.15);
  toast(who?josa(who,"이","가")+" 모닥불에 장작을 보탰어요. 불길이 확!":pickOne(["장작을 넣으니 불길이 하늘 높이 솟아요","타닥타닥, 불꽃이 별까지 튀어 올라요","불이 커졌어요. 운동장이 환해요"]));
  if(SIT&&SIT.id&&SIT.id.startsWith("fireLog"))renderFreeSit();return true}
const FIRE_NOTES=["불꽃이 춤을 춰요. 아무 생각이 안 나요","장작 속이 빨갛게 숨을 쉬어요","연기 냄새가 옷에 배어요. 싫지 않아요","불티가 별 사이로 날아가요","손을 쬐니 손바닥이 따끈해요","건너편 사람들 웃음소리가 들려요"];
function firePanel(){const lv=fireLv(),n=S.inv.jangjak||0,warm=lv>=0.2;
  return `<div class="item"><div>모닥불 ${lv>0.7?"활활":lv>0.3?"잔잔하게":lv>0?"사그라드는 중":"불씨만 남았어요"}<small>${warm?"곁에 앉아 있으면 덜 지쳐요 (땀 흘려도 든든함·물이 반만 줄어요)":"해가 지면 마을 사람들이 불을 지펴요 · 장작을 넣으면 지금도 피워요"} · 가진 장작 ${n}개</small></div><button class="go" id="fireWood" ${n?"":"disabled"}>장작 넣기</button></div><p class="hint">${pickOne(FIRE_NOTES)}</p>`}
function fireBind(){if($("fireWood"))$("fireWood").onclick=()=>addFireWood()}
let fireNpcT=0;
function fireFrame(dt,now){const lv=fireLv(),n=skyNow.night||0;
  flames.forEach((m,i)=>{const s=lv*(1.15+0.2*Math.sin(now/90+i*2)+0.1*Math.sin(now/37+i));m.visible=lv>0.02;m.scale.set(Math.max(0.01,lv*(0.95+0.12*Math.sin(now/70+i))),Math.max(0.01,s),Math.max(0.01,lv))});
  fireSparks.forEach(s=>{const u=(now/1800+s.userData.ph)%1;s.visible=lv>0.25;s.position.set(Math.sin(s.userData.ph*40+u*6)*0.35,0.4+u*3.0*lv,Math.cos(s.userData.ph*30+u*5)*0.35);s.scale.setScalar(1-u)});
  fireLight.intensity=lv*(1.0+2.4*n)*(0.9+0.1*Math.sin(now/60));
  if(mode!=="school")return;
  const d=me?Math.hypot(me.g.position.x-FIRE.x,me.g.position.z-FIRE.z):99;if(lv>0.1&&d<16&&Math.random()<dt*1.8)burst(0.05,2400,0.07*lv*(1-d/16)); // 타닥타닥
  if(SIT&&SIT.id&&SIT.id.startsWith("fireLog")&&lv>=0.2){if(!(S.warmUntil>Date.now()+60000))toast("불 곁에 앉으니 몸이 녹아요 · 10분 동안 덜 지쳐요");S.warmUntil=Date.now()+600000}
  fireNpcT+=dt;if(n>0.35&&fireNpcT>150){fireNpcT=0;if(fireOwn()<0.6)addFireWood(pickOne(["옆집 할머니","이장님","귀농 2년차","분교 선생님","동네 할아버지","윗마을 청년"]))}
  if(Math.random()<dt)fireCrowdApply()}

/* ================= 2) 당산나무 소원 매듭 ================= */
const WISH_BASE=[["옆집 할머니","손주들 건강하게 해 주이소",0xd8321e],["이장님","올해도 마을에 큰 탈 없기를",0x3f6f9a],["귀농 2년차","내년엔 배추 농사 성공!",0x4f8a3a],
  ["국밥집 아주머니","장사 잘되게 해 주세요 ㅎㅎ",0xe8b830],["분교 선생님","아이들이 늘 웃기를",0xe88aa8],["방앗간 아저씨","허리 안 아프게",0xf2f0ea],
  ["다방 사장님","단골 손님 많이 오세요",0xb84aa8],["보건소 선생님","모두 아프지 말아요",0x5aaa8a],["구멍가게 할머니","버스 자주 다니게",0xd8a040],["지나가던 사람","여기 오면 마음이 편해져요",0x8aa8d8]];
const WISH_COL=[0xd8321e,0x3f6f9a,0x4f8a3a,0xe8b830,0xe88aa8,0xf2f0ea];
const wishG=new THREE.Group();zel.add(wishG);
function allWishes(){return WISH_BASE.map(([who,text,c])=>({who,text,c,t:0})).concat((S.wishes||[]).map(w=>Object.assign({who:"나"},w)))}
function drawWishes(){while(wishG.children.length)wishG.remove(wishG.children[0]);const L=allWishes().slice(-40);
  L.forEach((w,i)=>{const a=i*2.399,r=0.75+(i%3)*0.18,y=0.95+(i%4)*0.12,g=new THREE.Group();g.position.set(Math.cos(a)*r,y,Math.sin(a)*r);
    const rb=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.3,0.008),M(w.c));rb.geometry.translate(0,-0.15,0);g.add(rb);g.add(sph(0.02,w.c,0,0,0));g.userData.ph=i;wishG.add(g)})}
drawWishes();
poke(zel,()=>openWishTree(),[-5.6,3.6]);addToPlace("plaza",[zel],[]);
function openWishTree(){const L=allWishes().slice().reverse(),today=new Date().toDateString(),mine=(S.wishes||[]).filter(w=>new Date(w.t).toDateString()===today).length;
  let h=`<h2>당산나무 소원 매듭</h2><p class="hint">마을 사람들이 한마디씩 적어 가지에 매달아 뒀어요. 바람에 하늘하늘</p><div class="wishes">`;
  L.slice(0,24).forEach(w=>h+=`<div class="wish" style="border-left-color:#${w.c.toString(16).padStart(6,"0")}"><p>${esc(w.text)}</p><small>${esc(w.who)}</small></div>`);
  h+=`</div><h3>나도 하나 매달기 · 하루 세 개까지 (${mine}/3)</h3>`;
  if(mine<3)h+=`<textarea id="wishText" maxlength="40" rows="2" placeholder="소원이나 한마디 (40자까지)"></textarea><div class="wishcols">${WISH_COL.map((c,i)=>`<button class="wc${i?"":" on"}" data-wc="${c}" style="background:#${c.toString(16).padStart(6,"0")}" aria-label="천 색 ${i+1}"></button>`).join("")}</div><button class="close go" id="wishHang">매달기</button>`;
  else h+=`<p class="hint">오늘은 세 개를 다 매달았어요. 내일 또 와요</p>`;
  h+=`<p class="hint">서로 존중하기 · 다른 사람을 아프게 하는 말은 쓰지 않아요</p>`;
  openSheet(h);let col=WISH_COL[0];
  sheet.querySelectorAll("[data-wc]").forEach(b=>b.onclick=()=>{col=+b.dataset.wc;sheet.querySelectorAll("[data-wc]").forEach(x=>x.classList.toggle("on",x===b))});
  if($("wishHang"))$("wishHang").onclick=()=>{const t=$("wishText").value.trim().slice(0,40);if(!t){toast("한마디 적어 주세요");return}
    S.wishes=S.wishes||[];S.wishes.push({text:t,c:col,t:Date.now()});if(S.wishes.length>30)S.wishes.shift();save();drawWishes();closeSheet();sfx("pop");toast("천 조각을 가지에 꼭 묶었어요. 바람에 살랑살랑")}}

/* ================= 3) 마을 꽃길 ================= */
const FLOWERS={cosmos:{name:"코스모스",col:[0xf2a0c0,0xffffff,0xd84a8a],h:0.85},sun:{name:"해바라기",col:[0xf2c020],h:1.5},chae:{name:"채송화",col:[0xe8402a,0xf2c020,0xe870c0],h:0.22},guk:{name:"들국화",col:[0xf6f0e0,0xe8d040],h:0.45}};
const FLOWER_GROW=300000; // 심고 꽃 피기까지 (체험용 5분)
Object.entries(FLOWERS).forEach(([k,f])=>ITEMS["fseed_"+k]={name:f.name+" 꽃씨",price:0,stuff:true});
const FLOWER_SLOTS=[];
[-17,-14.8,-12.6,-10.4,-5.8,-3.6,3.6,5.8,10.6,12.8,15,17].forEach(x=>FLOWER_SLOTS.push({id:"p"+x,place:"plaza",x,z:15.2}));
[-15,-13.2,-11.4,-9.6,-4.6,-3,9.2,11,12.8,14.6].forEach(x=>FLOWER_SLOTS.push({id:"s"+x,place:"stream",x,z:1.5}));
const FLOWER_NPC={"p-17":["cosmos","옆집 할머니"],"p-12.6":["guk","이장님"],"p5.8":["sun","귀농 2년차"],"p15":["cosmos","분교 선생님"],"s-13.2":["chae","구멍가게 할머니"],"s11":["guk","보건소 선생님"],"s14.6":["cosmos","옆집 할머니"]};
const flowerG={plaza:new THREE.Group(),stream:new THREE.Group()};plaza.add(flowerG.plaza);stream.add(flowerG.stream);
function flowerOf(sl){const n=FLOWER_NPC[sl.id];if(n)return {k:n[0],by:n[1],t:0};return (S.flowers||{})[sl.id]||null}
function flowerMesh(k,bloom){const f=FLOWERS[k],g=new THREE.Group();
  if(!bloom){for(let i=0;i<3;i++){const c=cone(0.03,0.16,0x6aa83a,(i-1)*0.06,0.08,0,4);g.add(c)}return g}
  const n=k==="sun"?2:k==="chae"?6:4;for(let i=0;i<n;i++){const a=i/n*TAU+0.4,r=k==="chae"?0.16:0.12,x=Math.cos(a)*r,z=Math.sin(a)*r,h=f.h*(0.8+0.25*((i*37)%10)/10);
    g.add(cyl(0.01,0.012,h,0x4f8a2e,x,h/2,z,4));const c=f.col[i%f.col.length];
    if(k==="sun"){const d=cyl(0.14,0.14,0.04,0xf2c020,x,h,z,12);d.rotation.x=1.2;g.add(d);const ce=cyl(0.07,0.07,0.05,0x5a3a1a,x,h+0.01,z+0.01,10);ce.rotation.x=1.2;g.add(ce)}
    else if(k==="cosmos"){for(let p=0;p<6;p++){const pt=box(0.07,0.008,0.03,c,x+Math.cos(p)*0.045,h,z+Math.sin(p)*0.045);pt.rotation.y=-p;g.add(pt)}g.add(sph(0.018,0xf2c020,x,h+0.005,z))}
    else{const b=sph(k==="guk"?0.05:0.04,c,x,h,z);b.scale.y=0.6;g.add(b);if(k==="guk")g.add(sph(0.02,0xf2c020,x,h+0.02,z))}}
  return g}
function drawFlowers(){["plaza","stream"].forEach(pl=>{const G=flowerG[pl];while(G.children.length)G.remove(G.children[0]);
  FLOWER_SLOTS.filter(s=>s.place===pl).forEach(sl=>{const f=flowerOf(sl),g=new THREE.Group();g.position.set(sl.x,0,sl.z);
    const soil=cyl(0.38,0.4,0.06,f?0x6a4a2e:0x8a6a48,0,0.04,0,12);soil.receiveShadow=true;g.add(soil);
    if(f){const bloom=Date.now()-f.t>=FLOWER_GROW;g.add(flowerMesh(f.k,bloom))}
    g.add(hitBox(0.9,0.9,0.9,0,0.45,0));poke(g,()=>useFlowerSlot(sl),[sl.x,sl.z+(pl==="plaza"?-0.9:0.9)]);G.add(g)})})}
drawFlowers();
addToPlace("plaza",[flowerG.plaza],[]);addToPlace("stream",[flowerG.stream],[]);
function useFlowerSlot(sl){const f=flowerOf(sl);
  if(f){const F=FLOWERS[f.k],bloom=Date.now()-f.t>=FLOWER_GROW;
    if(!bloom){toast(`내가 심은 ${F.name} 새싹이에요 · ${Math.ceil((FLOWER_GROW-(Date.now()-f.t))/60000)}분쯤 뒤에 피어요`);return}
    toast(f.by==="나"?`내가 심은 ${F.name}예요 · ${new Date(f.t).getMonth()+1}월 ${new Date(f.t).getDate()}일 · 바람에 하늘하늘`:`${josa(f.by,"이","가")} 심은 ${F.name}예요 · 보고 있으면 마음이 환해져요`);sfx("pop");return}
  const have=Object.keys(FLOWERS).filter(k=>S.inv["fseed_"+k]>0);
  if(!have.length){toast("꽃 심을 자리예요. 장터 씨앗가게 할아버지가 꽃씨를 팔아요");return}
  if(have.length===1)return plantFlower(sl,have[0]);
  openSheet(`<h2>무슨 꽃을 심을까요?</h2><div class="goods">${have.map(k=>goods(FLOWERS[k].name,`꽃씨 ${S.inv["fseed_"+k]}봉지`,`<button class="go" data-fl="${k}">심기</button>`)).join("")}</div>`);
  sheet.querySelectorAll("[data-fl]").forEach(b=>b.onclick=()=>{closeSheet();plantFlower(sl,b.dataset.fl)})}
function plantFlower(sl,k){S.inv["fseed_"+k]--;S.flowers=S.flowers||{};S.flowers[sl.id]={k,t:Date.now(),by:"나"};sweat(1);save();refresh();drawFlowers();sfx("seed");
  toast(`${FLOWERS[k].name} 꽃씨를 심었어요. 5분쯤 뒤에 피어요 · 지나가는 사람들이 보고 웃겠어요`)}
// 씨앗가게: 꽃씨도 팔아요 (창 아래 덧붙여요)
SHOPS.seed.open=line=>{const o=SHOPS.seed.open;SHOPS.seed.open=null;openShop("seed",line);SHOPS.seed.open=o;
  let h=`<h3>꽃씨 · 장터 길가와 냇가 둑에 심으면 마을이 예뻐져요</h3><div class="goods">`;
  Object.entries(FLOWERS).forEach(([k,f])=>h+=goods(f.name+" 꽃씨","20원 · 가진 것 "+(S.inv["fseed_"+k]||0)+"봉지",`<button class="go" data-fs="${k}" ${S.money>=20?"":"disabled"}>사기</button>`));
  sheet.querySelector(".mine").insertAdjacentHTML("beforebegin",h+"</div>");
  sheet.querySelectorAll("[data-fs]").forEach(b=>b.onclick=()=>{if(S.money<20)return;S.money-=20;const k=b.dataset.fs;S.inv["fseed_"+k]=(S.inv["fseed_"+k]||0)+1;sfx("coin");save();refresh();SHOPS.seed.open(`${FLOWERS[k].name} 씨앗이여. 길가에 심으면 오가는 사람 다 좋아하지`)})};
let flowerT=0;

/* ================= 5) 노을 정자 ================= */
const sunsetNow=()=>{const h=hourNow();return skyNow.set&&h>=skyNow.set-0.75&&h<=skyNow.set+0.35};
const NOEUL_SEATS=["plaza","sanJeongja"];
function noeulBtnHtml(){if(!SIT||!NOEUL_SEATS.includes(SIT.place||SIT.id))return "";
  return sunsetNow()?`<button class="close go" id="noeulBtn">노을 보기</button>`:`<div class="item"><div>노을은 ${fmt12(skyNow.set)}쯤<small>그때 오거나, 시간을 노을 무렵으로 바꿔 미리 볼 수 있어요</small></div><button class="go" onclick="setTimePick(skyNow.set-0.15);SIT.free?renderFreeSit():renderSit()">노을 시간으로</button></div>`}
// 노을 보기: 기둥 밖, 지붕들보다 높이서 해 지는 쪽을 봐요
function watchNoeul(){if(!SIT)return;const d=sun.position.clone().setY(0).normalize();SIT.noeul=true;lookSky(true);
  SIT.skyCam=SIT.seat.clone().add(d.clone().multiplyScalar(2.4)).add(new THREE.Vector3(0,4.2,0));SIT.skyLook=SIT.skyCam.clone().add(d.multiplyScalar(20)).add(new THREE.Vector3(0,-1.6,0));
  const k=new Date().toDateString();if(S.noeulDay!==k){S.noeulDay=k;S.noeulN=(S.noeulN||0)+1;save();setTimeout(()=>toast(`오늘의 노을을 봤어요 · 지금까지 노을 ${S.noeulN}번`),1500)}renderSit()}
const noeulNote=()=>pickOne(["하늘이 복숭앗빛에서 보랏빛으로 물들어요","해가 산 너머로 천천히 넘어가요. 오늘도 수고했어요","구름 가장자리가 금빛으로 빛나요","저녁 바람이 선선해요. 어디선가 밥 짓는 냄새"]);

/* ================= 6) 공동 김장 ================= */
const KJ={goal:100,start:[11,7],end:[12,6]}; // 입동~대설 전날
const kjSeason=()=>{const t=termNow(new Date());return t==="입동"||t==="소설"};
const kjKey=()=>"kj"+new Date().getFullYear();
function kjBase(){const d=new Date(),s=new Date(d.getFullYear(),KJ.start[0]-1,KJ.start[1]);return Math.max(0,Math.min(80,Math.floor((d-s)/3600000*0.9)))} // 마을 사람들이 조금씩 보태요
const kjMine=()=>((S.kj||{})[kjKey()]||{}).mine||0;
const kjTotal=()=>Math.min(KJ.goal,kjBase()+kjMine());
// 넓힌 회관 앞마당 동쪽에 커다란 김장판: 큰 깔개, 고무 대야 넷, 배추 산 둘, 고춧가루 양푼, 둘러앉은 마을 사람들
hall.add(box(38,0.02,26,0xd5d0c4,4,0.01,3)); // 회관 앞마당 넓히기 (옛 마당보다 살짝 낮게)
const KJ_C={x:12,z:4.6,w:11,d:7};
const kjSite=new THREE.Group();
const KJ_STATIONS=[[-4,2.4],[-1.3,2.4],[1.3,2.4],[4,2.4],[-4,-0.6],[4,-0.6]]; // 내가 거드는 자리 (깔개 기준)
// 깔개는 바닥(0.04)보다 띄워요. 같은 높이면 번쩍거려요
(function(){const {w,d}=KJ_C;kjSite.add(box(w,0.02,d,0x3f6fa8,0,0.065,0));
  [[-4,-1.6],[-1.3,-1.6],[1.3,-1.6],[4,-1.6]].forEach(([x,z])=>{kjSite.add(cyl(0.75,0.6,0.42,0xc8322a,x,0.23,z,18));kjSite.add(cyl(0.7,0.7,0.02,0x9ac078,x,0.44,z,18));
    for(let i=0;i<6;i++){const c=sph(0.15,i%2?0xe6f2c6:0x8ac060,x+((i%3)-1)*0.3,0.5,z+(Math.floor(i/3)-0.5)*0.3);c.scale.set(1,0.6,1.3);kjSite.add(c)}});
  [[-4.6,1.4],[4.6,1.4]].forEach(([x,z])=>{for(let i=0;i<20;i++){const c=sph(0.17,0x9ac078,x+((i%4)-1.5)*0.32,0.15+Math.floor(i/8)*0.24,z+((Math.floor(i/4)%2)-0.5)*0.34);c.scale.set(1,0.85,1.2);kjSite.add(c)}}); // 배추 산
  [[-2.6,1.2],[0,1.2],[2.6,1.2]].forEach(([x,z])=>{kjSite.add(cyl(0.3,0.24,0.14,0xf2f0ea,x,0.09,z,14));kjSite.add(cyl(0.27,0.27,0.02,0xc0392b,x,0.16,z,14))}); // 고춧가루 속 양푼
  kjSite.add(hitBox(w+0.4,1.2,d+0.4,0,0.6,0));kjSite.position.set(KJ_C.x,0,KJ_C.z);hall.add(kjSite);poke(kjSite,()=>openKimjang(),[KJ_C.x,KJ_C.z+KJ_C.d/2+0.9])})();
addToPlace("hall",[kjSite],[[KJ_C.x-KJ_C.w/2-0.2,KJ_C.z-KJ_C.d/2-0.2,KJ_C.x+KJ_C.w/2+0.2,KJ_C.z+KJ_C.d/2+0.2]]);
let kjPeople=null;
function kjApply(){const on=kjSeason();kjSite.visible=on;if(kjPeople)kjPeople.forEach(p=>p.g.visible=on);if(!on||kjPeople||!me)return;
  const who=[["김장 품앗이 아주머니",0xb85a6a,{scarf:0xf2e6c8,apron:0xf6f0e2}],["동네 아저씨",0x6a7a5a,{cap:0x3a4a3a}],["옆마을 할머니",0x9a7aa8,{scarf:0xe8d8c8,apron:0xf6f0e2}],["새댁",0xd8a0b0,{hat:false,hair:0x2a1a14,apron:0xf2e6c8}],
    ["부녀회장님",0xc84a6a,{scarf:0xf6f0e2,apron:0xe8e0d0}],["동네 할아버지",0x7a6a54,{hat:true,hair:0xdedad2}],["윗마을 아주머니",0xd8785a,{scarf:0xf2e6c8,apron:0xf6f0e2}],["귀농 새내기",0x5a8a6a,{apron:0xe8e0d0}],
    ["이장님 사모님",0x8a6aa8,{scarf:0xf2f0e8,apron:0xf6f0e2}],["동네 청년",0x4a6a8a,{cap:0x2a3a4a}]];
  const spots=[[-5.6,-1.6,Math.PI/2],[-2.7,-3.0,0],[-0.1,-3.0,0],[2.7,-3.0,0],[5.6,-1.6,-Math.PI/2],[-5.8,1.4,Math.PI/2],[5.8,1.4,-Math.PI/2],[-2.6,2.2,Math.PI],[2.6,2.2,Math.PI],[0,-3.6,0]];
  kjPeople=who.map(([n,c,o],k)=>{const p=person(c,n,Object.assign({style:"nb"},o)),[x,z,r]=spots[k];scene.remove(p.g);p.g.position.set(KJ_C.x+x,0,KJ_C.z+z);p.g.rotation.y=r;p.b.scale.y=0.72;if(k%3)p.label.visible=false;hall.add(p.g);return p})}
CH.jeorim={name:"배추 절이기",g:"rub",n:4,guide:n=>`반 가른 배추에 굵은소금을 슥슥 뿌려 절여요 · ${n}번 남음`,pop:"솔솔",sfx:"scrape"};
CH.sok={name:"속 넣기",g:"tap",guide:()=>"배춧잎 사이사이 콕콕 빨간 속을 넣어요"};
function openKimjang(){if(!kjSeason()){toast("다음 마을 행사는 준비 중이에요. 입동·소설 무렵엔 여기서 다같이 김장해요");return}
  const tot=kjTotal(),done=tot>=KJ.goal,K=(S.kj=S.kj||{})[kjKey()]=(S.kj||{})[kjKey()]||{mine:0},cab=(S.inv.cabbage||0)+(S.inv.cabbage_top||0);
  let h=`<h2>마을 공동 김장</h2><p class="hint">입동·소설 무렵, 온 마을 사람이 회관 앞마당에 모여 크게 김장해요. 다같이 ${KJ.goal}포기를 채우면 마을 잔치!</p>
    <div class="kjbar"><i style="width:${tot/KJ.goal*100}%"></i><span>${tot}/${KJ.goal}포기</span></div><p class="hint">내가 보탠 것 ${K.mine}포기 · 나머지는 마을 사람들이 조금씩 보태요</p><div class="goods">`;
  if(!done){h+=goods("배추 보태기",`가진 배추 ${cab}포기 · 특상은 두 포기로 쳐요`,`<button class="go" id="kjCab" ${cab?"":"disabled"}>한 포기</button>`);
    h+=goods("일손 거들기","배추 절이고 속 넣기 · 세 포기만큼 일한 셈이에요",`<button class="go" id="kjHelp">거들기</button>`)}
  else h+=goods("마을 김장 잔치!",K.feast?"김장김치를 받아 왔어요. 내년에 또 만나요":"다 채웠어요! 김장김치 두 접시를 받아 가요",K.feast?"":`<button class="go" id="kjFeast">받기</button>`);
  openSheet(h+"</div>");
  if($("kjCab"))$("kjCab").onclick=()=>{let add=1;if(S.inv.cabbage>0)S.inv.cabbage--;else{S.inv.cabbage_top--;add=2}K.mine+=add;sfx("pop");save();refresh();toast("배추를 대야에 보탰어요 · 아주머니: \"아이고 실하다!\"");openKimjang()};
  if($("kjHelp"))$("kjHelp").onclick=()=>{closeSheet();const st=pickOne(KJ_STATIONS),F=new THREE.Vector3(KJ_C.x+st[0],0.45,KJ_C.z+st[1]);
    startChore(Object.assign(camAt(F.x,F.y,F.z,1.5,1.2),{steps:["jeorim","sok"],targets:()=>near(F,{n:5,d:0.25}),
      onRub(){for(let i=0;i<3;i++){const s=sph(0.012,0xffffff,F.x+fr(-0.2,0.2),F.y+0.05,F.z+fr(-0.15,0.15));this.g.add(s)}},onTap(s,t){sfx("pluck");this.g.add(sph(0.03,0xc0392b,t.p.x,t.p.y+0.02,t.p.z))},onHold:noop,
      finish(){K.mine+=3;let ext="";const d=new Date().toDateString();if(K.suyuk!==d){K.suyuk=d;S.full=Math.min(100,fullNow()+10);ext=" · 아주머니가 수육 한 점에 김치를 싸서 입에 넣어 주셨어요! 든든함 +10"}
        endChore(`김장 일손을 거들었어요 (+3포기, 지금 ${kjTotal()}/${KJ.goal})`+ext)}}))};
  if($("kjFeast"))$("kjFeast").onclick=()=>{K.feast=1;let n=0;for(let i=0;i<2;i++)if(S.dishes.length<DISH_MAX){S.dishes.push("kimjang");n++}drawHomeTable();S.jeong=S.jeong||{};NB.forEach(q=>S.jeong[q.name]=(S.jeong[q.name]||0)+1);
    save();sfx("level");closeSheet();toast(`마을 김장 잔치! 김장김치 ${n}접시를 우리 평상에 올려 뒀어요 · 이웃 모두와 정 +1`)}}

/* ---------- 매 순간 ---------- */
function village2Frame(dt,now){fireFrame(dt,now);
  if(mode==="plaza")wishG.children.forEach(g=>g.rotation.z=Math.sin(now/700+g.userData.ph)*0.25);
  flowerT+=dt;if(flowerT>5){flowerT=0;if(mode==="plaza"||mode==="stream"){const k=Object.values(S.flowers||{}).filter(f=>Date.now()-f.t>=FLOWER_GROW).length;if(k!==village2Frame.bloomN){village2Frame.bloomN=k;drawFlowers()}}}
  if(mode==="hall")kjApply()}
