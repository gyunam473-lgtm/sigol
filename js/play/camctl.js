/* 앉거나 누웠을 때 카메라를 내 마음대로: 화면을 끌면 빙 돌려 보고, 두 손가락(또는 마우스 휠)으로 크게·작게.
   오른쪽 위 ＋ － 단추와 "처음 시점" 단추도 있어요. 일어나면 원래대로 돌아가요. */

let ORB=null; // {look, th(옆으로 돈 각도), ph(위아래 각도), r(거리), r0, th0, ph0}
const ORB_LIM={phMin:0.18,phMax:1.42,rMin:0.4,rMax:1.8};
// 기본 카메라 자리에서 시작해요
// block: 카메라와 상 사이를 가리면 카메라가 그 앞으로 다가와요 (집 지붕, 정자, 방 벽 …)
// yaw: 옆으로 돌 수 있는 범위 [왼쪽, 오른쪽] (없으면 한 바퀴 다)
function orbitStart(cam,look,block,yaw){
  const v=cam.clone().sub(look),r=v.length();
  ORB={look:look.clone(),r,r0:r,th:Math.atan2(v.x,v.z),ph:Math.acos(Math.max(-1,Math.min(1,v.y/r)))};ORB.th0=ORB.th;ORB.ph0=ORB.ph;ORB.block=block||[];ORB.yaw=yaw||null;
  ORB.boxes=ORB.block.filter(b=>b.visible).map(b=>new THREE.Box3().setFromObject(b).expandByScalar(0.6)); // 지붕 끝이 옆에서 가리는 것까지 막으려고 겉 상자도 봐요
  $("camctl").hidden=false;
  if(!S.camTip){S.camTip=1;save();setTimeout(()=>toast("화면을 끌면 빙 돌려 보고, 두 손가락이나 ＋ －로 크게·작게 볼 수 있어요"),900)}
}
function orbitStop(){ORB=null;$("camctl").hidden=true}
const orbRay=new THREE.Raycaster(),orbO=new THREE.Vector3(),orbD=new THREE.Vector3();
function orbitCam(){const o=ORB,s=Math.sin(o.ph);
  const c=new THREE.Vector3(o.look.x+o.r*s*Math.sin(o.th),o.look.y+o.r*Math.cos(o.ph),o.look.z+o.r*s*Math.cos(o.th));
  if(o.block.length){orbO.set(o.look.x,Math.max(o.look.y,1.0),o.look.z);orbD.copy(c).sub(orbO);const dist=orbD.length();orbD.normalize();
    orbRay.set(orbO,orbD);orbRay.far=dist;orbRay.camera=camera;const h=orbRay.intersectObjects(o.block.filter(b=>b.visible),true).find(x=>x.object.visible&&!x.object.isSprite&&x.distance>1.2); /* 바로 옆(상 위 음식 등)은 가리는 게 아니에요 */
    let d=h?h.distance-0.3:dist;
    o.boxes.forEach(b=>{if(b.containsPoint(orbO)||!b.containsPoint(c))return;const p=orbRay.ray.intersectBox(b,new THREE.Vector3());if(p)d=Math.min(d,p.distanceTo(orbO)-0.2)});
    if(d<dist)c.copy(orbO).addScaledVector(orbD,Math.max(0.6,d))}
  return [c,o.look]}
function orbitZoom(f){if(!ORB)return;ORB.r=Math.max(ORB.r0*ORB_LIM.rMin,Math.min(ORB.r0*ORB_LIM.rMax,ORB.r*f));unFocus()}
function orbitReset(){if(!ORB)return;ORB.r=ORB.r0;ORB.th=ORB.th0;ORB.ph=ORB.ph0;unFocus();sfx("pop")}
// 음식 가까이 보기 중이었으면 풀어요 (돌리면 내 마음대로 보는 거니까)
function unFocus(){if(SIT&&SIT.focus){SIT.focus=null;renderSit()}}

// 손가락·마우스로 돌리기와 크게·작게
const ptrs=new Map();let orbDrag=null,pinch0=0,orbMoved=false;
canvas.addEventListener("pointerdown",e=>{if(!ORB||(SIT&&SIT.sky))return;ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});orbMoved=false;
  if(ptrs.size===1)orbDrag={x:e.clientX,y:e.clientY};
  if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinch0=Math.hypot(a.x-b.x,a.y-b.y)}});
canvas.addEventListener("pointermove",e=>{if(!ORB||!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ptrs.size===2){const [a,b]=[...ptrs.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch0>0){orbitZoom(pinch0/d);pinch0=d;orbMoved=true}return}
  if(!orbDrag)return;const dx=e.clientX-orbDrag.x,dy=e.clientY-orbDrag.y;
  if(!orbMoved&&Math.hypot(dx,dy)<6)return;
  if(!orbMoved){orbMoved=true;unFocus()}
  ORB.th-=dx*0.009;if(ORB.yaw)ORB.th=Math.max(ORB.th0+ORB.yaw[0],Math.min(ORB.th0+ORB.yaw[1],ORB.th));ORB.ph=Math.max(ORB_LIM.phMin,Math.min(ORB_LIM.phMax,ORB.ph-dy*0.006));orbDrag={x:e.clientX,y:e.clientY}});
const orbUp=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch0=0;if(!ptrs.size)orbDrag=null};
canvas.addEventListener("pointerup",orbUp);canvas.addEventListener("pointercancel",orbUp);
canvas.addEventListener("wheel",e=>{if(!ORB)return;e.preventDefault();orbitZoom(e.deltaY>0?1.1:0.9)},{passive:false});
// 끌어서 돌린 뒤 손을 뗄 때 "누르기"로 잘못 읽지 않게
canvas.addEventListener("click",e=>{if(orbMoved){orbMoved=false;e.stopImmediatePropagation()}},true);
$("camIn").onclick=()=>{orbitZoom(0.8);sfx("pop")};
$("camOut").onclick=()=>{orbitZoom(1.25);sfx("pop")};
$("camReset").onclick=orbitReset;
