/* 새 작물 모습 (2026-11-14, 작물 5 → 28가지). 다 자란 한 포기(ripeAt)와 땅속에서 캐낸 것(tuberAt).
   myland.js 의 ripeAt·tuberAt 을 감싸서 새 작물만 여기서 그려요. 거두기 작업 화면도 같이 써요.
   주의: sph/cyl/cone/box 는 도형을 같이 써요(scene.js 의 GEO) → 도형을 직접 translate 하지 말고 위치·회전·크기만 바꿔요 */
{
const leaf=(c,x,y,z,r,col,sy=0.35,ry=0)=>{const l=sph(r,col,x,y,z);l.scale.set(1.3,sy,0.8);l.rotation.y=ry;c.add(l);return l};
const stalk=(c,x,z,h,col=0x6f9a4a,r=0.025)=>c.add(cyl(r,r*1.2,h,col,x,h/2,z,5));
const bush=(c,x,z,r,col,y)=>{const b=sph(r,col,x,y==null?r*0.9:y,z);c.add(b);return b};
const LOOK={
  gochu:(c,x,z)=>{stalk(c,x,z,0.6,0x5f7f3a);bush(c,x,z,0.24,0x4f8a3a,0.55);[[0.14,0.42,0],[-0.12,0.5,1],[0.05,0.34,2],[-0.05,0.62,3]].forEach(([dx,y,k])=>{const p=cone(0.045,0.24,k%2?0xd8301e:0xc4281a,x+dx*1.4,y,z+0.25,6);p.rotation.x=Math.PI;p.rotation.z=(k-1.5)*0.2;c.add(p)})},
  oi:(c,x,z)=>{c.add(cyl(0.015,0.015,1.0,0x9a7a52,x,0.5,z-0.1,4));bush(c,x,z-0.05,0.22,0x5a9a40,0.55);leaf(c,x+0.15,0.3,z,0.14,0x6aaa4a,0.3);[[0.1,0.45],[-0.1,0.3]].forEach(([dx,y])=>{const o=cyl(0.045,0.04,0.3,0x4f8a30,x+dx*1.6,y,z+0.24,6);o.rotation.z=0.15;c.add(o)})},
  gaji:(c,x,z)=>{stalk(c,x,z,0.5,0x5a4a6a);bush(c,x,z,0.24,0x4f7f3a,0.5);[[0.12,0.3],[-0.1,0.36]].forEach(([dx,y])=>{const g=sph(0.07,0x4a2a5a,x+dx,y,z+0.13);g.scale.set(0.9,1.9,0.9);c.add(g);c.add(cone(0.04,0.05,0x3f6a2a,x+dx,y+0.15,z+0.13,5))})},
  hobak:(c,x,z)=>{for(let k=0;k<4;k++){const a=k*1.57+0.3;leaf(c,x+Math.cos(a)*0.22,0.16,z+Math.sin(a)*0.22,0.18,0x4f8a3a,0.25,a)}const h=sph(0.15,0x8ab84a,x+0.05,0.12,z+0.1);h.scale.set(1.5,0.8,0.8);c.add(h);c.add(sph(0.05,0xf2c440,x-0.15,0.25,z-0.05))},
  oksusu:(c,x,z)=>{stalk(c,x,z,1.5,0x7aa04a,0.035);[0.35,0.7,1.05].forEach((y,k)=>{const l=cone(0.04,0.6,0x6a9a40,x,y,z,4);l.rotation.z=(k%2?1:-1)*1.0;c.add(l)});const cob=cyl(0.06,0.05,0.28,0xb8c46a,x+0.07,0.8,z+0.04,6);cob.rotation.z=-0.35;c.add(cob);c.add(cone(0.03,0.12,0x8a5a3a,x+0.12,0.96,z+0.04,4));c.add(cone(0.03,0.25,0xd8b860,x,1.6,z,4))},
  kong:(c,x,z)=>{bush(c,x,z,0.26,0x6a9a3a);[[0.15,0.25],[-0.14,0.2],[0.02,0.38]].forEach(([dx,y])=>{const p=sph(0.05,0xc8c070,x+dx*1.3,y,z+0.27);p.scale.set(2.2,0.8,0.8);c.add(p)})},
  yeolmu:(c,x,z)=>{for(let k=0;k<5;k++){const a=k*1.26,l=sph(0.11,0x5aa040,x+Math.cos(a)*0.1,0.22,z+Math.sin(a)*0.1);l.scale.set(0.6,1.6,0.35);l.rotation.y=a;l.rotation.z=0.3;c.add(l)}c.add(sph(0.05,0xf2f0e0,x,0.04,z))},
  kkaennip:(c,x,z)=>{stalk(c,x,z,0.6,0x4a7a32);[0.25,0.4,0.55].forEach((y,k)=>[0,Math.PI].forEach(a=>leaf(c,x+Math.cos(a+k)*0.13,y,z+Math.sin(a+k)*0.13,0.11,0x3f7a30,0.2,a+k)))},
  ssukgat:(c,x,z)=>{for(let k=0;k<6;k++){const a=k*1.05;const l=cone(0.07,0.32,0x6aa84a,x+Math.cos(a)*0.08,0.16,z+Math.sin(a)*0.08,5);l.rotation.z=Math.cos(a)*0.35;l.rotation.x=Math.sin(a)*0.35;c.add(l)}c.add(sph(0.04,0xf4d850,x,0.36,z))},
  chamoe:(c,x,z)=>{for(let k=0;k<3;k++)leaf(c,x+(k-1)*0.2,0.08,z-0.1,0.16,0x5a8a3a,0.22,k);const m=sph(0.12,0xf2c62a,x+0.05,0.1,z+0.12);m.scale.set(1.35,0.95,0.95);c.add(m);[-0.05,0.05].forEach(d=>{const s=box(0.012,0.2,0.012,0xf8eecc,x+0.05+d,0.1,z+0.235);c.add(s)})},
  subak:(c,x,z)=>{for(let k=0;k<4;k++){const a=k*1.57;leaf(c,x+Math.cos(a)*0.3,0.06,z+Math.sin(a)*0.3,0.13,0x4a7a32,0.2,a)}const w=sph(0.26,0x2f6a2a,x,0.24,z);w.scale.set(1.2,0.95,1);c.add(w);[-0.12,0,0.12].forEach(d=>{const st=sph(0.265,0x1a3a18,x+d,0.24,z);st.scale.set(0.12,0.96,1.01);c.add(st)})},
  ttalgi:(c,x,z)=>{for(let k=0;k<4;k++){const a=k*1.57+0.4;leaf(c,x+Math.cos(a)*0.12,0.12,z+Math.sin(a)*0.12,0.1,0x3f7f30,0.3,a)}[[0.15,0.06],[-0.1,0.12],[0.05,-0.14]].forEach(([dx,dz])=>{const b=cone(0.055,0.11,0xd8282a,x+dx,0.06,z+dz,7);b.rotation.x=Math.PI;c.add(b)});c.add(sph(0.025,0xf6f2e2,x,0.22,z))},
  deulkkae:(c,x,z)=>{stalk(c,x,z,0.9,0x5a7a32);[0.3,0.55,0.8].forEach((y,k)=>leaf(c,x,y,z,0.17-k*0.03,0x5a8a38,0.22,k*0.8));c.add(cyl(0.02,0.02,0.14,0xb8a870,x,0.98,z,4))},
  danggeun:(c,x,z)=>{for(let k=0;k<6;k++){const a=k*1.05,l=cone(0.03,0.3,0x5a9a38,x+Math.cos(a)*0.04,0.22,z+Math.sin(a)*0.04,4);l.rotation.z=Math.cos(a)*0.4;l.rotation.x=Math.sin(a)*0.4;c.add(l)}c.add(cyl(0.05,0.05,0.04,0xe87a2a,x,0.02,z,8))},
  mu:(c,x,z)=>{for(let k=0;k<5;k++){const a=k*1.26,l=sph(0.12,0x4a8a32,x+Math.cos(a)*0.13,0.26,z+Math.sin(a)*0.13);l.scale.set(0.5,1.6,0.3);l.rotation.y=a;l.rotation.z=Math.cos(a)*0.5;c.add(l)}const r=cyl(0.13,0.11,0.24,0xeaf0d8,x,0.12,z,10);c.add(r);c.add(cyl(0.13,0.13,0.05,0x9ac46a,x,0.25,z,10))},
  daepa:(c,x,z)=>{for(let k=0;k<5;k++){const a=k*1.26,d=0.06;c.add(cyl(0.035,0.035,0.25,0xf4f2e4,x+Math.cos(a)*d,0.12,z+Math.sin(a)*d,6));const g=cone(0.035,0.4,0x3f8a3a,x+Math.cos(a)*d,0.44,z+Math.sin(a)*d,5);g.rotation.z=Math.cos(a)*0.15;c.add(g)}},
  jjokpa:(c,x,z)=>{for(let k=0;k<8;k++){const a=k*0.78,d=0.07;const g=cone(0.018,0.36,0x4f9a40,x+Math.cos(a)*d,0.18,z+Math.sin(a)*d,4);g.rotation.z=Math.cos(a)*0.25;g.rotation.x=Math.sin(a)*0.25;c.add(g)}c.add(sph(0.05,0xe8e2d0,x,0.03,z))},
  gat:(c,x,z)=>{for(let k=0;k<6;k++){const a=k*1.05,l=sph(0.13,k%2?0x6a3a5a:0x4a6a38,x+Math.cos(a)*0.12,0.22,z+Math.sin(a)*0.12);l.scale.set(0.55,1.5,0.3);l.rotation.y=a;l.rotation.z=Math.cos(a)*0.5;c.add(l)}},
  sigeumchi:(c,x,z)=>{for(let k=0;k<7;k++){const a=k*0.9,l=sph(0.1,0x2f6a28,x+Math.cos(a)*0.13,0.05,z+Math.sin(a)*0.13);l.scale.set(1.5,0.3,0.8);l.rotation.y=-a;c.add(l)}c.add(sph(0.04,0xc85a6a,x,0.04,z))},
  bomdong:(c,x,z)=>{for(let k=0;k<7;k++){const a=k*0.9,l=sph(0.15,k%2?0x9ac45a:0x7aaa48,x+Math.cos(a)*0.17,0.06,z+Math.sin(a)*0.17);l.scale.set(1.4,0.25,0.9);l.rotation.y=-a;c.add(l)}c.add(sph(0.08,0xe2eaa8,x,0.08,z))},
  maneul:(c,x,z)=>{for(let k=0;k<5;k++){const a=k*1.26,g=cone(0.025,0.5,0x5a8a40,x+Math.cos(a)*0.03,0.25,z+Math.sin(a)*0.03,4);g.rotation.z=Math.cos(a)*0.3;g.rotation.x=Math.sin(a)*0.3;c.add(g)}},
  yangpa:(c,x,z)=>{for(let k=0;k<4;k++){const a=k*1.57,g=cyl(0.025,0.02,0.45,0x3f7a38,x+Math.cos(a)*0.03,0.3,z+Math.sin(a)*0.03,5);g.rotation.z=Math.cos(a)*0.3;g.rotation.x=Math.sin(a)*0.3;c.add(g)}const b=sph(0.1,0xc89a5a,x,0.07,z);b.scale.y=0.8;c.add(b)},
  bori:(c,x,z)=>{for(let k=0;k<7;k++){const a=k*0.9,d=0.08;c.add(cyl(0.012,0.012,0.6,0x9ab84a,x+Math.cos(a)*d,0.3,z+Math.sin(a)*d,3));const e=sph(0.035,0xc8c070,x+Math.cos(a)*d,0.66,z+Math.sin(a)*d);e.scale.y=2.2;c.add(e)}}};
// 땅속 작물 캐낸 모습: [색, 크기, 모양(가로 x 세로)]
const TUBER={danggeun:[0xe87a2a,0.05,[0.8,3.2]],mu:[0xeef2dc,0.08,[1,2.6]],maneul:[0xf2ece0,0.07,[1,0.85]],yangpa:[0xc8904a,0.08,[1,0.9]]};
const _ra=ripeAt;ripeAt=function(c,crop,x,z){if(LOOK[crop])LOOK[crop](c,x,z);else _ra(c,crop,x,z)};
const _ta=tuberAt;tuberAt=function(c,crop,x,z){const T=TUBER[crop];if(!T)return _ta(c,crop,x,z);
  for(let k=0;k<3;k++){const t=sph(T[1],T[0],x+(k-1)*0.12,0.05,z+(k%2)*0.07);t.scale.set(T[2][0],T[2][1],T[2][0]);if(crop==="danggeun"||crop==="mu"){t.rotation.z=Math.PI/2;t.rotation.y=k*0.7}c.add(t);
    if(crop==="danggeun"||crop==="mu"||crop==="yangpa")c.add(cone(0.02,0.14,0x5a9a38,x+(k-1)*0.12+(crop==="yangpa"?0:0.14),crop==="yangpa"?0.16:0.06,z+(k%2)*0.07,4))}};
}
