/* 내 땅: 집(3단계), 장독대, 텃밭과 울타리, 닭장과 달걀, 작물 모습 */

// 우리 집 (기와집)
// 집은 3단계로 커져요: 1 작은 집 → 2 넓힌 집 → 3 큰 기와집 + 사랑채
const HOUSE={x:-7,z:-6};
const house=new THREE.Group();house.userData.kind="house";land.add(house);
const houseLamp=lampLight(land,0,2.2,0); // 마루 앞 초롱 불빛
let roof=null,houseLabel=null,dog=null,cat=null,houseRect=[0,0,0,0];const HF={x:-7,z:-1.7};
function hanok(g,cx,W,D,lv,roofC,front){
  const cz=front-D/2,wallH=2.3+0.25*(lv-1),base=0.4,top=base+wallH;
  g.add(box(W+0.6,base,D+0.8,0xb79a73,cx,base/2,cz));
  g.add(box(W,wallH,D,0xf1e7d0,cx,base+wallH/2,cz));
  const n=Math.max(3,Math.round(W/1.6)+1),xs=[];for(let i=0;i<n;i++)xs.push(cx-W/2+0.1+i*(W-0.2)/(n-1));
  xs.forEach(x=>g.add(box(0.22,wallH,0.22,0x6b4a2e,x,base+wallH/2,front+0.02)));
  g.add(box(0.9,1.6,0.06,0x8a6440,cx,base+0.8,front+0.03));
  for(let i=0;i<n-1;i++){const x=(xs[i]+xs[i+1])/2;if(Math.abs(x-cx)>0.9)g.add(box(0.8,0.8,0.06,0xf8f2e2,x,base+wallH*0.62,front+0.03))}
  g.add(box(W+0.4,0.25,1.1,0xb08a5a,cx,0.55,front+0.55)); // 마루
  const r=(D/2+1.1)/0.866,rg=new THREE.CylinderGeometry(r,r,W+1.6,3,1);rg.rotateX(-Math.PI/2);rg.rotateY(Math.PI/2);
  const rf=new THREE.Mesh(rg,M(roofC));rf.scale.set(1,0.5,1);rf.position.set(cx,top+0.25*r,cz);rf.castShadow=true;rf.receiveShadow=true;g.add(rf);
  const apex=top+0.75*r;g.add(box(W+1.8,0.14,0.3,0x33383c,cx,apex,cz));
  return {rf,apex,cz,top}}
function buildHouse(lv,roofC,rich){
  while(house.children.length)house.remove(house.children[0]);
  const L=HOUSE_LV[lv-1],cx=-4.5-L.W/2,front=-4.3;
  const h=hanok(house,cx,L.W,L.D,lv,roofC,front);roof=h.rf;
  if(lv>=3)hanok(house,-14,2.8,2.6,1,roofC,-0.3); // 사랑채
  if(rich)[cx-L.W/3,cx+L.W/3].forEach(x=>{for(let k=0;k<5;k++)house.add(sph(0.1,0xc4621f,x+(k-2)*0.22,h.top-0.25-k%2*0.1,front+0.3))}); // 곶감
  [cx-L.W/2+0.5,cx+L.W/2-0.5].forEach(x=>lantern(house,x,h.top-0.35,front+1.05)); // 처마 끝 초롱
  houseLamp.position.set(cx,h.top-0.6,front+1.6);
  HF.x=cx;HF.z=front+2.6;houseRect=[cx-L.W/2-0.3,front-L.D-0.4,cx+L.W/2+0.3,front+1.1];
  if(houseLabel)houseLabel.position.set(cx,h.apex+0.9,h.cz);
  if(cat)cat.g.position.set(cx+L.W/4,h.apex-0.52,h.cz+0.6);
}
function applyHouse(){const n=visiting;buildHouse(n?n.lv:(S.houseLv||1),n?n.roof:0x4b5156,!!(n&&n.full))}
buildHouse(S.houseLv||1,0x4b5156,false);
// 장독대
function jar(x,z,i,parent){const r=0.32+(i%2)*0.08;parent.add(cyl(r*0.8,r,0.7,0x5a3a28,x,0.35,z));parent.add(cyl(r*0.55,r*0.8,0.12,0x4a2e1f,x,0.75,z))}
[[-3.6,-5],[-3.1,-4.4],[-3.9,-4.2],[-3.3,-3.7]].forEach(([x,z],i)=>jar(x,z,i,land));

// 우물 (마당 아래쪽 길가). 누르면 물을 마셔요 (play/meal.js)
const well=new THREE.Group();well.userData.kind="well";
{const ring=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.6,0.75,18,1,true),new THREE.MeshLambertMaterial({color:0x9a958a,side:THREE.DoubleSide}));ring.position.y=0.375;ring.castShadow=true;well.add(ring);
  well.add(cyl(0.62,0.62,0.08,0x7f7a70,0,0.76,0,18).translateY(0));const rimIn=cyl(0.5,0.5,0.09,0x6a655c,0,0.77,0,18);well.add(rimIn);
  const water=cyl(0.5,0.5,0.02,0x2b4a5a,0,0.45,0,18);well.add(water);
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2;well.add(box(0.28,0.16,0.08,i%2?0x8c877c:0xa39e92,Math.cos(a)*0.58,0.2+(i%3)*0.18,Math.sin(a)*0.58).rotateY(-a+Math.PI/2))} // 돌
  [-0.6,0.6].forEach(x=>well.add(box(0.1,1.6,0.1,0x6b4a2e,x,0.8,0)));well.add(cyl(0.04,0.04,1.35,0x8a6440,0,1.45,0,8).rotateZ(Math.PI/2));
  const rf=box(1.6,0.06,0.9,0x4b5156,0,1.75,0);well.add(rf);}
const wellBucket=new THREE.Group();wellBucket.add(cyl(0.12,0.1,0.2,0x8a6440,0,0,0,10));wellBucket.add(cyl(0.005,0.005,0.5,0xc9b48a,0,0.35,0,4));wellBucket.position.set(0.2,0.95,0);well.add(wellBucket);
well.position.set(-2.6,0,3.9);land.add(well);

// 텃밭 3x3
const FIELD={x:6,z:-5};
// 밭 울타리: 밭이 넓어지면 울타리도 같이 넓어져요 (3줄 → 4줄 → 5줄)
function makeFence(cols){
  const f=new THREE.Group(),fx=FIELD.x,fz=FIELD.z,x0=fx-3.6,x1=fx+(cols-2)*2.2+1.4,P=0x9a7a52;
  for(let x=x0;x<=x1+0.01;x+=(x1-x0)/Math.round((x1-x0)/1.15)){f.add(box(0.12,0.8,0.12,P,x,0.4,fz-3.6));if(Math.abs(x-fx)>1.2)f.add(box(0.12,0.8,0.12,P,x,0.4,fz+3.6))}
  for(let z=fz-3.6;z<=fz+3.61;z+=1.2){f.add(box(0.12,0.8,0.12,P,x0,0.4,z));f.add(box(0.12,0.8,0.12,P,x1,0.4,z))}
  f.add(box(x1-x0,0.08,0.06,P,(x0+x1)/2,0.6,fz-3.6));f.add(box(0.06,0.08,7.2,P,x0,0.6,fz));f.add(box(0.06,0.08,7.2,P,x1,0.6,fz));
  f.add(box(fx-1.2-x0,0.08,0.06,P,(x0+fx-1.2)/2,0.6,fz+3.6));f.add(box(x1-fx-1.2,0.08,0.06,P,(fx+1.2+x1)/2,0.6,fz+3.6));
  land.add(f);return f}
const fences={3:makeFence(3),4:makeFence(4),5:makeFence(5)};
const plotPos=i=>i<9?[(i%3)-1,Math.floor(i/3)-1]:[2+Math.floor((i-9)/3),(i-9)%3-1];
const plots=[];
for(let i=0;i<15;i++){const [c,r]=plotPos(i),px=FIELD.x+c*2.2,pz=FIELD.z+r*2.2;
  const g=new THREE.Group();g.position.set(px,0,pz);g.userData={kind:"plot",i};
  const soil=box(1.8,0.25,1.8,0x8b5e3c,0,0.125,0);g.add(soil);
  const crop=new THREE.Group();crop.position.y=0.25;g.add(crop);
  land.add(g);plots.push({g,soil,crop,key:""})}

// 닭장 (울타리 안에서만 다니는 닭)
const chickens=new THREE.Group();chickens.visible=false;land.add(chickens);
const PEN={x0:-8.6,x1:-5.2,z0:4.6,z1:8};const hens=[]; // 집 아래쪽 빈 땅
(function(){
  const cxm=(PEN.x0+PEN.x1)/2,czm=(PEN.z0+PEN.z1)/2,w=PEN.x1-PEN.x0,d=PEN.z1-PEN.z0;
  chickens.add(box(w,0.04,d,0xcbb489,cxm,0.02,czm));
  const wire=new THREE.MeshLambertMaterial({color:0xe8e4da,transparent:true,opacity:0.35});
  const panel=(pw,pd,x,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(pw,1.1,pd),wire);m.position.set(x,0.6,z);chickens.add(m)};
  panel(w,0.03,cxm,PEN.z0);panel(0.03,d,PEN.x0,czm);panel(0.03,d,PEN.x1,czm);
  panel(w*0.35,0.03,PEN.x0+w*0.175,PEN.z1);panel(w*0.35,0.03,PEN.x1-w*0.175,PEN.z1);
  chickens.add(box(0.9,1,0.05,0xb59a6c,cxm,0.55,PEN.z1+0.05)); // 문
  [[PEN.x0,PEN.z0],[PEN.x1,PEN.z0],[PEN.x0,PEN.z1],[PEN.x1,PEN.z1],[cxm,PEN.z0],[PEN.x0,czm],[PEN.x1,czm]].forEach(([x,z])=>chickens.add(box(0.12,1.3,0.12,0x8a6440,x,0.65,z)));
  [[w,0.06,cxm,PEN.z0],[w,0.06,cxm,PEN.z1]].forEach(([a,b,x,z])=>chickens.add(box(a,0.06,b,0x8a6440,x,1.22,z)));
  chickens.add(box(0.06,0.06,d,0x8a6440,PEN.x0,1.22,czm));chickens.add(box(0.06,0.06,d,0x8a6440,PEN.x1,1.22,czm));
  // 닭집
  chickens.add(box(1.3,0.9,1,0xc49a6c,PEN.x0+0.8,0.55,PEN.z0+0.65));chickens.add(box(1.5,0.12,1.25,0x8a5a3a,PEN.x0+0.8,1.06,PEN.z0+0.65));
  chickens.add(box(0.35,0.4,0.05,0x3d2a1c,PEN.x0+0.8,0.3,PEN.z0+1.16));chickens.add(box(0.4,0.04,0.6,0xb59a6c,PEN.x0+0.8,0.12,PEN.z0+1.45));
  chickens.add(cyl(0.25,0.2,0.12,0x9a8a6a,cxm+0.6,0.06,czm-0.3)); // 모이통
  for(let i=0;i<10;i++){const c=new THREE.Group(),hd=new THREE.Group();const col=i%5===4?0xb5652e:i>=5&&i%2?0xd9a05a:0xf6f2ea;
    c.add(sph(0.26,col,0,0.3,0));hd.add(sph(0.15,col,0,0,0));hd.add(box(0.05,0.1,0.12,0xd23a2a,0,0.15,0));hd.add(cone(0.05,0.12,0xe8a530,0,-0.02,0.17,4).rotateX(Math.PI/2));
    hd.position.set(0,0.52,0.17);c.add(hd);c.position.set(cxm+(i%5-2)*0.5,0,czm+(i<5?0.3:1.1));chickens.add(c);
    hens.push({g:c,hd,tx:c.position.x,tz:c.position.z,wait:Math.random()*3})}
})();
function henStep(dt,now){hens.forEach(h=>{const p=h.g.position,dx=h.tx-p.x,dz=h.tz-p.z,d=Math.hypot(dx,dz);
  if(d>0.05){const s=Math.min(0.8*dt,d);p.x+=dx/d*s;p.z+=dz/d*s;h.g.rotation.y=Math.atan2(dx,dz);h.hd.position.y=0.52}
  else{h.wait-=dt;h.hd.position.y=0.52-Math.max(0,Math.sin(now/180+p.x*3))*0.18;
    if(h.wait<=0){h.wait=1+Math.random()*3;h.tx=PEN.x0+0.35+Math.random()*(PEN.x1-PEN.x0-0.7);h.tz=PEN.z0+1.5+Math.random()*(PEN.z1-PEN.z0-1.85)}}})}
chickens.userData.kind="coop";
// 달걀: 닭 한 마리가 일정 시간마다 하나씩, 닭장에 최대 닭×3개까지 쌓여요
const eggGroup=new THREE.Group();chickens.add(eggGroup);
function eggsReady(){if(!S.coop||!S.hens)return 0;return Math.min(S.hens*3,Math.floor((Date.now()-(S.eggT||Date.now()))/1000/EGG_SEC)*S.hens)}
function updateEggs(){
  const n=mode==="home"?eggsReady():(visiting&&visiting.chick?4:0);
  if(eggGroup.children.length===n)return;
  while(eggGroup.children.length)eggGroup.remove(eggGroup.children[0]);
  for(let i=0;i<n;i++){const e=sph(0.09,0xf7f1e3,PEN.x0+1.6+(i%5)*0.24,0.1,PEN.z0+0.35+Math.floor(i/5)*0.24);e.scale.y=1.3;eggGroup.add(e)}
}
// 지금 보는 땅에 맞게 밭 크기, 울타리, 닭장을 보여줘요
function applyLand(){
  const n=visiting,full=!!(n&&n.full),cols=mode==="home"?(S.fieldCols||3):3;
  [3,4,5].forEach(c=>fences[c].visible=!full&&c===cols);
  plots.forEach((P,i)=>P.g.visible=i<9||(mode==="home"&&plotPos(i)[0]<=cols-2));
  const showCoop=mode==="home"?!!S.coop:!!(n&&n.chick);chickens.visible=showCoop;
  myBarn.visible=mode==="home"&&(S.barnLv||0)>0;if(myBarn.visible)drawHerd();
  const henN=mode==="home"?(S.hens||0):5;hens.forEach((h,i)=>h.g.visible=i<henN);
  stove.visible=mode==="home";bench.visible=mode==="home"||mode==="visit"; // 부뚜막은 내 땅에서만, 평상은 이웃집에도 있어요
  if(typeof drawDishes==="function")drawDishes(homeTable,mode==="visit"&&visiting?(S.treatDay&&S.treatDay[visiting.name]===today?[]:visiting.treat||[]):S.dishes);
  if(typeof placeSeats==="function")placeSeats();if(typeof applyWoodLand==="function")applyWoodLand();updateEggs();OBS=obstacles();
}

// 대비 모양 (작업 화면과 밭에서 같이 써요). 밭 위 작물 묶음(crop)은 흙 위 0.25 높이에 있어요
function stakeMesh(x,z){const g=new THREE.Group();g.add(cyl(0.025,0.025,0.85,0xc9b27a,x+0.14,0.42,z,5));g.add(cyl(0.05,0.05,0.04,0xe8e0c8,x+0.1,0.45,z,8));return g}
function vinylMesh(k=1){const m=new THREE.Mesh(new THREE.CylinderGeometry(0.88,0.88,1.75,16,1,true,0,Math.PI),new THREE.MeshLambertMaterial({color:0xf4f8f8,transparent:true,opacity:0.45*k+0.1,side:THREE.DoubleSide}));
  m.rotation.z=Math.PI/2;m.scale.set(Math.max(0.15,k),1,1);m.castShadow=false;return m}
function prepMarks(c,p){const e=p.prep&&stormList().find(x=>x.id===p.prep.ev);if(!e)return;
  if(e.kind==="heavy")DRAIN_ROWS.forEach(z=>{c.add(box(1.75,0.04,0.2,0x3a2a1c,0,0.01,z));c.add(box(1.6,0.02,0.1,0x6fa8c8,0,0.035,z))});
  if(e.kind==="typhoon")SPOTS.forEach(([x,z])=>c.add(stakeMesh(x,z)));
  if(e.kind==="frost")c.add(vinylMesh(1))}
function stageOf(p){if(!p)return "none";if(p.dead)return "dead";if(!p.wat)return "seed";const pr=growPr(p);return pr>=1?"ripe":pr>=0.5?"mid":"sprout"}
function drawPlot(i,force){
  if(W&&W.i===i)return; // 작업 중인 칸은 작업 화면이 그려요
  const P=plots[i],p=vp()[i],st=stageOf(p),key=(p?p.crop:"")+st+(p&&p.prep?p.prep.ev:"")+(p&&p.dead||"")+issueKey(p);
  if(!force&&key===P.key)return;P.key=key;
  P.soil.material=M(p&&p.wat?0x5e3d25:0x8b5e3c);
  const c=P.crop;while(c.children.length)c.remove(c.children[0]);
  if(st==="none")return;
  if(st==="dead"){const col=WX_EV[p.dead].col;SPOTS.forEach(([x,z],k)=>{const s=cone(0.1,0.4,col,x,0.08,z,5);s.rotation.z=1.3+k*0.2;s.rotation.y=k*1.5;c.add(s);c.add(sph(0.1,col,x+0.1,0.04,z+0.05))});
    if(p.dead==="heavy")c.add(cyl(0.8,0.8,0.02,0x7a8a8a,0,0.01,0,20));return} // 썩어 쓰러진 포기 (큰비 땐 흙탕물)
  prepMarks(c,p);
  const spots=[[-0.45,-0.45],[0.45,-0.45],[-0.45,0.45],[0.45,0.45]];
  spots.forEach(([x,z])=>{
    if(st==="seed"){c.add(sph(0.08,0x4a3020,x,0.03,z));return}
    if(st==="sprout"){c.add(cone(0.08,0.28,0x8fcf6a,x,0.14,z,5));c.add(cone(0.08,0.22,0x8fcf6a,x+0.08,0.11,z+0.05,5));return}
    if(st==="mid"){c.add(sph(0.2,0x7cbf5c,x,0.15,z));return}
    ripeAt(c,p.crop,x,z);
  });
  if(st==="ripe"){const s=sph(0.12,0xf6d54a,0,1.3,0);s.userData.spark=true;c.add(s)}
  else drawIssues(c,p); // 목마름·잡초·벌레 (play/tend.js)
}
// 다 자란 작물 한 포기 모습 (거두기 작업 화면에서도 같이 써요)
function ripeAt(c,crop,x,z){
  if(crop==="lettuce"){const m=sph(0.32,0x7cc36a,x,0.18,z);m.scale.y=0.6;c.add(m);c.add(sph(0.2,0xa6dc84,x,0.3,z))}
  if(crop==="potato"){c.add(sph(0.3,0x5f8f45,x,0.3,z));c.add(sph(0.06,0xf5f0e0,x+0.1,0.6,z));c.add(sph(0.1,0xc9a66b,x+0.25,0.05,z+0.15))}
  if(crop==="cabbage"){const b=sph(0.36,0xb9dc8a,x,0.22,z);b.scale.y=0.85;c.add(b);c.add(sph(0.26,0xe6f2c6,x,0.38,z))}
  if(crop==="tomato"){c.add(cyl(0.025,0.025,0.9,0x9a7a52,x,0.45,z,5));c.add(sph(0.24,0x5f8f45,x,0.5,z));[[0.15,0.35],[-0.12,0.55],[0.05,0.7]].forEach(([dx,y])=>c.add(sph(0.09,0xd9483b,x+dx,y,z+0.15)))}
}
