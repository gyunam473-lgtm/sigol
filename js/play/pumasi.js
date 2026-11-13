/* 품앗이 (2026-11-13): 오늘 내가 이웃 일손을 거들면, 내가 자리를 비웠을 때 그 이웃이 내 밭을 돌봐 줘요
   - 이웃 땅에 놀러 가면 그 집 밭에도 목마름·잡초·벌레가 생겨 있어요(10분마다 새로). 누르면 손동작으로 거들어요
     → 그 이웃한테 "품"이 쌓여요(이웃마다 최대 PUMASI.max). 정도 오르고, 하루 첫 품앗이엔 품삯·답례
   - 내가 우리 땅에 없거나(다른 장소·게임 꺼 둠·3분 넘게 가만히) 내 밭에 생긴 일이 한동안 그대로면,
     품이 남은 이웃이 와서 대신 해 줘요(품 하나씩 써요). 제때 한 걸로 쳐 줘서 돌봄 점수도 지켜져요
   - 돌아오면 "이웃이 도와줬어요" 창: 누가 무얼 해 줬는지, "고맙다고 인사하기"(정 +1)
   나중에 서버가 붙으면 예시 이웃 자리에 진짜 사람이 들어와요 (품 주고받기 구조는 그대로) */

const PUMASI={max:5,delayFrac:0.4,minDelay:20000,pay:30};
const SESSION0=Date.now();let lastInput=Date.now();
["pointerdown","keydown"].forEach(e=>addEventListener(e,()=>lastInput=Date.now(),{passive:true}));
const iAmAway=()=>mode!=="home"||document.hidden||Date.now()-lastInput>180000;
const pumOf=name=>(S.pum||{})[name]||0;
const helpDelay=p=>Math.max(PUMASI.minDelay,tendGrace(p)*PUMASI.delayFrac);
const ISSUE_DO={dry:"물을 줬어요",weed:"김을 매 줬어요",bug:"벌레를 잡아 줬어요"};

/* ---------- 이웃이 내 밭을 도와줘요 ---------- */
// 1초마다(그리고 처음 켤 때) 확인. 도와준 게 있으면 그 수
function pumasiTick(){if(!S.plots)return 0;const away=iAmAway(),now=Date.now();let n=0;S.pum=S.pum||{};
  S.plots.forEach((p,i)=>{if(!p||!p.wat||p.dead||!p.iss)return;
    for(let guard=0;guard<6;guard++){tickIssues(p);
      const x=activeIssues(p).find(x=>(away||x.t0<SESSION0)&&now-x.t0>=helpDelay(p));if(!x)break;
      const who=NB.map(q=>q.name).filter(nm=>pumOf(nm)>0&&!(visiting&&visiting.name===nm)).sort((a,b)=>pumOf(b)-pumOf(a))[0];if(!who)break;
      x.t1=x.t0+helpDelay(p);if(x.k==="dry")p.pause=(p.pause||0)+(x.t1-x.t0);S.pum[who]--;n++;
      (S.helpLog=S.helpLog||[]).push({t:x.t1,who,k:x.k,crop:p.crop,seen:false});if(S.helpLog.length>30)S.helpLog.shift();
      if(mode==="home")drawPlot(i,true)}});
  if(n)save();return n}
// 도와준 것 보여 주기 (돌아왔을 때). html 만 돌려주거나(inline) 창으로 열어요
function helpLogHtml(){const L=(S.helpLog||[]).filter(h=>!h.seen);if(!L.length)return "";
  const ago=t=>{const m=Math.round((Date.now()-t)/60000);return m<1?"방금":m<60?m+"분 전":Math.round(m/60)+"시간 전"};
  return `<h3>내가 없는 동안 이웃이 도와줬어요</h3>`+L.slice(-8).reverse().map(h=>`<div class="item"><div>${josa(h.who,"이","가")} ${CROPS[h.crop].name} 칸에 ${ISSUE_DO[h.k]}<small>${ago(h.t)} · 품앗이 품을 하나 썼어요 · 남은 품 ${pumOf(h.who)}</small></div></div>`).join("")+
    `<button class="close go" id="thankBtn">고맙다고 인사하기</button>`}
function bindThanks(){if(!$("thankBtn"))return;$("thankBtn").onclick=()=>{const L=(S.helpLog||[]).filter(h=>!h.seen),who=[...new Set(L.map(h=>h.who))];
  S.jeong=S.jeong||{};who.forEach(w=>S.jeong[w]=(S.jeong[w]||0)+1);L.forEach(h=>h.seen=true);save();closeSheet();sfx("pop");
  toast(who.join(", ")+": \""+pickOne(["서로 돕고 사는 거지 뭐","다음엔 우리 밭 좀 봐 줘","별말을 다 하네"])+"\" · 정 +1")}}
function showHelpLog(){const h=helpLogHtml();if(!h)return false;openSheet(`<h2>이웃이 도와줬어요</h2>`+h);bindThanks();return true}

/* ---------- 내가 이웃 밭을 거들어요 ---------- */
const pumWin=()=>Math.floor(Date.now()/600000); // 10분마다 새로 일이 생겨요
// 놀러 갈 때: 그 집 밭에 지금 생겨 있는 일 (이번 10분 동안 이미 거든 칸은 빼요)
function addNbIssues(n){S.nbDone=S.nbDone||{};let s=(pumWin()*31+n.name.length*7)%997;const now=Date.now();
  nbPlots.forEach((p,i)=>{s=(s*73+11)%997;if(!p||!p.wat||stageOf(p)==="ripe"||S.nbDone[n.name+pumWin()+"_"+i])return;
    const r=s%10;const k=r<3?"weed":r<5?"bug":r<7?"dry":null;if(!k)return;const pr=Math.min(0.99,growPr(p));p.iss=[{k,at:pr,t0:now-60000}]})}
const nbNeeds=()=>nbPlots.reduce((a,p)=>a+activeIssues(p).length,0);
CH.nbug={name:"벌레 잡기",g:"tap",guide:()=>"잎에 붙은 벌레를 콕콕 떼어 내요"};
function helpNbPlot(i){const n=visiting,p=nbPlots[i],acts=activeIssues(p);if(!acts.length)return false;
  const G=plots[i].g.position,F=new THREE.Vector3(G.x,0.35,G.z),steps=acts.map(x=>({weed:"pull",bug:"nbug",dry:"water2"})[x.k]);
  startChore({steps,focus:F,cam:new THREE.Vector3(G.x+0.3,2.2,G.z+2.2),look:new THREE.Vector3(G.x,0.2,G.z),
    targets:s=>near(F,{n:4,d:0.45}),
    stepSetup(s){if(s==="pull")this.st.t.forEach(t=>t.m=weedTuft(t.p.x,t.p.z,this.g,0.02));if(s==="nbug")this.st.t.forEach(t=>t.m=bugMesh(t.p.x,t.p.z,this.g,0.45))},
    onTap(s,t){sfx(s==="pull"?"scrape":"pluck");if(t.m)this.g.remove(t.m)},onRub:noop,onHold(){sfx("water")},
    finish(){const now=Date.now();acts.forEach(x=>x.t1=now);S.nbDone=S.nbDone||{};S.nbDone[n.name+pumWin()+"_"+i]=1;
      S.pum=S.pum||{};const before=pumOf(n.name),got=Math.min(PUMASI.max,before+acts.length)-before;S.pum[n.name]=before+got;
      S.jeong=S.jeong||{};S.helped=S.helped||{};let extra="";
      if(S.helped[n.name]!==today){S.helped[n.name]=today;S.money+=PUMASI.pay;S.jeong[n.name]=(S.jeong[n.name]||0)+1;extra=` · 품삯 ${PUMASI.pay}원, 정 +1`;
        if(Math.random()<0.4){const back=Object.keys(CROPS)[Math.floor(Math.random()*4)];S.seeds[back]++;extra+=` · 답례로 ${CROPS[back].name} 씨앗`}}
      drawPlot(i,true);
      endChore(`${n.name}네 ${CROPS[p.crop].name} 칸을 거들었어요!`+(got?` 품앗이 품 +${got} (지금 ${pumOf(n.name)})`:` (품은 이미 가득 · ${PUMASI.max})`)+extra+
        (nbNeeds()?"":` · ${n.name}: "${pickOne(["덕분에 한시름 놨네","나중에 자네 밭도 봐 줌세","역시 이웃이 최고여"])}"`))}});
  return true}
// 이웃 창에 정·품 보여 주기
function pumasiLine(name){return `정 ${(S.jeong||{})[name]||0} · 품앗이 품 ${pumOf(name)}/${PUMASI.max}`}
