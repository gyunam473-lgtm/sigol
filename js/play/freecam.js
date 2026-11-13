/* 걸어 다닐 때도 카메라를 내 마음대로 (2026-11-13)
   화면을 끌면 내 캐릭터를 중심으로 빙 돌고(좌우), 위아래로 끌면 높이·기울기, 두 손가락이나 마우스 휠로 크게·작게.
   한 번 움직이면 오른쪽 위에 ＋ － "처음 시점" 단추가 나와요. 다른 장소로 가면 방향은 처음으로 돌아가요(크기는 그대로).
   짧게 누르면 지금처럼 그쪽으로 걸어가요 (끌기와 구별해요) */
const FC={yaw:0,tilt:1,zoom:1,changed:false,mode:null};
const FC_LIM={tilt:[0.35,1.35],zoom:[0.45,1.5]};
const fcOn=()=>me&&!SIT&&!W&&!PD&&!CK&&!FS&&!SKYV&&!LIE&&!inHouse&&mode!=="dabang"&&!ORB;
// main.js 가 걸어 다닐 때 부르는 카메라 자리
function freeCam(p,camPos,lookT){if(FC.mode!==mode){FC.mode=mode;FC.yaw=0;fcChanged()}
  const z=FC.zoom,h=10*z*FC.tilt,d=11*z*(1.25-0.25*FC.tilt),s=Math.sin(FC.yaw),c=Math.cos(FC.yaw);
  camPos.set(p.x+s*d,p.y+h,p.z+c*d);lookT.set(p.x-s*1,1,p.z-c*1)}
function fcChanged(){FC.changed=Math.abs(FC.yaw)>0.02||Math.abs(FC.tilt-1)>0.02||Math.abs(FC.zoom-1)>0.02;$("fcctl").hidden=!(FC.changed&&fcOn())}
function fcZoom(f){FC.zoom=Math.max(FC_LIM.zoom[0],Math.min(FC_LIM.zoom[1],FC.zoom*f));fcChanged()}
function fcReset(){FC.yaw=0;FC.tilt=1;FC.zoom=1;fcChanged();sfx("pop")}
const fcPtrs=new Map();let fcDrag=null,fcPinch=0,fcMoved=false;
canvas.addEventListener("pointerdown",e=>{if(!fcOn())return;fcPtrs.set(e.pointerId,{x:e.clientX,y:e.clientY});fcMoved=false;
  if(fcPtrs.size===1)fcDrag={x:e.clientX,y:e.clientY};
  if(fcPtrs.size===2){const [a,b]=[...fcPtrs.values()];fcPinch=Math.hypot(a.x-b.x,a.y-b.y)}});
canvas.addEventListener("pointermove",e=>{if(!fcOn()||!fcPtrs.has(e.pointerId))return;fcPtrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(fcPtrs.size===2){const [a,b]=[...fcPtrs.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(fcPinch>0){fcZoom(fcPinch/d);fcPinch=d;fcMoved=true}return}
  if(!fcDrag)return;const dx=e.clientX-fcDrag.x,dy=e.clientY-fcDrag.y;
  if(!fcMoved&&Math.hypot(dx,dy)<10)return;
  if(!fcMoved){fcMoved=true;if(!S.freeCamTip){S.freeCamTip=1;save();toast("화면을 끌면 둘러보고, 두 손가락으로 크게·작게 · 오른쪽 위 \"처음 시점\"으로 되돌려요")}}
  FC.yaw-=dx*0.008;FC.tilt=Math.max(FC_LIM.tilt[0],Math.min(FC_LIM.tilt[1],FC.tilt-dy*0.004));fcDrag={x:e.clientX,y:e.clientY};fcChanged()});
const fcUp=e=>{fcPtrs.delete(e.pointerId);if(fcPtrs.size<2)fcPinch=0;if(!fcPtrs.size)fcDrag=null};
canvas.addEventListener("pointerup",fcUp);canvas.addEventListener("pointercancel",fcUp);
canvas.addEventListener("wheel",e=>{if(!fcOn())return;e.preventDefault();fcZoom(e.deltaY>0?1.1:0.9)},{passive:false});
// 끌어서 둘러본 뒤 손을 뗄 때 "걸어가기"로 읽지 않게
canvas.addEventListener("click",e=>{if(fcMoved){fcMoved=false;e.stopImmediatePropagation()}},true);
// 오른쪽 위(날씨 칸 아래) 단추: 움직였을 때만 보여요
$("fcIn").onclick=()=>{fcZoom(0.8);sfx("pop")};$("fcOut").onclick=()=>{fcZoom(1.25);sfx("pop")};$("fcReset").onclick=fcReset;
setInterval(fcChanged,400);
