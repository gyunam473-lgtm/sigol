/* 이장님네: 마을에서 제일 잘사는 집 (넓은 밭, 외양간, 소·염소, 돌담, 경운기, 진돗개, 고양이, 평상) */

// 이장님네: 다 갖춘 땅 (확장 밭, 외양간, 소·염소, 닭장, 평상, 허수아비)
const ijang=new THREE.Group();ijang.visible=false;land.add(ijang);
(function(){
  const fx=FIELD.x,fz=FIELD.z;
  // 넓어진 밭 (오른쪽 두 줄 더: 배추, 고추)
  [2,3].forEach(col=>[-1,0,1].forEach(row=>{const x=fx+col*2.2,z=fz+row*2.2;
    ijang.add(box(1.8,0.25,1.8,0x5e3d25,x,0.125,z));
    [[-0.45,-0.45],[0.45,-0.45],[-0.45,0.45],[0.45,0.45]].forEach(([dx,dz])=>{
      if(col===2){const b=sph(0.36,0xb9dc8a,x+dx,0.45,z+dz);b.scale.y=0.85;ijang.add(b);ijang.add(sph(0.26,0xe6f2c6,x+dx,0.62,z+dz))}
      else{ijang.add(sph(0.3,0x4f7f3a,x+dx,0.55,z+dz));[[0.15,0],[-0.1,0.12],[0,-0.15]].forEach(([a,b])=>{const c=cone(0.05,0.22,0xd8312a,x+dx+a,0.42,z+dz+b,5);c.rotation.x=Math.PI;ijang.add(c)})}
    })}));
  // 넓은 울타리
  const x0=fx-3.6,x1=fx+3*2.2+1.4;
  for(let x=x0;x<=x1+0.01;x+=1.15){ijang.add(box(0.12,0.8,0.12,0x9a7a52,x,0.4,fz-3.6));if(Math.abs(x-fx)>1.2)ijang.add(box(0.12,0.8,0.12,0x9a7a52,x,0.4,fz+3.6))}
  for(let z=fz-3.6;z<=fz+3.61;z+=1.2){ijang.add(box(0.12,0.8,0.12,0x9a7a52,x0,0.4,z));ijang.add(box(0.12,0.8,0.12,0x9a7a52,x1,0.4,z))}
  ijang.add(box(x1-x0,0.08,0.06,0x9a7a52,(x0+x1)/2,0.6,fz-3.6));
  ijang.add(box(0.06,0.08,7.2,0x9a7a52,x0,0.6,fz));ijang.add(box(0.06,0.08,7.2,0x9a7a52,x1,0.6,fz));
  // 허수아비
  const sx=fx-4.6,sz=fz+2.4;ijang.add(cyl(0.06,0.06,2,0x7a5a3a,sx,1,sz,6));ijang.add(box(1.4,0.08,0.08,0x7a5a3a,sx,1.5,sz));
  ijang.add(box(0.7,0.7,0.3,0x6b8fb8,sx,1.35,sz));ijang.add(sph(0.25,0xe8d6a8,sx,2,sz));ijang.add(cyl(0.45,0.45,0.05,0xe6cc84,sx,2.18,sz,14));ijang.add(cyl(0.2,0.25,0.2,0xe6cc84,sx,2.3,sz,12));
  // 외양간
  const bx=-13.2,bz=5.6; // 집 아래쪽, 집과 거리를 두고
  ijang.add(box(4.2,2,2.6,0x9a6a45,bx,1,bz-0.6));
  const g2=new THREE.CylinderGeometry(2.6,2.6,4.8,3,1);g2.rotateX(-Math.PI/2);g2.rotateY(Math.PI/2);
  const r2=new THREE.Mesh(g2,M(0x6b6255));r2.scale.set(1,0.45,0.75);r2.position.set(bx,2.6,bz-0.6);r2.castShadow=true;ijang.add(r2);
  ijang.add(box(1.6,1.5,0.06,0x3d2a1c,bx,0.75,bz+0.72));
  for(let x=bx-2.2;x<=bx+2.21;x+=0.9)ijang.add(box(0.1,0.9,0.1,0xb59a6c,x,0.45,bz+3.4));
  ijang.add(box(4.4,0.07,0.05,0xb59a6c,bx,0.7,bz+3.4));
  ijang.add(box(1.2,0.3,0.5,0xc9a85a,bx+1.4,0.15,bz+1.4)); // 여물통
  // 소
  const cow=new THREE.Group();
  cow.add(box(1.5,0.8,0.75,0xa8683a,0,1,0)); // 한우
  cow.add(box(0.5,0.48,0.5,0xa8683a,0.95,1.25,0));cow.add(box(0.2,0.2,0.4,0xd8a888,1.22,1.15,0));
  [[-0.12,0.22],[-0.12,-0.22]].forEach(([x,z])=>cow.add(cone(0.05,0.18,0xe8dcc0,0.9,1.55,z,5)));
  [[-0.55,0.25],[0.55,0.25],[-0.55,-0.25],[0.55,-0.25]].forEach(([x,z])=>cow.add(box(0.16,0.6,0.16,0x96592f,x,0.3,z)));
  cow.add(box(0.06,0.5,0.06,0x96592f,-0.78,0.85,0));
  cow.position.set(bx-0.8,0,bz+2.1);cow.rotation.y=0.3;ijang.add(cow);
  // 염소
  const goat=new THREE.Group();
  goat.add(box(0.8,0.45,0.4,0xe9e3d6,0,0.6,0));goat.add(box(0.3,0.32,0.3,0xe9e3d6,0.5,0.85,0));goat.add(cone(0.06,0.2,0x9a8a6a,0.45,1.08,0.08,5));goat.add(cone(0.06,0.2,0x9a8a6a,0.45,1.08,-0.08,5));goat.add(box(0.06,0.14,0.06,0xe9e3d6,0.62,0.62,0));
  [[-0.3,0.14],[0.3,0.14],[-0.3,-0.14],[0.3,-0.14]].forEach(([x,z])=>goat.add(box(0.1,0.4,0.1,0xe9e3d6,x,0.2,z)));
  goat.position.set(bx+1.3,0,bz+2.4);goat.rotation.y=-0.8;ijang.add(goat);
  // 기와 돌담 (잘사는 집의 표시)
  const stones=[0x9d978a,0xb0a99a,0x8e8a7f];
  for(let x=-17;x<=-1.4;x+=1.04){ijang.add(box(1,1.1,0.55,stones[Math.abs(Math.round(x*3))%3],x,0.55,-9.6));ijang.add(box(1.06,0.14,0.75,0x3d4448,x,1.17,-9.6))}
  for(let z=-9.1;z<=3;z+=1.04){ijang.add(box(0.55,1.1,1,stones[Math.abs(Math.round(z*3))%3],-17.3,0.55,z));ijang.add(box(0.75,0.14,1.06,0x3d4448,-17.3,1.17,z))}
  // 장독 더
  [[-2.6,-5.4],[-2.5,-4.6],[-4.6,-3]].forEach(([x,z],i)=>jar(x,z,i+1,ijang));
  // 경운기
  const tl=new THREE.Group();tl.add(box(1.1,0.5,0.7,0x2f6f9f,0,0.75,0));tl.add(box(0.5,0.45,0.5,0x3a3f43,0.4,1.15,0));
  [0.4,-0.4].forEach(z=>{const w=cyl(0.38,0.38,0.18,0x2b2a26,0,0.38,z,14);w.rotation.x=Math.PI/2;tl.add(w)});
  tl.add(box(1.4,0.06,0.06,0x3a3f43,-0.9,1.1,0.3));tl.add(box(1.4,0.06,0.06,0x3a3f43,-0.9,1.1,-0.3));
  tl.add(box(1.6,0.4,1.1,0x6f7a52,-1.9,0.6,0)); // 짐칸
  tl.position.set(1.8,0,-10.6);tl.rotation.y=0.2;ijang.add(tl);
  // 진돗개 (마당을 돌아다녀요)
  dog={g:new THREE.Group(),tx:-4,tz:1,wait:0};const dg=dog.g,dc=0xd9a35a;
  dg.add(box(0.75,0.32,0.32,dc,0,0.5,0));dg.add(box(0.34,0.3,0.3,dc,0.45,0.75,0));dg.add(box(0.16,0.12,0.18,0xf0dcc0,0.66,0.7,0));dg.add(box(0.05,0.05,0.07,0x2b2a26,0.75,0.74,0));
  [0.09,-0.09].forEach(z=>dg.add(cone(0.06,0.14,dc,0.42,0.97,z,4)));
  dog.legs=[[-0.27,0.1],[0.27,0.1],[-0.27,-0.1],[0.27,-0.1]].map(([x,z])=>{const l=box(0.09,0.34,0.09,dc,x,0.17,z);dg.add(l);return l});
  dog.tail=new THREE.Group();dog.tail.add(sph(0.1,dc,0,0.12,0));dog.tail.position.set(-0.4,0.62,0);dg.add(dog.tail);
  dg.position.set(-4,0,1);ijang.add(dg);
  // 지붕 위에서 자는 고양이
  cat={g:new THREE.Group()};const cg=cat.g,cc=0xe6a64e;
  cg.add(box(0.62,0.2,0.32,cc,0,0.12,0));cg.add(sph(0.15,cc,0.36,0.17,0.02));
  [0.07,-0.07].forEach(z=>cg.add(cone(0.04,0.1,cc,0.38,0.32,z+0.02,4)));
  cat.tail=new THREE.Group();cat.tail.add(box(0.42,0.06,0.06,cc,-0.21,0,0));cat.tail.position.set(-0.3,0.08,0.1);cg.add(cat.tail);
  [0.15,-0.05].forEach(x=>cg.add(box(0.05,0.21,0.33,0xc9873a,x,0.12,0)));
  cg.rotation.x=0.71;ijang.add(cg);
  // 평상: 이웃집에선 공통 평상(table.js, 같이 앉아 먹기)을 써서 여기 큰 평상은 그리지 않아요
  const ijPy=new THREE.Group();
  // 평상과 곶감
  const px=-4.6,pz=-0.9,PW=4.2,PD=2.6; // 넓은 평상
  ijPy.add(box(PW,0.16,PD,0xc29a62,px,0.55,pz));
  for(let i=0;i<7;i++)ijPy.add(box(0.03,0.02,PD-0.1,0xa8824e,px-PW/2+0.3+i*0.6,0.64,pz));
  [[-1,-1],[1,-1],[-1,1],[1,1],[0,-1],[0,1]].forEach(([a,b])=>ijPy.add(box(0.14,0.5,0.14,0x8a6440,px+a*(PW/2-0.15),0.25,pz+b*(PD/2-0.15))));
  [[-0.9,0],[1.1,0.1]].forEach(([dx,dz],k)=>{ijPy.add(cyl(0.45,0.45,0.22,0x7a4a2a,px+dx,0.76,pz+dz,16));
    if(k===0){ijPy.add(sph(0.12,0xe8862e,px+dx-0.15,0.93,pz+dz));ijPy.add(sph(0.12,0xe8862e,px+dx+0.15,0.93,pz+dz+0.05))}
    else{ijPy.add(cyl(0.09,0.11,0.3,0xf2eee6,px+dx-0.12,1.02,pz+dz));ijPy.add(cyl(0.1,0.08,0.06,0xf2eee6,px+dx+0.15,0.9,pz+dz+0.1))}});
  [[-1.9,0.75],[-0.2,0.85],[1.9,0.8],[0.3,-0.85]].forEach(([dx,dz])=>ijPy.add(box(0.55,0.05,0.55,0x5a7a9a,px+dx,0.66,pz+dz)));
})();
