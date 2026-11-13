/* 시작과 움직임: 처음 화면 준비, 매 순간 화면 다시 그리기, '다녀오셨어요' 요약. 다른 파일을 다 불러온 뒤 마지막에 실행돼요. */

// 처음 화면 준비
for(let i=0;i<15;i++)drawPlot(i,true);
applyLand();
refresh();
applyTime();setInterval(()=>{if(!timelapse)applyTime()},20000); // 하늘은 20초마다 조금씩 (빨리 보기 중엔 매 순간)

/* ---------- 움직임 ---------- */
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<h?58:46;camera.updateProjectionMatrix()}
window.addEventListener("resize",resize);
if(window.ResizeObserver)new ResizeObserver(resize).observe(canvas);
resize();
function stepActor(a,dt){
  const p=a.g.position,dx=a.tx-p.x,dz=a.tz-p.z,d=Math.hypot(dx,dz);
  if(d>0.05){const s=Math.min(a.speed*dt,d);let nx=p.x+dx/d*s,nz=p.z+dz/d*s;
    if(a===me&&blocked(nx,nz)){ // 막히면 옆으로 미끄러지듯 돌아가요
      const sx=Math.sign(dx)*s,sz=Math.sign(dz)*s;
      if(!blocked(p.x+sx,p.z))[nx,nz]=[p.x+sx,p.z];else if(!blocked(p.x,p.z+sz))[nx,nz]=[p.x,p.z+sz];
      else if(!blocked(p.x+s,p.z))[nx,nz]=[p.x+s,p.z];else if(!blocked(p.x-s,p.z))[nx,nz]=[p.x-s,p.z];else{nx=p.x;nz=p.z}
      a.stuck=(a.stuck||0)+dt;if(a.stuck>2.5){a.tx=p.x;a.tz=p.z;pending=null;a.route=[];a.stuck=0;toast("길이 막혔어요. 다른 쪽으로 돌아가 볼까요?")}}
    p.x=nx;p.z=nz;a.g.rotation.y=Math.atan2(dx,dz);a.moving=true;a.b.position.y=Math.abs(Math.sin(performance.now()/110))*0.08}
  else{if(a.moving){a.moving=false;a.b.position.y=0;return true}}
  return false}
const camPos=new THREE.Vector3(),look=new THREE.Vector3(0,0,4),lookT=new THREE.Vector3();
let last=performance.now(),tick=0;
function loop(now){
  const dt=Math.min(0.05,(now-last)/1000);last=now;
  if(me){
    if(!SIT&&!CK&&!LIE&&!FS&&stepActor(me,dt)){ // 돌아가는 길(입구 등)이 남았으면 다음 지점으로, 아니면 도착
      if(me.route&&me.route.length){const n=me.route.shift();me.tx=n[0];me.tz=n[1];me.moving=true}else arrive()}
    const crouch=W?0.62:1; // 작업 중엔 쪼그려 앉아요
    if(workT>0){workT-=dt;me.b.scale.y=crouch*(1-Math.sin((0.5-workT)/0.5*Math.PI)*0.25)}else me.b.scale.y=crouch;
    npcs.forEach(n=>{if(n.stay){n.b.position.y=0;return}if(stepActor(n,dt))n.wait=2+Math.random()*4;if(!n.moving){n.wait-=dt;if(n.wait<=0){const W=PLACES[mode]?PLACES[mode].way:WAY;let w=W[Math.floor(Math.random()*W.length)];
      for(let k=0;k<6&&SIT&&Math.hypot(w[0]-SIT.seat.x,w[1]-SIT.seat.z)<5;k++)w=W[Math.floor(Math.random()*W.length)]; /* 앉아 있을 땐 내 둘레로 안 와요 */n.tx=w[0]+(Math.random()-.5)*2;n.tz=w[1]+(Math.random()-.5)*2;n.moving=true}}});
    if(W){const g=W.P.g.position;camPos.set(g.x,4.6,g.z+2.2);lookT.set(g.x,0.2,g.z+0.05)} // 작업 중엔 밭 칸 위로 가까이
    else if(PD){camPos.copy(PD.cam);lookT.copy(PD.look)} // 마당일 (장작·논)
    else if(FS){camPos.copy(FS.cam);lookT.copy(FS.look)} // 낚시
    else if(SKYV){camPos.copy(SKYV.cam);lookT.copy(SKYV.look)} // 서서 하늘 보기
    else if(SIT){const v=sitView();camPos.copy(v[0]);lookT.copy(v[1])} // 앉으면 뒤쪽 위에서, 음식 누르면 가까이
    else if(CK){camPos.copy(CK.cam);lookT.copy(CK.look)} // 요리할 땐 부뚜막 앞으로
    else if(LIE)lieCam(); // 누우면 이불 옆 위에서
    else if(inHouse)roomCam(); // 집 안: 앞쪽 위에서 방을 들여다봐요
    else if(mode==="dabang")dabangCam(); // 다방 안
    else{const p=me.g.position;camPos.set(p.x,p.y+10,p.z+11);lookT.set(p.x,1,p.z-1)}
    camera.position.lerp(camPos,0.07);look.lerp(lookT,0.12);camera.lookAt(look);
    workFrame(dt);cookFrame(dt,now);choreFrame(dt,now);fishFrame(dt,now);eatFrame(dt);placesFrame(dt,now);grindFrame(dt,now);village2Frame(dt,now);gotgamFrame(dt);decoFrame();armsFrame(dt,now);sitChoreUi();
  }
  if(rainG.visible||snowG.visible){const G=rainG.visible?rainG:snowG,sp=rainG.visible?14:1.6,mp=me?me.g.position:{x:0,z:0};
    G.children.forEach((m,i)=>{m.position.y-=sp*dt;if(!rainG.visible)m.position.x+=Math.sin(now/600+i)*0.004;
      if(m.position.y<0){m.position.y=10+Math.random()*3;m.position.x=mp.x+(Math.random()-.5)*26;m.position.z=mp.z-6+(Math.random()-.5)*26}})}
  if(markT>0){markT-=dt;markMat.opacity=Math.max(0,markT/0.6)*0.8;const k=1+(0.6-markT)*1.2;mark.scale.set(k,1,k)}
  if(chickens.visible&&land.visible)henStep(dt,now);
  if(ijang.visible&&land.visible){
    const g=dog.g.position,dx=dog.tx-g.x,dz=dog.tz-g.z,d=Math.hypot(dx,dz);
    if(d>0.05){const s=Math.min(2.2*dt,d);g.x+=dx/d*s;g.z+=dz/d*s;dog.g.rotation.y=Math.atan2(dx,dz)-Math.PI/2;dog.legs.forEach((l,i)=>l.position.y=0.17+Math.sin(now/70+i*Math.PI/2)*0.05)}
    else{dog.wait-=dt;if(dog.wait<=0){dog.wait=1+Math.random()*3;
      if(me&&Math.random()<0.4){dog.tx=me.g.position.x+1.2;dog.tz=me.g.position.z+0.8}else{dog.tx=-9+Math.random()*7.5;dog.tz=0.6+Math.random()*3}}}
    dog.tail.rotation.x=Math.sin(now/90)*0.6;
    cat.tail.rotation.z=Math.sin(now/700)*0.35;cat.g.children[1].position.y=0.17+Math.sin(now/900)*0.01;
  }
  for(let i=drops.length-1;i>=0;i--){const d=drops[i];d.userData.v-=9*dt;d.position.y+=d.userData.v*dt;if(d.position.y<0.25){scene.remove(d);drops.splice(i,1)}}
  plots.forEach(P=>P.crop.children.forEach(c=>{if(c.userData.spark)c.position.y=1.3+Math.sin(now/300)*0.12}));
  riceG.children.forEach(c=>{if(c.userData.spark)c.position.y=1.4+Math.sin(now/300)*0.12});
  if(dwitsan.visible)forageG.children.forEach(g=>g.children.forEach(c=>{if(c.userData.spark)c.position.y=0.75+Math.sin(now/300)*0.08})); // (풀 묶음 안에서의 높이)
  tick+=dt;if(tick>1){tick=0;for(let i=0;i<15;i++)drawPlot(i);updateEggs();if(!PD)drawPaddy()}
  if(mode==="dwitsan"&&me&&!SIT){me.g.position.y=sanH(me.g.position.x,me.g.position.z);npcs.forEach(n=>{if(n.g.visible&&!n.saved)n.g.position.y=sanH(n.g.position.x,n.g.position.z)})} // 뒷산: 오르막 내리막
  if(timelapse)applyTime();skyFollow();stormFrame(dt,now);
  if(inHouse){rainG.visible=snowG.visible=false;if(tick===0&&!(LIE&&LIE.off))roomLighting()}
  if(mode==="dabang"){rainG.visible=snowG.visible=false;if(tick===0)dabangLighting()}
  markers.forEach((m,i)=>m.position.y=m.userData.y+Math.sin(now/320+i)*0.08); // 가게 주인 말풍선
  renderer.render(scene,camera);
  if(me&&!loop.shown){loop.shown=true;$("loading").classList.add("done")}
  requestAnimationFrame(loop)}
camera.position.set(0,12,24);camera.lookAt(0,0,4);
// 작은 물건(지름 30cm 아래)은 그림자를 안 드리워요. 그림자 계산이 훨씬 가벼워져요
// 넓은 마당·운동장·장터 바닥(얇고 넓은 판)에 흙 질감을 입혀요. 판 크기만큼 질감을 반복(2m 한 장)
function texYards(){let n=0;scene.traverse(o=>{const g=o.geometry;if(!o.isMesh||!g||g.type!=="BoxGeometry"||!o.material||o.material.map||o.material.transparent)return;
  const P=g.parameters,s=o.getWorldScale(new THREE.Vector3()),w=P.width*s.x,h=P.height*s.y,d=P.depth*s.z;if(h>0.08||w*d<16||o.position.y>0.2)return;
  const t=dirtTex.clone();t.needsUpdate=true;t.repeat.set(w/2.4,d/2.4);o.material=new THREE.MeshLambertMaterial({color:o.material.color.clone().multiplyScalar(0.97),map:t});o.receiveShadow=true;n++});return n}
function trimShadows(){let n=0;scene.traverse(o=>{if(o.isMesh&&o.castShadow&&o.geometry){if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere();const s=o.getWorldScale(new THREE.Vector3()),r=o.geometry.boundingSphere.radius*Math.max(s.x,s.y,s.z);if(r<0.15){o.castShadow=false;n++}}});return n}
const start=()=>{if(me)return;makePeople();setHold(S.hold);applyWoodLand();checkCold();
  const away=S.lastSeen?Date.now()-S.lastSeen:0;
  const ripe=S.plots.filter(p=>p&&stageOf(p)==="ripe").length,eggs=eggsReady(),w=weather.kind;
  wetFromWeather(true);pumasiTick();const helpH=helpLogHtml();
  if(away>20000&&(ripe||eggs||w==="비"||w==="눈"||helpH)){
    const mins=Math.round(away/60000),ago=mins<1?"잠깐":mins<60?mins+"분":Math.round(mins/60)+"시간";
    let h=`<h2>다녀오셨어요</h2><h3>${ago} 동안 시골에선</h3>`;
    if(ripe)h+=`<div class="item"><div>밭 ${ripe}칸이 다 자랐어요<small>밭에 가서 거둬 보세요</small></div></div>`;
    if(eggs)h+=`<div class="item"><div>닭들이 달걀 ${eggs}개를 낳았어요<small>닭장에서 꺼내 오세요</small></div></div>`;
    if(w==="비"||w==="눈")h+=`<div class="item"><div>오늘은 ${w==="비"?"비가":"눈이"}와요<small>${WX_NOTE[w]}</small></div></div>`;
    openSheet(h+helpH);bindThanks();
  }else toast(away?"다시 오셨네요. "+termNow(new Date())+" 무렵이에요":"시골살이에 오신 걸 환영해요. 텃밭부터 가볼까요? · 궁금한 건 날씨 칸 ▾ → 안내서");
  texYards();scatterAll();setTimeout(trimShadows,1500);
  save();setInterval(save,15000);
  document.addEventListener("visibilitychange",()=>{if(document.hidden)save()});
};
Promise.race([document.fonts?document.fonts.ready:Promise.resolve(),new Promise(r=>setTimeout(r,1500))]).then(start);
requestAnimationFrame(loop);
