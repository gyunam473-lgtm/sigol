/* 공용 장소 더하기: 다방 · 뒷산 (places.js 의 PLACES 에 더해요. seats.js 다음에 불러요)
   - 다방: 빨간 소파 칸 네 개(여덟 자리), 낮은 탁자, 연탄 난로와 주전자, 어항, 괘종시계, 텔레비전, 계산대의 다방 사장님.
           소파에 앉아 쌍화차·다방 커피·율무차·유자차를 시켜 마셔요. 나중에 서버가 붙으면 다른 사람들이 같이 앉는 곳
   - 뒷산: 날마다 나물·버섯·약초가 새로 돋는 자리 여덟 군데(play/forage.js), 산 중턱 정자와 전망 바위 (앉을 수 있어요) */

/* ---------- 다방 (실내, 넓게) ----------
   바깥이 안 보이는 큰 실내예요. 앞쪽 벽만 잘라서 들여다보고(인형의 집처럼), 카메라는 안에서 나를 따라와요.
   소파 칸 12개(24자리) + 계산대 앞 높은 의자 5개, 다방 사장님, 연탄 난로, 어항, 전축, 텔레비전, 괘종시계, 창문, 천장 등.
   소파 칸 사이 세로 통로와 앞쪽 넓은 곳으로 다녀요. 앞 유리문(나가기)을 누르면 마을 지도 */
const dabang=placeGroup();
const DB={x0:-12,x1:12,z0:-13,z1:4,H:3.4};
const DABANG_BOOTHS=[];[-10.4,-6.4,-2.4].forEach(z=>[-9,-5,-1,3].forEach(x=>DABANG_BOOTHS.push([x,z])));
const DABANG_AISLES=[-11,-7,-3,1,5.6]; // 세로 통로 (input.js)
const DB_COUNTER=[]; // 계산대·뒤 찬장·사장님 둘레 (누르면 사장님과 이야기)
const DABANG_BAR=[-10.8,-9.4,-8,-6.6,-5.2]; // 계산대 앞 높은 의자 (z)
const dabangLights=[],dabangWinMat=new THREE.MeshLambertMaterial({color:0xf2ead2,emissive:0x000000});
let dabangDoor;
(function(){
  const W=DB.x1-DB.x0,D=DB.z1-DB.z0,cz=(DB.z0+DB.z1)/2;
  // 바깥 가리기 (하늘·풀밭이 안 보이게)
  const shell=new THREE.Mesh(new THREE.BoxGeometry(W+8,14,D+13),new THREE.MeshBasicMaterial({color:0x241c16,side:THREE.BackSide,fog:false}));shell.position.set(0,5.5,cz+2.5);dabang.add(shell);
  const under=new THREE.Mesh(new THREE.PlaneGeometry(W+8,D+13),new THREE.MeshBasicMaterial({color:0x1e1812,fog:false}));under.rotation.x=-Math.PI/2;under.position.set(0,0.008,cz+2.5);dabang.add(under);
  // 체크무늬 바닥 (한 장 그림, 누르면 그쪽으로 걸어가요)
  const ft=ctex("dabangfloor",(x,s)=>{x.fillStyle="#e8dcc0";x.fillRect(0,0,s,s);x.fillStyle="#8a3a2e";x.fillRect(0,0,s/2,s/2);x.fillRect(s/2,s/2,s/2,s/2)},64);
  ft.wrapS=ft.wrapT=THREE.RepeatWrapping;ft.repeat.set(W/2,D/2);ft.magFilter=THREE.NearestFilter;
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(W,D),new THREE.MeshLambertMaterial({map:ft}));fl.rotation.x=-Math.PI/2;fl.position.set(0,0.03,cz);fl.receiveShadow=true;fl.userData.kind="dabangfloor";dabang.add(fl);
  const wall=(w,h,d,x,y,z,c=0xdcc8a2)=>{const m=box(w,h,d,c,x,y,z);m.castShadow=false;dabang.add(m);return m};
  wall(W+0.4,DB.H,0.2,0,DB.H/2,DB.z0-0.1);wall(0.2,DB.H,D,DB.x0-0.1,DB.H/2,cz);wall(0.2,DB.H,D,DB.x1+0.1,DB.H/2,cz); // 벽지
  wall(W+0.4,0.9,0.22,0,0.45,DB.z0-0.08,0x6b4a2e);wall(0.22,0.9,D,DB.x0-0.08,0.45,cz,0x6b4a2e);wall(0.22,0.9,D,DB.x1+0.08,0.45,cz,0x6b4a2e); // 나무 징두리
  wall(W+0.4,0.12,0.24,0,DB.H-0.06,DB.z0-0.08,0x5a3a22);
  // 뒷벽 창문 넷 (낮엔 환하게) + 커튼, 왼쪽 벽 창 둘
  [-9,-4.5,0,4.5].forEach(x=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.3),dabangWinMat);p.position.set(x,1.95,DB.z0+0.02);dabang.add(p);
    wall(2.36,0.1,0.1,x,1.3,DB.z0+0.04,0x5a3a22);wall(2.36,0.1,0.1,x,2.6,DB.z0+0.04,0x5a3a22);wall(0.06,1.3,0.06,x,1.95,DB.z0+0.04,0x5a3a22);
    [-1,1].forEach(d=>wall(0.35,1.6,0.06,x+d*1.3,1.85,DB.z0+0.08,0xb84a4a))});
  [-8,-3].forEach(z=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(2.0,1.2),dabangWinMat);p.rotation.y=Math.PI/2;p.position.set(DB.x0+0.02,1.95,z);dabang.add(p);wall(0.08,0.1,2.16,DB.x0+0.04,1.35,z,0x5a3a22);wall(0.08,0.1,2.16,DB.x0+0.04,2.55,z,0x5a3a22)});
  // 앞쪽: 낮은 벽과 가운데 유리문 (나가기)
  [-1,1].forEach(d=>wall(W/2-1.2,0.5,0.15,d*(W/4+0.6),0.25,DB.z1,0x6b4a2e));
  dabangDoor=new THREE.Group();dabangDoor.userData.kind="dabangdoor";
  [-1.1,1.1].forEach(x=>dabangDoor.add(box(0.12,2.6,0.12,0x5a3a22,x,1.3,0)));dabangDoor.add(box(2.34,0.14,0.14,0x5a3a22,0,2.6,0));
  const gl=new THREE.Mesh(new THREE.BoxGeometry(0.9,2.3,0.04),new THREE.MeshLambertMaterial({color:0xbfd8e4,transparent:true,opacity:0.35}));gl.position.set(-0.5,1.2,0);dabangDoor.add(gl);
  dabangDoor.add(box(1.6,0.02,0.9,0x8a6a48,0,0.04,0.5)); // 발매트
  const hit=new THREE.Mesh(new THREE.BoxGeometry(2.4,2.7,1.6),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));hit.position.set(0,1.3,0.5);dabangDoor.add(hit); // 문 둘레 어디를 눌러도 돼요
  dabangDoor.position.set(0,0,DB.z1);dabang.add(dabangDoor);
  // 소파 칸: 소파 두 개가 낮은 탁자를 사이에 두고 마주 봐요 (줄마다 빨강·자주·초록). 위엔 천장 등
  const sofaC=[[0xa8282a,0x8a1f22],[0x7a3a6a,0x5f2a52],[0x2f5a4a,0x234538]];
  DABANG_BOOTHS.forEach(([bx,bz],i)=>{const [c1,c2]=sofaC[Math.floor(i/4)];
    [-1,1].forEach(d=>{const s=new THREE.Group();s.userData={kind:"seat",seat:"dabang"+i+(d<0?"a":"b")};
      s.add(box(1.4,0.42,0.62,c1,0,0.21,0));s.add(box(1.4,0.65,0.16,c2,0,0.62,-0.29));[-0.72,0.72].forEach(x=>s.add(box(0.1,0.56,0.64,c2,x,0.3,0)));
      s.position.set(bx,0,bz+d*0.74);s.rotation.y=d<0?0:Math.PI;dabang.add(s)});
    dabang.add(box(1.1,0.06,0.62,0x5a3420,bx,0.48,bz));dabang.add(cyl(0.06,0.08,0.45,0x3a2a1a,bx,0.23,bz,8));
    dabang.add(box(0.18,0.02,0.24,0xf2ecdc,bx-0.32,0.52,bz));dabang.add(cyl(0.04,0.04,0.07,0x8a5a32,bx+0.38,0.54,bz,10));
    dabang.add(cyl(0.006,0.006,0.8,0x333333,bx,3.0,bz,4));const sh=cone(0.28,0.22,0xe8c070,bx,2.55,bz,10);sh.castShadow=false;dabang.add(sh); // 천장 등
  });
  [-7,-1,5].forEach(x=>[-8.4,-3.4].forEach(z=>{const l=new THREE.PointLight(0xffc890,0.5,10,1.4);l.position.set(x,2.7,z);dabang.add(l);dabangLights.push(l)}));
  // 계산대 (오른쪽 안쪽, 길게)와 높은 의자, 찻잔, 전화기, 금전등록기
  // 2026-11-14 계산대·찬장을 눌러도 사장님과 이야기 (전엔 계산대 너머 바닥이 눌려서 계산대 뒤로 빙 돌아갔어요)
  {const c1=box(0.8,1.05,7.2,0x6b4a2e,9.2,0.52,-8),c2=box(0.95,0.06,7.3,0x8a5a32,9.2,1.07,-8);[c1,c2].forEach(c=>{c.userData={kind:"shop",shop:"dabang"};dabang.add(c);DB_COUNTER.push(c)})}
  dabang.add(box(0.22,0.1,0.18,0xd8312a,9.3,1.15,-4.9));dabang.add(box(0.36,0.22,0.3,0x8a8a8a,9.3,1.2,-11.2));
  for(let i=0;i<8;i++)dabang.add(cyl(0.05,0.04,0.09,0xf2f0ea,9.4,1.14,-10.4+i*0.22,10));
  DABANG_BAR.forEach((z,i)=>{const s=new THREE.Group();s.userData={kind:"seat",seat:"dbar"+i};s.add(cyl(0.24,0.22,0.1,0xa8282a,0,0.72,0,14));s.add(cyl(0.04,0.04,0.68,0x9a9a9a,0,0.34,0,6));s.add(cyl(0.2,0.22,0.03,0x8a8a8a,0,0.02,0,12));
    s.position.set(8.25,0,z);dabang.add(s)});
  // 사장님 둘레 넓게 보이지 않는 누르기 칸 (사장님이 작아서 누르기 어려웠어요)
  {const hb=new THREE.Mesh(new THREE.BoxGeometry(1.6,2.4,2.2),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));hb.position.set(10.4,1.2,-8);hb.userData={kind:"shop",shop:"dabang"};hb.castShadow=false;dabang.add(hb);DB_COUNTER.push(hb)}
  {const cb=box(0.3,1.8,6,0x5a3420,11.75,0.9,-8);cb.userData={kind:"shop",shop:"dabang"};dabang.add(cb);DB_COUNTER.push(cb)}for(let i=0;i<10;i++)dabang.add(cyl(0.06,0.06,0.25,[0x8a3a2a,0x3a6a3a,0xd8a33a][i%3],11.7,1.95+Math.floor(i/5)*0.32,-10.4+(i%5)*1.0,8)); // 뒤 찬장, 병
  // 연탄 난로와 주전자, 연통 (앞 왼쪽)
  dabang.add(cyl(0.32,0.36,0.75,0x3a3836,-11,0.38,1.6,14));dabang.add(cyl(0.13,0.17,0.2,0x9a9a9a,-11,0.85,1.6,12));dabang.add(cyl(0.06,0.06,2.6,0x6a6a6a,-11,2.05,1.6,8));
  // 어항 (뒷벽 앞, 금붕어)
  dabang.add(box(1.3,0.85,0.5,0x5a3420,-7,0.43,-12.6));const tank=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.55,0.42),new THREE.MeshLambertMaterial({color:0x8fc8e0,transparent:true,opacity:0.5}));tank.position.set(-7,1.15,-12.6);dabang.add(tank);
  for(let i=0;i<4;i++)dabang.add(sph(0.045,0xf08a2a,-7.4+i*0.25,1.0+(i%2)*0.15,-12.55));
  // 전축(LP)과 텔레비전 (앞 오른쪽), 괘종시계, 달력, 화분, 옷걸이
  dabang.add(box(0.55,0.75,1.2,0x7a4a2a,11.4,0.38,-1.6));dabang.add(cyl(0.22,0.22,0.02,0x1a1a1a,11.4,0.77,-1.65,20));dabang.add(box(0.55,0.04,1.2,0x5a3420,11.4,0.76,-1.6));
  dabang.add(box(0.5,0.8,0.7,0x6b4a2e,11.4,0.4,0.6));dabang.add(box(0.55,0.6,0.75,0x2a2a2a,11.4,1.1,0.6));dabang.add(box(0.02,0.42,0.5,0x4a6a7a,11.12,1.12,0.6));
  const clk=new THREE.Group();clk.add(box(0.36,0.8,0.12,0x5a2e18,0,0,0));const cf=cyl(0.13,0.13,0.02,0xf4ecd8,0,0.2,0.065,20);cf.rotation.x=Math.PI/2;clk.add(cf);clk.position.set(-2.25,2.3,DB.z0+0.08);dabang.add(clk);
  dabang.add(box(0.5,0.7,0.02,0xf6f0e2,2.25,2.1,DB.z0+0.03));
  [[-11.3,3.3],[11.3,3.3],[7,-12.5]].forEach(([x,z])=>{dabang.add(cyl(0.25,0.2,0.45,0xc8b8a0,x,0.22,z,10));dabang.add(sph(0.45,0x4f8a3a,x,0.85,z))});
  dabang.add(cyl(0.03,0.03,1.8,0x5a3a22,-11.4,0.9,3.0,6));[0,1.6,3.2].forEach(a=>dabang.add(cyl(0.015,0.015,0.3,0x5a3a22,-11.4+Math.cos(a)*0.12,1.75,3.0+Math.sin(a)*0.12,4).rotateZ(0.8)));
})();
// 다방 안 불빛: 밤엔 천장 등이 환하고, 낮엔 창으로 빛이 들어와요
function dabangLighting(){const n=skyNow.night||0;dabangLights.forEach(l=>l.intensity=0.45+n*0.9);dabangWinMat.emissive.setRGB(1,0.95,0.8).multiplyScalar((1-n)*0.6)}
// 다방 안 카메라: 앞쪽 위에서 나를 따라 들여다봐요
// 2026-11-14 폰 세로에선 계산대(사장님)가 화면 밖이라 대화를 못 했어요 → 화면을 옆으로 끌면 좌우로 둘러봐요(RC.pan, freecam.js 끝), 걸으면 다시 나를 따라와요
// 폰 세로: 계산대 앞에선 사장님이 보이게 카메라를 살짝 오른쪽으로 (bias)
function dabangCam(){const p=me.g.position;if(me.moving)RC.pan*=0.9;const pl=(camera.aspect||1)<1?9.5:7;RC.pan=Math.max(-pl-p.x,Math.min(pl-p.x,RC.pan));const bias=(camera.aspect||1)<1&&p.x>4.4?2.2:0,cx=Math.max(-pl,Math.min(pl,p.x+bias+RC.pan));camPos.set(cx,7.6,Math.min(p.z+7.2,DB.z1+6.5));lookT.set(cx,0.3,p.z-1.6)}
// 소파 자리: 시키면 탁자 위에 찻잔이 놓여요
const DABANG_NOTES=["푹신한 소파. 난로 위 주전자가 보글보글","창으로 햇살이 들어와요. 어항 속 금붕어가 한가롭네요","전축에서 옛날 노래가 흘러나와요. 마음이 느긋해져요","괘종시계 소리가 똑딱똑딱. 시간이 천천히 가요","커튼 사이로 바람이 살랑. 차 한 잔이 딱이에요","옆 소파에서 두런두런 이야기 소리가 들려요"];
DABANG_BOOTHS.forEach(([bx,bz],i)=>[-1,1].forEach(d=>{const id="dabang"+i+(d<0?"a":"b"),f=d<0?0:Math.PI;
  FREE_SEATS[id]={title:"다방 소파",where:"dabang",dabang:true,note:DABANG_NOTES[i%DABANG_NOTES.length],
    get:()=>({pos:[bx,0.42,bz+d*0.68],face:f,stand:[bx+1.3,bz+d*0.68],cam:[2.0,1.9,0.5],look:[0,0.45,0.45],cupAt:[bx,0.52,bz+d*0.16]})}}));
// 계산대 앞 높은 의자: 사장님이랑 이야기하며 마셔요
DABANG_BAR.forEach((z,i)=>FREE_SEATS["dbar"+i]={title:"계산대 앞 의자",where:"dabang",dabang:true,note:["사장님이 커피 타는 모습이 보여요","찻잔 부딪는 소리가 정겨워요","사장님: \"오늘은 뭘로 줄까?\"","전화벨이 따르릉. 다방은 늘 바빠요","뒤 찬장에 병들이 반짝반짝"][i],
  get:()=>({pos:[8.25,0.77,z],face:Math.PI/2,stand:[7.2,z],cam:[2.4,2.0,-2.7],look:[0,0.6,1.0],cupAt:[8.95,1.12,z]})});
SHOPS.dabang={name:"다방 사장님",role:"차 내려 드려요",shirt:0xc84a6a,o:{hat:false,hair:0x2a1a14,apron:0xf2ead6,style:"shop"},place:"dabang",spot:[10.4,-8,-Math.PI/2],get stand(){const z=me?Math.max(-11.2,Math.min(-4.8,me.g.position.z)):-7.3;return [7.2,z]}}; // 계산대 앞 아무 데서나 (내가 있는 줄에서 가장 가까운 자리)

/* ---------- 뒷산 (진짜 언덕) ----------
   땅이 높낮이가 있는 산이에요(sanH). 입구는 평평하고, 구불구불 산길을 따라 오르면 꼭대기(높이 9)에 정자가 있어요.
   걸어 다니면 캐릭터가 땅 높이를 따라 오르내려요 (main.js). 소나무 숲, 바위, 날마다 돋는 캘 거리 열 군데 */
const dwitsan=placeGroup();
const SAN_PATH=[[0,10],[0.6,5],[-1.4,1],[1.2,-3],[-1.2,-7],[1.6,-11],[0,-14.5],[0,-17]];
// 산 높이 (x,z 자리의 땅 높이)
function sanH(x,z){const b=(cx,cz,h,r)=>h*Math.exp(-((x-cx)**2+(z-cz)**2)/(r*r));
  let h=b(0,-17,9,8.5)+b(-10,-11,5.5,6)+b(11,-12,6,6.5)+b(-4,-4,1.4,3.5)+b(6,-3,1.2,3)+b(-22,-30,13,12)+b(22,-28,12,11)+b(0,-40,16,14)+0.22*Math.sin(x*0.6)*Math.cos(z*0.5);
  return Math.max(0,h*Math.min(1,Math.max(0,(7-z)/5)))} // 입구(앞쪽)는 평평
const segDist=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)};
const pathDist=(x,z)=>{let d=1e9;for(let i=1;i<SAN_PATH.length;i++)d=Math.min(d,segDist(x,z,SAN_PATH[i-1],SAN_PATH[i]));return d};
const FORAGE_POS=[[-3.2,4],[3.4,2.6],[-6,-1],[4.6,-2.2],[-2.6,-4.8],[7,-7.2],[-8,-6.4],[3,-9.2],[-4.2,-12],[5,-13.4]];
let sanJeongja,sanRock,sanGround;const forageG=new THREE.Group();dwitsan.add(forageG);const sanTrees=[],sanRocks=[];
(function(){
  // 땅 (높낮이 + 풀빛·흙길 색)
  const geo=new THREE.PlaneGeometry(64,60,96,90);geo.rotateX(-Math.PI/2);geo.translate(0,0,-12);
  const p=geo.attributes.position,col=[],c=new THREE.Color();
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),h=sanH(x,z);p.setY(i,h);
    const n=0.5+0.5*Math.sin(x*1.7+z*1.3)*Math.cos(x*0.7-z*1.1);
    if(pathDist(x,z)<0.85&&z<11)c.setHex(0xb8a37a);else c.setHex(0x7f9d5e).lerp(new THREE.Color(0x9cb878),n*0.6).lerp(new THREE.Color(0x5f7f4a),Math.min(1,h/10)*0.6);
    col.push(c.r,c.g,c.b)}
  geo.setAttribute("color",new THREE.Float32BufferAttribute(col,3));geo.computeVertexNormals();
  sanGround=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true}));sanGround.receiveShadow=true;sanGround.userData.kind="sanground";dwitsan.add(sanGround);
  // 소나무 숲 (산길은 비워요)
  const pine=(x,z,s=1)=>{const g=new THREE.Group();g.add(cyl(0.12*s,0.16*s,1.2*s,0x6a4a32,0,0.6*s,0,6));[0,1,2].forEach(i=>g.add(cone((1.0-i*0.25)*s,1.2*s,0x3f6a3a,0,(1.3+i*0.7)*s,0,7)));
    g.position.set(x,sanH(x,z)-0.05,z);dwitsan.add(g);TREES.push(g);sanTrees.push([x,z])};
  let seed=7;const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280};
  for(let i=0;i<70;i++){const x=-17+rnd()*34,z=-24+rnd()*31;if(pathDist(x,z)<2||FORAGE_POS.some(f=>Math.hypot(f[0]-x,f[1]-z)<1.6)||Math.hypot(x,z+17)<3.5||Math.hypot(x+9,z+10)<2.5||z>7)continue;pine(x,z,0.8+rnd()*0.5)}
  for(let i=0;i<14;i++){const x=-15+rnd()*30,z=-22+rnd()*28;if(pathDist(x,z)<1.5)continue;const r=sph(0.35+rnd()*0.4,[0x9a958a,0x8a857a,0xa8a397][i%3],x,sanH(x,z)+0.1,z);r.scale.y=0.55;dwitsan.add(r);sanRocks.push([x,z])}
  // 꼭대기 정자
  sanJeongja=new THREE.Group();sanJeongja.userData={kind:"seat",seat:"sanJeongja"};
  sanJeongja.add(box(3,0.4,3,0xb08a5a,0,0.4,0));[[-1.3,-1.3],[1.3,-1.3],[-1.3,1.3],[1.3,1.3]].forEach(([a,b])=>sanJeongja.add(cyl(0.11,0.11,2.3,0x8a3a2a,a,1.55,b,8)));
  const rf=cone(2.7,1.3,0x3d4448,0,3.3,0,4);rf.rotation.y=Math.PI/4;sanJeongja.add(rf);sanJeongja.position.set(0,sanH(0,-17)-0.2,-17);dwitsan.add(sanJeongja);
  // 전망 바위 (서쪽 능선, 골짜기를 내려다봐요)
  sanRock=sph(1.1,0xa8a397,-9,sanH(-9,-10)+0.15,-10);sanRock.scale.set(1.3,0.5,1);sanRock.userData={kind:"seat",seat:"sanRock"};dwitsan.add(sanRock);
})();
const dwitsanSign=signpost(0,9.5,"toHome",dwitsan);
FREE_SEATS.sanJeongja={title:"꼭대기 정자",where:"dwitsan",note:"산꼭대기예요! 솔바람이 시원하고 골짜기가 한눈에 보여요.",get:()=>{const h=sanH(0,-17);return {pos:[0,h+0.4,-16.6],face:0,stand:[0,-14.6],cam:[2.7,1.3,0.4],look:[-0.6,-1.2,5]}}};
FREE_SEATS.sanRock={title:"전망 바위",where:"dwitsan",note:"능선 바위에 앉으니 골짜기 아래 산길이 내려다보여요. 땀이 쏙 들어가요.",get:()=>{const h=sanH(-9,-10);return {pos:[-9,h+0.7,-9.8],face:0.35,stand:[-7.6,-8.6],cam:[1.2,1.6,-2.6],look:[0,-1.5,7]}}};

// 공용 장소에 더하기
PLACES.dabang={g:dabang,name:"다방",sub:"실내 · 소파 24자리 + 계산대 앞 5자리 · 쌍화차 한 잔 · 쉬어 가는 곳",indoor:true,
  hint:"소파나 계산대 앞 의자를 누르면 앉아서 차를 시켜요. 앞 유리문을 누르면 나가요.",way:[[-9,1.2],[-5,2.6],[-1,1],[3,2.8],[7,1.4],[10,2.6],[6,-6],[6,-10]],
  clicks:()=>[...dabang.children.filter(c=>c.userData.kind==="seat"),dabangDoor,...DB_COUNTER,...dabang.children.filter(c=>c.userData.kind==="dabangfloor")],
  obs:()=>{const R=[[DB.x0-3,DB.z0-3,DB.x0,DB.z1+3],[DB.x1,DB.z0-3,DB.x1+3,DB.z1+3],[DB.x0-3,DB.z0-3,DB.x1+3,DB.z0],
    [DB.x0,DB.z1-0.1,-1.2,DB.z1+3],[1.2,DB.z1-0.1,DB.x1,DB.z1+3],[-1.2,DB.z1+1.2,1.2,DB.z1+3], // 앞 낮은 벽, 문 밖
    [8.7,-11.7,9.7,-4.3],[11.4,-11.2,12,-4.8],[-11.5,1.1,-10.5,2.1],[-7.8,-13,-6.2,-12.2],[11,-2.3,12,1.1],[-11.7,2.9,-10.9,3.7],[10.9,2.9,11.7,3.7],[6.6,-12.9,7.4,-12.1]];
    DABANG_BOOTHS.forEach(([x,z])=>R.push([x-0.78,z-1.08,x+0.78,z+1.08]));return R}};
PLACES.dwitsan={g:dwitsan,name:"뒷산",sub:"산길 따라 꼭대기까지 · 나물·버섯·약초 캐기 (가끔 산삼!) · 정자와 전망 바위",
  hint:"산 어디든 눌러 걸어 다녀요. 반짝이는 풀을 누르면 캐요. 꼭대기엔 정자가 있어요.",way:SAN_PATH.slice(0,7).concat([[-4,3],[4,1],[-6,-3],[5,-6]]),
  clicks:()=>[sanGround,dwitsanSign,sanJeongja,sanRock,...forageG.children],
  obs:()=>{const R=[[-30,-40,-17,20],[17,-40,30,20],[-30,-40,30,-24],[-30,9,-1.5,30],[1.5,9,30,30], // 산 바깥
    [-1.6,-18.6,1.6,-15.4],[-10.4,-11,-7.6,-9]];sanTrees.forEach(([x,z])=>R.push([x-0.25,z-0.25,x+0.25,z+0.25]));sanRocks.forEach(([x,z])=>R.push([x-0.4,z-0.4,x+0.4,z+0.4]));return R}};
function placeLabels2(){[["다방",0,3.3,DB.z1,dabang],["계산대",9.2,2.1,-8,dabang],["나가기",0,1.2,DB.z1+0.6,dabang],
  ["뒷산 꼭대기",0,sanH(0,-17)+4.4,-17,dwitsan],["전망 바위",-9,sanH(-9,-10)+1.9,-10,dwitsan]].forEach(([t,x,y,z,g])=>{const l=label(t,1.1);l.position.set(x,y,z);g.add(l)})}
