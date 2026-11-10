/* 이어지는 대화: 사람이 한 줄씩 말하고, 나는 고르기 단추로 대답해요. 주고받은 말은 위에 쌓여요.
   - 이장님: 마을 안내(가이드), 마을 약속, 불편한 점 접수(고객센터 역할), 접수한 것 확인, 마을 소식
   - 불편한 점은 지금은 이 휴대폰(S.reports)에만 적혀요. 서버를 붙이면 운영자에게 바로 가게 바꿀 곳 */

const TALKERS={ijang:{name:"이장님",role:"마을 안내 · 불편 접수",shirt:0x7d9a6b,o:{}}};
let TK=null;

function openTalk(who,node){
  const d=TALKERS[who];TK={who,seq:0};
  openSheet(`<div class="talkhead"><div class="ava">${avatarSvg(d)}</div><div class="who"><b>${d.name}</b><small>${d.role}</small></div></div>
    <div class="chatlog" id="chatLog"></div><div class="choices" id="choices"></div>`);
  sheet.classList.add("talk","chat");
  goNode(node||"start");
}
function chatLine(t,mine){const l=$("chatLog");if(!l)return;const p=document.createElement("p");p.className="cb "+(mine?"me":"npc");p.innerHTML=t;l.appendChild(p);
  while(l.children.length>14)l.removeChild(l.firstChild);sheet.scrollTop=sheet.scrollHeight}
// 한 장면: 할 말을 한 줄씩 띄우고, 다 말하면 고르기 단추
function goNode(id,arg){
  const n=SCRIPT[TK.who][id](arg),seq=++TK.seq,ch=$("choices");ch.innerHTML="";
  const typing=document.createElement("p");typing.className="cb npc typing";typing.innerHTML="<i></i><i></i><i></i>";
  let i=0;const next=()=>{if(!TK||TK.seq!==seq||$("modal").hidden)return;
    if(i<n.say.length){$("chatLog").appendChild(typing);sheet.scrollTop=sheet.scrollHeight;
      setTimeout(()=>{if(!TK||TK.seq!==seq)return;typing.remove();chatLine(n.say[i++],false);setTimeout(next,i<n.say.length?260:120)},Math.min(900,260+n.say[i].length*12));return}
    if(n.input)renderInput(n.input);
    (n.choices||[]).forEach(([t,go,a])=>{const b=document.createElement("button");b.textContent=t;b.className=go==="bye"||go==="close"?"":"go";
      b.onclick=()=>{chatLine(t,true);if(go==="close"){closeSheet();return}goNode(go,a)};ch.appendChild(b)});
    sheet.scrollTop=sheet.scrollHeight};
  next();
}
// 글 쓰는 칸 (불편한 점 적기)
function renderInput(o){
  const ch=$("choices");
  ch.innerHTML=`<textarea id="tkText" rows="3" maxlength="300" placeholder="${o.ph}"></textarea><p class="hint">지금은 이 휴대폰에만 적혀요. 마을이 인터넷에 연결되면 운영자에게 바로 전달돼요.</p>
    <div class="sitbtns"><button id="tkCancel">그만둘게요</button><button class="go" id="tkSend">이장님께 드리기</button></div>`;
  $("tkSend").onclick=()=>{const t=$("tkText").value.trim();if(t.length<2){toast("한 줄이라도 적어 주세요");return}chatLine(t.replace(/</g,"&lt;"),true);o.send(t)};
  $("tkCancel").onclick=()=>{chatLine("그만둘게요",true);goNode("start2")};
}

/* ---------- 이장님 대본 ---------- */
const REPORT_CAT=["고장 났어요 (버그)","쓰기 불편해요","이런 게 있으면 좋겠어요","나쁜 말·행동을 하는 이웃이 있어요","그 밖에"];
const back=[["다른 것도 궁금해요","guide"],["고맙습니다","bye"]];
const SCRIPT={ijang:{
  start:()=>{const h=hourNow(),first=!S.metChief;S.metChief=true;save();
    const hi=first?["처음 보는 얼굴이구먼. 내가 이 마을 이장일세.","살다가 궁금한 거나 불편한 거 있으면 언제든 나한테 말하게. 마을 일은 내가 챙기니까."]
      :[h<9?"아이고, 일찍 나왔구먼.":h>=20?"밤이 늦었는데 웬일인가.":"어서 오게. 밭일은 할 만한가?","무슨 일로 왔는가?"];
    return {say:hi,choices:ijangMain()}},
  start2:()=>({say:["그래, 또 다른 볼일 있는가?"],choices:ijangMain()}),
  guide:()=>({say:["뭐가 궁금한가? 하나씩 물어보게."],choices:[["농사는 어떻게 지어요?","g_farm"],["장터가 궁금해요","g_market"],["밥이랑 물은요?","g_food"],["가축은 어떻게 길러요?","g_animal"],["장작이랑 논농사는요?","g_wood"],["이웃이랑은 뭘 해요?","g_nb"],["마을 약속이 있어요?","g_rules"],["이제 됐어요","start2"]]}),
  g_farm:()=>({say:["밭을 누르면 가까이 가서 손으로 일하네. 땅 갈고, 이랑 내고, 씨 심고, 흙 덮고, 물 주고.","다 자라면 밭 위에 노란 게 반짝일 거야. 그때 거두게.","씨앗은 장터 씨앗가게 할아버지한테 사고. 빈 밭을 누르면 뭘 심을지 고를 수 있어."],choices:back}),
  g_market:()=>({say:["장터는 날마다 열려. 채소는 채소가게 아줌마, 달걀이랑 닭은 닭집 아저씨한테 가게.",
    "생선 트럭도 날마다 바닷가에서 오고, 정육점엔 삼겹살이며 불고기감이며 다 있어. 우시장도 날마다 열리고.",
    "정자에선 국수랑 막걸리도 파니 한잔하고 가게. 막걸리는 한 병 사 가서 집 평상에서 이웃이랑 나눠 먹어도 좋고."],choices:back}),
  g_food:()=>({say:["일하면 배도 고프고 목도 마르지. 왼쪽 위 든든함하고 물 줄을 잘 보게.","물은 마당 우물이나 냇가에서 떠 마시고, 밥은 마당 부뚜막에서 해 먹으면 돼.","일하다가 평상에서 새참 먹으면 기운이 나서 한동안 손이 빨라져. 옛날부터 그랬어."],choices:back}),
  g_animal:()=>({say:["닭장이랑 외양간은 집 안 책상에 있는 살림 장부에서 짓는 거야.","닭은 장터 닭집 아저씨한테 사고, 송아지랑 새끼 염소는 우시장 소장수한테 데려오게.","어린 것들은 외양간에서 여물을 줘야 커. 다 크면 우시장에서 제값 받고 팔 수 있지."],choices:back}),
  g_wood:()=>({say:["부뚜막이든 아궁이든 장작이 있어야 불을 때지. 집 뒤 땔감 숲에 날마다 쓰러진 나무가 생기니 톱질해 오게.","통나무는 모탕에 올려 도끼로 한가운데를 내리찍어. 쩍 갈라지는 맛이 있지. 장작가리엔 지붕이 있어 비 맞을 걱정 없네.",
    "겨울엔 아궁이에 장작이 두 배로 들어. 가을에 넉넉히 패 둬야 겨우내 따뜻하게 자.","논엔 씨앗가게에서 모를 사다 심게. 써레질하고 물 대고 모내기. 누렇게 익으면 베고 털어서 쌀을 얻지. 그 쌀로 가마솥 밥을 지어 반찬이랑 먹으면 밥심이 나네."],choices:back}),
  g_nb:()=>({say:["이웃 땅에 놀러 가서 마른 밭에 물 주면 품앗이가 돼. 서로 돕고 사는 거지.","이웃 집을 누르면 선물을 두고 올 수 있어. 직접 해 온 음식을 갖다드리면 더 좋아하고."],choices:back}),
  g_rules:()=>({say:["우리 마을엔 약속이 몇 가지 있네. 잘 들어 보게.",
    "<b>하나, 서로 존중하기.</b> 나쁜 말, 놀리는 말은 안 되네.","<b>둘, 남의 땅 아끼기.</b> 구경하고 돕는 건 좋지만 망가뜨리면 안 돼.",
    "<b>셋, 내 정보 지키기.</b> 전화번호나 사는 곳 같은 건 아무한테나 말하지 말게.","<b>넷, 사고파는 건 장터에서.</b> 돈 문제로 다투지 않게 말이야.",
    "약속을 안 지키는 사람을 보면 나한테 '불편한 점'으로 말해 주게. 내가 챙기겠네."],choices:back}),
  news:()=>{const d=new Date(),w=weather.kind,t=termNow(d);const say=[];const sw=stormWarn();
    if(sw)say.push("<b>"+whenText(sw.at)+" "+WX_EV[sw.kind].name+"</b>"+(sw.kind==="typhoon"?"이":"가")+" 온다네! 밭 칸마다 "+WX_EV[sw.kind].prep+" 꼭 하게. 안 하면 다 못 쓰게 돼.");
    say.push(pickOne(["정육점에 오늘 삼겹살이 좋더구먼. 솥뚜껑에 구워 먹으면 그만이지.","우시장에 송아지가 새로 들어왔더라.","생선 트럭에 "+SEA[seaToday(d).find(k=>k!=="mackerel")||"mackerel"].name+" 들어왔대."]));
    say.push("지금은 "+t+" 무렵이라 "+({입동:"다들 김장 준비하느라 바빠.",소설:"김장하기 딱 좋은 때지.",대설:"눈 오기 전에 장작 넉넉히 해 두게.",동지:"동지엔 팥죽을 쑤어 먹어야지."}[t]||"밭일하기 좋은 때일세."));
    say.push(w==="비"?"오늘은 비가 오니 밭에 물은 안 줘도 되겠어.":w==="눈"?"눈 오는 날은 미끄러우니 조심하게.":"날이 좋으니 냇가에 한번 가 보게. 물이 아주 시원해.");
    return {say,choices:ijangMain()}},
  report:()=>({say:["어떤 게 불편한가? 편하게 말해 보게."],choices:REPORT_CAT.map((c,i)=>[c,"report_write",i]).concat([["아니에요, 됐어요","start2"]])}),
  report_write:i=>({say:[i===3?"저런, 마음 상했겠구먼. 언제, 누가, 어떤 말을 했는지 적어 주면 내가 살펴보겠네.":i===2?"좋은 생각이 있구먼! 자세히 적어 주게.":"그래, 그랬구먼. 어디서 어떻게 됐는지 적어 주면 꼭 챙겨 보겠네."],
    input:{ph:i===0?"예) 장터에서 가게를 눌렀는데 창이 안 열려요":i===2?"예) 냇가에서 낚시를 하고 싶어요":"자세히 적어 주세요",
      send:t=>{const n=(S.reports.length?S.reports[S.reports.length-1].n:0)+1;S.reports.push({n,cat:REPORT_CAT[i],text:t,at:Date.now(),st:"접수"});save();sfx("pop");goNode("report_done",n)}}}),
  report_done:n=>({say:["잘 받았네! 접수 번호는 <b>"+n+"번</b>이야.","확인하는 대로 게시판에 붙여 두겠네. 말해 줘서 고맙구먼."],choices:[["하나 더 있어요","report"],["고맙습니다","bye"]]}),
  status:()=>{const r=S.reports.slice(-4);return {say:["어디 보자… 자네가 말한 건 이렇게 돼 있네."].concat(r.map(x=>`<b>${x.n}번</b> · ${x.cat}<br><small>"${x.text.slice(0,30).replace(/</g,"&lt;")}${x.text.length>30?"…":""}" · ${x.st==="접수"?"받아서 살펴보는 중":x.st}</small>`)).concat(["조금만 기다려 주게. 꼭 챙기겠네."]),choices:ijangMain()}},
  bye:()=>({say:[pickOne(["그래, 살펴 가게.","또 오게. 밭일 너무 무리하지 말고.","들어가게. 밥 잘 챙겨 먹고!"])],choices:[["닫기","close"]]})}};
function ijangMain(){
  const c=[["마을 안내 좀 해 주세요","guide"],["불편한 점이 있어요","report"],["요즘 마을 소식 있어요?","news"]];
  if(S.reports.length)c.push(["제가 말씀드린 건 어떻게 됐어요?","status"]);
  c.push(["다음에 또 올게요","bye"]);return c}

/* ---------- 마을회관 게시판 ---------- */
function openBoard(){
  const d=new Date();
  let h=`<h2>마을 게시판</h2><div class="notes">`;const sw=stormWarn();
  if(sw)h+=`<div class="note warnnote"><b>${WX_EV[sw.kind].name} 주의보</b><p>${whenText(sw.at)} · 밭마다 ${WX_EV[sw.kind].prep}! 안 하면 작물이 못 쓰게 돼요</p></div>`;
  h+=`<div class="note"><b>장터 안내</b><p>장터·생선 트럭·정육점·우시장 날마다 열어요<br>정자에서 국수, 막걸리</p></div>`;
  h+=`<div class="note y"><b>우시장</b><p>날마다 열어요. 송아지 ${ANIMALS.calf.buy.toLocaleString()}원, 새끼 염소 ${ANIMALS.kid.buy}원</p></div>`;
  h+=`<div class="note g"><b>마을 약속</b><p>서로 존중하기 · 남의 땅 아끼기 · 내 정보 지키기 · 거래는 장터에서</p></div>`;
  h+=`<div class="note"><b>${termNow(d)} 무렵</b><p>${weather.kind} · ${WX_NOTE[weather.kind]}</p></div>`;
  h+=`</div><h3>불편한 점 접수 현황</h3>`;
  h+=S.reports.length?S.reports.slice().reverse().slice(0,6).map(r=>`<div class="item"><div>${r.n}번 · ${r.cat}<small>${r.text.slice(0,40).replace(/</g,"&lt;")}</small></div><span class="done">${r.st==="접수"?"살펴보는 중":r.st}</span></div>`).join("")
    :`<p class="hint">아직 접수된 게 없어요. 불편한 점은 이장님께 말씀하세요.</p>`;
  h=h.replace('<h3>불편한 점 접수 현황</h3>',jobsBoardHtml()+'<h3>불편한 점 접수 현황</h3>');
  openSheet(h);sheet.classList.add("board");bindJobs();
}
