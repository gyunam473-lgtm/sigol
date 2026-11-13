/* 도감 창 (2026-11-13 탭으로 나눔): 요리 · 우리 밭 · 물고기 · 산나물 · 곤충 · 냇가 바닥
   탭마다 "찾은 것/전체"가 보여요. 아직 안 열린 건 🔒 와 함께 "숙련도 ○○가 되면" 다음 목표를 알려 줘요 */

const DEX_TABS=[
  {k:"cook",name:"요리",have:()=>Object.keys(S.dex).length,all:()=>RECIPES.length,html:cookDexHtml},
  {k:"crop",name:"우리 밭",have:()=>Object.values(S.cropDex||{}).filter(d=>d.n>0).length,all:()=>Object.keys(CROPS).length,html:()=>cropDexHtml()},
  {k:"fish",name:"물고기",have:()=>Object.keys(S.fishDex||{}).length,all:()=>Object.keys(FRESH).length,html:()=>fishDexHtml()},
  {k:"forage",name:"산나물",have:()=>Object.keys(S.forageDex||{}).length,all:()=>Object.keys(FORAGE).length,html:()=>forageDexHtml()},
  {k:"bug",name:"곤충",have:()=>Object.keys(S.bugDex||{}).length,all:()=>Object.keys(INSECTS).length,html:()=>bugDexHtml()},
  {k:"hulgi",name:"냇가 바닥",have:()=>Object.keys((S.hulgi||{}).got||{}).length+Object.keys((S.hulgi||{}).peb||{}).length,all:()=>HULGI.length+PEBBLES.length,html:()=>hulgiDexHtml()}];
const dexTotal=()=>DEX_TABS.reduce((a,t)=>[a[0]+t.have(),a[1]+t.all()],[0,0]);
function cookDexHtml(){let h='<h3>집에서 해 먹은 음식</h3>';
  RECIPES.forEach(r=>{h+=`<div class="item"><div>${S.dex[r.id]?r.name:"???"}<small>${S.dex[r.id]?r.desc:"재료: "+needText(r)}${r.terms?" · "+r.when+"에만":""}</small></div>${S.dex[r.id]?'<span class="done">완성</span>':""}</div>`});
  h+='<h3>밥상 일기 · 최근에 먹은 것</h3>';
  const ml=(S.meals||[]).slice(0,5);
  if(!ml.length)h+='<p class="hint">아직 비어 있어요. 평상이나 장터 정자에 앉아 먹으면 여기에 적혀요.</p>';
  ml.forEach(m=>{h+=`<div class="item"><div>${m.n}<small>${m.d} · ${m.at}에서 · ${m.w}</small></div></div>`});
  h+='<h3>다가오는 절기 요리</h3>';
  LOCKED_SEASON.forEach(r=>{h+=`<div class="item"><div>${r.name}<small>${r.when}에 열려요</small></div><button disabled>기다리기</button></div>`});
  return h}
let dexTab="cook";
function openDex(tab){if(tab)dexTab=tab;const [a,b]=dexTotal();
  let h=`<h2>도감 · ${a}/${b}</h2><div class="dextabs" role="tablist">${DEX_TABS.map(t=>{const x=t.have(),y=t.all();return `<button role="tab" aria-selected="${t.k===dexTab}" class="${t.k===dexTab?"on":""}${x>=y?" full":""}" data-dex="${t.k}">${t.name}<small>${x}/${y}</small></button>`}).join("")}</div>`;
  h+=`<div class="dexbody">${DEX_TABS.find(t=>t.k===dexTab).html()}</div>`;
  openSheet(h);sheet.classList.add("dex");sheet.querySelectorAll("[data-dex]").forEach(b=>b.onclick=()=>openDex(b.dataset.dex))}
$("dexBtn").onclick=()=>openDex();
