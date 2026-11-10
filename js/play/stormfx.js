/* 궂은 날씨가 화면에 보이게 (play/storm.js 가 언제 오는지 정해요)
   - 큰비: 하늘이 시커메지고, 굵은 빗줄기, 번개와 천둥, 땅이 젖고 웅덩이. 물꼬 안 튼 밭엔 물이 차올라요
   - 태풍: 비가 옆으로 날리고, 나무가 휘청, 나뭇잎이 날아가요. 지주대 없는 작물은 마구 흔들려요
   - 서리: 차가운 푸른 빛, 땅과 밭이 하얗게 얼고, 얼음 알갱이가 반짝. 비닐 안 덮은 작물은 하얗게 얼어요
   시작하고 몇 초에 걸쳐 점점 세지고, 끝날 땐 점점 걷혀요 */

// applyTime 이 정한 원래 하늘 밝기를 기억해 두고, 그 위에 궂은 날씨를 덧칠해요
const SKY0={bg:new THREE.Color(),fog:new THREE.Color(),near:32,far:75,hemi:0.8,sun:0.8};
{const _apply=applyTime;applyTime=function(){_apply();SKY0.bg.copy(scene.background);SKY0.fog.copy(scene.fog.color);SKY0.near=scene.fog.near;SKY0.far=scene.fog.far;SKY0.hemi=hemi.intensity;SKY0.sun=sun.intensity}}

const FX={k:0,kind:null,flash:0,nextBolt:0,g:new THREE.Group(),plotFx:[]};scene.add(FX.g);
// 굵은 빗줄기
const stormRain=new THREE.Group();FX.g.add(stormRain);
{const geo=new THREE.BoxGeometry(0.03,1.1,0.03),mat=new THREE.MeshBasicMaterial({color:0xb8c8d6,transparent:true,opacity:0.55});
  for(let i=0;i<650;i++){const m=new THREE.Mesh(geo,mat);m.position.set((Math.random()-.5)*34,Math.random()*14,(Math.random()-.5)*34);stormRain.add(m)}}
// 날아가는 나뭇잎
const leaves=new THREE.Group();FX.g.add(leaves);
{const geo=new THREE.PlaneGeometry(0.16,0.09);[0x6f9d57,0x9cbf5a,0xc9a64a].forEach((c,k)=>{const mat=new THREE.MeshLambertMaterial({color:c,side:THREE.DoubleSide});
  for(let i=0;i<22;i++){const m=new THREE.Mesh(geo,mat);m.position.set((Math.random()-.5)*30,0.5+Math.random()*5,(Math.random()-.5)*30);m.userData.s=Math.random()*6;leaves.add(m)}})}
// 서리 얼음 알갱이 (반짝반짝 천천히)
const frostDust=new THREE.Points(new THREE.BufferGeometry().setAttribute("position",new THREE.Float32BufferAttribute(Array.from({length:600},()=>(Math.random()-.5)*30),3)),
  new THREE.PointsMaterial({color:0xffffff,size:0.1,transparent:true,opacity:0.8}));FX.g.add(frostDust);
// 땅 색: 젖은 땅, 언 땅
const wetGround=new THREE.MeshLambertMaterial({color:0xa9c97f}),groundCols={wet:new THREE.Color(0x6f8a52),frost:new THREE.Color(0xdfe8e6)};
// 웅덩이 (집 마당 곳곳)
const puddles=new THREE.Group();land.add(puddles);
{const pm=new THREE.MeshLambertMaterial({color:0x7f98a8,transparent:true,opacity:0});puddles.userData.mat=pm;
  [[-1,2],[1.5,6],[-3.5,-1.5],[3,1.2],[-0.6,8],[8.5,2.5],[2.8,-9.5],[-5.5,8.5]].forEach(([x,z],i)=>{const m=new THREE.Mesh(new THREE.CircleGeometry(0.5+(i%3)*0.25,18),pm);m.rotation.x=-Math.PI/2;m.position.set(x,0.03,z);m.scale.y=0.7;puddles.add(m)})}

// 밭 칸마다: 대비 안 한 칸엔 물 차오름 / 서리 / 흔들림
function plotFxStart(e){
  plotFxEnd();
  plots.forEach((P,i)=>{const p=S.plots[i];if(!p||p.dead||!P.g.visible)return;const safe=isPrepped(p,e);let m=null;
    if(e.kind==="heavy"&&!safe){m=new THREE.Mesh(new THREE.BoxGeometry(1.75,0.02,1.75),new THREE.MeshLambertMaterial({color:0x8a8270,transparent:true,opacity:0}));m.position.y=0.26}
    if(e.kind==="frost"){m=new THREE.Mesh(new THREE.BoxGeometry(1.8,0.3,1.8),new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x5a6670,transparent:true,opacity:0}));m.position.y=safe?0.26:0.4;m.scale.y=safe?0.05:1}
    if(m){P.g.add(m)}FX.plotFx.push({P,i,m,safe})})}
function plotFxEnd(){FX.plotFx.forEach(f=>{if(f.m)f.P.g.remove(f.m);f.P.crop.rotation.set(0,0,0)});FX.plotFx=[]}

let fxId=null;
function stormFrame(dt,now){
  const e=stormActive(),outside=!inHouse&&mode!=="dabang"&&!W&&!CK;
  // 세기: 시작 4초 동안 점점 세지고, 끝나기 4초 전부터 걷혀요 (실제 날씨는 몇 분에 걸쳐)
  let target=0;if(e){const ramp=Math.min(e.dur*0.15,4000),t=Date.now()-e.at,left=e.at+e.dur-Date.now();target=Math.max(0,Math.min(1,t/ramp,left/ramp))}
  FX.k+=(target-FX.k)*Math.min(1,dt*2);const k=FX.k;
  if(e&&fxId!==e.id){fxId=e.id;FX.kind=e.kind;plotFxStart(e)}
  if(!e&&fxId&&k<0.01){fxId=null;plotFxEnd();FX.kind=null}
  const kind=FX.kind,wet=kind==="heavy"||kind==="typhoon";
  FX.g.visible=k>0.01&&outside;
  if(k<0.01){if(FX.wasOn){FX.wasOn=false;applyTime()} // 걷히면 원래 하늘로
    if(ground.material===wetGround){ground.material=M(weather.kind==="눈"?0xe4e8e2:0xa9c97f)}puddles.visible=false;TREES.forEach(t=>t.rotation.set(0,0,0));return}
  FX.wasOn=true;
  // 하늘: 큰비·태풍은 시커멓게, 서리는 차갑고 푸르게
  const dark=wet?new THREE.Color(0x3c444a):new THREE.Color(0xc4d4e4);
  scene.background=SKY0.bg.clone().lerp(dark,k*(wet?0.85:0.45));scene.fog.color.copy(SKY0.fog).lerp(dark,k*(wet?0.85:0.45));
  scene.fog.near=SKY0.near+(wet?10-SKY0.near:0)*k;scene.fog.far=SKY0.far+(wet?38-SKY0.far:0)*k;
  hemi.intensity=SKY0.hemi*(1-(wet?0.45:0.1)*k);sun.intensity=SKY0.sun*(1-(wet?0.8:0.3)*k);
  // 땅
  if(ground.material!==wetGround)ground.material=wetGround;wetGround.color.setHex(0xa9c97f).lerp(wet?groundCols.wet:groundCols.frost,k);
  wetGround.emissive.setRGB(0.22,0.25,0.28).multiplyScalar(wet?0:k); // 서리: 어스름에도 하얗게 보이게
  puddles.visible=wet&&land.visible;puddles.userData.mat.opacity=0.75*k;
  const mp=me?me.g.position:{x:0,z:0};
  // 비
  stormRain.visible=wet;
  if(wet){const side=kind==="typhoon"?9:1.2,sp=24;stormRain.children.forEach(m=>{m.position.y-=sp*dt;m.position.x+=side*dt;m.rotation.z=kind==="typhoon"?-0.38:-0.05;
    if(m.position.y<0){m.position.y=11+Math.random()*4;m.position.x=mp.x-6+(Math.random()-.5)*30;m.position.z=mp.z-6+(Math.random()-.5)*30}})}
  // 번개와 천둥 (큰비·태풍)
  if(wet&&k>0.6&&now>FX.nextBolt){FX.nextBolt=now+3500+Math.random()*6000;FX.flash=1;if(soundOn)setTimeout(()=>thunder(),300+Math.random()*900)}
  if(FX.flash>0){FX.flash=Math.max(0,FX.flash-dt*7);hemi.intensity+=FX.flash*1.6;scene.background.lerp(new THREE.Color(0xe8eef8),FX.flash*0.7)}
  // 태풍: 나무가 휘청, 나뭇잎이 날아가요
  leaves.visible=kind==="typhoon";
  if(kind==="typhoon"){TREES.forEach((t,i)=>{t.rotation.z=-(0.1+Math.sin(now/260+i*1.7)*0.09)*k;t.rotation.x=Math.sin(now/340+i)*0.05*k});
    leaves.children.forEach(l=>{l.position.x+=(8+l.userData.s)*dt;l.position.y+=Math.sin(now/200+l.userData.s)*dt*2;l.rotation.x+=dt*9;l.rotation.y+=dt*6;
      if(l.position.x>mp.x+15||l.position.y<0.2){l.position.x=mp.x-15;l.position.y=0.5+Math.random()*5;l.position.z=mp.z+(Math.random()-.5)*26}})}
  else TREES.forEach(t=>t.rotation.set(0,0,0));
  // 서리 알갱이
  frostDust.visible=kind==="frost";if(kind==="frost"){frostDust.position.set(mp.x,0,mp.z);frostDust.material.opacity=0.8*k;frostDust.rotation.y+=dt*0.05}
  // 밭: 대비 안 한 칸은 점점 망가지고, 대비한 칸은 끄떡없어요
  FX.plotFx.forEach(f=>{
    if(kind==="heavy"&&f.m){f.m.material.opacity=0.85*k;f.m.position.y=0.26+0.25*k}
    if(kind==="typhoon"){const a=f.safe?0.04:0.45;f.P.crop.rotation.z=Math.sin(now/110+f.i)*a*k;f.P.crop.rotation.x=Math.cos(now/150+f.i*2)*a*0.6*k}
    if(kind==="frost"&&f.m)f.m.material.opacity=(f.safe?0.5:0.7)*k});
}
