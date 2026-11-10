/* 저장과 공통 도구: 내 땅 정보(돈, 씨앗, 밭)를 휴대폰에 저장하고 불러와요. 지금 어디에 있는지(우리 땅/이웃/장터)도 여기서 기억해요. */

const $=id=>document.getElementById(id);
let S={money:500,seeds:{lettuce:3,potato:2,tomato:1,cabbage:0},inv:{},plots:Array(15).fill(null),dex:{},sel:"lettuce",fieldCols:3,houseLv:1,coop:false,hens:0,eggT:0,dishes:[],meals:[]};
try{const s=JSON.parse(localStorage.getItem("sigol1")||"null");if(s)S=Object.assign(S,s)}catch(e){}
S.inv=Object.assign(Object.fromEntries(Object.keys(ITEMS).map(k=>[k,0])),S.inv);S.seeds=Object.assign({lettuce:0,potato:0,tomato:0,cabbage:0},S.seeds);
while(S.plots.length<15)S.plots.push(null);
if(S.coop&&!S.coopLv)S.coopLv=1; // 예전 저장: 닭장 있으면 1단계
S.herd=S.herd||[];S.furn=S.furn||{};
// 처음엔 장작 10개를 쌓아 두고 시작해요
if(!S.woodInit){S.woodInit=1;S.inv.jangjak=(S.inv.jangjak||0)+10}
S.reports=S.reports||[];S.skill=S.skill||{};S.fishDex=S.fishDex||{};S.forageDex=S.forageDex||{};
// 망태 속 물고기 하나하나의 크기 (값이 크기 따라 달라요). 예전 저장은 보통 크기로 채워요
S.bag=S.bag||[];Object.keys(FRESH).forEach(k=>{const have=S.bag.filter(b=>b.k===k).length;for(let i=have;i<(S.inv[k]||0);i++)S.bag.push({k,cm:Math.round((FRESH[k].cm[0]+FRESH[k].cm[1])/2)})});
const save=()=>{S.lastSeen=Date.now();try{localStorage.setItem("sigol1",JSON.stringify(S))}catch(e){}};

function toast(t){const e=$("toast");e.textContent=t;e.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("on"),Math.max(2200,t.length*75))}

// 지금 있는 곳: home(우리 땅) · visit(이웃 땅) · plaza(장터)
let mode="home";
let visiting=null;
let nbPlots=[];
const vp=()=>visiting?nbPlots:S.plots;
const today=new Date().toISOString().slice(0,10);
