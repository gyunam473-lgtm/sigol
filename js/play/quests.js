/* 할 일 목록 (2026-11-14): 밭에 벌레·잡초·목마름이 생기면 왼쪽에 퀘스트처럼 떠요. 제한시간 1분.
   1분 안에 돌보면 돌봄 만점, 넘기면 "늦었어요"(빨강)로 바뀌고 돌봄 점수가 깎이기 시작해요(tend.js 의 tendGrace).
   줄을 누르면 그 밭으로 걸어가서 바로 돌봐요(다른 장소에 있으면 "우리 땅으로"). 일하는 중·앉아 있을 땐 숨겨요 */
const QUEST_LIMIT=60000;
const ISSUE_ICON={bug:"🐛",weed:"🌿",dry:"💧"};
const QEl=document.createElement("div");QEl.className="quests";QEl.id="quests";QEl.hidden=true;document.querySelector(".app").appendChild(QEl);
function questList(){const L=[];(S.plots||[]).forEach((p,i)=>{if(!p||p.dead)return;tickIssues(p);activeIssues(p).forEach(x=>L.push({i,k:x.k,t0:x.t0,crop:CROPS[p.crop].name}))});
  return L.sort((a,b)=>a.t0-b.t0)}
const fmtLeft=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};
let qSig="";
function drawQuests(){const busy=W||PD||CK||FS||SIT||LIE||inHouse||!me||!$("modal").hidden;const L=busy?[]:questList();QEl.hidden=!L.length;if(!L.length){qSig="";return}
  {const c=document.querySelector(".cols"),st=c&&c.querySelector(".stat");if(st)QEl.style.top=(st.getBoundingClientRect().bottom+8)+"px"}
  const now=Date.now(),home=mode==="home";
  const rows=L.slice(0,4).map(q=>{const left=QUEST_LIMIT-(now-q.t0),late=left<=0;
    return `<button class="qrow ${late?"late":""}" data-q="${q.i}"><span class="qi">${ISSUE_ICON[q.k]}</span><span class="qt">${ISSUE[q.k].name==="목말라요"?"물 주기":ISSUE[q.k].name==="잡초"?"김매기":"벌레 잡기"} · ${q.crop}</span><b>${late?"늦었어요":fmtLeft(left)}</b></button>`}).join("");
  const sig=rows+L.length+home;if(sig===qSig)return;qSig=sig;
  QEl.innerHTML=`<div class="qhead">밭 돌보기 ${home?"":"<small>· 우리 땅에서</small>"}</div>${rows}${L.length>4?`<small class="qmore">외 ${L.length-4}개</small>`:""}`;
  QEl.querySelectorAll("[data-q]").forEach(b=>b.onclick=e=>{e.stopPropagation();const i=+b.dataset.q;
    if(mode!=="home"){goHome();toast("우리 땅으로 돌아왔어요. 밭으로 가 볼까요?");return}
    const g=plots[i].g.position,front=plotPos(i)[1]===1;go(g.x,front?FIELD.z+3.6+0.75:g.z+1.35,{type:"plot",i});sfx("pop")})}
setInterval(()=>{try{drawQuests()}catch(e){}},500);

// 마당일(모내기·장작 …) 하는 동안엔 그 둘레 이름표("논" 같은)가 화면 가운데를 가려서 숨겨요
{const sc=startChore;startChore=function(job){sc(job);if(!PD)return;const f=(PD.focus||(PD.chopAt&&PD.chopAt())||new THREE.Vector3()).clone(),p=new THREE.Vector3();PD.hidLabels=[];
  scene.traverse(o=>{if(o.isSprite&&o.visible&&o.parent!==me.g){o.getWorldPosition(p);if(p.distanceTo(f)<6){o.visible=false;PD.hidLabels.push(o)}}})}}
{const ec=endChore;endChore=function(msg){const L=PD&&PD.hidLabels;ec(msg);if(L)L.forEach(o=>o.visible=true)}}
