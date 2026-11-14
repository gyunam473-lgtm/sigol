/* 귀농 레벨: 일할 때마다 땀방울이 쌓이고, 칭호가 오르면 손이 빨라져요 (DESIGN.md 3번)
   칭호와 필요한 땀방울 수는 core/data.js 의 LEVELS 에 있어요 */

function lvOf(xp){let l=0;LEVELS.forEach((L,i)=>{if(xp>=L.xp)l=i});return l}
const myLv=()=>lvOf(S.xp||0);
// 내 머리 위 칭호 ("나" 이름표 위 금빛 이름표). 레벨이 바뀌면 새로 달아요
let titleLv=-1;
function updateMyTitle(){if(!me)return;const lv=myLv();if(lv===titleLv&&me.title)return;titleLv=lv;
  if(me.title)me.g.remove(me.title);const t=label(LEVELS[lv].name,0.85,"title");t.position.y=3.08;t.userData.title=1;me.g.add(t);me.title=t}
let lvQueue=null; // 작업 중에 레벨이 오르면, 작업이 끝난 뒤에 알려 줘요

function sweat(n){
  const before=myLv();S.xp=(S.xp||0)+n;const after=myLv();tire(n); // 일하면 든든함이 조금 줄어요 (play/meal.js)
  if(after>before){lvQueue=after;if(!W&&!FS)showLevelUp()} // 낚시 중엔 끝난 뒤에 (끌어올리는 중에 창이 떠서 막혔어요)
}
function showLevelUp(){
  const a=lvQueue;lvQueue=null;if(a==null)return;const L=LEVELS[a];
  sfx("level");buzz([20,60,20]);refresh();
  openSheet(`<h2>귀농 레벨이 올랐어요</h2><p class="lvbig">${L.name}</p><div class="item"><div>새로 생긴 것<small>${L.perk}</small></div></div>`);
}
function openLevels(){
  const lv=myLv(),xp=S.xp||0;
  let h=`<h2>귀농 레벨</h2><h3>일할 때마다 땀방울이 쌓여요 · 지금 ${xp}방울</h3>`;
  LEVELS.forEach((L,i)=>{h+=`<div class="item"><div>${L.name}${i===lv?' <span class="done">· 지금 여기</span>':""}<small>땀방울 ${L.xp} · ${L.perk}</small></div>${i<lv?'<span class="done">지나왔어요</span>':""}</div>`});
  h+=`<h3>땀방울 얻는 법</h3><div class="item"><div>밭 갈기 2 · 이랑 1 · 씨 심기 1 · 흙 덮기 1 · 물 주기 1<small>거두기 2 (상품이면 1 더) · 요리 2 · 달걀 꺼내기 1 · 이웃 밭 물 주기 1</small></div></div>`;
  openSheet(h);
}
