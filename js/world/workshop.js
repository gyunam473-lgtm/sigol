/* 목공소: 목수 할아버지가 가구를 짜 주는 곳 (마을 공용 장소). 산 가구는 집으로 들여 줘요 (screens/market.js 의 openFurniture)
   마당에 통나무와 널빤지, 작업대(톱, 대패), 다 짠 가구 몇 점(반닫이, 찬장, 뒤주)이 놓여 있어요 */

const workshop=placeGroup();
let wsShed,wsDisplay;
(function(){
  workshop.add(box(17,0.04,12,0xc9b48c,0,0.02,-0.5)); // 톱밥 섞인 흙마당
  for(let i=0;i<120;i++){const s=box(0.08+Math.random()*0.1,0.01,0.05,0xe8d4a0,(Math.random()-.5)*12,0.045,-3+(Math.random()-.5)*6);s.rotation.y=Math.random()*3;s.castShadow=false;workshop.add(s)} // 톱밥
  // 작업장 (기둥과 함석지붕, 뒤는 판자벽)
  wsShed=new THREE.Group();wsShed.userData.kind="wsshed";
  wsShed.add(box(8,2.6,0.15,0x9a7a52,0,1.3,-2.2));[-4,4].forEach(x=>wsShed.add(box(0.15,2.6,4.4,0x8a6a48,x,1.3,0)));
  [[-4,2.2],[4,2.2],[0,2.2]].forEach(([x,z])=>wsShed.add(box(0.18,3.6,0.18,0x6b4a2e,x,1.8,z)));
  const rf=box(8.8,0.08,5.2,0x8a9298,0,3.7,0); // 지붕을 높여서 위에서 봐도 작업대가 보여요 (2026-11-13)rf.rotation.x=0.12;wsShed.add(rf);
  wsShed.add(box(2.2,0.1,0.9,0xa07850,-1.6,0.85,0.9));[[-2.55,0.6],[-0.65,0.6],[-2.55,1.2],[-0.65,1.2]].forEach(([x,z])=>wsShed.add(box(0.1,0.8,0.1,0x6b4a2e,x,0.4,z))); // 작업대
  wsShed.add(box(0.6,0.02,0.12,0xc8ccd0,-2.0,0.91,0.9));wsShed.add(box(0.12,0.08,0.1,0x8a5a32,-2.35,0.93,0.9)); // 톱
  wsShed.add(box(0.26,0.08,0.1,0x8a5a32,-1.1,0.94,1.0));wsShed.add(box(0.08,0.12,0.04,0x8a5a32,-1.18,1.0,1.0)); // 대패
  for(let i=0;i<6;i++)wsShed.add(box(0.06,0.02,0.4,0x3a3a3a,-3.6+i*0.25,1.9,-2.1)); // 벽에 건 연장
  wsShed.add(box(1.8,1.8,0.04,0xb08a5a,2.4,1.1,-2.1));wsShed.add(box(1.8,0.04,0.3,0x7a5a3a,2.4,1.6,-1.95));wsShed.add(box(1.8,0.04,0.3,0x7a5a3a,2.4,1.0,-1.95)); // 선반
  wsShed.position.set(0,0,-4.2);workshop.add(wsShed);
  // 통나무와 널빤지 더미
  for(let i=0;i<6;i++){const l=cyl(0.22,0.22,2.4,0x8a6a48,-6.2,0.22+Math.floor(i/3)*0.4,1.2+(i%3)*0.45-(i>2?0.2:0),10);l.rotation.x=Math.PI/2;l.rotation.z=Math.PI/2;workshop.add(l)}
  for(let i=0;i<5;i++)workshop.add(box(2.2,0.05,0.35,0xd8b885,-6.2,0.05+i*0.06,-0.4));
  // 다 짠 가구 몇 점 (마당에 내놨어요). 누르면 목수 할아버지한테 가요
  wsDisplay=new THREE.Group();wsDisplay.userData.kind="wsdisplay";
  [["bandaji",4.4,0.4],["chanjang",5.9,0.2],["dwiju",4.6,1.7]].forEach(([id,x,z])=>{const g=FURN_SLOT[id].build();g.position.set(x,0,z);g.rotation.y=-0.4;wsDisplay.add(g)});
  workshop.add(wsDisplay);
})();
placeSigns.workshop=signpost(0,9.5,"toHome",workshop);
PLACES.workshop={g:workshop,name:"목공소",sub:"목수 할아버지 · 가구 짜 주기 (집 안에 들여 줘요)",
  hint:"목수 할아버지를 누르면 가구를 골라요. 산 가구는 집 안 제자리에 들여 줘요.",way:[[-3,4.5],[3,4.5],[0,6.5],[-5,5.5],[5,6],[-2,7]], // 작업대·목수 할아버지 앞은 비워요
  clicks:()=>[ground,placeSigns.workshop,wsShed,wsDisplay],
  obs:()=>[[-4.2,-6.6,4.2,-6.1],[-4.2,-6.6,-3.8,-1.9],[3.8,-6.6,4.2,-1.9],[-2.8,-3.5,-0.4,-2.9],[-7.5,0.8,-5.0,2.6],[-7.4,-0.7,-5.0,-0.1],[3.8,-0.1,6.6,2.3]]};
function workshopLabels(){[["목공소",0,3.9,-4.2],["작업대",-1.6,1.9,-3.3],["다 짠 가구",5.0,1.9,0.8]].forEach(([t,x,y,z])=>{const l=label(t,1.1);l.position.set(x,y,z);workshop.add(l)})}
