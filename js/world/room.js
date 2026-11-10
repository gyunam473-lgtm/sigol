/* 집 안: 옛날 시골집처럼 칸이 나뉘어 있어요. 앞쪽 벽은 잘라서 들여다봐요 (인형의 집처럼).
   - 작은 기와집: 부엌 | 안방
   - 넓힌 기와집: 부엌 | 안방 | 대청마루 | 건넌방
   - 큰 기와집: 위와 같고, 사랑채를 누르면 따로 사랑방으로 들어가요
   칸과 칸 사이는 벽이라, 앞 툇마루를 따라 옆 칸으로 건너가요. 마루 앞 댓돌(고무신)을 누르면 밖으로 나가요.
   부엌: 흙바닥, 부뚜막과 아궁이(불 때면 안방 구들이 뜨끈해요). 늘 있는 살림: 자개장, 요와 이불, 앉은뱅이 책상(살림 장부)
   목공소에서 산 가구(data.js 의 FURN)는 정해진 자리에 놓여요 (FURN_SLOT).
   집 안은 마을에서 멀리 떨어진 곳(ROOM)에 따로 지어 두고, 들어가면 그쪽으로 옮겨 가요 (play/house.js). */

let inHouse=false,LIE=null,HOUSE_IN="main"; // 집 안에 있는지, 누워 있는지, 어느 채(main 안채 · sarang 사랑채)
const ROOM={x:0,z:-200,W:7,D:4.4,x0:-3.5};
const room=new THREE.Group();room.position.set(ROOM.x,0,ROOM.z);room.visible=false;scene.add(room);
const roomLight=new THREE.PointLight(0xffc88a,0.4,22,1.2);roomLight.position.set(0,2.6,0.4);room.add(roomLight);
// 창호지 창: 낮엔 햇빛이 비쳐 환하고 밤엔 어두워요
const roomWinMat=new THREE.MeshLambertMaterial({color:0xf8f2e2,emissive:0x000000});
let roomFloors=[],roomMaru=null,roomYo=null,roomDesk=null,roomDoor=null,roomWins=[],roomCloset=null,agungi=null,agFire=null,ondolMat=null,
  blanketOpen,blanketFold,roomKey="",ROOM_OBS=[],SPACES=[],furnObjs=[];

// 장판 무늬 (노란 기름 먹인 종이 바닥, 네모 이음새)
function jangpanTex(){return ctex("jangpan",(x,s)=>{x.fillStyle="#d9a85a";x.fillRect(0,0,s,s);
  for(let i=0;i<500;i++){x.fillStyle=`rgba(${150+Math.random()*60|0},${90+Math.random()*40|0},30,${Math.random()*0.08})`;x.fillRect(Math.random()*s,Math.random()*s,8+Math.random()*30,2+Math.random()*6)}
  x.strokeStyle="rgba(120,70,20,.35)";x.lineWidth=3;for(let k=0;k<=4;k++){x.beginPath();x.moveTo(k*s/4,0);x.lineTo(k*s/4,s);x.stroke();x.beginPath();x.moveTo(0,k*s/4);x.lineTo(s,k*s/4);x.stroke()}},256)}
// 대청 마룻바닥 (나뭇결 널빤지)
function maruTex(){return ctex("maruFloor",(x,s)=>{for(let i=0;i<8;i++){x.fillStyle=i%2?"#b8915e":"#ad8654";x.fillRect(i*s/8,0,s/8,s);
  x.strokeStyle="rgba(90,60,30,.25)";x.lineWidth=1;for(let k=0;k<6;k++){x.beginPath();x.moveTo(i*s/8+4+k*4,0);x.bezierCurveTo(i*s/8+k*4,s/3,i*s/8+8+k*4,s*2/3,i*s/8+4+k*4,s);x.stroke()}
  x.fillStyle="rgba(60,40,20,.5)";x.fillRect(i*s/8,0,1.5,s)}},256)}
// 부엌 흙바닥
function earthTex(){return ctex("earthFloor",(x,s)=>{x.fillStyle="#8f7152";x.fillRect(0,0,s,s);
  for(let i=0;i<900;i++){x.fillStyle=`rgba(${60+Math.random()*80|0},${45+Math.random()*50|0},${25+Math.random()*30|0},${0.15+Math.random()*0.2})`;x.beginPath();x.arc(Math.random()*s,Math.random()*s,1+Math.random()*3,0,7);x.fill()}},256)}
// 이불 무늬 (분홍 바탕에 꽃)
function ibulTex(){return ctex("ibul",(x,s)=>{x.fillStyle="#d8586a";x.fillRect(0,0,s,s);
  for(let i=0;i<14;i++){const cx=(i%4)*s/4+s/8+(Math.floor(i/4)%2)*s/8,cy=Math.floor(i/4)*s/3.5+s/8;
    for(let p=0;p<5;p++){const a=p/5*Math.PI*2;x.fillStyle="#f6c2c8";x.beginPath();x.ellipse(cx+Math.cos(a)*9,cy+Math.sin(a)*9,7,5,a,0,Math.PI*2);x.fill()}
    x.fillStyle="#f2d06a";x.beginPath();x.arc(cx,cy,5,0,Math.PI*2);x.fill()}
  x.strokeStyle="#f6e6c8";x.lineWidth=10;x.strokeRect(5,5,s-10,s-10)},256)}
// 자개장 무늬 (검은 옻칠에 자개 학과 구름)
function jagaeTex(){return ctex("jagae",(x,s)=>{x.fillStyle="#1d1a18";x.fillRect(0,0,s,s);
  const g=x.createLinearGradient(0,0,s,s);g.addColorStop(0,"#cfe8e4");g.addColorStop(0.5,"#f2e6f6");g.addColorStop(1,"#d6eef6");x.fillStyle=g;x.strokeStyle=g;x.lineWidth=3;
  for(let i=0;i<9;i++){const cx=30+Math.random()*(s-60),cy=30+Math.random()*(s-60);x.beginPath();x.ellipse(cx,cy,10+Math.random()*12,4,Math.random()*3,0,Math.PI*2);x.fill()}
  x.beginPath();x.moveTo(s*0.3,s*0.55);x.quadraticCurveTo(s*0.5,s*0.35,s*0.72,s*0.5);x.quadraticCurveTo(s*0.5,s*0.45,s*0.3,s*0.55);x.fill(); // 학 날개
  x.strokeRect(10,10,s-20,s-20)},256)}
const texRep=(t,a,b)=>{const c=t.clone();c.needsUpdate=true;c.wrapS=c.wrapT=THREE.RepeatWrapping;c.repeat.set(a,b);return c};
function wallBox(w,h,d,x,y,z,c=0xf3ead2){const m=box(w,h,d,c,x,y,z);m.castShadow=false;room.add(m);return m}
const RWOOD=0x6b4a2e;

// 칸 나누기 (왼쪽부터)
function houseSpaces(which,lv){
  if(which==="sarang")return [{k:"sarang",w:4.6,floor:"jangpan"}];
  const L=[{k:"kitchen",w:2.9,floor:"earth"},{k:"anbang",w:4.2,floor:"jangpan"}];
  if(lv>=2)L.push({k:"daecheong",w:3.6,floor:"wood"},{k:"geonneon",w:3.2,floor:"jangpan"});
  return L}
const spaceOf=lx=>SPACES.find(s=>lx>=s.x0-0.01&&lx<=s.x1+0.01)||SPACES[0];

// 창호 창 (뒷벽)
function hanjiWindow(cx,cy,z,ww=1.4,wh=1.0){const g=new THREE.Group();g.userData.kind="roomwin";
  const p=new THREE.Mesh(new THREE.PlaneGeometry(ww,wh),roomWinMat);p.position.z=0.01;g.add(p);
  g.add(box(ww+0.14,0.08,0.06,RWOOD,0,wh/2,0.03));g.add(box(ww+0.14,0.08,0.06,RWOOD,0,-wh/2,0.03));g.add(box(0.08,wh,0.06,RWOOD,-ww/2,0,0.03));g.add(box(0.08,wh,0.06,RWOOD,ww/2,0,0.03));
  for(let i=1;i<6;i++)g.add(box(0.025,wh,0.03,0x8a6440,-ww/2+i*ww/6,0,0.03));for(let i=1;i<4;i++)g.add(box(ww,0.025,0.03,0x8a6440,0,-wh/2+i*wh/4,0.03));
  g.children.forEach(m=>m.castShadow=false);g.position.set(cx,cy,z);room.add(g);roomWins.push(g);return g}
function spaceLabel(t,x,z){const l=label(t,0.75);l.position.set(x,2.75,z);room.add(l);return l}

/* ---------- 늘 있는 살림 ---------- */
function makeYo(x,z){const g=new THREE.Group();g.userData.kind="yo";
  g.add(box(2.1,0.1,1.05,0xf4efe2,0,0.05,0));g.add(box(2.14,0.06,1.09,0x6a8fc0,0,0.03,0)); // 요 (흰 홑청, 파란 테)
  g.add(box(0.32,0.16,0.62,0xe8d9a0,-0.86,0.18,0));g.add(box(0.04,0.17,0.64,0xd8583f,-0.69,0.18,0));g.add(box(0.04,0.17,0.64,0xd8583f,-1.03,0.18,0)); // 베개
  const im=new THREE.MeshLambertMaterial({map:ibulTex()});
  blanketOpen=new THREE.Mesh(new THREE.BoxGeometry(1.55,0.28,1.12),im);blanketOpen.position.set(0.3,0.35,0);blanketOpen.castShadow=true;blanketOpen.visible=false;g.add(blanketOpen);
  blanketFold=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.3,1.0),im);blanketFold.position.set(0.72,0.25,0);blanketFold.castShadow=true;g.add(blanketFold); // 개어 둔 이불
  g.position.set(x,0,z);room.add(g);g.userData.head=new THREE.Vector3(x-0.86,0,z);g.userData.feet=new THREE.Vector3(x+0.95,0,z);
  const l=label("이불",0.8);l.position.set(x,1.0,z);room.add(l);g.userData.label=l;return g}
function makeCloset(x,z){const g=new THREE.Group();g.userData.kind="closet";
  const jm=new THREE.MeshLambertMaterial({map:jagaeTex()}),cw=1.7,ch=1.75,cd=0.55,K=M(0x1d1a18);
  const body=new THREE.Mesh(new THREE.BoxGeometry(cw,ch,cd),[K,K,K,K,jm,K]);body.position.y=ch/2+0.12;body.castShadow=true;g.add(body);
  [-cw/2+0.1,cw/2-0.1].forEach(x=>g.add(box(0.1,0.12,cd,0x2a2522,x,0.06,0)));
  g.add(box(0.02,ch-0.1,0.02,0xc9a24a,0,ch/2+0.12,cd/2+0.01));[-0.12,0.12].forEach(x=>g.add(sph(0.035,0xd8b45a,x,ch/2+0.15,cd/2+0.02)));
  g.position.set(x,0,z);room.add(g);return g}
function makeDesk(x,z){const g=new THREE.Group();g.userData.kind="desk";
  g.add(box(1.2,0.06,0.6,0x7a4a2a,0,0.4,0));[[-0.54,-0.24],[0.54,-0.24],[-0.54,0.24],[0.54,0.24]].forEach(([a,b])=>g.add(box(0.06,0.38,0.06,0x6a3e22,a,0.19,b)));
  g.add(box(0.36,0.04,0.26,0x3f5f7f,-0.18,0.45,0.04));g.add(box(0.34,0.045,0.24,0xf6f0e2,-0.18,0.448,0.04)); // 장부
  g.add(cyl(0.02,0.012,0.22,0x2b2a24,0.12,0.5,0.08,6).rotateZ(1.3)); // 붓
  g.add(cyl(0.05,0.07,0.08,0x8a6a4a,0.42,0.47,-0.12,10));g.add(cyl(0.012,0.012,0.06,0xfff0c0,0.42,0.54,-0.12,6)); // 등잔
  const bs=cyl(0.36,0.38,0.08,0x3f6f5a,0,0.04,0.75,16);bs.scale.z=0.9;g.add(bs); // 방석
  g.position.set(x,0,z);room.add(g);const l=label("살림 장부",0.8);l.position.set(x,1.15,z);room.add(l);return g}
// 부엌 부뚜막과 아궁이 (넓힌 집부터 솥이 둘)
function makeKitchenStove(sp,lv){const g=new THREE.Group(),w=2.3,two=lv>=2;
  g.add(box(w,0.75,0.95,0xb8a68a,0,0.375,0));g.add(box(w+0.1,0.05,1.0,0x9c8a6e,0,0.77,0));
  (two?[-0.55,0.55]:[0]).forEach(x=>{g.add(cyl(0.38,0.28,0.26,0x2d2b29,x,0.86,0,18));g.add(cyl(0.4,0.4,0.04,0x3a3836,x,1.0,0,18));g.add(cyl(0.05,0.05,0.07,0x2d2b29,x,1.05,0,8))});
  agungi=new THREE.Group();agungi.userData.kind="agungi";
  (two?[-0.55,0.55]:[0]).forEach(x=>{agungi.add(box(0.46,0.34,0.06,0x2a1d14,x,0.22,0.48))});
  agFire=new THREE.MeshBasicMaterial({color:0xff8a2a,transparent:true,opacity:0});
  (two?[-0.55,0.55]:[0]).forEach(x=>{const f=new THREE.Mesh(new THREE.BoxGeometry(0.38,0.24,0.02),agFire);f.position.set(x,0.21,0.52);agungi.add(f)});
  g.add(agungi);for(let i=0;i<4;i++)g.add(cyl(0.05,0.05,0.5,0x7a5a3a,-w/2-0.25,0.06+i*0.09,0.2+(i%2)*0.09,6).rotateZ(Math.PI/2)); // 장작
  g.position.set(sp.cx,0,-ROOM.D/2+0.52);room.add(g);
  const l=label("아궁이",0.8);l.position.set(sp.cx,1.45,-ROOM.D/2+0.9);room.add(l);
  agungi.userData.stand=[ROOM.x+sp.cx+0.2,ROOM.z-ROOM.D/2+1.55];
  return [sp.cx-w/2-0.45,-ROOM.D/2,sp.cx+w/2,-ROOM.D/2+1.05]}

/* ---------- 목공소에서 사 오는 가구: 모양과 놓는 자리 ---------- */
// at(sp): [x, z, 돌림] (sp = 그 칸), size: 돌리기 전 바닥 차지 [가로, 세로] (벽에 거는 건 없음)
const FURN_SLOT={
  bandaji:{at:s=>[s.x0+2.75,-ROOM.D/2+0.3,0],size:[1.1,0.5],build:()=>{const g=new THREE.Group();g.add(box(1.1,0.6,0.5,0x7a3e22,0,0.36,0));g.add(box(1.14,0.06,0.54,0x5a2e18,0,0.69,0));
    [-0.3,0.3].forEach(x=>g.add(box(0.2,0.24,0.02,0xb8963a,x,0.42,0.26)));g.add(cyl(0.12,0.16,0.3,0x3a5a7a,0.3,0.87,0,12));g.add(cyl(0.08,0.12,0.06,0x2e4a66,0.3,1.05,0,12));return g}},
  gyeongdae:{at:s=>[s.x1-0.3,0.9,-Math.PI/2],size:[0.65,0.4],build:()=>{const g=new THREE.Group();g.add(box(0.6,0.3,0.35,0x6a3a20,0,0.15,0));g.add(box(0.06,0.5,0.06,0x5a2e18,-0.22,0.5,-0.1));g.add(box(0.06,0.5,0.06,0x5a2e18,0.22,0.5,-0.1));
    const mir=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.48,0.02),new THREE.MeshLambertMaterial({color:0xcfe0e8,emissive:0x223038}));mir.position.set(0,0.62,-0.09);g.add(mir);g.add(box(0.48,0.56,0.02,0x5a2e18,0,0.62,-0.11));return g}},
  byeongpung:{at:s=>[s.x0+0.14,0.35,0],size:[0.3,2.0],build:()=>{const g=new THREE.Group();for(let i=0;i<4;i++){const p=box(0.04,1.2,0.5,i%2?0xe8dcc0:0xeee3c8,0,0.68,(i-1.5)*0.48);p.rotation.y=(i%2?0.25:-0.25);g.add(p);
    g.add(box(0.05,0.08,0.5,0x6b3a22,0,1.3,(i-1.5)*0.48));g.add(sph(0.06,[0xc8572f,0x4f7a3a,0x3f6f8f,0xd8a33a][i],0.03,0.85,(i-1.5)*0.48));g.add(sph(0.05,0x4f7a3a,0.03,0.62,(i-1.5)*0.48+0.08))}return g}},
  hwaro:{at:s=>[s.x0+0.6,1.6,0],size:[0.5,0.5],build:()=>{const g=new THREE.Group();g.add(cyl(0.22,0.16,0.26,0x3a3634,0,0.13,0,14));g.add(cyl(0.2,0.2,0.02,0x5a4a40,0,0.25,0,14));
    for(let i=0;i<5;i++)g.add(sph(0.05,0xd8501f,Math.cos(i)*0.09,0.27,Math.sin(i)*0.09));g.add(cyl(0.008,0.008,0.35,0x555555,0.08,0.3,0,4).rotateZ(0.9));return g}},
  clock:{at:s=>[s.x1-1.0,-ROOM.D/2+0.1,0],wall:1.75,build:()=>{const g=new THREE.Group();g.add(box(0.36,0.75,0.12,0x5a2e18,0,0,0));
    const face=cyl(0.13,0.13,0.02,0xf4ecd8,0,0.18,0.065,20);face.rotation.x=Math.PI/2;g.add(face);g.add(box(0.012,0.09,0.01,0x222222,0,0.21,0.08));g.add(box(0.07,0.012,0.01,0x222222,0.03,0.18,0.08));
    g.add(box(0.2,0.3,0.02,0xcfe0e8,0,-0.17,0.065));g.add(sph(0.05,0xd8b45a,0,-0.22,0.07));return g}},
  mulddok:{at:s=>[s.x0+0.42,-0.6,0],size:[0.7,0.7],build:()=>{const g=new THREE.Group();g.add(cyl(0.3,0.24,0.7,0x5a3a28,0,0.35,0,16));g.add(cyl(0.22,0.28,0.1,0x4a2e1f,0,0.72,0,16));
    g.add(cyl(0.2,0.2,0.02,0x3a5a6a,0,0.7,0,16));const b=new THREE.Group();b.add(cyl(0.09,0.06,0.06,0xc9a66b,0,0,0,10));b.add(box(0.04,0.03,0.18,0xc9a66b,0,0,0.12));b.position.set(0.05,0.76,0);g.add(b);return g}}, // 바가지
  chanjang:{at:s=>[s.x1-0.32,0.95,-Math.PI/2],size:[1.05,0.5],build:()=>{const g=new THREE.Group();g.add(box(1.0,1.4,0.45,0x7a4a2a,0,0.7,0));
    [0.95,0.45].forEach(y=>{g.add(box(0.9,0.42,0.02,0xbfd6e0,0,y,0.23));g.add(box(0.02,0.42,0.025,0x5a2e18,0,y,0.235))});
    for(let i=0;i<3;i++)g.add(cyl(0.08,0.05,0.06,0xf2eee6,-0.3+i*0.3,0.98,0.05,10));for(let i=0;i<3;i++)g.add(cyl(0.12,0.12,0.03,0xf2eee6,-0.3+i*0.3,0.42,0.05,14));return g}},
  dwiju:{at:s=>[s.x0+0.5,1.4,Math.PI/2],size:[0.95,0.6],build:()=>{const g=new THREE.Group();g.add(box(0.9,0.6,0.55,0x8a5a32,0,0.42,0));g.add(box(0.94,0.05,0.59,0x6a4026,0,0.74,0));
    [[-0.4,-0.24],[0.4,-0.24],[-0.4,0.24],[0.4,0.24]].forEach(([a,b])=>g.add(box(0.08,0.14,0.08,0x5a3420,a,0.07,b)));g.add(box(0.3,0.04,0.02,0xb8963a,0,0.6,0.28));return g}},
  seonban:{at:s=>[s.cx,-ROOM.D/2+0.12,0],wall:1.75,build:()=>{const g=new THREE.Group();g.add(box(1.6,0.05,0.22,0x7a4a2a,0,0,0));[-0.7,0.7].forEach(x=>g.add(box(0.05,0.2,0.2,0x6a3e22,x,-0.1,0)));
    for(let i=0;i<5;i++)g.add(cyl(0.09,0.06,0.07,i%2?0xf2eee6:0xe2d8c0,-0.55+i*0.27,0.06,0,10));return g}},
  radio:{at:s=>[s.x0+0.6,-ROOM.D/2+0.4,0],size:[0.7,0.5],build:()=>{const g=new THREE.Group();g.add(box(0.6,0.5,0.4,0x7a4a2a,0,0.25,0)); // 작은 탁자
    g.add(box(0.46,0.28,0.2,0x8a5a32,0,0.64,0));g.add(box(0.2,0.18,0.01,0xd8c8a0,-0.08,0.65,0.105));[0.11,0.16].forEach(x=>g.add(cyl(0.025,0.025,0.02,0x2a2a2a,x,0.65,0.11,10).rotateX(Math.PI/2)));
    g.add(cyl(0.006,0.006,0.4,0x999999,0.18,0.95,-0.05,4).rotateZ(-0.3));return g}},
  nancho:{at:s=>[s.x1-0.4,-ROOM.D/2+0.4,0],size:[0.4,0.4],build:()=>{const g=new THREE.Group();g.add(cyl(0.16,0.12,0.24,0xe8e2d4,0,0.12,0,12));
    for(let i=0;i<7;i++){const l=box(0.02,0.5,0.04,0x3f7a3a,0,0.42,0);l.rotation.z=(i-3)*0.22;l.rotation.x=(i%2-0.5)*0.3;g.add(l)}g.add(sph(0.04,0xf2e8a0,0.12,0.6,0));return g}},
  jokja:{at:s=>[s.cx,-ROOM.D/2+0.08,0],wall:1.45,build:()=>{const g=new THREE.Group();g.add(box(0.5,1.1,0.02,0xf2ead6,0,0,0));g.add(box(0.6,0.04,0.04,0x5a2e18,0,0.57,0.01));g.add(box(0.6,0.05,0.05,0x5a2e18,0,-0.57,0.01));
    [0.3,0.05,-0.2].forEach(y=>g.add(box(0.14,0.14,0.01,0x2b2a24,0,y,0.012)));return g}},
  chaekjang:{at:s=>[s.x0+0.65,-ROOM.D/2+0.28,0],size:[1.0,0.45],build:()=>{const g=new THREE.Group();g.add(box(0.95,1.5,0.4,0x7a4a2a,0,0.75,0));
    [0.35,0.8,1.25].forEach(y=>{g.add(box(0.85,0.03,0.36,0x6a3e22,0,y,0.02));for(let i=0;i<7;i++)g.add(box(0.07,0.32,0.26,[0x8a3a2a,0x3f5f7f,0xd8b45a,0x4f7a3a][i%4],-0.36+i*0.11,y+0.17,0.03))});return g}},
  jaebongteul:{at:s=>[s.x1-0.7,-ROOM.D/2+0.5,0],size:[0.9,0.6],build:()=>{const g=new THREE.Group();g.add(box(0.8,0.04,0.45,0x7a4a2a,0,0.72,0));[-0.32,0.32].forEach(x=>g.add(box(0.05,0.7,0.4,0x2a2a2a,x,0.36,0)));
    g.add(box(0.5,0.08,0.4,0x2a2a2a,0,0.12,0));g.add(box(0.42,0.14,0.12,0x1d1d1d,0,0.82,0));g.add(box(0.1,0.22,0.12,0x1d1d1d,0.18,0.92,0));g.add(box(0.03,0.12,0.03,0xd8d8d8,-0.16,0.7,0.02));return g}},
  sonnim:{at:s=>[s.x0+0.5,0.8,Math.PI/2],size:[1.0,0.65],build:()=>{const g=new THREE.Group();[0x6a8fc0,0xd8586a,0x4f7a3a,0xe8c86a].forEach((c,i)=>g.add(box(0.95,0.14,0.6,c,0,0.07+i*0.15,0)));g.add(box(0.45,0.12,0.3,0xf4efe2,0,0.68,0));return g}},
  seoan:{at:s=>[s.cx,-ROOM.D/2+0.6,0],size:[1.1,0.55],build:()=>{const g=new THREE.Group();g.add(box(1.0,0.05,0.42,0x5a2e18,0,0.36,0));[-0.45,0.45].forEach(x=>g.add(box(0.06,0.34,0.38,0x4a2414,x,0.17,0)));
    g.add(box(0.28,0.04,0.2,0x2b2a24,-0.25,0.4,0));g.add(box(0.3,0.06,0.22,0xe8dcc0,0.15,0.41,0));g.add(cyl(0.015,0.01,0.2,0x2b2a24,0.35,0.42,0.1,6).rotateZ(1.4));
    const bs=cyl(0.36,0.38,0.08,0x8a3a2a,0,0.04,0.65,16);bs.scale.z=0.9;g.add(bs);return g}},
  mungap:{at:s=>[s.x1-1.0,-ROOM.D/2+0.28,0],size:[1.6,0.4],build:()=>{const g=new THREE.Group();g.add(box(1.5,0.55,0.36,0x6a3a20,0,0.3,0));
    for(let i=0;i<4;i++){g.add(box(0.3,0.36,0.02,0x7a4a2a,-0.54+i*0.36,0.3,0.185));g.add(sph(0.025,0xd8b45a,-0.54+i*0.36,0.3,0.2))}g.add(cyl(0.1,0.14,0.28,0x3a5a7a,0.4,0.72,0,12));return g}},
  sabang:{at:s=>[s.x0+0.45,-ROOM.D/2+0.4,0],size:[0.6,0.6],build:()=>{const g=new THREE.Group();[0.02,0.5,1.0,1.45].forEach(y=>g.add(box(0.5,0.04,0.5,0x6a3a20,0,y,0)));
    [[-0.23,-0.23],[0.23,-0.23],[-0.23,0.23],[0.23,0.23]].forEach(([a,b])=>g.add(box(0.04,1.47,0.04,0x5a2e18,a,0.73,b)));
    g.add(cyl(0.1,0.14,0.3,0xe8e2d4,0,0.67,0,12));g.add(cyl(0.12,0.09,0.25,0x6a8fa8,0,1.15,0,12));g.add(box(0.2,0.06,0.15,0x3a3634,0,1.52,0));return g}}};

function buildRoom(){
  const lv=S.houseLv||1,which=HOUSE_IN,key=which+lv+Object.keys(S.furn||{}).sort().join(",");
  if(roomKey===key)return;roomKey=key;
  [...room.children].forEach(c=>{if(c!==roomLight)room.remove(c)});
  roomFloors=[];roomWins=[];furnObjs=[];roomYo=roomDesk=roomCloset=agungi=null;ondolMat=null;
  const D=4.4,H=2.4,z0=-D/2,z1=D/2;SPACES=houseSpaces(which,lv);
  const TW=SPACES.reduce((a,s)=>a+s.w,0);ROOM.W=TW;ROOM.D=D;ROOM.x0=-TW/2;
  let x=ROOM.x0;SPACES.forEach(s=>{s.x0=x;s.x1=x+s.w;s.cx=x+s.w/2;x+=s.w});
  const x0=ROOM.x0,x1=-ROOM.x0;
  // 바깥은 어둡게 덮어요 (하늘과 마을이 안 보이게)
  const shell=new THREE.Mesh(new THREE.BoxGeometry(40,16,30),new THREE.MeshBasicMaterial({color:0x2a211a,side:THREE.BackSide,fog:false}));shell.position.set(0,6,3);room.add(shell);
  const obs=[];const R=(a,b,c,d)=>obs.push([a+ROOM.x,b+ROOM.z,c+ROOM.x,d+ROOM.z]);
  // 칸마다 바닥
  SPACES.forEach(s=>{const t=s.floor==="earth"?texRep(earthTex(),s.w/2,D/2):s.floor==="wood"?texRep(maruTex(),s.w/1.4,1):texRep(jangpanTex(),s.w/1.6,D/1.6);
    const mat=new THREE.MeshLambertMaterial({map:t});if(s.k==="anbang")ondolMat=mat;
    const f=new THREE.Mesh(new THREE.PlaneGeometry(s.w,D),mat);f.rotation.x=-Math.PI/2;f.position.set(s.cx,s.floor==="earth"?0.005:0.01,0);f.receiveShadow=true;f.userData.kind="roomfloor";room.add(f);roomFloors.push(f)});
  // 앞 툇마루 (칸을 건너다니는 길)
  roomMaru=new THREE.Group();roomMaru.userData.kind="roomfloor";
  for(let i=0;i<Math.round(TW/0.4);i++)roomMaru.add(box(0.38,0.06,1.2,i%2?0xb08a5a:0xa88252,x0+0.2+i*0.4,-0.02,z1+0.6));
  roomMaru.children.forEach(m=>m.castShadow=false);room.add(roomMaru);
  // 벽: 뒤(부엌은 그을린 색), 양 끝, 칸 사이 벽
  SPACES.forEach(s=>wallBox(s.w,H,0.12,s.cx,H/2,z0-0.06,s.k==="kitchen"?0xcfc2a6:0xf3ead2));
  wallBox(0.12,H,D,x0-0.06,H/2,0);wallBox(0.12,H,D,x1+0.06,H/2,0);
  SPACES.slice(1).forEach(s=>{wallBox(0.12,H,D-0.1,s.x0,H/2,-0.05);R(s.x0-0.08,z0,s.x0+0.08,z1)});
  // 나무 기둥과 인방
  SPACES.forEach(s=>{[s.x0,s.x1].forEach(px=>{wallBox(0.2,H+0.1,0.2,px,H/2,z1,RWOOD);wallBox(0.2,H+0.1,0.2,px,H/2,z0,RWOOD)})});
  wallBox(TW,0.14,0.16,0,H-0.07,z0+0.02,RWOOD);wallBox(TW,0.1,0.16,0,0.05,z0+0.02,0x8a6440);
  R(x0-2,z0-2,x0,z1+3);R(x1,z0-2,x1+2,z1+3);R(x0-2,z0-2,x1+2,z0);R(x0-2,z1+1.2,x1+2,z1+3);
  // 칸마다 꾸밈과 늘 있는 살림
  const NAME={kitchen:"부엌",anbang:"안방",daecheong:"대청마루",geonneon:"건넌방",sarang:"사랑방"};
  SPACES.forEach(s=>{spaceLabel(NAME[s.k],s.cx,z0+0.3);
    if(s.k==="kitchen"){const r=makeKitchenStove(s,lv);R(...r);
      const sal=new THREE.Group();for(let i=0;i<5;i++)sal.add(box(0.05,0.55,0.05,RWOOD,-0.3+i*0.15,0,0));sal.add(box(0.75,0.06,0.06,RWOOD,0,0.3,0));sal.add(box(0.75,0.06,0.06,RWOOD,0,-0.3,0));sal.position.set(s.x1-0.5,1.85,z0+0.02);room.add(sal)} // 살창
    if(s.k==="anbang"){hanjiWindow(s.x0+2.75,1.45,z0+0.01);roomYo=makeYo(s.x0+1.45,0.35);R(s.x0+0.4,-0.17,s.x0+2.5,0.87);
      roomCloset=makeCloset(s.x0+1.05,z0+0.35);R(s.x0+0.2,z0,s.x0+1.9,z0+0.65);roomDesk=makeDesk(s.x1-1.0,z0+0.5);R(s.x1-1.6,z0,s.x1-0.4,z0+0.8)}
    if(s.k==="daecheong"){[-0.5,0.5].forEach(d=>{wallBox(0.9,1.9,0.05,s.cx+d,1.0,z0+0.03,0x9a6a45);wallBox(0.05,1.9,0.06,s.cx+d,1.0,z0+0.06,0x5a3a22)})} // 대청 뒤 판문
    if(s.k==="geonneon")hanjiWindow(s.cx+0.2,1.45,z0+0.01,1.2);
    if(s.k==="sarang"){hanjiWindow(s.cx+0.9,1.45,z0+0.01,1.3);const bs=cyl(0.36,0.38,0.08,0x3f6f5a,s.x0+1.2,0.04,0.6,16);bs.scale.z=0.9;room.add(bs)}});
  // 산 가구 놓기
  Object.keys(S.furn||{}).forEach(id=>{const F=FURN[id],sl=FURN_SLOT[id];if(!F||!sl)return;const s=SPACES.find(q=>q.k===F.room);if(!s)return;
    const [px,pz,rot]=sl.at(s),g=sl.build();g.userData={kind:"furn",id};g.position.set(px,sl.wall||0,pz);g.rotation.y=rot||0;room.add(g);furnObjs.push(g);
    const fw=[Math.sin(rot||0),Math.cos(rot||0)];g.userData.stand=[ROOM.x+px+fw[0]*(sl.wall?1.1:0.85),ROOM.z+Math.min(z1-0.2,pz+fw[1]*(sl.wall?1.1:0.85))];
    if(sl.size){let [w,d]=sl.size;if(Math.abs(Math.sin(rot||0))>0.5)[w,d]=[d,w];R(px-w/2,pz-d/2,px+w/2,pz+d/2)}});
  // 마루 앞 댓돌과 고무신: 누르면 밖으로
  const ds=SPACES.find(q=>q.k==="anbang"||q.k==="sarang");
  roomDoor=new THREE.Group();roomDoor.userData.kind="roomdoor";
  roomDoor.add(box(1.2,0.2,0.55,0x9a958a,0,-0.1,0));[-0.14,0.14].forEach(dx=>{const s=box(0.13,0.07,0.3,0xf4f2ec,dx,0.035,0);s.scale.x=0.9;roomDoor.add(s)});
  roomDoor.position.set(ds.cx,0,z1+1.5);room.add(roomDoor);
  {const l=label("나가기",0.8);l.position.set(ds.cx,0.9,z1+1.5);room.add(l)}
  ROOM_OBS=obs;roomLighting();
}
// 방 안 불빛: 밤엔 환하게, 낮엔 은은하게. 누워서 불을 끄면 어둡게. 아궁이에 불 때면 아궁이가 빨갛고 안방 장판이 따끈한 빛
const ondolWarm=()=>S.ondolAt&&Date.now()-S.ondolAt<ONDOL_MIN*60000;
function roomLighting(off){
  const n=skyNow.night||0;roomLight.intensity=off?0.12:0.35+n*1.5;
  roomWinMat.emissive.setRGB(1,0.95,0.82).multiplyScalar((1-n)*0.55);
  const w=ondolWarm();if(agFire)agFire.opacity=w?0.85:0;if(ondolMat)ondolMat.emissive.setRGB(0.25,0.08,0).multiplyScalar(w?1:0);
}
const ONDOL_MIN=10; // 아궁이 불기운 (초안 10분 · 실제로는 반나절)
