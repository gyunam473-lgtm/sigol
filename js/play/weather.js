/* 시간과 날씨: 실제 시계를 따라 하늘색이 천천히 바뀌어요.
   해는 동쪽(오른쪽)에서 떠서 남쪽 하늘을 지나 서쪽(왼쪽)으로 지고, 그림자도 따라 돌아요.
   해 뜨고 지는 시간은 계절마다 달라요 (서울 기준으로 계산: 여름 5시 10분쯤~7시 55분쯤, 겨울 7시 45분쯤~5시 15분쯤).
   밤엔 달(실제 달 모양)·별·처마 초롱이 켜져요. 절기 표시, 비·눈, 비 오면 밭에 물 들기도 여기. */

const winMat=M(0xf8f2e2);

// 해 뜨는 시간, 지는 시간, 한낮 해 높이(도)
function sunTimes(d){
  const doy=(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(d.getFullYear(),0,0))/864e5,R=Math.PI/180,lat=37.57*R;
  const dec=23.44*R*Math.sin(2*Math.PI*(284+doy)/365); // 해가 하늘 어디쯤 지나가나 (계절)
  const B=2*Math.PI*(doy-81)/364,eot=9.87*Math.sin(2*B)-7.53*Math.cos(B)-1.5*Math.sin(B); // 해 시계와 실제 시계 차이(분)
  const noonT=12+(135-126.98)*4/60-eot/60; // 서울 한낮 (12시 반 무렵)
  const H=Math.acos((Math.sin(-0.833*R)-Math.sin(lat)*Math.sin(dec))/(Math.cos(lat)*Math.cos(dec)))/R/15;
  return {rise:noonT-H,set:noonT+H,noon:90-37.57+dec/R}}
const fmtH=h=>Math.floor(h)+":"+String(Math.round(h%1*60)).padStart(2,"0");

// 때 이름 (해 뜨고 지는 시간에 맞춰요)
function timeLabel(h){const t=sunTimes(new Date());
  return h<t.rise-1?(h<4?"깊은 밤":"새벽"):h<t.rise+0.6?"해 뜰 녘":h<11?"아침":h<14?"한낮":h<t.set-1?"오후":h<t.set+0.8?"해질녘":h<22?"밤":"깊은 밤"}

const weather={kind:dayWeather(new Date()),preview:null};
const rainG=new THREE.Group(),snowG=new THREE.Group();scene.add(rainG);scene.add(snowG);
(function(){const rg=new THREE.BoxGeometry(0.02,0.5,0.02),rm=new THREE.MeshBasicMaterial({color:0x9fb8cc,transparent:true,opacity:0.6});
  const sg=new THREE.SphereGeometry(0.06,6,5),sm=new THREE.MeshBasicMaterial({color:0xffffff});
  for(let i=0;i<180;i++){const r=new THREE.Mesh(rg,rm);r.position.set((Math.random()-.5)*26,Math.random()*12,(Math.random()-.5)*26);rainG.add(r);
    const n=new THREE.Mesh(sg,sm);n.position.set((Math.random()-.5)*26,Math.random()*12,(Math.random()-.5)*26);snowG.add(n)}})();
function wetFromWeather(silent){
  if(!(weather.kind==="비"||weather.kind==="눈"))return;
  let n=0;S.plots.forEach(p=>{if(p&&!p.wat){p.wat=Date.now();if(!p.iss)planIssues(p);n++}});
  if(n){save();for(let i=0;i<15;i++)drawPlot(i,true);if(!silent)toast((weather.kind==="비"?"비가 와서":"녹은 눈으로")+" 밭 "+n+"칸에 물이 들었어요")}}

/* ---------- 하늘색 순서 (해 뜨고 지는 시간 기준으로 몇 시간 전후인지) ----------
   sky 하늘, hemi 주변 밝기, sun 햇빛(밤엔 달빛) 세기, sc 빛 색, glow 창호지 불, lamp 초롱 */
const SKY_KEYS=[
  {at:"rise",d:-1.3,sky:0x223058,hemi:0.42,sun:0.26,sc:0xa9c0f0,glow:1,lamp:1},    // 밤
  {at:"rise",d:-0.35,sky:0x8a86ad,hemi:0.42,sun:0.22,sc:0xd9a0b0,glow:0.7,lamp:0.7}, // 새벽 보랏빛
  {at:"rise",d:0.45,sky:0xf2c8a2,hemi:0.62,sun:0.55,sc:0xffc690,glow:0.15,lamp:0},  // 해 뜰 녘 복숭앗빛
  {at:"rise",d:2.0,sky:0xcfe6ee,hemi:0.80,sun:0.80,sc:0xfff1d6,glow:0,lamp:0},      // 낮
  {at:"set",d:-2.0,sky:0xcfe6ee,hemi:0.80,sun:0.80,sc:0xfff1d6,glow:0,lamp:0},
  {at:"set",d:-0.7,sky:0xf0d6a4,hemi:0.68,sun:0.68,sc:0xffc27a,glow:0.1,lamp:0.1},  // 노을 전 금빛
  {at:"set",d:0.15,sky:0xe0a088,hemi:0.46,sun:0.32,sc:0xff9466,glow:0.7,lamp:0.8},  // 해질녘 분홍 주황
  {at:"set",d:0.75,sky:0x4b4b7a,hemi:0.40,sun:0.22,sc:0xa8a2d4,glow:1,lamp:1},      // 땅거미
  {at:"set",d:1.4,sky:0x223058,hemi:0.42,sun:0.26,sc:0xa9c0f0,glow:1,lamp:1}];      // 밤
const _ca=new THREE.Color(),_cb=new THREE.Color();
function skyAt(h,t){
  const ks=SKY_KEYS.map(k=>Object.assign({},k,{h:t[k.at]+k.d}));
  let a=ks[ks.length-1],b=ks[0],f=0;
  if(h>=ks[0].h&&h<ks[ks.length-1].h){for(let i=0;i<ks.length-1;i++)if(h>=ks[i].h&&h<ks[i+1].h){a=ks[i];b=ks[i+1];f=(h-a.h)/(b.h-a.h);break}}
  f=f*f*(3-2*f); // 부드럽게
  const mix=(x,y)=>x+(y-x)*f;
  return {sky:_ca.setHex(a.sky).clone().lerp(_cb.setHex(b.sky),f),sc:_ca.setHex(a.sc).clone().lerp(_cb.setHex(b.sc),f),
    hemi:mix(a.hemi,b.hemi),sun:mix(a.sun,b.sun),glow:mix(a.glow,b.glow),lamp:mix(a.lamp,b.lamp)}}

/* ---------- 하늘에 떠 있는 것: 달, 별 (카메라를 따라다녀서 늘 멀리 보여요) ---------- */
const skyG=new THREE.Group();scene.add(skyG);
// 달 모양: 실제 날짜로 계산 (초승달 → 반달 → 보름달 → 그믐달)
function moonPhase(d){const p=((d.getTime()-Date.UTC(2000,0,6,18,14))/864e5/29.530588)%1;return p<0?p+1:p}
function moonTex(p){
  const c=document.createElement("canvas");c.width=c.height=128;const x=c.getContext("2d"),R=46,m=64;
  const g=x.createRadialGradient(m,m,R*0.9,m,m,62);g.addColorStop(0,"rgba(255,244,214,0.35)");g.addColorStop(1,"rgba(255,244,214,0)");
  x.fillStyle=g;x.fillRect(0,0,128,128); // 달무리
  x.fillStyle="rgba(120,130,160,0.35)";x.beginPath();x.arc(m,m,R,0,Math.PI*2);x.fill(); // 어두운 쪽도 희미하게
  const k=Math.cos(2*Math.PI*p);x.fillStyle="#fbf3dc";x.beginPath();
  if(p<0.5){x.arc(m,m,R,-Math.PI/2,Math.PI/2,false);x.ellipse(m,m,Math.abs(k)*R,R,0,Math.PI/2,Math.PI*1.5,k>0)}
  else{x.arc(m,m,R,Math.PI/2,Math.PI*1.5,false);x.ellipse(m,m,Math.abs(k)*R,R,0,Math.PI*1.5,Math.PI/2,k>0)}
  x.fill();
  x.fillStyle="rgba(170,160,140,0.25)";[[52,54,7],[74,70,9],[60,80,5],[78,48,5]].forEach(([a,b,r])=>{x.beginPath();x.arc(a,b,r,0,Math.PI*2);x.fill()}); // 달 무늬
  return new THREE.CanvasTexture(c)}
const moonP=moonPhase(new Date());
const moon=new THREE.Sprite(new THREE.SpriteMaterial({map:moonTex(moonP),fog:false,transparent:true,depthWrite:false}));
moon.scale.set(16,16,1);skyG.add(moon);
const MOON_DIR=new THREE.Vector3(-0.25,0.9,-0.55).normalize(); // 뒷산 쪽 높은 하늘
moon.position.copy(MOON_DIR).multiplyScalar(150);
const stars=(function(){const n=420,p=new Float32Array(n*3);
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,e=Math.asin(0.05+Math.random()*0.95);p[i*3]=Math.cos(a)*Math.cos(e)*160;p[i*3+1]=Math.sin(e)*160;p[i*3+2]=Math.sin(a)*Math.cos(e)*160}
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(p,3));
  return new THREE.Points(g,new THREE.PointsMaterial({color:0xfff8e8,size:2,sizeAttenuation:false,fog:false,transparent:true,depthWrite:false}))})();
skyG.add(stars);
function skyFollow(){skyG.position.copy(camera.position)} // main.js 에서 매 순간 불러요

/* ---------- 지금 시간 (체험용 '하루 빨리 보기' 중이면 빠르게 흘러요) ---------- */
let timelapse=null; // {t0, h0}
function hourNow(){
  if(timelapse){const e=(performance.now()-timelapse.t0)/1000,h=timelapse.h0+e*0.4; // 1초에 24분
    if(e*0.4>=24){timelapse=null;toast("실제 시간으로 돌아왔어요")}else return h%24}
  const d=new Date();return d.getHours()+d.getMinutes()/60+d.getSeconds()/3600}
function startTimelapse(){timelapse={t0:performance.now(),h0:hourNow()};toast("하루를 1분 만에 보여 드려요")}

let skyNow={night:0};
const _dir=new THREE.Vector3(),_sunE=new THREE.Vector3();
function applyTime(){
  const d=new Date(),h=hourNow(),t=sunTimes(d),w=weather.kind,s=skyAt(h,t),clear=w==="맑음";
  // 해 위치: 동(+x) → 남(+z) → 서(-x), 계절에 따라 높이가 달라요
  const el=t.noon*Math.PI/180,f=(h-t.rise)/(t.set-t.rise);
  const sunDir=(q)=>{const a=Math.PI*Math.min(1,Math.max(0,q));return _sunE.set(Math.cos(a),Math.sin(a)*Math.sin(el)+0.12,Math.sin(a)*Math.cos(el)).normalize()};
  const night=f<0?Math.min(1,-f*(t.set-t.rise)/1.3):f>1?Math.min(1,(f-1)*(t.set-t.rise)/1.4):0; // 해 지고 얼마나 지났나
  _dir.copy(sunDir(f)).lerp(MOON_DIR,night).normalize();
  sun.position.copy(_dir).multiplyScalar(40);sun.color.copy(s.sc);
  let sky=s.sky.clone(),he=s.hemi,su=s.sun;
  if(!clear){const day=Math.max(0,(he-0.3)/0.5),cloud=new THREE.Color(w==="눈"?0xd9e0e4:0xa9b3b9).multiplyScalar(0.18+0.82*day);
    sky.lerp(cloud,0.7);he*=0.85;su*=0.35}
  scene.background=sky;scene.fog=scene.fog||new THREE.Fog(0,1,2);scene.fog.color.copy(sky);scene.fog.near=clear?32:20;scene.fog.far=clear?75:55;
  hemi.intensity=he;sun.intensity=su;
  hemi.color.setHex(0xffffff).lerp(_cb.setHex(0x9ab0e8),night);hemi.groundColor.setHex(0x8aa070).lerp(_cb.setHex(0x3a4660),night); // 밤엔 푸르스름한 달빛
  winMat.emissive.setRGB(1,0.7,0.28).multiplyScalar(s.glow); // 밤엔 창호지에 불이 켜져요
  lampMat.emissive.setRGB(1,0.62,0.25).multiplyScalar(s.lamp);
  lampLights.forEach(l=>l.intensity=1.4*s.lamp);
  // 달과 별은 맑은 밤에만
  stars.material.opacity=clear?night*0.9:0;stars.visible=stars.material.opacity>0.02;
  moon.material.opacity=clear?night:night*0.15;moon.visible=night>0.02&&moonP>0.03&&moonP<0.97;
  skyNow={night,rise:t.rise,set:t.set};
  ground.material=M(w==="눈"?0xe4e8e2:0xa9c97f);
  rainG.visible=w==="비";snowG.visible=w==="눈";
  const hh=Math.floor(h);
  $("clock").textContent=(d.getMonth()+1)+"월 "+d.getDate()+"일 · "+termNow(d)+" 무렵 · "+timeLabel(h)+(timelapse?" "+hh+"시":"")+" · "+w+(weather.preview?" (미리보기)":"");
  $("clock").title="해 뜨는 시간 "+fmtH(t.rise)+" · 해 지는 시간 "+fmtH(t.set)+" · 눌러서 날씨 미리보기";
  $("wxNote").textContent=WX_NOTE[w];
}
$("clock").onclick=()=>{const i=WX_CYCLE.indexOf(weather.kind);weather.preview=true;weather.kind=WX_CYCLE[(i+1)%4];
  if(weather.kind===dayWeather(new Date()))weather.preview=null;applyTime();wetFromWeather();setAmbience();toast("날씨 미리보기: "+weather.kind)};
