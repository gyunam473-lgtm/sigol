/* 우리 밭 작물로 만드는 요리 (2026-11-14, 작물 28가지에 맞춰 22가지)
   부뚜막 손동작(cook.js 의 CS)·가마솥 냄비(potcook.js 의 POT)는 그대로 쓰고, 이 요리들일 때만 재료 모양·안내를 바꿔요.
   - 무침·나물: 썰기(칼 콕콕)나 뜯기(좌우 슥슥) → 양념 → 버무리기 → 담기 → 고명
   - 김치: 절이기(소금 콕콕) → 양념 → 버무리기(빨갛게 물들어요) → 담기
   - 전: 불 → 썰기(반죽에 넣어요) → 솥뚜껑에 붓기 → 뒤집기 → 담기 → 고명
   - 볶음: 불 → 솥뚜껑에 올리기 → 양념 → 볶기 → 담기 → 고명
   - 국·찜: 불 → 솥에 넣기 → 양념 → 보글보글 → 그릇에 → 고명 (찐 옥수수는 양념 없이)
   - 과일: 썰기·꼭지 따기 → 담기 · 보리밥: 가마솥 밥처럼
   주의: sph/cyl/box/cone 도형은 같이 써요 → translate 하지 말고 위치·회전만 */
{
// ---------- 재료·조각 모양 ----------
const lay=(m,rz=Math.PI/2)=>{m.rotation.z=rz;return m};
const longVeg=(len,r,col,cap)=>{const g=new THREE.Group();g.add(lay(cyl(r,r*0.9,len,col,0,r,0,10)));if(cap)g.add(lay(cyl(r*0.5,r*0.3,0.02,cap,len/2,r,0,6)));return g};
const roundVeg=(r,col,sy=1)=>{const g=new THREE.Group(),m=sph(r,col,0,r*sy,0);m.scale.y=sy;g.add(m);return g};
const bunch=(n,col,len,w=0.012,white)=>{const g=new THREE.Group();for(let i=0;i<n;i++){const s=lay(cyl(w,w,len,col,0,w+0.004*(i%3),(i-n/2)*w*1.9,5));g.add(s);if(white)g.add(lay(cyl(w*1.05,w*1.05,len*0.3,white,-len*0.35,w+0.004*(i%3),(i-n/2)*w*1.9,5)))}return g};
const leafy=(n,col,r=0.05)=>{const g=new THREE.Group();for(let i=0;i<n;i++){const a=i/n*TAU,l=sph(r,i%2?col:new THREE.Color(col).multiplyScalar(0.85).getHex(),Math.cos(a)*r*0.8,0.015+i*0.003,Math.sin(a)*r*0.8);l.scale.set(1.3,0.25,0.8);l.rotation.y=-a;g.add(l)}return g};
const slice=(r,col,rim)=>()=>{const g=new THREE.Group();g.add(cyl(r,r,0.008,col,0,0,0,10));if(rim)g.add(cyl(r*1.02,r*1.02,0.006,rim,0,-0.002,0,10));g.userData.slice=1;return g};
const stick=(col,l=0.05,w=0.01)=>()=>box(l,w,w,col,0,0,0);
const cube=(col,s=0.022)=>()=>box(s,s,s,col,0,0,0);
const bit=(col,r=0.022)=>()=>{const m=sph(r,col,0,0,0);m.scale.set(1.4,0.3,0.9);return m};
// 요리마다: 재료 이름 · 도마 위 모양 · 썬 조각 · (김치면) 빨개진 조각 색
const VR={
  oi_muchim:{ing:"오이",model:()=>longVeg(0.2,0.025,0x3f7a2a),piece:slice(0.024,0xd8eec0,0x3f7a2a)},
  mu_saengchae:{ing:"무",model:()=>longVeg(0.16,0.045,0xeef2dc,0x9ac46a),piece:stick(0xf4f6ea,0.06,0.007),red:0xd0603a},
  sigeumchi_namul:{ing:"시금치",model:()=>leafy(9,0x2f6a28),piece:bit(0x3f7a30)},
  bomdong_geot:{ing:"봄동",model:()=>leafy(10,0x8ab84a,0.06),piece:bit(0x9ac45a,0.028)},
  subak_hwachae:{ing:"수박",model:()=>{const g=roundVeg(0.11,0x2f6a28,0.9);return g},piece:cube(0xe0383a,0.026)},
  ttalgi_jeopsi:{ing:"딸기",model:()=>{const g=new THREE.Group();for(let i=0;i<5;i++){const b=cone(0.022,0.045,0xd8282a,(i-2)*0.04,0.022,(i%2)*0.03,7);b.rotation.x=Math.PI;g.add(b)}return g},piece:()=>{const b=cone(0.02,0.04,0xd8282a,0,0,0,7);b.rotation.x=Math.PI;return b}},
  chamoe_kkakgi:{ing:"참외",model:()=>{const g=roundVeg(0.06,0xf2c62a,0.75);g.children[0].scale.set(1.35,0.75,0.95);return g},piece:()=>{const m=sph(0.03,0xf8f2d0,0,0,0);m.scale.set(1.6,0.4,0.6);return m}},
  yeolmu_kimchi:{ing:"열무",model:()=>bunch(7,0x5aa040,0.2,0.01,0xf2f0e0),piece:stick(0x5aa040,0.06,0.01),red:0xc8503a},
  kkakdugi:{ing:"무",model:()=>longVeg(0.16,0.045,0xeef2dc,0x9ac46a),piece:cube(0xf2f4e6,0.024),red:0xd0482a},
  oi_sobagi:{ing:"오이",model:()=>longVeg(0.2,0.025,0x3f7a2a),piece:()=>lay(cyl(0.022,0.022,0.06,0x4f8a30,0,0,0,8)),red:0xc0583a},
  pa_kimchi:{ing:"쪽파",model:()=>bunch(9,0x4f9a40,0.2,0.008,0xe8e2d0),piece:stick(0x4f9a40,0.07,0.008),red:0xc0503a},
  gat_kimchi:{ing:"갓",model:()=>leafy(8,0x6a3a5a,0.06),piece:bit(0x6a3a5a,0.026),red:0x7a2a2a},
  hobak_jeon:{ing:"애호박",model:()=>longVeg(0.16,0.032,0x8ab84a),piece:slice(0.03,0xeef0c8,0x8ab84a),jeon:true},
  pa_jeon:{ing:"대파",model:()=>bunch(5,0x3f8a3a,0.2,0.012,0xf4f2e4),piece:stick(0x3f8a3a,0.07,0.01),jeon:true}};
// 조각엔 표시(vp)를 달아 둬요: 양념 알갱이와 구별해서 버무릴 때 물들이려고
Object.values(VR).forEach(v=>{const p=v.piece;v.piece=()=>{const m=p();m.userData.vp=1;return m}});
const vr=()=>CK&&VR[CK.id];
// ---------- 볶음 (솥뚜껑) ----------
const VB={gaji_bokkeum:{n:12,raw:0xe8e0c8,done:0x5a3a4a,sz:[0.06,0.014,0.02],ing:"가지"},gamja_chae:{n:16,raw:0xf2e4b0,done:0xd8b060,sz:[0.08,0.008,0.008],ing:"감자"},
  kong_jaban:{n:22,raw:0xd8d0a0,done:0x3a2a1a,sz:[0.018,0.014,0.018],ing:"콩"},gochu_bokkeum:{n:10,raw:0x4f8a30,done:0x3f6a20,sz:[0.07,0.016,0.016],ing:"고추"}};
// ---------- 국·찜 (가마솥) ----------
const VP={muguk:{broth0:0xc8d4d8,broth:0xe0d4b8,bits:[0xf2f4e6,"cube"],ing:"나박 썬 무",potIn:()=>{const g=new THREE.Group();for(let i=0;i<8;i++)g.add(box(0.04,0.01,0.04,0xf2f4e6,fr(-0.08,0.08),0.01,fr(-0.06,0.06)));return g},msg:["시원하게 잘 끓었어요!","조금 덜 끓었지만 괜찮아요","국물이 졸았어요"]},
  sigeumchi_guk:{broth0:0xc8d4d8,broth:0x9a7a4a,bits:[0x2f6a28,"leaf"],ing:"시금치",potIn:()=>leafy(9,0x2f6a28),msg:["구수하게 잘 끓었어요!","조금 덜 끓었지만 괜찮아요","국물이 졸았어요"]},
  doenjang:{broth0:0xc8d4d8,broth:0x8a6a3a,bits:[0x8ab84a,"mix"],ing:"애호박 · 감자 · 고추",potIn:()=>{const g=new THREE.Group();for(let i=0;i<9;i++)g.add(box(0.035,0.02,0.035,[0x8ab84a,0xe8d098,0x4f8a30][i%3],fr(-0.08,0.08),0.015,fr(-0.06,0.06)));return g},msg:["보글보글 구수해요!","조금 덜 끓었지만 괜찮아요","찌개가 졸았어요"]},
  jjin_oksusu:{broth0:0xc8d4d8,broth:0xc8d4d8,bits:[0xe8d070,"corn"],ing:"껍질 벗긴 옥수수",potIn:()=>{const g=new THREE.Group();[-0.04,0.04].forEach(z=>g.add(lay(cyl(0.035,0.03,0.2,0xd8d080,0,0.035,z,8))));return g},msg:["포슬포슬 잘 쪄졌어요!","조금 덜 쪄졌지만 괜찮아요","너무 오래 쪄서 물렀어요"]}};

// ---------- 요리 목록 ----------
RECIPES.push(
  {id:"oi_muchim",name:"오이무침",need:{oi:2},fill:18,drink:8,desc:"아삭한 오이에 고춧가루·식초 새콤달콤",veg:true},
  {id:"mu_saengchae",name:"무생채",need:{mu:1},fill:18,desc:"채 썬 무를 빨갛게 무쳐 밥에 슥슥",veg:true},
  {id:"sigeumchi_namul",name:"시금치나물",need:{sigeumchi:2},fill:20,desc:"참기름·깨소금에 조물조물",veg:true},
  {id:"bomdong_geot",name:"봄동겉절이",need:{bomdong:1},fill:20,desc:"겨울을 난 달큰한 봄동을 슥슥",veg:true},
  {id:"yeolmu_kimchi",name:"열무김치",need:{yeolmu:3},fill:22,drink:10,desc:"여름 국수에 얹어 먹는 시원한 김치",veg:true},
  {id:"kkakdugi",name:"깍두기",need:{mu:2},fill:22,desc:"깍둑깍둑 썬 무로 담근 국밥 짝꿍",veg:true},
  {id:"oi_sobagi",name:"오이소박이",need:{oi:3},fill:22,drink:8,desc:"칼집 낸 오이에 부추 소를 꽉꽉",veg:true},
  {id:"pa_kimchi",name:"파김치",need:{jjokpa:3},fill:20,desc:"쪽파를 돌돌 감아 담근 알싸한 김치",veg:true},
  {id:"gat_kimchi",name:"갓김치",need:{gat:3},fill:20,desc:"톡 쏘는 보랏빛 갓김치",veg:true},
  {id:"hobak_jeon",name:"애호박전",need:{hobak:1,egg:1},fill:30,desc:"동글동글 썬 애호박에 달걀옷",veg:true,rain:true},
  {id:"pa_jeon",name:"대파전",need:{daepa:2},fill:32,desc:"대파 숭덩숭덩, 바삭한 부침개",veg:true,rain:true},
  {id:"gaji_bokkeum",name:"가지볶음",need:{gaji:2},fill:24,desc:"간장에 달달 볶아 부드러운 가지",veg:true,meat:true},
  {id:"gamja_chae",name:"감자채볶음",need:{potato:2},fill:28,desc:"가늘게 채 썰어 노릇노릇",veg:true,meat:true},
  {id:"kong_jaban",name:"콩자반",need:{kong:3},fill:22,desc:"간장에 조려 반질반질 윤기 나는 콩",veg:true,meat:true},
  {id:"gochu_bokkeum",name:"꽈리고추볶음",need:{gochu:3},fill:18,desc:"멸치 대신 간장에 볶은 고추 밑반찬",veg:true,meat:true},
  {id:"muguk",name:"뭇국",need:{mu:1,daepa:1},fill:30,drink:35,desc:"나박 썬 무가 투명해질 때까지 시원하게",veg:true},
  {id:"sigeumchi_guk",name:"시금치 된장국",need:{sigeumchi:2},fill:28,drink:35,desc:"된장 풀어 구수한 아침 국",veg:true},
  {id:"doenjang",name:"된장찌개",need:{hobak:1,potato:1,gochu:1},fill:45,drink:20,desc:"우리 밭 애호박·감자·고추 숭덩. 밥도둑",veg:true},
  {id:"jjin_oksusu",name:"찐 옥수수",need:{oksusu:2},fill:30,desc:"가마솥에 쪄서 호호, 여름 간식",veg:true},
  {id:"subak_hwachae",name:"수박화채",need:{subak:1},fill:12,drink:45,desc:"깍둑 썬 수박에 얼음 동동",veg:true},
  {id:"ttalgi_jeopsi",name:"딸기 한 접시",need:{ttalgi:4},fill:12,drink:10,desc:"꼭지 따서 새빨간 봄 딸기",veg:true},
  {id:"chamoe_kkakgi",name:"참외 깎기",need:{chamoe:1},fill:14,drink:15,desc:"껍질 깎아 아삭아삭",veg:true},
  {id:"bori_bap",name:"보리밥",need:{bori:1,ssal:1},fill:45,desc:"쌀에 보리 섞어 지은 구수한 밥",veg:true,bap:true});
const muchim=["season","toss","plate","garnish"],kimchi=["salt","season","toss","plate"];
Object.assign(RECIPE_STEPS,{oi_muchim:["chop",...muchim],mu_saengchae:["chop",...muchim],sigeumchi_namul:["tear",...muchim],bomdong_geot:["tear",...muchim],
  yeolmu_kimchi:kimchi,kkakdugi:["chop",...kimchi],oi_sobagi:kimchi,pa_kimchi:kimchi,gat_kimchi:kimchi,
  hobak_jeon:["fire","chop","pour","flip","plate","garnish"],pa_jeon:["fire","chop","pour","flip","plate","garnish"],
  gaji_bokkeum:["fire","place","season","stirfry","plate","garnish"],gamja_chae:["fire","place","season","stirfry","plate","garnish"],kong_jaban:["fire","place","season","stirfry","plate","garnish"],gochu_bokkeum:["fire","place","season","stirfry","plate","garnish"],
  muguk:["fire","potin","season","tteum","plate","garnish"],sigeumchi_guk:["fire","potin","season","tteum","plate","garnish"],doenjang:["fire","potin","season","tteum","plate","garnish"],jjin_oksusu:["fire","potin","tteum","plate"],
  subak_hwachae:["chop","season","toss","plate"],ttalgi_jeopsi:["chop","plate"],chamoe_kkakgi:["chop","plate"],bori_bap:["fire","wash","anchi","tteum","plate"]});
Object.assign(STEP_ALIAS,{oi_muchim:{chop:"오이 썰기"},mu_saengchae:{chop:"무 채 썰기"},sigeumchi_namul:{tear:"시금치 다듬기",toss:"조물조물 무치기"},bomdong_geot:{tear:"봄동 뜯기"},
  yeolmu_kimchi:{salt:"열무 절이기"},kkakdugi:{chop:"깍둑 썰기",salt:"무 절이기"},oi_sobagi:{salt:"오이 절이기",toss:"소 넣기"},pa_kimchi:{salt:"쪽파 절이기"},gat_kimchi:{salt:"갓 절이기"},
  hobak_jeon:{chop:"애호박 썰기",pour:"달걀옷 입혀 올리기"},pa_jeon:{chop:"대파 썰기",pour:"반죽 붓기"},
  gaji_bokkeum:{stirfry:"달달 볶기"},gamja_chae:{place:"채 썬 감자 올리기",stirfry:"노릇하게 볶기"},kong_jaban:{stirfry:"간장에 조리기"},gochu_bokkeum:{stirfry:"볶기"},
  muguk:{tteum:"보글보글 끓이기",plate:"그릇에 담기"},sigeumchi_guk:{tteum:"보글보글 끓이기",plate:"그릇에 담기"},doenjang:{tteum:"보글보글 끓이기",plate:"뚝배기에 담기"},jjin_oksusu:{potin:"찜솥에 넣기",tteum:"푹 찌기",plate:"건져 담기"},
  subak_hwachae:{chop:"깍둑 썰기",season:"얼음·설탕 넣기",toss:"살살 섞기"},ttalgi_jeopsi:{chop:"꼭지 따기"},chamoe_kkakgi:{chop:"깎아 썰기"},bori_bap:{wash:"보리쌀 씻기",plate:"밥 푸기"}});
Object.assign(SEASON_JARS,{oi_muchim:[["고춧가루",0xc0392b],["식초",0xe8e0b0],["설탕",0xfafafa]],mu_saengchae:[["고춧가루",0xc0392b],["식초",0xe8e0b0],["다진 마늘",0xf2ead6]],
  sigeumchi_namul:[["국간장",0x3a2214],["참기름",0xd8a838],["깨소금",0xe8d8a8]],bomdong_geot:[["고춧가루",0xc0392b],["액젓",0x8a6a4a],["참기름",0xd8a838]],
  yeolmu_kimchi:[["고춧가루",0xc0392b],["풀국",0xf2ead6],["다진 마늘",0xf2ead6]],kkakdugi:[["고춧가루",0xc0392b],["새우젓",0xe8c8b0],["설탕",0xfafafa]],
  oi_sobagi:[["부추 소",0x4a8a2e],["고춧가루",0xc0392b],["액젓",0x8a6a4a]],pa_kimchi:[["고춧가루",0xc0392b],["멸치액젓",0x6a4a2a]],gat_kimchi:[["고춧가루",0xc0392b],["찹쌀풀",0xf2ead6],["액젓",0x8a6a4a]],
  gaji_bokkeum:[["간장",0x3a2214],["다진 마늘",0xf2ead6]],gamja_chae:[["소금",0xf4f4f0],["들기름",0xc89a3a]],kong_jaban:[["간장",0x3a2214],["조청",0xb8782a]],gochu_bokkeum:[["간장",0x3a2214],["물엿",0xe8d8a8]],
  muguk:[["국간장",0x3a2214],["다진 마늘",0xf2ead6]],sigeumchi_guk:[["된장",0x8a6a3a],["다진 마늘",0xf2ead6]],doenjang:[["된장",0x8a6a3a],["고춧가루",0xc0392b]],
  subak_hwachae:[["얼음",0xe8f4fa],["설탕",0xfafafa]]});
Object.assign(GARNISH,{oi_muchim:[0xf6eedc],mu_saengchae:[0xf6eedc,0x5d9a3e],sigeumchi_namul:[0xf6eedc],bomdong_geot:[0xf6eedc],hobak_jeon:[0xc0392b],pa_jeon:[0xc0392b,0xf2cc52],
  gaji_bokkeum:[0xf6eedc,0x5d9a3e],gamja_chae:[0xf6eedc],kong_jaban:[0xf6eedc],gochu_bokkeum:[0xf6eedc],muguk:[0x5d9a3e],sigeumchi_guk:[0x5d9a3e],doenjang:[0x5d9a3e,0xc0392b]});
Object.assign(GARNISH_NAME,{oi_muchim:"통깨",mu_saengchae:"통깨·쪽파",sigeumchi_namul:"깨소금",bomdong_geot:"통깨",hobak_jeon:"실고추",pa_jeon:"실고추·달걀",
  gaji_bokkeum:"통깨·쪽파",gamja_chae:"통깨",kong_jaban:"통깨",gochu_bokkeum:"통깨",muguk:"송송 파",sigeumchi_guk:"송송 파",doenjang:"송송 파·고추"});
SPOON_FOOD.push("muguk","sigeumchi_guk","doenjang","bori_bap","subak_hwachae");
Object.assign(POT,Object.fromEntries(Object.entries(VP).map(([k,v])=>[k,{broth0:v.broth0,broth:v.broth,bits:"v_"+k,msg:v.msg}])));

// ---------- 손동작을 이 요리들에 맞게 ----------
// 썰기: 토마토 대신 그 재료, 썬 조각이 도마에 쌓였다가 양푼으로
{const C=CS.chop,s0=C.setup,h0=C.hit,d0=C.done,g0=C.guide,t0=C.tags;
  C.setup=function(){const v=vr();if(!v)return s0.call(this);const m=v.model();m.position.y=0.005;setIng(m);CK.vegM=m;CK.knife=knife();CK.knife.position.set(P_ING[0]+0.02,P_ING[1]+0.3,P_ING[2]);CK.g.add(CK.knife)};
  C.hit=function(k){const v=vr();if(!v)return h0.call(this,k);sfx("chop");const kn=CK.knife,x=P_ING[0]+(k-1)*0.05;tw(0.22,e=>kn.position.set(x,P_ING[1]+0.24-Math.sin(e*Math.PI)*0.12,P_ING[2]),null);
    for(let i=0;i<2;i++){const s=v.piece();s.position.set((k-1)*0.05+fr(-0.015,0.015),0.012+i*0.01,0.1);s.userData.slice=1;CK.ing.add(s)}CK.vegM.scale.x*=0.75};
  C.done=function(){const v=vr();if(!v)return d0.call(this);CK.ing.children.filter(c=>c.userData.slice).forEach(s=>{CK.ing.remove(s);flyToBowl(v.piece)});CK.vegM.visible=false;
    const kn=CK.knife;tw(0.3,e=>kn.position.y=P_ING[1]+0.24+e*0.3,()=>CK.g.remove(kn));if(v.jeon)setTimeout(()=>{if(CK)bowlLiquid(CK.id==="hobak_jeon"?"eggRaw":"batter",0.8)},500);return 700};
  C.guide=()=>{const v=vr();if(!v)return g0();return CK.id==="ttalgi_jeopsi"?"칼끝을 콕콕 눌러 딸기 꼭지를 따요":CK.id==="chamoe_kkakgi"?"칼 자리를 콕콕 눌러 참외 껍질을 깎고 썰어요":`칼 자리를 콕콕 눌러 ${v.ing}${josa(v.ing,"을","를").slice(v.ing.length)} 썰어요`+(v.jeon?" · 반죽에 넣어요":"")};
  C.tags=()=>{const v=vr();return v?[[P_ING,v.ing+" · 칼"],[P_BOWL,"양푼"]]:t0()}}
// 뜯기: 상추 대신 그 잎채소
{const T0=CS.tear,s0=T0.setup,k0=T0.stroke,g0=T0.guide,t0=T0.tags;
  T0.setup=function(){const v=vr();if(!v)return s0.call(this);const m=v.model();setIng(m);CK.vegM=m};
  T0.stroke=function(){const v=vr();if(!v)return k0.call(this);sfx("scrape");for(let i=0;i<3;i++){const c=CK.vegM.children;if(c.length>1)CK.vegM.remove(c[c.length-1]);flyToBowl(v.piece)}};
  T0.guide=n=>{const v=vr();return v?`${v.ing}${josa(v.ing,"을","를").slice(v.ing.length)} 좌우로 쭉쭉 뜯어 양푼에 담아요 · ${n}번 남음`:g0(n)};
  T0.tags=()=>{const v=vr();return v?[[P_ING,v.ing],[P_BOWL,"양푼"]]:t0()}}
// 절이기: 배추 대신 그 재료
{const SA=CS.salt,s0=SA.setup,g0=SA.guide,t0=SA.tags;
  SA.setup=function(){const v=vr();if(!v)return s0.call(this);s0.call(this);const m=v.model();setIng(m);CK.vegM=m};
  SA.guide=()=>{const v=vr();return v?`${v.ing} 사이사이에 소금을 콕콕 뿌려 숨을 죽여요`:g0()};
  SA.tags=()=>{const v=vr();return v?[[P_ING,v.ing],[P_SALT,"소금"]]:t0()}}
// 버무리기: 양푼에 그 재료 조각, 김치는 돌릴수록 빨갛게
{const TO=CS.toss,s0=TO.setup,k0=TO.stroke,g0=TO.guide;
  TO.setup=function(){s0.call(this);const v=vr();if(!v)return;
    if(CK.id==="subak_hwachae"&&CK.paste){CK.bc.remove(CK.paste);CK.paste=null} // 화채엔 빨간 양념 덩이 없이
    if(!CK.bc.children.some(c=>c.userData.vp))for(let i=0;i<12;i++){const p=v.piece();p.position.set(fr(-0.07,0.07),fr(0.03,0.06),fr(-0.07,0.07));p.rotation.y=fr(0,TAU);CK.bc.add(p)}};
  TO.stroke=function(k,n){k0.call(this,k,n);const v=vr();if(!v||!v.red)return;const col=new THREE.Color(v.red);
    CK.bc.children.filter(c=>c.userData.vp).forEach(c=>c.traverse(o=>{if(o.isMesh){if(!o.userData.own){o.material=o.material.clone();o.userData.own=1}o.material.color.lerp(col,k/n*0.45)}}))};
  TO.guide=n=>{const v=vr();if(!v)return g0(n);return (CK.id==="oi_sobagi"?"칼집 사이에 부추 소를 꽉꽉 채우며":CK.id==="subak_hwachae"?"수박이 부서지지 않게":v.red?"양념이 골고루 배게":"양념이 골고루 묻게")+` 빙글빙글 버무려요 · ${n}바퀴 남음`}}
// 전: 감자전처럼 부치되 이름·색만
{const mp=makePanContent;makePanContent=function(){const v=vr();if(!v||!v.jeon)return mp();const id=CK.id;CK.id="jeon";let g;try{g=mp()}finally{CK.id=id}CK.panName=CK.r.name;
  if(id==="hobak_jeon"){g.visible=false;const h=new THREE.Group();for(let i=0;i<7;i++){const a=i/7*TAU,x=i?Math.cos(a)*0.13:0,z=i?Math.sin(a)*0.13:0;h.add(cyl(0.05,0.05,0.012,0xf2d870,x,0.018,z,14));h.add(cyl(0.052,0.052,0.01,0x8ab84a,x,0.016,z,14))}CK.pc.add(h)}
  else{for(let i=0;i<14;i++){const s=box(0.08,0.008,0.01,0x3f8a3a,fr(-0.13,0.13),0.026,fr(-0.13,0.13));s.rotation.y=fr(0,TAU);g.add(s)}}
  return g}}
{const P0=CS.pour,g0=P0.guide;P0.guide=()=>{const v=vr();return v&&v.jeon?(CK.id==="hobak_jeon"?"달걀옷 입힌 애호박 양푼을 들어 왼쪽 솥뚜껑에 올려요":"대파 넣은 반죽 양푼을 들어 왼쪽 솥뚜껑에 부어요"):g0()}}
// 볶음: 솥뚜껑 위 모양 (날것 → 볶은 색)
{const mg=meatGroup;meatGroup=function(id){const S_=VB[id];if(!S_)return mg(id);const g=new THREE.Group(),mats=[];
  for(let i=0;i<S_.n;i++){const mt=new THREE.MeshPhongMaterial({color:S_.raw,shininess:40});mats.push(mt);const m=new THREE.Mesh(new THREE.BoxGeometry(...S_.sz),mt);
    m.position.set(fr(-0.1,0.1),0.012+(i%2)*0.006,fr(-0.1,0.1));m.rotation.y=fr(0,TAU);m.castShadow=true;g.add(m)}
  const R=new THREE.Color(S_.raw),Dn=new THREE.Color(S_.done);g.userData.cook=k=>mats.forEach(m=>m.color.copy(R).lerp(Dn,Math.min(1,k)));return g}}
{const P=CS.place,g0=P.guide;P.guide=()=>VB[CK.id]?`도마 위 손질한 ${VB[CK.id].ing}${josa(VB[CK.id].ing,"을","를").slice(VB[CK.id].ing.length)} 집어 왼쪽 솥뚜껑에 올려요. 들기름 두른 데서 치익`:g0()}
{const SF=CS.stirfry,g0=SF.guide;SF.guide=n=>VB[CK.id]?`주걱으로 빙글빙글 ${CK.id==="kong_jaban"?"간장이 졸아 반질반질해질 때까지 조려요":"노릇하게 볶아요. 고소한 냄새가 솔솔"} · ${n}바퀴 남음`:g0(n)}
// 국·찜: 솥에 넣을 것, 끓는 국 건더기
{const pi=potIngredient;potIngredient=function(id){return VP[id]?VP[id].potIn():pi(id)}}
{const sb=soupBits;soupBits=function(id){const v=VP[id];if(!v)return sb(id);const g=new THREE.Group(),[c,t]=v.bits;
  for(let i=0;i<10;i++){const x=fr(-0.17,0.17),z=fr(-0.14,0.14);let m;if(t==="corn"){if(i>1)continue;m=lay(cyl(0.04,0.035,0.22,c,x*0.4,0.02,(i-0.5)*0.09,8))}else if(t==="leaf"){m=sph(0.03,c,x,0,z);m.scale.set(1.4,0.25,0.8)}else m=box(0.04,0.018,0.04,t==="mix"?[0x8ab84a,0xe8d098,0x4f8a30][i%3]:c,x,0,z);m.castShadow=false;g.add(m)}return g}}
{const PI=CS.potin,t0=PI.tags,g0=PI.guide;PI.tags=()=>VP[CK.id]?[[()=>vpos(CK.ing),VP[CK.id].ing],[P_PAN,CK.id==="jjin_oksusu"?"가마솥 (김이 올라요)":"가마솥 (물이 끓어요)"]]:t0();
  PI.guide=()=>VP[CK.id]?`${VP[CK.id].ing}${josa(VP[CK.id].ing,"을","를").slice(VP[CK.id].ing.length)} 들어 왼쪽 가마솥에 넣어요`+(CK.id==="jjin_oksusu"?". 채반에 올려 쪄요":""):g0()}
// 보리밥: 가마솥 밥처럼 (밥심도 같이)
{const st0=startCook;startCook=function(id){st0(id);if(CK&&id==="bori_bap")CK.pot=true}}
{const W0=CS.wash,g0=W0.guide;W0.guide=n=>CK&&CK.id==="bori_bap"?`쌀에 보리쌀을 섞어 빙글빙글 씻어요 · ${n}바퀴 남음`:g0(n)}

// ---------- 다 된 모양 ----------
const dishOf=(make,n,opt={})=>g=>{if(opt.bowl)g.add(sabal(0.14,0.09));else g.add(plateMesh());const col=opt.red?new THREE.Color(opt.red):null;
  for(let i=0;i<n;i++){const p=make();p.position.set(fr(-0.07,0.07),(opt.bowl?0.07:0.035)+i*(opt.stack||0.004),fr(-0.07,0.07));p.rotation.y=fr(0,TAU);
    if(col)p.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.color.lerp(col,0.45)}});g.add(p)}
  if(opt.dots)for(let i=0;i<8;i++){const s=sph(0.006,opt.dots,fr(-0.06,0.06),(opt.bowl?0.09:0.06),fr(-0.06,0.06));s.castShadow=false;g.add(s)}};
DISH.oi_muchim=dishOf(VR.oi_muchim.piece,14,{red:0xd8603a,dots:0xf6eedc});
DISH.mu_saengchae=dishOf(VR.mu_saengchae.piece,26,{red:0xd0603a,stack:0.002});
DISH.sigeumchi_namul=dishOf(VR.sigeumchi_namul.piece,14,{dots:0xe8d8a8});
DISH.bomdong_geot=dishOf(VR.bomdong_geot.piece,12,{red:0xc8603a,dots:0xf6eedc});
DISH.yeolmu_kimchi=dishOf(VR.yeolmu_kimchi.piece,16,{red:0xc8503a,bowl:true});
DISH.kkakdugi=dishOf(VR.kkakdugi.piece,14,{red:0xd0482a});
DISH.oi_sobagi=dishOf(VR.oi_sobagi.piece,6,{red:0xc0583a,stack:0.01});
DISH.pa_kimchi=dishOf(VR.pa_kimchi.piece,16,{red:0xc0503a});
DISH.gat_kimchi=dishOf(VR.gat_kimchi.piece,12,{red:0x7a2a2a});
DISH.subak_hwachae=dishOf(VR.subak_hwachae.piece,12,{bowl:true});
DISH.ttalgi_jeopsi=dishOf(VR.ttalgi_jeopsi.piece,9,{stack:0.002});
DISH.chamoe_kkakgi=dishOf(VR.chamoe_kkakgi.piece,8,{stack:0.003});
DISH.hobak_jeon=g=>{g.add(plateMesh());for(let i=0;i<6;i++){const a=i/6*TAU,x=Math.cos(a)*0.06,z=Math.sin(a)*0.06;g.add(cyl(0.04,0.04,0.012,0xe8b850,x,0.04+i*0.003,z,14));g.add(cyl(0.042,0.042,0.01,0x8ab84a,x,0.038+i*0.003,z,14))}};
DISH.pa_jeon=g=>{DISH.pajeon(g);for(let i=0;i<10;i++){const s=box(0.07,0.006,0.009,0x3f8a3a,fr(-0.08,0.08),0.062,fr(-0.08,0.08));s.rotation.y=fr(0,TAU);g.add(s)}};
Object.keys(VB).forEach(k=>{const v=VB[k];DISH[k]=g=>{g.add(plateMesh());for(let i=0;i<v.n;i++){const m=box(...v.sz,v.done,fr(-0.07,0.07),0.04+(i%3)*0.004,fr(-0.07,0.07));m.rotation.y=fr(0,TAU);g.add(m)}}});
DISH.muguk=g=>soupBowl(g,0xe0d4b8,g=>{for(let i=0;i<7;i++){const b=box(0.04,0.01,0.04,0xf4f2e4,fr(-0.07,0.07),0.093,fr(-0.07,0.07));b.rotation.y=fr(0,3);g.add(b)}for(let i=0;i<5;i++)g.add(sph(0.008,0x5d9a3e,fr(-0.07,0.07),0.095,fr(-0.07,0.07)))});
DISH.sigeumchi_guk=g=>soupBowl(g,0x9a7a4a,g=>{for(let i=0;i<8;i++){const l=sph(0.025,0x2f6a28,fr(-0.07,0.07),0.09,fr(-0.07,0.07));l.scale.set(1.4,0.2,0.8);g.add(l)}});
DISH.doenjang=g=>{g.add(cyl(0.15,0.12,0.11,0x3a2a22,0,0.055,0,16));const d=disc(0.135,0.004,new THREE.MeshLambertMaterial({color:0x8a6a3a}),0x8a6a3a);d.position.y=0.1;g.add(d);
  for(let i=0;i<9;i++)g.add(box(0.035,0.018,0.035,[0x8ab84a,0xe8d098,0x4f8a30][i%3],fr(-0.08,0.08),0.105,fr(-0.08,0.08)))};
DISH.jjin_oksusu=g=>{g.add(plateMesh());[-0.04,0.04].forEach(z=>{const c=lay(cyl(0.035,0.03,0.2,0xe8d070,0,0.06,z,10));g.add(c)})};
DISH.bori_bap=g=>{DISH.bap(g);for(let i=0;i<40;i++){const r=Math.sqrt(Math.random())*0.1,a=Math.random()*TAU,x=Math.cos(a)*r,z=Math.sin(a)*r,y=0.085+0.072*Math.sqrt(Math.max(0,1-(r/0.12)**2));
  const s=sph(0.008,0x9a7a48,x,y,z);s.scale.set(1.3,0.7,0.9);s.castShadow=false;g.add(s)}}; // 보리 알갱이는 밥 위에 콕콕
}
