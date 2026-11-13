/* 3D 바탕: 하늘, 빛, 땅, 산, 나무, 이름표, 마을 장터, 논, 표지판 */

/* ---------- 3D 장면 ---------- */
const canvas=$("c");
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,Math.min(screen.width,screen.height)<700?1.6:2)); // 폰은 1.6배까지만 (가볍게)
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();
scene.background=new THREE.Color(0xcfe6ee);scene.fog=new THREE.Fog(0xcfe6ee,32,75);
const camera=new THREE.PerspectiveCamera(48,1,0.1,200);
const hemi=new THREE.HemisphereLight(0xffffff,0x8aa070,0.8);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff1d6,0.8);sun.position.set(12,22,10);sun.castShadow=true;
sun.shadow.mapSize.set(1024,1024);sun.shadow.bias=-0.0006;sun.shadow.normalBias=0.03;Object.assign(sun.shadow.camera,{left:-26,right:26,top:26,bottom:-26});scene.add(sun);

const mats={};const M=c=>mats[c]||(mats[c]=new THREE.MeshLambertMaterial({color:c}));
function mesh(geo,c,x=0,y=0,z=0){const m=new THREE.Mesh(geo,M(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;return m}
const box=(w,h,d,c,x,y,z)=>mesh(new THREE.BoxGeometry(w,h,d),c,x,y,z);
const cyl=(rt,rb,h,c,x,y,z,seg=12)=>mesh(new THREE.CylinderGeometry(rt,rb,h,seg),c,x,y,z);
const sph=(r,c,x,y,z)=>mesh(new THREE.SphereGeometry(r,12,10),c,x,y,z);
const cone=(r,h,c,x,y,z,seg=8)=>mesh(new THREE.ConeGeometry(r,h,seg),c,x,y,z);
// 처마 초롱: 해가 지면 불이 들어와요 (밝기는 play/weather.js 가 정해요)
const lampMat=new THREE.MeshLambertMaterial({color:0xf3dcae,emissive:0x000000});
const lampLights=[];
function lantern(parent,x,y,z){const g=new THREE.Group();
  g.add(cyl(0.008,0.008,0.3,0x3a2a1a,0,0.2,0,4));
  g.add(cyl(0.09,0.09,0.04,0x8a2f24,0,0.04,0,10));g.add(cyl(0.09,0.09,0.04,0x2f4a8a,0,-0.3,0,10));
  const b=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.13,0.28,12),lampMat);b.position.y=-0.13;g.add(b);
  g.position.set(x,y,z);parent.add(g);return g}
function lampLight(parent,x,y,z){const l=new THREE.PointLight(0xffb066,0,9,2);l.position.set(x,y,z);parent.add(l);lampLights.push(l);return l}

const clickables=[];
// 땅
// 땅 질감: 회색빛 얼룩·풀잎 결을 그려 두고, 색은 GROUND_C 로 입혀요 (눈 오면 흰색, 젖으면 짙은 초록)
function noiseTex(kind){const c=document.createElement("canvas");c.width=c.height=256;const x=c.getContext("2d"),R=Math.random;
  x.fillStyle=kind==="dirt"?"rgb(228,226,222)":"rgb(222,224,218)";x.fillRect(0,0,256,256);
  const blot=(n,r0,r1,lo,hi,a)=>{for(let i=0;i<n;i++){const px=R()*256,py=R()*256,r=r0+R()*(r1-r0),v=lo+R()*(hi-lo)|0;
    for(const [ox,oy] of [[0,0],[256,0],[-256,0],[0,256],[0,-256]]){const g=x.createRadialGradient(px+ox,py+oy,0,px+ox,py+oy,r);g.addColorStop(0,"rgba("+v+","+(v+(kind==="dirt"?-4:6))+","+(v-8)+","+a+")");g.addColorStop(1,"rgba("+v+","+v+","+v+",0)");x.fillStyle=g;x.fillRect(px+ox-r,py+oy-r,r*2,r*2)}}};
  if(kind==="dirt"){blot(40,18,50,190,250,0.5);for(let i=0;i<260;i++){const v=150+R()*90|0;x.fillStyle="rgba("+v+","+(v-6)+","+(v-14)+",0.8)";x.beginPath();x.ellipse(R()*256,R()*256,0.8+R()*2.2,0.6+R()*1.6,R()*3,0,7);x.fill()}}
  else{blot(46,20,60,175,255,0.55);x.lineWidth=1.2;for(let i=0;i<1600;i++){const px=R()*256,py=R()*256,v=150+R()*105|0,l=3+R()*6,a=-1.9+R()*0.8;
    x.strokeStyle="rgba("+(v-10)+","+v+","+(v-30)+",0.55)";x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(a)*l*0.4,py+Math.sin(a)*l);x.stroke()}}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t}
const GROUND_C=0xb4d08a,grassTex=noiseTex("grass");grassTex.repeat.set(18,18);
const groundMat=new THREE.MeshLambertMaterial({color:GROUND_C,map:grassTex});
const dirtTex=noiseTex("dirt");
// 흙길: 길이에 맞춰 질감 반복 (2m 한 장)
function dirtBox(w,h,d,c,x,y,z){const t=dirtTex.clone();t.needsUpdate=true;t.repeat.set(w/2,d/2);const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color:c,map:t}));m.position.set(x,y,z);m.receiveShadow=true;return m}
const ground=new THREE.Mesh(new THREE.PlaneGeometry(90,90),groundMat);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.userData.kind="ground";scene.add(ground);clickables.push(ground);
// 흙길
scene.add(dirtBox(2,0.02,26,0xdcc29a,0,0.01,1));scene.add(dirtBox(22,0.02,2,0xdcc29a,0,0.012,1.5));
// 뒷산
[[-22,-34,16,22,0x8fae86],[0,-40,20,28,0x9cb893],[24,-34,15,20,0x86a57d],[-40,-20,12,16,0x9cb893],[40,-18,13,18,0x8fae86]].forEach(([x,z,r,h,c])=>{const m=cone(r,h,c,x,h/2,z,7);m.castShadow=false;scene.add(m)});
// 나무
const land=new THREE.Group();scene.add(land); // 각자의 땅 (집·밭·논)
const plaza=new THREE.Group();plaza.visible=false;scene.add(plaza); // 모두의 마을 장터
const TREES=[]; // 태풍 때 흔들려요 (play/stormfx.js)
function tree(x,z,s=1,fruit,parent=scene){const g=new THREE.Group();TREES.push(g);g.add(cyl(0.18*s,0.25*s,1.4*s,0x7a5a3a,0,0.7*s,0));g.add(sph(1.1*s,0x6f9d57,0,1.9*s,0));g.add(sph(0.8*s,0x7aa862,0.5*s,2.4*s,0.2*s));
  if(fruit)for(let i=0;i<9;i++){const a=i*0.7;g.add(sph(0.13*s,0xe8862e,Math.cos(a)*1.0*s,1.8*s+((i%3)*0.35)*s,Math.sin(a)*1.0*s))}
  g.position.set(x,0,z);parent.add(g);return g}
const BG_TREES=[[-16,-11],[-18,7],[14,-12],[16,2],[-3,-14],[11,14],[-14,14],[3,15],[18,10],[-21,9]].map(([x,z],i)=>tree(x,z,0.8+(i%3)*0.15)); // 장터·분교에선 숨겨요 (neighbors.js)
tree(-15.2,-7.5,1.05,true,land); // 감나무

// 이름표. style: 장소(기본, 크림색) · me(나, 파랑) · nb(이웃, 초록) · shop(가게 주인, 주황)
const LABEL_STYLE={place:["rgba(251,248,240,.92)","#2b2a24"],me:["rgba(58,104,160,.95)","#ffffff"],nb:["rgba(79,122,58,.95)","#ffffff"],shop:["rgba(200,87,47,.96)","#ffffff"],title:["rgba(236,196,92,.96)","#3a2a10"]};
function label(text,scale=1,style="place"){const [bg,fg]=LABEL_STYLE[style]||LABEL_STYLE.place;
  const c=document.createElement("canvas"),ctx=c.getContext("2d"),f=40;
  ctx.font=`${f}px "Gowun Dodum", sans-serif`;const w=Math.ceil(ctx.measureText(text).width)+40;c.width=w;c.height=64;
  ctx.font=`${f}px "Gowun Dodum", sans-serif`;ctx.fillStyle=bg;
  const r=30;ctx.beginPath();ctx.moveTo(r,2);ctx.lineTo(w-r,2);ctx.arc(w-r,32,30,-Math.PI/2,Math.PI/2);ctx.lineTo(r,62);ctx.arc(r,32,30,Math.PI/2,Math.PI*1.5);ctx.fill();
  ctx.fillStyle=fg;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(text,w/2,34);
  const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true}));
  s.scale.set(w/64*0.55*scale,0.55*scale,1);s.renderOrder=10;return s}

// 장터 가는 길 표지판 (각자 땅 입구)
// (2026-11-10) 이정표는 없앴어요. 오가는 건 오른쪽 아래 "마을 지도" 단추로. 예전 코드가 부르는 이름만 남겨 둬요 (빈 묶음, 눌리지 않음)
function signpost(x,z,kind,parent){const g=new THREE.Group();g.position.set(x,0,z);return g}
const toPlaza=signpost(2.4,10.5,"toPlaza",land);

// 마을 장터 (모두가 같이 쓰는 곳)
const STALLS=[];
function stall(x,z,awn,goods,shop){
  const s=new THREE.Group();s.userData.kind="market";s.userData.shop=shop;
  s.add(box(3.4,0.9,1.4,0xa07850,0,0.45,0));
  [[-1.6,-0.6],[1.6,-0.6],[-1.6,0.6],[1.6,0.6]].forEach(([a,b])=>s.add(cyl(0.07,0.07,2.4,0x7a5a3a,a,1.2,b,6)));
  for(let i=0;i<6;i++)s.add(box(0.62,0.12,1.9,i%2?0xf3ead6:awn,-1.55+i*0.62,2.45,0));
  goods.forEach((c,i)=>{const gx=-1+i;s.add(cyl(0.38,0.3,0.3,0xc9a36a,gx,1.05,0));for(let k=0;k<4;k++)s.add(sph(0.14,c,gx+(k%2-0.5)*0.22,1.25,(k>1?0.1:-0.1)))});
  s.position.set(x,0,z);plaza.add(s);STALLS.push(s);return s}
plaza.add(box(18,0.04,13,0xc9bc9e,0,0.02,0));
for(let i=0;i<40;i++){const x=-8.5+(i%10)*1.9,z=-6+Math.floor(i/10)*3.4;plaza.add(box(1.7,0.05,3.1,i%3?0xbfb398:0xb3a68a,x,0.03,z))}
stall(-6.6,-3.5,0xd9583f,[0x7cc36a,0xd9483b,0xc9a66b],"veg");   // 채소가게
stall(-2.2,-4.5,0x3f6f8f,[0x8a6a48,0xc9a66b,0x6b4a2e],"seed");  // 씨앗가게 (씨앗 자루)
stall(2.2,-4.5,0x6f8f3f,[0xf6f2ea,0xe9d9b8,0xf6f2ea],"egg");   // 닭집 (달걀 바구니)
stall(6.6,-3.5,0xb8323a,[0xe0808a,0xc0484a,0xf0d8c8],"meat");  // 정육점 (고기)
// 느티나무와 정자
const zel=tree(-7,3.5,1.8,false,plaza);
const pav=new THREE.Group();pav.add(box(3.4,0.3,3.4,0xb08a5a,0,0.55,0));
[[-1.5,-1.5],[1.5,-1.5],[-1.5,1.5],[1.5,1.5]].forEach(([a,b])=>pav.add(cyl(0.12,0.12,2.4,0x8a3a2a,a,1.7,b,8)));
const pr=cone(3,1.4,0x3d4448,0,3.5,0,4);pr.rotation.y=Math.PI/4;pav.add(pr);
pav.position.set(6,0,3.5);plaza.add(pav);
lantern(pav,1.5,2.6,1.5);lampLight(pav,1.2,2.3,1.2); // 정자 초롱
const toHome=signpost(0,9.5,"toHome",plaza);

// 논 (다음 업데이트)
const PADDY={x:7,z:8};
const paddy=new THREE.Group();paddy.userData.kind="paddy";
paddy.add(box(7,0.2,4.6,0x8b6a48,0,0.1,0));paddy.add(box(6.4,0.08,4,0x9cc6c2,0,0.22,0));
for(let r=0;r<5;r++)for(let c=0;c<9;c++){const t=cone(0.09,0.5,0x86b35a,-2.8+c*0.7,0.5,-1.6+r*0.8,5);t.castShadow=false;paddy.add(t)}
paddy.position.set(PADDY.x,0,PADDY.z);land.add(paddy);
