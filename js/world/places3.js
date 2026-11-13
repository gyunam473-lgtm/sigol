/* 넓어진 마을 (2026-11-10): 사람이 많이 와도 붐비지 않게, 앉을 자리를 넉넉하게
   - 장터 넓히기: 바닥을 두 배로, 먹거리 천막(긴 상 둘, 12자리, 국밥집 아주머니), 먹는 평상 셋(6자리), 긴 의자 넷, 뻥튀기 수레
   - 방앗간: 쌀로 가래떡·인절미 뽑기, 쌀 팔기, 마당 의자
   - 분교: 운동장, 그네(타면 흔들려요), 스탠드 여덟 자리, 철봉·미끄럼틀, 학교 종
   - 보건소: 건강 살펴보기, 하루 한 번 비타민, 대기 의자
   - 버스 정류장: 찻길에 군내버스가 오가요, 정류장 의자, 구멍가게(식혜·막걸리), 느티나무 의자
   상 있는 자리(시켜 먹는 자리)는 TABLE_SEATS → sit.js 의 SEATS 에 더해져요. 상 없는 자리는 FREE_SEATS 에 더해요 */

const TABLE_SEATS={};
// 상 없는 긴 의자 하나 놓고 앉을 자리로 (face: 앉아서 보는 쪽, 0이면 +z)
function addBench(where,g,id,x,z,face,title,note,cam){const b=benchMesh(2.2,id);b.position.set(x,0,z);b.rotation.y=face;g.add(b);
  const fw=[Math.sin(face),Math.cos(face)];
  FREE_SEATS[id]={title,where,note,get:()=>({pos:[x-fw[0]*0.05,0.5,z-fw[1]*0.05],face,stand:[x+fw[0]*0.95,z+fw[1]*0.95],cam:cam||[1.4,1.8,-2.8],look:[0,0.8,3]})};
  return b}
const benchRect=(x,z,face)=>{const a=Math.abs(Math.sin(face))>0.5;return a?[x-0.3,z-1.15,x+0.3,z+1.15]:[x-1.15,z-0.3,x+1.15,z+0.3]};
// 누르면 하는 일 (input.js 의 "poke"): at 에 가서 fn
function poke(o,fn,at){o.userData={kind:"poke",poke:fn,at};return o}
const hitBox=(w,h,d,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));m.position.set(x,y,z);return m};
// 장소에 누를 것·막힐 곳 더하기
function addToPlace(k,objs,rects){const c=PLACES[k].clicks,o=PLACES[k].obs;PLACES[k].clicks=()=>c().concat(objs);PLACES[k].obs=()=>o().concat(rects)}

/* ================= 장터 넓히기 ================= */
const PLAZA_X={tent:{x0:-19.4,x1:-9.6,z0:-3.4,z1:6.6}};
const tentMats=[0xf3ead6,0x3f6f9a].map(c=>new THREE.MeshLambertMaterial({color:c,transparent:true,opacity:1}));
const tentRoof=new THREE.Group();
const plazaClicks=[],plazaRects=[];
let ppeong,jangPot;
(function(){
  plaza.add(box(40,0.03,26,0xd3c9b2,0,0.015,3)); // 넓어진 바닥 (가운데 옛 바닥보다 살짝 낮게)
  for(let i=0;i<46;i++){const x=-19+(i*7.3)%38,z=-9+(i*3.7)%24;if(Math.abs(x)<9.5&&z<6.5)continue;const t=box(1.6,0.02,1.6,i%2?0xcac0a8:0xd8ceb6,x,0.035,z);t.castShadow=false;plaza.add(t)}
  // ---------- 먹거리 천막 ----------
  const T=PLAZA_X.tent,cx=(T.x0+T.x1)/2;
  [T.x0+0.2,cx,T.x1-0.2].forEach(x=>[T.z0+0.2,T.z1-0.2].forEach(z=>plaza.add(cyl(0.07,0.07,3.0,0x7a5a3a,x,1.5,z,6))));
  for(let i=0;i<10;i++){const w=(T.x1-T.x0)/10,m=new THREE.Mesh(new THREE.BoxGeometry(w,0.06,T.z1-T.z0+0.4),tentMats[i%2]);m.position.set(T.x0+w*(i+0.5),3.02,(T.z0+T.z1)/2);m.castShadow=true;tentRoof.add(m)}
  [T.z0-0.2,T.z1+0.2].forEach(z=>{for(let i=0;i<10;i++){const w=(T.x1-T.x0)/10,m=new THREE.Mesh(new THREE.BoxGeometry(w,0.35,0.04),tentMats[i%2]);m.position.set(T.x0+w*(i+0.5),2.82,z);tentRoof.add(m)}}); // 앞뒤 드림
  plaza.add(tentRoof);
  // 국 끓이는 부뚜막과 가마솥 둘
  plaza.add(box(3.4,0.8,1.0,0x9a5a3a,-17,0.4,-2.6));plaza.add(box(3.5,0.06,1.1,0x6b4a2e,-17,0.82,-2.6));
  jangPot=[-17.9,-16.2].map(x=>{plaza.add(cyl(0.48,0.36,0.42,0x2e2a28,x,1.05,-2.6,14));const lid=cyl(0.5,0.5,0.05,0x3a3634,x,1.28,-2.6,14);plaza.add(lid);return new THREE.Vector3(x,1.35,-2.6)});
  plaza.add(box(1.2,0.9,0.5,0xe8dcc0,-14.3,0.45,-3.0));for(let i=0;i<6;i++)plaza.add(cyl(0.08,0.06,0.08,0xf2f0ea,-14.75+(i%3)*0.3,0.95+Math.floor(i/3)*0.09,-3.0,10)); // 그릇 선반
  plazaRects.push([-18.8,-3.2,-15.2,-2.0],[-15,-3.3,-13.6,-2.7]);
  // 긴 상 둘 + 긴 의자. 한 줄에 셋씩 마주 앉아요 (상 하나에 6자리)
  const TZ=[0.5,2.3,4.1];let n=0;
  [-16.5,-12.5].forEach(tx=>{
    plaza.add(box(1.1,0.06,5.6,0x9a6a45,tx,0.76,2.3));[[-0.45,-0.3],[0.45,-0.3],[-0.45,4.9],[0.45,4.9]].forEach(([a,z])=>plaza.add(box(0.07,0.74,0.07,0x6b4a2e,tx+a,0.37,z)));
    [-1,1].forEach(s=>{plaza.add(box(0.42,0.06,5.6,0xa87a52,tx+s*0.85,0.46,2.3));[-0.2,2.3,4.8].forEach(z=>plaza.add(box(0.36,0.44,0.08,0x6b4a2e,tx+s*0.85,0.22,z)));
      TZ.forEach(z=>{const id="jt"+(n++),t=new THREE.Group();t.position.set(tx+s*0.27,0.79,z);const d=new THREE.Group();t.add(d);t.userData.dishG=d;plaza.add(t);
        const fw=-s,seat=new THREE.Vector3(tx+s*0.85,0.5,z);
        const hb=hitBox(1.0,1.2,1.5,tx+s*0.55,0.6,z);hb.userData={kind:"tableseat",seat:id};plaza.add(hb);plazaClicks.push(hb);
        TABLE_SEATS[id]={title:"장터 먹거리 천막",menu:"jang",stand:[tx+s*1.6,z],seat,table:()=>t,block:[],
          cam:new THREE.Vector3(seat.x-fw*0.5,2.75,z+3.1),look:new THREE.Vector3(t.position.x,-0.5,z-0.4)}})});
    plazaRects.push([tx-1.1,-0.7,tx+1.1,5.3])});
  // ---------- 먹는 평상 셋 (평상 하나에 둘, 자리마다 소반) ----------
  [-2.2,2.6,7.4].forEach((pz,i)=>{const px=14,g=new THREE.Group();
    g.add(box(3.0,0.14,2.0,0xc29a62,0,0.56,0));for(let k=0;k<6;k++)g.add(box(0.03,0.02,1.9,0xa8824e,-1.25+k*0.5,0.64,0));
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>g.add(box(0.14,0.5,0.14,0x8a6440,a*1.35,0.25,b*0.85)));
    g.position.set(px,0,pz);plaza.add(g);
    [-1,1].forEach(s=>{const id="py"+i+(s<0?"a":"b"),sb=soban(0.42);sb.position.set(s*0.75,0.63,-0.3);g.add(sb);g.add(box(0.5,0.05,0.5,[0x5a7a9a,0xb8574a,0x6a8a4a][i],s*0.75,0.66,0.45));
      const seat=new THREE.Vector3(px+s*0.75,0.685,pz+0.45);
      const hb=hitBox(1.5,1.2,2.0,s*0.75,0.6,0);hb.userData={kind:"tableseat",seat:id};g.add(hb);plazaClicks.push(hb);
      TABLE_SEATS[id]={title:"장터 평상",stand:[px+s*0.75,pz+1.5],seat,table:()=>sb,block:[],
        cam:new THREE.Vector3(seat.x+s*3.2,3.5,seat.z+0.2),look:new THREE.Vector3(seat.x-s*0.3,-0.3,seat.z-1.0)}});
    plazaRects.push([px-1.6,pz-1.1,px+1.6,pz+1.1])});
  // ---------- 긴 의자 넷 (장터 쪽을 봐요) ----------
  [[-13,11.6],[-6.5,11.6],[6.5,11.6],[13,11.6]].forEach(([x,z],i)=>{plazaClicks.push(addBench("plaza",plaza,"plazaB"+i,x,z,Math.PI,"장터 긴 의자",["장터 사람들 오가는 걸 구경해요","국밥 냄새가 솔솔 풍겨요","뻥튀기 소리에 깜짝 놀라요","해가 따뜻해요. 장 보러 온 사람들 얼굴이 밝아요"][i]));plazaRects.push(benchRect(x,z,Math.PI))});
  // ---------- 뻥튀기 수레 ----------
  ppeong=new THREE.Group();ppeong.add(box(1.8,0.7,1.0,0x8a6a48,0,0.6,0));[[-0.7,0.5],[0.7,0.5]].forEach(([x,z])=>{const w=cyl(0.3,0.3,0.1,0x3a3a3a,x,0.3,z,12);w.rotation.x=Math.PI/2;ppeong.add(w)});
  const pm=cyl(0.25,0.25,0.7,0x3a3a3a,-0.3,1.2,0,12);pm.rotation.z=Math.PI/2;ppeong.add(pm);ppeong.add(box(0.5,0.6,0.5,0xc8b890,0.5,1.2,0));
  for(let i=0;i<5;i++)ppeong.add(cyl(0.18,0.18,0.08,0xf2e2b8,0.45+(i%2)*0.1,1.55+i*0.08,0,12));
  ppeong.position.set(15.5,0,-5.8);plaza.add(poke(ppeong,ppeongPop,[15.5,-4.6]));plazaClicks.push(ppeong);plazaRects.push([14.4,-6.4,16.6,-5.2]);
  // 느티나무 의자 방향 바로잡기 (장터 쪽을 봐요)
  plazaBench.rotation.y=Math.PI/2;
  [[-19,13],[19,13],[19.5,-8],[-8,14.5],[8.5,14.5]].forEach(([x,z],i)=>tree(x,z,1+(i%2)*0.2,false,plaza)); // 장터 둘레 나무
  WAYP.push([-14.5,-1.2],[-11,7.5],[-17.8,7.5],[11.5,0.2],[11.5,5],[16.8,10],[-16,9.5],[9,9.5],[-9,8.5],[0,12.5],[12,-4]);
})();
addToPlace("plaza",plazaClicks,plazaRects);
// 뻥튀기: 뻥! 하루 한 번 한 줌 얻어먹어요
function ppeongPop(){burst(0.5,300,0.5);burst(0.3,1800,0.15,0.05);buzz(30);
  const k=dayKey(new Date());if(S.ppeongDay!==k){S.ppeongDay=k;S.full=Math.min(100,fullNow()+3);save();refresh();toast("뻥이요~! 아저씨가 한 줌 쥐여 주셨어요. 바삭바삭 · 든든함 +3")}
  else toast(pickOne(["뻥이요~! 하얀 김이 펑 솟아요","뻥튀기 아저씨: \"귀 막어~ 뻥이요!\"","고소한 냄새가 장터에 퍼져요"]))}
// 국밥집 아주머니
SHOPS.jumak={name:"국밥집 아주머니",role:"국밥 말아 드려요",shirt:0xb05a3a,o:{scarf:0xf2e6c8,apron:0xf6f0e2,style:"shop"},spot:[-14.4,-2.3,0],stand:[-14.4,-1.1],
  open:()=>{toast("국밥집 아주머니: \""+pickOne(["아무 데나 앉어~ 국밥 한 그릇 말아 줄게","오늘 순대가 아주 잘 됐어","뜨끈한 국물에 밥 한 술 말아 먹어"])+"\"");sfx("pop")}};

/* ================= 방앗간 ================= */
const mill=placeGroup();
const millSteam=[];
(function(){
  mill.add(box(24,0.04,18,0xcfb98f,0,0.02,0));
  const b=new THREE.Group();b.add(box(11,3.2,5,0xe6dcc6,0,1.6,0));
  const rg=new THREE.CylinderGeometry(3.6,3.6,11.8,3,1);rg.rotateX(-Math.PI/2);rg.rotateY(Math.PI/2);const rf=new THREE.Mesh(rg,M(0x8a9aa0));rf.scale.set(1,0.4,0.86);rf.position.y=3.92;rf.castShadow=true;b.add(rf); // 함석 지붕
  b.add(box(3.2,2.6,0.06,0x2a2420,0,1.3,2.52));[-2.1,2.1].forEach(x=>b.add(box(1.0,2.7,0.08,0x5a6a7a,x,1.35,2.55))); // 큰 문(열림)
  [-4.2,4.2].forEach(x=>b.add(box(1.0,0.8,0.06,0xbfd8e4,x,2.0,2.53)));b.add(box(4,0.7,0.1,0x2f3f6f,0,2.85,2.56)); // 창, 간판
  b.position.set(0,0,-6.5);mill.add(poke(b,()=>openShop("mill"),[1.6,-1.2]));
  // 정미기 (벼 → 쌀)
  const m=new THREE.Group();m.add(box(1.2,1.0,1.0,0x5a7a9a,0,0.5,0));const hp=cone(0.6,0.8,0x6a8aaa,0,1.4,0,4);hp.rotation.x=Math.PI;m.add(hp);
  const ch=box(0.25,0.08,0.9,0x8a8a8a,0.5,0.75,0.55);ch.rotation.x=0.5;m.add(ch);m.add(box(0.5,0.45,0.4,0xe8dcb0,0.5,0.23,1.05));
  m.position.set(-3.6,0,-2.6);mill.add(poke(m,()=>{burst(0.8,400,0.2);toast("덜덜덜덜… 정미기가 돌아가요. 하얀 쌀이 주르륵")},[-2.2,-1.4]));
  // 떡 찌는 가마솥과 시루 (김이 모락모락)
  mill.add(box(1.4,0.7,1.2,0x9a5a3a,3.6,0.35,-2.6));mill.add(cyl(0.5,0.38,0.4,0x2e2a28,3.6,0.9,-2.6,14));mill.add(cyl(0.45,0.35,0.5,0x9a6a3a,3.6,1.35,-2.6,14));
  for(let i=0;i<6;i++){const s=sph(0.12,0xffffff,3.6,1.7,-2.6);s.material=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.5});s.castShadow=false;s.userData.ph=i/6;mill.add(s);millSteam.push(s)}
  // 쌀가마니, 고추 말리기, 나무
  for(let i=0;i<6;i++)mill.add(box(0.9,0.42,0.6,0xe8dcb0,-7+(i%3)*0.95,0.22+Math.floor(i/3)*0.43,-4.2));
  mill.add(box(3,0.03,2,0xd8c8a0,6.5,0.04,1.5));for(let i=0;i<40;i++){const p=box(0.12,0.04,0.04,0xc0392b,5.2+(i*0.37)%2.6,0.07,0.7+(i*0.23)%1.6);p.rotation.y=i;p.castShadow=false;mill.add(p)}
  tree(-9,1,1.2,false,mill);
  ["millB0","millB1"].forEach((id,i)=>addBench("mill",mill,id,[-6.5,6.8][i],[4.2,5.0][i],Math.PI,"방앗간 마당 의자",["떡 찌는 냄새가 솔솔. 기다리는 동안 쉬어 가요","고추 말리는 빨간 멍석이 예뻐요"][i]));
})();
placeSigns.mill=signpost(0,9.5,"toHome",mill);
PLACES.mill={g:mill,name:"방앗간",sub:"쌀로 가래떡·인절미 뽑기 · 쌀 팔기",
  hint:"방앗간 아저씨를 누르면 떡을 해 주시고 쌀도 사 주셔요.",way:[[-3,0.5],[3,0.5],[0,2.5],[-5,6.5],[5,7],[-2,6],[8,-1],[-8,-2]],
  clicks:()=>[ground,placeSigns.mill,...mill.children.filter(c=>c.userData.kind)],
  obs:()=>[[-5.6,-9.1,5.6,-3.9],[-4.3,-3.2,-2.9,-1.4],[2.8,-3.3,4.4,-1.9],[-7.6,-4.6,-4.6,-3.8],[-9.3,0.7,-8.7,1.3],benchRect(-6.5,4.2,Math.PI),benchRect(6.8,5,Math.PI)]};
SHOPS.mill={name:"방앗간 아저씨",role:"떡 뽑아 드려요",shirt:0xe8e4da,o:{cap:0xf2f0ea,apron:0xd8d0c0,pants:0x4a4a55,style:"shop"},place:"mill",spot:[0.4,-2.6,0],stand:[1.6,-1.2],open:l=>openMill(l)};
function openMill(line){const r=S.inv.ssal||0;let b='<div class="goods">';
  MILL_FOOD.forEach(f=>b+=goods(f.name,`쌀 ${f.rice}되 + 삯 ${f.fee}원 · ${f.desc}`,`<button class="go" data-tteok="${f.id}" ${r>=f.rice&&S.money>=f.fee?"":"disabled"}>뽑아 주세요</button>`));
  b+=goods("볏짚 한 묶음",`볏짚 5단 40원 · 짚공예 재료 · 가진 것 ${S.inv.jip||0}단`,`<button data-jipbuy="1" ${S.money>=40?"":"disabled"}>사기</button>`);
  b+=goods("쌀 팔기",`한 되에 ${MILL.ssalSell}원 · 가진 쌀 ${r}되`,`<button data-ssal="1" ${r?"":"disabled"}>1되 팔기</button>`);
  b+=`</div><p class="hint">쌀은 논에서 거둬요. 떡은 손이 비었으면 들고 가고, 아니면 우리 평상 소반에 올려 둬요</p>`;
  shopSheet("mill",line||pickOne(["쌀 가져왔으면 떡 뽑아 줄게. 김 모락모락 나는 걸로","햅쌀이여? 때깔 좋네","우리 방앗간 가래떡은 쫄깃한 게 남달라"]),b);
  sheet.querySelectorAll("[data-tteok]").forEach(x=>x.onclick=()=>{const f=MILL_FOOD.find(q=>q.id===x.dataset.tteok);if((S.inv.ssal||0)<f.rice||S.money<f.fee)return;
    if(S.hold&&S.dishes.length>=DISH_MAX){openMill("손도 꽉 찼고 평상도 꽉 찼구먼. 좀 먹고 와");return}
    S.inv.ssal-=f.rice;S.money-=f.fee;let where;if(!S.hold){setHold(f.id);where="들고 가"}else{S.dishes.push(f.id);drawHomeTable();where="평상에 올려 둘게"}
    sfx("coin");burst(0.6,500,0.15);save();refresh();openMill(f.name+" 다 됐어! 뜨끈할 때 먹어. "+where)});
  sheet.querySelectorAll("[data-jipbuy]").forEach(x=>x.onclick=()=>{if(S.money<40)return;S.money-=40;S.inv.jip=(S.inv.jip||0)+5;sfx("coin");save();refresh();openMill("볏짚 다섯 단. 새끼 꼬기 딱 좋은 걸로 골랐어")});
  sheet.querySelectorAll("[data-ssal]").forEach(x=>x.onclick=()=>{if(!(S.inv.ssal>0))return;S.inv.ssal--;S.money+=MILL.ssalSell;sfx("coin");save();refresh();openMill(pickOne(["쌀 좋네. "+MILL.ssalSell+"원 쳐줄게","찰기가 좋구먼. 여기 "+MILL.ssalSell+"원"]))})}

/* ================= 분교 ================= */
const school=placeGroup();
const swings=[];
(function(){
  school.add(box(30,0.03,22,0xd9c49a,0,0.015,-1)); // 운동장
  const b=new THREE.Group();b.add(box(18,3.2,4.6,0xf2efe6,0,1.6,0));
  const rg=new THREE.CylinderGeometry(3.3,3.3,18.8,3,1);rg.rotateX(-Math.PI/2);rg.rotateY(Math.PI/2);const rf=new THREE.Mesh(rg,M(0x4f7a5a));rf.scale.set(1,0.38,0.86);rf.position.y=3.85;rf.castShadow=true;b.add(rf);
  for(let i=0;i<8;i++){const x=-7.7+i*2.2;if(Math.abs(x)<1)continue;b.add(box(1.4,1.1,0.06,0x9cc4dc,x,1.9,2.32));b.add(box(1.5,0.08,0.1,0x7a6a5a,x,1.32,2.34))}
  b.add(box(1.6,2.3,0.06,0x8a6a48,0,1.15,2.32));b.add(box(1.6,0.12,1.2,0xbab4a8,0,0.06,2.9));
  b.position.set(0,0,-14.5);school.add(b);
  // 국기봉, 조회대, 철봉, 미끄럼틀
  school.add(cyl(0.05,0.06,6,0xd8d8d8,-6,3,-10.5,8));school.add(box(1.0,0.6,0.02,0x3f7a5a,-5.48,5.6,-10.5));
  school.add(box(3,0.6,1.4,0xc8c0b0,0,0.3,-10.6));
  [[0,1.4],[1,1.7],[2,2.0]].forEach(([i,h])=>{const x=8.6+i*0.9;school.add(cyl(0.04,0.04,h,0x8a8a8a,x-0.45,h/2,-8,6));school.add(cyl(0.04,0.04,h,0x8a8a8a,x+0.45,h/2,-8,6));const bar=cyl(0.025,0.025,0.9,0xb8b8b8,x,h,-8,6);bar.rotation.z=Math.PI/2;school.add(bar)});
  const sl=new THREE.Group();sl.add(box(0.9,2.0,0.9,0xd8a33a,0,1.0,-1.2));const sd=box(0.7,0.06,3.0,0x3f8fbf,0,1.0,0.4);sd.rotation.x=0.62;sl.add(sd);sl.position.set(11,0,-3);school.add(sl);
  // 그네 (두 개). 앉으면 흔들흔들
  const sw=new THREE.Group();[-1.6,1.6].forEach(x=>{const a=cyl(0.06,0.06,2.9,0x3f6f8f,x,1.35,-0.5,6);a.rotation.x=0.18;sw.add(a);const c=cyl(0.06,0.06,2.9,0x3f6f8f,x,1.35,0.5,6);c.rotation.x=-0.18;sw.add(c)});
  const top=cyl(0.06,0.06,3.4,0x3f6f8f,0,2.75,0,6);top.rotation.z=Math.PI/2;sw.add(top);
  [-0.8,0.8].forEach((x,i)=>{const p=new THREE.Group();p.position.set(x,2.7,0);[-0.22,0.22].forEach(d=>p.add(cyl(0.012,0.012,2.15,0x9a9a9a,d,-1.07,0,4)));p.add(box(0.55,0.05,0.28,0xd8573a,0,-2.15,0));
    p.userData={kind:"seat",seat:"swing"+i};sw.add(p);swings.push(p)});
  sw.position.set(-10,0,-4);school.add(sw);
  // 스탠드 (계단식 의자): 운동장을 봐요
  [[13,0.45],[14.2,0.9],[15.4,1.35]].forEach(([x,h])=>school.add(box(1.2,h,14,0xb8b4aa,x,h/2,-2)));
  // 플라타너스, 학교 종
  tree(-13,6,1.5,false,school);tree(-13.5,-10,1.4,false,school);tree(8,7.5,1.3,false,school);
  const bell=new THREE.Group();bell.add(cyl(0.05,0.05,2.4,0x6b4a2e,0,1.2,0,6));bell.add(box(0.6,0.06,0.06,0x6b4a2e,0.25,2.3,0));const bb=cone(0.16,0.28,0xc8a040,0.45,2.05,0,10);bell.add(bb);
  bell.position.set(2.4,0,-11.4);school.add(poke(bell,()=>{[0,0.35,0.7].forEach(d=>tone(1320,1300,0.5,"triangle",0.12,d));toast("학교 종이 땡땡땡~ 어서 모이자")},[3.2,-10.6]));
})();
// 그네 두 자리, 스탠드 여덟 자리
swings.forEach((p,i)=>{const x=-10.8+i*1.6;FREE_SEATS["swing"+i]={title:"그네",where:"school",note:"발을 굴러 흔들흔들. 바람이 얼굴에 시원해요",swing:i,
  get:()=>({pos:[x,0.58,-4],face:0,stand:[x,-2.8],cam:[2.6,1.6,3.4],look:[0,0.6,0]})}});
[[13.0,0.5],[14.2,0.95]].forEach(([x,y],t)=>[-6.5,-3,0.5,4].forEach((z,i)=>{FREE_SEATS["stand"+t+i]={title:"운동장 스탠드",where:"school",note:["운동장이 한눈에 보여요. 아이들 뛰노는 소리가 들리는 것 같아요","운동회 날엔 여기 사람들이 꽉 차요","플라타너스 그늘이 시원해요","국기봉 깃발이 바람에 펄럭여요"][i],
  get:()=>({pos:[x,y,z],face:-Math.PI/2,stand:[11.8,z],cam:[1.4,1.8,-2.8],look:[0,0.6,3]})};
  const hb=hitBox(1.1,0.6,1.6,x,y,z);hb.userData={kind:"seat",seat:"stand"+t+i};school.add(hb)}));
placeSigns.school=signpost(0,9.5,"toHome",school);
PLACES.school={g:school,name:"분교",sub:"넓은 운동장 · 그네 타기 · 스탠드에 앉아 쉬기",
  hint:"그네를 누르면 타요. 스탠드 계단에 앉아 운동장을 봐요. 학교 종도 쳐 봐요.",way:[[-4,0],[4,-2],[0,-6],[-6,4],[5,4],[7,-4],[-7,-8],[3,3],[-3,6]],
  clicks:()=>[ground,placeSigns.school,...school.children.filter(c=>c.userData.kind),...swings],
  obs:()=>[[-9.4,-17,9.4,-12],[-1.6,-11.4,1.6,-9.8],[-6.3,-10.8,-5.7,-10.2],[-11.8,-4.7,-8.2,-3.3],[10.4,-4.8,11.6,-0.8],[7.9,-8.3,10.9,-7.7],[12.4,-9.1,16.1,5.1],[2.2,-11.6,2.8,-11.2],[-13.3,5.7,-12.7,6.3],[-13.8,-10.3,-13.2,-9.7],[7.7,7.2,8.3,7.8]]};
SHOPS.teacher={name:"분교 선생님",role:"마을 행사 소식",shirt:0x6a8aaa,o:{hat:false,hair:0x2a221c,style:"shop"},place:"school",spot:[-1.6,-9.4,0.2],stand:[-0.6,-8.2],
  open:()=>{toast("분교 선생님: \""+pickOne(["가을 운동회 준비하고 있어요. 그날은 마을 사람 다 모여요!","그네 타 보셨어요? 어른이 타도 재밌어요","스탠드에 앉아 쉬어 가세요. 운동장이 참 넓죠","학교 종 쳐 보셨어요? 땡땡땡~"])+"\"");sfx("pop")}};

/* ================= 보건소 ================= */
const clinic=placeGroup();
(function(){
  clinic.add(box(20,0.04,14,0xd5d0c4,0,0.02,-1));
  const b=new THREE.Group();b.add(box(11,3,5,0xf4f2ec,0,1.5,0));b.add(box(11.6,0.3,5.6,0x6a8a9a,0,3.15,0));b.add(box(11.02,0.25,5.02,0x5a9a7a,0,2.6,0));
  b.add(box(1.8,2.2,0.06,0x9cc4dc,0,1.1,2.52));[-3.6,-2.2,2.2,3.6].forEach(x=>b.add(box(1.0,0.9,0.06,0xbfd8e4,x,1.6,2.52)));
  b.add(box(0.9,0.9,0.06,0xffffff,4.6,2.5,2.55));b.add(box(0.6,0.18,0.08,0x4a9a6a,4.6,2.5,2.58));b.add(box(0.18,0.6,0.08,0x4a9a6a,4.6,2.5,2.58)); // 초록 십자
  b.position.set(0,0,-7);clinic.add(poke(b,()=>openShop("clinic"),[2.6,-2.4]));
  clinic.add(box(11.6,0.1,1.8,0x9aa4aa,0,2.7,-3.7));[-5.6,5.6].forEach(x=>clinic.add(cyl(0.05,0.05,2.7,0x8a8a8a,x,1.35,-2.9,6))); // 차양
  for(let i=0;i<10;i++)clinic.add(sph(0.16,[0xe8586a,0xf2c84a,0xf6f0e2][i%3],-7+i*0.4,0.22,-1.2));clinic.add(box(4.2,0.22,0.6,0x9a8a72,-5.2,0.11,-1.2)); // 화단
  tree(7.5,1.5,1.1,false,clinic);
  const bike=new THREE.Group();[-0.45,0.45].forEach(x=>{const w=new THREE.Mesh(new THREE.TorusGeometry(0.3,0.03,6,16),M(0x333333));w.position.set(x,0.32,0);bike.add(w)});bike.add(box(0.9,0.04,0.04,0x3f6f8f,0,0.55,0));bike.add(cyl(0.02,0.02,0.4,0x3f6f8f,-0.2,0.7,0,4));
  bike.position.set(-6.4,0,-3.6);bike.rotation.y=0.3;clinic.add(bike);
  ["clinicB0","clinicB1"].forEach((id,i)=>addBench("clinic",clinic,id,[-3.4,3.6][i],-3.5,0,"보건소 대기 의자",["차례를 기다리며 쉬어 가요. 소독약 냄새가 살짝 나요","차양 그늘이 시원해요. 화단 꽃이 예뻐요"][i],[2.4,1.8,2.6]));
})();
placeSigns.clinic=signpost(0,9.5,"toHome",clinic);
PLACES.clinic={g:clinic,name:"보건소",sub:"건강 살펴보기 · 하루 한 번 비타민 · 대기 의자",
  hint:"보건소 선생님을 누르면 건강을 살펴 주셔요.",way:[[-3,1],[3,1.5],[0,3.5],[-6,4],[5,5],[-2,6.5]],
  clicks:()=>[ground,placeSigns.clinic,...clinic.children.filter(c=>c.userData.kind)],
  obs:()=>[[-5.6,-9.6,5.6,-4.4],[-7.3,-1.5,-3.1,-0.9],[7.2,1.2,7.8,1.8],[-7,-4,-5.8,-3.2],benchRect(-3.4,-3.5,0),benchRect(3.6,-3.5,0)]};
SHOPS.clinic={name:"보건소 선생님",role:"건강 살펴 드려요",shirt:0xf6f6f2,o:{hat:false,hair:0x3a2a22,apron:0xffffff,style:"shop"},place:"clinic",spot:[1.4,-3.8,0],stand:[1.4,-2.4],open:l=>openClinic(l)};
function openClinic(line){const f=Math.round(fullNow()),w=Math.round(waterNow()),got=S.clinicDay===dayKey(new Date());
  const say=line||(f<25&&w<25?"배도 고프고 목도 마르시네요. 일만 하지 마시고 좀 쉬세요":f<25?"출출하시죠? 밥 거르지 마세요":w<25?"목이 많이 마르시네요. 물 자주 드세요":pickOne(["얼굴이 좋으시네요! 시골 공기가 약이죠","혈압 재 볼까요? 120에 80, 아주 좋아요","밭일하실 땐 허리 조심하세요"]));
  let b='<div class="goods">';
  b+=goods("건강 살펴보기",`든든함 ${f} · 물 ${w}`,`<button data-chk="1">혈압 재기</button>`);
  b+=goods("비타민 한 알",`하루 한 번 공짜 · 든든함 +10, 물 +10`,`<button class="go" data-vita="1" ${got?"disabled":""}>${got?"오늘 받았어요":"받기"}</button>`);
  b+=`</div><p class="hint">물은 우물·냇물, 든든함은 밥으로 채워요</p>`;
  shopSheet("clinic",say,b);
  sheet.querySelector("[data-chk]").onclick=()=>{sfx("pop");const a=110+Math.floor(Math.random()*20),c=70+Math.floor(Math.random()*12);openClinic(`${a}에 ${c}! ${a<125?"아주 좋아요":"괜찮아요. 짜게 드시지 마세요"}`)};
  sheet.querySelector("[data-vita]").onclick=()=>{if(S.clinicDay===dayKey(new Date()))return;S.clinicDay=dayKey(new Date());S.full=Math.min(100,fullNow()+10);S.water=Math.min(100,waterNow()+10);sfx("pop");save();refresh();openClinic("물이랑 같이 드세요. 내일 또 오세요")}}

/* ================= 버스 정류장 ================= */
const busStop=placeGroup();
const BUS={cycle:75,t:20};let bus;
(function(){
  busStop.add(box(90,0.03,5.2,0x55575a,0,0.015,-4));for(let i=0;i<22;i++){const d=box(1.4,0.01,0.12,0xe8c040,-42+i*4,0.035,-4);d.castShadow=false;busStop.add(d)} // 찻길, 가운데 노란 줄
  busStop.add(box(90,0.08,1.2,0xc8c4bc,0,0.04,-0.8)); // 인도
  busStop.add(box(28,0.03,12,0xd9c59b,0,0.015,6.2));
  // 정류장 (뒤 벽은 유리라 앉아서도 찻길이 보여요)
  const sh=new THREE.Group();sh.add(new THREE.Mesh(new THREE.BoxGeometry(4.6,2.0,0.06),new THREE.MeshLambertMaterial({color:0xbfd8e4,transparent:true,opacity:0.3})));sh.children[0].position.set(0,1.3,0.45);
  sh.add(box(4.9,0.12,1.7,0x3f6f8f,0,2.45,0));[-2.3,2.3].forEach(x=>{sh.add(cyl(0.05,0.05,2.45,0x8a8a8a,x,1.22,0.45,6));sh.add(cyl(0.05,0.05,2.45,0x8a8a8a,x,1.22,-0.7,6))});
  sh.add(box(4.2,0.08,0.45,0x9a6a45,0,0.46,0.12));[-1.9,0,1.9].forEach(x=>sh.add(box(0.08,0.44,0.4,0x6b4a2e,x,0.22,0.12)));
  sh.add(box(2.4,0.4,0.08,0xf6f0e2,0,2.0,0.47));
  sh.position.set(-3,0,1.5);busStop.add(sh);
  [-4.4,-3,-1.6].forEach((x,i)=>{const hb=hitBox(1.3,1.0,0.8,x,0.5,1.6);hb.userData={kind:"seat",seat:"busSeat"+i};busStop.add(hb)});
  // 시간표 기둥
  const tb=new THREE.Group();tb.add(cyl(0.05,0.05,2.2,0x8a8a8a,0,1.1,0,6));tb.add(box(0.7,0.9,0.05,0xf6f0e2,0,1.7,0.04));tb.add(box(0.7,0.15,0.06,0x3f6f8f,0,2.2,0.04));
  tb.position.set(0.8,0,0.2);busStop.add(poke(tb,()=>{const left=Math.ceil((BUS.cycle-BUS.t)%BUS.cycle);toast(BUS.t<20?"버스가 와 있어요! 읍내 방면 · 읍내는 아직 준비 중이에요":"다음 버스 "+left+"초 뒤 · 읍내 방면 (체험용으로 자주 와요)")},[0.8,1.0]));
  // 구멍가게
  const st=new THREE.Group();st.add(box(5,2.6,3.4,0xe8e0cc,0,1.3,0));st.add(box(5.4,0.15,4.0,0x9a5a3a,0,2.7,0.2));st.add(box(3,0.6,0.08,0x2f5f3f,0,2.2,1.72));
  st.add(box(1.4,2,0.06,0x9cc4dc,-1,1,1.71));st.add(box(1.2,0.8,0.5,0xd8312a,1.4,0.4,1.95)); // 문, 빨간 아이스크림 통
  st.position.set(8,0,4.6);busStop.add(poke(st,()=>openShop("store"),[5.2,3.2]));
  tree(-10,4.5,1.5,false,busStop);
  addBench("bus",busStop,"busB0",-10,2.2,Math.PI,"느티나무 아래 의자","느티나무 그늘에서 버스를 기다려요. 매미 소리가 들려요");
  addBench("bus",busStop,"busB1",8,1.9,Math.PI,"구멍가게 앞 의자","식혜 한 병 사서 앉아 쉬어 가요. 찻길 너머 논이 보여요");
  // 군내버스
  bus=new THREE.Group();bus.add(box(9,2.4,2.5,0x3f8f5a,0,1.6,0));bus.add(box(9.02,0.5,2.52,0xf2f0ea,0,0.75,0));
  for(let i=0;i<6;i++)bus.add(box(1.1,0.8,0.04,0x9cc4dc,-3.6+i*1.4,2.0,1.27));bus.add(box(0.04,1.0,2.2,0x9cc4dc,4.51,2.0,0));
  bus.add(box(1.0,1.9,0.04,0x2a3a3a,3.2,1.35,1.27));[[-3,1.1],[3,1.1],[-3,-1.1],[3,-1.1]].forEach(([x,z])=>{const w=cyl(0.45,0.45,0.3,0x222222,x,0.45,z,14);w.rotation.x=Math.PI/2;bus.add(w)});
  bus.add(box(2.8,0.35,0.05,0x1a1a1a,0,2.6,1.27));
  bus.position.set(-60,0,-3.2);busStop.add(poke(bus,()=>toast("읍내 가는 군내버스예요. 읍내는 아직 준비 중이에요 · 부릉부릉~")));
})();
placeSigns.bus=signpost(0,9.5,"toHome",busStop);
[-4.4,-3,-1.6].forEach((x,i)=>FREE_SEATS["busSeat"+i]={title:"버스 정류장 의자",where:"bus",note:["버스 오는 쪽을 자꾸 보게 돼요","찻길 너머로 논이 넓게 펼쳐져요","시간표를 보니 읍내 가는 버스가 곧 와요"][i],
  get:()=>({pos:[x,0.5,1.62],face:Math.PI,stand:[x,0.4],cam:[1.2,1.9,-2.6],look:[0,0.5,3]})});
PLACES.bus={g:busStop,name:"버스 정류장",sub:"읍내 가는 군내버스 · 구멍가게 · 정류장 의자",
  hint:"정류장 의자에 앉아 버스를 기다려요. 구멍가게에서 식혜를 사요.",way:[[-6,6],[3,6],[0,3.5],[-8,8],[10,9],[3,10],[12,1.2]],
  clicks:()=>[ground,placeSigns.bus,...busStop.children.filter(c=>c.userData.kind)],
  obs:()=>[[-5.4,1.8,-0.6,2.1],[0.6,0,1,0.4],[5.4,2.8,10.6,6.4],[-10.3,4.2,-9.7,4.8],benchRect(-10,2.2,Math.PI),benchRect(8,1.9,Math.PI)]};
SHOPS.store={name:"구멍가게 할머니",role:"식혜·막걸리",shirt:0x9a7aa8,o:{hat:false,hair:0xd8d4cc,apron:0xe8d8b8,style:"shop"},place:"bus",spot:[5.0,2.6,0],stand:[5.0,3.8],open:l=>openStore(l)};
function openStore(line){let b='<div class="goods">';
  b+=goods("식혜 한 병",`80원 · 살얼음 동동 · 들고 다니다 앉아서 마셔요`,`<button class="go" data-st="sikhye" ${S.money>=80&&!S.hold?"":"disabled"}>${S.hold?"손이 꽉 찼어요":"사기"}</button>`);
  b+=goods("막걸리 한 병",`150원 · 집 평상에서 따라 마셔요 · 가진 것 ${S.inv.makgeolli||0}병`,`<button class="go" data-st="makgeolli" ${S.money>=150?"":"disabled"}>사기</button>`);
  b+=`</div>`;
  shopSheet("store",line||pickOne(["어서 와. 버스 기다리는 겨?","시원한 식혜 있어. 한 병 줄까","읍내 가는 버스는 금방 와"]),b);
  sheet.querySelectorAll("[data-st]").forEach(x=>x.onclick=()=>{const k=x.dataset.st;
    if(k==="sikhye"){if(S.hold||S.money<80)return;S.money-=80;setHold("sikhye");sfx("coin");save();refresh();openStore("옛다, 시원할 때 마셔")}
    else{if(S.money<150)return;S.money-=150;S.inv.makgeolli=(S.inv.makgeolli||0)+1;sfx("coin");save();refresh();openStore("막걸리는 흔들어서 따라야 혀")}})}

/* ---------- 매 순간: 천막 지붕 비치기, 국솥·떡 김, 그네, 버스 ---------- */
let regrowT=0;
function placesFrame(dt,now){
  regrowT+=dt;if(regrowT>1){regrowT=0;if(!W)tendTick();if(!W&&!PD)pumasiTick();
    if(mode==="dwitsan"&&!PD&&forageRegrow()){applyForage();toast("반짝! 캔 자리에 새로 돋았어요")}
    if(mode==="home"&&!PD&&!inHouse&&woodRegrow()){applyWoodLand();toast("땔감 숲에 또 쓰러진 나무가 생겼어요")}}
  if(mode==="plaza"&&me){const T=PLAZA_X.tent,p=me.g.position,inT=!SIT&&p.x>T.x0-1&&p.x<T.x1+1&&p.z>T.z0-1&&p.z<T.z1+2.5,o=inT?0.22:1;
    tentMats.forEach(m=>{m.opacity+=(o-m.opacity)*Math.min(1,dt*6);m.depthWrite=m.opacity>0.9})}
  if(mode==="mill")millSteam.forEach(s=>{const u=(now/2600+s.userData.ph)%1;s.position.set(3.6+Math.sin(u*9+s.userData.ph*6)*0.15,1.7+u*1.4,-2.6);s.scale.setScalar(0.6+u*1.6);s.material.opacity=0.5*(1-u)});
  // 그네: 앉으면 앞뒤로 흔들흔들
  swings.forEach((p,i)=>{const on=SIT&&SIT.id==="swing"+i,tgt=on?0.5*Math.sin(now/650):0;p.rotation.x+= (tgt-p.rotation.x)*Math.min(1,dt*(on?8:2));
    if(on&&!EA){const a=p.rotation.x,x=-10.8+i*1.6;me.g.position.set(x,(1-Math.cos(a))*2.15,-4-Math.sin(a)*2.15);me.g.rotation.x=a}});
  if(!SIT&&me&&me.g.rotation.x)me.g.rotation.x=0;
  // 버스: 75초마다 왔다가 가요 (들어오기 6초, 서 있기 9초, 나가기 6초)
  BUS.t=(BUS.t+dt)%BUS.cycle;const t=BUS.t;
  if(t<6){const e=1-Math.pow(1-t/6,3);bus.position.x=-60+60*e}else if(t<15)bus.position.x=0;else if(t<21){const e=Math.pow((t-15)/6,2);bus.position.x=60*e}else bus.position.x=-60;
  if(mode==="bus"&&!BUS.said&&t>6&&t<7){BUS.said=1;if(soundOn){tone(300,280,0.25,"square",0.05);tone(300,280,0.25,"square",0.05,0.35)}toast("빵빵~ 군내버스가 왔어요. 읍내 방면이에요")}
  if(t>15)BUS.said=0;
}

/* ---------- 새 음식 모양 (국밥·순대·가래떡·인절미) ---------- */
DISH.gukbap=g=>{g.add(cyl(0.13,0.1,0.1,0x3a2a22,0,0.05,0,18));const br=cyl(0.118,0.118,0.008,0xc89a5a,0,0.092,0,18);br.castShadow=false;g.add(br);
  for(let i=0;i<5;i++)g.add(box(0.05,0.012,0.03,0xe6d6c0,fr(-0.06,0.06),0.1,fr(-0.06,0.06)));for(let i=0;i<8;i++)g.add(cyl(0.006,0.006,0.012,0x5d9a3e,fr(-0.07,0.07),0.102,fr(-0.07,0.07),5))};
DISH.sundae=g=>{g.add(plateMesh());for(let i=0;i<9;i++){const d=cyl(0.03,0.03,0.025,0x3a2428,-0.09+(i%5)*0.045,0.045,i<5?-0.025:0.035,10);d.rotation.x=0.3;g.add(d)}g.add(cyl(0.025,0.025,0.015,0x8a5a2a,0.1,0.04,0.07,10))};
DISH.garaetteok=g=>{g.add(plateMesh());[[-0.04,0],[0.02,0.03],[0.04,-0.03]].forEach(([x,z],i)=>{const t=cyl(0.022,0.022,0.24,0xf8f6f0,x,0.055+i*0.01,z,12);t.rotation.z=Math.PI/2;t.rotation.y=0.2*i;g.add(t)})};
DISH.injeolmi=g=>{g.add(plateMesh());for(let i=0;i<9;i++)g.add(box(0.05,0.035,0.05,0xd8b870,-0.06+(i%3)*0.06,0.05+Math.floor(i/3)*0.004,-0.06+Math.floor(i/3)*0.06))};

// 장소 이름표 (폰트 준비 뒤, people.js 의 makePeople 에서)
function placeLabels3(){
  [["먹거리 장터 · 국밥",-14.5,3.7,PLAZA_X.tent.z1,plaza],["평상",14,1.6,2.6,plaza],["뻥튀기",15.5,2.4,-5.8,plaza],
   ["방앗간",0,4.6,-4,mill],["정미기",-3.6,2.4,-2.6,mill],["떡 시루",3.6,2.6,-2.6,mill],
   ["새싹분교",0,4.9,-12,school],["그네",-10,3.4,-4,school],["스탠드",14.2,2.2,-2,school],["학교 종",2.4,2.9,-11.4,school],
   ["보건소",0,3.9,-4.4,clinic],
   ["버스 정류장 · 읍내 방면",-3,3.2,1.5,busStop],["구멍가게",8,3.4,6.4,busStop],["시간표",0.8,2.7,0.2,busStop]]
   .forEach(([t,x,y,z,g])=>{const l=label(t,1.1);l.position.set(x,y,z);g.add(l)});
  {const l=label("군내버스",0.9);l.position.set(0,3.3,0);bus.add(l)}
}
