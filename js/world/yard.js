/* 마당 일하는 곳 모양: 장작 패는 곳(모탕·도끼), 지붕 있는 장작가리, 집 뒤 땔감 숲(쓰러진 나무·마른 나무), 논(빈 논 → 모 → 푸른 벼 → 누런 벼)
   하는 일은 play/chore.js */

/* ---------- 장작 패는 곳과 장작가리 (부뚜막 오른쪽) ---------- */
const WOODYARD={motang:[0.5,-8.5],pile:[-0.3,-10.0]};
const motang=new THREE.Group();motang.userData.kind="motang";
{motang.add(cyl(0.42,0.48,0.5,0x8a6440,0,0.25,0,14));motang.add(cyl(0.4,0.4,0.02,0xc9a26a,0,0.51,0,14)); // 모탕 (나이테 보이는 그루터기)
  for(let r=1;r<4;r++){const ring=new THREE.Mesh(new THREE.TorusGeometry(r*0.09,0.006,4,24),M(0x9a7448));ring.rotation.x=Math.PI/2;ring.position.y=0.525;motang.add(ring)}
  const ax=new THREE.Group();ax.add(cyl(0.025,0.03,0.75,0xb08a5a,0,0.32,0,6));ax.add(box(0.2,0.12,0.04,0x6a6e72,0.06,0.66,0));ax.rotation.z=-0.5;ax.position.set(0.08,0.5,0);motang.add(ax);motang.userData.axe=ax; // 꽂아 둔 도끼
  for(let i=0;i<6;i++){const c=box(0.12,0.04,0.06,0xd8b885,(Math.random()-.5)*1.2,0.02,(Math.random()-.5)*1.2);c.rotation.y=Math.random()*3;c.castShadow=false;motang.add(c)}} // 나무 부스러기
motang.position.set(WOODYARD.motang[0],0,WOODYARD.motang[1]);land.add(motang);
// 장작가리: 기둥과 지붕이 있어서 비에 안 젖어요. 장작이 많을수록 높이 쌓여요
const woodpile=new THREE.Group();woodpile.userData.kind="woodpile";
const pileLogs=new THREE.Group();woodpile.add(pileLogs);
{[[-1.2,-0.35],[1.2,-0.35],[-1.2,0.35],[1.2,0.35]].forEach(([x,z])=>woodpile.add(box(0.1,1.7,0.1,0x6b4a2e,x,0.85,z)));
  const rf=box(2.8,0.07,1.2,0x5a5248,0,1.75,0.05);rf.rotation.x=0.15;woodpile.add(rf);woodpile.add(box(2.5,0.1,0.8,0x7a5a3a,0,0.05,0))} // 지붕, 받침
woodpile.position.set(WOODYARD.pile[0],0,WOODYARD.pile[1]);land.add(woodpile);
const logMat=M(0xb08a5a),logEnd=M(0xd8b885);
let pileShown=-1;
function drawWoodpile(){const n=Math.min(FUEL.pileMax,S.inv.jangjak||0),k=Math.ceil(n/2);if(k===pileShown)return;pileShown=k;
  while(pileLogs.children.length)pileLogs.remove(pileLogs.children[0]);
  for(let i=0;i<k;i++){const row=Math.floor(i/10),col=i%10,m=new THREE.Mesh(new THREE.CylinderGeometry(0.075,0.075,0.6,6),[logMat,logEnd,logEnd]);
    m.rotation.x=Math.PI/2;m.position.set(-1.0+col*0.22+(row%2)*0.08,0.18+row*0.14,0);m.castShadow=true;pileLogs.add(m)}}

/* ---------- 땔감 숲 (집 뒤 산자락): 날마다 쓰러진 나무·마른 나무가 새로 생겨요 ---------- */
const WOODTREE_POS=[[-2.2,-12.4],[1.0,-13.0],[3.8,-12.2]];
const woodTrees=WOODTREE_POS.map(([x,z],i)=>{const g=new THREE.Group();g.userData={kind:"woodtree",i};
  if(i%2===0){const t=cyl(0.2,0.24,2.2,0x7a6a58,0,0.24,0,10);t.rotation.z=Math.PI/2;g.add(t);t.position.y=0.24; // 쓰러진 나무
    g.add(cyl(0.05,0.03,0.6,0x6a5a48,0.5,0.45,0.15,5).rotateZ(-0.7));g.add(cyl(0.05,0.03,0.5,0x6a5a48,-0.4,0.42,-0.12,5).rotateZ(0.8));g.add(sph(0.28,0x8a7a52,-1.1,0.3,0))}
  else{g.add(cyl(0.16,0.22,2.4,0x6e5e4c,0,1.2,0,8));[[0.5,1.8,0.5],[-0.4,1.5,-0.6],[0.2,2.2,0.8]].forEach(([a,y,r])=>g.add(cyl(0.04,0.03,0.7,0x6e5e4c,a*0.5,y,0,5).rotateZ(r)))} // 마른 나무
  g.position.set(x,0,z);g.rotation.y=i*0.7;land.add(g);return g});
// 숲 둘레 산 나무 (베지 않아요)
[[-4.5,-13.5],[-0.6,-14.6],[2.6,-14.2],[5.8,-13.6],[-3.4,-15.8],[4.4,-16]].forEach(([x,z],i)=>tree(x,z,0.85+(i%3)*0.12,false,land));

/* ---------- 논 ---------- */
// scene.js 의 논을 단계별 모습으로 다시 꾸며요: 마른 논 → 물 댄 논 → 모 → 푸른 벼 → 누런 벼(고개 숙임)
const paddySoil=M(0x8b6a48);
const paddyWaterMat=new THREE.MeshLambertMaterial({color:0x8fbcc4,transparent:true,opacity:0.75});
const riceG=new THREE.Group();
(function(){while(paddy.children.length)paddy.remove(paddy.children[0]);
  paddy.add(box(7,0.2,4.6,0x7a5a3a,0,0.1,0)); // 논둑
  const s=new THREE.Mesh(new THREE.BoxGeometry(6.4,0.06,4.0),paddySoil);s.position.y=0.2;s.receiveShadow=true;paddy.add(s);paddy.userData.soil=s;
  const w=new THREE.Mesh(new THREE.BoxGeometry(6.4,0.02,4.0),paddyWaterMat);w.position.y=0.25;paddy.add(w);paddy.userData.water=w;
  paddy.add(riceG)})();
const RICE_SPOTS=[];for(let r=0;r<5;r++)for(let c=0;c<9;c++)RICE_SPOTS.push([-2.8+c*0.7,-1.6+r*0.8]);
let paddyKey="";
function riceClump(stage){const g=new THREE.Group();
  if(stage==="mo"){for(let i=0;i<3;i++)g.add(cone(0.03,0.28,0x8fcf6a,(i-1)*0.04,0.14,0,4))}
  else if(stage==="green"){for(let i=0;i<5;i++){const c=cone(0.05,0.7,0x5f9f3f,(i-2)*0.04,0.35,(i%2)*0.04,4);c.rotation.z=(i-2)*0.12;g.add(c)}}
  else if(stage==="ripe"){for(let i=0;i<5;i++){const c=cone(0.05,0.8,0xd8b44a,(i-2)*0.04,0.4,(i%2)*0.04,4);c.rotation.z=(i-2)*0.12;g.add(c)}
    for(let i=0;i<3;i++){const h=box(0.05,0.2,0.05,0xe8c45a,(i-1)*0.08+0.08,0.72,0);h.rotation.z=-0.9;g.add(h)}} // 고개 숙인 이삭
  else if(stage==="stubble"){for(let i=0;i<3;i++)g.add(cyl(0.015,0.015,0.08,0xc9a64a,(i-1)*0.04,0.04,0,4))}
  g.children.forEach(m=>m.castShadow=false);return g}
function paddyStage(){const p=mode==="home"?S.paddy:(visiting?{pt:Date.now()-RICE.grow*1000}:null);if(!p)return S.paddyStubble&&mode==="home"?"stubble":"empty";
  const f=(Date.now()-p.pt)/(RICE.grow*1000);return f>=1?"ripe":f>=0.35?"green":"mo"}
function drawPaddy(force){const st=paddyStage();if(!force&&st===paddyKey)return;paddyKey=st;
  while(riceG.children.length)riceG.remove(riceG.children[0]);
  paddy.userData.water.visible=st==="mo"||st==="green";paddySoil.color.setHex(st==="empty"||st==="stubble"?0x9c7a52:0x6e5238);
  if(st==="empty")return;
  RICE_SPOTS.forEach(([x,z])=>{const c=riceClump(st);c.position.set(x,0.22,z);riceG.add(c)});
  if(st==="ripe"){const s=sph(0.12,0xf6d54a,0,1.4,0);s.userData.spark=true;riceG.add(s)}}
