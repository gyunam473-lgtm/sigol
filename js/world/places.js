/* 마을 공용 장소: 모두 같이 쓰는 곳 (마을 장터는 scene.js, 생선 트럭은 sea.js)
   - 마을회관: 이장님이 계신 곳. 마을 안내와 불편한 점 접수, 게시판(마을 소식), 확성기
   - 우시장: 장날(4·9일)에만 열려요. 소장수 아저씨에게 송아지·새끼 염소를 사고, 다 큰 소·염소를 팔아요
   - 냇가: 징검다리, 빨래터, 버드나무. 냇물을 떠 마실 수 있어요
   새 장소를 늘릴 땐 여기에 모양을 만들고 아래 PLACES 에 한 줄 넣으면 "마을" 지도에 나와요 */

function placeGroup(){const g=new THREE.Group();g.visible=false;scene.add(g);return g}

/* ---------- 마을회관 ---------- */
const hall=placeGroup();
const HALL={chief:[-1.6,-1.2]}; // 이장님이 서 계신 자리 (게시판 옆)
let hallBoard,hallSpeaker,hallBldg;
(function(){
  hall.add(box(17,0.04,12,0xd5d0c4,0,0.02,-0.5)); // 시멘트 마당
  hallBldg=new THREE.Group();hallBldg.userData.kind="hallbldg";
  hallBldg.add(box(9,0.35,4.8,0xb8b0a0,0,0.17,0));hallBldg.add(box(8.6,3,4.4,0xefe9dc,0,1.85,0));
  const rg=new THREE.CylinderGeometry(3.3,3.3,9.8,3,1);rg.rotateX(-Math.PI/2);rg.rotateY(Math.PI/2);const rf=new THREE.Mesh(rg,M(0x3f6f7f));rf.scale.set(1,0.42,0.86);rf.position.set(0,4.2,0);rf.castShadow=true;hallBldg.add(rf); // 파란 기와 지붕
  hallBldg.add(box(1.8,2.2,0.08,0x8fb3c4,0,1.45,2.22));hallBldg.add(box(0.06,2.2,0.1,0x5a5a5a,0,1.45,2.25)); // 유리문
  [-3,-1.9,1.9,3].forEach(x=>{hallBldg.add(box(0.9,1.0,0.08,0xbfd8e4,x,2.0,2.22));hallBldg.add(box(0.98,0.08,0.1,0x7a6a5a,x,1.48,2.24))}); // 창
  hallBldg.add(box(3.6,0.7,0.1,0x2f4f3f,0,3.75,2.25)); // 현판
  hallBldg.add(box(9.4,0.12,1.4,0x9a9a9a,0,3.35,2.9));[-4.4,4.4].forEach(x=>hallBldg.add(cyl(0.07,0.07,3.2,0x8a8a8a,x,1.75,3.5,8))); // 차양
  hallBldg.position.set(0,0,-5);hall.add(hallBldg);
  // 게시판: 마을 소식
  hallBoard=new THREE.Group();hallBoard.userData.kind="board";
  [-0.9,0.9].forEach(x=>hallBoard.add(box(0.12,2.0,0.12,0x6b4a2e,x,1.0,0)));
  hallBoard.add(box(2.1,1.2,0.08,0x8a6a48,0,1.45,0));hallBoard.add(box(2.4,0.1,0.4,0x4a3a2a,0,2.1,0));
  [[-0.6,1.6,0xf6f0e2],[0.05,1.55,0xf4e3b0],[0.65,1.62,0xf6f0e2],[-0.4,1.2,0xe2efd8],[0.4,1.18,0xf6f0e2]].forEach(([x,y,c])=>{const p=box(0.5,0.38,0.02,c,x,y,0.06);p.rotation.z=(x*7%3-1)*0.05;hallBoard.add(p)});
  hallBoard.position.set(-3.6,0,-1.4);hall.add(hallBoard);
  // 확성기 기둥 (마을 방송)
  hallSpeaker=new THREE.Group();hallSpeaker.userData.kind="speaker";
  hallSpeaker.add(cyl(0.08,0.11,5,0x9a9a9a,0,2.5,0,8));
  [0.6,-0.6].forEach(a=>{const h=cone(0.3,0.6,0xd8d8d0,Math.sin(a)*0.35,4.7,Math.cos(a)*0.35,12);h.rotation.x=-Math.PI/2;h.rotation.z=0;h.rotation.y=a;hallSpeaker.add(h)});
  hallSpeaker.position.set(5.2,0,-1.4);hall.add(hallSpeaker);
  // 화단과 의자, 느티나무
  for(let i=0;i<7;i++)hall.add(sph(0.18,[0xe8586a,0xf2c84a,0xf6f0e2][i%3],-6.5+i*0.45,0.25,-2.4));hall.add(box(3.4,0.25,0.7,0x9a8a72,-5.15,0.12,-2.4));
  tree(-6.5,3.2,1.5,false,hall);
})();

/* ---------- 우시장 (장날만) ---------- */
const cattle=placeGroup();
const sale=new THREE.Group();cattle.add(sale); // 팔려고 데려온 가축 (장날에만)
let cowPen,goatPen,closedSign;
(function(){
  cattle.add(box(18,0.04,13,0xcdb48a,0,0.02,-0.5)); // 흙바닥
  const pen=(cx,cz,w,d)=>{const g=new THREE.Group();g.userData.kind="cattlepen";const P=0x9a7a52;
    for(let x=-w/2;x<=w/2+0.01;x+=w/Math.round(w/1.1)){g.add(box(0.12,1.1,0.12,P,x,0.55,-d/2));g.add(box(0.12,1.1,0.12,P,x,0.55,d/2))}
    for(let z=-d/2;z<=d/2+0.01;z+=d/Math.round(d/1.1)){g.add(box(0.12,1.1,0.12,P,-w/2,0.55,z));g.add(box(0.12,1.1,0.12,P,w/2,0.55,z))}
    [0.45,0.85].forEach(y=>{g.add(box(w,0.07,0.05,P,0,y,-d/2));g.add(box(w,0.07,0.05,P,0,y,d/2));g.add(box(0.05,0.07,d,P,-w/2,y,0));g.add(box(0.05,0.07,d,P,w/2,y,0))});
    g.add(box(w-0.3,0.03,d-0.3,0xd9c27a,0,0.05,0)); // 깔짚
    g.position.set(cx,0,cz);cattle.add(g);return g};
  cowPen=pen(-4.2,-3.4,6,4);goatPen=pen(4.2,-3.4,4.6,4);
  // 장날에 데려온 소와 염소
  [[-5.8,-4.4,0.85],[-4.2,-2.6,0.6],[-2.6,-4.2,0.6],[-5.6,-2.4,0.85]].forEach(([x,z,s],i)=>{const c=cowMesh(s);c.position.set(x,0,z);c.rotation.y=i*1.3;sale.add(c)});
  [[3.2,-4.4,0.65],[5.0,-2.6,0.65],[5.4,-4.3,0.95],[3.6,-2.6,0.95]].forEach(([x,z,s],i)=>{const g=goatMesh(s,i%2?0xe9e3d6:0x2e2b28);g.position.set(x,0,z);g.rotation.y=i*1.7;sale.add(g)});
  // 가축 싣는 트럭
  const tr=new THREE.Group();tr.add(box(1.4,1.2,1.7,0xe8e2d0,1.7,0.95,0));tr.add(box(0.06,0.5,1.4,0x9cc4dc,2.42,1.25,0));tr.add(box(2.6,0.2,1.8,0x8a8e92,-0.4,0.55,0));
  for(let x=-1.6;x<=0.8;x+=0.4){tr.add(box(0.06,1.1,0.06,0x9a7a52,x,1.1,0.88));tr.add(box(0.06,1.1,0.06,0x9a7a52,x,1.1,-0.88))}
  [0.9,1.4].forEach(y=>{tr.add(box(2.5,0.07,0.06,0x9a7a52,-0.4,y,0.88));tr.add(box(2.5,0.07,0.06,0x9a7a52,-0.4,y,-0.88))});
  [[1.7,0.75],[1.7,-0.75],[-1.1,0.75],[-1.1,-0.75]].forEach(([x,z])=>{const w=cyl(0.3,0.3,0.2,0x222222,x,0.3,z,14);w.rotation.x=Math.PI/2;tr.add(w)});
  tr.position.set(6.6,0,3.6);tr.rotation.y=-Math.PI/2;cattle.add(tr);
  for(let i=0;i<4;i++)cattle.add(cyl(0.38,0.38,0.7,0xd9c27a,-7.2+(i%2)*0.8,0.38,1.2+Math.floor(i/2)*0.8,10).rotateZ(Math.PI/2)); // 볏짚단
  // 장날이 아닐 때: 문 닫힘 안내판
  closedSign=new THREE.Group();closedSign.userData.kind="closedsign";closedSign.add(cyl(0.06,0.06,1.4,0x7a5a3a,0,0.7,0,6));closedSign.add(box(1.6,0.7,0.08,0xf6f0e2,0,1.3,0));closedSign.position.set(0,0,0.4);cattle.add(closedSign);
})();

/* ---------- 냇가 ---------- */
const stream=placeGroup();
let streamWater,stHut,stRock,fishSpot;
(function(){
  const wt=ctex("stream",(x,s)=>{x.fillStyle="#5f9fbf";x.fillRect(0,0,s,s);for(let i=0;i<70;i++){x.strokeStyle=`rgba(255,255,255,${0.12+Math.random()*0.25})`;x.lineWidth=2;const y=Math.random()*s,a=Math.random()*s;x.beginPath();x.moveTo(a,y);x.quadraticCurveTo(a+18,y-5,a+36,y);x.stroke()}},256);
  wt.wrapS=wt.wrapT=THREE.RepeatWrapping;wt.repeat.set(8,1);
  streamWater=new THREE.Mesh(new THREE.PlaneGeometry(36,3.6),new THREE.MeshLambertMaterial({map:wt,transparent:true,opacity:0.92}));streamWater.rotation.x=-Math.PI/2;streamWater.position.set(0,0.04,-3.2);streamWater.userData.kind="streamwater";stream.add(streamWater);
  [-1.45,1.45].forEach((dz,k)=>stream.add(box(36,0.06,1.1,0xd9c79a,0,0.03,-3.2+dz*1.55))); // 모래 둑
  for(let i=0;i<40;i++){const x=-17+Math.random()*34,z=-3.2+(Math.random()<.5?-1:1)*(1.8+Math.random()*0.9),r=0.12+Math.random()*0.25;const p=sph(r,[0x9a958a,0xb3ad9f,0x8a857a][i%3],x,r*0.4,z);p.scale.y=0.5;stream.add(p)} // 조약돌
  for(let i=0;i<6;i++){const s=cyl(0.42,0.48,0.3,0xa39e92,2.2+(i%2)*0.25,0.14,-5.2+i*0.8,10);s.scale.z=0.8;stream.add(s)} // 징검다리
  // 빨래터: 넓적한 돌, 빨래 방망이, 빨래 바구니
  [[-4.6,-1.25],[-3.4,-1.2]].forEach(([x,z])=>{const s=box(1.0,0.22,0.7,0xb8b2a4,x,0.11,z);s.rotation.y=0.15;stream.add(s)});
  stream.add(box(0.5,0.06,0.08,0x8a6440,-4.4,0.26,-1.2).rotateY(0.5));stream.add(cyl(0.32,0.26,0.3,0xc9a66b,-2.4,0.15,-0.4,12));stream.add(box(0.45,0.08,0.4,0xf2eee6,-2.4,0.32,-0.4));
  // 버드나무와 너럭바위, 원두막
  const wil=new THREE.Group();wil.add(cyl(0.25,0.35,2.6,0x6b5a3f,0,1.3,0));for(let i=0;i<10;i++){const a=i/10*Math.PI*2,b=box(0.5,1.8,0.5,0x8ab55a,Math.cos(a)*1.0,2.1,Math.sin(a)*1.0);b.castShadow=false;wil.add(b)}wil.add(sph(1.4,0x7aa84f,0,3.1,0));wil.position.set(-7,0,0.6);stream.add(wil);
  const rock=sph(1.0,0xa8a397,6.5,0.35,-0.6);rock.scale.set(1.4,0.45,1);stream.add(rock);stRock=rock;
  const hut=new THREE.Group();[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>hut.add(cyl(0.08,0.08,2.6,0x7a5a3a,a,1.3,b,6)));hut.add(box(2.3,0.12,2.3,0xb08a5a,0,0.9,0));
  const hr=cone(2.0,1.0,0xd9c27a,0,3.0,0,4);hr.rotation.y=Math.PI/4;hut.add(hr);hut.position.set(5.6,0,3.6);stream.add(hut);stHut=hut; // 원두막
  tree(-11,3,1.1,false,stream);tree(10,1.5,0.9,false,stream);
  fishSpot=new THREE.Group();fishSpot.userData.kind="fishspot";
  fishSpot.add(box(1.4,0.08,1.0,0x9a7a52,0,0.06,0));[[-0.6,-0.4],[0.6,-0.4],[-0.6,0.4],[0.6,0.4]].forEach(([x,z])=>fishSpot.add(box(0.08,0.12,0.08,0x6b4a2e,x,0.02,z))); // 좌대
  fishSpot.add(box(0.35,0.06,0.3,0x3f6f8f,0.35,0.3,0.15));[[0.2,0.02],[0.5,0.02],[0.2,0.28],[0.5,0.28]].forEach(([x,z])=>fishSpot.add(cyl(0.015,0.015,0.24,0x888888,x,0.16,z,4))); // 낚시 의자
  const rack=cyl(0.012,0.02,1.8,0x6b4a2e,-0.45,0.55,-0.2,6);rack.rotation.x=-0.6;fishSpot.add(rack); // 세워 둔 낚싯대
  fishSpot.add(cyl(0.16,0.12,0.3,0x6a7a4a,-0.5,0.2,0.3,10)); // 망태
  fishSpot.position.set(-1.4,0,-0.75);stream.add(fishSpot);
})();

// 장소마다 '우리 땅으로' 표지판
const placeSigns={};
[["hall",hall],["cattle",cattle],["stream",stream]].forEach(([k,g])=>placeSigns[k]=signpost(0,9.5,"toHome",g));

/* ---------- 장소 목록: "마을" 지도와 걷기·누르기 설정 ---------- */
const PLACES={
  plaza:{g:plaza,name:"마을 장터",sub:"가게 넷, 먹거리 천막(국밥·순대), 평상·정자 · 날마다",
    hint:"말풍선 달린 가게 주인을 누르면 사고팔고, 정자에 앉으면 음식을 시켜 먹어요.",way:WAYP,
    clicks:()=>[ground,toHome,pav,...STALLS].concat(seaTruck.visible?[seaTruck]:[]),
    obs:()=>{const R=STALLS.map(s=>[s.position.x-1.8,s.position.z-0.8,s.position.x+1.8,s.position.z+0.8]);R.push([4.2,1.7,7.8,5.3],[-7.5,3,-6.5,4]);if(seaTruck.visible)R.push([-4.5,1.7,-2.7,6.0]);return R}},
  hall:{g:hall,name:"마을회관",sub:"이장님 · 마을 안내, 불편한 점 접수, 게시판",
    hint:"이장님을 누르면 이야기해요. 게시판엔 마을 소식이, 의자에 앉아 쉬어 가요.",way:[[-5,1],[4,1.5],[-2,3],[2,4],[6,0.5],[-6,4],[0,2],[3,5]],
    clicks:()=>[ground,placeSigns.hall,hallBldg,hallBoard,hallSpeaker],
    obs:()=>[[-4.7,-7.8,4.7,-1.4],[-4.8,-1.6,-2.4,-1.2],[4.95,-1.65,5.45,-1.15],[-6.9,-2.8,-3.4,-2],[3.4,1.8,5.8,2.6],[-6.9,2.9,-6.1,3.5]]},
  cattle:{g:cattle,name:"우시장",sub:"송아지·새끼 염소 사고, 다 큰 소·염소 팔기",
    hint:"소장수 아저씨를 누르면 가축을 사고팔아요.",way:[[-4,1],[3,1.5],[0,3],[-2,5],[4,5],[-6,3],[1,6]],
    clicks:()=>[ground,placeSigns.cattle,cowPen,goatPen,closedSign],
    obs:()=>[[-7.3,-5.5,-1.1,-1.3],[1.8,-5.5,6.6,-1.3],[5.6,1.2,7.6,5.8],[-7.8,0.7,-6.2,2.4]]},
  stream:{g:stream,name:"냇가",sub:"낚시터, 징검다리, 빨래터, 원두막 · 냇물 마시기",
    hint:"냇물을 누르면 물속으로 들어가요. 물속에선 '바닥 훑기'로 다슬기·조약돌…을 찾아요. '낚시하기'는 물가에서.",way:[[-3,1],[3,1.5],[0,3],[-5,4],[5,5.5],[-8,3],[8,3]],
    clicks:()=>[ground,placeSigns.stream,fishSpot,streamWater],
    obs:()=>[[-18,-9,18,-6.4],[-7.5,0.1,-6.5,1.1],[5.1,-1.3,7.9,0.1],[4.5,2.5,6.7,4.7]]}};
// 준비 중인 장소 (지도에만 보여요)
const PLACES_SOON=[["읍내","버스 타고 가는 큰 장 · 준비 중"]];

// 장소 이름표 (폰트 준비 뒤, people.js 의 makePeople 에서 불러요)
function publicLabels(){
  [["마을회관",0,5.2,-2.6,hall],["게시판",-3.6,2.6,-1.4,hall],["확성기",5.2,5.5,-1.4,hall],
   ["우시장",0,3.4,-6.4,cattle],["소",-4.2,1.8,-3.4,cattle],["염소",4.2,1.8,-3.4,cattle],
   ["냇가",0,2.4,-3.2,stream],["낚시터",-1.4,1.6,-0.75,stream],["빨래터",-4,1.2,-1.2,stream],["원두막",5.6,3.9,3.6,stream]]
   .forEach(([t,x,y,z,g])=>{const l=label(t,1.1);l.position.set(x,y,z);g.add(l)});
  const l=label("다음 장날에 열려요",0.8);l.position.set(0,2.1,0);closedSign.add(l);
}
// 장날이면 가축을 데려오고, 아니면 문 닫힘
function applyCattle(){const open=jangToday();sale.visible=open;closedSign.visible=!open}
