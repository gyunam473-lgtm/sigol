/* 앉을 자리 (상 없는 자리): 툇마루, 방 안 책상 앞 방석, 장터 느티나무 아래 긴 의자, 마을회관 의자, 우시장 의자, 냇가 원두막, 너럭바위
   누르면 걸어가서 앉아요 (play/sit.js). 들고 온 음식이 있으면 앉은 자리에서 먹을 수 있어요.
   새 자리를 늘릴 땐: 모양을 만들고 userData={kind:"seat",seat:"이름"} → 아래 FREE_SEATS 에 한 줄 */

// 나무 긴 의자. 길이 방향은 x, 앉으면 face 쪽을 봐요
function benchMesh(len=2.2,id){const g=new THREE.Group();g.userData={kind:"seat",seat:id};
  g.add(box(len,0.08,0.5,0x9a6a45,0,0.46,0));g.add(box(len,0.32,0.06,0x8a5a38,0,0.72,-0.24)); // 앉는 판, 등받이
  [-len/2+0.15,len/2-0.15].forEach(x=>{g.add(box(0.08,0.44,0.44,0x6b4a2e,x,0.22,0));g.add(box(0.06,0.5,0.06,0x6b4a2e,x,0.62,-0.24))});return g}
// 마루 방석
const maruCushion=new THREE.Group();maruCushion.userData={kind:"seat",seat:"maru"};
{const c=cyl(0.3,0.32,0.07,0xb8574a,0,0.035,0,14);c.scale.z=0.9;maruCushion.add(c);maruCushion.add(cyl(0.12,0.12,0.075,0xe8c86a,0,0.04,0,10))}
land.add(maruCushion);
// 장터 느티나무 아래, 마을회관 마당, 우시장 볏짚 옆
const plazaBench=benchMesh(2.2,"plazaBench");plazaBench.position.set(-7.6,0,6.4);plazaBench.rotation.y=-Math.PI/2;plaza.add(plazaBench); // 장터 쪽(+x)을 봐요
const hallBench=benchMesh(2.2,"hallBench");hallBench.position.set(-5.2,0,0.6);hallBench.rotation.y=Math.PI;hall.add(hallBench); // 회관 쪽을 봐요
const hallBench2=benchMesh(2.2,"hallBench2");hallBench2.position.set(4.6,0,2.2);hallBench2.rotation.y=Math.PI;hall.add(hallBench2);
const cattleBench=benchMesh(2.2,"cattleBench");cattleBench.position.set(-4.2,0,1.8);cattleBench.rotation.y=Math.PI;cattle.add(cattleBench); // 소 우리 쪽을 봐요
// 냇가: 원두막 마루와 너럭바위는 places.js 에서 만든 걸 눌러요
stHut.userData={kind:"seat",seat:"hut"};stRock.userData={kind:"seat",seat:"rock"};

// pos 앉는 곳, face 보는 방향(0이면 +z), stand 일어서는 곳, cam/look 은 앉은 사람 기준 [옆, 위, 앞] (앞 = 보는 쪽)
// block: 카메라를 가리면 피할 것, yaw: 카메라가 옆으로 돌 수 있는 범위
const FREE_SEATS={
  maru:{title:"툇마루",where:"home",note:"마루 끝에 걸터앉으니 마당이 한눈에 보여요.",
    get:()=>({pos:[HF.x-1.3,0.68,HF.z-2.15],face:0,stand:[HF.x-1.3,HF.z-0.75],cam:[1.9,1.5,3.6],look:[0,0.7,0],yaw:[-1.3,1.3]})},
  desk:{title:"책상 앞",where:"room",note:"방석에 앉아 앉은뱅이 책상 앞에 붙어 앉았어요.",ledger:true,
    get:()=>({pos:[ROOM.x+roomDesk.position.x,0.06,ROOM.z+roomDesk.position.z+0.72],face:Math.PI,stand:deskStand(),cam:[1.2,1.8,-2.4],look:[0,0.45,0.9],block:[room],yaw:[-1,1]})},
  plazaBench:{title:"장터 긴 의자",where:"plaza",note:"장터 사람들 오가는 걸 구경하기 좋아요.",
    get:()=>({pos:[-7.6,0.5,6.35],face:Math.PI/2,stand:[-6.7,6.4],cam:[-1.5,1.7,-2.8],look:[0,0.8,3]})},
  hallBench:{title:"회관 마당 의자",where:"hall",note:"회관 앞에 앉으니 확성기 소리가 가까이 들려요.",
    get:()=>({pos:[-5.2,0.5,0.75],face:Math.PI,stand:[-5.2,1.6],cam:[1.4,1.8,-2.8],look:[0,0.8,3]})},
  hallBench2:{title:"확성기 옆 의자",where:"hall",note:"동네 어르신들이 자주 앉는 자리예요. 마을 소식이 다 여기서 오가요.",
    get:()=>({pos:[4.6,0.5,2.35],face:Math.PI,stand:[4.6,3.15],cam:[1.4,1.8,-2.8],look:[0,0.8,3]})},
  cattleBench:{title:"우시장 의자",where:"cattle",note:"소 우는 소리 들으며 쉬어 가요. 음머~",
    get:()=>({pos:[-4.2,0.5,1.95],face:Math.PI,stand:[-4.2,2.9],cam:[1.4,1.8,-2.8],look:[0,0.8,3]})},
  hut:{title:"원두막",where:"stream",note:"원두막 마루에 앉으니 냇물 소리가 졸졸, 바람이 솔솔.",
    get:()=>({pos:[5.6,0.97,3.4],face:Math.PI,stand:[5.6,5.15],cam:[1.6,1.4,-3.2],look:[0,0.6,3]})},
  rock:{title:"너럭바위",where:"stream",note:"햇볕에 데워진 바위가 따끈해요. 발밑으로 냇물이 흘러요.",
    get:()=>({pos:[6.3,0.8,-0.45],face:Math.PI,stand:[6.3,0.75],cam:[1.6,1.5,-2.6],look:[0,0.4,3]})}};
// 앉을 자리 하나를 sit.js 가 쓰는 모양으로
function freeSeat(id){const d=FREE_SEATS[id],g=d.get(),f=g.face,fw=[Math.sin(f),Math.cos(f)],sd=[Math.cos(f),-Math.sin(f)];
  const at=([a,b,c])=>new THREE.Vector3(g.pos[0]+sd[0]*a+fw[0]*c,g.pos[1]+b,g.pos[2]+sd[1]*a+fw[1]*c);
  return {free:true,id,title:d.title,note:d.note,panel:d.panel,bind:d.bind,ledger:d.ledger,where:d.where,dabang:d.dabang,cupAt:g.cupAt,seat:new THREE.Vector3(...g.pos),face:f,stand:g.stand,cam:at(g.cam),look:at(g.look),block:g.block||[],yaw:g.yaw||null}}
function placeSeats(){maruCushion.position.set(HF.x-1.3,0.675,HF.z-2.15);maruCushion.visible=mode==="home"}

// 공용 장소에서 누를 수 있는 것, 길막기에 의자 더하기
[["plaza",[plazaBench],[[-8.0,5.3,-7.2,7.5]]],["hall",[hallBench,hallBench2],[[-6.4,0.3,-4.0,0.9]]],["cattle",[cattleBench],[[-5.4,1.5,-3.0,2.1]]],["stream",[stHut,stRock],[]]].forEach(([k,objs,rects])=>{
  const c=PLACES[k].clicks,o=PLACES[k].obs;PLACES[k].clicks=()=>c().concat(objs);PLACES[k].obs=()=>o().concat(rects)});
