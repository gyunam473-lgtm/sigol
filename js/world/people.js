/* 사람: 나, 이웃 3명, 장터 가게 주인들(채소가게 아줌마, 씨앗가게 할아버지, 닭집 아저씨, 생선 트럭 아저씨), 장소 이름표
   이름표 색으로 누군지 알아봐요: 나는 파랑, 이웃은 초록, 가게 주인은 주황 + 머리 위 말풍선 */

// 장소 이름표 (폰트 준비 뒤)
function placeLabels(){
  houseLabel=label("집",1.2);land.add(houseLabel);applyHouse();
  [["텃밭",FIELD.x,2.2,FIELD.z-4.2],["논",PADDY.x,1.8,PADDY.z]].forEach(([t,x,y,z])=>{const l=label(t,1.2);l.position.set(x,y,z);land.add(l)});
  {const l=label("평상",1);l.position.set(0,1.5,0);bench.add(l)}
  {const l=label("부뚜막",1);l.position.set(0,2.9,0);stove.add(l)}
  {const l=label("우물",1);l.position.set(0,2.3,0);well.add(l)}
  [["외양간",-13.2,3.8,5],["닭장",-6.9,2.1,6.3],["평상",-4.4,1.6,-1.2],["배추 · 고추",FIELD.x+5.5,1.6,FIELD.z-4.2]].forEach(([t,x,y,z])=>{const l=label(t,1);l.position.set(x,y,z);ijang.add(l)});
  [["마을 장터",0,4.4,-4.5],["정자",6,5,3.5]].forEach(([t,x,y,z])=>{const l=label(t,1.2);l.position.set(x,y,z);plaza.add(l)});
}

// 사람. o: hat(밀짚모자, 기본) · scarf(머릿수건 색) · cap(모자 색) · hair(머리 색) · apron(앞치마 색) · style(이름표 색)
function person(shirt,name,o={}){
  if(typeof o==="boolean")o={hat:o};
  const g=new THREE.Group(),b=new THREE.Group();g.add(b);
  b.add(box(0.5,0.55,0.32,o.pants||0x4a4a55,0,0.28,0));
  b.add(cyl(0.3,0.38,0.8,shirt,0,0.95,0));
  b.add(sph(0.3,0xf0d2b0,0,1.6,0));
  const hair=o.hair||0x3a332c;
  if(o.scarf){const sc=sph(0.33,o.scarf,0,1.7,-0.03);sc.scale.set(1,0.8,1.05);b.add(sc);b.add(sph(0.09,o.scarf,0,1.62,-0.33))} // 머릿수건과 매듭
  else if(o.cap){b.add(cyl(0.31,0.32,0.2,o.cap,0,1.84,0,14));b.add(box(0.36,0.04,0.3,o.cap,0,1.75,0.25))} // 모자와 챙
  else if(o.hat!==false){b.add(cyl(0.58,0.58,0.05,0xe6cc84,0,1.8,0,18));b.add(cyl(0.26,0.31,0.25,0xe6cc84,0,1.93,0,14));b.add(cyl(0.315,0.315,0.06,0xc8572f,0,1.85,0,14))}
  else b.add(sph(0.31,hair,0,1.68,-0.04));
  if(o.hair&&(o.cap||o.hat!==false&&!o.scarf))b.add(sph(0.305,hair,0,1.62,-0.06)); // 모자 밑 머리
  if(o.apron){const a=box(0.5,0.62,0.04,o.apron,0,0.9,0.36);a.rotation.x=-0.1;b.add(a)}
  if(o.beard)b.add(sph(0.14,o.beard,0,1.42,0.22));
  const l=label(name,0.9,o.style||"nb");l.position.y=2.55;g.add(l);
  scene.add(g);return {g,b,tx:0,tz:0,speed:3.2,moving:false,wait:0,label:l}}

// 가게 주인 머리 위 말풍선: 말 걸 수 있는 사람이라는 표시 (살짝 위아래로 흔들려요)
const markers=[];
function talkMark(p){
  const c=document.createElement("canvas");c.width=c.height=64;const x=c.getContext("2d");
  x.fillStyle="#ffd25a";x.strokeStyle="#7a4a1a";x.lineWidth=4;
  x.beginPath();x.ellipse(32,27,26,20,0,0,Math.PI*2);x.fill();x.stroke();
  x.beginPath();x.moveTo(24,44);x.lineTo(20,60);x.lineTo(36,46);x.fill();
  x.fillStyle="#7a4a1a";[20,32,44].forEach(cx=>{x.beginPath();x.arc(cx,27,4,0,Math.PI*2);x.fill()});
  const t=new THREE.CanvasTexture(c);const m=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true}));
  m.scale.set(0.6,0.6,1);m.renderOrder=11;m.position.y=3.25;m.userData.y=3.25;p.g.add(m);markers.push(m);return m}

// 장터 가게 주인: 가게 뒤에 서 있어요. 가게를 누르거나 주인을 누르면 말을 걸어요 (screens/market.js)
const SHOPS={
  veg:{name:"채소가게 아줌마",role:"채소 사 줘요",shirt:0xd9785a,o:{scarf:0xf2e6c8,apron:0xf6f0e2,style:"shop"}},
  seed:{name:"씨앗가게 할아버지",role:"씨앗 팔아요",shirt:0x7a6a54,o:{hat:true,hair:0xdedad2,beard:0xe8e4dc,style:"shop"}},
  egg:{name:"닭집 아저씨",role:"달걀 사 줘요",shirt:0xe8d9a8,o:{cap:0x8a3a2a,apron:0x6b8fb0,style:"shop"}},
  fish:{name:"생선 트럭 아저씨",role:"바다 것 · 민물고기",shirt:0x3f6f9a,o:{cap:0x2a3a4a,apron:0xe0e6ea,pants:0x2f4f6a,style:"shop"}},
  meat:{name:"정육점 아저씨",role:"고기 팔아요",shirt:0xf2f0ea,o:{cap:0xf6f6f2,apron:0xd8d4cc,pants:0x3a3a40,style:"shop"}},
  furniture:{name:"목수 할아버지",role:"가구 짜 드려요",shirt:0x8a7a5a,o:{scarf:0xe8e0c8,hair:0xd8d4cc,beard:0xe8e4dc,apron:0x9a6a3a,style:"shop"},place:"workshop"},
  cattle:{name:"소장수 아저씨",role:"송아지·염소",shirt:0x6b5a3f,o:{cap:0x3a3428,hair:0x555048,pants:0x3a3a3a,style:"shop"},place:"cattle"}};
const shopPlace=k=>SHOPS[k].place||"plaza";
const shopOpen=k=>k==="fish"||k==="cattle"?jangToday():true;

let me,npcs=[];
function makePeople(){
  me=person(0x5a86b8,"나",{style:"me"});me.g.position.set(0,0,12);me.tx=0;me.tz=4;me.speed=4.2;
  [[0xc77d7d,"옆집 할머니",{hat:false,hair:0xc9c4bc}],[0x7d9a6b,"이장님",{}],[0xd9b45a,"귀농 2년차",{}]].forEach(([c,n,o],i)=>{const p=person(c,n,o);p.name=n;p.g.userData={kind:"npc",name:n};p.g.position.set(-3+i*4,0,2+i);p.tx=p.g.position.x;p.tz=p.g.position.z;p.speed=1.6+i*0.3;p.wait=i*1.5;p.g.visible=false;npcs.push(p)}); // 처음엔 우리 땅이라 안 보여요
  Object.entries(SHOPS).forEach(([k,d])=>{const p=person(d.shirt,d.name,d.o);p.name=d.name;p.shop=k;p.stay=true;p.g.visible=false;p.g.userData={kind:"shop",shop:k};talkMark(p);npcs.push(p);d.p=p});
  placeLabels();publicLabels();workshopLabels();placeLabels2();placeLabels3();
}
// 가게 주인이 서는 자리 [x, z, 보는 방향]: 좌판 앞 왼쪽 (뒤에 서면 차양에 가려요)
function shopSpot(k){if(SHOPS[k].spot)return SHOPS[k].spot;
  if(k==="fish")return [seaTruck.position.x+1.45,seaTruck.position.z+1.3,Math.PI/2+0.5];
  if(k==="cattle")return [0.4,-0.3,0];
  if(k==="furniture")return [0.6,-3.3,0.2];
  const s=STALLS.find(t=>t.userData.shop===k).position;return [s.x-1.15,s.z+1.25,0.35]}
// 내가 말 걸러 가서 서는 자리
function shopStand(k){if(SHOPS[k].stand)return SHOPS[k].stand;const [x,z]=shopSpot(k);return k==="fish"?[x+0.9,z-0.9]:[x+1.2,z+1.0]}
const WAY=[[2,-1],[3,2],[-4,3],[-5,6],[4,5],[9,1],[-2,-2],[1,9],[-9,3],[10,4]];
const WAYP=[[-5,-1.5],[5,-1.5],[-3,2],[2,3],[6,0.5],[-6,0],[0,1],[4,5],[-4,6],[3,-2]];
