/* 부뚜막 창과 살림 장부 창: 서로 다른 일을 하니까 모양도 따로예요
   - 부뚜막(마당): 요리 고르기만. 재료 있는 것부터, 재료가 몇 개 있는지 보여 줘요
   - 살림 장부(집 안 책상): 우리 집 살림 정리, 집·밭·닭장·외양간 짓고 넓히기, 체험용 버튼 (정식 공개 전에 빼기) */

const can=r=>Object.entries(r.need).every(([k,n])=>S.inv[k]>=n);
const needText=r=>Object.entries(r.need).map(([k,n])=>ITEMS[k].name+" "+n).join(" + ");
const inSeason=r=>!r.terms||r.terms.includes(termNow(new Date()));
// 부뚜막 요리 카드
function recipeListHtml(){
  const rain=weather.kind==="비";
  const seaOk=r=>Object.keys(r.need).some(k=>ITEMS[k].sea&&(S.inv[k]>0||seaToday(new Date()).includes(k)))||S.dex[r.id];
  const card=r=>{const ok=can(r);
    const chips=Object.entries(r.need).map(([k,n])=>`<span class="ing ${S.inv[k]>=n?"ok":"no"}">${ITEMS[k].name} ${S.inv[k]||0}/${n}</span>`).join("");
    const tip=r.terms?`<em>${r.when}에만</em>`:rain&&r.rain?`<em>비 오는 날엔 부침개가 당겨요</em>`:"";
    return `<div class="rc ${ok?"":"lack"}"><div class="rtop"><b>${r.name}</b>${S.dex[r.id]?'<span class="done">먹어봤어요</span>':""}</div><div class="ings">${chips}</div><small>${r.desc}</small>${tip}
      <button class="go" data-cook="${r.id}" ${ok?"":"disabled"}>${ok?"불 지피기":"재료가 모자라요"}</button></div>`};
  const land=RECIPES.filter(r=>!r.sea&&inSeason(r)),sea=RECIPES.filter(r=>r.sea&&seaOk(r));
  const yes=land.concat(sea).filter(can),no=land.concat(sea).filter(r=>!can(r));
  let h="";
  if(yes.length)h+=`<h3>지금 해 먹을 수 있어요</h3><div class="recipes">${yes.map(card).join("")}</div>`;
  else h+=`<p class="hint">재료가 없어요. 밭에서 거두거나 장터에서 사 와요.</p>`;
  if(no.length)h+=`<h3>재료가 모자라요</h3><div class="recipes">${no.map(card).join("")}</div>`;
  if(!sea.length)h+=`<p class="hint">바다 것 요리는 장터 생선 트럭에서 생선을 사 오면 생겨요. 고기 요리는 정육점에서 고기를 사 와요.</p>`;
  return h}
function bindCook(atStove){sheet.querySelectorAll("[data-cook]").forEach(b=>b.onclick=()=>{closeSheet();atStove?startCook(b.dataset.cook):goCook(b.dataset.cook)})}

/* ---------- 살림 장부 ---------- */
function openKitchen(){
  const d=new Date(),lv=S.houseLv||1,L=HOUSE_LV[lv-1],nx=HOUSE_LV[lv],cols=S.fieldCols||3,fu=UPG.field[cols+1];
  const cL=S.coopLv||0,cN=COOP_LV[cL+1],bL=S.barnLv||0,bN=BARN_LV[bL+1];
  const invN=Object.keys(ITEMS).reduce((a,k)=>a+(S.inv[k]||0),0);
  let h=`<div class="lhead"><h2>살림 장부</h2><small>${d.getFullYear()}년 ${fmtDay(d)} · ${termNow(d)} 무렵</small></div>`;
  h+=`<h3>우리 집 살림</h3><div class="ltab">
    <span>가진 돈</span><b>${S.money.toLocaleString()}원</b><span>집</span><b>${L.name}</b><span>밭</span><b>${cols*3}칸</b>
    <span>닭장</span><b>${cL?COOP_LV[cL].name+" · 닭 "+S.hens+"/"+coopMax()+"마리":"없음"}</b>
    <span>외양간</span><b>${bL?BARN_LV[bL].name+" · 소 "+herdCount("cow")+" · 염소 "+herdCount("goat"):"없음"}</b>
    <span>창고</span><b>${invN}개</b></div>`;
  const row=(name,sub,cost,id,done)=>`<div class="lrow"><div>${name}<small>${sub}</small></div>${done?`<span class="done">${done}</span>`:`<span class="cost">${cost.toLocaleString()}원</span><button class="go" data-up="${id}" ${S.money>=cost?"":"disabled"}>${id==="coop"&&!cL||id==="barn"&&!bL?"짓기":"넓히기"}</button>`}</div>`;
  h+=`<h3>짓고 넓히기</h3>`;
  h+=nx?row(josa(nx.name,"으로","로")+" 넓히기","방도 넓어지고 살림이 늘어요",nx.cost,"house"):row("집","마을에서 제일 큰 집",0,"",'다 지었어요');
  h+=fu?row(fu.n,"밭 3칸이 늘어나요",fu.cost,"field"):row("밭","15칸",0,"","다 넓혔어요");
  h+=cN?row(cL?"닭장 넓히기":"닭장 짓기",cL?"닭 "+cN.max+"마리까지":"집 아래쪽 빈 땅에 · 닭은 장터 닭집에서 사 와요",cN.cost,"coop"):row("닭장","닭 "+coopMax()+"마리까지",0,"","다 넓혔어요");
  h+=bN?row(bL?"외양간 넓히기":"외양간 짓기",(bL?"":"닭장 왼쪽에 · ")+"소 "+bN.cow+"마리, 염소 "+bN.goat+"마리까지",bN.cost,"barn"):row("외양간","소 4마리, 염소 4마리",0,"","다 넓혔어요");
  h+=`<p class="hint">요리는 마당 부뚜막에서 · 닭은 장터 닭집 아저씨 · 송아지와 새끼 염소는 우시장 소장수 아저씨</p>`;
  h+=`<h3>체험용 · 정식 공개 전에 빼기</h3><div class="cheats"><button id="chReset">처음부터 (기록 지우기)</button>
    <button id="tlapse">하루 빨리 보기</button><button id="cheat">+1,000원</button><button data-storm="heavy">1분 반 뒤 큰비</button><button data-storm="typhoon">1분 반 뒤 태풍</button><button data-storm="frost">1분 반 뒤 서리</button><button id="sndTest">밤 소리 들어 보기</button></div>`;
  openSheet(h);sheet.classList.add("ledger");
  sheet.querySelectorAll("[data-up]").forEach(b=>b.onclick=()=>{const t=b.dataset.up;let msg="";
    if(t==="house"){S.money-=nx.cost;S.houseLv=lv+1;applyHouse();msg=josa(nx.name,"으로","로")+" 넓혔어요!";
      if(inHouse){buildRoom();const [x,z]=HOUSE_IN==="main"?deskStand():doorStand();me.g.position.set(x,0,z);me.tx=x;me.tz=z;msg+=" 방도 넓어졌어요"}}
    if(t==="field"){S.money-=fu.cost;S.fieldCols=cols+1;msg="밭이 넓어졌어요. 새 칸에 씨앗을 심어보세요"}
    if(t==="coop"){S.money-=cN.cost;S.coopLv=cL+1;if(!cL){S.coop=true;S.hens=S.hens||0;S.eggT=Date.now();msg="닭장을 지었어요! 장터 닭집 아저씨한테 닭을 사 와요"}else msg="닭장을 넓혔어요. 닭집 아저씨한테 닭을 더 사 와요"}
    if(t==="barn"){S.money-=bN.cost;S.barnLv=bL+1;msg=bL?"외양간을 넓혔어요":"외양간을 지었어요! 우시장에서 송아지를 데려와요"}
    sfx("coin");save();applyLand();refresh();openKitchen();toast(msg)});
  $("tlapse").onclick=()=>{closeSheet();startTimelapse()};
  $("cheat").onclick=()=>{S.money+=1000;save();refresh();openKitchen()};
  $("chReset").onclick=askReset;
  $("sndTest").onclick=()=>{closeSheet();soundTest()};
  sheet.querySelectorAll("[data-storm]").forEach(b=>b.onclick=()=>{closeSheet();testStorm(b.dataset.storm)});
}
