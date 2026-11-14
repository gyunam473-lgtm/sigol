/* 집 안 드나들기와 눕기 (방 모양은 world/room.js)
   - 집을 누르면 마루 앞까지 걸어가서 방으로 들어가요. 오른쪽 벽 문을 누르면 나와요.
   - 이불을 누르면 요에 누워요: 이불을 덮고, 한숨 자거나 불을 끌 수 있어요.
   - 책상 위 "살림 장부"를 누르면 요리 목록과 살림 늘리기 창이 열려요. */

let lieHair=null;
// 화면을 잠깐 어둡게 했다가 밝게 (문 여닫는 느낌)
function fadeDo(fn,ms=260,hold=60){const f=$("fade");f.classList.add("on");setTimeout(()=>{fn();setTimeout(()=>f.classList.remove("on"),hold)},ms)}
const roomPt=(x,z)=>[ROOM.x+x,ROOM.z+z];
const doorStand=()=>roomPt(roomDoor.position.x,ROOM.D/2+0.75); // 댓돌 위 마루 끝
const yoStand=()=>roomPt(roomYo.position.x+1.5,0.75);
const deskStand=()=>roomPt(roomDesk.position.x,roomDesk.position.z+0.95);
const SARANG_FRONT={x:-14,z:1.45}; // 사랑채 앞

function enterHouse(which){
  sfx("pop");
  fadeDo(()=>{
    HOUSE_IN=which||"main";inHouse=true;RC.pan=0;buildRoom();room.visible=true;
    npcs.forEach(n=>n.g.visible=false);rainG.visible=snowG.visible=false;
    const [x,z]=doorStand();me.g.position.set(x,0,z);me.tx=x;me.tz=z;me.route=[];me.moving=false;pending=null;me.g.rotation.y=-Math.PI/2;
    OBS=obstacles();roomLighting();roomCam(true);refresh();
    toast(HOUSE_IN==="sarang"?"사랑채에 들어왔어요. 손님 맞고 책 읽는 방이에요":skyNow.night>0.5?"집에 들어왔어요. 등잔불이 따뜻해요":"집에 들어왔어요. 툇마루를 따라 부엌, 안방"+((S.houseLv||1)>=2?", 대청, 건넌방":"")+"으로 다녀요"+(ROOM.W>8?" · 화면을 옆으로 끌면 다른 칸을 둘러봐요":""));
  })}
// 바로 나가기 (이웃·장터로 갈 때는 화면 효과 없이)
function exitRoom(){if(!inHouse)return;if(LIE)getUp(true);inHouse=false;room.visible=false;applyTime()}
function leaveHouse(after){
  sfx("pop");
  fadeDo(()=>{
    exitRoom();npcs.forEach(n=>n.g.visible=false); // 우리 땅엔 나 혼자
    const out=HOUSE_IN==="sarang"?SARANG_FRONT:{x:HF.x,z:HF.z+0.4};me.g.position.set(out.x,0,out.z);me.tx=out.x;me.tz=out.z;me.route=[];me.moving=false;pending=null;me.g.rotation.y=0;
    OBS=obstacles();const p=me.g.position;camera.position.set(p.x,p.y+10,p.z+11);refresh();
    if(after)after();else toast("마당으로 나왔어요");
  })}
// 방 안 카메라: 앞쪽 위에서 들여다봐요 (앞벽은 없는 것처럼)
// 2026-11-14 폰 세로에서 방이 잘리고 캐릭터가 크게 가려서: 화면 너비에 맞춰 칸 하나 반쯤(작은 집은 집 전체)이 보이게 거리를 재고,
// 칸이 여럿이면 내가 있는 쪽을 따라가요. 화면을 좌우로 끌면 옆 칸을 둘러봐요(RC.pan, freecam.js), 걸으면 다시 나를 따라와요
const RC={pan:0};
function roomCam(snap){
  const p=me.g.position,half=ROOM.W/2,a=camera.aspect||1,vf=camera.fov*Math.PI/180,hf=2*Math.atan(Math.tan(vf/2)*a);
  const span=Math.min(ROOM.W+0.6,a<1?7.6:11),sh=span/2;
  if(me.moving)RC.pan*=0.9;
  const lim=Math.max(0,half+0.3-sh);RC.pan=Math.max(-lim*2,Math.min(lim*2,RC.pan));
  const cx=ROOM.x+Math.max(-lim,Math.min(lim,p.x-ROOM.x+RC.pan));
  // 보고 싶은 너비가 화면 좌우에 들어오는 거리 (높이는 그만큼 같이)
  const d=Math.max(9.5,sh/Math.tan(hf/2)+1.2),dy=0.62*d,dz=0.78*d;
  lookT.set(cx,0.4,ROOM.z-0.2);camPos.set(cx,lookT.y+dy,lookT.z+dz);
  if(snap){camera.position.copy(camPos);look.copy(lookT);camera.lookAt(look)}}

/* ---------- 눕기 ---------- */
function lieDown(){
  if(LIE)return;LIE={off:false};
  const f=roomYo.userData.feet;me.g.position.set(ROOM.x+f.x-0.15,0,ROOM.z+f.z);me.g.rotation.y=Math.PI/2; // 머리는 베개 쪽
  me.b.rotation.x=-Math.PI/2;me.b.scale.z=0.45;me.b.position.y=0.28;me.label.visible=false;
  me.b.children.slice(3).forEach(c=>{if(c!==holdMesh){c.userData.wasVis=c.visible;c.visible=false}}); // 밀짚모자는 벗어요
  if(!lieHair)lieHair=sph(0.31,0x3a332c,0,1.68,-0.04);me.b.add(lieHair);
  if(holdMesh)holdMesh.visible=false;
  blanketOpen.visible=true;blanketFold.visible=false;roomYo.userData.label.visible=false;
  document.querySelector(".top").hidden=true;document.querySelector(".bottom").hidden=true;$("sit").hidden=false;
  orbitStart(...lieBase(),[room],[-1.0,1.0]);sfx("pop");renderLie();
}
function getUp(quiet){
  if(!LIE)return;LIE=null;orbitStop();
  me.b.rotation.x=0;me.b.scale.z=1;me.b.position.y=0;me.label.visible=true;if(lieHair)me.b.remove(lieHair);
  me.b.children.slice(3).forEach(c=>{if(c.userData.wasVis!==undefined){c.visible=c.userData.wasVis;delete c.userData.wasVis}});
  if(holdMesh)holdMesh.visible=true;
  blanketOpen.visible=false;blanketFold.visible=true;roomYo.userData.label.visible=true;roomLighting(false);
  const [x,z]=yoStand();me.g.position.set(x,0,z);me.tx=x;me.tz=z;me.g.rotation.y=-Math.PI/2;
  $("sit").hidden=true;document.querySelector(".top").hidden=false;document.querySelector(".bottom").hidden=false;
  if(!quiet){refresh();toast("기지개를 쭉 켜요")}
}
function lieNote(){
  const w=weather.kind,h=hourNow(),n=skyNow.night,worked=S.lastWork&&Date.now()-S.lastWork<WORK_RECENT_MIN*60000;
  if(LIE.off)return "불을 끄니 창호지 너머로 "+(n>0.5?"달빛이 은은하게 비쳐요.":"바깥 빛만 은은해요.");
  if(ondolWarm())return "아궁이에 불을 땐 구들이 뜨끈뜨끈. 등이 사르르 녹아요.";
  if(w==="비")return "창호지 너머로 빗소리가 토닥토닥. 이런 날은 누워 있는 게 최고예요.";
  if(w==="눈")return "바깥이 소복소복 조용해요. 이불 속이 따뜻해요.";
  if(worked)return "일하고 누우니 등이 노곤노곤해요. 수고했어요.";
  if(n>0.5)return "등잔불이 일렁여요. 오늘 하루도 고생 많았어요.";
  if(h<skyNow.rise+2)return "창호지로 아침 햇살이 스며들어요.";
  return "뜨끈한 장판에 등을 지지니 스르르 눈이 감겨요.";
}
function renderLie(){
  $("sitPanel").innerHTML=`<div class="sithead"><h2>누워서 쉬는 중</h2><small>${weather.kind} · ${timeLabel(hourNow())}</small></div><p class="hint">${lieNote()}</p>
    <div class="sitbtns"><button id="napBtn">한숨 자기</button><button id="lampBtn">${LIE.off?"불 켜기":"불 끄기"}</button><button class="close go" id="upBtn">일어나기</button></div>`;
  $("upBtn").onclick=()=>getUp();
  $("lampBtn").onclick=()=>{LIE.off=!LIE.off;roomLighting(LIE.off);sfx("pop");renderLie()};
  $("napBtn").onclick=()=>{sfx("pop");fadeDo(()=>{renderLie();toast("한숨 푹 잤어요. 개운해요")},700,900)};
}
// 누워 있을 때 카메라: 이불 옆 위에서 내려다봐요
function lieBase(){const y=roomYo.position;return [new THREE.Vector3(ROOM.x+y.x+1.7,3.3,ROOM.z+y.z+2.7),new THREE.Vector3(ROOM.x+y.x-0.25,0.25,ROOM.z+y.z)]}
function lieCam(){const [c,l]=ORB?orbitCam():lieBase();camPos.copy(c);lookT.copy(l)}

/* ---------- 부엌 아궁이와 가구 ---------- */
function lightAgungi(){if(!useWood(ondolNeed(),"아궁이"))return;S.ondolAt=Date.now();save();refresh();sfx("crackle");setTimeout(()=>sfx("crackle"),300);roomLighting();
  toast("아궁이에 장작 "+ondolNeed()+"개를 넣고 불을 지폈어요. 안방 구들이 뜨끈해져요 · 남은 장작 "+S.inv.jangjak+"개")}
function useFurn(id){const F=FURN[id];sfx("pop");
  if(id==="mulddok"){const b=waterNow();S.water=100;save();refresh();sfx("water");toast(b>=90?"물독 물이 시원해요":"바가지로 물독 물을 떠 마셨어요. 꿀꺽꿀꺽!");return}
  if(id==="chanjang"){openInv();return}
  if(id==="clock"){const h=hourNow(),n=Math.floor(h)%12||12;if(soundOn)for(let i=0;i<Math.min(n,6);i++)tone(660,650,0.6,"sine",0.06,i*0.7);toast("댕, 댕… "+timeLabel(h)+" "+n+"시예요");return}
  if(id==="radio"){const sw=typeof stormWarn==="function"&&stormWarn(),d=new Date();
    toast("지지직… \"오늘 우리 지역은 "+weather.kind+"입니다. "+(sw?whenText(sw.at)+" "+WX_EV[sw.kind].name+" 예보가 있으니 대비하시기 바랍니다. ":"")+(jangToday()?"오늘은 장날입니다.":"다음 장날은 "+fmtDay(nextJangnal(d))+"입니다.")+"\"");return}
  toast(typeof F.use==="string"?F.use:F.name+" · "+F.desc)}
