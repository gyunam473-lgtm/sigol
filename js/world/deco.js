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
    const c=1+Math.floor(Math.random()*3);for(let k=0;k<c&&pts.length<n;k++){const xx=x+(Math.random()-0.5)*0.9,zz=z+(Math.random()-0.5)*0.9;if(free(xx,zz))pts.push([xx,zz])}}
  const g=new THREE.Group(),m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),s=new THREE.Vector3(),p=new THREE.Vector3(),col=new THREE.Color();
  const GC=grassCols(),FC=flowerCols();
  const tufts=new THREE.InstancedMesh(tuftGeo,tuftMat,pts.length);tufts.receiveShadow=true;
  pts.forEach(([x,z],i)=>{const k=1.0+Math.random()*0.9;m4.compose(p.set(x,0,z),q.setFromEuler(e.set(0,Math.random()*6.3,0)),s.set(k,k*(0.8+Math.random()*0.5),k));tufts.setMatrixAt(i,m4);
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
function scatterAll(){const jobs=[["home",land,2200]];
  Object.entries(PLACES).forEach(([k,P])=>{if(k!=="dwitsan"&&k!=="dabang"&&!P.indoor)jobs.push([k,P.g,1400])});
  jobs.forEach(([k,src,n],i)=>setTimeout(()=>{try{scatter(k,src,n)}catch(e){console.warn("deco",k,e)}},300+i*120))}
// 그 장소가 보일 때만, 집 안에선 안 보여요
function decoFrame(){for(const k in DECO){const g=DECO[k];g.visible=g.userData.src.visible&&ground.visible&&!(typeof inHouse!=="undefined"&&inHouse)}}
