/* 밭 돌보기 (2026-11-10): 농사가 이 게임의 중심이라, 심고 끝이 아니라 자라는 동안 계속 돌봐야 해요
   - 물을 처음 주면 앞으로 생길 일이 정해져요: 목마름(꼭 한 번, 물을 다시 줘야 다시 자라요), 잡초(김매기), 벌레(잡기)
   - 생긴 일을 빨리 해결할수록 "돌봄" 점수가 높아요. 늦거나 내버려 두면 낮아져요
   - 거둘 때: 정성(손동작) + 돌봄 → 특상이 몇 개 나올지, 아주 가끔 "왕" 작물(무게 기록, 값 8배)
   밭 칸 위에 "목말라요 / 잡초 / 벌레" 표시가 떠요. 누르면 돌보기 작업 화면(play/work.js 의 kind "tend") */

const ISSUE={dry:{name:"목말라요",step:"water",col:"#3a78b8"},weed:{name:"잡초",step:"weed",col:"#4f7a3a"},bug:{name:"벌레",step:"bug",col:"#a8402a"}};
// 이 안에 해결하면 만점. 2026-11-14 1분으로 (왼쪽 할 일 목록 제한시간, play/quests.js)
const tendGrace=p=>60000;
// 처음 물을 줄 때: 자라는 동안 생길 일을 정해요 (at = 다 자라는 것 중 얼마쯤에)
function planIssues(p){const g=CROPS[p.crop].grow,L=[{k:"dry",at:0.4+Math.random()*0.2}];
  if(Math.random()<0.8)L.push({k:"weed",at:0.12+Math.random()*0.2});
  if(Math.random()<0.6)L.push({k:"bug",at:0.55+Math.random()*0.25});
  if(g>=60&&Math.random()<0.6)L.push({k:"weed",at:0.66+Math.random()*0.2});
  p.iss=L.sort((a,b)=>a.at-b.at);p.pause=0}
// 얼마나 자랐나 (0~1). 목마른 동안엔 멈춰요
function growPr(p){if(!p||!p.wat)return 0;const d=p.iss&&p.iss.find(x=>x.k==="dry"&&x.t0&&!x.t1);if(d)return d.at;
  return (Date.now()-p.wat-(p.pause||0))/(CROPS[p.crop].grow*1000)}
// 때가 된 일을 드러내요. 새로 생긴 게 있으면 그 이름들
function tickIssues(p){if(!p||!p.iss||p.dead||!p.wat)return [];const G=CROPS[p.crop].grow*1000,now=Date.now(),got=[];
  for(const x of p.iss){if(x.t0)continue;if(growPr(p)<x.at)break;x.t0=Math.min(now,p.wat+(p.pause||0)+x.at*G);got.push(x.k)}
  return got}
const activeIssues=p=>p&&p.iss?p.iss.filter(x=>x.t0&&!x.t1):[];
function resolveIssue(p,k){const now=Date.now();activeIssues(p).filter(x=>x.k===k).forEach(x=>{x.t1=now;if(k==="dry")p.pause=(p.pause||0)+(now-x.t0)})}
// 돌봄 점수 (0~1): 생긴 일마다 얼마나 빨리 해결했나
function tendScore(p){if(!p||!p.iss)return 1;const g=tendGrace(p),L=p.iss.filter(x=>x.t0);if(!L.length)return 1;const now=Date.now();
  return L.reduce((a,x)=>a+Math.max(x.t1?0.25:0,Math.min(1,1-Math.max(0,(x.t1||now)-x.t0-g)/(g*2))),0)/L.length}
// 거둘 때 등급: q = 정성 45% + 돌봄 55%
function harvestGrade(p){const care=p.care==null?0.5:p.care,t=tendScore(p),q=0.45*care+0.55*t;
  return {q,care,t,topFrac:Math.max(0,Math.min(1,(q-0.6)/0.33)),king:q>=0.85?0.025+(q-0.85)*0.4:q>=0.72?0.008:0}}

// 1초마다 (places3.js 의 placesFrame): 우리 밭에 새로 생긴 일 알리기, 비 오면 목마름은 저절로
let tendSaid=0;
function tendTick(){if(mode!=="home"||!S.plots)return;const rain=weather.kind==="비"||weather.kind==="눈";const news={};let ch=false,wet=0;
  S.plots.forEach((p,i)=>{if(!p)return;const got=tickIssues(p);if(got.length){ch=true;got.forEach(k=>(news[k]=news[k]||[]).push(CROPS[p.crop].name))}
    if(rain&&activeIssues(p).some(x=>x.k==="dry")){resolveIssue(p,"dry");wet++;ch=true}
    if(got.length||wet)drawPlot(i,true)});
  if(ch)save();
  if(wet)toast("비가 내려 목마른 밭이 촉촉해졌어요");
  const ks=Object.keys(news);if(ks.length&&Date.now()-tendSaid>4000){tendSaid=Date.now();
    toast(ks.map(k=>[...new Set(news[k])].join("·")+" 칸 "+{dry:"흙이 말랐어요",weed:"잡초가 났어요",bug:"벌레가 붙었어요"}[k]).join(" / ")+" · 눌러서 돌봐요");sfx("pop")}}

/* ---------- 밭 위 모습 ---------- */
const WEED_POS=[[0,-0.45],[0,0.45],[-0.45,0],[0.45,0],[0,0]];
function weedTuft(x,z,parent,y=0.26){const g=new THREE.Group();for(let k=0;k<5;k++){const c=cone(0.035,0.26,k%2?0x4f8a2e:0x6aa83a,(k-2)*0.03,0.12,(k%3-1)*0.03,4);c.rotation.z=(k-2)*0.25;c.castShadow=false;g.add(c)}g.position.set(x,y,z);parent.add(g);return g}
function bugMesh(x,z,parent,y=0.55){const g=new THREE.Group();const b=sph(0.045,0x3a2a1a,0,0,0);b.scale.set(1,0.6,1.4);g.add(b);g.add(sph(0.025,0x1a1a1a,0,0.01,0.06));
  [-1,1].forEach(d=>{const l=box(0.09,0.006,0.006,0x1a1a1a,d*0.03,-0.01,0);g.add(l)});g.position.set(x,y,z);parent.add(g);return g}
const issueSprites={};
function issueMark(k){if(!issueSprites[k]){const l=label(ISSUE[k].name,0.75);issueSprites[k]=l}const s=issueSprites[k].clone();return s}
// drawPlot(myland.js) 끝에서 불러요: 생긴 일 모습 더하기
function drawIssues(c,p){const act=activeIssues(p).map(x=>x.k);if(!act.length)return;
  if(act.includes("weed"))WEED_POS.forEach(([x,z])=>weedTuft(x,z,c,0.02).userData.iss=1);
  if(act.includes("bug"))SPOTS.forEach(([x,z],k)=>{if(k%2===0||k===3)bugMesh(x+0.08,z,c,0.42).userData.iss=1});
  if(act.includes("dry"))c.children.forEach(m=>{if(m.isMesh&&!m.userData.spark)m.rotation.z=(m.rotation.z||0)+0.35}); // 시들시들
  act.filter((k,i,a)=>a.indexOf(k)===i).forEach((k,i,a)=>{const s=issueMark(k);s.position.set((i-(a.length-1)/2)*0.9,1.75,0);c.add(s)})}
const issueKey=p=>p&&p.iss?p.iss.map(x=>x.t0&&!x.t1?x.k:"").join(""):"";

/* ---------- 왕 작물이 나왔을 때 ---------- */
function showKing(c,kg){sfx("level");buzz([60,40,60,40,140]);
  openSheet(`<div class="kingbox"><div class="kingstar">★</div><h2>왕${CROPS[c].name}가 나왔어요!</h2><p class="kingkg">${kg.toFixed(1)}kg</p>
    <p class="hint">밭을 정성껏 돌본 보람이에요. 채소가게 아줌마가 ${(ITEMS[c+"_king"].price).toLocaleString()}원에 사 줘요. 도감 "우리 밭 기록"에 무게가 남아요</p></div>`)}
// 도감: 우리 밭 기록
function cropDexHtml(){let h=`<h3>우리 밭 기록 · 특상과 왕 작물</h3><div class="goods">`;
  Object.keys(CROPS).forEach(k=>{const d=(S.cropDex||{})[k]||{};h+=`<div class="good"><div class="gname">${CROPS[k].name}<small>거둔 것 ${d.n||0}개 · 특상 ${d.top||0}개 · 왕 ${d.king||0}개${d.kg?" · 가장 큰 왕"+CROPS[k].name+" "+d.kg.toFixed(1)+"kg":""}</small></div></div>`});
  return h+`</div><p class="hint">자라는 동안 목마름·잡초·벌레를 빨리 돌볼수록 특상이 많이 나와요</p>`}
