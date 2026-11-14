/* 저장과 공통 도구: 내 땅 정보(돈, 씨앗, 밭)를 휴대폰에 저장하고 불러와요. 지금 어디에 있는지(우리 땅/이웃/장터)도 여기서 기억해요. */

const $=id=>document.getElementById(id);
let S={money:500,seeds:{lettuce:3,potato:2,tomato:1,cabbage:0},inv:{},plots:Array(15).fill(null),dex:{},sel:"lettuce",fieldCols:3,houseLv:1,coop:false,hens:0,eggT:0,dishes:[],meals:[]};
// 저장이 깨져 읽히지 않으면 지우지 않고 따로 남겨 둬요(sigol1_bad). 하루 한 번 예비 저장(sigol1_bak)도
try{const raw=localStorage.getItem("sigol1");let s=null;try{s=JSON.parse(raw||"null")}catch(e){localStorage.setItem("sigol1_bad",raw);try{s=JSON.parse(localStorage.getItem("sigol1_bak")||"null")}catch(_){}}if(s)S=Object.assign(S,s)}catch(e){}
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){} // 브라우저가 저장을 함부로 지우지 않게 부탁해요
S.inv=Object.assign(Object.fromEntries(Object.keys(ITEMS).map(k=>[k,0])),S.inv);S.seeds=Object.assign(Object.fromEntries(Object.keys(CROPS).map(k=>[k,0])),S.seeds); // 새 작물이 늘어도 0부터
while(S.plots.length<15)S.plots.push(null);
if(S.coop&&!S.coopLv)S.coopLv=1; // 예전 저장: 닭장 있으면 1단계
S.herd=S.herd||[];S.furn=S.furn||{};
// 처음엔 장작 10개를 쌓아 두고 시작해요
// 처음 시작하는 사람은 이번 철에 심는 씨앗으로 (2026-11-14 철 작물)
if(!S.seedSeason){S.seedSeason=1;if(!S.lastSeen){const L=Object.keys(CROPS).filter(k=>CROPS[k].sow.includes(seasonOf(new Date())));S.seeds={};Object.keys(CROPS).forEach(k=>S.seeds[k]=0);L.slice(0,3).forEach((k,i)=>S.seeds[k]=[3,2,2][i])}}
if(!S.woodInit){S.woodInit=1;S.inv.jangjak=(S.inv.jangjak||0)+10}
S.reports=S.reports||[];S.skill=S.skill||{};S.fishDex=S.fishDex||{};S.forageDex=S.forageDex||{};
// 망태 속 물고기 하나하나의 크기 (값이 크기 따라 달라요). 예전 저장은 보통 크기로 채워요
S.bag=S.bag||[];Object.keys(FRESH).forEach(k=>{const have=S.bag.filter(b=>b.k===k).length;for(let i=have;i<(S.inv[k]||0);i++)S.bag.push({k,cm:Math.round((FRESH[k].cm[0]+FRESH[k].cm[1])/2)})});
const save=()=>{if(window.RESETTING)return;S.lastSeen=Date.now();try{const j=JSON.stringify(S);localStorage.setItem("sigol1",j);
  const d=new Date().toDateString();if(localStorage.getItem("sigol1_bakDay")!==d){localStorage.setItem("sigol1_bak",j);localStorage.setItem("sigol1_bakDay",d)}}
  catch(e){if(!save.warned){save.warned=1;setTimeout(()=>toast("저장 공간이 꽉 차서 저장이 안 됐어요. 휴대폰 저장 공간을 확인해 주세요"),500)}}};

// 오류 기록: 게임은 계속하고, 마지막 10개만 적어 둬요 (S.errLog)
function noteErr(e){try{const m=String(e&&(e.stack||e.message)||e).split(String.fromCharCode(10)).slice(0,2).join(" ").slice(0,200);S.errLog=(S.errLog||[]).slice(-9);if(!S.errLog.length||S.errLog[S.errLog.length-1].m!==m)S.errLog.push({m,t:Date.now()});if(!noteErr.shown){noteErr.shown=1;console.warn(m)}}catch(_){}}
function toast(t){const e=$("toast");e.textContent=t;e.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("on"),Math.max(2200,t.length*75))}

// 지금 있는 곳: home(우리 땅) · visit(이웃 땅) · plaza(장터)
let mode="home";
let visiting=null;
let nbPlots=[];
const vp=()=>visiting?nbPlots:S.plots;
const localDay=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
let today=localDay();setInterval(()=>{today=localDay()},30000); // 2026-11-14: 전엔 세계 표준시(UTC)라 하루가 아침 9시에 바뀌고, 켜 둔 채 자정을 넘겨도 안 바뀌었어요
