/* 비닐하우스 (2026-11-14): 텃밭 오른쪽 빈 땅. 살림 장부에서 짓고(4칸) 넓혀요(6칸).
   - 하우스 칸은 S.plots 15번부터 (밭 15칸 다음). 밭 칸과 똑같이 심고·물 주고·돌보고·거둬요(work.js 그대로)
   - 철 상관없이 아무 작물이나 심어요(겨울에 상추·딸기도). 궂은 날씨(큰비·태풍·서리)에도 끄떡없어요
   - 대신 비가 와도 물이 안 들어요(손으로 물 주기)
   비닐은 반투명이라 밖에서도 작물이 보이고, 눌러도 비닐을 지나 밭 칸이 눌려요 */
const GH={x:20.2,z:-6,W:5.2,L:9.2};
const GH_LV=[null,{name:"비닐하우스",n:4,cost:2500},{name:"넓힌 비닐하우스",n:6,cost:3500}];
const GH0=15; // 하우스 첫 칸 번호
const ghN=()=>GH_LV[S.ghLv||0]?GH_LV[S.ghLv].n:0;
const isGh=i=>i>=GH0;
// 칸 자리: 앞줄부터 (문 쪽이 앞)
const ghPos=j=>[GH.x+(j%2?1.3:-1.3),GH.z+GH.L/2-2.4-Math.floor(j/2)*2.8];
const ghG=new THREE.Group();ghG.visible=false;land.add(ghG);
const ghSite=new THREE.Group();land.add(ghSite);
(function(){const x0=GH.x-GH.W/2,x1=GH.x+GH.W/2,z0=GH.z-GH.L/2,z1=GH.z+GH.L/2,R=GH.W/2;
  ghG.add(dirtBox(GH.W,0.04,GH.L,0xa8865e,GH.x,0.02,GH.z)); // 하우스 안 흙바닥
  // 활대(쇠 파이프)
  const pipe=new THREE.MeshLambertMaterial({color:0xb8bcc0});
  for(let k=0;k<6;k++){const z=z0+k*GH.L/5,t=new THREE.Mesh(new THREE.TorusGeometry(R,0.035,6,18,Math.PI),pipe);t.position.set(GH.x,0,z);t.scale.y=0.95;t.castShadow=true;ghG.add(t)}
  ghG.add(lay(cyl(0.04,0.04,GH.L,0xb8bcc0,GH.x,R*0.95,GH.z,6),"x"));
  // 비닐: 반투명 반원통 + 앞뒤 반원
  const vin=new THREE.MeshLambertMaterial({color:0xeef4f2,transparent:true,opacity:0.32,side:THREE.DoubleSide,depthWrite:false});
  const roof=new THREE.Mesh(new THREE.CylinderGeometry(R,R,GH.L,22,1,true,Math.PI/2,Math.PI),vin);roof.rotation.x=Math.PI/2;roof.scale.z=0.95;roof.position.set(GH.x,0,GH.z);roof.userData.see=1;ghG.add(roof);
  const back=new THREE.Mesh(new THREE.CircleGeometry(R,22,0,Math.PI),vin);back.scale.y=0.95;back.position.set(GH.x,0,z0);back.userData.see=1;ghG.add(back);
  // 앞: 문 둘레만 비닐, 가운데는 문 (열어 둠)
  [-1,1].forEach(s=>{const w=new THREE.Mesh(new THREE.PlaneGeometry(R-0.75,1.9),vin);w.position.set(GH.x+s*(0.75+(R-0.75)/2),0.95,z1);w.userData.see=1;ghG.add(w)});
  const lintel=new THREE.Mesh(new THREE.PlaneGeometry(1.5,R*0.95-1.9),vin);lintel.position.set(GH.x,1.9+(R*0.95-1.9)/2,z1);lintel.userData.see=1;ghG.add(lintel);
  [-0.75,0.75].forEach(dx=>ghG.add(box(0.06,1.95,0.06,0x8a8e92,GH.x+dx,0.975,z1)));ghG.add(box(1.56,0.06,0.06,0x8a8e92,GH.x,1.93,z1));
  // 옆 아래 둘레 흙 누름 (비닐 끝을 흙으로 덮어요)
  [x0,x1].forEach(x=>ghG.add(box(0.18,0.12,GH.L,0x8a6a48,x,0.06,GH.z)));
  // 안쪽 물뿌리개·고무 대야
  ghG.add(cyl(0.22,0.18,0.28,0x3a6aa8,x1-0.45,0.14,z0+0.5,12));const can=cyl(0.1,0.1,0.22,0x5a9a5a,x0+0.4,0.11,z0+0.5,10);ghG.add(can);
  const l=label("비닐하우스",1.1);l.position.set(GH.x,R*0.95+0.6,z1-0.4);ghG.add(l);
  // 짓기 전: 말뚝 넷과 표지판
  [[x0,z0],[x1,z0],[x0,z1],[x1,z1]].forEach(([x,z])=>ghSite.add(box(0.1,0.6,0.1,0x9a7a52,x,0.3,z)));
  const sg=new THREE.Group();sg.add(box(0.08,1.0,0.08,0x7a5a3a,0,0.5,0));sg.add(box(1.0,0.5,0.06,0xe8d8b0,0,1.0,0.03));sg.position.set(GH.x,0,z1+0.6);ghSite.add(sg);
  const sl=label("비닐하우스 자리",1.0);sl.position.set(GH.x,1.75,z1+0.6);ghSite.add(sl);
  ghSite.add(hitBox(GH.W,1.2,GH.L,GH.x,0.6,GH.z));
  poke(ghSite,()=>toast("비닐하우스 지을 자리예요. 집 안 책상의 살림 장부에서 "+GH_LV[1].cost.toLocaleString()+"원에 지어요 · 겨울에도 아무 작물이나 키워요"),[GH.x,z1+1.4]);
})();
function lay(m,ax){if(ax==="x")m.rotation.x=Math.PI/2;else m.rotation.z=Math.PI/2;return m}
// 하우스 칸 (밭 칸과 같은 모양) → plots[15..20]
for(let j=0;j<6;j++){const [px,pz]=ghPos(j),g=new THREE.Group();g.position.set(px,0,pz);g.userData={kind:"plot",i:GH0+j};
  const soil=box(1.8,0.25,1.8,0x8b5e3c,0,0.125,0);g.add(soil);const crop=new THREE.Group();crop.position.y=0.25;g.add(crop);
  ghG.add(g);plots.push({g,soil,crop,key:""})}
while(S.plots.length<GH0+6)S.plots.push(null);
// 우리 땅에서만, 지은 만큼
{const al=applyLand;applyLand=function(){al();const home=mode==="home",on=home&&(S.ghLv||0)>0;ghG.visible=on;ghSite.visible=home&&!on;
  plots.forEach((P,i)=>{if(isGh(i))P.g.visible=on&&i-GH0<ghN()});OBS=obstacles()}}
// 하우스 벽 (앞 가운데 문은 비워요)
{const ob=obstacles;obstacles=function(){const R=ob();if(inHouse||PLACES[mode]||mode!=="home")return R;const x0=GH.x-GH.W/2,x1=GH.x+GH.W/2,z0=GH.z-GH.L/2,z1=GH.z+GH.L/2,T=0.08;
  if((S.ghLv||0)>0)R.push([x0-T,z0,x0+T,z1],[x1-T,z0,x1+T,z1],[x0,z0-T,x1,z0+T],[x0,z1-T,GH.x-0.8,z1+T],[GH.x+0.8,z1-T,x1,z1+T]);
  else R.push([GH.x-0.3,z1+0.5,GH.x+0.3,z1+0.7]);return R}}
