/* 곶감 만들기 (2026-11-13): 우리 땅 감나무(가을 10~11월에 감이 열려요) 옆 곶감 덕장
   1) 감 따기: 감나무를 눌러 장대로 콕콕 (하루 여섯 개)
   2) 덕장에서: 껍질 깎기(슥슥) → 꼭지에 실 묶기(콕콕) → 처마 줄에 매달기(콕콕) · 한 줄에 감 여섯 개, 줄은 셋까지
   3) 말리기: 생감 → 반건시(말랑, 짙은 주황) → 곶감(쪼글쪼글 갈색, 하얀 분). 반건시가 되면 한 번 "주물러 주기"(안 하면 분이 덜 피어요)
   4) 걷기: 반건시로 일찍 걷거나, 다 마르면 곶감으로. 평상에 앉아 꺼내 먹거나 채소가게에 팔아요
   말리는 시간은 체험용으로 짧아요 (data 는 아래 GOTGAM) */
const GOTGAM={half:300000,full:720000,perDay:6,perStrand:6,strands:3}; // 반건시 5분, 곶감 12분 (실제론 몇 주)
Object.assign(ITEMS,{gam:{name:"생감",price:30,stuff:true},bangeonsi:{name:"반건시",price:150,snack:true},gotgam:{name:"곶감",price:250,snack:true},gotgam_top:{name:"분 핀 상품 곶감",price:400,snack:true}});
FIRE_FOOD.push({id:"bangeonsi",name:"반건시",fill:15,desc:"말랑말랑 쫀득, 속은 홍시처럼 달아요"},{id:"gotgam",name:"곶감",fill:18,desc:"쫄깃하고 달콤한 겨울 간식"},{id:"gotgam_top",name:"분 핀 상품 곶감",fill:20,desc:"하얀 분이 소복, 꿀맛"});
const gamSeason=()=>{const m=new Date().getMonth()+1;return m===10||m===11};
const gamTree=TREES.find(t=>t.parent===land&&Math.abs(t.position.x+15.2)<0.1); // 감나무 (scene.js)
const GRACK={x:-12.4,z:-6.6};
const gRack=new THREE.Group();
(function(){[-0.9,0.9].forEach(x=>gRack.add(cyl(0.06,0.07,2.4,0x7a5a3a,x,1.2,0,6)));gRack.add(box(2.2,0.08,0.08,0x6b4a2e,0,2.2,0));
  const rf=box(2.6,0.06,1.0,0xd9c27a,0,2.5,0);rf.rotation.x=0.18;gRack.add(rf); // 짚 지붕
  gRack.add(hitBox(2.4,2.6,1.4,0,1.3,0));gRack.position.set(GRACK.x,0,GRACK.z);land.add(gRack);
  poke(gRack,()=>useGotgamRack(),[GRACK.x,GRACK.z+1.3]);
  if(gamTree){gamTree.userData={kind:"poke",poke:()=>pickGam(),at:[-15.2,-5.6]}}})();
const strandG=new THREE.Group();gRack.add(strandG);
const gStage=s=>{const e=Date.now()-s.t;return e>=GOTGAM.full?"full":e>=GOTGAM.half?"half":"raw"};
function drawStrands(){while(strandG.children.length)strandG.remove(strandG.children[0]);(S.gotgam||[]).forEach((s,i)=>{const st=gStage(s),x=-0.6+i*0.6;
  strandG.add(cyl(0.006,0.006,1.4,0xe8e0c8,x,1.5,0,4));
  for(let k=0;k<s.n;k++){const c=st==="raw"?0xe8782a:st==="half"?0xc8501e:0x8a4a22,m=sph(0.1,c,x,2.0-k*0.22,0);m.scale.set(1,st==="raw"?1.15:st==="half"?0.95:0.75,1);strandG.add(m);
    if(st==="full")for(let w=0;w<(s.kneaded?5:2);w++)strandG.add(sph(0.016,0xf6f4ee,x+fr(-0.06,0.06),2.0-k*0.22+fr(-0.05,0.05),0.08))}})}
drawStrands();
// 감나무 열매 보이기 (가을에만, 오늘 딴 만큼 줄어요)
const gamFruits=gamTree?gamTree.children.filter(c=>c.geometry&&c.geometry.type==="SphereGeometry"&&c.material.color.getHex()===0xe8862e):[];
function applyGamTree(){const d=dayKey(new Date()),left=gamSeason()?(S.gamDay===d?GOTGAM.perDay-(S.gamPicked||0):GOTGAM.perDay):0;gamFruits.forEach((f,i)=>f.visible=i<Math.round(left/GOTGAM.perDay*gamFruits.length))}
applyGamTree();
CH.gamttagi={name:"감 따기",g:"tap",guide:()=>"장대 끝으로 잘 익은 감을 콕콕 따요"};
CH.kkakgi={name:"껍질 깎기",g:"rub",n:4,guide:n=>`칼로 감 껍질을 빙글빙글 슥슥 깎아요 · ${n}번 남음`,pop:"사각",sfx:"scrape"};
CH.kkokji={name:"꼭지에 실 묶기",g:"tap",guide:()=>"감 꼭지마다 콕콕 실을 묶어요"};
CH.maedalgi={name:"매달기",g:"tap",guide:()=>"줄을 덕장 막대에 콕 걸어 매달아요"};
CH.jumuri={name:"주물러 주기",g:"rub",n:3,guide:n=>`반건시를 손으로 살살 주물러 모양을 잡아 줘요 · ${n}번 남음 (그래야 분이 하얗게 펴요)`,pop:"조물",sfx:"scrape"};
function pickGam(){if(!gamSeason()){toast("감나무예요. 감은 가을(10~11월)에 주렁주렁 열려요");return}
  const d=dayKey(new Date());if(S.gamDay!==d){S.gamDay=d;S.gamPicked=0}const left=GOTGAM.perDay-S.gamPicked;if(left<=0){toast("오늘 딸 감은 다 땄어요. 내일 또 익어요");return}
  const T=gamTree.position,F=new THREE.Vector3(T.x,2.0,T.z);let picked=0;
  startChore({steps:["gamttagi"],focus:F,cam:new THREE.Vector3(T.x+1.0,1.6,T.z+3.4),look:new THREE.Vector3(T.x,2.0,T.z),
    targets:()=>gamFruits.filter(f=>f.visible).slice(0,left).map(f=>f.getWorldPosition(new THREE.Vector3())),
    onTap(s,t){sfx("pluck");picked++;const f=gamFruits.find(q=>q.visible&&q.getWorldPosition(new THREE.Vector3()).distanceTo(t.p)<0.05);if(f)f.visible=false},onRub:noop,onHold:noop,
    finish(){const n=picked;S.gamPicked+=n;S.inv.gam=(S.inv.gam||0)+n;save();applyGamTree();endChore(`잘 익은 감 ${n}개를 땄어요 · 감나무 옆 곶감 덕장에서 깎아 매달아요`)}})}
function useGotgamRack(){S.gotgam=S.gotgam||[];const L=S.gotgam,ready=L.filter(s=>gStage(s)!=="raw"),need=L.filter(s=>gStage(s)==="half"&&!s.kneaded);
  let h=`<h2>곶감 덕장</h2><p class="hint">생감 → 반건시(5분) → 곶감(12분) · 체험용으로 빨리 말라요</p><div class="goods">`;
  L.forEach((s,i)=>{const st=gStage(s),left=Math.ceil(((st==="raw"?GOTGAM.half:GOTGAM.full)-(Date.now()-s.t))/60000);
    h+=goods(`${i+1}번 줄 · 감 ${s.n}개`,st==="raw"?`말리는 중 · ${left}분쯤 뒤 반건시`:st==="half"?`반건시 · ${s.kneaded?"주물러 줬어요":"한 번 주물러 주세요"} · ${left}분쯤 뒤 곶감`:`곶감 다 됐어요${s.kneaded?" · 하얀 분이 소복":""}`,
      (st==="half"&&!s.kneaded?`<button data-jm="${i}">주무르기</button>`:"")+(st!=="raw"?`<button class="go" data-gt="${i}">${st==="full"?"곶감 걷기":"반건시로 걷기"}</button>`:""))});
  if(L.length<GOTGAM.strands)h+=goods("새로 깎아 매달기",`생감 ${S.inv.gam||0}개 · 한 줄에 ${GOTGAM.perStrand}개까지`,`<button class="go" id="gNew" ${S.inv.gam>0?"":"disabled"}>깎기</button>`);
  h+=`</div><p class="hint">${S.inv.gam>0||L.length?"":"먼저 감나무에서 감을 따 와요 (가을 10~11월). "}걷은 곶감은 우리 평상에 앉아 꺼내 먹거나 채소가게 아줌마한테 팔아요</p>`;
  openSheet(h);
  if($("gNew"))$("gNew").onclick=()=>{closeSheet();hangGam()};
  sheet.querySelectorAll("[data-jm]").forEach(b=>b.onclick=()=>{closeSheet();kneadGam(+b.dataset.jm)});
  sheet.querySelectorAll("[data-gt]").forEach(b=>b.onclick=()=>{const s=L[+b.dataset.gt],st=gStage(s);L.splice(+b.dataset.gt,1);
    let k,msg;if(st==="full"){k=s.kneaded?"gotgam_top":"gotgam";msg=s.kneaded?`분 핀 상품 곶감 ${s.n}개! 하얀 분이 소복해요`:`곶감 ${s.n}개를 걷었어요`}else{k="bangeonsi";msg=`말랑한 반건시 ${s.n}개를 걷었어요`}
    S.inv[k]=(S.inv[k]||0)+s.n;sweat(1);save();drawStrands();sfx("pop");closeSheet();toast(msg+" · 평상에 앉아 꺼내 먹거나 채소가게에 팔아요")})}
function hangGam(){const n=Math.min(GOTGAM.perStrand,S.inv.gam||0);if(!n)return;const R=gRack.position,F=new THREE.Vector3(R.x,0.9,R.z+0.9);let gams=[];
  startChore({steps:["kkakgi","kkokji","maedalgi"],focus:F,cam:new THREE.Vector3(R.x+0.4,1.9,R.z+2.6),look:new THREE.Vector3(R.x,1.0,R.z+0.4),
    targets:s=>s==="maedalgi"?[new THREE.Vector3(R.x-0.6+(S.gotgam.length)*0.6,2.2,R.z)]:gams.map(g=>g.position.clone().add(new THREE.Vector3(0,0.09,0))),
    setup(){const tb=box(1.2,0.06,0.6,0x8a6a48,F.x,0.8,F.z);this.g.add(tb);for(let i=0;i<n;i++){const m=sph(0.075,0xe8782a,F.x-0.45+i*0.18,0.9,F.z);m.scale.y=1.15;this.g.add(m);gams.push(m);m.add(cyl(0.025,0.03,0.02,0x3a5a2a,0,0.08,0,6))}},
    onRub(s,k,need){const j=Math.min(gams.length-1,Math.floor(k/need*gams.length));gams.slice(0,j+1).forEach(g=>g.material=M(0xf0a050));for(let i=0;i<3;i++)this.g.add(box(0.06,0.005,0.02,0xd8682a,F.x+fr(-0.5,0.5),0.84,F.z+fr(-0.25,0.25)))},
    onTap(s,t){sfx(s==="maedalgi"?"pop":"seed");if(s==="kkokji"){const g=gams.find(q=>q.position.distanceTo(t.p)<0.15);if(g)g.add(cyl(0.004,0.004,0.25,0xe8e0c8,0,0.2,0,4))}
      if(s==="maedalgi")gams.forEach((g,i)=>g.position.set(R.x-0.6+S.gotgam.length*0.6,2.05-i*0.19,R.z))},
    finish(){S.inv.gam-=n;S.gotgam.push({t:Date.now(),n,kneaded:false});save();drawStrands();endChore(`감 ${n}개를 깎아 덕장에 매달았어요 · 5분쯤 뒤 반건시가 되면 한 번 주물러 주세요`)}})}
function kneadGam(i){const s=(S.gotgam||[])[i];if(!s)return;const R=gRack.position,F=new THREE.Vector3(R.x-0.6+i*0.6,1.6,R.z);
  startChore({steps:["jumuri"],focus:F,cam:new THREE.Vector3(F.x+0.3,1.7,F.z+1.3),look:F.clone(),onRub(){},onTap:noop,onHold:noop,
    finish(){s.kneaded=true;save();drawStrands();endChore("조물조물 주물러 줬어요. 이제 하얀 분이 소복이 필 거예요")}})}
let gotgamT=0;
function gotgamFrame(dt){gRack.visible=mode==="home";if(mode!=="home")return;gotgamT+=dt;if(gotgamT>3){gotgamT=0;const k=(S.gotgam||[]).map(gStage).join();if(k!==gotgamFrame.k){gotgamFrame.k=k;drawStrands()}applyGamTree()}}
// 집 땅에선 덕장을 돌아가요
function extraHomeObs(){return gRack.visible?[[GRACK.x-1.2,GRACK.z-0.6,GRACK.x+1.2,GRACK.z+0.6]]:[]}
function homeClicks(){return mode==="home"?[gRack].concat(gamTree?[gamTree]:[]):[]}
// 모양 (평상 소반에 올릴 때)
DISH.gotgam=g=>{g.add(plateMesh(0.13));for(let i=0;i<3;i++){const m=sph(0.045,0x8a4a22,(i-1)*0.07,0.04,0);m.scale.set(1,0.5,1);g.add(m);g.add(sph(0.01,0xf6f4ee,(i-1)*0.07+0.01,0.06,0.01))}};
DISH.gotgam_top=g=>{DISH.gotgam(g);for(let i=0;i<8;i++)g.add(sph(0.008,0xffffff,fr(-0.1,0.1),0.065,fr(-0.03,0.03)))};
DISH.bangeonsi=g=>{g.add(plateMesh(0.13));for(let i=0;i<3;i++){const m=sph(0.05,0xc8501e,(i-1)*0.075,0.045,0);m.scale.set(1,0.8,1);g.add(m)}};
