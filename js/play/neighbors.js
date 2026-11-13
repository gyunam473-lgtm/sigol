/* 이웃 땅 놀러 가기: 이웃 고르기, 오가기, 품앗이(물 주기), 선물 두고 오기 */

function openNeighbors(){
  let h='<h2>이웃</h2><p class="hint">품앗이: 이웃 밭일(물·김매기·벌레)을 거들면 그 이웃한테 "품"이 쌓여요. 내가 자리를 비웠을 때 품만큼 내 밭을 대신 돌봐 줘요.</p><h3>놀러 갈 땅을 골라요 (예시 이웃)</h3>';
  NB.forEach((n,i)=>{const done=S.helped&&S.helped[n.name]===today;h+=`<div class="item"><div>${n.name}네 땅<small>${n.sub?n.sub+" · ":""}${pumasiLine(n.name)} · ${done?"오늘 품앗이 했어요":"밭일을 거들면 품이 쌓여요"}</small></div><button class="go" data-nb="${i}" ${visiting===n?"disabled":""}>놀러가기</button></div>`});
  if(mode!=="home")h+=`<div class="item"><div>우리 땅<small>내 집과 텃밭</small></div><button data-home="1">돌아가기</button></div>`;
  openSheet(h);
  sheet.querySelectorAll("[data-nb]").forEach(b=>b.onclick=()=>{closeSheet();visit(NB[+b.dataset.nb])});
  sheet.querySelectorAll("[data-home]").forEach(b=>b.onclick=()=>{closeSheet();goHome()});
}
function arriveAt(){if(mode==="dabang"){me.g.position.set(0,0,DB.z1-0.8);me.tx=0;me.tz=DB.z1-2.4;me.route=[];me.moving=true;pending=null;me.g.rotation.y=Math.PI;dabangLighting();const p=me.g.position;camera.position.set(p.x,7.6,p.z+7.2);return}
  me.g.position.set(0,0,13);me.tx=0;me.tz=5;me.route=[];me.moving=true;pending=null;camera.position.set(0,12,25)}
function applyMode(){
  if(SIT)standUp();if(SKYV)standSky(false);exitRoom();const n=visiting; // 앉아 있거나 집 안이면 먼저 일어나서 나가요
  const P=PLACES[mode];land.visible=!P;ground.visible=mode!=="dwitsan"&&mode!=="dabang"; /* 뒷산·다방은 자기 땅이 있어요. 겹치면 번쩍거려서 원래 풀밭은 숨겨요 */Object.entries(PLACES).forEach(([k,p])=>p.g.visible=k===mode);BG_TREES.forEach(t=>t.visible=mode!=="plaza"&&mode!=="school");
  applyHouse();ijang.visible=!!(n&&n.full);applyLand();
  npcs.forEach(p=>{
    if(P){const chief=p.name==="이장님"&&mode==="hall"; // 회관에선 이장님이 게시판 옆에 서 계셔요
      p.g.visible=p.shop?shopPlace(p.shop)===mode&&shopOpen(p.shop):true;p.stay=!!p.shop||chief;
      if(p.shop){const [x,z,r]=shopSpot(p.shop);p.g.position.set(x,0,z);p.tx=x;p.tz=z;p.g.rotation.y=r}
      else if(chief){const [x,z]=HALL.chief;p.g.position.set(x,0,z);p.tx=x;p.tz=z;p.g.rotation.y=0.3}
      else{const w=P.way[Math.floor(Math.random()*P.way.length)];p.g.position.set(w[0],0,w[1]);p.tx=w[0];p.tz=w[1]}}
    else if(mode==="visit"){const own=p.name===n.name;p.g.visible=own;p.stay=own;if(own){p.g.position.set(n.full?-1.9:HF.x+3,0,n.full?-2.6:HF.z-0.6);p.tx=p.g.position.x;p.tz=p.g.position.z;p.g.rotation.y=0.6}}
    else{p.g.visible=false;p.stay=!!p.shop}}); // 우리 땅엔 나 혼자
  arriveAt();for(let i=0;i<15;i++)drawPlot(i,true);refresh();setAmbience();
}
function visit(n){visiting=n;nbPlots=n.plots();addNbIssues(n);mode="visit";applyMode();const k=nbNeeds();
  setTimeout(()=>toast(n.name+": "+n.greet+(k?" · 밭에 거들 일이 "+k+"가지 있어요. 거들면 품앗이 품이 쌓여요":"")),900)}
function goHome(){visiting=null;mode="home";applyMode();pumasiTick();if(!showHelpLog())toast("우리 땅으로 돌아왔어요")}

function useNbPlot(i){
  const p=nbPlots[i],n=visiting;workT=0.5;
  if(!p){toast(n.name+"네 빈 밭이에요");return}
  if(helpNbPlot(i))return; // 목마름·잡초·벌레 거들기 (play/pumasi.js)
  if(!p.wat){p.wat=Date.now();const g=plots[i].g.position;splash(g.x,g.z);
    S.helped=S.helped||{};
    S.pum=S.pum||{};const got=pumOf(n.name)<PUMASI.max;if(got)S.pum[n.name]=pumOf(n.name)+1;
    if(S.helped[n.name]!==today){S.helped[n.name]=today;S.money+=30;sweat(1);toast("품앗이 했어요! "+josa(n.name,"이","가")+" 고맙다며 30원을 줬어요"+(got?" · 품 +1":""));save();refresh()}
    else{toast("물을 줬어요. "+josa(n.name,"이","가")+" 고마워해요"+(got?" · 품 +1":""));save()}}
  else if(stageOf(p)==="ripe")toast("잘 익었네요. 이웃 작물은 구경만 해요");
  else toast("이미 물을 줬어요. 잘 자라는 중이에요");
  drawPlot(i,true)}
function openGift(){
  const n=visiting;let h=`<h2>${n.name}네 집</h2>`;
  if(S.hold)h+=`<h3>들고 온 음식</h3><div class="item"><div>${dishName(S.hold)}<small>직접 만든 음식을 갖다드려요 · 답례로 씨앗 두 봉지</small></div><button class="go" id="giveHold">갖다드리기</button></div>`;
  h+=`<h3>창고에서 선물 하나 두고 오기</h3>`;
  Object.keys(ITEMS).filter(k=>!ITEMS[k].sea||S.inv[k]>0).forEach(k=>{h+=`<div class="item"><div>${ITEMS[k].name}<small>가진 것 ${S.inv[k]}개</small></div><button class="go" data-gift="${k}" ${S.inv[k]?"":"disabled"}>선물하기</button></div>`});
  openSheet(h);
  if(S.hold)$("giveHold").onclick=()=>giveHold(n);
  sheet.querySelectorAll("[data-gift]").forEach(b=>b.onclick=()=>{const k=b.dataset.gift;S.inv[k]--;const back=Object.keys(CROPS)[Math.floor(Math.random()*4)];S.seeds[back]++;
    closeSheet();toast(josa(n.name,"이","가")+" 답례로 "+CROPS[back].name+" 씨앗을 줬어요");save();refresh()});
}
