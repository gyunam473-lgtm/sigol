/* 궂은 날씨: 큰비 · 태풍 · 서리. 보통 비는 고마운 비(저절로 물 주기)지만, 이건 대비 안 하면 작물이 못 쓰게 돼요.
   - 전날 낮부터 이장님이 확성기로 알려 줘요 (오른쪽 위 날씨 칸에도 빨간 글씨로)
   - 밭 칸을 누르면 대비 손동작: 큰비 → 물꼬 트기(고랑 두 줄 긋기), 태풍 → 지주대 묶기(네 군데 콕콕), 서리 → 비닐 덮기(쓸어 덮기)
   - 다 익은 건 미리 거두면 무사해요. 대비 안 한 칸은 죽어요. 죽은 칸을 누르면 걷어 내고 다시 심어요
   날짜로 정해지는 가상 예보예요. 나중에 기상청 특보(호우·태풍·서리)와 연결할 곳 */

const WX_EV={
  heavy:{name:"큰비",prep:"물꼬 트기",step:"drain",hour:15,dur:2,start:"후두둑… 하늘이 시커메지더니 큰비가 쏟아져요!",dead:"물에 잠겨 뿌리가 썩었어요",say:"큰비가 온답니다. 밭 고랑 물꼬들 트십시오",col:0x5a4a3a},
  typhoon:{name:"태풍",prep:"지주대 묶기",step:"stake",hour:21,dur:3,start:"휘이잉— 태풍이 몰아쳐요! 나무가 휘청거려요",dead:"바람에 쓰러져 꺾였어요",say:"태풍이 올라온답니다. 작물마다 지주대 단단히 묶으십시오",col:0x6a5a3a},
  frost:{name:"서리",prep:"비닐 덮기",step:"vinyl",hour:5,dur:2.5,start:"으슬으슬… 밭에 하얗게 서리가 내려요",dead:"서리를 맞아 얼어 버렸어요",say:"서리가 내린답니다. 밭에 비닐들 덮으십시오",col:0xb8b2a6}};
const dayKey=d=>d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
// 그날 궂은 날씨가 있으면 {id, kind, at(오는 때), warn(알리기 시작)}
function eventOn(d){
  const m=d.getMonth()+1,key=d.getFullYear()*500+d.getMonth()*40+d.getDate(),r=((Math.sin(key*78.233+3.1)*43758.5453)%1+1)%1;
  let kind=null;
  if(m>=7&&m<=9&&r<0.07)kind="typhoon";else if(m>=6&&m<=8&&r<0.2)kind="heavy";else if((m===5||m===9)&&r<0.1)kind="heavy";
  else if([3,4,10,11].includes(m)&&r<0.15)kind="frost";else if((m===12||m<=2)&&r<0.22)kind="frost";
  if(!kind)return null;const at=+new Date(d.getFullYear(),d.getMonth(),d.getDate(),WX_EV[kind].hour);
  return {id:dayKey(d)+"-"+kind,kind,at,warn:at-18*3600e3,dur:WX_EV[kind].dur*3600e3}}
// 일주일 전부터 내일까지의 궂은 날씨 (+ 체험용 시험 날씨)
function stormList(){const L=[],now=new Date();for(let k=-7;k<=1;k++){const d=new Date(now);d.setDate(now.getDate()+k);const e=eventOn(d);if(e)L.push(e)}if(S.testEv)L.push(S.testEv);return L}
// 지금 알리는 중인 (아직 안 온) 궂은 날씨
// 지금 들이닥친 (오는 중인) 궂은 날씨
function stormActive(){const n=Date.now();return stormList().find(e=>!S.wxDone[e.id]&&n>=e.at&&n<e.at+e.dur)||null}
function stormWarn(){const n=Date.now();return stormList().filter(e=>!S.wxDone[e.id]&&n>=e.warn&&n<e.at).sort((a,b)=>a.at-b.at)[0]||null}
const isPrepped=(p,e)=>p&&p.prep&&p.prep.ev===e.id;
// "내일 새벽 5시", "오늘 오후 3시", "2분 뒤"
function whenText(at){const n=Date.now(),d=new Date(at),mins=Math.round((at-n)/60000);
  if(mins<60)return Math.max(1,mins)+"분 뒤";const h=d.getHours(),day=d.getDate()===new Date().getDate()?"오늘":"내일";
  return day+" "+(h<6?"새벽":h<12?"아침":h<18?"오후":"밤")+" "+(h%12||12)+"시"}
function stormLine(e){const W=WX_EV[e.kind],my=S.plots.filter(p=>p&&!p.dead),ok=my.filter(p=>isPrepped(p,e)).length;
  return `${whenText(e.at)} ${W.name} 예보 · 밭을 눌러 ${W.prep}`+(my.length?` (${ok}/${my.length}칸)`:"")}

S.wxDone=S.wxDone||{};S.wxHeard=S.wxHeard||{};S.wxStart=S.wxStart||{};
// 큰비·태풍 오는 날은 하루 종일 비
{const e=eventOn(new Date());if(e&&e.kind!=="frost")weather.kind="비"}

// 몇 초마다: 처음 알게 되면 이장님 방송, 때가 되면 밭에 들이닥쳐요
function checkStorms(){
  const w=stormWarn();
  if(w&&!S.wxHeard[w.id]){S.wxHeard[w.id]=1;save();setTimeout(()=>toast("확성기: \"아아, 이장입니다. "+whenText(w.at)+" "+WX_EV[w.kind].say+".\""),1200)}
  const n=Date.now(),a=stormActive();
  if(a&&!S.wxStart[a.id]){S.wxStart[a.id]=1;save();toast(WX_EV[a.kind].start+(S.plots.some(p=>p&&!p.dead&&!isPrepped(p,a))?" · 대비 안 한 밭이 걱정이에요":""));if(a.kind!=="frost"&&!weather.preview){weather.kind="비";applyTime()}setAmbience()}
  stormList().filter(e=>!S.wxDone[e.id]&&n>=e.at+e.dur).forEach(e=>{strike(e);if(e.kind!=="frost"&&!weather.preview){weather.kind=dayWeather(new Date());applyTime()}setAmbience()});
  refreshStorm();
}
function strike(e){
  S.wxDone[e.id]=1;if(e===S.testEv||(S.testEv&&S.testEv.id===e.id))S.testEv=null;
  const W=WX_EV[e.kind],dead=[],safe=[];
  S.plots.forEach((p,i)=>{if(!p||p.dead||(p.pt&&p.pt>e.at))return;
    if(isPrepped(p,e)){safe.push(CROPS[p.crop].name);delete p.prep}else{p.dead=e.kind;delete p.prep;dead.push(CROPS[p.crop].name)}});
  save();for(let i=0;i<15;i++)drawPlot(i,true);refresh();
  if(!dead.length&&!safe.length)return;
  const msg=W.name+(dead.length?" · 밭 "+dead.length+"칸이 "+W.dead:"")+(safe.length?" · "+W.prep+" 한 "+safe.length+"칸은 무사해요":"");
  if(SIT||W_busy())return toast(msg);
  openSheet(`<h2>${josa(W.name,"이","가")} 지나갔어요</h2>`+(dead.length?`<div class="item"><div>못 쓰게 된 밭 ${dead.length}칸<small>${dead.join(", ")} · ${W.dead}. 밭을 누르면 걷어 내고 다시 심을 수 있어요</small></div></div>`:"")
    +(safe.length?`<div class="item"><div>지켜 낸 밭 ${safe.length}칸<small>${safe.join(", ")} · ${W.prep} 덕분에 무사해요</small></div><span class="done">잘했어요</span></div>`:"")
    +(dead.length&&!safe.length?`<p class="hint">이장님 방송이 나오면 밭을 눌러 미리 대비해요.</p>`:""));
}
const W_busy=()=>!!(typeof W!=="undefined"&&W)||!!(typeof CK!=="undefined"&&CK)||!!LIE;
function refreshStorm(){const el=$("wxWarn");if(!el)return;const a=stormActive(),w=a||stormWarn();el.hidden=!w;if(!w)return;
  if(a){const my=S.plots.filter(p=>p&&!p.dead),ok=my.filter(p=>isPrepped(p,a)).length;el.textContent=`지금 ${WX_EV[a.kind].name} ${a.kind==="frost"?"내리는":"몰아치는"} 중`+(my.length?` · 대비한 밭 ${ok}/${my.length}칸`:"")}
  else el.textContent=stormLine(w)}
setInterval(()=>{if(me)checkStorms()},2000);

// 체험용: 2분 뒤에 궂은 날씨 (살림 장부)
// 체험용: 90초 뒤에 와서 45초 동안 (실제로는 2~3시간)
function testStorm(kind){const n=Date.now();S.testEv={id:"test-"+n,kind,at:n+90000,warn:n,dur:45000};save();checkStorms()}
