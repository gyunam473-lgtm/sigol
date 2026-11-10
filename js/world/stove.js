/* 집 옆 부뚜막: 처마 밑 흙 부뚜막, 가마솥과 솥뚜껑, 아궁이, 도마, 굴뚝.
   요리할 때 카메라가 가까이 와요 (play/cook.js). 내 땅에서만 보여요. */

const STOVE={x:-3.0,z:-7.3,stand:[-0.9,-7.2]}; // 장독대 뒤쪽. 오른쪽(길 쪽)에서 다가가요
const stove=new THREE.Group();stove.userData.kind="stove";
stove.add(box(2.0,0.75,1.1,0xb8a68a,0,0.375,0)); // 흙 부뚜막
stove.add(box(2.1,0.05,1.2,0x9c8a6e,0,0.77,0));
stove.add(box(0.5,0.34,0.06,0x2a1d14,-0.45,0.22,0.55)); // 아궁이
const stoveFireMat=new THREE.MeshBasicMaterial({color:0xff8a2a,transparent:true,opacity:0});
const stoveFire=new THREE.Mesh(new THREE.BoxGeometry(0.42,0.26,0.02),stoveFireMat);stoveFire.position.set(-0.45,0.21,0.59);stove.add(stoveFire); // 아궁이 안 불빛
const stoveLogs=new THREE.Group();[0,1].forEach(k=>{const l=cyl(0.04,0.04,0.3,0x7a5a3a,-0.45+(k-0.5)*0.13,0.11,0.66,6);l.rotation.x=Math.PI/2;stoveLogs.add(l)});stoveLogs.visible=false;stove.add(stoveLogs);
stove.add(cyl(0.44,0.32,0.28,0x2d2b29,-0.45,0.78,0,20)); // 가마솥
const stoveLid=new THREE.Group();stoveLid.add(cyl(0.47,0.47,0.05,0x3a3735,0,0,0,24));stoveLid.add(cyl(0.06,0.08,0.08,0x3a3735,0,0.06,0,10));
stoveLid.position.set(-0.45,0.95,0);stove.add(stoveLid); // 솥뚜껑 (감자전은 뒤집어서 부쳐요)
stove.add(box(0.72,0.05,0.46,0xc9a36a,0.5,0.825,0)); // 도마
stove.add(cyl(0.11,0.13,2.4,0x8a7a64,-0.85,1.2,-0.45,10)); // 굴뚝
[[-1.3,-0.95],[1.3,-0.95],[-1.3,0.75],[1.3,0.75]].forEach(([a,b])=>stove.add(cyl(0.06,0.06,2.3,0x6b4a2e,a,1.15,b,6))); // 처마 기둥
const stoveRoof=box(3.0,0.1,2.2,0x4b5156,0,2.35,-0.1);stoveRoof.rotation.x=0.12;stoveRoof.castShadow=false;stove.add(stoveRoof); // 지붕 그림자가 음식을 덮지 않게
stove.position.set(STOVE.x,0,STOVE.z);land.add(stove);
const stoveLocal=(x,y,z)=>new THREE.Vector3(STOVE.x+x,y,STOVE.z+z); // 부뚜막 기준 위치 → 마을 위치
