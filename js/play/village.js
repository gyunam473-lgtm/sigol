/* 마을 다니기: "마을" 지도에서 공용 장소 고르기, 장소 오가기, 냇물 마시기, 마을 방송 (장소 모양은 world/places.js) */

const PLACE_HELLO={
  plaza:()=>"오늘도 장터가 북적여요. 먹거리 천막에서 국밥 한 그릇, 평상에 앉아 쉬어 가요. 말풍선 달린 주인을 누르면 사고팔아요",
  hall:()=>"마을회관이에요. 이장님께 궁금한 거나 불편한 걸 말씀드려요",
  cattle:()=>"우시장이에요. 음머~ 소장수 아저씨를 눌러 보세요",
  dabang:()=>"딸랑~ 다방에 들어왔어요. 난로 위 주전자가 보글보글, 소파에 앉아 차 한 잔 해요",
  dwitsan:()=>"뒷산이에요. 솔향이 나요. 산길 따라 꼭대기 정자까지 올라가 봐요. 반짝이는 풀은 캐요",
  workshop:()=>"목공소예요. 쓱싹쓱싹 톱질 소리, 나무 냄새가 좋아요",
  stream:()=>"냇가예요. 물소리가 졸졸. 냇물에 들어가 바닥을 훑어보거나, 물가에서 낚시해요",
  mill:()=>"방앗간이에요. 떡 찌는 냄새가 고소해요. 쌀을 가져오면 가래떡을 뽑아 줘요",
  school:()=>"분교예요. 운동장이 넓어요. 그네도 타고 스탠드에 앉아 쉬어 가요",
  clinic:()=>"보건소예요. 선생님이 건강을 살펴 주셔요. 하루 한 번 비타민도 주셔요",
  bus:()=>"버스 정류장이에요. 군내버스가 오가요. 구멍가게에서 식혜 한 병 어때요"};
function goPlace(k){visiting=null;mode=k;applyCattle();if(k==="dwitsan")applyForage();applyMode();
  const tip=(S.placeTips||0)<3;if(tip){S.placeTips=(S.placeTips||0)+1;save()}
  setTimeout(()=>toast(PLACE_HELLO[k]()+(tip?" · 다른 곳에 가거나 돌아갈 땐 오른쪽 아래 '마을 지도'":"")),600)}
function goPlaza(){goPlace("plaza")}

// "마을" 지도: 갈 수 있는 곳과 준비 중인 곳
// 그림 지도에서 장소 자리 [x, y] (가로 360 · 세로 300 그림 기준)
const MAP_POS={dwitsan:[180,34],stream:[92,98],school:[292,86],clinic:[246,124],hall:[112,146],dabang:[256,168],plaza:[178,176],cattle:[58,206],workshop:[300,214],mill:[96,252],home:[184,268],bus:[318,268]};
function villageMapSvg(){
  const pin=(k,name,shut)=>{const [x,y]=MAP_POS[k],here=k===mode||(k==="home"&&mode==="home"),w=name.length*13+18;
    return `<g class="vpin${here?" here":""}${shut?" shut":""}" data-vgo="${k}" tabindex="0" role="button" aria-label="${name}">
      <circle cx="${x}" cy="${y}" r="${here?9:7}"/><rect x="${x-w/2}" y="${y+10}" width="${w}" height="22" rx="11"/><text x="${x}" y="${y+25}">${name}</text>${here?`<text class="me" x="${x}" y="${y-13}">● 지금 여기</text>`:""}</g>`};
  let s=`<svg class="vmap" viewBox="0 0 360 300" xmlns="http://www.w3.org/2000/svg">
    <rect width="360" height="300" rx="14" class="vm-bg"/>
    <path class="vm-hill" d="M0 70 Q60 10 120 46 Q180 -6 240 40 Q300 8 360 52 L360 0 L0 0Z"/>
    <path class="vm-hill2" d="M0 70 Q60 10 120 46 Q180 -6 240 40 Q300 8 360 52 L360 66 Q300 40 240 62 Q180 30 120 66 Q60 40 0 84Z"/>
    <path class="vm-paddy" d="M20 228 h70 v50 h-70z M98 266 h48 v24 h-48z"/>
    <path class="vm-river" d="M-5 120 Q60 90 120 104 Q180 118 220 96 Q270 70 365 80"/>
    <path class="vm-road" d="M184 290 L184 176 M184 176 L112 146 M184 176 L256 168 M184 176 L58 206 M184 176 L300 214 M184 230 L96 252 M184 176 L246 124 L292 86 M112 146 L92 104 M184 176 L184 52 M184 260 L318 268 M0 288 L360 280"/>
    <g class="vm-tree"><circle cx="150" cy="200" r="6"/><circle cx="210" cy="150" r="5"/><circle cx="40" cy="160" r="6"/><circle cx="330" cy="140" r="6"/><circle cx="260" cy="240" r="5"/></g>`;
  Object.entries(PLACES).forEach(([k,p])=>{if(MAP_POS[k])s+=pin(k,p.name,k==="cattle"&&!jangToday())});
  s+=pin("home","우리 땅");return s+"</svg>"}
function openVillage(){
  let h=`<h2>우리 마을</h2><p class="hint">지도에서 갈 곳을 눌러요</p>${villageMapSvg()}<h3>장소 둘러보기</h3><div class="places">`;
  Object.entries(PLACES).forEach(([k,p])=>{const shut=k==="cattle"&&!jangToday(),here=mode===k;
    h+=`<button class="place ${here?"here":""}" data-place="${k}" ${here?"disabled":""}><b>${p.name}</b><small>${p.sub}</small><span class="tag ${shut?"off":""}">${here?"지금 여기":shut?"오늘은 닫힘":"가기"}</span></button>`});
  PLACES_SOON.forEach(([n,s])=>h+=`<div class="place soon"><b>${n}</b><small>${s}</small><span class="tag off">준비 중</span></div>`);
  h+=`</div>`;
  if(mode!=="home")h+=`<button class="go wide" id="mapHome">우리 땅으로 돌아가기</button>`;
  h+=`<button class="wide" id="mapGuide">마을 안내서 보기 · 무엇을 어디서 하나</button>`;
  openSheet(h);sheet.classList.add("map");
  sheet.querySelectorAll("[data-place]").forEach(b=>b.onclick=()=>{closeSheet();goPlace(b.dataset.place)});
  sheet.querySelectorAll("[data-vgo]").forEach(b=>{const fn=()=>{const k=b.dataset.vgo;if(k===mode)return;closeSheet();if(k==="home")goHome();else goPlace(k)};b.onclick=fn;b.onkeydown=e=>{if(e.key==="Enter")fn()}});
  if($("mapHome"))$("mapHome").onclick=()=>{closeSheet();goHome()};
  $("mapGuide").onclick=()=>openGuide();
}
// 냇물 떠 마시기
function drinkStream(){const before=waterNow();S.water=100;save();refresh();sfx("water");buzz(15);
  toast(before>=90?"손을 담그니 시원해요. 아직 목마르진 않아요":"두 손으로 냇물을 떠 마셨어요. 이가 시릴 만큼 차가워요!")}
// 확성기 마을 방송
function villageBroadcast(){sfx("pop");
  toast(pickOne(["\"아아, 마을 주민 여러분. "+"오늘도 장터와 우시장이 열렸습니다. 정육점에 좋은 고기 들어왔답니다."+"\"",
    "\"아아, 이장입니다. 불편한 점은 회관으로 와서 말씀해 주십시오.\"","\"아아, 날이 "+(weather.kind==="맑음"?"좋습니다. 밭에 물 주는 거 잊지 마십시오.":"궂습니다. 다들 조심하십시오.")+"\""]))}
