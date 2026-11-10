/* 앉는 곳: 우리 마당 평상과 소반, 장터 정자 소반과 차림표, 상에 올리는 음식 모양 */

// 소반 (작은 둥근 상). userData.dishG 에 음식을 올려요
function soban(r){
  const g=new THREE.Group();
  g.add(cyl(r,r,0.06,0x8a5a32,0,0.22,0,20));g.add(cyl(r+0.03,r+0.03,0.03,0x6b4426,0,0.19,0,20));
  [0,1,2,3].forEach(k=>{const a=k*Math.PI/2+Math.PI/4;g.add(box(0.06,0.2,0.06,0x6b4426,Math.cos(a)*r*0.7,0.1,Math.sin(a)*r*0.7))});
  const d=new THREE.Group();d.position.y=0.25;g.add(d);g.userData.dishG=d;return g}

// 우리 마당 평상 (내 땅에서만 보여요. 이장님네는 더 큰 평상이 따로 있어요)
const BENCH={x:-4.6,z:-0.9,W:2.6,D:1.8};
const bench=new THREE.Group();bench.userData.kind="bench";
bench.add(box(BENCH.W,0.14,BENCH.D,0xc29a62,0,0.56,0));
for(let i=0;i<5;i++)bench.add(box(0.03,0.02,BENCH.D-0.1,0xa8824e,-BENCH.W/2+0.3+i*0.5,0.64,0));
[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>bench.add(box(0.14,0.5,0.14,0x8a6440,a*(BENCH.W/2-0.15),0.25,b*(BENCH.D/2-0.15))));
bench.add(box(0.5,0.05,0.5,0x5a7a9a,0,0.66,0.55)); // 방석
const homeTable=soban(0.5);homeTable.position.set(0,0.63,-0.1);bench.add(homeTable);
bench.position.set(BENCH.x,0,BENCH.z);land.add(bench);

// 장터 정자의 소반과 차림표
pav.userData.kind="pavilion";
const pavTable=soban(0.55);pavTable.position.set(0,0.7,-0.1);pav.add(pavTable);
let menuBoard=null;
function makeMenuBoard(){ // 글씨체가 준비된 뒤에 그려요
  if(menuBoard)return;
  const c=document.createElement("canvas");c.width=256;c.height=200;const x=c.getContext("2d");
  x.fillStyle="#6b4a2e";x.fillRect(0,0,256,200);x.strokeStyle="#4a3220";x.lineWidth=8;x.strokeRect(4,4,248,192);
  x.fillStyle="#f6ecd2";x.textAlign="center";x.font='700 30px "Gowun Batang", serif';x.fillText("차림표",128,42);
  x.font='22px "Gowun Dodum", sans-serif';x.textAlign="left";
  MARKET_FOOD.forEach((f,i)=>{x.fillText(f.name,28,82+i*30);x.textAlign="right";x.fillText(f.price+"원",228,82+i*30);x.textAlign="left"});
  const t=new THREE.CanvasTexture(c);
  menuBoard=new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.39),new THREE.MeshLambertMaterial({map:t}));
  menuBoard.position.set(-0.42,0.25+0.2,-0.12);menuBoard.rotation.set(0,Math.PI/2.6,0);menuBoard.rotateX(-0.25);pavTable.add(menuBoard); // 앉은 사람과 카메라 둘 다 볼 수 있게 비스듬히
}

// 음식 모양은 world/food.js 의 dish3D 가 그려요
const SLOTS=[[-0.2,0.15],[0.2,0.15],[-0.2,-0.17],[0.2,-0.17]];
function drawDishes(table,ids){
  const d=table.userData.dishG;while(d.children.length)d.remove(d.children[0]);
  ids.slice(0,4).forEach((id,k)=>{const m=dish3D(id);m.userData.dishK=k;m.position.set(SLOTS[k][0],0,SLOTS[k][1]);d.add(m)});
}
const drawHomeTable=()=>drawDishes(homeTable,S.dishes);
drawHomeTable();
