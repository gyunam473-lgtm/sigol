/* 가축 기르기: 외양간 여물 주기, 가축 사고팔기 (사고파는 창은 screens/market.js 의 가게 주인 창)
   - 닭: 장터 닭집 아저씨 (매일). 닭장 자리만큼 (닭장 5마리 · 넓힌 닭장 10마리)
   - 송아지·새끼 염소: 우시장 소장수. 외양간 자리만큼
   - 어린 가축은 여물을 먹을 때마다 자라요. 다 크면 비싸게 팔 수 있어요 */

const coopMax=()=>S.coopLv?COOP_LV[S.coopLv].max:0;
const barnCap=kind=>S.barnLv?BARN_LV[S.barnLv][kind]:0;
const feedLeft=()=>Math.max(0,Math.ceil(FEED_SEC-(Date.now()-(S.fedAt||0))/1000));

// 사기: 성공하면 빈 문자열, 안 되면 이유
function buyAnimal(k){
  const A=ANIMALS[k];if(S.money<A.buy)return "돈이 모자라요";
  if(k==="hen"){if(!S.coopLv)return "닭장이 없어요";if(S.hens>=coopMax())return "닭장이 꽉 찼어요";
    S.money-=A.buy;S.hens++;if(S.hens===1)S.eggT=Date.now()}
  else{if(!S.barnLv)return "외양간이 없어요";if(herdCount(A.kind)>=barnCap(A.kind))return "외양간 "+(A.kind==="cow"?"소":"염소")+" 자리가 꽉 찼어요";
    S.money-=A.buy;S.herd.push({k,feed:0})}
  sfx("coin");save();applyLand();refresh();return ""}
// 팔기 (닭은 한 마리, 소·염소는 i번째)
function sellAnimal(k,i){
  if(k==="hen"){if(!S.hens)return 0;S.hens--;S.money+=ANIMALS.hen.sell;sfx("coin");save();applyLand();refresh();return ANIMALS.hen.sell}
  const a=S.herd[i];if(!a)return 0;const p=ANIMALS[a.k].sell;S.herd.splice(i,1);S.money+=p;sfx("coin");save();applyLand();refresh();return p}

/* ---------- 외양간 창 ---------- */
function openBarn(){
  const L=BARN_LV[S.barnLv],left=feedLeft();
  let h=`<div class="barnhead"><h2>${L.name}</h2><small>소 ${herdCount("cow")}/${L.cow} · 염소 ${herdCount("goat")}/${L.goat}</small></div>`;
  if(!S.herd.length)h+=`<p class="hint">아직 비어 있어요. 마을 우시장에서 송아지나 새끼 염소를 데려와요.</p>`;
  else{h+='<div class="goods">';
    S.herd.forEach(a=>{const A=ANIMALS[a.k],grow=A.feed?`<span class="dots">${Array.from({length:A.feed},(_,j)=>`<i class="${j<a.feed?"on":""}"></i>`).join("")}</span>`:"";
      h+=`<div class="good"><div class="gname">${A.name}<small>${A.feed?"여물 "+a.feed+"/"+A.feed+" · 다 크면 "+ANIMALS[A.grown].name:A.desc} · 팔면 ${A.sell.toLocaleString()}원</small>${grow}</div></div>`});
    h+='</div>';
    h+=`<button class="go wide" id="feedBtn" ${left?"disabled":""}>${left?"여물은 "+left+"초 뒤에 (실제로는 하루 한 번)":"여물 주기 · 볏짚을 썰어 줘요"}</button>`}
  openSheet(h);sheet.classList.add("barn");
  if($("feedBtn"))$("feedBtn").onclick=feedHerd;
}
function feedHerd(){
  if(feedLeft())return;S.fedAt=Date.now();const grown=[];
  S.herd.forEach(a=>{const A=ANIMALS[a.k];if(!A.feed)return;a.feed++;if(a.feed>=A.feed){grown.push(A.name);a.k=A.grown;a.feed=0}});
  sweat(1);sfx("water");buzz(15);save();applyLand();refresh();openBarn();
  toast(grown.length?grown.join(", ")+" 다 컸어요! 우시장에서 제값 받고 팔 수 있어요":"여물을 맛있게 먹어요. 음머~ 매에~");
}
