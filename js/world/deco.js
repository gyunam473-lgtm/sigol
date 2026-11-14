/* 풀밭 꾸미기 (2026-11-13 그래픽 2단계): 빈 풀밭·길가에 풀포기, 들꽃, 작은 돌을 흩어 둬요.
   장소마다 따로 한 번 만들어 두고, 그 장소가 보일 때만 보여요.
   누르기(걷기) 목록에는 안 넣어서 걷는 데 방해가 안 돼요. 집·밭·마당 같은 물건 자리는 피해서 깔아요.
   한 장소에 풀포기 수백 개를 한 덩어리(InstancedMesh)로 그려서 가벼워요. */

const DECO={}; // 장소 이름 → 꾸미기 묶음
// 풀포기 한 개: 가는 풀잎 다섯 장 (빛은 위에서 받는 걸로 쳐서 고르게 보여요)
const tuftGeo=(()=>{const P=[],N=[];for(let i=0;i<5;i++){const a=i/5*Math.PI*2+Math.random()*0.6,r=0.05,h=0.2+Math.random()*0.12,lean=0.06+Math.random()*0.05;
  const cx=Math.cos(a)*r*0.5,cz=Math.sin(a)*r*0.5,px=-Math.sin(a)*0.022,pz=Math.cos(a)*0.022;
  P.push(cx-px,0,cz-pz, cx+px,0,cz+pz, cx+Math.cos(a)*lean,h,cz+Math.sin(a)*lean);for(let k=0;k<3;k++)N.push(0,1,0)}
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(P,3));g.setAttribute("normal",new THREE.Float32BufferAttribute(N,3));return g})();
const tuftMat=new THREE.MeshLambertMaterial({side:THREE.DoubleSide});
const flowerGeo=new THREE.SphereGeometry(0.045,6,4),flowerMat=new THREE.MeshLambertMaterial();
const pebbleGeo=new THREE.IcosahedronGeometry(0.07,0),pebbleMat=new THREE.MeshLambertMaterial();
// 철마다 풀빛: 봄·여름 초록, 가을 누렇게, 겨울 마른 풀
function grassCols(){const m=new Date().getMonth()+1;
  if(m===12||m<=2)return [0xa89a6a,0x9a8f5e,0x8f8a5a,0xb0a274];
  if(m>=9)return [0x8a9a4a,0xa8a056,0x7f9548,0xb49a5a];
  return [0x6f9a4a,0x88b05a,0x5d8a40,0x7aa24e]}
function flowerCols(){const m=new Date().getMonth()+1;
  if(m===12||m<=2)return null; // 겨울엔 들꽃 없음
  if(m>=9)return [0xf4f0e6,0xd9b8e8,0xf2d25a,0xe8e0f2]; // 들국화·쑥부쟁이
  if(m>=6)return [0xf6f2e8,0xf2d25a,0xe88aa8,0xa8b8f0];
  return [0xf2d25a,0xf6f2e8,0xc8a0e0,0xf0a8c0]} // 봄: 민들레·냉이꽃·제비꽃

// 물건이 차지한 자리 (위에서 본 네모) 모으기
function footprints(src){const R=[],b=new THREE.Box3();src.updateMatrixWorld(true);
  const take=o=>{if(!o.isMesh||!o.geometry||o===ground)return;b.setFromObject(o);if(b.isEmpty()||b.max.y<0.005)return;R.push([b.min.x-0.35,b.max.x+0.35,b.min.z-0.35,b.max.z+0.35])};
  src.traverse(take);scene.children.forEach(o=>{if(o.isMesh)take(o)});return R}

function scatter(key,src,n){
  const R=footprints(src),free=(x,z)=>!R.some(r=>x>r[0]&&x<r[1]&&z>r[2]&&z<r[3]);
  const pts=[];for(let i=0;i<n*3&&pts.length<n;i++){
    // 둘레(길가·물건 옆)에 더 몰리게: 덩어리로 모여 나요
    const x=(Math.random()-0.5)*64,z=-24+Math.random()*54;if(!free(x,z))continue;pts.push([x,z]);
    const c=Math.floor(Math.random()*2);for(let k=0;k<c&&pts.length<n;k++){const xx=x+(Math.random()-0.5)*0.9,zz=z+(Math.random()-0.5)*0.9;if(free(xx,zz))pts.push([xx,zz])}}
  const g=new THREE.Group(),m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),s=new THREE.Vector3(),p=new THREE.Vector3(),col=new THREE.Color();
  const GC=grassCols(),FC=flowerCols();
  const tufts=new THREE.InstancedMesh(tuftGeo,tuftMat,pts.length);tufts.receiveShadow=true;
  pts.forEach(([x,z],i)=>{const k=0.8+Math.random()*0.6;m4.compose(p.set(x,0,z),q.setFromEuler(e.set(0,Math.random()*6.3,0)),s.set(k,k*(0.8+Math.random()*0.5),k));tufts.setMatrixAt(i,m4);
    tufts.setColorAt(i,col.setHex(GC[i%GC.length]).multiplyScalar(0.9+Math.random()*0.2))});
  g.add(tufts);
  if(FC){const fl=pts.filter(()=>Math.random()<0.07),f=new THREE.InstancedMesh(flowerGeo,flowerMat,fl.length);
    fl.forEach(([x,z],i)=>{m4.compose(p.set(x+0.02,0.17+Math.random()*0.08,z),q.identity(),s.set(1.3,0.7,1.3));f.setMatrixAt(i,m4);f.setColorAt(i,col.setHex(FC[Math.floor(Math.random()*FC.length)]))});g.add(f)}
  const pb=[];for(let i=0;i<n*0.6&&pb.length<n*0.12;i++){const x=(Math.random()-0.5)*64,z=-24+Math.random()*54;if(free(x,z))pb.push([x,z])}
  const st=new THREE.InstancedMesh(pebbleGeo,pebbleMat,pb.length);
  pb.forEach(([x,z],i)=>{const k=0.5+Math.random()*1.2;m4.compose(p.set(x,0.01,z),q.setFromEuler(e.set(Math.random(),Math.random()*6,Math.random())),s.set(k,k*0.5,k));st.setMatrixAt(i,m4);
    const v=0.55+Math.random()*0.3;st.setColorAt(i,col.setRGB(v,v*0.97,v*0.92))});g.add(st);
  [tufts,...g.children].forEach(o=>{o.castShadow=false;o.frustumCulled=false});
  g.userData.src=src;scene.add(g);DECO[key]=g;return g}

// 시작할 때 장소마다 차례로 (한꺼번에 하면 잠깐 멈칫해서 나눠서)
function scatterAll(){const jobs=[["home",land,650]];
  Object.entries(PLACES).forEach(([k,P])=>{if(k!=="dwitsan"&&k!=="dabang"&&!P.indoor)jobs.push([k,P.g,450])});
  jobs.forEach(([k,src,n],i)=>setTimeout(()=>{try{scatter(k,src,n)}catch(e){console.warn("deco",k,e)}},300+i*120))}
// 그 장소가 보일 때만, 집 안에선 안 보여요
function decoFrame(){{const on=!PLACES[mode];homeRoads.forEach(r=>r.visible=on)}if(typeof ywG!=="undefined")ywG.visible=mode==="home"&&!PD; // 마당 잡초: 우리 땅에서만, 뽑는 동안엔 숨겨요
  for(const k in DECO){const g=DECO[k];g.visible=g.userData.src.visible&&ground.visible&&!(typeof inHouse!=="undefined"&&inHouse)}}

/* ================= 멀리 보이는 이웃 마을 (2026-11-13) =================
   카메라를 돌리면 저 멀리 다른 집들이 모인 마을이 보여요(놀이 공간 밖 30~40m, 안개 속에 아련하게).
   기와집·초가·함석지붕 집, 굴뚝 연기, 감나무, 논배미, 비닐하우스, 전봇대. 밤엔 창에 불이 켜져요(weather.js 의 winMat).
   집 수십 채를 "한 덩어리"로 합쳐 그려서 휴대폰에서도 가벼워요(그리기 두세 번). 걸어갈 순 없어요(누르기 목록에 없음) */
const FARV=new THREE.Group();scene.add(FARV);
// 넓은 바탕 땅: 원래 땅(90m) 밖까지 안개 끝보다 멀리 이어지게 (누르면 안 걸어가요)
const farGround=new THREE.Mesh(new THREE.PlaneGeometry(260,260),groundMat);farGround.rotation.x=-Math.PI/2;farGround.position.y=-0.06;farGround.receiveShadow=false;scene.add(farGround);
function mergeParts(parts){const P=[],N=[],C=[];
  parts.forEach(({g,m,c})=>{const q=(g.index?g.toNonIndexed():g.clone());q.applyMatrix4(m);const p=q.attributes.position.array,n=q.attributes.normal.array;
    for(let i=0;i<p.length;i++){P.push(p[i]);N.push(n[i])}for(let i=0;i<p.length/3;i++)C.push(c.r,c.g,c.b)});
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(P,3));g.setAttribute("normal",new THREE.Float32BufferAttribute(N,3));g.setAttribute("color",new THREE.Float32BufferAttribute(C,3));return g}
const FARV_SMOKE=[];
(function(){const parts=[],wins=[],_m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),R=Math.random;
  const col=h=>new THREE.Color(h),add=(geo,x,y,z,ry,sx=1,sy=1,sz=1,c,rx=0)=>parts.push({g:geo,m:new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),q.clone().setFromEuler(e.set(rx,ry,0)),new THREE.Vector3(sx,sy,sz)),c:col(c)});
  const BOX=new THREE.BoxGeometry(1,1,1),PRISM=(()=>{const g=new THREE.CylinderGeometry(1,1,1,3,1);g.rotateX(-Math.PI/2);g.rotateY(Math.PI/2);return g})(),CYL=new THREE.CylinderGeometry(1,1,1,7),SPH=new THREE.SphereGeometry(1,8,6),HALF=new THREE.CylinderGeometry(1,1,1,10,1,false,0,Math.PI);
  const WALLS=[0xeee6d2,0xe8dcc0,0xf2eee4,0xd8cdb4],ROOFS={giwa:0x4a5058,cho:0xb8995a,tin1:0x3f6f9a,tin2:0xa84a3a,tin3:0x5a8a6a};
  const MT=[[-22,-34,16],[0,-40,20],[24,-34,15],[-40,-20,12],[40,-18,13]],inMt=(x,z)=>MT.some(([a,b,r])=>Math.hypot(x-a,z-b)<r*0.95);
  // 집 한 채: 몸채 + 지붕(기와·초가·함석) + 창 둘 + 가끔 굴뚝
  function house(x,z,ry){const w=3+R()*1.6,d=2.2+R()*0.6,h=1.7+R()*0.3,style=pickOne(["giwa","giwa","cho","tin1","tin2","tin3"]),wall=pickOne(WALLS);
    const s=Math.sin(ry),c=Math.cos(ry),loc=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c];
    add(BOX,x,h/2,z,ry,w,h,d,wall);add(BOX,x,0.12,z,ry,w+0.3,0.24,d+0.3,0xb0a890);
    const rh=style==="cho"?1.0:style==="giwa"?0.95:0.6,ov=style==="tin1"||style==="tin2"||style==="tin3"?0.25:0.45;
    if(style==="cho"){add(SPH,x,h+0.15,z,ry,w*0.62,rh,d*0.75,ROOFS.cho)}
    // 맞배지붕: 세모 기둥(용마루가 몸채 긴 쪽을 따라). 아래가 몸채 위에 얹혀요
    else add(PRISM,x,h+rh*0.5,z,ry,w+ov*2,rh,(d/2+ov)/0.866,ROOFS[style]);
    // 창 (앞면 +z 쪽 두 개): 밤엔 불빛
    [-w*0.25,w*0.25].forEach(lx=>{const [wx,wz]=loc(lx,d/2+0.01);wins.push({g:BOX,m:new THREE.Matrix4().compose(new THREE.Vector3(wx,h*0.55,wz),q.clone().setFromEuler(e.set(0,ry,0)),new THREE.Vector3(0.6,0.5,0.04)),c:col(0xffffff)})});
    {const [dx,dz]=loc(0,d/2+0.01);add(BOX,dx,0.75,dz,ry,0.7,1.3,0.05,0x6a4e34)} // 문
    if(R()<0.5){const [cx,cz]=loc(w*0.32,-d*0.2);add(BOX,cx,h+rh+0.3,cz,ry,0.3,0.8,0.3,0x8a7a6a);FARV_SMOKE.push([cx,h+rh+0.75,cz])}}
  function treeAt(x,z,s,fruit){add(CYL,x,0.9*s,z,0,0.18*s,1.8*s,0.18*s,0x6a5038);add(SPH,x,2.2*s,z,0,1.2*s,1.0*s,1.2*s,pickOne([0x5f8d4a,0x6f9a52,0x587f44]));
    if(fruit)for(let i=0;i<6;i++)add(SPH,x+Math.cos(i)*0.9*s,2.0*s+(i%2)*0.4,z+Math.sin(i)*0.9*s,0,0.12,0.12,0.12,0xe8782a)}
  // 마을 덩어리: [가운데 x, z, 집 수]
  [[6,38,4],[-16,36,3],[26,32,3],[36,8,4],[34,22,2],[-36,9,4],[-34,23,3],[-27,34,2]].forEach(([cx,cz,n])=>{
    const face=Math.atan2(-cx,-cz); // 대충 우리 마을 쪽을 봐요
    for(let i=0;i<n;i++){const a=i/n*Math.PI*2+R(),r=3+R()*3,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;if(inMt(x,z))continue;house(x,z,face+(R()-0.5)*0.8)}
    for(let i=0;i<3;i++)treeAt(cx+(R()-0.5)*12,cz+(R()-0.5)*10,0.9+R()*0.5,i===0);
    // 논배미와 비닐하우스
    const px=cx+(cx>0?-7:7),pz=cz+(cz>0?-6:6);for(let i=0;i<3;i++)add(BOX,px+(i-1)*4.3,0.03,pz,face,4,0.06,3,pickOne([0x9ab860,0xa8b868,0xc8b870]));
    if(R()<0.6)add(HALF,px,0,pz+4,face+Math.PI/2,1.4,7,1.4,0xe8eeea,Math.PI/2)});
  // 전봇대 한 줄 (마을과 마을을 잇는 길 따라)
  for(let i=0;i<9;i++){const a=-0.4+i*0.45,x=Math.sin(a)*34,z=Math.cos(a)*34;if(inMt(x,z)||Math.abs(z+4)<4)continue;add(CYL,x,3,z,0,0.08,6,0.08,0x7a6a58);add(BOX,x,5.6,z,a,1.2,0.08,0.08,0x6a5a48)}
  const mat=new THREE.MeshLambertMaterial({vertexColors:true});const m=new THREE.Mesh(mergeParts(parts),mat);m.castShadow=m.receiveShadow=false;FARV.add(m);
  const wm=new THREE.Mesh(mergeParts(wins),winMat);FARV.add(wm);
  // 굴뚝 연기 (뭉게뭉게 올라가며 흩어져요)
  const sm=new THREE.InstancedMesh(new THREE.SphereGeometry(0.35,6,5),new THREE.MeshLambertMaterial({color:0xe8e8e4,transparent:true,opacity:0.45,depthWrite:false}),FARV_SMOKE.length*4);sm.frustumCulled=false;FARV.add(sm);FARV.userData.smoke=sm})();
function farvFrame(now){const on=ground.visible&&!(typeof inHouse!=="undefined"&&inHouse);FARV.visible=on;farGround.visible=on;if(!on)return;
  const sm=FARV.userData.smoke,M4=new THREE.Matrix4(),t=now/1000;let k=0;
  FARV_SMOKE.forEach(([x,y,z],i)=>{for(let j=0;j<4;j++){const u=(t*0.12+j/4+i*0.37)%1,s=0.5+u*1.6;M4.makeScale(s,s,s);M4.setPosition(x+u*1.2+Math.sin(t+i+j)*0.2,y+u*3.5,z+u*0.4);sm.setMatrixAt(k++,M4)}});sm.instanceMatrix.needsUpdate=true}
{const df=decoFrame;decoFrame=function(){df();farvFrame(performance.now())}}
