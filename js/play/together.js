/* 같이 먹기: 평상에 이웃이 둘러앉아요
   - 우리 평상: 앉아서 "이웃 부르기"로 최대 3명을 불러요. 같이 먹으면 든든함이 더 차고, 이웃과 정이 쌓여요 (하루 한 번씩)
   - 이웃집 평상: 놀러 가서 평상을 누르면 집주인이 같이 앉아 음식을 내줘요 (하루 한 번). 남으면 싸 주셔요
   - 막걸리: 정자에서 한 병 사 와서 평상에서 "막걸리 따르기"로 소반에 올려요. 같이 마시면 "건배!" */

// 소반 둘레 손님 자리 (평상 기준) [x, z, 보는 방향]
const GUEST_SEATS=[[-0.45,-0.72,0],[0.45,-0.72,0],[-0.98,0.05,Math.PI/2]];
const GUEST_SAY={"옆집 할머니":["아이고 맛나다","손맛이 좋네. 많이 묵어라","우리 영감 살아 있을 때 생각나네"],"이장님":["허허, 맛있구먼","자네 솜씨가 많이 늘었어","이렇게 둘러앉으니 좋구먼"],
  "귀농 2년차":["와, 진짜 맛있어요!","저도 이거 배우고 싶어요","같이 먹으니까 더 맛있네요"]};
const CHEERS=["캬~ 시원하다!","건배! 우리 마을을 위하여!","한잔 더 하세. 허허"];
const npcByName=n=>npcs.find(p=>p.name===n);

function seatGuest(p,i){
  const [gx,gz,r]=GUEST_SEATS[i],legs=p.b.children[0];
  p.saved={pos:p.g.position.clone(),rot:p.g.rotation.y,vis:p.g.visible,stay:p.stay};
  p.g.visible=true;p.stay=true;p.moving=false;p.g.position.set(BENCH.x+gx,0,BENCH.z+gz);p.tx=p.g.position.x;p.tz=p.g.position.z;p.g.rotation.y=r;
  p.b.position.y=0.685-0.43;legs.scale.set(1.25,0.42,1.6);legs.position.set(0,0.435,0.12);if(p.label)p.label.visible=false}
function unseatGuest(p){const legs=p.b.children[0],s=p.saved;if(!s)return;
  p.b.position.y=0;legs.scale.set(1,1,1);legs.position.set(0,0.28,0);if(p.label)p.label.visible=true;
  p.g.position.copy(s.pos);p.tx=s.pos.x;p.tz=s.pos.z;p.g.rotation.y=s.rot;p.g.visible=s.vis;p.stay=s.stay;p.saved=null}
function unseatAll(){if(SIT&&SIT.guests){SIT.guests.forEach(unseatGuest);SIT.guests=[]}}

// 우리 평상: 이웃 부르기
function renderInvite(){
  const g=SIT.guests;let h=`<div class="sithead"><h2>이웃 부르기</h2><small>${g.length}/3명</small></div><p class="hint">소반에 둘러앉아 같이 먹어요. 같이 먹으면 든든함이 더 차고 정이 쌓여요.</p>`;
  NB.forEach(n=>{const here=g.some(p=>p.name===n.name);h+=`<div class="item"><div>${n.name}<small>${here?"평상에 앉아 있어요":"부르면 금방 와요"}</small></div><button class="${here?"":"go"}" data-inv="${n.name}" ${!here&&g.length>=3?"disabled":""}>${here?"보내기":"부르기"}</button></div>`});
  h+=`<div class="sitbtns"><button class="close go" id="invDone">다 됐어요</button></div>`;
  $("sitPanel").innerHTML=h;
  $("sitPanel").querySelectorAll("[data-inv]").forEach(b=>b.onclick=()=>{const p=npcByName(b.dataset.inv);if(!p)return;
    const k=g.indexOf(p);if(k>=0){unseatGuest(p);g.splice(k,1);toast(p.name+": 그럼 또 부르게. 잘 먹었네");}
    else{const free=[0,1,2].find(i=>!g.some(q=>q.seatI===i));p.seatI=free;seatGuest(p,free);g.push(p);sfx("pop");
      toast(p.name+": "+pickOne(["아이고 불러 줘서 고마워","뭘 이렇게 차렸어","마침 출출했는데 잘됐다"]))}
    renderInvite()});
  $("invDone").onclick=()=>renderSit();
}
// 같이 먹으면: 든든함 더 (한 명당 5), 하루 한 번씩 정 +1, 한마디
function togetherBonus(id){
  const g=SIT&&SIT.guests||[];if(!g.length)return "";
  S.full=Math.min(100,fullNow()+5*g.length);S.mealWith=S.mealWith||{};S.jeong=S.jeong||{};
  g.forEach(p=>{if(S.mealWith[p.name]!==today){S.mealWith[p.name]=today;S.jeong[p.name]=(S.jeong[p.name]||0)+1}});
  const p=pickOne(g),line=id==="makgeolli"?pickOne(CHEERS):pickOne(GUEST_SAY[p.name]||["맛있네요"]);
  setTimeout(()=>toast(p.name+": \""+line+"\""),1300);
  return "같이 먹으니 더 든든해요"}
// 막걸리 따르기: 한 병을 사발에 따라 소반에 올려요
function pourMakgeolli(){if(!(S.inv.makgeolli>0))return;if(S.dishes.length>=DISH_MAX){toast("소반이 꽉 찼어요");return}
  S.inv.makgeolli--;S.dishes.push("makgeolli");drawHomeTable();sfx("pour");save();refresh();toast("뽀얀 막걸리를 사발에 콸콸 따랐어요");renderSit()}

/* ---------- 이웃집 평상 ---------- */
SEATS.nbBench=Object.assign({},SEATS.home,{title:"이웃집 평상"});
function nbSitStart(){const n=visiting;if(!n)return;SIT.title=n.name+"네 평상";S.treatDay=S.treatDay||{};
  const host=npcByName(n.name);SIT.guests=[];if(host){host.seatI=0;seatGuest(host,0);SIT.guests.push(host)}
  if(S.treatDay[n.name]!==today){S.treatDay[n.name]=today;SIT.order.push(...(n.treat||[]));setTimeout(()=>toast(n.name+": \""+(n.treatSay||"먹고 가")+"\""),700)}
  else setTimeout(()=>toast(n.name+": \"오늘 건 다 먹었제. 내일 또 와\""),700)}
