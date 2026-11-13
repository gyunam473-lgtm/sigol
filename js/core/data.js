/* 게임 숫자와 정보: 작물, 요리, 살림 늘리기 값, 예시 이웃, 절기, 날씨 종류. 값을 바꾸고 싶으면 대부분 여기만 고치면 돼요. */

// 초안이라 시간이 빨라요. 실제 버전에선 작물은 몇 시간~며칠, 달걀은 하루 한 번
const CROPS={
  lettuce:{name:"상추",grow:30,yield:2,price:100,seed:50},
  potato:{name:"감자",grow:45,yield:3,price:120,seed:70},
  tomato:{name:"토마토",grow:60,yield:3,price:180,seed:90},
  cabbage:{name:"배추",grow:90,yield:2,price:250,seed:120},
  goguma:{name:"고구마",grow:75,yield:4,price:160,seed:90}}; // 고구마: 줄기 밑을 호미로 캐요
const ROOT_CROPS=["potato","goguma"]; // 땅속 작물: 거둘 땐 호미로 캐고 → 하나씩 주워요
// 해산물: 우리 마을은 논농사 짓는 내륙이라 바다 것은 생선 트럭이 날마다 싣고 와요.
// 철마다 들어오는 게 달라요. 멀리서 오니까 값이 비싸고, 되팔 순 없어요(sea:true).
const SEA={
  mackerel:{name:"고등어",buy:300,season:[0,1,2,3],desc:"사철 들어오는 등 푸른 생선"},
  dodari:{name:"도다리",buy:450,season:[0],desc:"봄 도다리 · 납작하고 살이 보드라워요"},
  jogi:{name:"조기",buy:350,season:[0],desc:"봄 조기 · 노릇한 금빛 비늘"},
  galchi:{name:"갈치",buy:550,season:[1,2],desc:"은빛 갈치 · 토막 내서 와요"},
  minuh:{name:"민어",buy:650,season:[1],desc:"여름 보양 생선 · 귀한 손님 오면"},
  jeoneo:{name:"전어",buy:280,season:[2],desc:"가을 전어 · 굽는 냄새에 집 나간 며느리도 돌아온대요"},
  kkongchi:{name:"꽁치",buy:250,season:[3],desc:"겨울 꽁치 · 기름이 올라 고소해요"},
  gul:{name:"굴",buy:400,season:[3],desc:"겨울 굴 · 바다 우유"}};
const SEASON_NAME=["봄","여름","가을","겨울"];
const seasonOf=d=>{const m=d.getMonth()+1;return m>=3&&m<=5?0:m>=6&&m<=8?1:m>=9&&m<=11?2:3};
// 장날: 날짜 끝자리가 4, 9인 날 (4·9장)
const isJangnal=d=>[4,9].includes(d.getDate()%10);
function nextJangnal(d){const n=new Date(d);for(let i=1;i<=6;i++){n.setDate(d.getDate()+i);if(isJangnal(n))return n}return n}
const seaToday=d=>Object.keys(SEA).filter(k=>SEA[k].season.includes(seasonOf(d)));
// 땔감과 쌀: 장작(부뚜막·아궁이 땔감), 통나무(패기 전), 모(논에 심는 어린 벼), 쌀(밥 짓기)
const STUFF={jangjak:{name:"장작",price:0,stuff:true},tongnamu:{name:"통나무",price:0,stuff:true},mo:{name:"모",price:0,stuff:true},ssal:{name:"쌀",price:0,stuff:true}};
// 장작 쓰는 양, 장작가리 크기, 땔감 숲에서 하루에 생기는 나무
const FUEL={cook:1,ondol:3,ondolWinter:6,pileMax:60,treesPerDay:3,regrow:600,logsPerTree:3,piecesPerLog:4,bundle:{n:10,price:300}}; // regrow: 벤 자리에 다시 쓰러진 나무 (초)
// 논농사 (초안: 3분이면 익어요 · 실제로는 봄에 모내기, 가을에 벼 베기)
const RICE={grow:180,yield:6,moPrice:150};
// 고기: 장터 정육점 아저씨 (되팔 순 없어요)
const MEAT={
  samgyeop:{name:"삼겹살",buy:500,desc:"솥뚜껑에 구우면 기름이 자글자글"},
  apdari:{name:"돼지 앞다리살",buy:400,desc:"고추장 양념에 달달 볶으면 제육볶음"},
  bulgogi:{name:"불고기감",buy:700,desc:"얇게 썬 한우, 간장 양념"},
  dak:{name:"토종닭",buy:600,desc:"가마솥에 푹 고면 백숙"}};
// 냇가 민물고기 (낚시). cm 크기 범위, w 잘 잡히는 정도(클수록 흔함), sell 생선 트럭이 사 주는 값, when: night 밤에만, season 철(0봄~3겨울, 없으면 사철)
const FRESH={
  songsari:{name:"송사리",cm:[3,6],w:22,sell:10,pull:0.2,season:[0,1],desc:"냇가 얕은 데 떼 지어 다녀요"},
  pirami:{name:"피라미",cm:[8,16],w:40,sell:30,pull:0.35,desc:"은빛 몸에 분홍 줄무늬. 제일 흔해요"},
  bungeo:{name:"붕어",cm:[12,38],w:32,sell:60,pull:0.5,desc:"30cm 넘으면 월척이에요"},
  kkeokji:{name:"꺽지",cm:[10,22],w:10,sell:120,pull:0.6,season:[1,2],desc:"돌 틈에 숨어 사는 토종 물고기"},
  megi:{name:"메기",cm:[20,65],w:10,sell:200,pull:0.8,when:"night",desc:"밤에 나와 먹이를 찾아요"},
  ssogari:{name:"쏘가리",cm:[20,48],w:4,sell:400,pull:0.85,season:[1,2],desc:"민물의 왕. 표범 같은 무늬"},
  baemjang:{name:"뱀장어",cm:[40,95],w:2,sell:600,pull:0.95,when:"night",desc:"힘이 장사. 밤에만 물어요"},
  hwanggeum:{name:"황금 잉어",cm:[55,99],w:0.25,sell:3000,pull:1,desc:"냇가의 전설. 본 사람이 거의 없대요"}};
// 잡은 고기 값: 클수록 비싸요. 월척(붕어 30cm 넘게)은 2.5배, 대물(그 고기 크기의 상위 20%)은 1.8배
function fishPrice(k,cm){const f=FRESH[k],r=Math.max(0,Math.min(1,(cm-f.cm[0])/(f.cm[1]-f.cm[0])));let p=f.sell*(0.6+1.2*r);
  const tag=k==="bungeo"&&cm>=30?"월척":r>=0.8?"대물":"";if(tag==="월척")p*=2.5;else if(tag==="대물")p*=1.8;return {p:Math.max(10,Math.round(p/10)*10),tag}}
// 뒷산 캐기: 날마다 새로 돋는 나물·버섯·약초. season 철(0봄~3겨울), w 잘 나오는 정도, sell 채소가게 아줌마가 사 주는 값, how: 뜯기(nip) · 캐기(dig)
const FORAGE={
  gosari:{name:"고사리",season:[0],w:30,sell:50,how:"nip",desc:"봄 산에 돌돌 말린 새순"},
  chwi:{name:"취나물",season:[0,1],w:30,sell:40,how:"nip",desc:"향긋한 봄나물"},
  dureup:{name:"두릅",season:[0],w:12,sell:120,how:"nip",desc:"나무 끝에 돋는 산채의 왕"},
  pyogo:{name:"표고버섯",season:[1,2],w:20,sell:90,how:"nip",desc:"참나무 둥치에 피는 버섯"},
  songi:{name:"송이버섯",season:[2],w:4,sell:800,how:"nip",desc:"가을 소나무 밑, 귀한 송이"},
  bam:{name:"밤",season:[2],w:30,sell:30,how:"nip",desc:"가시 송이 속 알밤"},
  dotori:{name:"도토리",season:[2,3],w:25,sell:20,how:"nip",desc:"묵 쑤어 먹는 도토리"},
  doraji:{name:"도라지",w:18,sell:80,how:"dig",desc:"하얀 뿌리, 사철 캐요"},
  deodeok:{name:"더덕",w:12,sell:150,how:"dig",desc:"향이 진한 산 더덕"},
  sansam:{name:"산삼",w:0.4,sell:8000,how:"dig",desc:"심봤다! 백 년 묵은 산삼"}};
const FORAGE_LV=[{name:"산길 초보",xp:0},{name:"나물 캐는 이",xp:25},{name:"산 귀신",xp:80},{name:"약초꾼",xp:200},{name:"심마니",xp:450}];
const FORAGE_REGROW=180; // 캔 자리에 새로 돋기까지 (초). 자주 돋게 (2026-11-10)
const FORAGE_SPOTS=8; // 뒷산에 하루 새로 돋는 자리
// 다방 차림표 (소파에 앉아 시켜요)
const DABANG_MENU=[
  {id:"dabang_coffee",name:"다방 커피",price:200,fill:5,drink:25,desc:"커피 둘, 설탕 둘, 프림 둘"},
  {id:"ssanghwa",name:"쌍화차",price:300,fill:15,drink:20,desc:"노른자 동동, 잣 동동. 몸이 뜨끈"},
  {id:"yulmu",name:"율무차",price:200,fill:10,drink:25,desc:"고소하고 걸쭉한 한 잔"},
  {id:"yuja",name:"유자차",price:200,fill:5,drink:35,desc:"새콤달콤 향긋한 유자"}];
// 낚시 숙련도: 잡을수록 늘어요. 오르면 초록 칸이 넓어지고 귀한 고기가 더 잘 물어요
const FISH_LV=[{name:"초보 낚시꾼",xp:0},{name:"동네 낚시꾼",xp:25},{name:"냇가 단골",xp:80},{name:"손맛 아는 꾼",xp:200},{name:"낚시 명인",xp:450},{name:"전설의 강태공",xp:900}];
const ITEMS=Object.assign({},CROPS,Object.fromEntries(Object.entries(FORAGE).map(([k,v])=>[k,{name:v.name,price:v.sell,forage:true}])),Object.fromEntries(Object.entries(FRESH).map(([k,v])=>[k,{name:v.name,price:0,fresh:true}])),{egg:{name:"달걀",price:60}},STUFF,{makgeolli:{name:"막걸리 한 병",price:0,stuff:true}},
  Object.fromEntries(Object.entries(MEAT).map(([k,v])=>[k,{name:v.name,price:0,meat:true}])),Object.fromEntries(Object.entries(SEA).map(([k,v])=>[k,{name:v.name,price:0,sea:true}])));
/* ---------- 밭 품질 (2026-11-10): 잘 돌볼수록 특상(값 2배)이 많이, 아주 가끔 왕(값 8배) ---------- */
const KING_KG={lettuce:[0.8,1.6],potato:[1.2,2.6],tomato:[0.6,1.2],cabbage:[5,9],goguma:[1.0,2.2]}; // 왕 작물 무게 (kg)
Object.keys(CROPS).forEach(k=>{ITEMS[k+"_top"]={name:"특상 "+CROPS[k].name,price:CROPS[k].price*2,grade:"top",base:k};ITEMS[k+"_king"]={name:"왕"+CROPS[k].name,price:CROPS[k].price*8,grade:"king",base:k}});
/* ---------- 곤충 채집 (잠자리채): 냇가·분교·뒷산. season 0봄 1여름 2가을 3겨울, time day/night/any, sell 분교 선생님이 사 줘요 ---------- */
const INSECTS={
  nabi:{name:"배추흰나비",season:[0,1,2],time:"day",where:["stream","school","dwitsan"],w:30,sell:20,cm:[4,6],col:[0xf6f4ea,0x2a2a2a],wing:true},
  horang:{name:"호랑나비",season:[0,1,2],time:"day",where:["stream","dwitsan"],w:9,sell:90,cm:[8,11],col:[0xf2c84a,0x1a1a1a],wing:true},
  gochu:{name:"고추잠자리",season:[1,2],time:"day",where:["stream","school","dwitsan"],w:30,sell:30,cm:[4,5],col:[0xd8321e,0xe8e8f0],drag:true},
  jangsu:{name:"장수잠자리",season:[1,2],time:"day",where:["stream"],w:6,sell:150,cm:[9,11],col:[0x2a2a2a,0xe8e8f0],drag:true},
  mettugi:{name:"벼메뚜기",season:[1,2],time:"day",where:["school","stream"],w:25,sell:20,cm:[3,4],col:[0x7aa83a,0x5a7a2a],hop:true},
  banga:{name:"방아깨비",season:[1,2],time:"day",where:["school"],w:12,sell:60,cm:[6,9],col:[0x6aaa4a,0x4a8a3a],hop:true},
  maemi:{name:"참매미",season:[1],time:"day",where:["school","dwitsan"],w:20,sell:40,cm:[3,4],col:[0x3a3a2a,0xd8e0e0],wing:true},
  mudang:{name:"무당벌레",season:[0,1,2,3],time:"day",where:["stream","school","dwitsan"],w:20,sell:25,cm:[0.6,0.9],col:[0xd8321e,0x1a1a1a],beetle:true},
  bandi:{name:"반딧불이",season:[1,2],time:"night",where:["stream","dwitsan"],w:20,sell:90,cm:[1,1.8],col:[0xf6f080,0x2a2a1a],glow:true},
  gwiddu:{name:"귀뚜라미",season:[2,3],time:"night",where:["stream","school","dwitsan"],w:25,sell:30,cm:[1.5,2.5],col:[0x4a3220,0x2a1a10],hop:true},
  pungdeng:{name:"장수풍뎅이",season:[1,2],time:"night",where:["dwitsan"],w:4,sell:350,cm:[4,8],col:[0x3a2214,0x5a3a22],beetle:true},
  saseum:{name:"사슴벌레",season:[1,2],time:"night",where:["dwitsan"],w:4,sell:450,cm:[3,8],col:[0x2a1a10,0x4a2a18],beetle:true},
  jabang:{name:"겨울자나방",season:[2,3],time:"night",where:["dwitsan","school"],w:15,sell:40,cm:[2,3],col:[0xc8b89a,0x8a7a5a],wing:true}};
const BUG_LV=[{name:"채집 초보",xp:0},{name:"곤충 친구",xp:20},{name:"잠자리채 달인",xp:70},{name:"곤충 박사",xp:180},{name:"파브르",xp:400}];
/* ---------- 짚공예 (집 툇마루): 볏짚은 벼 털면 나오고, 방앗간에서도 팔아요. 목수 할아버지가 사 줘요 ---------- */
const JIP={
  saekki:{name:"새끼줄",need:{jip:2},steps:["kkoda"],sell:40,desc:"볏짚 두 줌을 비벼 꼬아요"},
  jipsin:{name:"짚신",need:{jip:2,saekki:1},steps:["kkoda","eokki"],sell:160,desc:"새끼줄에 볏짚을 엮어 한 켤레"},
  sokuri:{name:"짚 소쿠리",need:{jip:3,saekki:1},steps:["kkoda","eokki","eokki"],sell:240,desc:"둥글게 엮어 나물 담는 소쿠리"},
  meongseok:{name:"멍석",need:{jip:5,saekki:2},steps:["kkoda","eokki","eokki","dadeum"],sell:480,desc:"마당에 까는 큰 짚 깔개. 고추 말릴 때 써요"}};
const JIP_LV=[{name:"짚 만지는 이",xp:0},{name:"새끼 꼬는 손",xp:15},{name:"짚신 장인",xp:50},{name:"짚풀 명인",xp:130}];
/* ---------- 마을 품삯 일 (회관 게시판): 받아 두고 그 장소에 가면 반짝이는 자리에서 해요. 10분마다 새 일거리 ---------- */
const JOBS=[
  {id:"gama",place:"mill",at:[-6,-2.6],title:"방앗간 쌀가마 나르기",steps:["gama","gama","gama"],pay:130,who:"방앗간 아저씨"},
  {id:"pull",place:"school",at:[-7.5,6],title:"분교 운동장 풀 뽑기",steps:["pull","pull"],pay:100,who:"분교 선생님"},
  {id:"flower",place:"clinic",at:[-5.2,-0.3],title:"보건소 화단 물 주기",steps:["water2","pull"],pay:90,who:"보건소 선생님"},
  {id:"trash",place:"stream",at:[3,1.2],title:"냇가 쓰레기 줍기",steps:["pick","pick"],pay:100,who:"이장님"},
  {id:"sweep",place:"plaza",at:[0,7],title:"장터 마당 쓸기",steps:["sweep","sweep","pick"],pay:110,who:"이장님"},
  {id:"dish",place:"dabang",at:[6.4,-2.2],title:"다방 찻잔 닦기",steps:["dish","dish"],pay:90,who:"다방 사장님"},
  {id:"bench",place:"bus",at:[-3,0.3],title:"정류장 의자 닦기",steps:["dish"],pay:70,who:"구멍가게 할머니"},
  {id:"hay",place:"cattle",at:[-6.4,2.6],title:"우시장 볏짚단 나르기",steps:["gama","gama"],pay:110,who:"소장수 아저씨"},
  {id:"wood",place:"workshop",at:[-3,-1],title:"목공소 대팻밥 쓸기",steps:["sweep","pick"],pay:90,who:"목수 할아버지"}];
// 그 밖에 줍는 것
const DASEULGI={sell:30}; // 다슬기 한 줌 (국밥집 아주머니가 사 줘요)
Object.assign(ITEMS,Object.fromEntries(Object.entries(INSECTS).map(([k,v])=>["bug_"+k,{name:v.name,price:v.sell,bug:true}])),
  {marsh:{name:"마시멜로",price:0,stuff:true},jip:{name:"볏짚",price:0,stuff:true},daseulgi:{name:"다슬기",price:DASEULGI.sell,stuff:true}},Object.fromEntries(Object.entries(JIP).map(([k,v])=>[k,{name:v.name,price:v.sell,jip:true}])));
const EGG_SEC=40;
// fill: 먹으면 차는 든든함, drink: 마시면 차는 물 (0~100). sea: 해산물 요리 (장날 생선 트럭 재료)
const RECIPES=[
  {id:"jeon",name:"감자전",need:{potato:2},fill:35,desc:"강판에 간 감자를 바삭하게 부쳤어요",rain:true},
  {id:"geot",name:"상추겉절이",need:{lettuce:2},fill:20,desc:"갓 딴 상추에 양념을 슥슥"},
  {id:"salad",name:"토마토 샐러드",need:{tomato:1,lettuce:1},fill:25,desc:"햇볕 머금은 토마토와 상추"},
  {id:"egg",name:"계란말이",need:{egg:2},fill:30,desc:"우리 닭이 낳은 달걀로 도톰하게"},
  {id:"tomegg",name:"토마토 달걀볶음",need:{tomato:1,egg:1},fill:30,desc:"새콤하고 부드러운 한 접시"},
  {id:"gui_mackerel",name:"고등어구이",need:{mackerel:1},fill:40,desc:"솥뚜껑에 노릇노릇, 기름이 자글자글",sea:true},
  {id:"gui_dodari",name:"도다리구이",need:{dodari:1},fill:40,desc:"봄 바다 맛을 그대로",sea:true},
  {id:"gui_jogi",name:"조기구이",need:{jogi:1},fill:35,desc:"밥도둑 노란 조기 두 마리",sea:true},
  {id:"gui_galchi",name:"갈치구이",need:{galchi:1},fill:40,desc:"은빛 토막이 바삭하게",sea:true},
  {id:"gui_minuh",name:"민어구이",need:{minuh:1},fill:45,desc:"여름 더위를 이기는 귀한 한 접시",sea:true},
  {id:"gui_jeoneo",name:"전어구이",need:{jeoneo:1},fill:35,desc:"가을 냄새 솔솔, 세 마리 통째로",sea:true},
  {id:"gui_kkongchi",name:"꽁치구이",need:{kkongchi:1},fill:35,desc:"기름진 겨울 꽁치 두 마리",sea:true},
  {id:"guljeon",name:"굴전",need:{gul:1,egg:1},fill:35,desc:"달걀옷 입혀 부친 겨울 굴",sea:true},
  {id:"jeyuk",name:"제육볶음",need:{apdari:1},fill:45,desc:"고추장 양념에 달달 볶은 돼지고기",meat:true},
  {id:"samgyeopsal",name:"솥뚜껑 삼겹살",need:{samgyeop:1},fill:45,desc:"솥뚜껑에 노릇노릇, 기름이 자글자글",meat:true},
  {id:"bulgogi",name:"소불고기",need:{bulgogi:1},fill:45,desc:"달큰한 간장 양념 한우",meat:true},
  {id:"baeksuk",name:"닭백숙",need:{dak:1},fill:60,drink:30,desc:"가마솥에 푹 고은 토종닭. 국물까지 든든",meat:true},
  {id:"bap",name:"가마솥 밥",need:{ssal:1},fill:45,desc:"우리 논에서 거둔 쌀로 지은 하얀 쌀밥",bap:true},
  {id:"kimjang",name:"김장김치",need:{cabbage:3},fill:40,desc:"겨울을 나는 첫 준비",terms:["입동","소설"],when:"입동·소설 무렵"}];
// 장터 정자 차림표
const MARKET_FOOD=[
  {id:"guksu",name:"잔치국수",price:150,fill:40,drink:20,desc:"멸치 육수에 말아 낸 국수"},
  {id:"pajeon",name:"부추전",price:200,fill:35,desc:"정자 앞에서 바로 부쳐 줘요"},
  {id:"hotteok",name:"호떡",price:80,fill:20,desc:"속에 꿀이 뜨끈하게"},
  {id:"sikhye",name:"식혜",price:60,fill:10,drink:60,desc:"살얼음 동동"},
  {id:"makgeolli",name:"막걸리",price:150,fill:10,drink:20,desc:"뽀얀 막걸리 한 사발. 한 병 사 가서 집에서 나눠 마셔도 돼요",bottle:true}];
// 장터 먹거리 천막 (국밥집 아주머니): 정자 차림표에 더해 이것도 시켜요
const JANG_FOOD=[
  {id:"gukbap",name:"장터 국밥",price:300,fill:55,drink:15,desc:"가마솥에 푹 고은 뜨끈한 국밥 한 그릇"},
  {id:"sundae",name:"순대 한 접시",price:200,fill:35,desc:"막장 콕 찍어 먹는 찰순대"}];
// 방앗간 떡: 쌀(되)과 삯을 내면 뽑아 줘요
const MILL_FOOD=[
  {id:"garaetteok",name:"가래떡",rice:2,fee:50,fill:30,desc:"방앗간에서 갓 뽑은 말랑한 가래떡"},
  {id:"injeolmi",name:"인절미",rice:2,fee:80,fill:30,desc:"콩고물 듬뿍 묻힌 쫀득한 인절미"}];
const MILL={ssalSell:120};
// 모닥불에 구워 먹는 것 (분교 운동장 큰 모닥불, play/village3.js)
const FIRE_FOOD=[
  {id:"s_marsh",name:"구운 마시멜로",fill:6,desc:"겉은 노릇 바삭, 속은 쭉 늘어나요"},
  {id:"tan_marsh",name:"까맣게 탄 마시멜로",fill:3,desc:"탔지만 그래도 달아요"},
  {id:"gun_goguma",name:"군고구마",fill:35,desc:"호호 불며 껍질 벗기는 노란 속살"},
  {id:"gun_gamja",name:"구운 감자",fill:30,desc:"포슬포슬, 소금 콕 찍어서"},
  {id:"tan_goguma",name:"덜 익은 고구마",fill:15,desc:"속이 아직 딱딱해요"},
  {id:"suyuk",name:"김장 수육 쌈",fill:30,desc:"갓 버무린 김치에 수육 한 점"}]; // 쌀 한 되 파는 값
// 아무 음식이나 이름·든든함·물 찾기
const anyFood=id=>RECIPES.find(r=>r.id===id)||MARKET_FOOD.find(f=>f.id===id)||DABANG_MENU.find(f=>f.id===id)||JANG_FOOD.find(f=>f.id===id)||MILL_FOOD.find(f=>f.id===id)||FIRE_FOOD.find(f=>f.id===id);
const dishName=id=>(anyFood(id)||{name:"음식"}).name;
// 받침 붙이기: josa("감자전","을","를") → "감자전을"
const josa=(w,a,b)=>{const c=w.charCodeAt(w.length-1)-0xAC00;return w+(c>=0&&c<11172&&c%28?a:b)};
const LOCKED_SEASON=[{name:"동지 팥죽",when:"동지 무렵"},{name:"대보름 나물",when:"입춘 무렵"},{name:"단오 수리취떡",when:"망종 무렵"}];

// 귀농 레벨: 필요한 땀방울과 레벨이 오르면 생기는 것 (DESIGN.md 3번)
// 귀농 레벨 (2026-11-13 조정): 처음 두 단계는 금방, 그 뒤로는 오래 걸려요. 땀방울은 밭일·마당일·노가다 할 때마다 쌓여요
const LEVELS=[
  {name:"새내기 귀농인",xp:0,perk:"호미 한 자루로 시작해요"},
  {name:"텃밭지기",xp:40,perk:"호미질이 손에 익었어요 · 밭 갈기가 2번이면 돼요"},
  {name:"농사꾼",xp:150,perk:"흙 덮기가 한 번에 돼요"},
  {name:"베테랑 농부",xp:800,perk:"물 주기 감이 생겼어요 · 초록 칸이 넓어져요"},
  {name:"마을 일꾼",xp:2000,perk:"큰 물뿌리개 (준비 중)"},
  {name:"이름난 농부",xp:4000,perk:"장터 사람들이 알아봐요 (준비 중)"},
  {name:"터줏대감",xp:7000,perk:"경운기 (준비 중)"},
  {name:"귀농 명인",xp:12000,perk:"마을의 자랑 (준비 중)"}];

// 가구: 목공소 목수 할아버지한테 사면 집 안 정해진 자리에 들여 줘요 (모양·자리는 world/room.js 의 FURN_SLOT)
// room: 놓는 칸 (대청·건넌방은 넓힌 집부터, 사랑방은 큰 집부터). use: 누르면 쓸 수 있는 가구
const FURN={
  bandaji:{name:"반닫이",room:"anbang",price:800,desc:"앞판을 반만 여닫는 나무 궤. 위엔 청자 항아리"},
  gyeongdae:{name:"경대",room:"anbang",price:600,desc:"거울 달린 작은 화장대",use:"거울 속 얼굴이 햇볕에 까무잡잡하게 그을렸네요. 시골 사람 다 됐어요"},
  byeongpung:{name:"병풍",room:"anbang",price:1500,desc:"꽃과 새를 그린 네 폭 병풍. 베갯머리에 둘러요"},
  hwaro:{name:"화로",room:"anbang",price:400,desc:"숯불 담는 무쇠 화로. 겨울밤 손 쬐기",use:"화롯불에 손을 쬐니 손끝까지 따뜻해요. 밤 하나 구워 먹고 싶네요"},
  clock:{name:"괘종시계",room:"anbang",price:1200,desc:"벽에 거는 시계. 누르면 댕댕 시간을 알려 줘요",use:true},
  mulddok:{name:"물독",room:"kitchen",price:300,desc:"부엌 큰 물항아리. 집 안에서도 물을 마셔요",use:true},
  chanjang:{name:"찬장",room:"kitchen",price:900,desc:"유리문 찬장. 누르면 창고를 봐요",use:true},
  dwiju:{name:"뒤주",room:"kitchen",price:700,desc:"쌀 담는 나무 궤",use:"뒤주가 텅 비었어요. 논농사를 지으면 쌀로 채울 수 있어요"},
  seonban:{name:"그릇 선반",room:"kitchen",price:400,desc:"부뚜막 위 벽에 다는 사발 선반"},
  radio:{name:"라디오",room:"daecheong",price:800,desc:"누르면 날씨와 마을 소식을 들려줘요",use:true},
  nancho:{name:"난초 화분",room:"daecheong",price:300,desc:"대청 한쪽 난초. 은은한 향"},
  jokja:{name:"족자",room:"daecheong",price:500,desc:"'가화만사성' 붓글씨 족자"},
  chaekjang:{name:"책장",room:"geonneon",price:700,desc:"농사책과 옛날 소설책이 빼곡"},
  jaebongteul:{name:"재봉틀",room:"geonneon",price:1000,desc:"발로 밟아 돌리는 옛날 재봉틀",use:"드르륵드르륵… 해진 작업복을 기웠어요"},
  sonnim:{name:"손님 이불",room:"geonneon",price:600,desc:"손님 오면 펴 드리는 이불 한 채"},
  seoan:{name:"서안",room:"sarang",price:900,desc:"사랑방 책상. 책과 벼루, 붓",use:"먹을 갈아 붓글씨 한 자 써 봐요. 마음이 차분해져요"},
  mungap:{name:"문갑",room:"sarang",price:1100,desc:"낮고 긴 서랍장. 위엔 도자기"},
  sabang:{name:"사방탁자",room:"sarang",price:1000,desc:"네 면이 트인 선반. 도자기와 책"}};
const ROOM_NAME={kitchen:"부엌",anbang:"안방",daecheong:"대청마루",geonneon:"건넌방",sarang:"사랑방"};
const ROOM_LV={kitchen:1,anbang:1,daecheong:2,geonneon:2,sarang:3}; // 그 칸이 생기는 집 단계

// 집 단계
const HOUSE_LV=[{name:"작은 기와집",W:5,D:3.4},{name:"넓힌 기와집",W:6.6,D:4,cost:2000},{name:"큰 기와집과 사랑채",W:8.4,D:4.6,cost:5000}];

// 밭 넓히기 · 닭장 · 외양간 (짓고 넓히는 건 집 안 "살림 장부"에서)
const UPG={field:[null,null,null,{n:"밭 4줄로 넓히기",cost:1500},{n:"밭 5줄로 넓히기",cost:3000}],coop:{cost:1500},hen:{cost:300,max:5}};
const COOP_LV=[null,{name:"닭장",max:5,cost:1500},{name:"넓힌 닭장",max:10,cost:1800}];
const BARN_LV=[null,{name:"외양간",cow:2,goat:2,cost:2500},{name:"넓힌 외양간",cow:4,goat:4,cost:4000}];
// 가축: 사는 곳은 따로예요. 닭은 장터 닭집 아저씨(매일), 송아지·새끼 염소는 우시장 소장수(장날만)
// 어린 가축은 여물을 먹으며 자라요 (feed번 먹으면 다 큼). 여물은 FEED_SEC마다 한 번 (초안: 30초 · 실제: 하루 한 번)
const ANIMALS={
  hen:{name:"닭",buy:300,sell:150},
  calf:{name:"송아지",kind:"cow",buy:1800,sell:1300,feed:5,grown:"cow",desc:"여물 다섯 번이면 큰 소가 돼요"},
  cow:{name:"한우",kind:"cow",sell:4200,desc:"다 자란 누렁소"},
  kid:{name:"새끼 염소",kind:"goat",buy:600,sell:420,feed:3,grown:"goat",desc:"여물 세 번이면 다 커요"},
  goat:{name:"흑염소",kind:"goat",sell:1400,desc:"다 자란 흑염소"}};
const FEED_SEC=30;

// 예시 이웃 (나중에 실제 사용자로 바뀔 부분)
const ago=s=>Date.now()-s*1000;
const NB=[
  {name:"옆집 할머니",roof:0x7a4a3a,lv:2,greet:"아이고 왔어? 감자 잘 익었제",chick:false,treat:["jeon","sikhye"],treatSay:"배고프제? 감자전 부쳐 놨다. 식혜도 마시고",
   plots:()=>[{crop:"potato",wat:ago(99)},{crop:"potato",wat:ago(99)},{crop:"potato",wat:ago(20)},{crop:"lettuce",wat:null},null,{crop:"lettuce",wat:ago(99)},{crop:"tomato",wat:ago(10)},null,{crop:"potato",wat:null}]},
  {name:"이장님",roof:0x2f4a5c,lv:3,greet:"어서 오게. 부지런히 가꾸면 자네 땅도 이렇게 된다네",chick:true,full:true,treat:["pajeon","makgeolli","bulgogi"],treatSay:"마침 잘 왔네. 부추전에 막걸리 한잔 하게",sub:"마을에서 제일 잘사는 집 · 소, 염소, 닭장, 강아지, 고양이",
   plots:()=>[{crop:"tomato",wat:ago(99)},{crop:"tomato",wat:ago(99)},{crop:"tomato",wat:ago(99)},{crop:"potato",wat:ago(99)},{crop:"lettuce",wat:null},{crop:"potato",wat:ago(99)},{crop:"lettuce",wat:ago(99)},{crop:"lettuce",wat:ago(99)},{crop:"lettuce",wat:ago(99)}]},
  {name:"귀농 2년차",roof:0x6b5a3f,lv:1,greet:"저도 작년엔 다 말려 죽였어요 하하",chick:false,treat:["salad","hotteok"],treatSay:"샐러드 만들어 봤는데 맛 좀 봐 주세요! 호떡도 있어요",
   plots:()=>[{crop:"lettuce",wat:null},{crop:"lettuce",wat:null},null,{crop:"potato",wat:ago(5)},null,{crop:"lettuce",wat:ago(99)},null,{crop:"tomato",wat:null},null]}];

// 24절기
const TERMS=[[1,6,"소한"],[1,20,"대한"],[2,4,"입춘"],[2,19,"우수"],[3,6,"경칩"],[3,21,"춘분"],[4,5,"청명"],[4,20,"곡우"],[5,6,"입하"],[5,21,"소만"],[6,6,"망종"],[6,21,"하지"],[7,7,"소서"],[7,23,"대서"],[8,8,"입추"],[8,23,"처서"],[9,8,"백로"],[9,23,"추분"],[10,8,"한로"],[10,23,"상강"],[11,7,"입동"],[11,22,"소설"],[12,7,"대설"],[12,22,"동지"]];
function termNow(d){const m=d.getMonth()+1,day=d.getDate();let t=TERMS[TERMS.length-1][2];TERMS.forEach(([tm,td,n])=>{if(m>tm||(m===tm&&day>=td))t=n});return t}

/* ---------- 날씨 (초안: 날짜로 정해지는 가상 날씨 · 실제 버전은 기상 예보와 연결) ---------- */
const WX_NOTE={"맑음":"맑은 날 · 물 주는 걸 잊지 마세요","흐림":"흐린 날 · 작물은 평소대로 자라요","비":"비 오는 날 · 밭에 저절로 물이 들어요","눈":"눈 오는 날 · 녹은 눈이 밭을 적셔요"};
function dayWeather(d){const key=d.getFullYear()*500+d.getMonth()*40+d.getDate();const r=((Math.sin(key*12.9898)*43758.5453)%1+1)%1,m=d.getMonth()+1,winter=m===12||m<=2;
  return r<0.5?"맑음":r<0.72?"흐림":winter?"눈":"비"}
const WX_CYCLE=["맑음","흐림","비","눈"];
