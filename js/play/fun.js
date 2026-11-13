/* 요리하는 재미 · 일하는 재미 (2026-11-13)
   요리: ① 솜씨 별점(★1~3, 요리마다 최고 별점·몇 번 했는지) ② 손맛 숙련도(별을 모을수록 등급↑, 뒤집기·뜸 들이기 초록 칸이 넓어져요)
         ③ 오늘의 부탁(이웃 한 명이 먹고 싶은 요리 하나, ★★ 이상으로 만들면 싸서 보내 드리고 사례·정)
   일: ① 연속 깔끔(밭일 손동작을 잘하면 연속이 쌓이고, 세 번마다 정성 보너스) ② 좋은 농기구(씨앗가게: 튼튼한 호미 · 큰 물뿌리개)
   숫자는 FUN */
const FUN={reqPay:150,reqStar:50,homi:600,mul:500};
const COOK_LV=[{xp:0,name:"부엌 초보"},{xp:12,name:"손맛 새내기"},{xp:40,name:"동네 손맛"},{xp:90,name:"마을 맛집"},{xp:180,name:"손맛 명인"}];
const cookLv=()=>tierOf(COOK_LV,(S.skill||{}).cook||0);
const starsOf=sk=>sk>=0.9?3:sk>=0.7?2:1;
const starTxt=n=>"★".repeat(n)+"☆".repeat(3-n);

/* ---------- 오늘의 부탁 ---------- */
const REQ_WHO=["옆집 할머니","이장님","귀농 2년차"];
function todayReq(){const d=dayKey(new Date());if(S.cookReq&&S.cookReq.d===d)return S.cookReq;
  // 재료가 있거나 해 본 요리 중에서 (없으면 감자전)
  const pool=RECIPES.filter(r=>!r.terms&&!r.sea&&(can(r)||S.dex[r.id]));const r=pool.length?pickOne(pool):RECIPES.find(x=>x.id==="jeon");
  S.cookReq={d,id:r.id,who:pickOne(REQ_WHO),done:false};save();return S.cookReq}
function reqHtml(){const q=todayReq(),r=RECIPES.find(x=>x.id===q.id);if(!r)return "";
  return `<div class="cookreq ${q.done?"done":""}"><b>오늘의 부탁</b> · ${q.who}: "${r.name} 먹고 싶네…" ${q.done?"<em>보내 드렸어요 ✓</em>":`<small>★★ 이상으로 만들면 싸서 보내 드려요 · 사례 ${FUN.reqPay}원~ · 정 +1</small>`}</div>`}

/* ---------- 부뚜막 창: 부탁 + 요리마다 최고 별점 ---------- */
{const os=openStove;openStove=function(){os();const h=sheet.querySelector(".stovehead");if(h){h.insertAdjacentHTML("afterend",reqHtml()+`<p class="hint cooklv">손맛 숙련도: <b>${COOK_LV[cookLv()].name}</b> · 별을 모을수록 올라가요${cookLv()?" · 뒤집기·뜸 들이기 초록 칸이 넓어졌어요":""}</p>`)}}}
{const bc=bindCook;bindCook=function(atStove){bc(atStove);const q=S.cookReq&&S.cookReq.d===dayKey(new Date())?S.cookReq:null;
  sheet.querySelectorAll("[data-cook]").forEach(b=>{const id=b.dataset.cook,top=b.closest(".rc")&&b.closest(".rc").querySelector(".rtop");if(!top)return;
    const best=(S.cookStars||{})[id];if(best)top.insertAdjacentHTML("beforeend",`<span class="stars" title="최고 솜씨">${starTxt(best)}</span>`);
    if(q&&!q.done&&q.id===id)top.insertAdjacentHTML("beforeend",`<span class="reqtag">부탁</span>`)})}}

/* ---------- 요리 시작: 숙련도만큼 초록 칸 넓게 ---------- */
const FLIP0=FLIP_ZONE.slice();
{const sc=startCook;startCook=function(id){const w=cookLv()*0.025;FLIP_ZONE[0]=FLIP0[0]-w;FLIP_ZONE[1]=Math.min(0.95,FLIP0[1]+w);sc(id)}}
/* ---------- 요리 끝: 별점, 기록, 부탁 ---------- */
{const fc=finishCook;finishCook=function(){if(!CK)return fc();const id=CK.id,r=CK.r,ok=can(r),n=starsOf(avg(CK.scores));fc();if(!ok)return;
  S.cookStars=S.cookStars||{};S.cookN=S.cookN||{};const best=S.cookStars[id]||0;S.cookStars[id]=Math.max(best,n);S.cookN[id]=(S.cookN[id]||0)+1;
  skillUp("cook",COOK_LV,n,"요리");
  let msg=`솜씨 ${starTxt(n)}`+(n>best&&best?" · 최고 기록!":n===3&&!best?" · 처음부터 최고 솜씨!":"")+` · ${r.name} ${S.cookN[id]}번째`;
  const q=S.cookReq;
  if(q&&q.d===dayKey(new Date())&&!q.done&&q.id===id){
    if(n>=2){q.done=true;const pay=FUN.reqPay+FUN.reqStar*(n-2);S.money+=pay;S.jeong=S.jeong||{};S.jeong[q.who]=(S.jeong[q.who]||0)+1;setHold(null);
      msg+=` · ${q.who}께 싸서 보내 드렸어요! "아이고 맛있겠다~" 사례 ${pay}원 · 정 +1`;sfx("coin")}
    else msg+=` · 부탁은 ★★ 이상이어야 보내 드려요. 한 번 더 해 봐요`}
  save();refresh();setTimeout(()=>toast(msg),1600)}}

/* ---------- 밭일: 연속 깔끔 ---------- */
{const sd=stepDone;stepDone=function(score){if(W){S.combo=S.combo||0;
    if(score>=0.88){S.combo++;const c=wp(0,0.3,0);
      if(S.combo>=3&&S.combo%3===0){W.scores.push(1);sweat(1);setTimeout(()=>wPop(c.x,c.y-10,"연속 "+S.combo+"! 정성 +"),250);buzz([15,40,15])}
      else if(S.combo>=2)setTimeout(()=>wPop(c.x,c.y-10,"연속 "+S.combo),250)}
    else{if(S.combo>=3){const c=wp(0,0.3,0);setTimeout(()=>wPop(c.x,c.y-10,"연속 끊김…"),250)}S.combo=0}
    if(S.combo>(S.comboBest||0))S.comboBest=S.combo}
  sd(score);if(W&&W.kind!=="harvest"&&S.combo>=2)$("wCare").textContent+=" · 연속 "+S.combo}}

/* ---------- 좋은 농기구 ---------- */
// 튼튼한 호미: 밭 갈기·흙 덮기·호미로 캐기 한 번 덜 · 큰 물뿌리개: 물 주기 초록 칸 넓게
{const ns=nextStep;nextStep=function(){ns();if(!W)return;const s=W.steps[W.si],st=W.st,T=S.tools||{};if(!s)return;
  if(T.homi&&(s==="till"||s==="dig"||(s==="cover"&&gest(s)==="cover"))&&st.need>1){st.need--;guide()}
  if(T.mul&&s==="water"&&st.z){st.z=[Math.max(0.3,st.z[0]-0.06),Math.min(0.95,st.z[1]+0.06)];$("wZone").style.left=st.z[0]*100+"%";$("wZone").style.width=(st.z[1]-st.z[0])*100+"%"}}}
{const so=SHOPS.seed.open;SHOPS.seed.open=line=>{so(line);const g=sheet.querySelector(".goods");if(!g)return;const T=S.tools||{};
  const row=(k,name,desc,price)=>goods(name,desc+(T[k]?" · 가지고 있어요":` · ${price.toLocaleString()}원`),T[k]?`<button disabled>있어요</button>`:`<button class="go" data-tool="${k}" ${S.money>=price?"":"disabled"}>사기</button>`);
  g.insertAdjacentHTML("beforeend",`<h3 class="toolh">농기구</h3>`+row("homi","튼튼한 호미","날이 잘 서서 밭 갈기·흙 덮기·캐기가 한 번씩 덜",FUN.homi)+row("mul","큰 물뿌리개","물이 고르게 나와 물 주기 초록 칸이 넓어요",FUN.mul));
  sheet.querySelectorAll("[data-tool]").forEach(b=>b.onclick=()=>{const k=b.dataset.tool,p=FUN[k];if(S.money<p)return;S.money-=p;S.tools=Object.assign({},S.tools,{[k]:1});sfx("coin");save();refresh();
    SHOPS.seed.open(k==="homi"?"요 호미 하나면 밭일이 한결 수월할 겨":"물뿌리개 큰 걸로 골랐구먼. 물이 고루 퍼져")})}}
