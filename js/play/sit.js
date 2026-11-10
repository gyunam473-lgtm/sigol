/* 앉기: 마당 평상이나 장터 정자에 앉으면 내 캐릭터가 소반 앞에 앉은 모습을 뒤쪽 위에서 봐요 (3인칭).
   상 위 음식을 누르면 그 음식 가까이 카메라가 다가가요. 빈 곳을 누르거나 "돌아가기"면 다시 멀어져요.
   평상: 부엌에서 만든 음식이 소반에 올라와 있어요. 하나씩 먹어요.
   정자: 상 위 차림표에서 음식을 시켜 먹어요. 남기면 싸 와서 우리 평상에 올려 둬요.
   먹은 음식은 도감의 "밥상 일기"에 날짜·장소·날씨와 함께 적혀요. */

const DISH_MAX=8; // 평상 소반(찬장)에 둘 수 있는 음식 수
// seat 앉는 자리(방석), cam 카메라(오른쪽 옆 위: 나와 소반이 나란히 보여요), look 바라보는 곳.
// 바라보는 곳을 소반보다 조금 아래로 둬서, 소반이 아래 창에 가리지 않고 화면 위쪽에 보여요
const SEATS={
  home:{title:"우리 집 평상",stand:[BENCH.x,BENCH.z+BENCH.D/2+0.75],seat:new THREE.Vector3(BENCH.x,0.685,BENCH.z+0.5),
    cam:new THREE.Vector3(BENCH.x+3.9,3.9,BENCH.z-0.1),look:new THREE.Vector3(BENCH.x-0.3,-0.3,BENCH.z-0.7),table:()=>homeTable},
  plaza:{title:"장터 정자",stand:[6,5.95],seat:new THREE.Vector3(6,0.7,4.1),
    cam:new THREE.Vector3(10.4,3.2,3.9),look:new THREE.Vector3(5.6,-0.7,3.6),table:()=>pavTable}};
Object.assign(SEATS,TABLE_SEATS); // 장터 먹거리 천막·평상 자리 (world/places3.js)
let SIT=null; // 지금 앉아 있는 곳 (없으면 null)

// 앉은 자세: 몸을 방석 높이로 내리고 다리를 앞으로 접어요 (양반다리)
function sitPose(on){const legs=me.b.children[0];
  if(on){me.b.position.y=SIT.seat.y-0.43;legs.scale.set(1.25,0.42,1.6);legs.position.set(0,0.435,0.12)}
  else{me.b.position.y=0;legs.scale.set(1,1,1);legs.position.set(0,0.28,0)}}
// 지금 카메라 자리: 하늘 보기 / 음식 가까이 / 기본(3인칭)
function sitView(){const s=SIT;if(EA)return [EA.cam,EA.look];if(s.sky)return [s.skyCam,s.skyLook];if(s.focus)return [s.focus.cam,s.focus.look];if(ORB)return orbitCam();return [s.cam,s.look]}

function sitDown(place){
  const s=SEATS[place]||freeSeat(place);SIT=Object.assign({place,order:[],focus:null,guests:[]},s);
  if(place==="plaza")makeMenuBoard();
  if(S.hold&&!s.free){if(place==="home")putDownHome();else{SIT.order.push(S.hold);toast("들고 온 "+josa(dishName(S.hold),"을","를")+" 상에 올렸어요");setHold(null)}}
  me.g.position.set(s.seat.x,0,s.seat.z);me.tx=s.seat.x;me.tz=s.seat.z;me.moving=false;
  if(s.free)me.g.rotation.y=s.face; // 상 없는 자리: 정해진 쪽을 봐요
  else{const t=s.table().getWorldPosition(new THREE.Vector3());me.g.rotation.y=Math.atan2(t.x-s.seat.x,t.z-s.seat.z)} // 소반 쪽을 보고 앉아요
  sitPose(true);
  // 둘레에 있던 동네 사람은 비켜 줘요 (카메라 앞을 가리지 않게)
  npcs.forEach(n=>{if(n.stay||!n.g.visible)return;const p=n.g.position,near=q=>Math.hypot(p.x-q.x,p.z-q.z)<5;if(near(s.seat)||near(s.cam)){
    const W=(PLACES[mode]&&PLACES[mode].way)||WAY,far=W.filter(w=>Math.hypot(w[0]-s.seat.x,w[1]-s.seat.z)>=5&&Math.hypot(w[0]-s.cam.x,w[1]-s.cam.z)>=4);const w=far[Math.floor(Math.random()*far.length)]||[8,8];
    p.set(w[0],0,w[1]);n.tx=w[0];n.tz=w[1];n.moving=false;n.wait=3}});
  // 앉은 자리 둘레와 눈앞의 이름표("나", "평상" …)는 잠깐 숨겨요
  SIT.hidLabels=[];scene.traverse(o=>{if(o.isSprite&&o.visible&&o.parent!==skyG){const p=new THREE.Vector3();o.getWorldPosition(p);if(p.distanceTo(s.cam)<4||Math.hypot(p.x-s.seat.x,p.z-s.seat.z)<3.5){o.visible=false;SIT.hidLabels.push(o)}}});
  document.querySelector(".top").hidden=true;document.querySelector(".bottom").hidden=true;$("sit").hidden=false;
  // 우리 평상: 집 쪽으론 안 돌아가요
  const yard=place==="home"||place==="nbBench";
  if(s.free)orbitStart(s.cam,s.look,s.block,s.yaw);else orbitStart(s.cam,s.look,yard?[house,stove,myBarn]:s.block||[pav],yard?[-1.7,0.6]:null);
  if(place==="nbBench")nbSitStart();sfx("pop");renderSit();
}
function standUp(){
  if(!SIT)return;cancelEat();if(SIT.cupMesh){SIT.cupMesh.parent.remove(SIT.cupMesh);SIT.cupMesh=null}let msg="";if(SIT.sky)lookSky(false);unseatAll();
  if(SIT.order.length){const room=DISH_MAX-S.dishes.length,keep=SIT.order.slice(0,Math.max(0,room));
    S.dishes.push(...keep);if(!visiting)drawHomeTable();msg=keep.length?(SIT.place==="nbBench"?"남은 음식은 싸 주셨어요. 우리 평상에서 먹어요":"남은 음식은 싸 왔어요. 우리 평상에서 먹을 수 있어요"):"평상 소반이 꽉 차서 남은 음식은 두고 왔어요"}
  if(SIT.place==="nbBench")drawDishes(homeTable,[]);
  if(!SIT.free&&SIT.place!=="home"&&SIT.place!=="nbBench")drawDishes(SIT.table(),[]);
  SIT.hidLabels.forEach(o=>o.visible=true);
  sitPose(false);const [x,z]=SIT.stand;me.g.position.set(x,0,z);me.tx=x;me.tz=z;
  SIT=null;orbitStop();$("sit").hidden=true;document.querySelector(".top").hidden=false;document.querySelector(".bottom").hidden=false;
  save();refresh();if(msg)toast(msg);
}

function renderSit(){
  if(SIT.sky){$("sitPanel").innerHTML=`<div class="sithead"><h2>하늘 보는 중</h2><small>${weather.kind} · ${timeLabel(hourNow())}</small></div><p class="hint">${skyNote()}</p><button class="close" id="skyOff">그만 보기</button>`;$("skyOff").onclick=()=>lookSky(false);return}
  if(SIT.free)return renderFreeSit();
  const s=SIT,home=s.place==="home",nb=s.place==="nbBench",dishes=home?S.dishes:s.order,tm=timeLabel(hourNow());
  if(s.focus){const k=s.focus.k,id=dishes[k];
    if(id){$("sitPanel").innerHTML=`<div class="sithead"><h2>${dishName(id)}</h2><small>${s.title}</small></div><p class="hint">${dishDesc(id)}</p><div class="sitbtns"><button class="close" id="backBtn">돌아가기</button><button class="close go" id="eatBtn">먹기</button></div>`;
      $("backBtn").onclick=()=>focusDish(null);$("eatBtn").onclick=()=>eat(k);return}
    s.focus=null}
  let h=`<div class="sithead"><h2>${s.title}</h2><small>${weather.kind} · ${tm}${s.guests.length?" · "+s.guests.map(p=>p.name).join(", ")+"와 함께":""}</small></div>`;
  if(!home&&!nb){
    h+=`<div class="menuboard"><h3>차림표</h3>`;
    (s.menu==="jang"?JANG_FOOD.concat(MARKET_FOOD):MARKET_FOOD).forEach(f=>{h+=`<div class="mrow"><div>${f.name}<small>${f.desc}</small></div><span>${f.price}원</span><button data-order="${f.id}" ${S.money>=f.price&&s.order.length<4?"":"disabled"}>시키기</button>${f.bottle?`<button data-bottle="${f.id}" ${S.money>=f.price?"":"disabled"}>한 병 사 가기</button>`:""}</div>`});
    h+=`</div>`;
  }
  h+=`<h3>${home?"소반 위":"상 위"}</h3>`;
  if(!dishes.length)h+=`<p class="hint">${home?"소반이 비었어요. 부뚜막에서 요리해 들고 오면 올려져요.":nb?"상이 비었어요. 들고 온 음식이 있으면 같이 나눠 먹어요.":"차림표에서 먹고 싶은 걸 시켜 보세요."}</p>`;
  dishes.forEach((id,k)=>{h+=`<div class="item"><div ${k<4?`class="look" data-look="${k}"`:""}>${dishName(id)}${k<4?"<small>눌러서 가까이 보기</small>":""}</div><button class="go" data-eat="${k}">먹기</button></div>`});
  if(home&&dishes.length>4)h+=`<p class="hint">소반엔 네 접시까지 보여요. 나머지 ${dishes.length-4}접시는 찬장에 있어요.</p>`;
  if(home&&S.inv.makgeolli>0)h+=`<div class="item"><div>막걸리 한 병<small>${S.inv.makgeolli}병 있어요 · 사발에 따라 소반에 올려요</small></div><button id="pourBtn">따르기</button></div>`;
  h+=`<div class="sitbtns">${home?`<button class="close" id="invBtn2">이웃 부르기${s.guests.length?" ("+s.guests.length+")":""}</button>`:""}<button class="close" id="skyBtn">하늘 보기</button><button class="close" id="standBtn">일어나기</button></div>`;
  const p=$("sitPanel");p.innerHTML=h;
  p.querySelectorAll("[data-order]").forEach(b=>b.onclick=()=>order(b.dataset.order));
  p.querySelectorAll("[data-bottle]").forEach(b=>b.onclick=()=>{const f=MARKET_FOOD.find(x=>x.id===b.dataset.bottle);if(S.money<f.price)return;S.money-=f.price;S.inv.makgeolli=(S.inv.makgeolli||0)+1;sfx("coin");save();refresh();toast("막걸리 한 병 샀어요. 집 평상에서 이웃이랑 나눠 마셔요");renderSit()});
  if($("invBtn2"))$("invBtn2").onclick=renderInvite;if($("pourBtn"))$("pourBtn").onclick=pourMakgeolli;
  p.querySelectorAll("[data-eat]").forEach(b=>b.onclick=()=>eat(+b.dataset.eat));
  p.querySelectorAll("[data-look]").forEach(b=>b.onclick=()=>focusDish(+b.dataset.look));
  $("standBtn").onclick=standUp;$("skyBtn").onclick=()=>lookSky(true);
  drawDishes(s.table(),dishes);
}
// 음식 가까이 보기: 상 위 음식을 누르면 카메라가 그 접시 앞으로 다가가요
function focusDish(k){if(!SIT)return;
  const d=k==null?null:SIT.table().userData.dishG.children.find(m=>m.userData.dishK===k);
  if(!d){SIT.focus=null;renderSit();return}
  const p=d.getWorldPosition(new THREE.Vector3()),dir=SIT.cam.clone().sub(p).setY(0).normalize();
  SIT.focus={k,cam:p.clone().addScaledVector(dir,0.6).add(new THREE.Vector3(0,0.85,0)),look:p.clone().addScaledVector(dir,-0.1).add(new THREE.Vector3(0,-0.3,0))};
  sfx("pop");renderSit()}
const dishDesc=id=>(anyFood(id)||{desc:""}).desc;
canvas.addEventListener("click",e=>{ // 앉아 있을 때 상 위 음식 누르기
  if(!SIT||SIT.sky||SIT.free)return;
  const r=canvas.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
  ray.setFromCamera(ndc,camera);const hit=ray.intersectObjects(SIT.table().userData.dishG.children,true)[0];
  let o=hit&&hit.object;while(o&&o.userData.dishK===undefined)o=o.parent;
  if(o)focusDish(o.userData.dishK);else if(SIT.focus)focusDish(null)});
// 하늘 보기: 평상·정자에 앉아서 고개를 들어요. 밤엔 달과 별, 낮엔 하늘색
function lookSky(on){if(!SIT)return;SIT.sky=on;$("camctl").hidden=on;
  if(on){const c=SIT.seat.clone().add(new THREE.Vector3(0,1.3,0.9));SIT.skyCam=c;SIT.skyLook=c.clone().add(MOON_DIR.clone().multiplyScalar(20));
    SIT.skyHid=[];scene.traverse(o=>{if(o.isSprite&&o.visible&&o.parent!==skyG){o.visible=false;SIT.skyHid.push(o)}})} // 하늘 볼 땐 이름표 숨기기
  else if(SIT.skyHid){SIT.skyHid.forEach(o=>o.visible=true);SIT.skyHid=null}
  sfx("pop");renderSit()}
function skyNote(){const n=skyNow.night,clear=weather.kind==="맑음";
  if(!clear)return weather.kind==="비"?"비가 와서 하늘이 잿빛이에요. 빗소리가 좋네요.":weather.kind==="눈"?"하늘에서 눈이 내려요.":"구름이 잔뜩 꼈어요.";
  if(n<0.3)return "해 지는 시간은 "+fmtH(skyNow.set)+"쯤이에요.";
  const p=moonP,m=p<0.03||p>0.97?"오늘은 달이 안 보이는 그믐이에요. 대신 별이 많아요.":p<0.22?"가느다란 초승달이 떴어요.":p<0.28?"반달(상현달)이 떴어요.":p<0.47?"달이 차오르고 있어요.":p<0.53?"동그란 보름달이 떴어요.":p<0.72?"보름 지나 달이 기울고 있어요.":p<0.78?"반달(하현달)이 떴어요.":"새벽녘 그믐달이 떴어요.";
  return m}
// 상 없는 자리: 쉬기, 하늘 보기, 들고 온 음식 먹기, (책상 앞이면) 살림 장부
function renderFreeSit(){
  const s=SIT,outdoor=s.where!=="room";
  let h=`<div class="sithead"><h2>${s.title}</h2><small>${weather.kind} · ${timeLabel(hourNow())}</small></div><p class="hint">${s.note}</p>`;
  if(s.dabang){if(s.cup)h+=`<div class="item"><div>${dishName(s.cup)}<small>사장님이 갖다주셨어요 · 김이 모락모락</small></div><button class="go" id="drinkCup">마시기</button></div>`;
    else{h+='<h3>차림표 · 시키면 갖다드려요</h3>';DABANG_MENU.forEach(f=>{h+=`<div class="item"><div>${f.name}<small>${f.price}원 · ${f.desc}</small></div><button class="go" data-tea="${f.id}" ${S.money>=f.price?"":"disabled"}>시키기</button></div>`})}}
  if(S.hold)h+=`<div class="item"><div>${dishName(S.hold)}<small>들고 온 음식 · 여기서 먹어도 돼요</small></div><button class="go" id="eatHold">먹기</button></div>`;
  if(s.id==="maru")h+=`<div class="item"><div>짚공예<small>볏짚 ${S.inv.jip||0}단 · 새끼줄·짚신·소쿠리·멍석</small></div><button class="go" id="jipBtn">하기</button></div>`;
  h+=`<div class="sitbtns">${s.ledger?'<button class="close" id="ledgerBtn">살림 장부 펴기</button>':""}${outdoor?'<button class="close" id="skyBtn">하늘 보기</button>':""}<button class="close go" id="upBtn2">일어나기</button></div>`;
  $("sitPanel").innerHTML=h;
  if($("eatHold"))$("eatHold").onclick=()=>{if(EA)return;const id0=S.hold,tmp=dish3D(id0);tmp.position.copy(me.g.localToWorld(new THREE.Vector3(0,me.b.position.y+0.95,0.42)));scene.add(tmp);if(holdMesh)holdMesh.visible=false;
    playEat({dish:tmp,id:id0,onDone:()=>{scene.remove(tmp);eatHoldNow()}})};
  function eatHoldNow(){const id=S.hold,name=dishName(id),d=new Date();S.meals=S.meals||[];
    S.meals.unshift({d:(d.getMonth()+1)+"월 "+d.getDate()+"일",n:name,at:s.title,w:weather.kind});S.meals.length=Math.min(S.meals.length,30);
    const extra=nourish(id);setHold(null);sfx("pop");buzz(15);toast(josa(name,"을","를")+" 맛있게 먹었어요"+(extra?" · "+extra:""));save();refresh();renderFreeSit()}
  if($("ledgerBtn"))$("ledgerBtn").onclick=openKitchen;
  if($("jipBtn"))$("jipBtn").onclick=openJipCraft;
  $("sitPanel").querySelectorAll("[data-tea]").forEach(b=>b.onclick=()=>{const f=DABANG_MENU.find(x=>x.id===b.dataset.tea);if(S.money<f.price)return;S.money-=f.price;s.cup=f.id;sfx("coin");save();refresh();
    const m=dish3D(f.id);m.position.set(...s.cupAt);dabang.add(m);s.cupMesh=m;toast("다방 사장님: \""+pickOne(["뜨거우니까 조심해요","설탕 하나 더 넣었어","오늘 날씨 좋지? 천천히 마시고 가"])+"\"");renderFreeSit()});
  if($("drinkCup"))$("drinkCup").onclick=()=>{if(EA)return;playEat({dish:s.cupMesh,id:s.cup,onDone:drinkNow})};
  function drinkNow(){const id=s.cup;nourish(id);s.cup=null;if(s.cupMesh){dabang.remove(s.cupMesh);s.cupMesh=null}sfx("pop");save();refresh();
    toast(dishName(id)+" 한 잔 "+pickOne(["후루룩, 몸이 녹네요","향이 좋아요. 마음이 느긋해져요","달달하니 기운이 나요"]));renderFreeSit()}
  if($("skyBtn"))$("skyBtn").onclick=()=>lookSky(true);
  $("upBtn2").onclick=()=>standUp();
}
function order(id){
  const f=(SIT.menu==="jang"?JANG_FOOD.concat(MARKET_FOOD):MARKET_FOOD).find(x=>x.id===id);if(!f||S.money<f.price||SIT.order.length>=4)return;
  S.money-=f.price;SIT.order.push(id);sfx("coin");toast(josa(f.name,"이","가")+" 나왔어요");save();renderSit();
}
// 먹기: 먼저 먹는 모습(play/eatanim.js)을 보여 주고 나서 든든함을 채워요
function eat(k){if(EA||!SIT)return;const list=SIT.place==="home"?S.dishes:SIT.order,mesh=SIT.table().userData.dishG.children.find(m=>m.userData.dishK===k);
  playEat({dish:mesh,id:list[k],onDone:()=>eatNow(k)})}
function eatNow(k){if(!SIT)return;
  const home=SIT.place==="home",list=home?S.dishes:SIT.order,id=list[k],name=dishName(id);
  list.splice(k,1);if(home)drawHomeTable();SIT.focus=null;
  const d=new Date();S.meals=S.meals||[];
  S.meals.unshift({d:(d.getMonth()+1)+"월 "+d.getDate()+"일",n:name,at:SIT.title,w:weather.kind});S.meals.length=Math.min(S.meals.length,30);
  const extra=nourish(id),tog=togetherBonus(id);
  sfx("pop");buzz(15);toast(josa(name,"을","를")+" "+(id==="makgeolli"?"쭉 들이켰어요":DRINKS.includes(id)?"시원하게 마셨어요":"맛있게 먹었어요")+(tog?" · "+tog:"")+(extra?" · "+extra:""));save();refresh();renderSit();
}

/* ---------- 서서 하늘 보기 (오른쪽 위 "하늘 보기" 단추) ---------- */
let SKYV=null;
function standSky(on){
  if(on){if(inHouse){toast("집 안에선 하늘이 안 보여요. 마당에 나가서 봐요");return}if(SIT||W||CK||PD||FS||LIE)return;
    const p=me.g.position,c=new THREE.Vector3(p.x,p.y+1.75,p.z+0.4),d=sun.position.clone().normalize();d.y=Math.max(0.35,d.y*0.8);d.normalize(); // 낮엔 해, 밤엔 달 쪽
    SKYV={cam:c,look:c.clone().addScaledVector(d,20),hid:[]};me.moving=false;me.tx=p.x;me.tz=p.z;pending=null;
    scene.traverse(o=>{if(o.isSprite&&o.visible&&o.parent!==skyG){o.visible=false;SKYV.hid.push(o)}});me.g.visible=false;
    document.querySelector(".top").hidden=true;document.querySelector(".bottom").hidden=true;$("sit").hidden=false;$("camctl").hidden=true;
    $("sitPanel").innerHTML=`<div class="sithead"><h2>하늘 보는 중</h2><small>${weather.kind} · ${timeLabel(hourNow())}</small></div><p class="hint">${skyNote()}</p><button class="close go" id="skyStop">그만 보기</button>`;
    $("skyStop").onclick=()=>standSky(false);sfx("pop")}
  else if(SKYV){SKYV.hid.forEach(o=>o.visible=true);SKYV=null;me.g.visible=true;$("sit").hidden=true;document.querySelector(".top").hidden=false;document.querySelector(".bottom").hidden=false}
}
