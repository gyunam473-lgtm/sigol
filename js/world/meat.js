/* 고기 모양: 삼겹살(분홍 살·하얀 비계 줄무늬 → 노릇한 구운 면), 제육(빨간 양념 고기), 불고기(얇은 소고기, 양파·당근), 토종닭(백숙)
   날것 → 익은 색으로 바뀌어요 (부뚜막 요리에서 굽고 볶을수록). 완성 접시 모양과 막걸리 사발도 여기 */

const T_MEAT={
  samRaw:()=>ctex("samRaw",(x,s)=>{const b=[["#e8908e",0.22],["#f6e8e0",0.12],["#e07a7a",0.2],["#f4e2d8",0.1],["#e68684",0.24],["#f6eae2",0.12]];let y=0;
    b.forEach(([c,h])=>{x.fillStyle=c;x.fillRect(0,y*s,s,h*s+1);y+=h});for(let i=0;i<120;i++){x.fillStyle="rgba(255,255,255,.18)";x.fillRect(Math.random()*s,Math.random()*s,8,1)}}),
  samDone:()=>ctex("samDone",(x,s)=>{const b=[["#b8743a",0.22],["#ecc888",0.12],["#a8642e",0.2],["#e8c080",0.1],["#b06a34",0.24],["#efcc90",0.12]];let y=0;
    b.forEach(([c,h])=>{x.fillStyle=c;x.fillRect(0,y*s,s,h*s+1);y+=h});x.strokeStyle="rgba(60,30,10,.55)";x.lineWidth=5;for(let i=1;i<5;i++){x.beginPath();x.moveTo(i*s/5,0);x.lineTo(i*s/5-20,s);x.stroke()}}),
  broth:()=>ctex("broth",(x,s)=>{radial(x,s,"#f2e6c0","#dcc898");specks(x,s,50,["rgba(255,250,220,.7)","rgba(240,200,90,.5)"],3,8);specks(x,s,30,["#5d9a3e"],2,4)})};

// 날고기 무리 (요리할 때 도마 → 솥뚜껑). userData.cook(k): 0 날것 ~ 1 다 익음
function meatGroup(id){
  const g=new THREE.Group(),mats=[];
  if(id==="samgyeopsal"){const raw=lmat(T_MEAT.samRaw()),done=lmat(T_MEAT.samDone());
    for(let i=0;i<4;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.024,0.26),[raw,raw,raw,raw,raw,raw]);m.position.set(-0.11+i*0.075,0.012,0);m.rotation.y=(i%2-0.5)*0.12;m.castShadow=true;g.add(m)}
    g.userData.flipTo=(burnt)=>{done.color.setHex(0xffffff).lerp(new THREE.Color(0x3a2010),burnt);g.children.forEach(m=>m.material=[raw,raw,done,raw,raw,raw])}; // 뒤집으면 구운 면이 위로
    g.userData.cook=k=>{raw.color.setHex(0xffffff).lerp(new THREE.Color(0xe8b090),k*0.5)};g.userData.flat=true;return g}
  const spec={jeyuk:{n:14,raw:0xc8402a,done:0x7a2410,sz:[0.06,0.018,0.04],extra:[0x5d9a3e,0xf2ead6]},bulgogi:{n:14,raw:0xa8564a,done:0x5a2e1a,sz:[0.08,0.008,0.05],extra:[0xf2ead6,0xe07a2a,0x5d9a3e]}}[id];
  if(spec){for(let i=0;i<spec.n;i++){const mt=new THREE.MeshPhongMaterial({color:spec.raw,shininess:40});mats.push(mt);const m=new THREE.Mesh(new THREE.BoxGeometry(...spec.sz),mt);
      m.position.set(fr(-0.11,0.11),0.012+(i%3)*0.008,fr(-0.11,0.11));m.rotation.set(fr(-0.3,0.3),fr(0,TAU),fr(-0.3,0.3));m.castShadow=true;g.add(m)}
    for(let i=0;i<8;i++){const c=box(0.03,0.008,0.012,spec.extra[i%spec.extra.length],fr(-0.1,0.1),0.03,fr(-0.1,0.1));c.rotation.y=fr(0,TAU);g.add(c)} // 파·양파·당근
    const R=new THREE.Color(spec.raw),Dn=new THREE.Color(spec.done);g.userData.cook=k=>mats.forEach(m=>m.color.copy(R).lerp(Dn,Math.min(1,k)));return g}
  if(id==="baeksuk"){const sk=new THREE.MeshPhongMaterial({color:0xf2d8c0,shininess:30});const body=new THREE.Mesh(new THREE.SphereGeometry(0.11,14,10),sk);body.scale.set(1.2,0.8,1);body.position.y=0.08;g.add(body);
    [-1,1].forEach(d=>{const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.04,0.12,8),sk);leg.position.set(0.1,0.1,d*0.05);leg.rotation.z=-1.1;g.add(leg);g.add(sph(0.035,0xf6ead8,0.15,0.13,d*0.05))});
    g.userData.cook=k=>sk.color.setHex(0xf2d8c0).lerp(new THREE.Color(0xf0dcae),k);return g}
  return g}

// 완성 접시
Object.assign(DISH,{
  samgyeopsal:g=>{g.add(plateMesh());const done=lmat(T_MEAT.samDone());for(let i=0;i<5;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.018,0.2),done);m.position.set(-0.1+i*0.05,0.04+i*0.004,0);m.rotation.y=0.3;g.add(m)}
    const l=leafPiece(T.leaf(false),0.08,0.12);l.position.set(0.08,0.035,0.07);g.add(l);g.add(cyl(0.02,0.02,0.015,0xb8321f,-0.1,0.04,0.09,10))}, // 상추 한 장, 쌈장
  jeyuk:g=>{g.add(plateMesh());for(let i=0;i<14;i++){const m=box(0.05,0.016,0.035,i%5?0x7a2410:0x8a3018,fr(-0.08,0.08),0.04+i*0.002,fr(-0.08,0.08));m.rotation.set(fr(-0.3,0.3),fr(0,TAU),0);g.add(m)}
    for(let i=0;i<6;i++)g.add(box(0.03,0.006,0.01,i%2?0x5d9a3e:0xf2ead6,fr(-0.07,0.07),0.06,fr(-0.07,0.07)));for(let i=0;i<12;i++)g.add(sph(0.004,0xf6eedc,fr(-0.07,0.07),0.065,fr(-0.07,0.07)))}, // 깨
  bulgogi:g=>{g.add(plateMesh());for(let i=0;i<12;i++){const m=box(0.07,0.007,0.045,0x5a2e1a,fr(-0.08,0.08),0.037+i*0.002,fr(-0.08,0.08));m.rotation.set(fr(-0.2,0.2),fr(0,TAU),0);g.add(m)}
    for(let i=0;i<8;i++)g.add(box(0.03,0.006,0.01,[0xf2ead6,0xe07a2a,0x5d9a3e][i%3],fr(-0.07,0.07),0.06,fr(-0.07,0.07)))},
  baeksuk:g=>{g.add(sabal(0.16,0.11));const d=disc(0.145,0.004,lmat(T_MEAT.broth()),0xdcc898);d.position.y=0.085;g.add(d);
    const b=sph(0.08,0xf0dcae,0,0.1,0);b.scale.set(1.2,0.7,1);g.add(b);[-1,1].forEach(k=>g.add(sph(0.025,0xf6ead8,0.08,0.12,k*0.035)))},
  makgeolli:g=>{g.add(sabal(0.1,0.07));const d=disc(0.09,0.004,new THREE.MeshLambertMaterial({color:0xf6f2e6}),0xf6f2e6);d.position.y=0.058;g.add(d); // 뽀얀 막걸리
    const jug=new THREE.Group();jug.add(cyl(0.05,0.06,0.1,0xc8a868,0,0.05,0,12));jug.add(cyl(0.025,0.04,0.04,0xc8a868,0,0.12,0,10));jug.add(box(0.06,0.012,0.012,0xc8a868,0.06,0.09,0));jug.position.set(0.14,0,0.04);g.add(jug)}}); // 주전자

// 다방 찻잔 (받침 + 잔 + 차)
function teaCup(col,top){const g=new THREE.Group();g.add(cyl(0.08,0.08,0.01,0xf6f2ea,0,0.005,0,16));g.add(lathe([[0,0],[0.03,0],[0.045,0.06],[0.05,0.065]],new THREE.MeshPhongMaterial({color:0xfaf8f2,shininess:60,side:THREE.DoubleSide})));
  const t=cyl(0.044,0.044,0.004,col,0,0.058,0,16);g.add(t);if(top)top(g);g.position.y=0.005;return g}
Object.assign(DISH,{
  dabang_coffee:g=>g.add(teaCup(0xa87a4a)),
  ssanghwa:g=>g.add(teaCup(0x4a2a1a,c=>{c.add(sph(0.016,0xf2b420,0,0.064,0));[[-0.02,0.01],[0.02,-0.01],[0.01,0.02]].forEach(([x,z])=>c.add(sph(0.005,0xf6eedc,x,0.062,z)))})), // 노른자, 잣
  yulmu:g=>g.add(teaCup(0xd8c8a0)),yuja:g=>g.add(teaCup(0xf2b030,c=>{for(let i=0;i<4;i++)c.add(box(0.012,0.003,0.004,0xf6d060,(i-1.5)*0.015,0.062,0))}))});
