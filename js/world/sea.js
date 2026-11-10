/* 해산물 모양과 장날 생선 트럭
   - 생선: 종류마다 몸 모양(통통한 방추형, 납작한 마름모, 은빛 토막)과 비늘 무늬를 그려요.
     날것 질감과 구운 질감(노릇한 색, 석쇠 자국, 그을음)이 따로 있어서, 뒤집으면 구운 면이 보여요.
   - 굴: 우윳빛 굴살과 거무스름한 테두리
   - 생선 트럭: 장날(4·9일)에만 장터에 들어와요. 짐칸에 얼음 상자와 생선.
   음식 모양을 3D 모델 파일로 바꿀 땐 food.js 와 이 파일만 바꿔 끼우면 돼요. */

/* ---------- 생선 생김새 ----------
   L 길이, h 몸 높이(길이 대비), n 몇 마리(토막), tail 꼬리 모양, back/belly 등·배 색, pat 무늬 */
const FISH={
  mackerel:{L:0.3,h:0.24,n:1,tail:"fork",back:"#2f5f6e",belly:"#e9eef0",pat:"wave"},
  dodari:{L:0.26,h:0.55,n:1,tail:"fan",back:"#7a6448",belly:"#b39a76",pat:"spots"},
  jogi:{L:0.19,h:0.27,n:2,tail:"fan",back:"#a08c5a",belly:"#f0c94a",pat:"gold"},
  galchi:{L:0.13,h:0.36,n:3,tail:"cut",back:"#c9d0d6",belly:"#f4f6f8",pat:"silver"},
  minuh:{L:0.32,h:0.3,n:1,tail:"fan",back:"#6e6a62",belly:"#d9d2c4",pat:"plain"},
  jeoneo:{L:0.15,h:0.3,n:3,tail:"fork",back:"#4a6272",belly:"#e8ecee",pat:"dots"},
  kkongchi:{L:0.27,h:0.13,n:2,tail:"fork",back:"#243c58",belly:"#dfe6ea",pat:"plain"},
  // 민물고기 (냇가 낚시)
  songsari:{L:0.06,h:0.25,n:1,tail:"fork",back:"#7a8a6a",belly:"#e8e8d8",pat:"plain"},
  pirami:{L:0.13,h:0.24,n:1,tail:"fork",back:"#5a7a7a",belly:"#f0d8dc",pat:"silver"},
  bungeo:{L:0.2,h:0.42,n:1,tail:"fan",back:"#5a5a3a",belly:"#c8b878",pat:"gold"},
  kkeokji:{L:0.16,h:0.36,n:1,tail:"fan",back:"#4a4a3a",belly:"#b8a888",pat:"spots"},
  megi:{L:0.4,h:0.22,n:1,tail:"fan",back:"#3a3a34",belly:"#9a9488",pat:"plain"},
  ssogari:{L:0.3,h:0.34,n:1,tail:"fan",back:"#b8a060",belly:"#e8d8a0",pat:"spots"},
  baemjang:{L:0.6,h:0.08,n:1,tail:"fan",back:"#2a3a30",belly:"#c8c8a8",pat:"plain"},
  hwanggeum:{L:0.5,h:0.36,n:1,tail:"fan",back:"#e8a020",belly:"#f8d860",pat:"gold"}};

// 몸 윤곽 (x 0=꼬리 끝 ~ 1=주둥이, y 는 -h/2~h/2)
function fishOutline(f){
  const s=new THREE.Shape(),h=f.h/2;
  if(f.tail==="cut"){ // 토막: 둥근 모서리 네모
    const r=h*0.5;s.moveTo(0.05,-h);s.lineTo(0.95,-h);s.quadraticCurveTo(1,-h,1,-h+r);s.lineTo(1,h-r);s.quadraticCurveTo(1,h,0.95,h);s.lineTo(0.05,h);s.quadraticCurveTo(0,h,0,h-r);s.lineTo(0,-h+r);s.quadraticCurveTo(0,-h,0.05,-h);return s}
  const t0=0.18; // 꼬리 시작
  s.moveTo(t0,0);
  s.bezierCurveTo(0.35,-h*1.05,0.75,-h*1.0,1,-h*0.05); // 배
  s.bezierCurveTo(0.75,h*1.05,0.35,h*1.08,t0,0);    // 등
  const tw=f.tail==="fan"?h*0.9:h*1.1;
  s.moveTo(t0+0.02,0);
  if(f.tail==="fork"){s.lineTo(0,tw);s.quadraticCurveTo(0.06,0,0,-tw);s.lineTo(t0+0.02,0)}
  else{s.lineTo(0.01,tw*0.8);s.quadraticCurveTo(-0.02,0,0.01,-tw*0.8);s.lineTo(t0+0.02,0)}
  return s}

// 비늘 질감 (canvas 위쪽 = 등, 오른쪽 = 머리)
function fishSkin(x,s,f,k){
  const g=x.createLinearGradient(0,0,0,s);g.addColorStop(0,f.back);g.addColorStop(0.55,f.back);g.addColorStop(0.62,f.belly);g.addColorStop(1,f.belly);
  x.fillStyle=g;x.fillRect(0,0,s,s);
  if(f.pat==="wave"){x.strokeStyle="rgba(15,30,35,.85)";x.lineWidth=4;for(let i=0;i<14;i++){const px=s*(0.15+i*0.055);x.beginPath();x.moveTo(px,s*0.06);
    x.bezierCurveTo(px+12,s*0.18,px-12,s*0.3,px+6,s*0.48);x.stroke()}}
  if(f.pat==="spots")specks(x,s,90,["rgba(70,50,30,.6)","rgba(220,190,140,.5)"],3,9,s*0.7);
  if(f.pat==="gold"){const gg=x.createLinearGradient(0,s*0.45,0,s);gg.addColorStop(0,"rgba(255,215,90,0)");gg.addColorStop(1,"rgba(255,200,60,.9)");x.fillStyle=gg;x.fillRect(0,s*0.45,s,s*0.55)}
  if(f.pat==="dots"){x.fillStyle="#1d2a33";x.beginPath();x.arc(s*0.78,s*0.4,9,0,TAU);x.fill();for(let r=0;r<4;r++)for(let i=0;i<16;i++){x.fillStyle="rgba(30,45,55,.5)";x.fillRect(s*(0.2+i*0.04),s*(0.1+r*0.08),3,3)}}
  if(f.pat==="silver"){for(let i=0;i<30;i++){x.strokeStyle=`rgba(255,255,255,${fr(0.3,0.7)})`;x.lineWidth=fr(1,3);const py=fr(0.1,0.9)*s;x.beginPath();x.moveTo(0,py);x.lineTo(s,py+fr(-8,8));x.stroke()}}
  // 비늘 결
  x.strokeStyle="rgba(255,255,255,.12)";x.lineWidth=1;for(let r=0;r<14;r++)for(let c=0;c<20;c++){x.beginPath();x.arc(c*s/20+(r%2)*6,r*s/14,6,0.2,Math.PI-0.2);x.stroke()}
  if(f.tail!=="cut"){ // 눈과 아가미
    x.fillStyle="#f3efe2";x.beginPath();x.arc(s*0.9,s*0.42,s*0.035,0,TAU);x.fill();x.fillStyle="#141414";x.beginPath();x.arc(s*0.905,s*0.42,s*0.02,0,TAU);x.fill();
    x.strokeStyle="rgba(40,30,30,.5)";x.lineWidth=3;x.beginPath();x.arc(s*0.98,s*0.5,s*0.17,Math.PI*0.75,Math.PI*1.25);x.stroke()}
  else{x.fillStyle="#eef0ea";x.fillRect(0,0,s*0.04,s);x.fillRect(s*0.96,0,s*0.04,s);} // 토막 단면
}
const T_SEA={
  raw:k=>ctex("sea_raw_"+k,(x,s)=>fishSkin(x,s,FISH[k],k)),
  // 구운 면: 날것 위에 노릇한 색을 덮고, 석쇠 자국과 그을음, 기름 윤기
  grilled:k=>ctex("sea_gr_"+k,(x,s)=>{fishSkin(x,s,FISH[k],k);
    x.fillStyle="rgba(196,128,48,.55)";x.fillRect(0,0,s,s);blots(x,s,40,"rgba(120,60,15,.45)",10,30,0,s*0.6);
    x.strokeStyle="rgba(50,25,10,.75)";x.lineWidth=7;for(let i=-2;i<7;i++){x.beginPath();x.moveTo(i*s/5,0);x.lineTo(i*s/5+s*0.35,s);x.stroke()}
    specks(x,s,50,["rgba(255,236,180,.6)"],1.5,4,s*0.6)}),
  gulRaw:()=>ctex("gulRaw",(x,s)=>{radial(x,s,"#efe9dc","#cfc6b4");blots(x,s,8,"rgba(80,80,90,.5)",20,40,s*0.36,s*0.46);specks(x,s,40,["rgba(255,255,255,.5)"],2,5,s*0.3)}),
  guljeonRaw:()=>ctex("guljeonRaw",(x,s)=>{radial(x,s,"#f6d66a","#eec350");blots(x,s,5,"rgba(200,195,180,.9)",22,34,0,s*0.18);specks(x,s,50,["rgba(255,250,220,.6)"],2,5)}),
  guljeon:()=>ctex("guljeon",(x,s)=>{radial(x,s,"#f2c454","#d99a34");blots(x,s,5,"rgba(170,150,120,.7)",20,30,0,s*0.18);blots(x,s,60,"rgba(150,85,20,.35)",5,12,s*0.3,s*0.5);specks(x,s,30,["rgba(255,245,200,.7)"],1.5,4)})};

// 생선 한 마리(토막) 모양. 앞면 질감을 바꾸면(capMat.map) 구운 쪽이 보여요
function fishMesh(k,capMat,sideMat){
  const f=FISH[k],g=new THREE.ExtrudeGeometry(fishOutline(f),{depth:0.02,bevelEnabled:true,bevelThickness:f.tail==="cut"?0.05:0.07,bevelSize:0.035,bevelSegments:3,curveSegments:14});
  const m=solid(new THREE.Mesh(g,[capMat,sideMat]));m.rotation.x=-Math.PI/2;m.scale.setScalar(f.L);m.position.set(-f.L/2,0.012,0);return m}
function fishMats(k,cooked){const f=FISH[k],t=cooked?T_SEA.grilled(k):T_SEA.raw(k);t.repeat.set(1,1/f.h);t.offset.set(0,0.5);
  return {cap:new THREE.MeshPhongMaterial({map:t,shininess:cooked?20:55,specular:0x555555}),side:new THREE.MeshLambertMaterial({color:cooked?0xb07a3a:new THREE.Color(f.belly).getHex()})}}
// 생선 묶음 (전어 세 마리, 갈치 세 토막 …). userData.cap 이 앞면 재질
function fishGroup(k,cooked){
  const f=FISH[k],M=fishMats(k,cooked),g=new THREE.Group();
  for(let i=0;i<f.n;i++){const o=new THREE.Group();o.add(fishMesh(k,M.cap,M.side));const off=(i-(f.n-1)/2);
    o.position.set(f.tail==="cut"?0:off*0.01,0,off*(f.L*f.h+0.025));o.rotation.y=f.n>1?off*0.08:0;g.add(o)}
  g.userData.cap=M.cap;g.userData.side=M.side;return g}
// 굴 한 접시 (사발에 굴살 여러 개)
function gulBowl(){const g=sabal(0.1,0.06);for(let i=0;i<6;i++){const o=lumpy(0.028,0.3,lmat(T_SEA.gulRaw()),10);o.scale.set(1.2,0.4,0.9);o.position.set(fr(-0.04,0.04),0.05+i*0.006,fr(-0.04,0.04));o.rotation.y=fr(0,TAU);g.add(o)}return g}
function gulPiece(){const o=lumpy(0.022,0.3,lmat(T_SEA.gulRaw()),10);o.scale.set(1.2,0.4,0.9);return o}

// 완성 접시
Object.keys(FISH).forEach(k=>{DISH["gui_"+k]=g=>{g.add(plateMesh());const f=fishGroup(k,true);const s=Math.min(1,0.27/FISH[k].L);f.scale.setScalar(s*0.95);f.position.y=0.03;f.rotation.y=-0.35;g.add(f);
  const l=leafPiece(T.leaf(false),0.04,0.06);l.position.set(0.1,0.045,0.08);g.add(l)}});
DISH.guljeon=g=>{g.add(plateMesh());for(let i=0;i<5;i++){const a=i/5*TAU,d=disc(0.045,0.018,lmat(T_SEA.guljeon()),0xd9a441,0.12);d.position.set(Math.cos(a)*0.08,0.04+i*0.004,Math.sin(a)*0.08);g.add(d)}};

/* ---------- 장날 생선 트럭 (장터에 4·9일만) ---------- */
const seaTruck=new THREE.Group();seaTruck.userData.kind="seatruck";
seaTruck.add(box(1.5,1.3,1.6,0x3f6f9a,1.6,0.95,0));                // 운전석
seaTruck.add(box(0.06,0.55,1.3,0x9cc4dc,2.36,1.25,0));             // 앞유리
seaTruck.add(box(2.4,0.2,1.7,0x8a8e92,-0.35,0.55,0));              // 짐칸 바닥
[[-1.55,0],[0.85,0]].forEach(([x])=>seaTruck.add(box(0.06,0.35,1.7,0xc9ccd0,x,0.82,0)));
[-0.85,0.85].forEach(z=>seaTruck.add(box(2.4,0.35,0.06,0xc9ccd0,-0.35,0.82,z)));
[[1.6,0.7],[1.6,-0.7],[-1.0,0.7],[-1.0,-0.7]].forEach(([x,z])=>{const w=cyl(0.3,0.3,0.2,0x222222,x,0.3,z,14);w.rotation.x=Math.PI/2;seaTruck.add(w)});
// 얼음 상자와 생선
[[-1.0,-0.35],[-1.0,0.35],[0.2,-0.35],[0.2,0.35]].forEach(([x,z],i)=>{seaTruck.add(box(0.95,0.28,0.6,0xf2f4f6,x,0.79,z));seaTruck.add(box(0.85,0.04,0.5,0xdff0f8,x,0.94,z));
  const k=["mackerel","galchi","jeoneo","mackerel"][i],f=fishGroup(k,false);f.scale.setScalar(2.2);f.position.set(x,0.96,z);f.rotation.y=Math.PI/2*(i%2);seaTruck.add(f)});
// 확성기와 천막
seaTruck.add(cyl(0.02,0.02,0.6,0x666666,1.6,1.9,0,6));{const sp=cyl(0.05,0.16,0.22,0xdedede,1.6,2.2,0.12,10);sp.rotation.x=Math.PI/2;seaTruck.add(sp)}
seaTruck.add(box(2.6,0.06,1.9,0x2f6f9f,-0.35,2.05,0));[[-1.55,-0.85],[-1.55,0.85],[0.85,-0.85],[0.85,0.85]].forEach(([x,z])=>seaTruck.add(cyl(0.035,0.035,1.3,0x9a9a9a,x,1.4,z,6)));
seaTruck.position.set(-3.6,0,4.2);seaTruck.rotation.y=Math.PI/2;plaza.add(seaTruck);
{const l=label("생선 트럭",1);l.position.set(0,3.0,0);seaTruck.add(l)}
