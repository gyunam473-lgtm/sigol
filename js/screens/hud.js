/* 화면 위아래 정보칸(돈, 씨앗, 창고, 위쪽 버튼)과 아래에서 올라오는 창 열고 닫기 */

const sheet=$("sheet");
function openSheet(html){sheet.className="sheet";sheet.innerHTML=html+'<button class="close" id="closeBtn">닫기</button>';$("modal").hidden=false;$("closeBtn").onclick=closeSheet}
function closeSheet(){$("modal").hidden=true}
$("modal").addEventListener("click",e=>{if(e.target.id==="modal")closeSheet()});

function refresh(){
  $("money").textContent=S.money.toLocaleString()+"원";
  {const [a,b]=typeof dexTotal==="function"?dexTotal():[Object.keys(S.dex).length,RECIPES.length];$("dexBtn").textContent="도감 "+a+"/"+b}
  $("brand").textContent=PLACES[mode]?PLACES[mode].name:visiting?visiting.name+"네":inHouse?(HOUSE_IN==="sarang"?"사랑채":"우리 집 안"):"우리 땅";
  $("homeBtn").hidden=mode==="home";$("fishBtn").hidden=mode!=="stream";$("mapBtn").hidden=inHouse;mapBtnTip();
  $("hint").textContent=PLACES[mode]?PLACES[mode].hint:visiting?"마른 밭에 물을 주면 품앗이가 돼요. 집을 누르면 선물을 두고 와요.":"빈 밭엔 씨앗을, 논엔 모를 심어요. 집 뒤 땔감 숲에서 나무를 해요. 장터·뒷산 같은 곳은 오른쪽 아래 '마을 지도'로 가요.";
  if(inHouse)$("hint").textContent=HOUSE_IN==="sarang"?"사랑방이에요 · 가구는 목공소에서 · 댓돌을 누르면 나가요":"툇마루를 따라 칸을 건너다녀요 · 이불, 살림 장부, 아궁이 · 댓돌을 누르면 나가요";
  if(S.hold)$("hint").textContent=dishName(S.hold)+(mode==="plaza"?" 들고 왔어요 · 정자·먹거리 천막·평상에 앉으면 상에 올려 먹어요":PLACES[mode]?" 들고 왔어요":visiting?" 들고 왔어요 · 집을 누르면 갖다드릴 수 있어요":" 들고 있어요 · 평상을 누르면 소반에 내려놓아요. 이웃집에 갖다드려도 돼요");
  if(me)me.speed=hungry()||thirsty()?3.5:4.2; // 출출하거나 목마르면 걸음이 조금 느려요
  if(typeof seaTruck!=="undefined")seaTruck.visible=jangToday(); // 장날에만 생선 트럭
  if(typeof updateMyTitle==="function")updateMyTitle();refreshMeal();if(typeof refreshStorm==="function")refreshStorm();
  const lv=myLv(),xp=S.xp||0,L=LEVELS[lv],N=LEVELS[lv+1];
  $("lvName").textContent=L.name;$("xpFill").style.width=(N?(xp-L.xp)/(N.xp-L.xp)*100:100)+"%";
  $("xpNum").textContent=N?`땀방울 ${xp}/${N.xp}`:`땀방울 ${xp}`;
  const total=Object.keys(ITEMS).reduce((a,k)=>a+(S.inv[k]||0),0);$("invBtn").textContent="창고 "+total;
}
$("nbBtn").onclick=openNeighbors;
$("plazaBtn").onclick=openVillage; // "마을" 지도
// 오른쪽 아래 "마을 지도": 어디서든 다른 곳으로 가요. 처음엔 반짝여서 알려 줘요
$("mapBtn").onclick=()=>{if(!S.mapUsed){S.mapUsed=1;save();$("mapBtn").classList.remove("pulse")}openVillage()};
function mapBtnTip(){if(S.mapUsed)return;$("mapBtn").classList.add("pulse")}
$("homeBtn").onclick=goHome;
// 시험 서버용 "처음부터": 한 번 더 물어보고 이 기기의 기록을 지워요 (정식 공개 전에 빼기)
function askReset(){openSheet(`<h2>처음부터 다시 할까요?</h2><p class="hint">이 기기에 저장된 돈·밭·창고·도감·숙련도가 <b>모두 지워지고</b> 첫날로 돌아가요. 되돌릴 수 없어요.</p><div class="sitbtns"><button class="close go danger" id="resetYes">지우고 처음부터</button></div>`);
  $("resetYes").onclick=()=>{window.RESETTING=true;try{localStorage.removeItem("sigol1")}catch(e){}location.reload()}}
$("resetBtn").onclick=askReset;
$("timeBtn").onclick=openTimePick;$("guideBtn").onclick=()=>openGuide();$("timeChip").onclick=()=>{setTimePick(null);toast("실제 시간으로 돌아왔어요")};
// 휴대폰 세로 화면: 위 정보칸은 작게 접어 두고 ▾ 로 펼쳐요
[["statMore","statCard"],["sideMore",null]].forEach(([b,c])=>{const btn=$(b),card=c?$(c):btn.closest(".card");btn.onclick=e=>{e.stopPropagation();const o=card.classList.toggle("open");btn.textContent=o?"▴":"▾";btn.setAttribute("aria-expanded",o)}});
$("lvBtn").onclick=openLevels;
$("skyHud").onclick=()=>standSky(true);
// 냇가: 지금 있는 곳에서 가까운 물가로 가서 낚시해요
$("fishBtn").onclick=()=>{if(mode!=="stream"||SIT||FS)return;const x=fishBankX(me.g.position.x);go(x,FISH_SPOT.z+0.6,{type:"fish",x});toast("물가로 가서 낚싯대를 펴요")};
// 창고: 거둔 것, 달걀, 장날에 산 바다 것
function openInv(){
  const ks=Object.keys(ITEMS).filter(k=>S.inv[k]>0||CROPS[k]||k==="egg");
  let h='<h2>창고</h2><div class="goods">'+ks.map(k=>`<div class="good"><div class="gname">${ITEMS[k].name}<small>${S.inv[k]||0}개${ITEMS[k].sea?" · 바다 것":""}</small></div></div>`).join("")+'</div>';
  h+=`<h3>씨앗</h3><div class="goods">`+Object.keys(CROPS).map(k=>`<div class="good"><div class="gname">${CROPS[k].name} 씨앗<small>${S.seeds[k]}봉지</small></div></div>`).join("")+'</div>';
  if((S.pantry||[]).length){const c={};S.pantry.forEach(id=>c[id]=(c[id]||0)+1);h+='<h3>찬장 · 우리 평상에 앉아 꺼내 먹어요</h3><div class="goods">'+Object.entries(c).map(([id,n])=>`<div class="good"><div class="gname">${dishName(id)}<small>${n}개</small></div></div>`).join("")+'</div>'}
  h+='<p class="hint">채소는 채소가게 아줌마, 달걀은 닭집 아저씨가 사 줘요 (마을 장터)</p>';
  openSheet(h)}
$("invBtn").onclick=openInv;
