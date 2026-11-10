/* 요리 도감 창 (DESIGN.md 5번: "밥상 일기"로 바꿀 곳) */

$("dexBtn").onclick=()=>{let h='<h2>요리 도감</h2><h3>집에서 해 먹은 음식</h3>';
  RECIPES.forEach(r=>{h+=`<div class="item"><div>${S.dex[r.id]?r.name:"???"}<small>${S.dex[r.id]?r.desc:"재료: "+needText(r)}${r.terms?" · "+r.when+"에만":""}</small></div>${S.dex[r.id]?'<span class="done">완성</span>':""}</div>`});
  h+='<h3>밥상 일기 · 최근에 먹은 것</h3>';
  const ml=(S.meals||[]).slice(0,5);
  if(!ml.length)h+='<p class="hint">아직 비어 있어요. 평상이나 장터 정자에 앉아 먹으면 여기에 적혀요.</p>';
  ml.forEach(m=>{h+=`<div class="item"><div>${m.n}<small>${m.d} · ${m.at}에서 · ${m.w}</small></div></div>`});
  h+=cropDexHtml()+fishDexHtml()+forageDexHtml()+bugDexHtml()+hulgiDexHtml();
  h+='<h3>다가오는 절기 요리</h3>';
  LOCKED_SEASON.forEach(r=>{h+=`<div class="item"><div>${r.name}<small>${r.when}에 열려요</small></div><button disabled>기다리기</button></div>`});
  openSheet(h)};
