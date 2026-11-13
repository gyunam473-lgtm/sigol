/* 방앗간·보건소 살리기 (2026-11-13): "너무 텅 비고 할 게 없다"
   1) 방앗간: 떡메치기로 인절미 직접 만들기(쌀 1되 + 콩고물 30원 → 인절미 두 접시) · 하루 한 번 쌀가마 나르기 일손(품삯 + 가래떡)
   2) 보건소: 아침 건강 체조(해 뜰 녘 ~ 오전 11시, 어르신들과 같이 · 하루 한 번 몸이 가뿐 30분) · 건강 수첩(오늘 일한 양, 체조 도장)
   3) 낮엔 손님·동네 사람들이 서 있어요 (밤엔 집에 가요)
   숫자는 V4 */
const V4={tteokRice:1,gomulFee:30,tteokN:2,millHelpPay:60,chejoMin:30,stampGift:200};

// 하루에 한 번씩 재는 것: 오늘 땀방울 (건강 수첩)
function dayXp(){const d=dayKey(new Date());if(!S.dayXp||S.dayXp.d!==d)S.dayXp={d,x0:S.xp||0};return Math.max(0,(S.xp||0)-S.dayXp.x0)}

/* ---------- 떡메 ---------- */
// 떡메: 손잡이 끝(손)을 축으로 돌아요 (도끼와 같은 방식). 머리는 굵은 나무 통
function makeMallet(){const g=new THREE.Group(),h=cyl(0.02,0.024,0.66,0x9a7448,0,0,-0.33,6);h.rotation.x=Math.PI/2;g.add(h);
  const hd=cyl(0.11,0.11,0.34,0x8a6440,0,0,-0.66,10);hd.rotation.z=Math.PI/2;g.add(hd);
  [-0.15,0.15].forEach(x=>{const r=cyl(0.115,0.115,0.025,0x5a4430,x,0,-0.66,10);r.rotation.z=Math.PI/2;g.add(r)});return g}
CH.tteokme={name:"떡메치기",g:"down",guide:n=>`떡메를 번쩍 들었다가 떡 한가운데를 쿵! 내리쳐요 · ${n}번 남음`};
CH.gomul={name:"콩고물 묻히기",g:"rub",n:4,guide:n=>`노란 콩고물을 솔솔 뿌리며 굴려요 · ${n}번 남음`,pop:"솔솔",sfx:"scrape"};
CH.sseolgi={name:"썰기",g:"tap",guide:()=>"칼로 콕콕 한 입 크기로 썰어요"};

// 방앗간 마당 떡판 (정미기 왼쪽 앞)
const TP={x:-5.4,z:1.4};
const tteokPan=new THREE.Group();let tpDough,tpMallet; // poke() 가 userData 를 덮어써서 따로 둬요
(function(){tteokPan.add(box(1.5,0.16,0.9,0x9a7448,0,0.5,0));[-0.6,0.6].forEach(x=>[-0.3,0.3].forEach(z=>tteokPan.add(box(0.1,0.42,0.1,0x7a5a3a,x,0.21,z))));
  const d=cyl(0.28,0.3,0.1,0xf6f2e8,0,0.63,0,14);d.scale.z=0.75;tteokPan.add(d);tpDough=d;
  const m=makeMallet();m.position.set(0.55,0.62,0.25);m.rotation.set(-1.45,0.6,0);tteokPan.add(m);tpMallet=m;
  tteokPan.add(hitBox(1.7,1.0,1.1,0,0.5,0));tteokPan.position.set(TP.x,0,TP.z);mill.add(poke(tteokPan,()=>openTteokPan(),[TP.x+1.3,TP.z+1.2]))})();
// 쌀가마 더미 (일손 돕기)
const millSacks=hitBox(3.2,1.0,1.0,-6,0.5,-4.2);mill.add(poke(millSacks,()=>openMillHelp(),[-6,-2.9]));
addToPlace("mill",[tteokPan,millSacks],[[TP.x-0.85,TP.z-0.55,TP.x+0.85,TP.z+0.55]]);

function openTteokPan(){const r=S.inv.ssal||0,ok=r>=V4.tteokRice&&S.money>=V4.gomulFee;
  openSheet(`<h2>떡판 · 인절미 만들기</h2><p class="hint">찐 찹쌀밥을 떡판에 쏟고 떡메로 쿵떡쿵떡 → 콩고물 묻히기 → 썰기. 사 먹는 것보다 넉넉해요.</p>
    <div class="goods">${goods("인절미 직접 만들기",`쌀 ${V4.tteokRice}되 + 콩고물 ${V4.gomulFee}원 → 인절미 ${V4.tteokN}접시 · 가진 쌀 ${r}되`,`<button class="go" id="tpGo" ${ok?"":"disabled"}>만들기</button>`)}</div>
    <p class="hint">${r?"":"쌀은 논에서 거둬요. "}방앗간 아저씨가 시루에 쪄 주셔요</p>`);
  if($("tpGo"))$("tpGo").onclick=()=>{closeSheet();startTteok()}}
function startTteok(){if(PD||!((S.inv.ssal||0)>=V4.tteokRice)||S.money<V4.gomulFee)return;
  const T=new THREE.Vector3(TP.x,0.66,TP.z);let dough,pieces=[];
  tpDough.visible=false;tpMallet.visible=false; // 판 위 떡과 떡메는 숨기고 손에 든 걸로
  startChore(Object.assign(camAt(TP.x,0.7,TP.z,2.1,1.5),{steps:["tteokme","gomul","sseolgi"],chops:8,tool:"mallet",chopAt:()=>T.clone(),
    targets:()=>Array.from({length:5},(_,i)=>new THREE.Vector3(TP.x-0.3+i*0.15,0.7,TP.z)),
    setup(){dough=new THREE.Mesh(new THREE.SphereGeometry(0.26,18,12),new THREE.MeshLambertMaterial({color:0xf2eee2}));dough.scale.set(1,0.55,0.8);dough.position.copy(T);this.g.add(dough)},
    stepSetup(s){if(s!=="tteokme"&&this.axe)this.axe.visible=false},
    onChop(n){burst(0.14,260,0.35);tone(90,60,0.12,"sine",0.15);const k=n/8;dough.scale.set(1+k*0.45,0.55-k*0.25,0.8+k*0.3);dough.material.color.setHex(0xf2eee2).lerp(new THREE.Color(0xfaf8f2),k);
      const c=sp(T);wPop(c.x,c.y-70,n%2?"쿵!":"떡!")},
    onRub(s,k,need){dough.material.color.setHex(0xf2eee2).lerp(new THREE.Color(0xd8b860),Math.min(1,k/need));for(let i=0;i<4;i++){const d=sph(0.012,0xd8b860,TP.x+fr(-0.4,0.4),0.75,TP.z+fr(-0.25,0.25));d.castShadow=false;this.g.add(d)}},
    onTap(s,t){sfx("seed");const p=box(0.12,0.06,0.12,0xd8b860,t.p.x,0.62,TP.z+0.42);p.rotation.y=fr(-0.3,0.3);this.g.add(p);pieces.push(p);dough.scale.x*=0.84},
    onHold:noop,
    finish(){S.inv.ssal-=V4.tteokRice;S.money-=V4.gomulFee;let n=V4.tteokN,where;
      if(!S.hold){setHold("injeolmi");n--;where="한 접시는 들고, "}else where="";const k=toPantry("injeolmi",n);
      sweat(4);S.tteokMade=(S.tteokMade||0)+1;save();refresh();tpDough.visible=true;tpMallet.visible=true;
      endChore(`쫀득한 인절미 완성! ${where}${k?k+"접시는 찬장에":""} · 방앗간 아저씨: "떡메 솜씨 좋구먼!" · 지금까지 ${S.tteokMade}번`)}}))}

function openMillHelp(){const d=dayKey(new Date()),done=S.millHelpDay===d;
  openSheet(`<h2>방앗간 일손</h2><p class="hint">방앗간 아저씨: "쌀가마 좀 같이 옮겨 줄 텨? 허리 조심하고."</p>
    <div class="goods">${goods("쌀가마 나르기",done?"오늘은 다 옮겼어요. 내일 또 와요":`하루 한 번 · 쌀가마 셋 번쩍 · 품삯 ${V4.millHelpPay}원 + 갓 뽑은 가래떡`,`<button class="go" id="mhGo" ${done?"disabled":""}>돕기</button>`)}</div>`);
  if($("mhGo"))$("mhGo").onclick=()=>{closeSheet();startMillHelp()}}
function startMillHelp(){if(PD)return;const x=-5.2,z=-2.8;let sack=null;
  startChore(Object.assign(camAt(x,0.4,z,2.1,1.5),{steps:["gama","gama","gama"],
    stepSetup(){if(sack)this.g.remove(sack);sack=box(0.7,0.36,0.45,0xe8dcb0,x,0.2,z);this.g.add(sack)},
    onHolding(g){if(sack)sack.position.y=0.2+g*0.7},onHold(g){if(sack)sack.position.y=0.2},onTap:noop,onRub:noop,
    finish(){S.millHelpDay=dayKey(new Date());S.money+=V4.millHelpPay;const k=toPantry("garaetteok");save();refresh();
      endChore(`방앗간 아저씨: "고생했어! 이거 갓 뽑은 거여." 품삯 ${V4.millHelpPay}원`+(k?" · 가래떡 한 줄은 찬장에":""))}}))}

// 떡메 도구·떡 부스러기 색 (chore.js 가 PD.tool 을 봐요)
{const _mk=makeAxe;makeAxe=function(){return PD&&PD.tool==="mallet"?makeMallet():_mk()}}
{const _cc=chopChips;chopChips=function(){if(!PD||PD.tool!=="mallet")return _cc();const c=PD.chopAt();for(let i=0;i<8;i++){const m=sph(0.02,0xfaf8f2,c.x,c.y+0.05,c.z);m.castShadow=false;m.userData.v=new THREE.Vector3(fr(-1,1),fr(0.6,1.6),fr(-0.4,0.8));m.userData.t=0;PD.g.add(m);PD.chips.push(m)}}}

/* ---------- 보건소 아침 건강 체조 ---------- */
CH.chejo1={name:"팔 쭉 뻗기",g:"hold",guide:()=>"꾹 눌러 두 팔을 하늘로 쭈욱~ 초록 칸에서 떼며 후~",msgs:["시원하다~","조금 덜 뻗었어요","너무 힘줬어요"],miss:0.7};
CH.chejo2={name:"허리 돌리기",g:"rub",n:4,guide:n=>`좌우로 슥슥 허리를 돌려요 · 하나 둘 셋 넷 · ${n}번 남음`,pop:"으쌰",sfx:"scrape"};
CH.chejo3={name:"박수 치기",g:"tap",guide:()=>"동그라미를 콕콕, 짝짝짝 박수!"};
const CJ={x:0,z:2.6}; // 체조하는 자리 (보건소 마당 가운데)
function chejoTime(){const t=sunTimes(new Date()),h=hourNow();return h>=t.rise&&h<11}
const chejoMat=new THREE.Group();
(function(){for(let i=0;i<6;i++){const m=box(0.9,0.02,1.4,[0x6aa8c8,0xe8a8b8,0x9ac87a][i%3],-4+i*1.6,0.075,CJ.z);m.castShadow=false;chejoMat.add(m)}
  chejoMat.add(hitBox(10,0.6,1.8,0,0.3,CJ.z));clinic.add(poke(chejoMat,()=>openChejo(),[CJ.x+0.8,CJ.z+1.6]))})();
addToPlace("clinic",[chejoMat],[]);
// 체조 어르신들 + 앞에서 이끄는 사람
let cjPeople=null,v4Extras=null;
function makeV4People(){if(cjPeople||!me)return;
  const mk=(c,n,o,place,x,z,r)=>{const p=person(c,n,Object.assign({style:"nb"},o));scene.remove(p.g);p.g.position.set(x,0,z);p.g.rotation.y=r;place.add(p.g);p.name=n;return p};
  // 선생님은 보건소 쪽(앞)에서 마당을 보고, 어르신들은 선생님을 봐요
  cjPeople=[mk(0x5aa87a,"체조 선생님",{cap:0xf2f0ea},clinic,0,CJ.z-3.4,0)];
  [["윗집 할머니",0xc87a8a,{scarf:0xf2e6c8}],["뒷집 할아버지",0x7a8a6a,{hat:true,hair:0xdedad2}],["노인회장님",0x8a6a54,{cap:0x3a3428}],["앞집 할머니",0xa88ab8,{hat:false,hair:0xd8d4cc}],["옆마을 할머니",0xd89a6a,{scarf:0xe8d8c8}]]
    .forEach(([n,c,o],i)=>{const x=-4+(i<2?i:i+1)*1.6,p=mk(c,n,o,clinic,x,CJ.z,Math.PI);if(i%2)p.label.visible=false;cjPeople.push(p)});
  // 낮 손님: 방앗간 쌀자루 든 손님 둘, 보건소 앞 이야기 나누는 둘
  v4Extras=[];const sackOn=p=>{const s=box(0.42,0.5,0.3,0xe8dcb0,0,0.55,0.42);p.b.add(s)};
  const a=mk(0x8a7a5a,"떡 맞추러 온 아저씨",{cap:0x4a3a2a},mill,-1.4,-1.0,Math.PI),b=mk(0xb86a6a,"참기름 짜러 온 아주머니",{scarf:0xf2e6c8},mill,-2.3,-0.4,Math.PI-0.3);sackOn(a);sackOn(b);b.label.visible=false;
  const c=mk(0x6a7aa8,"동네 아저씨",{hat:true},clinic,-5.4,0.4,0.9),d=mk(0xd8a07a,"마실 온 할머니",{scarf:0xe8e0c8},clinic,-4.5,1.1,-2.2);d.label.visible=false;
  v4Extras.push({p:a,line:["방앗간 떡이 제일이여. 아저씨 손맛이 달러","햅쌀로 가래떡 뽑으러 왔지"]},{p:b,line:["참깨 볶는 냄새 좋지요?","떡메 쳐 봤어요? 저기 떡판에서 해 봐요"]},
    {p:c,line:["혈압 재러 왔어. 요즘 좀 짜게 먹었나 봐","보건소 선생님이 아주 친절해"]},{p:d,line:["아침 체조 나와요. 몸이 개운해져","무릎이 좀 쑤셔서 파스 받으러 왔지"]});
  v4Extras.forEach(e=>{e.p.g.userData={kind:"poke",poke:()=>{sfx("pop");toast(e.p.name+": \""+pickOne(e.line)+"\"")}}});
  addToPlace("mill",[a.g,b.g],[]);addToPlace("clinic",[c.g,d.g],[])}
function openChejo(){const d=dayKey(new Date()),done=S.chejoDay===d,t=sunTimes(new Date());
  if(!chejoTime()){toast("아침 건강 체조는 해 뜰 녘("+fmt12(t.rise)+")부터 오전 11시까지 해요"+(done?" · 오늘은 했어요":" · 내일 아침에 나와요"));return}
  openSheet(`<h2>아침 건강 체조</h2><p class="hint">체조 선생님: "자~ 오늘도 다 같이 몸 풀어요! 팔 뻗고, 허리 돌리고, 박수!"</p>
    <div class="goods">${goods("같이 하기",done?"오늘은 벌써 했어요. 내일 아침에 또 나와요":`하루 한 번 · ${V4.chejoMin}분 동안 몸이 가뿐(덜 지쳐요) · 체조 도장 ${S.chejoN||0}개 (다섯 개마다 선물)`,`<button class="go" id="cjGo" ${done?"disabled":""}>같이 하기</button>`)}</div>`);
  if($("cjGo"))$("cjGo").onclick=()=>{closeSheet();startChejo()}}
function startChejo(){if(PD)return;me.g.position.set(CJ.x-0.8,0,CJ.z);me.tx=me.g.position.x;me.tz=me.g.position.z;me.g.rotation.y=Math.PI;
  const F=new THREE.Vector3(me.g.position.x,1.2,CJ.z);
  startChore({steps:["chejo1","chejo2","chejo3"],zone:[0.6,0.85],kind:"chejo",focus:F,cam:new THREE.Vector3(F.x+1.2,2.3,F.z-3.0),look:new THREE.Vector3(F.x-0.2,1.1,F.z),
    targets:()=>Array.from({length:5},(_,i)=>new THREE.Vector3(F.x-0.4+i*0.2,1.3+Math.sin(i)*0.1,F.z-0.3)),
    stepSetup(s){me.pose=s;me.g.visible=true;me.label.visible=false;if(holdMesh)holdMesh.visible=false},onHolding(g){me.poseG=g},onHold(){me.poseG=0},onRub(){me.poseT=performance.now()},onTap(){sfx("pop");me.clap=performance.now()},
    finish(){delete me.pose;me.b.rotation.y=0;me.label.visible=true;if(holdMesh&&S.hold)holdMesh.visible=true;const d=dayKey(new Date());S.chejoDay=d;S.chejoN=(S.chejoN||0)+1;S.warmUntil=Math.max(S.warmUntil||0,Date.now()+V4.chejoMin*60000);sweat(3);
      let gift="";if(S.chejoN%5===0){S.money+=V4.stampGift;gift=` · 도장 ${S.chejoN}개! 보건소 선생님 선물 ${V4.stampGift}원`}
      save();refresh();endChore(`체조 선생님: "잘하셨어요!" 몸이 가뿐해요 · ${V4.chejoMin}분 동안 덜 지쳐요 · 체조 도장 ${S.chejoN}개${gift}`)}})}
// 내 팔: 체조 동작 (armsFrame 이 p.pose 가 있으면 이걸로)
function poseArms(p,t){if(!PD||PD.kind!=="chejo"){delete p.pose;p.label.visible=true;if(holdMesh&&S.hold)holdMesh.visible=true;return false}
  const s=p.pose,[l,r]=p.arms;
  if(s==="chejo1"){const g=p.poseG||0;l.rotation.x=r.rotation.x=-Math.PI*(0.3+0.65*g);l.rotation.z=-0.15;r.rotation.z=0.15}
  else if(s==="chejo2"){const k=Math.sin(t*4);p.b.rotation.y=k*0.35;l.rotation.x=r.rotation.x=-1.2;l.rotation.z=-0.6;r.rotation.z=0.6}
  else{const c=Math.max(0,1-(performance.now()-(p.clap||0))/250);p.b.rotation.y=0;l.rotation.x=r.rotation.x=-1.25;l.rotation.z=-0.5+c*0.45;r.rotation.z=0.5-c*0.45}
  return true}
{const _af=armsFrame;armsFrame=function(dt,now){_af(dt,now);if(me&&me.pose&&!poseArms(me,now/1000))me.b.rotation.y=0}}

function village4Frame(dt,now){if(!me)return;makeV4People();if(!cjPeople)return;
  const day=kjDaytime(),cj=chejoTime(),t=now/1000;
  if(mode==="clinic"){cjPeople.forEach((p,i)=>{p.g.visible=cj;if(!cj)return;
      // 다 같이 팔 올렸다 내렸다, 허리 좌우 (선생님이 조금 먼저)
      const ph=t*1.4+(i?0.25:0),up=(Math.sin(ph)+1)/2;p.arms.forEach((a,k)=>{a.rotation.x=-Math.PI*0.9*up;a.rotation.z=(k?1:-1)*(0.15+0.5*(1-up))});p.b.rotation.y=Math.sin(ph*0.5)*0.2})}
  v4Extras.forEach(e=>{const pl=e.p.g.parent===mill?"mill":"clinic";if(mode===pl)e.p.g.visible=day})}

/* ---------- 보건소 선생님 창에 건강 수첩 ---------- */
{const _oc=openClinic;openClinic=function(line){_oc(line);const g=sheet.querySelector(".goods");if(!g)return;const x=dayXp(),t=sunTimes(new Date());
  const tip=x>=150?"오늘 무리하셨어요. 모닥불 곁이나 평상에서 푹 쉬세요":x>=60?"부지런하시네요. 물 자주 드세요":"오늘은 몸이 가볍겠네요";
  g.insertAdjacentHTML("beforeend",goods("건강 수첩",`오늘 땀방울 ${x} · ${tip} · 체조 도장 ${S.chejoN||0}개`,`<button data-cjinfo="1">체조 안내</button>`));
  sheet.querySelector("[data-cjinfo]").onclick=()=>openClinic(chejoTime()?(S.chejoDay===dayKey(new Date())?"오늘 체조 하셨죠? 개운하시죠!":"지금 마당에서 아침 체조 해요. 매트를 눌러 같이 하세요!"):`아침 체조는 해 뜰 녘(${fmt12(t.rise)})부터 오전 11시까지예요. 다섯 번 나오시면 선물 드려요`)}}
{const _om=openMill;openMill=function(line){_om(line);const g=sheet.querySelector(".goods");if(!g)return;
  g.insertAdjacentHTML("beforeend",goods("떡메치기 · 일손",`마당 떡판에서 인절미 직접 만들기 · 쌀가마 더미를 누르면 일손 돕기(하루 한 번)`,`<button data-tpgo="1">떡판으로</button>`));
  sheet.querySelector("[data-tpgo]").onclick=()=>{closeSheet();go(TP.x+1.3,TP.z+1.2,{type:"poke",fn:openTteokPan})}}}
// 마을 지도 설명
PLACES.mill.sub="떡메치기로 인절미 만들기 · 쌀가마 나르기 일손 · 떡 뽑기 · 쌀 팔기";
PLACES.clinic.sub="아침 건강 체조(해 뜰 녘~11시) · 건강 수첩 · 하루 한 번 비타민";
