/* 음식과 조리도구 모양
   그림 파일 없이, 화면에서 직접 그린 질감(캔버스 그림)을 입혀서 진짜 음식처럼 보이게 해요.
   - 질감: 감자전(채 썬 감자 결, 바삭한 가장자리), 상추 잎맥, 고춧가루, 토마토 단면, 계란말이 돌돌 무늬, 국수 가락과 고명 …
   - 도구: 양푼(스테인리스), 사발, 접시(파란 테두리), 강판, 칼, 뒤집개, 젓가락, 주걱
   나중에 진짜 3D 모델 파일로 바꿀 땐 이 파일의 함수만 바꿔 끼우면 돼요. */

/* ---------- 질감 그리기 도구 ---------- */
const TEX={},MATS={};
function ctex(key,draw,size=256){
  if(TEX[key])return TEX[key];
  const c=document.createElement("canvas");c.width=c.height=size;const x=c.getContext("2d");draw(x,size);
  const t=new THREE.CanvasTexture(c);t.anisotropy=4;return TEX[key]=t}
const fr=(a,b)=>a+Math.random()*(b-a);
const TAU=Math.PI*2;
function radial(x,s,c0,c1){const g=x.createRadialGradient(s/2,s/2,s*0.04,s/2,s/2,s/2);g.addColorStop(0,c0);g.addColorStop(1,c1);x.fillStyle=g;x.fillRect(0,0,s,s)}
function inDisc(s,rad){const a=fr(0,TAU),d=Math.sqrt(Math.random())*rad;return [s/2+Math.cos(a)*d,s/2+Math.sin(a)*d]}
function specks(x,s,n,cols,r0,r1,rad=s*0.48){for(let i=0;i<n;i++){const [px,py]=inDisc(s,rad);x.fillStyle=cols[i%cols.length];x.beginPath();x.ellipse(px,py,fr(r0,r1),fr(r0,r1)*fr(0.5,1),fr(0,3.1),0,TAU);x.fill()}}
function shreds(x,s,n,cols,l0,l1,w,rad=s*0.48,bend=0.6){x.lineCap="round";for(let i=0;i<n;i++){const [px,py]=inDisc(s,rad),a=fr(0,TAU),l=fr(l0,l1);
  x.strokeStyle=cols[i%cols.length];x.lineWidth=w;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+Math.cos(a+bend)*l*0.5,py+Math.sin(a+bend)*l*0.5,px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke()}}
function blots(x,s,n,col,r0,r1,d0,d1){for(let i=0;i<n;i++){const a=fr(0,TAU),d=fr(d0,d1),px=s/2+Math.cos(a)*d,py=s/2+Math.sin(a)*d,r=fr(r0,r1),g=x.createRadialGradient(px,py,0,px,py,r);
  g.addColorStop(0,col);g.addColorStop(1,"rgba(0,0,0,0)");x.fillStyle=g;x.fillRect(px-r,py-r,r*2,r*2)}}
function leafShape(x,s,wide=0.3){x.beginPath();for(let i=0;i<=72;i++){const a=i/72*TAU,r=1+0.07*Math.sin(a*9)+0.04*Math.sin(a*17);const px=s/2+Math.cos(a)*s*0.44*r,py=s/2+Math.sin(a)*s*wide*r;i?x.lineTo(px,py):x.moveTo(px,py)}x.closePath()}
function veins(x,s,col,w){x.strokeStyle=col;x.lineWidth=w*2.5;x.beginPath();x.moveTo(s*0.08,s/2);x.lineTo(s*0.92,s/2);x.stroke();x.lineWidth=w;
  for(let i=1;i<9;i++){const px=s*(0.1+i*0.085);[-1,1].forEach(d=>{x.beginPath();x.moveTo(px,s/2);x.quadraticCurveTo(px+s*0.04,s/2+d*s*0.13,px+s*0.09,s/2+d*s*0.26);x.stroke()})}}

/* ---------- 음식 질감 ---------- */
const T={
  riceWash:()=>ctex("riceWash",(x,s)=>{radial(x,s,"#f4f2ea","#e2ddd0");specks(x,s,700,["rgba(255,255,255,.95)","rgba(232,226,210,.9)","rgba(214,206,186,.7)"],2,4.5)}), // 씻는 쌀 (뽀얀 쌀뜨물)
  rice:()=>ctex("rice",(x,s)=>{radial(x,s,"#ffffff","#f1eee6");for(let i=0;i<900;i++){const [px,py]=inDisc(s,s*0.48);x.fillStyle=["#ffffff","#f7f5ee","#e8e3d6"][i%3];x.beginPath();x.ellipse(px,py,4.5,2.3,fr(0,3.1),0,TAU);x.fill()}}), // 지은 밥 (윤기 나는 밥알)
  batter:()=>ctex("batter",(x,s)=>{radial(x,s,"#f6ead0","#e6d29e");shreds(x,s,520,["rgba(234,212,156,.95)","rgba(252,245,226,.9)","rgba(206,180,120,.6)"],6,16,2.2);specks(x,s,50,["rgba(255,255,255,.55)"],1,3)}),
  jeon:()=>ctex("jeon",(x,s)=>{radial(x,s,"#efc66e","#d99a3e");shreds(x,s,640,["rgba(248,218,136,.95)","rgba(196,132,52,.75)","rgba(255,238,178,.85)"],6,18,2.4);
    blots(x,s,34,"rgba(150,85,25,.38)",8,22,0,s*0.38);blots(x,s,170,"rgba(120,66,18,.45)",4,12,s*0.38,s*0.5);specks(x,s,60,["rgba(255,240,190,.7)"],1.5,3.5,s*0.45)}),
  pajeon:()=>ctex("pajeon",(x,s)=>{radial(x,s,"#e2c46e","#bf8d3c");shreds(x,s,140,["#3f7a2e","#5d9a3e","#7cb85a"],22,60,3.2,s*0.44,0.2);specks(x,s,30,["#c0392b"],2,4);
    blots(x,s,30,"rgba(140,80,25,.35)",8,20,0,s*0.38);blots(x,s,140,"rgba(110,60,18,.45)",4,12,s*0.38,s*0.5)}),
  hotteok:()=>ctex("hotteok",(x,s)=>{radial(x,s,"#cf8a40","#8f4f1c");blots(x,s,40,"rgba(90,45,12,.35)",8,20,0,s*0.48);shreds(x,s,40,["rgba(255,215,150,.35)"],20,50,5,s*0.4,1.2);specks(x,s,50,["#f5e3b3","#3a2a1a"],1.5,2.6,s*0.4)}),
  eggRaw:()=>ctex("eggRaw",(x,s)=>{radial(x,s,"#fbf6e8","#efe6cc");[[0.38,0.45],[0.6,0.56]].forEach(([u,v])=>{const g=x.createRadialGradient(s*u-6,s*v-6,2,s*u,s*v,s*0.13);g.addColorStop(0,"#ffd27a");g.addColorStop(0.5,"#ffa526");g.addColorStop(1,"#f08c10");x.fillStyle=g;x.beginPath();x.arc(s*u,s*v,s*0.13,0,TAU);x.fill()})}),
  eggBeat:()=>ctex("eggBeat",(x,s)=>{radial(x,s,"#f8d65e","#eeb93a");shreds(x,s,120,["rgba(255,236,150,.6)","rgba(230,170,40,.5)"],20,50,3,s*0.46,1.4);specks(x,s,80,["rgba(255,250,220,.75)"],1.5,4)}),
  scramble:()=>ctex("scramble",(x,s)=>{x.fillStyle="#f4cf55";x.fillRect(0,0,s,s);specks(x,s,90,["rgba(255,240,170,.8)","rgba(214,160,50,.6)","rgba(170,110,40,.35)"],3,10,s);}),
  eggRollSide:()=>ctex("eggRollSide",(x,s)=>{x.fillStyle="#f3cf4c";x.fillRect(0,0,s,s);for(let i=0;i<9;i++){x.fillStyle=i%2?"rgba(255,232,140,.6)":"rgba(222,170,50,.45)";x.fillRect(0,i*s/9,s,s/18)}
    specks(x,s,60,["rgba(190,120,40,.45)"],2,6,s);specks(x,s,30,["#4f8a3a","#e9572f"],2,4,s)}),
  eggRollEnd:()=>ctex("eggRollEnd",(x,s)=>{x.fillStyle="#f6d45a";x.fillRect(0,0,s,s);x.strokeStyle="#d9a42c";x.lineWidth=5;x.beginPath();for(let t=0;t<6*Math.PI;t+=0.05){const r=s*0.46*t/(6*Math.PI);x.lineTo(s/2+Math.cos(t)*r,s/2+Math.sin(t)*r)}x.stroke();
    x.strokeStyle="rgba(170,110,40,.7)";x.lineWidth=10;x.beginPath();x.arc(s/2,s/2,s*0.47,0,TAU);x.stroke();specks(x,s,16,["#4f8a3a","#e9572f"],2,4,s*0.4)}),
  leaf:sea=>ctex(sea?"leafS":"leaf",(x,s)=>{x.clearRect(0,0,s,s);x.save();leafShape(x,s);const g=x.createLinearGradient(0,0,s,s);g.addColorStop(0,"#5e9c3e");g.addColorStop(0.5,"#90c862");g.addColorStop(1,"#6aab48");
    x.fillStyle=g;x.fill();x.clip();blots(x,s,26,"rgba(40,90,30,.28)",10,24,s*0.1,s*0.42);veins(x,s,"rgba(225,246,200,.85)",1.6);
    if(sea){specks(x,s,300,["#b8261b","#d2432a","#8e1c14"],1,2.6,s*0.44);specks(x,s,50,["#f3e6c4"],1.4,2.2,s*0.4);blots(x,s,14,"rgba(200,60,30,.4)",10,24,0,s*0.36);
      shreds(x,s,10,["rgba(255,255,255,.5)"],8,16,2,s*0.3)}x.restore()}),
  cabbageLeaf:()=>ctex("cabbageLeaf",(x,s)=>{x.clearRect(0,0,s,s);x.save();leafShape(x,s,0.34);const g=x.createLinearGradient(0,s/2,s,s/2);g.addColorStop(0,"#f4f6de");g.addColorStop(0.55,"#dfeab8");g.addColorStop(1,"#9cc46a");
    x.fillStyle=g;x.fill();x.clip();veins(x,s,"rgba(255,255,245,.95)",3);x.restore()}),
  kimchi:()=>ctex("kimchi",(x,s)=>{x.clearRect(0,0,s,s);x.save();leafShape(x,s,0.34);const g=x.createLinearGradient(0,s/2,s,s/2);g.addColorStop(0,"#e8826a");g.addColorStop(0.6,"#d9573c");g.addColorStop(1,"#b8442c");
    x.fillStyle=g;x.fill();x.clip();veins(x,s,"rgba(255,200,170,.6)",3);specks(x,s,380,["#9e1a10","#c8321f","#7a120a"],1,2.8,s*0.46);blots(x,s,18,"rgba(150,30,15,.45)",10,26,0,s*0.4);
    shreds(x,s,14,["#4f8a3a","#f3f0e6"],10,22,3,s*0.35,0.3);x.restore()}),
  cabbageCut:()=>ctex("cabbageCut",(x,s)=>{radial(x,s,"#eef3d4","#9cc46a");x.strokeStyle="rgba(170,200,120,.9)";x.lineWidth=3;
    for(let r=s*0.08;r<s*0.48;r+=s*0.045){x.beginPath();for(let i=0;i<=60;i++){const a=i/60*TAU,w=r*(1+0.06*Math.sin(a*5+r));x.lineTo(s/2+Math.cos(a)*w,s/2+Math.sin(a)*w*0.8)}x.stroke()}
    x.fillStyle="#f6f8e6";x.beginPath();x.ellipse(s/2,s/2,s*0.07,s*0.05,0,0,TAU);x.fill()}),
  tomatoSlice:()=>ctex("tomatoSlice",(x,s)=>{x.fillStyle="#c92c1e";x.fillRect(0,0,s,s);x.fillStyle="#ee6450";x.beginPath();x.arc(s/2,s/2,s*0.43,0,TAU);x.fill();
    for(let i=0;i<5;i++){const a=i/5*TAU+0.3,px=s/2+Math.cos(a)*s*0.24,py=s/2+Math.sin(a)*s*0.24;x.fillStyle="#f3c46c";x.beginPath();x.ellipse(px,py,s*0.1,s*0.06,a,0,TAU);x.fill();
      x.fillStyle="#f9eeb0";for(let k=0;k<5;k++){x.beginPath();x.ellipse(px+fr(-8,8),py+fr(-5,5),3,2,a,0,TAU);x.fill()}}
    x.fillStyle="#f58b74";x.beginPath();x.arc(s/2,s/2,s*0.1,0,TAU);x.fill()}),
  potatoSkin:()=>ctex("potatoSkin",(x,s)=>{x.fillStyle="#c49a5e";x.fillRect(0,0,s,s);blots(x,s,40,"rgba(120,85,40,.35)",10,30,0,s*0.7);specks(x,s,220,["rgba(110,75,35,.5)","rgba(220,190,140,.5)"],1,3,s);
    for(let i=0;i<7;i++){const px=fr(20,s-20),py=fr(20,s-20);x.strokeStyle="#6d4a24";x.lineWidth=2.5;x.beginPath();x.arc(px,py,5,0.3,2.4);x.stroke()}}),
  noodles:()=>ctex("noodles",(x,s)=>{radial(x,s,"#efe3c6","#dccba3");x.lineCap="round";
    for(let i=0;i<90;i++){const r=fr(s*0.08,s*0.46),a0=fr(0,TAU),a1=a0+fr(0.6,2.2);x.strokeStyle="rgba(196,176,130,.7)";x.lineWidth=6;x.beginPath();x.arc(s/2,s/2,r,a0,a1);x.stroke();x.strokeStyle="#fbf6e6";x.lineWidth=3.5;x.beginPath();x.arc(s/2,s/2,r,a0,a1);x.stroke()}
    const strip=(c,n,w,l)=>{for(let i=0;i<n;i++){const px=s/2+fr(-s*0.12,s*0.12),py=s/2+fr(-s*0.12,s*0.12),a=fr(0,3.1);x.save();x.translate(px,py);x.rotate(a);x.fillStyle=c;x.fillRect(-l/2,-w/2,l,w);x.restore()}};
    strip("#f4d04e",18,5,34);strip("#7fae4f",14,5,30);strip("#1d1f1a",14,3,36);specks(x,s,30,["#f5e8c8"],1.5,2.2,s*0.15)}),
  sikhye:()=>ctex("sikhye",(x,s)=>{radial(x,s,"#f4ead0","#e6d6ad");for(let i=0;i<90;i++){const [px,py]=inDisc(s,s*0.44);x.fillStyle="rgba(255,255,250,.95)";x.beginPath();x.ellipse(px,py,4,2.2,fr(0,3.1),0,TAU);x.fill()}
    [[0.45,0.42],[0.55,0.5],[0.5,0.58]].forEach(([u,v])=>{x.fillStyle="#f0dca8";x.beginPath();x.ellipse(s*u,s*v,6,4,0.6,0,TAU);x.fill()})}),
  salt:()=>ctex("salt",(x,s)=>{x.fillStyle="#f6f6f2";x.fillRect(0,0,s,s);specks(x,s,300,["#ffffff","#dcdcd6"],1,3,s)}),
  grater:()=>ctex("grater",(x,s)=>{x.fillStyle="#c9cdd2";x.fillRect(0,0,s,s);for(let r=0;r<16;r++)for(let c=0;c<9;c++){const px=14+c*28+(r%2)*14,py=10+r*16;
    x.fillStyle="#5d6267";x.beginPath();x.ellipse(px,py,7,3.5,0,0,TAU);x.fill();x.strokeStyle="#f2f4f6";x.lineWidth=1.5;x.beginPath();x.ellipse(px,py-1.5,7,3,0,Math.PI,TAU);x.stroke()}}),
};

/* ---------- 재질과 모양 ---------- */
const mat=(k,make)=>MATS[k]||(MATS[k]=make());
const lmat=(tex,o={})=>new THREE.MeshLambertMaterial(Object.assign({map:tex},o));
const METAL=()=>mat("metal",()=>new THREE.MeshPhongMaterial({color:0xd4d8dc,specular:0xffffff,shininess:90,side:THREE.DoubleSide}));
const CERAMIC=()=>mat("ceramic",()=>new THREE.MeshPhongMaterial({color:0xf7f4ec,specular:0x777777,shininess:40,side:THREE.DoubleSide}));
const WOOD=()=>mat("woodM",()=>new THREE.MeshLambertMaterial({color:0xb08a58}));
const BLUE=()=>mat("blue",()=>new THREE.MeshLambertMaterial({color:0x2f5d9a}));
function solid(m){m.castShadow=false;m.receiveShadow=true;return m}
// 납작한 원판(전, 단면 등). jit: 가장자리를 울퉁불퉁하게
function disc(r,h,top,side,jit=0,bottom){
  const g=new THREE.CylinderGeometry(r,r*0.97,h,36,1);
  if(jit){const p=g.attributes.position,a1=fr(0,6),a2=fr(0,6);for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);if(Math.hypot(x,z)<1e-6)continue;
    const a=Math.atan2(z,x),k=1+jit*(Math.sin(3*a+a1)*0.5+Math.sin(7*a+a2)*0.35);p.setX(i,x*k);p.setZ(i,z*k)}g.computeVertexNormals()}
  const sm=typeof side==="number"?new THREE.MeshLambertMaterial({color:side}):side;
  return solid(new THREE.Mesh(g,[sm,top,bottom||sm]))}
// 울퉁불퉁한 공 (감자, 토마토, 달걀 볶은 것)
function lumpy(r,j,matl,seg=18){const g=new THREE.SphereGeometry(r,seg,Math.round(seg*0.75)),p=g.attributes.position,a=fr(0,6),b=fr(0,6),c=fr(0,6);
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=1+j*(Math.sin(3*x/r+a)*0.5+Math.sin(4*y/r+b)*0.3+Math.sin(5*z/r+c)*0.2);p.setXYZ(i,x*k,y*k,z*k)}
  g.computeVertexNormals();return solid(new THREE.Mesh(g,matl))}
function lathe(pts,m,seg=32){const o=solid(new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r,y])=>new THREE.Vector2(r,y)),seg),m));o.receiveShadow=false;o.position.y=0.004;return o} // 그릇은 상 표면에서 살짝 띄우고 그림자를 받지 않아요 (별 모양 얼룩 방지)
// 잎 한 장 (가장자리가 살짝 말려 올라가요). userData.mesh 로 질감을 바꿀 수 있어요
function leafPiece(tex,w=0.09,l=0.13){
  const g=new THREE.PlaneGeometry(l,w,6,4),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,Math.pow(y/w,2)*w*0.9+Math.sin(x*45)*0.004)}g.computeVertexNormals();
  const m=solid(new THREE.Mesh(g,lmat(tex,{alphaTest:0.5,side:THREE.DoubleSide})));m.rotation.x=-Math.PI/2;
  const o=new THREE.Group();o.add(m);o.userData.leaf=true;o.userData.mesh=m;return o}

/* ---------- 그릇과 조리도구 ---------- */
function yangpun(){const g=new THREE.Group();g.add(lathe([[0,0],[0.09,0],[0.11,0.008],[0.145,0.05],[0.165,0.085],[0.172,0.09],[0.168,0.094]],METAL()));return g} // 양푼
function plateMesh(r=0.17){const g=new THREE.Group();g.add(lathe([[0,0],[r*0.55,0],[r*0.6,0.006],[r*0.62,0.012],[r*0.95,0.025],[r,0.03],[r*0.98,0.033]],CERAMIC()));
  const rim=new THREE.Mesh(new THREE.TorusGeometry(r*0.985,0.004,6,40),BLUE());rim.rotation.x=Math.PI/2;rim.position.y=0.031;g.add(rim);return g} // 접시
function sabal(r=0.14,h=0.1){const g=new THREE.Group();g.add(lathe([[0,0],[r*0.45,0],[r*0.5,0.008],[r*0.85,h*0.55],[r,h],[r*0.97,h+0.004]],CERAMIC()));
  const line=new THREE.Mesh(new THREE.TorusGeometry(r*0.93,0.004,6,40),BLUE());line.rotation.x=Math.PI/2;line.position.y=h*0.8;g.add(line);return g} // 사발
function knife(){const g=new THREE.Group();g.add(solid(new THREE.Mesh(new THREE.BoxGeometry(0.15,0.04,0.004),METAL())));
  const h=solid(new THREE.Mesh(new THREE.BoxGeometry(0.08,0.02,0.018),WOOD()));h.position.set(-0.115,0.008,0);g.add(h);return g}
function spatula(){const g=new THREE.Group();g.add(solid(new THREE.Mesh(new THREE.BoxGeometry(0.1,0.004,0.08),METAL())));
  const h=solid(new THREE.Mesh(new THREE.CylinderGeometry(0.007,0.007,0.18,8),WOOD()));h.rotation.x=1.15;h.position.set(0,0.04,0.11);g.add(h);return g} // 뒤집개
function chopsticks(){const g=new THREE.Group();[-0.012,0.012].forEach(d=>{const c=solid(new THREE.Mesh(new THREE.CylinderGeometry(0.0035,0.0055,0.24,6),WOOD()));c.position.set(d,0.06,0);c.rotation.z=0.35+d*4;g.add(c)});return g}
function juguk(){const g=new THREE.Group();const p=solid(new THREE.Mesh(new THREE.SphereGeometry(0.035,12,8),WOOD()));p.scale.set(1,0.25,1.4);g.add(p);
  const h=solid(new THREE.Mesh(new THREE.CylinderGeometry(0.006,0.007,0.2,8),WOOD()));h.rotation.x=0.9;h.position.set(0,0.07,0.1);g.add(h);return g} // 주걱
function grater(){const g=new THREE.Group(),m=new THREE.MeshLambertMaterial({color:0xb9bdc2}),top=lmat(T.grater());
  g.add(solid(new THREE.Mesh(new THREE.BoxGeometry(0.15,0.008,0.28),[m,m,top,m,m,m])));const h=solid(new THREE.Mesh(new THREE.BoxGeometry(0.06,0.014,0.07),WOOD()));h.position.set(0,0.004,-0.17);g.add(h);return g} // 강판

/* ---------- 재료 ---------- */
function potato(){const m=lumpy(0.075,0.12,lmat(T.potatoSkin()));m.scale.set(1.25,0.85,1);return m}
function tomato(){const g=new THREE.Group();g.add(lumpy(0.075,0.05,new THREE.MeshPhongMaterial({color:0xd8352a,specular:0x664444,shininess:60})));g.children[0].scale.y=0.85;
  for(let i=0;i<5;i++){const c=cone(0.012,0.05,0x3f7a2e,0,0,0,4);c.rotation.z=Math.PI/2;c.rotation.y=i/5*TAU;c.position.set(Math.cos(i/5*TAU)*0.02,0.064,-Math.sin(i/5*TAU)*0.02);g.add(c)}
  g.add(cyl(0.006,0.006,0.03,0x4f7a2e,0,0.075,0,6));return g}
function tomatoSlice(){const m=disc(0.045,0.01,lmat(T.tomatoSlice()),0xc92c1e,0.04);m.userData.slice=true;return m}
function egg(){const m=solid(new THREE.Mesh(new THREE.SphereGeometry(0.045,16,12),new THREE.MeshPhongMaterial({color:0xe6c29a,shininess:25})));m.scale.y=1.3;return m}
function lettuceHead(){const g=new THREE.Group();for(let i=0;i<7;i++){const l=leafPiece(T.leaf(false),0.1,0.14);l.rotation.y=i/7*TAU;l.children[0].rotation.x=-Math.PI/2+0.7;l.position.y=0.03+(i%2)*0.02;l.children[0].position.x=0.04;g.add(l)}return g}
function cabbageHalf(){const g=new THREE.Group();const d=solid(new THREE.Mesh(new THREE.SphereGeometry(0.14,20,12,0,TAU,0,Math.PI/2),lmat(T.cabbageLeaf(),{side:THREE.DoubleSide})));d.rotation.x=Math.PI;g.add(d);
  const top=solid(new THREE.Mesh(new THREE.CircleGeometry(0.14,32),lmat(T.cabbageCut())));top.rotation.x=-Math.PI/2;top.position.y=0.001;g.add(top);g.scale.y=0.85;g.position.y=0.12;return g}
function scrambleBlob(){const m=lumpy(0.032,0.3,lmat(T.scramble()),10);m.scale.y=0.55;return m}
function eggRoll(){const g=new THREE.CylinderGeometry(0.045,0.045,0.2,24);const m=solid(new THREE.Mesh(g,[lmat(T.eggRollSide()),lmat(T.eggRollEnd()),lmat(T.eggRollEnd())]));m.rotation.z=Math.PI/2;return m}

/* ---------- 완성된 음식 (평상·정자 소반, 부뚜막 접시에 올라가요) ---------- */
const DISH={
  bap:g=>{g.add(sabal(0.13,0.1));const m=new THREE.Mesh(new THREE.SphereGeometry(0.12,20,12,0,TAU,0,Math.PI/2),lmat(T.rice()));m.scale.y=0.6;m.position.y=0.085;m.castShadow=true;g.add(m)}, // 고봉밥
  jeon:g=>{g.add(plateMesh());const d=disc(0.13,0.022,lmat(T.jeon()),0xc98a3a,0.06);d.position.y=0.042;g.add(d)},
  pajeon:g=>{g.add(plateMesh());const d=disc(0.13,0.02,lmat(T.pajeon()),0xb88a3c,0.06);d.position.y=0.04;g.add(d)},
  hotteok:g=>{g.add(plateMesh());[-0.055,0.055].forEach((x,i)=>{const d=disc(0.065,0.028,lmat(T.hotteok()),0x8f4f1c,0.05);d.scale.y=1.2;d.position.set(x,0.045+i*0.008,i*0.02);d.rotation.z=i?0.12:0;g.add(d)})},
  geot:g=>{g.add(plateMesh());for(let i=0;i<9;i++){const l=leafPiece(T.leaf(true),0.08,0.12);l.position.set(fr(-0.06,0.06),0.035+i*0.006,fr(-0.06,0.06));l.rotation.set(fr(-0.4,0.4),fr(0,TAU),fr(-0.4,0.4));g.add(l)}},
  salad:g=>{g.add(plateMesh());for(let i=0;i<4;i++){const l=leafPiece(T.leaf(false),0.08,0.12);l.position.set(fr(-0.05,0.05),0.035,fr(-0.05,0.05));l.rotation.y=fr(0,TAU);g.add(l)}
    for(let i=0;i<6;i++){const s=tomatoSlice();const a=i/6*TAU;s.position.set(Math.cos(a)*0.065,0.05+i*0.003,Math.sin(a)*0.065);s.rotation.set(0.25*Math.sin(a),0,0.25*Math.cos(a));g.add(s)}},
  egg:g=>{g.add(plateMesh());for(let i=0;i<4;i++){const d=disc(0.04,0.045,lmat(T.eggRollEnd()),lmat(T.eggRollSide()),0.04);d.scale.x=1.3;d.position.set(-0.09+i*0.06,0.055,0);d.rotation.z=(i-1.5)*0.08;g.add(d)}},
  tomegg:g=>{g.add(plateMesh());for(let i=0;i<10;i++){const b=scrambleBlob();b.position.set(fr(-0.08,0.08),0.04,fr(-0.08,0.08));g.add(b)}
    for(let i=0;i<7;i++){const t=lumpy(0.024,0.25,new THREE.MeshPhongMaterial({color:0xd8402c,shininess:70}),10);t.position.set(fr(-0.08,0.08),0.045,fr(-0.08,0.08));g.add(t)}
    for(let i=0;i<6;i++){const c=cyl(0.005,0.005,0.03,0x5d9a3e,fr(-0.07,0.07),0.06,fr(-0.07,0.07),5);c.rotation.z=Math.PI/2;g.add(c)}},
  kimjang:g=>{g.add(plateMesh());for(let i=0;i<6;i++){const l=leafPiece(T.kimchi(),0.1,0.16);l.position.set(fr(-0.03,0.03),0.035+i*0.009,fr(-0.03,0.03));l.rotation.set(fr(-0.3,0.3),fr(-0.5,0.5),fr(-0.3,0.3));g.add(l)}},
  guksu:g=>{g.add(sabal(0.14,0.1));const d=disc(0.125,0.004,lmat(T.noodles()),0xe4d4b0);d.position.y=0.085;g.add(d)},
  sikhye:g=>{g.add(sabal(0.11,0.09));const d=disc(0.1,0.004,lmat(T.sikhye()),0xefe4c4);d.position.y=0.075;g.add(d)}};
function dish3D(id){const g=new THREE.Group();(DISH[id]||DISH.jeon)(g);return g}
