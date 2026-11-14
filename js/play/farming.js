/* 농사: 밭 칸 누르기, 물방울 효과, 달걀 꺼내기. 손동작 작업 화면은 play/work.js */

/* ---------- 물방울 ---------- */
const drops=[];
function splash(x,z){for(let i=0;i<10;i++){const d=sph(0.06,0x6fb6e0,x+(Math.random()-.5),1.4,z+(Math.random()-.5));d.castShadow=false;d.userData.v=-(1+Math.random()*2);scene.add(d);drops.push(d)}}

let workT=0;
// 밭 칸을 누르면: 빈 칸은 심기, 심어 둔 칸은 물 주기, 다 자란 칸은 거두기 작업 화면이 열려요 (play/work.js)
function usePlot(i){
  const p=S.plots[i];
  if(p&&p.dead){S.plots[i]=null;sweat(1);workT=0.5;sfx("scrape");drawPlot(i,true);save();refresh();toast("못 쓰게 된 "+CROPS[p.crop].name+"를 걷어 냈어요. 다시 심을 수 있어요");return}
  const on=stormActive();if(on){toast(on.kind==="frost"?"벌써 서리가 내렸어요. 대비는 미리 해야 해요":"지금은 "+WX_EV[on.kind].name+" 때문에 밭일을 할 수 없어요. 대비는 미리 해야 해요");return}
  const ev=stormWarn();
  if(ev&&p&&!isPrepped(p,ev)&&stageOf(p)!=="ripe"){startWork(i,"prep");return} // 궂은 날씨 예보: 대비부터 (다 익은 건 거두면 돼요)
  if(!p){openSeedPick(i);return}
  else if(!p.wat)startWork(i,"water");
  else{tickIssues(p);const pr=growPr(p),left=(1-pr)*CROPS[p.crop].grow;
    if(pr>=1)startWork(i,"harvest");
    else if(activeIssues(p).length)startWork(i,"tend"); // 목마름·잡초·벌레 돌보기
    else toast(CROPS[p.crop].name+" 자라는 중이에요 · "+Math.ceil(left)+"초 남음 · 돌봄 "+careDots(tendScore(p)))}}

// 빈 밭을 누르면: 무엇을 심을지 고르고 → 손동작으로 심어요
function openSeedPick(i){
  // 2026-11-14 철마다 심는 게 달라요: 이번 철 작물(가진 씨앗 먼저) → 씨앗은 있지만 철이 아닌 것(흐리게)
  const se=SEASON_NAME[seasonOf(new Date())],now=sowCrops().sort((a,b)=>(S.seeds[b]>0)-(S.seeds[a]>0)),later=Object.keys(CROPS).filter(k=>!sowNow(k)&&S.seeds[k]>0),any=now.some(k=>S.seeds[k]>0);
  const row=(k,ok)=>{const c=CROPS[k],n=S.seeds[k]||0;return `<div class="good ${n&&ok?"":"lack"}"><div class="gname">${c.name}<small>${ok?"씨앗 "+n+"봉지 · "+c.grow+"초면 자라요(초안) · 거두면 "+c.yield+"개쯤, 하나에 "+c.price+"원":"씨앗 "+n+"봉지 · "+sowText(k)+"에 심어요"}</small></div><div class="gbtn"><button class="go" data-plant="${k}" ${n&&ok?"":"disabled"}>${!ok?sowText(k)+"에":n?"심기":"씨앗 없음"}</button></div></div>`};
  let h=`<h2>무엇을 심을까요?</h2><p class="hint">지금은 <b>${se}</b>이에요. 철에 맞는 걸 심어요</p><div class="goods">${now.map(k=>row(k,true)).join("")}</div>`;
  if(later.length)h+=`<h3>철이 아니라 기다려요</h3><div class="goods">${later.map(k=>row(k,false)).join("")}</div>`;
  h+=`<p class="hint">${any?"고르면 밭 갈기부터 손으로 해요.":"이번 철 씨앗이 없어요."} 씨앗은 장터 씨앗가게 할아버지한테 사요.</p>`;
  openSheet(h);sheet.classList.add("seedpick");
  sheet.querySelectorAll("[data-plant]").forEach(b=>b.onclick=()=>{S.sel=b.dataset.plant;closeSheet();startWork(i,"plant")});
}
// 닭장에서 달걀 꺼내기
function useCoop(){
  if(mode!=="home"){toast(visiting.name+"네 닭들이 모이를 쪼고 있어요");return}
  const n=eggsReady();
  if(!n){toast("아직 달걀이 없어요. 닭들이 열심히 품는 중이에요");return}
  S.inv.egg+=n;S.eggT=Date.now();workT=0.5;sfx("pop");sweat(1);save();updateEggs();refresh();toast("달걀 "+n+"개를 꺼냈어요")}
