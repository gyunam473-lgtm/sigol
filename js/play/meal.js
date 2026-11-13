/* 밥심: 들고 가기 · 든든함 · 물 · 새참 기운 (DESIGN.md 4번)
   - 들고 가기: 요리를 다 하면 접시를 두 손에 들고 다녀요. 평상을 누르면 소반에 내려놓고,
     장터 정자에 앉으면 상에 올려 먹고, 이웃집을 누르면 갖다드릴 수 있어요.
     밭일이나 다른 요리를 시작하면 들고 있던 건 평상 소반에 올려 둬요 (자리가 있으면).
   - 물(0~100): 일하면 든든함보다 빨리 줄어요. 맑은 여름날엔 더 빨리, 비 오는 날엔 천천히. 마당 우물에서 마시거나 식혜·국수로 채워요.
   - 든든함(0~100): 일하면 조금씩 줄고 먹으면 차요. 출출해도 일은 다 할 수 있어요. 손이 조금 느려질 뿐.
   - 새참 기운: 일하다가(15분 안) 평상·정자에서 먹으면 10분 동안 손이 빨라지고, 거둘 때 하나 더 나올 때가 있어요. */

const HUNGRY=25;               // 이보다 낮으면 출출해요
const FULL_PER_SWEAT=1.2;      // 땀방울 하나에 줄어드는 든든함
const BOOST_MIN=10,WORK_RECENT_MIN=15;
const WATER_PER_SWEAT=1.6;     // 땀방울 하나에 줄어드는 물
const fullNow=()=>S.full==null?70:S.full;
const waterNow=()=>S.water==null?80:S.water;
const hungry=()=>fullNow()<HUNGRY;
const thirsty=()=>waterNow()<HUNGRY;
const drinkOf=id=>(anyFood(id)||{}).drink||0;
// 날씨와 계절에 따라 목이 마른 정도: 맑은 여름날 1.4배, 비·눈 오는 날 0.7배
const thirstRate=()=>{const w=weather.kind,s=seasonOf(new Date());return (w==="비"||w==="눈")?0.7:w==="맑음"&&s===1?1.4:1};
const boosted=()=>(S.boost||0)>Date.now();
const fillOf=id=>(anyFood(id)||{fill:20}).fill||20;

// 일하면 든든함이 줄어요 (level.js 의 sweat 에서 불러요)
function tire(n){if(S.warmUntil>Date.now())n*=0.5; // 모닥불 곁에 있었으면 덜 지쳐요 (play/village2.js)
  const before=fullNow(),wb=waterNow();S.full=Math.max(0,before-n*FULL_PER_SWEAT);S.water=Math.max(0,wb-n*WATER_PER_SWEAT*thirstRate());S.lastWork=Date.now();
  if(wb>=HUNGRY&&S.water<HUNGRY)setTimeout(()=>toast("목이 말라요. 손이 조금 느려졌어요 · 마당 우물에서 물 한 바가지 어때요?"),900);
  else if(before>=HUNGRY&&S.full<HUNGRY)setTimeout(()=>toast("배가 출출해요. 손이 조금 느려졌어요 · 평상에서 새참 먹을까요?"),900);
}
// 먹으면 차요. 일하다 먹으면 새참 기운
const BAPSIM=15; // 밥과 반찬을 10분 안에 같이 먹으면 든든함 더
function nourish(id,where){
  const isBap=id==="bap",side=!isBap&&!drinkOf(id),now=Date.now();let bonus=0;
  if(isBap&&S.sideAt&&now-S.sideAt<600000||side&&S.bapAt&&now-S.bapAt<600000){bonus=BAPSIM;S.sideAt=S.bapAt=0}else{if(isBap)S.bapAt=now;if(side)S.sideAt=now}
  S.full=Math.min(100,fullNow()+fillOf(id)+bonus);if(bonus)setTimeout(()=>toast("밥이랑 반찬을 같이 먹으니 밥심이 나요! 든든함 +"+bonus),1200);if(drinkOf(id))S.water=Math.min(100,waterNow()+drinkOf(id));
  const worked=S.lastWork&&Date.now()-S.lastWork<WORK_RECENT_MIN*60000;
  if(worked){S.boost=Date.now()+BOOST_MIN*60000;S.lastWork=0;return "새참 기운이 났어요! "+BOOST_MIN+"분 동안 손이 빨라져요"}
  return ""}

/* ---------- 찬장 (2026-11-13) ----------
   받아 온 음식(김장김치·떡·싸 온 음식 …)은 평상에 바로 올리지 않고 찬장에 넣어 둬요.
   우리 평상에 앉으면 "찬장에서 꺼내기"로 골라서 소반에 올려 먹어요 */
const PANTRY_MAX=20;
function toPantry(id,n=1){S.pantry=S.pantry||[];let k=0;for(let i=0;i<n&&S.pantry.length<PANTRY_MAX;i++){S.pantry.push(id);k++}return k}
function pantryHtml(){const P=S.pantry||[];if(!P.length)return "";const cnt={};P.forEach(id=>cnt[id]=(cnt[id]||0)+1);
  return `<h3>찬장 · 넣어 둔 음식 ${P.length}개</h3>`+Object.entries(cnt).map(([id,n])=>`<div class="item"><div>${dishName(id)}<small>${n}개 · 꺼내서 소반에 올려요</small></div><button data-pan="${id}" ${S.dishes.length<DISH_MAX?"":"disabled"}>꺼내기</button></div>`).join("")}
function bindPantry(after){document.querySelectorAll("[data-pan]").forEach(b=>b.onclick=()=>{const id=b.dataset.pan,i=(S.pantry||[]).indexOf(id);if(i<0||S.dishes.length>=DISH_MAX)return;
  S.pantry.splice(i,1);S.dishes.push(id);drawHomeTable();sfx("pop");save();toast(josa(dishName(id),"을","를")+" 찬장에서 꺼내 소반에 올렸어요");if(after)after()})}

/* ---------- 들고 가기 ---------- */
let holdMesh=null;
function setHold(id){
  S.hold=id||null;
  if(holdMesh){me.b.remove(holdMesh);holdMesh=null}
  if(S.hold){holdMesh=new THREE.Group();const d=dish3D(S.hold);d.scale.setScalar(1.6);holdMesh.add(d);
    [-1,1].forEach(k=>{const a=cyl(0.07,0.07,0.45,0x5a86b8,k*0.3,0.05,-0.24,6);a.rotation.x=Math.PI/2.4;holdMesh.add(a)}); // 두 팔
    holdMesh.position.set(0,1.0,0.5);me.b.add(holdMesh)}
  refresh();
}
// 평상 소반에 내려놓기. 성공하면 true
function putDownHome(quiet){
  if(!S.hold)return true;
  if(S.dishes.length>=DISH_MAX){if(!quiet)toast("평상 소반이 꽉 찼어요. 먼저 먹고 올려요");return false}
  const id=S.hold;S.dishes.push(id);drawHomeTable();setHold(null);save();
  toast(quiet?"들고 있던 "+josa(dishName(id),"은","는")+" 평상 소반에 올려 뒀어요":josa(dishName(id),"을","를")+" 소반에 내려놓았어요");
  return true}
// 다른 일을 시작할 때: 들고 있던 건 평상에 올려 둬요 (내 땅에서만)
function stashHold(){if(S.hold&&mode==="home")putDownHome(true)}
// 이웃에게 갖다드리기
function giveHold(n){
  const id=S.hold;if(!id)return;setHold(null);
  S.jeong=S.jeong||{};S.jeong[n.name]=(S.jeong[n.name]||0)+2;
  const a=Object.keys(CROPS)[Math.floor(Math.random()*4)],b=Object.keys(CROPS)[Math.floor(Math.random()*4)];S.seeds[a]++;S.seeds[b]++;
  sweat(1);save();refresh();closeSheet();
  const say={"옆집 할머니":"아이고, 이걸 다 해 왔어? 잘 먹을게. 손맛이 좋네","이장님":"허허, 자네 솜씨가 늘었구먼. 고맙네","귀농 2년차":"와, 저 이거 진짜 좋아해요! 감사합니다"}[n.name]||"잘 먹을게요!";
  toast(n.name+": "+say+" · 답례로 "+CROPS[a].name+"·"+CROPS[b].name+" 씨앗");
}

/* ---------- 우물: 마당에서 물 마시기 (돈 안 들어요) ---------- */
function drinkWell(){
  const before=waterNow();S.water=100;save();refresh();sfx("water");buzz(15);faceTo(well.position);
  toast(before>=90?"아직 목마르지 않아요. 시원하긴 하네요":"꿀꺽꿀꺽, 시원한 우물물 한 바가지!"+(thirsty()?"":" 손이 다시 가벼워요"));
  if(before<90){const b=wellBucket;let t=0;const iv=setInterval(()=>{t+=0.05;b.position.y=0.95+Math.sin(Math.min(1,t)*Math.PI)*0.5;if(t>=1){clearInterval(iv);b.position.y=0.95}},16)}
}

/* ---------- 화면 아래 든든함·물 줄 ---------- */
function refreshMeal(){
  const f=fullNow(),el=$("fullFill");if(!el)return;
  const w=waterNow();$("waterFill").style.width=w+"%";$("waterFill").classList.toggle("low",w<HUNGRY);$("waterNum").textContent=w<HUNGRY?"목말라요":w>=80?"시원해요":"괜찮아요";
  el.style.width=f+"%";el.classList.toggle("low",f<HUNGRY);
  const left=Math.ceil(((S.boost||0)-Date.now())/60000);
  $("fullNum").textContent=boosted()?"새참 기운 "+left+"분":f<HUNGRY?"출출해요":f>=80?"배불러요":"든든해요";
  $("fullNum").classList.toggle("boost",boosted());
}
setInterval(()=>{if(me)refreshMeal()},15000);
