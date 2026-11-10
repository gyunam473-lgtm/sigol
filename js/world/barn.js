/* 우리 외양간과 가축 (집 아래쪽, 닭장 왼쪽). 살림 장부에서 짓고, 송아지·새끼 염소는 장날 우시장에서 사 와요.
   외양간을 누르면 여물을 줘요: 어린 가축은 여물을 먹으며 자라요 (data.js 의 ANIMALS, FEED_SEC) */

// 소 (한우). s: 크기 (송아지는 작게)
function cowMesh(s=1){const g=new THREE.Group(),c=0xa8683a,d=0x96592f;
  g.add(box(1.5,0.8,0.75,c,0,1,0));g.add(box(0.5,0.48,0.5,c,0.95,1.25,0));g.add(box(0.2,0.2,0.4,0xd8a888,1.22,1.15,0));
  [0.22,-0.22].forEach(z=>g.add(cone(0.05,0.18,0xe8dcc0,0.9,1.55,z,5)));
  [[-0.55,0.25],[0.55,0.25],[-0.55,-0.25],[0.55,-0.25]].forEach(([x,z])=>g.add(box(0.16,0.6,0.16,d,x,0.3,z)));
  g.add(box(0.06,0.5,0.06,d,-0.78,0.85,0));g.scale.setScalar(s);return g}
// 염소. 흑염소는 까맣게
function goatMesh(s=1,c=0x2e2b28){const g=new THREE.Group();
  g.add(box(0.8,0.45,0.4,c,0,0.6,0));g.add(box(0.3,0.32,0.3,c,0.5,0.85,0));g.add(cone(0.06,0.2,0x9a8a6a,0.45,1.08,0.08,5));g.add(cone(0.06,0.2,0x9a8a6a,0.45,1.08,-0.08,5));g.add(box(0.06,0.14,0.06,c,0.62,0.62,0));
  [[-0.3,0.14],[0.3,0.14],[-0.3,-0.14],[0.3,-0.14]].forEach(([x,z])=>g.add(box(0.1,0.4,0.1,c,x,0.2,z)));g.scale.setScalar(s);return g}

const BARN={x:-13.2,z:5.6};
const myBarn=new THREE.Group();myBarn.userData.kind="barn";myBarn.visible=false;land.add(myBarn);
const herdG=new THREE.Group();myBarn.add(herdG);
(function(){const bx=BARN.x,bz=BARN.z;
  myBarn.add(box(4.2,2,2.6,0x9a6a45,bx,1,bz-0.6));
  const g2=new THREE.CylinderGeometry(2.6,2.6,4.8,3,1);g2.rotateX(-Math.PI/2);g2.rotateY(Math.PI/2);
  const r2=new THREE.Mesh(g2,M(0x5b5348));r2.scale.set(1,0.45,0.75);r2.position.set(bx,2.6,bz-0.6);r2.castShadow=true;myBarn.add(r2);
  myBarn.add(box(1.6,1.5,0.06,0x3d2a1c,bx,0.75,bz+0.72));
  for(let x=bx-2.2;x<=bx+2.21;x+=0.9){myBarn.add(box(0.1,0.9,0.1,0xb59a6c,x,0.45,bz+3.4))}
  [bx-2.2,bx+2.2].forEach(x=>{for(let z=bz+0.7;z<=bz+3.4;z+=0.9)myBarn.add(box(0.1,0.9,0.1,0xb59a6c,x,0.45,z))});
  myBarn.add(box(4.4,0.07,0.05,0xb59a6c,bx,0.7,bz+3.4));[bx-2.2,bx+2.2].forEach(x=>myBarn.add(box(0.05,0.07,2.7,0xb59a6c,x,0.7,bz+2.05)));
  myBarn.add(box(1.2,0.3,0.5,0xc9a85a,bx+1.4,0.15,bz+1.2)); // 여물통
  const straw=new THREE.Group();for(let i=0;i<3;i++)straw.add(cyl(0.35,0.35,0.6,0xd9c27a,bx-2.9,0.35,bz-1.2+i*0.75,10).rotateZ(Math.PI/2));myBarn.add(straw); // 볏짚단
})();
// 가축 수에 맞게 마당에 세워요 (소는 왼쪽, 염소는 오른쪽)
const COW_SPOTS=[[-1.2,1.6],[-0.6,2.8],[-1.6,2.6],[0,1.8]],GOAT_SPOTS=[[1.2,2.4],[1.7,1.6],[0.9,3.0],[1.8,2.9]];
let herdKey="";
function drawHerd(){
  const key=S.herd.map(a=>a.k).join(",");if(key===herdKey)return;herdKey=key;
  while(herdG.children.length)herdG.remove(herdG.children[0]);
  let ci=0,gi=0;
  S.herd.forEach(a=>{const A=ANIMALS[a.k];let m,s;
    if(A.kind==="cow"){s=COW_SPOTS[ci++%4];m=cowMesh(a.k==="calf"?0.6:0.85)}else{s=GOAT_SPOTS[gi++%4];m=goatMesh(a.k==="kid"?0.65:0.95)}
    m.position.set(BARN.x+s[0],0,BARN.z+s[1]);m.rotation.y=Math.sin(ci*3+gi*7)*1.2;herdG.add(m)})}
const herdCount=kind=>S.herd.filter(a=>ANIMALS[a.k].kind===kind).length;
