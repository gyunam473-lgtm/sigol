/* 소 쓰임새 · 채집한 걸로 요리 · 군밤 (2026-11-13)
   - 외양간: 여물 주기(원래) + "우유 짜기"(다 큰 소가 있으면 하루 한 번, 꾹 짜기) + "외양간 치우기"(하루 한 번 쇠스랑 슥슥 → 거름)
   - 거름: 씨앗 고를 때 "거름 넣고 심기"를 고르면 정성이 오르고, 거둘 때 등급이 좋아져요
   - 우유: 평상 찬장에서 꺼내 마시거나 다방 사장님이 사 줘요(밀크커피)
   - 부뚜막 새 요리: 송이구이 · 더덕구이 · 표고버섯볶음 · 도라지무침 (뒷산에서 캔 것으로)
   - 운동장 모닥불: 군밤 (뒷산 밤) */

Object.assign(ITEMS,{milk:{name:"우유",price:60,snack:true},geoleum:{name:"거름",price:0,stuff:true}});
FIRE_FOOD.push({id:"milk",name:"우유 한 잔",fill:8,drink:40,desc:"갓 짠 우유, 고소하고 따끈해요"},{id:"gun_bam",name:"군밤",fill:15,desc:"껍질을 까면 노란 속살, 고소하고 달아요"},{id:"tan_bam",name:"탄 밤",fill:5,desc:"너무 오래 구웠어요"});
DRINKS.push("milk");SNACKS.push("milk");
DISH.milk=g=>{g.add(sabal(0.08,0.09));const d=cyl(0.072,0.072,0.006,0xfaf8f2,0,0.075,0,16);g.add(d)};
DISH.gun_bam=g=>{g.add(plateMesh(0.13));for(let i=0;i<5;i++){const b=sph(0.035,i%2?0xe8c060:0x5a3420,(i-2)*0.045,0.04,(i%2)*0.03);b.scale.y=0.8;g.add(b)}};
DISH.tan_bam=g=>{g.add(plateMesh(0.13));for(let i=0;i<5;i++)g.add(sph(0.035,0x2a1a10,(i-2)*0.045,0.04,(i%2)*0.03))};

/* ---------- 외양간: 우유 짜기, 치우기(거름) ---------- */
CH.milking={name:"우유 짜기",g:"hold",guide:()=>"젖을 꾹 쥐었다가 양동이가 알맞게 차면(초록 칸) 손을 떼요",msgs:["쭈욱~ 우유가 양동이에 가득!","조금 덜 짰어요","너무 세게 짰어요. 소가 놀랐어요"]};
CH.chiugi={name:"외양간 치우기",g:"rub",n:5,guide:n=>`쇠스랑으로 묵은 짚을 슥슥 긁어모아요 · ${n}번 남음`,pop:"척",sfx:"scrape"};
const adultCows=()=>S.herd.filter(a=>a.k==="cow").length;
{const ob=openBarn;openBarn=function(){ob();const d=dayKey(new Date()),cows=adultCows(),milked=S.milkDay===d,cleaned=S.cleanDay===d;
  let h=`<h3>외양간 일</h3><div class="goods">`;
  h+=goods("우유 짜기",cows?(milked?"오늘은 짰어요. 내일 또":"다 큰 소 "+cows+"마리 · 한 마리에 우유 두 잔"):"다 큰 소가 있어야 해요 (송아지는 여물 다섯 번이면 커요)",`<button class="go" id="milkBtn" ${cows&&!milked?"":"disabled"}>짜기</button>`);
  h+=goods("외양간 치우기",S.herd.length?(cleaned?"오늘은 깨끗해요":"묵은 짚을 치우면 거름이 나와요 · 가진 거름 "+(S.inv.geoleum||0)+"포대"):"가축이 있어야 거름이 나와요",`<button class="go" id="cleanBtn" ${S.herd.length&&!cleaned?"":"disabled"}>치우기</button>`);
  h+=`</div><p class="hint">거름은 빈 밭에 씨앗을 고를 때 "거름 넣고 심기"로 써요 · 정성이 오르고 특상이 잘 나와요</p>`;
  sheet.querySelector(".close").insertAdjacentHTML("beforebegin",h);
  if($("milkBtn"))$("milkBtn").onclick=()=>{closeSheet();barnChore("milk")};if($("cleanBtn"))$("cleanBtn").onclick=()=>{closeSheet();barnChore("clean")}}}
function barnChore(kind){const F=new THREE.Vector3(BARN.x+0.6,0.5,BARN.z+2.4);let pail=null,straw=[];
  startChore({steps:kind==="milk"?["milking","milking"]:["chiugi"],focus:F,cam:new THREE.Vector3(F.x+1.2,1.6,F.z+2.0),look:F.clone(),zone:[0.55,0.82],
    setup(){if(kind==="milk"){pail=new THREE.Group();pail.add(cyl(0.16,0.13,0.26,0x9aa4aa,0,0.13,0,14));const m=cyl(0.14,0.14,0.01,0xfaf8f2,0,0.03,0,14);m.userData.milk=1;pail.add(m);pail.position.copy(F).setY(0);this.g.add(pail)}
      else for(let i=0;i<14;i++){const s=box(0.3,0.03,0.04,i%2?0xb8a060:0x8a7040,F.x+fr(-0.5,0.5),0.03,F.z+fr(-0.4,0.4));s.rotation.y=fr(0,TAU);this.g.add(s);straw.push(s)}},
    onHolding(g){if(pail){const m=pail.children.find(c=>c.userData.milk);m.position.y=0.03+Math.min(1,g)*0.2;if(Math.random()<0.25)sfx("pour")}},
    onHold(){},onTap:noop,
    onRub(s,n,need){const k=Math.ceil(straw.length*n/need);straw.slice(0,k).forEach((q,i)=>q.position.set(F.x+0.8+(i%3)*0.05,0.03+Math.floor(i/3)*0.03,F.z-0.3))},
    finish(){const d=dayKey(new Date());
      if(kind==="milk"){S.milkDay=d;const n=adultCows()*2+(avg(this.scores)>0.9?1:0);S.inv.milk=(S.inv.milk||0)+n;sweat(2);endChore(`우유 ${n}잔을 짰어요 · 평상에 앉아 꺼내 마시거나 다방 사장님이 사 줘요`)}
      else{S.cleanDay=d;const n=Math.max(1,S.herd.reduce((a,x)=>a+(ANIMALS[x.k].kind==="cow"?2:1),0));S.inv.geoleum=(S.inv.geoleum||0)+n;sweat(3);endChore(`외양간이 깨끗해졌어요 · 거름 ${n}포대 · 빈 밭에 씨앗 고를 때 "거름 넣고 심기"`)}}})}
// 다방 사장님: 우유 사 주기 (밀크커피용)
SHOPS.dabang.open=line=>{if(!(S.inv.milk>0)){toast("다방 사장님: \""+pickOne(["어서 와요~ 아무 데나 편히 앉아요","쌍화차에 노른자 동동 띄워 줄까?","소파에 앉으면 차 갖다줄게"])+"\"");sfx("pop");return}
  const n=S.inv.milk,got=n*ITEMS.milk.price;
  shopSheet("dabang",line||"어머, 갓 짠 우유네! 밀크커피 타게 내가 사 줄게",`<div class="goods">${goods("우유",n+"잔 · 한 잔 "+ITEMS.milk.price+"원",`<button class="go" id="sellMilk">다 팔기</button>`)}</div><p class="hint">소파에 앉으면 차를 시킬 수 있어요</p>`);
  $("sellMilk").onclick=()=>{S.inv.milk=0;S.money+=got;sfx("coin");save();refresh();closeSheet();toast(`다방 사장님: "고마워! 우유 ${n}잔, ${got}원"`)}};

/* ---------- 거름 넣고 심기 ---------- */
{const os=openSeedPick;openSeedPick=function(i){os(i);if(!(S.inv.geoleum>0))return;
  sheet.querySelector(".goods").insertAdjacentHTML("beforebegin",`<label class="manure"><input type="checkbox" id="useManure" ${S.manureOn!==false?"checked":""}> 거름 넣고 심기 <small>거름 ${S.inv.geoleum}포대 · 정성 +, 특상이 잘 나와요</small></label>`);
  $("useManure").onchange=e=>{S.manureOn=e.target.checked;save()}}}
{const cp=commitPlant;commitPlant=function(){cp();const p=S.plots[W.i];if(p&&S.manureOn!==false&&S.inv.geoleum>0){S.inv.geoleum--;p.care=Math.min(1,(p.care||0.5)+0.15);p.manure=1;save();toast("거름을 넉넉히 넣었어요. 흙이 기름져요")}}}
{const hg=harvestGrade;harvestGrade=function(p){const G=hg(p);if(p&&p.manure){G.q=Math.min(1,G.q+0.05);G.topFrac=Math.max(0,Math.min(1,(G.q-0.6)/0.33));G.king=G.q>=0.85?0.025+(G.q-0.85)*0.4:G.q>=0.72?0.008:0}return G}}

/* ---------- 뒷산에서 캔 걸로 요리 ---------- */
RECIPES.push(
  {id:"songi_gui",name:"송이구이",need:{songi:1},fill:30,desc:"참기름에 소금 콕, 가을 산의 향",meat:true,forage:true},
  {id:"deodeok_gui",name:"더덕구이",need:{deodeok:2},fill:35,desc:"고추장 발라 솥뚜껑에 지글지글",meat:true,forage:true},
  {id:"pyogo_bokkeum",name:"표고버섯볶음",need:{pyogo:2},fill:25,desc:"쫄깃한 표고를 간장에 달달",meat:true,forage:true},
  {id:"doraji_muchim",name:"도라지무침",need:{doraji:2},fill:22,desc:"새콤달콤 고추장 양념에 조물조물",forage:true});
Object.assign(RECIPE_STEPS,{songi_gui:["fire","place","season","stirfry","plate","garnish"],deodeok_gui:["fire","place","season","stirfry","plate","garnish"],pyogo_bokkeum:["fire","place","season","stirfry","plate","garnish"],doraji_muchim:["tear","season","toss","plate","garnish"]});
Object.assign(STEP_ALIAS,{songi_gui:{place:"솥뚜껑에 올리기",stirfry:"굽기"},deodeok_gui:{stirfry:"굽기"},pyogo_bokkeum:{stirfry:"볶기"},doraji_muchim:{tear:"도라지 찢기"}});
Object.assign(SEASON_JARS,{songi_gui:[["참기름",0xd8a838],["굵은소금",0xf4f4f0]],deodeok_gui:[["고추장",0xa8281a],["참기름",0xd8a838]],pyogo_bokkeum:[["간장",0x3a2214],["다진 마늘",0xf2ead6]],doraji_muchim:[["고추장",0xa8281a],["식초",0xe8e0b0],["설탕",0xfafafa]]});
Object.assign(GARNISH,{songi_gui:[0xf6eedc],deodeok_gui:[0xf6eedc,0x5d9a3e],pyogo_bokkeum:[0xf6eedc,0x5d9a3e],doraji_muchim:[0xf6eedc,0x5d9a3e]});
Object.assign(GARNISH_NAME,{songi_gui:"통깨",deodeok_gui:"통깨·쪽파",pyogo_bokkeum:"통깨·쪽파",doraji_muchim:"통깨·쪽파"});
// 솥뚜껑 위 모양 (날것 → 익은 색)
{const mg=meatGroup;meatGroup=function(id){const S_={songi_gui:{n:6,raw:0xe8dcc0,done:0xb08050,sz:[0.05,0.02,0.09]},deodeok_gui:{n:8,raw:0xe8d8c0,done:0xa8402a,sz:[0.09,0.012,0.03]},pyogo_bokkeum:{n:10,raw:0x8a6a48,done:0x4a3020,sz:[0.05,0.014,0.04]}}[id];
  if(!S_)return mg(id);const g=new THREE.Group(),mats=[];for(let i=0;i<S_.n;i++){const mt=new THREE.MeshPhongMaterial({color:S_.raw,shininess:30});mats.push(mt);const m=new THREE.Mesh(new THREE.BoxGeometry(...S_.sz),mt);
    m.position.set(fr(-0.1,0.1),0.012+(i%2)*0.006,fr(-0.1,0.1));m.rotation.y=fr(0,TAU);m.castShadow=true;g.add(m)}
  const R=new THREE.Color(S_.raw),Dn=new THREE.Color(S_.done);g.userData.cook=k=>mats.forEach(m=>m.color.copy(R).lerp(Dn,Math.min(1,k)));return g}}
// 도라지 찢기: 상추 대신 하얀 도라지 뿌리
{const T0=CS.tear,setup0=T0.setup,stroke0=T0.stroke,guide0=T0.guide,tags0=T0.tags;
  T0.setup=function(){if(CK.id!=="doraji_muchim")return setup0.call(this);const h=new THREE.Group();for(let i=0;i<8;i++){const r=cyl(0.012,0.006,0.16,0xf2ead6,(i%4-1.5)*0.03,0.02,Math.floor(i/4)*0.03,5);r.rotation.z=Math.PI/2;h.add(r)}const g=new THREE.Group();g.add(h);setIng(g)};
  T0.stroke=function(){if(CK.id!=="doraji_muchim")return stroke0.call(this);sfx("scrape");const h=CK.ing.children[0];if(h&&h.children.length>1)h.remove(h.children[h.children.length-1]);for(let i=0;i<2;i++)flyToBowl(()=>box(0.09,0.008,0.008,0xf2ead6,0,0,0))};
  T0.guide=n=>CK&&CK.id==="doraji_muchim"?`도라지를 결대로 좌우로 쭉쭉 찢어 양푼에 담아요 · ${n}번 남음`:guide0(n);
  T0.tags=()=>CK&&CK.id==="doraji_muchim"?[[P_ING,"도라지"],[P_BOWL,"양푼"]]:tags0()}
// 솥뚜껑에 올리기 안내: 고기가 아니면 재료 이름으로
{const P=CS.place,g0=P.guide;P.guide=()=>CK.meat&&CK.r.forage?`도마 위 ${ITEMS[Object.keys(CK.r.need)[0]].name}를 집어 왼쪽 솥뚜껑에 올려요. 치익 소리가 나요`:g0()}
DISH.songi_gui=g=>{g.add(plateMesh());for(let i=0;i<5;i++){const m=box(0.05,0.02,0.09,0xb08050,(i-2)*0.05,0.04,0);m.rotation.y=0.2;g.add(m)}g.add(sph(0.012,0xffffff,0.08,0.06,0.05))};
DISH.deodeok_gui=g=>{g.add(plateMesh());for(let i=0;i<6;i++){const m=box(0.1,0.012,0.03,0xa8402a,0,0.04+i*0.004,(i-2.5)*0.035);m.rotation.y=fr(-0.2,0.2);g.add(m)}};
DISH.pyogo_bokkeum=g=>{g.add(plateMesh());for(let i=0;i<10;i++){const m=box(0.05,0.014,0.04,0x4a3020,fr(-0.08,0.08),0.04,fr(-0.08,0.08));m.rotation.y=fr(0,TAU);g.add(m)}};
DISH.doraji_muchim=g=>{g.add(plateMesh());for(let i=0;i<14;i++){const m=box(0.09,0.008,0.008,i%3?0xd8603a:0xf2ead6,fr(-0.06,0.06),0.04+i*0.002,fr(-0.06,0.06));m.rotation.y=fr(0,TAU);g.add(m)}};

/* ---------- 모닥불 군밤 ---------- */
ROAST.bam={name:"밤",item:"bam",ok:"gun_bam",bad:"tan_bam",zone:[0.55,0.8],sec:3,peel:true,guide:"칼집 낸 밤을 석쇠에 올려 꾹… 탁탁 껍질이 벌어지면(초록 칸) 꺼내요",msgs:["탁! 껍질이 쩍 벌어졌어요","아직 덜 익었어요","너무 탔어요"]};

// 볶기 안내: 산에서 캔 재료는 그 재료에 맞게
{const g0=CS.stirfry.guide;CS.stirfry.guide=n=>CK&&CK.r.forage?`주걱으로 뒤적이며 노릇하게 ${CK.id==="pyogo_bokkeum"?"볶아요. 간장 냄새가 솔솔":CK.id==="deodeok_gui"?"구워요. 고추장이 지글지글":"구워요. 송이 향이 확 퍼져요"} · ${n}바퀴 남음`:g0(n)}
