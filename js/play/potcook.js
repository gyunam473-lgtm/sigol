/* 가마솥 냄비 요리 (2026-11-13): 냇가·뒷산에서 얻은 걸로 끓이고 쑤어요
   - 민물 매운탕(잡은 고기 1 + 감자 1) · 다슬기국(다슬기 8) · 재첩국(재첩 6):
     불 지피기 → 솥에 넣기(끌기, 솥뚜껑 열고 물 끓는 데에) → 양념(국물 색이 점점 변해요) → 보글보글 끓이기(때 맞추기, 너무 오래면 졸아요) → 국자로 그릇에 → 고명
   - 도토리묵(도토리 4): 불 지피기 → 앙금물 솥에 붓기 → 묵 쑤기(빙글빙글, 점점 걸쭉하고 짙게) → 굳혀서 썰기(칼 콕콕) → 양념장
   부뚜막 손동작(cook.js 의 CS)은 그대로 쓰고, 이 요리들일 때만 모양·안내를 바꿔요 */
const POT={
  maeuntang:{broth0:0xc8d4d8,broth:0xb8401a,bits:"fish",msg:["얼큰하게 잘 끓었어요!","조금 덜 끓었지만 괜찮아요","국물이 졸았어요"]},
  daseulgi_guk:{broth0:0xc8d4d8,broth:0x8aa860,bits:"daseulgi",msg:["파르스름하게 우러났어요!","조금 덜 우러났지만 괜찮아요","국물이 졸았어요"]},
  jaecheop_guk:{broth0:0xc8d4d8,broth:0xe8e4d2,bits:"jaecheop",msg:["뽀얗게 우러났어요!","조금 덜 우러났지만 괜찮아요","국물이 졸았어요"]},
  dotori_muk:{muk:true}};
const isPot=()=>CK&&POT[CK.id];
// 매운탕 거리: 망태에 든 민물고기 중 제일 많은 것 (송사리는 너무 작고, 황금 잉어는 아까워서 빼요)
const TANG_FISH=["pirami","bungeo","kkeokji","megi","ssogari","baemjang"];
function tangFish(){let best=null;TANG_FISH.forEach(k=>{if((S.inv[k]||0)>0&&(!best||S.inv[k]>S.inv[best]))best=k});return best}
RECIPES.push(
  {id:"maeuntang",name:"민물 매운탕",fill:55,drink:25,desc:"냇가에서 잡은 고기에 감자 숭덩, 고춧가루 팍팍. 얼큰하게",get need(){return {[tangFish()||"bungeo"]:1,potato:1}}},
  {id:"daseulgi_guk",name:"다슬기국",need:{daseulgi:8},fill:35,drink:35,desc:"된장 풀고 부추 송송. 파르스름한 해장국"},
  {id:"jaecheop_guk",name:"재첩국",need:{jaecheop:6},fill:30,drink:40,desc:"뽀얀 국물이 속을 시원하게"},
  {id:"dotori_muk",name:"도토리묵",need:{dotori:4},fill:30,desc:"도토리 앙금을 쑤어 굳혀서 양념장 콕"});
Object.assign(RECIPE_STEPS,{maeuntang:["fire","potin","season","tteum","plate","garnish"],daseulgi_guk:["fire","potin","season","tteum","plate","garnish"],
  jaecheop_guk:["fire","potin","season","tteum","plate","garnish"],dotori_muk:["fire","anchi","ssugi","gutigi","garnish"]});
Object.assign(STEP_ALIAS,{maeuntang:{tteum:"보글보글 끓이기",plate:"그릇에 담기"},daseulgi_guk:{tteum:"보글보글 끓이기",plate:"그릇에 담기"},jaecheop_guk:{tteum:"보글보글 끓이기",plate:"그릇에 담기"},
  dotori_muk:{anchi:"앙금물 붓기",garnish:"양념장 올리기"}});
Object.assign(SEASON_JARS,{maeuntang:[["고춧가루",0xc0392b],["다진 마늘",0xf2ead6],["고추장",0xa8281a]],daseulgi_guk:[["된장",0x8a6a3a],["다진 마늘",0xf2ead6]],jaecheop_guk:[["소금",0xf4f4f0],["다진 마늘",0xf2ead6]]});
Object.assign(GARNISH,{maeuntang:[0x5d9a3e,0xc0392b],daseulgi_guk:[0x5d9a3e],jaecheop_guk:[0x5d9a3e],dotori_muk:[0xa8281a,0x5d9a3e,0x2a2a2a]});
Object.assign(GARNISH_NAME,{maeuntang:"쑥갓·송송 고추",daseulgi_guk:"송송 부추",jaecheop_guk:"송송 부추",dotori_muk:"양념장·쪽파·김가루"});
Object.assign(REST,{potin:"보글보글…",ssugi:"굳는 동안 잠깐…"});
SPOON_FOOD.push("maeuntang","daseulgi_guk","jaecheop_guk");

// 솥에 넣을 것 모양
function potIngredient(id){const g=new THREE.Group();
  if(id==="maeuntang"){for(let i=0;i<4;i++){const f=sph(0.05,0xb8c0c4,(i-1.5)*0.07,0.03,0);f.scale.set(1.6,0.5,0.7);g.add(f)}for(let i=0;i<4;i++)g.add(box(0.04,0.04,0.04,0xe8d098,fr(-0.1,0.1),0.02,0.08))}
  else if(id==="daseulgi_guk")for(let i=0;i<12;i++){const c=cone(0.012,0.04,0x2a3a2a,fr(-0.08,0.08),0.02,fr(-0.06,0.06),6);c.rotation.z=fr(-1,1);g.add(c)}
  else for(let i=0;i<10;i++){const s=sph(0.022,0x6a5a48,fr(-0.08,0.08),0.012,fr(-0.06,0.06));s.scale.y=0.45;g.add(s)}
  return g}
function soupBits(id){const g=new THREE.Group(),b=POT[id].bits;
  for(let i=0;i<(b==="fish"?6:12);i++){const x=fr(-0.18,0.18),z=fr(-0.15,0.15);let m;
    if(b==="fish")m=i%2?box(0.06,0.025,0.04,0xe8dcc8,x,0,z):box(0.045,0.035,0.045,0xe8d098,x,0,z);
    else if(b==="daseulgi")m=sph(0.012,0x2a3a2a,x,0,z);else{m=sph(0.02,0x6a5a48,x,0,z);m.scale.y=0.45}
    m.castShadow=false;g.add(m)}return g}
const liftLid=()=>tw(0.4,e=>{stoveLid.position.y=0.95+0.5*e;stoveLid.position.x=-0.45-0.5*e;stoveLid.rotation.z=0.9*e},null);
const closeLid=()=>{const y0=stoveLid.position.y,x0=stoveLid.position.x,r0=stoveLid.rotation.z;tw(0.4,e=>{stoveLid.position.y=lerp(y0,0.95,e);stoveLid.position.x=lerp(x0,-0.45,e);stoveLid.rotation.z=lerp(r0,0,e)},null)};

/* ---------- 새 손동작 ---------- */
CS.potin={name:"솥에 넣기",focus:"mid",g:"drag",src:()=>CK.ing,lift:1.15,to:()=>P_PAN,
  tags:()=>[[()=>vpos(CK.ing),{maeuntang:"손질한 "+(ITEMS[tangFish()]||{name:"고기"}).name+" · 감자",daseulgi_guk:"해감한 다슬기",jaecheop_guk:"해감한 재첩"}[CK.id]],[P_PAN,"가마솥 (물이 끓어요)"]],
  guide:()=>({maeuntang:"손질한 고기와 숭덩 썬 감자를",daseulgi_guk:"해감해 둔 다슬기를",jaecheop_guk:"해감해 둔 재첩을"}[CK.id])+" 들어 왼쪽 가마솥 끓는 물에 넣어요",
  setup(){liftLid();CK.brothM=new THREE.MeshLambertMaterial({color:POT[CK.id].broth0});const br=disc(0.3,0.02,CK.brothM,0x9aa4a8);br.position.y=-0.03;CK.pc.add(br);
    setIng(potIngredient(CK.id));CK.ing.position.y=P_ING[1]+0.01},
  success:()=>{const o=CK.ing,from=o.position.clone(),to=new THREE.Vector3(P_PAN[0],1.15,P_PAN[2]);
    tw(0.3,e=>o.position.lerpVectors(from,to,e),()=>tw(0.3,e=>{o.position.y=1.15-0.2*e;o.scale.setScalar(1-0.5*e)},()=>{sfx("water");o.visible=false;const b=soupBits(CK.id);b.position.y=-0.015;CK.pc.add(b);CK.bits=b;CK.inPan=true}));return 900}};
CS.ssugi={name:"묵 쑤기",focus:"pot",g:"circle",n:3,tags:()=>[[P_PAN,"가마솥 · 주걱"]],guide:n=>`주걱으로 바닥이 눌지 않게 빙글빙글 저으며 걸쭉하게 쑤어요 · ${n}바퀴 남음`,
  setup(){liftLid();CK.mukM=new THREE.MeshLambertMaterial({color:0x9a7a5a});const m=disc(0.3,0.03,CK.mukM,0x7a5a3a);m.position.y=-0.03;CK.pc.add(m);CK.tool=juguk();CK.pc.add(CK.tool);CK.tool.position.set(0.1,0.04,0)},
  move(f){CK.mukM.color.setHex(0x9a7a5a).lerp(new THREE.Color(0x4a3020),Math.min(1,f))},stroke(k){sfx("whisk");if(k===2)popAt(P_PAN,"뭉글뭉글")},
  done(){removeTool();return 600}};
CS.gutigi={name:"굳혀서 썰기",focus:"board",g:"tap",r:16,pts:()=>[-0.08,0,0.08].map(d=>[P_ING[0]+d,P_ING[1]+0.08,P_ING[2]]),tags:()=>[[P_ING,"굳은 도토리묵 · 칼"]],
  guide:()=>"탱글탱글 굳은 묵을 칼로 콕콕 썰어요",
  setup(){CK.pc.visible=false;closeLid();const slab=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.06,0.2),new THREE.MeshPhongMaterial({color:0x5a3a28,shininess:70}));slab.position.y=0.04;slab.castShadow=true;setIng(slab);
    CK.knife=knife();CK.knife.position.set(P_ING[0],P_ING[1]+0.3,P_ING[2]);CK.g.add(CK.knife)},
  hit(k){sfx("chop");const kn=CK.knife,x=P_ING[0]+(k-1)*0.08;tw(0.22,e=>kn.position.set(x,P_ING[1]+0.24-Math.sin(e*Math.PI)*0.14,P_ING[2]),null);
    const ln=box(0.004,0.062,0.205,0x2a1a10,(k-1)*0.08,0.04,0);CK.ing.add(ln)},
  done(){const kn=CK.knife;tw(0.3,e=>kn.position.y=P_ING[1]+0.24+e*0.3,()=>CK.g.remove(kn));setTimeout(()=>{if(!CK)return;clearIng();const d=dish3D("dotori_muk");d.position.set(...plateAt());CK.g.add(d);sfx("pop")},400);return 900}};

/* ---------- 원래 손동작을 이 요리들에 맞게 ---------- */
{const st0=startCook;startCook=function(id){st0(id);if(!CK||!POT[id])return;CK.pot=true;
  if(POT[id].muk){const l=disc(0.13,0.006,new THREE.MeshLambertMaterial({color:0x8a6a4a}),0x7a5a3a);l.position.y=0.04;CK.bc.add(l);CK.bLiq=l}}}
{const A=CS.anchi,g0=A.guide,t0=A.tags;A.guide=()=>isPot()?"도토리 가루를 물에 갠 앙금물 양푼을 들어 왼쪽 가마솥에 부어요":g0();A.tags=()=>isPot()?[[()=>vpos(CK.bowl),"도토리 앙금물"],[P_PAN,"가마솥"]]:t0()}
// 양념: 넣을수록 국물 색이 변해요
{const SE=CS.season,h0=SE.hit;SE.hit=function(k){h0.call(this,k);if(isPot()&&CK.brothM){const n=seasonJars().length;setTimeout(()=>{if(CK&&CK.brothM)CK.brothM.color.setHex(POT[CK.id].broth0).lerp(new THREE.Color(POT[CK.id].broth),(k+1)/n*0.75)},700)}}}
// 끓이기: 솥뚜껑 덮고, 들썩이며 김이 나면(초록 칸) 휙
{const T_=CS.tteum,g0=T_.guide;T_.setup=function(){if(isPot())closeLid()};
  T_.guide=()=>isPot()?"솥뚜껑을 덮고 보글보글… 김이 푹푹 나며 들썩이면(초록 칸) 위로 휙 밀어 불을 줄여요. 너무 오래면 졸아요":g0()}
{const t0=tteumNow;tteumNow=function(){if(!isPot())return t0();const st=CK.st,[a,b]=FLIP_ZONE,g=st.g,ok=g>=a&&g<=b,P=POT[CK.id];CK.busy=true;stoveFireMat.opacity=0.25;CK.fire=false;
  if(CK.brothM)CK.brothM.color.setHex(P.broth).lerp(new THREE.Color(0x5a2a18),g>b?Math.min(0.5,(g-b)*1.5):0);
  liftLid();buzz(20);sfx("pop");CK.hint=false;
  cookStepDone(g>=1?0.4:ok?1:g<a?0.5+0.4*g/a:0.7,g>=1?"앗, "+P.msg[2]+"!":ok?P.msg[0]:g<a?P.msg[1]:P.msg[2],1000)}}
{const PL=CS.plate,g0=PL.guide,t0=PL.tags;PL.guide=()=>isPot()?"국자로 국물과 건더기를 듬뿍 떠서 오른쪽 그릇에 담아요":g0();
  PL.tags=()=>isPot()?[[()=>vpos(CK.pc),"국자로 떠요"],[plateAt(),"그릇"]]:t0()}

/* ---------- 다 된 모양 ---------- */
function soupBowl(g,col,bits){g.add(sabal(0.16,0.11));const d=disc(0.145,0.004,new THREE.MeshLambertMaterial({color:col}),col);d.position.y=0.085;g.add(d);bits(g)}
DISH.maeuntang=g=>soupBowl(g,0xb8401a,g=>{for(let i=0;i<5;i++){const b=box(0.05,0.022,0.035,i%2?0xe8dcc8:0xe8d098,fr(-0.07,0.07),0.095,fr(-0.07,0.07));b.rotation.y=fr(0,3);g.add(b)}
  for(let i=0;i<4;i++){const l=box(0.05,0.004,0.02,0x5d9a3e,fr(-0.06,0.06),0.1,fr(-0.06,0.06));l.rotation.y=fr(0,3);g.add(l)}});
DISH.daseulgi_guk=g=>soupBowl(g,0x8aa860,g=>{for(let i=0;i<14;i++)g.add(sph(0.01,0x2a3a2a,fr(-0.09,0.09),0.09,fr(-0.09,0.09)));for(let i=0;i<5;i++){const l=box(0.04,0.004,0.008,0x4a8a2e,fr(-0.07,0.07),0.093,fr(-0.07,0.07));l.rotation.y=fr(0,3);g.add(l)}});
DISH.jaecheop_guk=g=>soupBowl(g,0xe8e4d2,g=>{for(let i=0;i<10;i++){const s=sph(0.016,0x6a5a48,fr(-0.09,0.09),0.09,fr(-0.09,0.09));s.scale.y=0.45;g.add(s)}for(let i=0;i<5;i++){const l=box(0.04,0.004,0.008,0x4a8a2e,fr(-0.07,0.07),0.093,fr(-0.07,0.07));l.rotation.y=fr(0,3);g.add(l)}});
DISH.dotori_muk=g=>{g.add(plateMesh());const mt=new THREE.MeshPhongMaterial({color:0x5a3a28,shininess:70});
  for(let i=0;i<8;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.03,0.05),mt);m.position.set(-0.075+(i%4)*0.05,0.045+Math.floor(i/4)*0.03,Math.floor(i/4)?0.02:-0.02);m.rotation.y=fr(-0.15,0.15);g.add(m)}
  for(let i=0;i<5;i++){const s=sph(0.01,0xa8281a,fr(-0.06,0.06),0.1,fr(-0.03,0.03));s.scale.y=0.5;g.add(s)}};

// 매운탕에 쓴 고기는 망태 목록에서도 빼요 (제일 작은 것부터)
{const f0=finishCook;finishCook=function(){const id=CK&&CK.id,k=id==="maeuntang"?tangFish():null;f0();
  if(k&&S.bag){let j=-1;S.bag.forEach((b,i)=>{if(b.k===k&&(j<0||b.cm<S.bag[j].cm))j=i});if(j>=0){S.bag.splice(j,1);save()}}}}
// 국은 접시 대신 사발에 담아요
{const PL=CS.plate,s0=PL.setup;PL.setup=function(){s0.call(this);if(isPot()&&CK.plate){CK.g.remove(CK.plate);CK.plate=sabal(0.16,0.11);CK.plate.position.set(...plateAt());CK.g.add(CK.plate)}}}
