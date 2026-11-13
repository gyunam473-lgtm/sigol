/* 누르기와 걷기: 누른 곳으로 걸어가기, 건물·울타리 돌아가기(길막기), 누른 자리 표시 */

/* ---------- 누르기 ---------- */
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();let pending=null;
canvas.addEventListener("click",e=>{
  if(!me||SIT||W||CK||LIE||PD||FS||SKYV)return; // 앉아 있거나 일하거나 누운 중엔 걷지 않아요
  const r=canvas.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
  const list=inHouse?[...roomFloors,roomMaru,roomYo,roomDesk,roomDoor,...roomWins,roomCloset,agungi,...furnObjs].filter(Boolean)
    :PLACES[mode]?PLACES[mode].clicks().concat(npcs.filter(n=>n.g.visible).map(n=>n.g))
    :[...npcs.filter(n=>n.g.visible&&!n.stay).map(n=>n.g)].concat([ground,house,maruCushion,paddy,toPlaza,well,motang,woodpile,...woodTrees.filter(t=>t.visible),...plots.filter(p=>p.g.visible).map(p=>p.g)],chickens.visible?[chickens]:[],myBarn.visible?[myBarn]:[],bench.visible?[bench]:[],stove.visible?[stove]:[],typeof homeClicks==="function"?homeClicks():[]);
  ray.setFromCamera(ndc,camera);const hits=ray.intersectObjects(list,true);if(!hits.length)return;
  let o=hits[0].object;while(o&&!o.userData.kind)o=o.parent;if(!o)return;const k=o.userData.kind;
  if(k==="ground"||k==="roomfloor"||k==="dabangfloor"||k==="sanground"){const p=hits[0].point;go(p.x,p.z,null);showMark(me.tx,me.tz)}
  // 집 안
  else if(k==="yo"){const [x,z]=yoStand();go(x,z,{type:"lie"})}
  else if(k==="desk"){const [x,z]=deskStand();go(x,z,{type:"desk"})}
  else if(k==="seat"){const g=FREE_SEATS[o.userData.seat].get();go(g.stand[0],g.stand[1],{type:"sit",place:o.userData.seat})}
  else if(k==="tableseat"){const s=SEATS[o.userData.seat];go(s.stand[0],s.stand[1],{type:"sit",place:o.userData.seat})}
  else if(k==="poke"){const u=o.userData;if(u.at)go(u.at[0],u.at[1],{type:"poke",fn:u.poke});else u.poke()}
  else if(k==="roomdoor"){const [x,z]=doorStand();go(x,z,{type:"leave"})}
  else if(k==="roomwin")toast(weather.kind==="비"?"창호지에 빗방울 그림자가 어른거려요":skyNow.night>0.5?"창밖이 깜깜해요. 풀벌레 소리가 들려요":"창호지로 햇빛이 환하게 들어와요");
  else if(k==="furn")go(o.userData.stand[0],o.userData.stand[1],{type:"furn",id:o.userData.id});
  else if(k==="agungi")go(o.userData.stand[0],o.userData.stand[1],{type:"agungi"});
  else if(k==="closet")toast("할머니가 물려주신 자개장이에요. 자개 학이 반짝여요");
  // 사람: 가게 주인은 말을 걸고, 이웃은 인사해요
  else if(k==="shop"){const [x,z]=shopStand(o.userData.shop);go(x,z,{type:"shop",shop:o.userData.shop})}
  // 공용 장소
  else if(k==="board")go(hallBoard.position.x+0.2,hallBoard.position.z+1.3,{type:"board"});
  else if(k==="speaker")go(hallSpeaker.position.x-0.9,hallSpeaker.position.z+1.0,{type:"speaker"});
  else if(k==="hallbldg"){const [x,z]=HALL.chief;go(x+1.1,z+0.9,{type:"npc",n:npcs.find(p=>p.name==="이장님")})}
  else if(k==="cattlepen"||k==="closedsign"){if(!jangToday()){toast(PLACE_HELLO.cattle());}else{const [x,z]=shopStand("cattle");go(x,z,{type:"shop",shop:"cattle"})}}
  else if(k==="wsshed"||k==="wsdisplay"){const [x,z]=shopStand("furniture");go(x,z,{type:"shop",shop:"furniture"})}
  else if(k==="forage"){const [x,z]=FORAGE_POS[o.userData.i];go(x+0.3,z+0.9,{type:"forage",i:o.userData.i})}
  else if(k==="dabangdoor")go(0,DB.z1-0.4,{type:"dabangout"});
  else if(k==="fishspot")go(FISH_SPOT.x,FISH_SPOT.z+0.6,{type:"fish",x:FISH_SPOT.x});
  else if(k==="streamwater"){const p=hits[0].point;go(p.x,p.z,null);showMark(me.tx,me.tz)} // 물속으로 걸어 들어가요
  else if(k==="npc"){const n=npcs.find(p=>p.name===o.userData.name);if(n){n.tx=n.g.position.x;n.tz=n.g.position.z;n.wait=6;go(n.g.position.x+1.1,n.g.position.z+0.6,{type:"npc",n})}}
  else if(k==="plot"){const i=o.userData.i,g=plots[i].g.position,front=plotPos(i)[1]===1; // 앞줄은 울타리 밖에서 일해요
    go(g.x,front?FIELD.z+3.6+0.75:g.z+1.35,{type:"plot",i})}
  else if(k==="bench")go(SEATS.home.stand[0],SEATS.home.stand[1],{type:"sit",place:visiting?"nbBench":"home"});
  else if(k==="stove")go(STOVE.stand[0],STOVE.stand[1],{type:"stove"});
  else if(k==="well")go(well.position.x+1.1,well.position.z+0.4,{type:"well"});
  else if(k==="seatruck"){const [x,z]=shopStand("fish");go(x,z,{type:"shop",shop:"fish"})}
  else if(k==="pavilion")go(SEATS.plaza.stand[0],SEATS.plaza.stand[1],{type:"sit",place:"plaza"});
  else if(k==="house"){if(!visiting&&(S.houseLv||1)>=3&&hits[0].point.x<-12.2)go(SARANG_FRONT.x,SARANG_FRONT.z,{type:"house",which:"sarang"});else go(HF.x,HF.z,{type:"house"})} // 큰 집이면 사랑채 따로
  else if(k==="barn")go(BARN.x,BARN.z+4.1,{type:"barn"});
  else if(k==="coop")go((PEN.x0+PEN.x1)/2,PEN.z1+0.9,{type:"coop"});
  else if(k==="market"){const [x,z]=shopStand(o.userData.shop);go(x,z,{type:"shop",shop:o.userData.shop})}
  else if(k==="toPlaza")go(2.4,11.4,{type:"toPlaza"});
  else if(k==="toHome")go(0,10.4,{type:"toHome"});
  else if(k==="paddy")go(PADDY.x,PADDY.z+2.9,{type:"paddy"});
  else if(k==="woodtree"){const t=woodTrees[o.userData.i].position;go(t.x+0.4,t.z+1.6,{type:"woodtree",i:o.userData.i})}
  else if(k==="motang")go(motang.position.x+0.2,motang.position.z+1.1,{type:"motang"});
  else if(k==="woodpile")toast("장작가리 · 장작 "+(S.inv.jangjak||0)+"/"+FUEL.pileMax+"개 · 통나무 "+(S.inv.tongnamu||0)+"개 · 지붕이 있어 비에 안 젖어요");
});
function go(x,z,act){
  if(inHouse){x=Math.max(ROOM.x-ROOM.W/2+0.4,Math.min(ROOM.x+ROOM.W/2-0.4,x));z=Math.max(ROOM.z-ROOM.D/2+0.4,Math.min(ROOM.z+ROOM.D/2+0.9,z))}
  else{x=Math.max(-30,Math.min(30,x));z=Math.max(-30,Math.min(30,z))}
  [x,z]=pushOut(x,z);pending=act;me.moving=true;me.stuck=0;
  me.route=fieldRoute([me.g.position.x,me.g.position.z],[x,z]);const n=me.route.shift();me.tx=n[0];me.tz=n[1]}
// 텃밭 울타리 돌아가기: 안과 밖을 오갈 땐 앞쪽 입구로, 밭 옆·뒤로 갈 땐 울타리 바깥 모서리를 따라 돌아가요
function fieldRoute(p,t){
  if(inHouse){ // 다른 칸으로 갈 땐 앞 툇마루로 나와서 건너가요
    const a=spaceOf(p[0]-ROOM.x),b=spaceOf(t[0]-ROOM.x),walk=ROOM.z+ROOM.D/2+0.6;
    return a===b?[t]:[[p[0],walk],[t[0],walk],t]}
  if(mode==="dabang"){ // 다방: 소파 칸 사이 통로를 따라 앞쪽 넓은 곳으로 돌아가요
    const ax=x=>DABANG_AISLES.reduce((a,b)=>Math.abs(b-x)<Math.abs(a-x)?b:a),F=0.8;
    const fr=q=>q[1]>F-0.2,A=ax(p[0]),B=ax(t[0]);if(fr(p)&&fr(t))return [t];
    return [...(fr(p)?[]:[[A,p[1]],[A,F]]),...(fr(t)?[t]:[[B,F],[B,t[1]],t])]} // 앞쪽 넓은 곳에선 곧장
  if(PLACES[mode])return [t];
  const F=fieldBox(),a=inField(p[0],p[1],F),b=inField(t[0],t[1],F),G=[FIELD.x,F.z1+0.9],IN=[FIELD.x,F.z1-0.9];
  const back=q=>toGate(q,F).reverse();
  if(a&&b)return [t];
  if(a)return [IN,G,...back(t),t];
  if(b)return [...toGate(p,F),G,IN,t];
  if(crossesField(p,t,F))return [...toGate(p,F),G,...back(t),t];
  return [t];
}
function toGate(q,F){ // 밖에 있는 점에서 입구 앞까지 거쳐 갈 모서리들
  const FL=[F.x0-0.9,F.z1+0.9],FR=[F.x1+0.9,F.z1+0.9];
  if(q[1]>=F.z1)return [];
  if(q[0]<=F.x0)return [FL];if(q[0]>=F.x1)return [FR];
  return q[0]<FIELD.x?[[F.x0-0.9,F.z0-0.9],FL]:[[F.x1+0.9,F.z0-0.9],FR];
}
function crossesField(p,t,F){ // 곧장 가면 울타리에 걸리는지
  const m=0.4,x0=F.x0-m,x1=F.x1+m,z0=F.z0-m,z1=F.z1+m;let lo=0,hi=1;
  for(const [s,d,a,b] of [[p[0],t[0]-p[0],x0,x1],[p[1],t[1]-p[1],z0,z1]]){
    if(Math.abs(d)<1e-9){if(s<a||s>b)return false;continue}
    let u=(a-s)/d,v=(b-s)/d;if(u>v)[u,v]=[v,u];lo=Math.max(lo,u);hi=Math.min(hi,v);if(lo>hi)return false}
  return true;
}
// 지금 보이는 텃밭 울타리의 범위
function fieldBox(){const full=!!(visiting&&visiting.full),cols=full?5:mode==="home"?(S.fieldCols||3):3;
  return {x0:FIELD.x-3.6,x1:FIELD.x+(cols-2)*2.2+1.4,z0:FIELD.z-3.6,z1:FIELD.z+3.6}}
const inField=(x,z,F)=>x>F.x0&&x<F.x1&&z>F.z0&&z<F.z1;
function arrive(){if(!pending)return;const a=pending;pending=null;
  if(a.type==="plot"){faceTo(plots[a.i].g.position);visiting?useNbPlot(a.i):usePlot(a.i)}
  if(a.type==="house")visiting?openGift():enterHouse(a.which);
  if(a.type==="furn"){faceTo({x:me.g.position.x,z:me.g.position.z-1});useFurn(a.id)}
  if(a.type==="agungi"){faceTo({x:me.g.position.x,z:me.g.position.z-1});lightAgungi()}
  if(a.type==="lie")lieDown();
  if(a.type==="desk"){sitDown("desk");openKitchen()} // 책상 앞 방석에 앉아 장부를 펴요
  if(a.type==="leave")leaveHouse();
  if(a.type==="shop"){const p=SHOPS[a.shop].p;faceTo(p.g.position);if(!p.stay)return;p.g.rotation.y=Math.atan2(me.g.position.x-p.g.position.x,me.g.position.z-p.g.position.z);openShop(a.shop)}
  if(a.type==="npc"){const n=a.n;faceTo(n.g.position);n.g.rotation.y=Math.atan2(me.g.position.x-n.g.position.x,me.g.position.z-n.g.position.z);n.wait=4;
    if(n.name==="이장님"){openTalk("ijang");return}
    const nb=NB.find(x=>x.name===n.name);toast(n.name+": "+(nb?nb.greet:"안녕하세요"));sfx("pop")}
  if(a.type==="board"){faceTo(hallBoard.position);openBoard()}
  if(a.type==="speaker")villageBroadcast();
  if(a.type==="fish")startFishing(a.x);
  if(a.type==="poke")a.fn();
  if(a.type==="dabangout"){toast("딸랑~ 다방 문을 나서요. 어디로 갈까요?");openVillage()}
  if(a.type==="forage"){faceTo({x:FORAGE_POS[a.i][0],z:FORAGE_POS[a.i][1]});useForage(a.i)}
  if(a.type==="stream"){faceTo({x:me.g.position.x,z:-3});drinkStream()}
  if(a.type==="coop")useCoop();
  if(a.type==="paddy"){faceTo(paddy.position);usePaddy()}
  if(a.type==="woodtree"){faceTo(woodTrees[a.i].position);if(stormActive()){toast("궂은 날씨엔 산에 가면 위험해요");return}useWoodTree(a.i)}
  if(a.type==="motang"){faceTo(motang.position);openMotangMenu()}
  if(a.type==="barn"){faceTo({x:BARN.x,z:BARN.z});openBarn()}
  if(a.type==="market")openMarket();
  if(a.type==="toPlaza")goPlaza();
  if(a.type==="toHome")goHome();
  if(a.type==="sit")sitDown(a.place);
  if(a.type==="stove")openStove();
  if(a.type==="well")drinkWell();
  if(a.type==="cook")startCook(a.id)}
function faceTo(p){me.g.rotation.y=Math.atan2(p.x-me.g.position.x,p.z-me.g.position.z)}

/* ---------- 길막기: 건물과 울타리는 돌아서 가요 ---------- */
function obstacles(){
  if(inHouse)return ROOM_OBS;
  if(PLACES[mode])return PLACES[mode].obs();const R=[];
  R.push(houseRect,[-4.3,-5.6,-2,-3.2],[3.4,5.6,10.6,10.4],[well.position.x-0.65,well.position.z-0.65,well.position.x+0.65,well.position.z+0.65]);
  if((visiting?visiting.lv:S.houseLv||1)>=3)R.push([-15.8,-3.4,-12.2,0.9]);
  if(chickens.visible)R.push([PEN.x0,PEN.z0,PEN.x1,PEN.z1]);
  if(myBarn.visible)R.push([BARN.x-2.3,BARN.z-1.95,BARN.x+2.3,BARN.z+3.45],[BARN.x-3.3,BARN.z-1.6,BARN.x-2.5,BARN.z+0.6]);
  // 텃밭 울타리: 네 벽, 앞쪽 가운데만 입구로 비워 둬요
  const F=fieldBox(),T=0.06,gx=FIELD.x;
  R.push([F.x0,F.z0-T,F.x1,F.z0+T],[F.x0-T,F.z0,F.x0+T,F.z1],[F.x1-T,F.z0,F.x1+T,F.z1],[F.x0,F.z1-T,gx-1.2,F.z1+T],[gx+1.2,F.z1-T,F.x1,F.z1+T]);
  if(stove.visible)R.push([STOVE.x-1.3,STOVE.z-1.0,STOVE.x+1.3,STOVE.z+0.8]);
  if(motang.visible)R.push([motang.position.x-0.45,motang.position.z-0.45,motang.position.x+0.45,motang.position.z+0.45],[woodpile.position.x-1.3,woodpile.position.z-0.45,woodpile.position.x+1.3,woodpile.position.z+0.45]);
  woodTrees.forEach(t=>{if(t.visible)R.push([t.position.x-0.9,t.position.z-0.5,t.position.x+0.9,t.position.z+0.5])});
  R.push([PADDY.x-3.5,PADDY.z-2.3,PADDY.x+3.5,PADDY.z+2.3]);
  if(bench.visible)R.push([BENCH.x-BENCH.W/2,BENCH.z-BENCH.D/2,BENCH.x+BENCH.W/2,BENCH.z+BENCH.D/2]);
  if(typeof extraHomeObs==="function"&&mode==="home")R.push(...extraHomeObs());
  if(ijang.visible)R.push([-15.5,3.6,-10.9,9.1],[-6.8,-2.3,-2.4,0.5],[-17.6,-10,-1,-9.2],[-17.7,-9.6,-16.9,3.6]);
  return R}
var OBS=[];const PAD=0.35;
const blocked=(x,z)=>OBS.some(r=>x>r[0]-PAD&&x<r[2]+PAD&&z>r[1]-PAD&&z<r[3]+PAD);
function pushOut(x,z){for(const r of OBS){if(x>r[0]-PAD&&x<r[2]+PAD&&z>r[1]-PAD&&z<r[3]+PAD){
  const c=[[r[0]-PAD-0.05,z,x-r[0]],[r[2]+PAD+0.05,z,r[2]-x],[x,r[1]-PAD-0.05,z-r[1]],[x,r[3]+PAD+0.05,r[3]-z]].sort((a,b)=>a[2]-b[2])[0];x=c[0];z=c[1]}}return [x,z]}

/* ---------- 누른 자리 표시 ---------- */
const markMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0});
const mark=new THREE.Mesh(new THREE.CylinderGeometry(0.45,0.45,0.03,24),markMat);mark.position.y=0.05;scene.add(mark);let markT=0;
function showMark(x,z){mark.position.x=x;mark.position.z=z;mark.position.y=mode==="dwitsan"?sanH(x,z)+0.06:0.05;markT=0.6}
