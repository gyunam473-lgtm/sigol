/* 모닥불 간식 · 곤충 채집 과제 · 제대로 하는 김장 (2026-11-13)
   1) 모닥불 간식: 분교 선생님한테 마시멜로를 사서, 운동장 모닥불 통나무에 앉아 꼬챙이에 꽂아 구워 먹어요.
      고구마·감자는 은박지에 싸서 잿불에 묻어 구워요. 꾹 누르고 있다가 알맞게 익었을 때(초록 칸) 떼기. 늦으면 타요
   2) 곤충 채집 과제: 분교 선생님이 날마다 과제 세 개를 내줘요(몇 마리 잡기 · 큰 것 잡기 · 귀한 것 잡기).
      다 하면 품삯과 칭찬 도장. 도장 다섯 개마다 큰 선물(좋은 잠자리채 → 초록 칸이 넓어져요)
   3) 김장: 다듬기 → 반 가르기 → 소금 치기 → 소금물에 절이기 → (어제 절여 둔 배추로) 헹구기 → 무채 썰기 → 양념 넣기
      → 버무리기 → 속 넣기 → 겉잎으로 싸서 김치통에. 한 포기를 끝까지 해야 해요. 끝나면 수육 쌈 한 입 */

/* ================= 1) 모닥불 간식 ================= */
const ROAST={
  marsh:{name:"마시멜로",item:"marsh",ok:"s_marsh",bad:"tan_marsh",zone:[0.55,0.74],sec:2.4,guide:"꼬챙이를 불 가까이 대고 꾹 누르고 있다가, 노릇노릇해지면(초록 칸) 떼요",
    msgs:["노릇노릇 딱 좋아요!","아직 하얘요. 조금 더 구워요","앗, 까맣게 탔어요!"]},
  goguma:{name:"고구마",item:"goguma",ok:"gun_goguma",bad:"tan_goguma",zone:[0.6,0.82],sec:4.5,peel:true,guide:"은박지에 싼 고구마를 잿불에 묻고 꾹… 속까지 익으면(초록 칸) 꺼내요",
    msgs:["속까지 말랑하게 익었어요!","아직 속이 딱딱해요","껍질이 너무 탔어요"]},
  potato:{name:"감자",item:"potato",ok:"gun_gamja",bad:"tan_goguma",zone:[0.6,0.82],sec:4,peel:true,guide:"은박지에 싼 감자를 잿불에 묻고 꾹… 포슬포슬해지면(초록 칸) 꺼내요",
    msgs:["포슬포슬 잘 익었어요!","아직 속이 서걱해요","껍질이 너무 탔어요"]}};
CH.roast={name:"굽기",g:"hold",guide:()=>PD&&PD.roastGuide||"",msgs:["",""],miss:0.3,over:"너무 오래 뒀어요. 까맣게 탔어요"};
CH.peel={name:"껍질 벗기기",g:"rub",n:3,guide:n=>`앗 뜨거! 호호 불며 은박지와 껍질을 슥슥 벗겨요 · ${n}번 남음`,pop:"호호",sfx:"scrape"};
// 모닥불 곁 자리 창에 "구워 먹기" 줄 더하기
{const fp=firePanel,fb=fireBind;
  firePanel=function(){let h=fp();const have=Object.keys(ROAST).filter(k=>(S.inv[ROAST[k].item]||0)>0);
    h+=`<h3>모닥불에 구워 먹기</h3><div class="roastrow">${Object.entries(ROAST).map(([k,r])=>`<button class="${have.includes(k)?"go":""}" data-roast="${k}" ${have.includes(k)?"":"disabled"}>${r.name}<small>${S.inv[r.item]||0}개</small></button>`).join("")}</div>`;
    if(!(S.inv.marsh>0))h+=`<p class="hint">마시멜로는 분교 선생님이 팔아요 · 고구마·감자는 밭에서 캐요</p>`;return h};
  fireBind=function(){fb();document.querySelectorAll("[data-roast]").forEach(b=>b.onclick=()=>startRoast(b.dataset.roast))}}
Object.keys(FIRE_LOGS).forEach(i=>{const s=FREE_SEATS["fireLog"+i];if(s){s.panel=()=>firePanel();s.bind=()=>fireBind()}});
function startRoast(k){const r=ROAST[k];if(!SIT||!(S.inv[r.item]>0))return;if(fireLv()<0.2){toast("불이 너무 약해요. 장작을 하나 넣고 구워요");return}
  const F=new THREE.Vector3(FIRE.x,0,FIRE.z),me0=SIT.seat.clone(),dir=F.clone().sub(me0).setY(0).normalize(),tip=F.clone().addScaledVector(dir,-1.9).add(new THREE.Vector3(0,r.peel?0.12:0.9,0));
  let food;const raw=new THREE.Color(k==="marsh"?0xf6f4ee:0xb8bcc0),gold=new THREE.Color(k==="marsh"?0xd8a040:0xa8a8a8),burnt=new THREE.Color(0x2a1a10);
  startChore({steps:r.peel?["roast","peel"]:["roast"],zone:r.zone,holdSec:r.sec,roastGuide:r.guide,focus:tip.clone(),
    cam:me0.clone().addScaledVector(dir,0.6).add(new THREE.Vector3(dir.z*0.9,1.2,-dir.x*0.9)),look:tip.clone().add(new THREE.Vector3(0,-0.1,0)),
    setup(){if(k==="marsh"){const st=cyl(0.01,0.012,1.5,0x8a6a48,0,0,0,5);st.position.copy(tip).addScaledVector(dir,-0.7);st.lookAt(tip);st.rotateX(Math.PI/2);this.g.add(st);
        food=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.09,14),new THREE.MeshLambertMaterial({color:raw}));food.position.copy(tip);food.lookAt(tip.clone().add(dir));food.rotateX(Math.PI/2);this.g.add(food)}
      else{food=new THREE.Mesh(new THREE.SphereGeometry(0.09,12,8),new THREE.MeshPhongMaterial({color:raw,shininess:80}));food.scale.set(1.6,0.8,1);food.position.copy(tip);this.g.add(food)}},
    onHolding(g){const c=g<0.65?raw.clone().lerp(gold,g/0.65):gold.clone().lerp(burnt,Math.min(1,(g-0.65)/0.3));food.material.color.copy(c);if(Math.random()<0.2)burst(0.03,2600,0.03)},
    onHold(g){const ok=g>=r.zone[0]&&g<=r.zone[1];this.res=ok?"ok":g<r.zone[0]?"raw":"burnt";const m=r.msgs[ok?0:g<r.zone[0]?1:2];setTimeout(()=>{const c=sp(tip);wPop(c.x,c.y-50,m)},50);
      if(r.peel&&this.res!=="burnt"){food.material.color.set(k==="goguma"?0xe8a83a:0xf2e0a0)}},
    onRub(s,n,need){food.scale.multiplyScalar(0.97)},onTap:noop,
    finish(){S.inv[r.item]--;const res=this.res||"burnt",id=res==="ok"?r.ok:(k==="marsh"?r.bad:res==="raw"?"tan_goguma":r.bad);save();refresh();
      endChore("");const tmp=dish3D(id);tmp.position.copy(me.g.localToWorld(new THREE.Vector3(0,me.b.position.y+0.95,0.42)));scene.add(tmp);
      playEat({dish:tmp,id,onDone:()=>{scene.remove(tmp);const ex=nourish(id);sfx("pop");const msg=res==="ok"?pickOne([`${dishName(id)}! 호호 불며 먹으니 꿀맛이에요`,`${dishName(id)}, 달고 뜨끈해요`]):`${josa(dishName(id),"을","를")} 먹었어요. 다음엔 더 잘 구워 봐요`;toast(msg+(ex?" · "+ex:""));if(SIT)renderFreeSit()}})}})}
// 구운 것 모양
DISH.s_marsh=g=>{g.add(cyl(0.006,0.006,0.3,0x8a6a48,0,0.12,0,5));const m=cyl(0.05,0.05,0.08,0xd8a040,0,0.28,0,12);g.add(m)};
DISH.tan_marsh=g=>{g.add(cyl(0.006,0.006,0.3,0x8a6a48,0,0.12,0,5));g.add(cyl(0.05,0.05,0.08,0x2a1a10,0,0.28,0,12))};
DISH.gun_goguma=g=>{g.add(plateMesh());const s=sph(0.07,0x8a2a3a,0,0.06,0);s.scale.set(1.8,0.8,1);g.add(s);const y=sph(0.065,0xe8a83a,0.06,0.075,0);y.scale.set(1.2,0.7,0.9);g.add(y)};
DISH.tan_goguma=g=>{g.add(plateMesh());const s=sph(0.07,0x5a2a2a,0,0.06,0);s.scale.set(1.8,0.8,1);g.add(s)};
DISH.gun_gamja=g=>{g.add(plateMesh());for(let i=0;i<2;i++){const s=sph(0.06,0xd8c080,(i-0.5)*0.12,0.06,0);s.scale.set(1.2,0.9,1);g.add(s)}g.add(sph(0.012,0xffffff,0.02,0.11,0))};
DISH.suyuk=g=>{g.add(plateMesh(0.19));for(let i=0;i<5;i++){const b=box(0.08,0.02,0.05,0xd8b8a8,-0.08+i*0.04,0.045+i*0.004,-0.03);b.rotation.y=0.3;g.add(b);g.add(box(0.08,0.006,0.012,0x8a6a5a,-0.08+i*0.04,0.056+i*0.004,-0.03))}
  for(let i=0;i<3;i++){const l=leafPiece(T.kimchi(),0.08,0.12);l.position.set(0.06+i*0.02,0.05+i*0.008,0.06);g.add(l)}};

/* ================= 2) 곤충 채집 과제 ================= */
const BUGQ_PAY={count:80,size:150,rare:300};
function bugQuests(){const d=dayKey(new Date());if(S.bugQ&&S.bugQ.day===d)return S.bugQ.list;
  const se=seasonOf(new Date()),L=Object.entries(INSECTS).filter(([k,b])=>b.season.includes(se)),rnd=a=>a[Math.floor(Math.random()*a.length)];
  const common=L.filter(([k,b])=>b.w>=15),mid=L.filter(([k,b])=>b.w>=8),rare=L.filter(([k,b])=>b.w<10).concat(L.filter(([k,b])=>b.w<15));
  const list=[];const c=rnd(common.length?common:L);list.push({t:"count",k:c[0],n:3,got:0});
  const z=rnd(mid.length?mid:L);const [a,b]=INSECTS[z[0]].cm;list.push({t:"size",k:z[0],n:1,got:0,min:Math.round((a+(b-a)*0.7)*10)/10});
  const r=rnd(rare.length?rare:L);if(r[0]!==c[0])list.push({t:"rare",k:r[0],n:1,got:0});else list.push({t:"count",k:rnd(L)[0],n:2,got:0});
  S.bugQ={day:d,list};save();return list}
const questText=q=>{const B=INSECTS[q.k],when=B.time==="night"?"밤에 ":"";return q.t==="size"?`${when}${B.name} ${q.min}cm 넘는 걸로 한 마리`:q.t==="rare"?`${when}귀한 ${B.name} 한 마리`:`${when}${B.name} ${q.n}마리`};
const questWhere=q=>INSECTS[q.k].where.map(w=>PLACES[w].name).join("·");
// 잡을 때마다 (grind.js 의 catchBug 다음에 불러요)
function bugQuestCatch(k,cm){const L=bugQuests();let msg="";L.forEach(q=>{if(q.done||q.k!==k)return;if(q.t==="size"&&cm<q.min){msg=msg||`과제: ${INSECTS[k].name} ${q.min}cm 넘어야 해요 (이건 ${cm}cm)`;return}
  q.got++;if(q.got>=q.n){q.done=true;msg=`과제 다 했어요! "${questText(q)}" · 분교 선생님께 가면 칭찬 도장`;sfx("level")}else msg=msg||`과제: ${INSECTS[k].name} ${q.got}/${q.n}`});
  if(msg){save();setTimeout(()=>toast(msg),1800)}}
const bugLvBonus=()=>(S.bugNet?0.04:0); // 좋은 잠자리채: 초록 칸 넓게
function questHtml(){const L=bugQuests(),st=S.bugStamp||0;
  return `<h3>오늘의 채집 과제 · 칭찬 도장 ${st}개 ${"●".repeat(st%5)}${"○".repeat(5-st%5)}</h3>`+L.map((q,i)=>`<div class="good"><div class="gname">${questText(q)}<small>${questWhere(q)} · ${q.got}/${q.n} · 품삯 ${BUGQ_PAY[q.t]}원${q.claimed?" · 받았어요":""}</small></div><div class="gbtn">${q.done&&!q.claimed?`<button class="go" data-bq="${i}">도장 받기</button>`:q.claimed?"✔":""}</div></div>`).join("")+
    `<p class="hint">도장 다섯 개마다 선생님이 큰 선물을 줘요 · 과제는 날마다 바뀌어요</p>`}
// 분교 선생님 창: 과제 + 마시멜로 + 곤충 사 주기
{const ot=openTeacher;openTeacher=function(line){ot(line);
  const box=document.createElement("div");box.innerHTML=`<div class="goods">${questHtml()}</div><h3>간식</h3><div class="goods">${goods("마시멜로 한 봉지",`5개 100원 · 운동장 모닥불에 구워 먹어요 · 가진 것 ${S.inv.marsh||0}개`,`<button class="go" id="buyMarsh" ${S.money>=100?"":"disabled"}>사기</button>`)}</div>`;
  sheet.querySelector(".talkhead").after(box);
  sheet.querySelectorAll("[data-bq]").forEach(b=>b.onclick=()=>{const q=bugQuests()[+b.dataset.bq];if(!q||!q.done||q.claimed)return;q.claimed=true;S.money+=BUGQ_PAY[q.t];S.bugStamp=(S.bugStamp||0)+1;sweat(2);let ex="";
    if(S.bugStamp%5===0){if(!S.bugNet){S.bugNet=1;ex=" · 선물로 좋은 잠자리채를 줬어요! 이제 초록 칸이 넓어요"}else{S.money+=500;ex=" · 칭찬 도장 다섯 개! 상금 500원"}}
    sfx("coin");save();refresh();openTeacher(`참 잘했어요! 칭찬 도장 꾹${ex}`)});
  if($("buyMarsh"))$("buyMarsh").onclick=()=>{if(S.money<100)return;S.money-=100;S.inv.marsh=(S.inv.marsh||0)+5;sfx("coin");save();refresh();openTeacher("마시멜로는 너무 불에 대면 금방 타요. 노릇할 때 꺼내요!")}}}

/* ================= 3) 제대로 하는 김장 ================= */
Object.assign(CH,{
  kdadeum:{name:"배추 다듬기",g:"tap",guide:()=>"누렇게 시든 겉잎을 콕콕 떼어 내요"},
  kgareugi:{name:"반 가르기",g:"down",guide:()=>"칼을 들어 배추 한가운데를 위에서 아래로 쓱 내려 반으로 갈라요"},
  ksogeum:{name:"소금 치기",g:"tap",guide:()=>"잎 사이사이 굵은소금을 콕콕 뿌려요"},
  kjeorim:{name:"소금물에 절이기",g:"hold",guide:()=>"배추를 소금물 대야에 꾹 눌러 담가요. 푹 잠기면(초록 칸) 떼요",msgs:["푹 잠겼어요! 하룻밤 절여 둬요","덜 잠겼어요. 그래도 괜찮아요","물이 넘쳤어요"]},
  khengu:{name:"헹구기",g:"rub",n:4,guide:n=>`어제 절여 둔 배추를 맑은 물에 슥슥 헹궈요 · ${n}번 남음`,pop:"찰방",sfx:"pour"},
  kmuchae:{name:"무채 썰기",g:"rub",n:6,guide:n=>`무를 칼로 슥슥 가늘게 채 썰어요 · ${n}번 남음`,pop:"사각",sfx:"scrape"},
  kyang:{name:"양념 넣기",g:"tap",guide:()=>"고춧가루·젓갈·다진 마늘·쪽파를 콕콕 큰 대야에 넣어요"},
  kbeomuri:{name:"버무리기",g:"rub",n:5,guide:n=>`고무장갑 끼고 무채와 양념을 슥슥 버무려요 · ${n}번 남음`,pop:"척척",sfx:"scrape"},
  ksok:{name:"속 넣기",g:"tap",guide:()=>"배춧잎을 한 장씩 들추며 사이사이 빨간 속을 콕콕 넣어요"},
  kssagi:{name:"싸서 담기",g:"tap",guide:()=>"겉잎으로 돌돌 감싸서 김치통에 차곡차곡 담아요"}});
const KJ_STEPS=["kdadeum","kgareugi","ksogeum","kjeorim","khengu","kmuchae","kyang","kbeomuri","ksok","kssagi"];
const KJ_TALK={kgareugi:["속이 노랗게 꽉 찼네!","배추가 실하다"],kjeorim:["간은 절이는 게 반이여","어제 절인 거 갖다 줄게"],kmuchae:["무채는 가늘수록 맛있어","손 조심혀"],kbeomuri:["고춧가루 아끼지 마","간 좀 봐 봐, 짜?"],ksok:["사이사이 골고루!","잘한다, 시집와도 되겄네 허허"],kssagi:["김치통 꽉꽉 눌러 담아","올겨울 반찬 걱정 끝이네"]};
function startKimjangWork(){const st=pickOne(KJ_STATIONS),C=new THREE.Vector3(KJ_C.x+st[0],0.12,KJ_C.z+st[1]);
  const O={cab:C.clone(),salt:C.clone().add(new THREE.Vector3(-0.75,0,-0.1)),wash:C.clone().add(new THREE.Vector3(0.75,0,-0.1)),bowl:C.clone().add(new THREE.Vector3(0,0,-0.6)),board:C.clone().add(new THREE.Vector3(-0.15,0,0.45)),tong:C.clone().add(new THREE.Vector3(0.75,0,0.45))};
  let whole,halves=[],withered=[],mu,muchae=[],mix,leaves=[],tong,sokN=0;
  const tub=(p,c,w)=>{const g=new THREE.Group(),side=new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.28,0.2,16,1,true),new THREE.MeshLambertMaterial({color:c,side:THREE.DoubleSide}));side.position.y=0.1;g.add(side);g.add(cyl(0.28,0.28,0.01,c,0,0.005,0,16));g.add(cyl(0.31,0.31,0.01,w,0,0.12,0,16));g.position.copy(p);return g}; // 위가 열린 고무 대야
  startChore({steps:KJ_STEPS.slice(),chops:1,focus:C.clone(),cam:C.clone().add(new THREE.Vector3(0.1,1.35,1.35)),look:C.clone().add(new THREE.Vector3(0,-0.05,-0.12)),
    chopAt:()=>C.clone().add(new THREE.Vector3(0,0.22,0)),
    setup(){const g=this.g;g.add(tub(O.salt,0xc8322a,0xd8e8e8));g.add(tub(O.wash,0x3f6fa8,0x8fc8e0));g.add(tub(O.bowl,0xc8322a,0xd8d0c0));
      const bd=box(0.42,0.04,0.26,0xc8a070,O.board.x,0.14,O.board.z);g.add(bd);
      whole=new THREE.Group();{const b=sph(0.17,0x9ac078,0,0.17,0);b.scale.set(1,1.05,1.1);whole.add(b);const t=sph(0.12,0xe6f2c6,0,0.27,0);t.scale.set(1,0.6,1.1);whole.add(t);for(let i=0;i<5;i++){const l=sph(0.1,0x7aa858,Math.cos(i*1.3)*0.12,0.12,Math.sin(i*1.3)*0.12);l.scale.set(1,1.3,0.4);l.rotation.y=-i*1.3;whole.add(l)}}whole.position.copy(O.cab).add(new THREE.Vector3(0,0.05,0));g.add(whole);
      for(let i=0;i<3;i++){const l=sph(0.07,0xb8a850,0,0,0);l.scale.set(1,0.25,1.4);const a=i*2.1;l.position.copy(O.cab).add(new THREE.Vector3(Math.cos(a)*0.17,0.18,Math.sin(a)*0.17));l.rotation.y=a;g.add(l);withered.push(l)}
      tong=new THREE.Group();tong.add(box(0.36,0.22,0.26,0xe8ecf0,0,0.11,0));tong.add(box(0.37,0.03,0.27,0x3f8f5a,0,0.235,0));tong.position.copy(O.tong);g.add(tong);
      [["고춧가루",0xc0392b],["젓갈",0x8a6a4a],["다진 마늘",0xf2ead6],["쪽파",0x5d9a3e]].forEach(([n,c],i)=>{const j=cyl(0.05,0.05,0.1,c,O.bowl.x-0.45+i*0.3,0.17,O.bowl.z-0.3,10);j.userData.jar=i;g.add(j)});
      toast("김장 시작! 아주머니: \"한 포기 끝까지 해 봐. 내가 옆에서 봐 줄게\"")},
    targets:s=>{if(s==="kdadeum")return withered.map(l=>l.position.clone());if(s==="ksogeum")return [-0.24,-0.1,0.1,0.24].map(dx=>O.cab.clone().add(new THREE.Vector3(dx,0.2,0.02)));
      if(s==="kyang")return [0,1,2,3].map(i=>new THREE.Vector3(O.bowl.x-0.45+i*0.3,0.27,O.bowl.z-0.3));if(s==="ksok")return [-0.25,-0.09,0.09,0.25].map(dx=>O.cab.clone().add(new THREE.Vector3(dx,0.2,0.02)));
      if(s==="kssagi")return [O.cab.clone().add(new THREE.Vector3(0,0.2,0))];return [O.cab.clone()]},
    stepSetup(s){const talk=KJ_TALK[s];if(talk)setTimeout(()=>toast(pickOne(["부녀회장님","옆마을 할머니","김장 품앗이 아주머니","이장님 사모님"])+": \""+pickOne(talk)+"\""),400);
      if(s==="khengu"){halves.forEach(h=>{h.scale.set(1.1,0.8,1.1);h.children.forEach(c=>c.material&&c.material.color&&c.material.color.multiplyScalar(0.95))})} // 어제 절인 배추는 숨이 죽어 있어요
      if(s==="kmuchae"){mu=cyl(0.06,0.06,0.3,0xf2f0e8,O.board.x,0.22,O.board.z,12);mu.rotation.z=Math.PI/2;this.g.add(mu)}
      if(s==="kyang"){mix=cyl(0.29,0.29,0.03,0xf2f0e8,O.bowl.x,O.bowl.y+0.14,O.bowl.z,16);this.g.add(mix)}},
    onTap(s,t,n){const g=this.g;
      if(s==="kdadeum"){const l=withered.find(w=>w.position.distanceTo(t.p)<0.01);if(l)g.remove(l);sfx("pluck")}
      if(s==="ksogeum"){sfx("seed");for(let i=0;i<10;i++)g.add(sph(0.008,0xffffff,t.p.x+fr(-0.04,0.04),t.p.y+fr(-0.02,0.02),t.p.z+fr(-0.03,0.03)))}
      if(s==="kyang"){sfx("pour");const c=[0xc0392b,0x8a6a4a,0xf2ead6,0x5d9a3e][n-1];mix.material=mix.material.clone();mix.material.color.lerp(new THREE.Color(c),0.5)}
      if(s==="ksok"){sokN++;sfx("pluck");const r=box(0.12,0.012,0.05,0xb8281a,t.p.x,t.p.y,t.p.z);r.rotation.y=fr(-0.3,0.3);g.add(r)}
      if(s==="kssagi"){sfx("pop");halves.forEach(h=>{h.position.copy(O.tong).add(new THREE.Vector3(0,0.28,0));h.scale.setScalar(0.7)})}},
    onChop(n){sfx("chop");const g=this.g;g.remove(whole);halves=[-1,1].map(d=>{const h=cabbageHalf();h.scale.setScalar(1.25);h.position.copy(O.cab).add(new THREE.Vector3(d*0.17,0.02,0));g.add(h);return h});const c=sp(this.focus);wPop(c.x,c.y-50,"쩍! 속이 노래요")},
    onHolding(gv){halves.forEach((h,i)=>{h.position.lerpVectors(O.cab.clone().add(new THREE.Vector3((i?1:-1)*0.17,0.02,0)),O.salt.clone().add(new THREE.Vector3((i?1:-1)*0.08,0.0,0)),Math.min(1,gv*1.4))})},
    onHold(){halves.forEach((h,i)=>h.position.copy(O.cab).add(new THREE.Vector3((i?1:-1)*0.17,0.02,0)))},
    onRub(s,n,need){const g=this.g;
      if(s==="khengu"){for(let i=0;i<5;i++)g.add(sph(0.012,0x9fd0f0,O.wash.x+fr(-0.2,0.2),0.25+fr(0,0.1),O.wash.z+fr(-0.2,0.2)))}
      if(s==="kmuchae"){mu.scale.y=1-0.8*n/need;mu.position.x=O.board.x-0.12*n/need;for(let i=0;i<4;i++){const c=box(0.12,0.006,0.006,0xf6f4ec,O.board.x+0.1+fr(-0.05,0.05),0.17+muchae.length*0.002,O.board.z+fr(-0.08,0.08));c.rotation.y=fr(-0.4,0.4);g.add(c);muchae.push(c)}}
      if(s==="kbeomuri"){mix.material.color.lerp(new THREE.Color(0xb8281a),0.35);mix.position.y=O.bowl.y+0.15;muchae.forEach(c=>{c.material=mix.material;c.position.set(O.bowl.x+fr(-0.2,0.2),O.bowl.y+0.17,O.bowl.z+fr(-0.2,0.2))})}},
    finish(){const K=(S.kj=S.kj||{})[kjKey()]=(S.kj||{})[kjKey()]||{mine:0},q=avg(this.scores);K.mine+=5;K.made=(K.made||0)+1;sweat(6);
      let home="";if(S.dishes.length<DISH_MAX){S.dishes.push("kimjang");drawHomeTable();home=" · 내가 담근 김장김치 한 접시를 우리 평상에 올려 뒀어요"}
      const day=new Date().toDateString(),feed=K.suyuk!==day;if(feed)K.suyuk=day;save();
      endChore(`배추 한 포기 김장 끝! (+5포기, 마을 김장 ${kjTotal()}/${KJ.goal})`+(q>0.85?" · 솜씨가 좋다고 칭찬받았어요":"")+home);
      if(feed)setTimeout(()=>{const tmp=dish3D("suyuk");tmp.position.copy(me.g.localToWorld(new THREE.Vector3(0,me.b.position.y+0.95,0.42)));scene.add(tmp);toast("아주머니가 갓 버무린 김치에 수육 한 점을 싸서 입에 쏙!");
        playEat({dish:tmp,id:"suyuk",onDone:()=>{scene.remove(tmp);nourish("suyuk");toast("아삭아삭 매콤달콤… 김장하는 날은 이 맛이지! 든든함 가득")}})},900)}})}
