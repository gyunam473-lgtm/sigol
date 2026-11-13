/* 장터 가게: 가게 주인과 말을 주고받으며 사고팔아요 (people.js 의 SHOPS)
   - 채소가게 아줌마: 거둔 채소를 사 줘요
   - 씨앗가게 할아버지: 씨앗을 팔아요
   - 닭집 아저씨: 달걀을 사 줘요
   - 생선 트럭 아저씨: 날마다 와서 철마다 다른 바다 것을 팔아요. 되팔 순 없어요
   - 정육점 아저씨: 삼겹살, 앞다리살(제육), 불고기감, 토종닭(백숙)
   장터·생선 트럭·우시장은 날마다 열려요 (예전엔 4·9장이었어요) */

const jangToday=()=>true; // 장터는 날마다 열려요
const fmtDay=d=>(d.getMonth()+1)+"월 "+d.getDate()+"일";
const pickOne=a=>a[Math.floor(Math.random()*a.length)];

// 가게 주인 얼굴 그림 (작은 그림, 그림 파일 없이)
const hex=c=>"#"+c.toString(16).padStart(6,"0");
function avatarSvg(d){
  const o=d.o,sk="#f0d2b0";let head="";
  if(o.scarf)head=`<path d="M14 30 Q14 10 32 10 Q50 10 50 30 L50 26 Q32 18 14 26Z" fill="${hex(o.scarf)}"/><circle cx="50" cy="30" r="4" fill="${hex(o.scarf)}"/>`;
  else if(o.cap)head=`<path d="M15 26 Q15 10 32 10 Q49 10 49 26Z" fill="${hex(o.cap)}"/><rect x="30" y="23" width="24" height="4" rx="2" fill="${hex(o.cap)}"/>`;
  else head=`<path d="M17 25 Q19 21 32 21 Q45 21 47 25 Q40 30 24 30Z" fill="${hex(o.hair||0x3a332c)}"/><ellipse cx="32" cy="22" rx="27" ry="4" fill="#e6cc84"/><path d="M21 21 Q22 9 32 9 Q42 9 43 21Z" fill="#e6cc84"/><rect x="21" y="17" width="22" height="3" fill="#c8572f"/>`;
  const beard=o.beard?`<ellipse cx="32" cy="45" rx="7" ry="5" fill="${hex(o.beard)}"/>`:"";
  const apron=o.apron?`<path d="M24 54 L40 54 L42 64 L22 64Z" fill="${hex(o.apron)}"/>`:"";
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="32" fill="#efe6cf"/><path d="M12 64 Q12 50 32 50 Q52 50 52 64Z" fill="${hex(d.shirt)}"/>${apron}
  <circle cx="32" cy="34" r="15" fill="${sk}"/>${head}<circle cx="26.5" cy="35" r="1.8" fill="#2b2a24"/><circle cx="37.5" cy="35" r="1.8" fill="#2b2a24"/>
  <path d="M27 41 Q32 45 37 41" stroke="#8a4a3a" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="23" cy="40" r="2.4" fill="#e8a08a" opacity=".6"/><circle cx="41" cy="40" r="2.4" fill="#e8a08a" opacity=".6"/>${beard}</svg>`}

// 처음 인사
const SHOP_HELLO={
  veg:["어서 와요~ 오늘은 뭐 거둬 왔어?","싱싱한 거 가져오면 값 잘 쳐줄게","아이고 부지런도 하지. 밭은 잘 돼 가?"],
  seed:["씨앗 보러 왔는가. 뭘 심어 볼 텐가","철 맞춰 심어야 잘 크는 법이여","흙이 좋으면 뭘 심어도 잘 나지"],
  egg:["달걀 있으면 가져와요! 값 잘 쳐줄게","닭은 잘 크고 있어요? 아침에 낳은 게 제일이지","우리 집 닭보다 그 집 닭이 더 부지런하네 허허"],
  meat:["어서 와요! 오늘 고기 때깔 좋아요","삼겹살은 솥뚜껑에 구워야 제맛이지","백숙 해 먹을 토종닭 있어요. 푹 고면 몸보신이야"],
  furniture:["어서 오게. 나무 냄새 좋지? 뭐 하나 짜 줄까","손때 묻을수록 좋아지는 게 나무 가구여","집에 들여놓는 건 내가 해 줄 테니 걱정 말게"],
  cattle:["허허, 소 보러 왔는가. 오늘 들어온 놈들 튼실하네","송아지는 여물 잘 먹이면 금방 커","다 키운 소 있으면 데려오게. 값 잘 쳐줌세"],
  fish:["오늘 물 좋아요! 새벽에 바닷가에서 바로 실어 왔어","골라 봐요, 싱싱한 걸로 담아 줄게","바다에서 멀어서 값은 좀 나가도 맛은 확실해"]};

// 말풍선이 있는 대화창. 사고팔고 나면 주인이 한마디 해요
function shopSheet(k,line,body){
  const d=SHOPS[k];
  openSheet(`<div class="talkhead"><div class="ava">${avatarSvg(d)}</div><div class="who"><b>${d.name}</b><small>${d.role}</small><p class="bubble">${line}</p></div></div>${body}<p class="hint mine">내 돈 ${S.money.toLocaleString()}원</p>`);
  sheet.classList.add("talk");
}
function goods(name,sub,btns){return `<div class="good"><div class="gname">${name}<small>${sub}</small></div><div class="gbtn">${btns}</div></div>`}

function openShop(k,line){if(SHOPS[k].open)return SHOPS[k].open(line);
  if(k==="fish")return openSeaMarket(line);
  if(k==="cattle")return openCattle(line);
  if(k==="furniture")return openFurniture(line);
  if(k==="meat")return openButcher(line);
  if(k==="dabang"){toast("다방 사장님: \""+pickOne(["어서 와요~ 아무 데나 편히 앉아요","쌍화차에 노른자 동동 띄워 줄까?","소파에 앉으면 차 갖다줄게"])+"\"");sfx("pop");return}
  const hello=line||pickOne(SHOP_HELLO[k]);let b='<div class="goods">';
  if(k==="veg"||k==="egg"){
    const list=k==="veg"?Object.keys(CROPS).concat(Object.keys(ITEMS).filter(i=>(ITEMS[i].grade||ITEMS[i].snack||i==="gam")&&S.inv[i]>0)):["egg"];
    list.forEach(i=>{const n=S.inv[i]||0;b+=goods(ITEMS[i].name,`가진 것 ${n}개 · 하나에 ${ITEMS[i].price}원`,`<button class="go" data-sell="${i}" ${n?"":"disabled"}>1개 팔기</button><button data-sellall="${i}" ${n>1?"":"disabled"}>다 팔기</button>`)});
    if(k==="veg"){const fo=Object.keys(FORAGE).filter(i=>S.inv[i]>0);if(fo.length){b+='</div><h3>뒷산에서 캔 것도 사 줘요</h3><div class="goods">';
      fo.forEach(i=>{const n=S.inv[i];b+=goods(FORAGE[i].name,`가진 것 ${n}개 · 하나에 ${FORAGE[i].sell.toLocaleString()}원`,`<button class="go" data-sell="${i}">1개 팔기</button><button data-sellall="${i}" ${n>1?"":"disabled"}>다 팔기</button>`)})}}
    if(k==="egg"){const H=ANIMALS.hen,full=S.hens>=coopMax();
      b+=goods("닭 한 마리",`${H.buy}원 · 우리 닭장 ${S.hens||0}/${coopMax()}마리 · 하루에 달걀 하나`,`<button class="go" data-hen="buy" ${S.coopLv&&!full&&S.money>=H.buy?"":"disabled"}>사기</button><button data-hen="sell" ${S.hens?"":"disabled"}>${H.sell}원에 팔기</button>`)}
    b+="</div>";
    if(k==="egg"&&!S.coopLv)b+=`<p class="hint">닭장이 없으면 닭을 들일 수 없어요 · 집 안 책상의 살림 장부에서 닭장을 지어요</p>`;
  }
  if(k==="seed"){
    b+=goods("모 한 판",`${RICE.moPrice}원 · 논에 심는 어린 벼 · 가진 것 ${S.inv.mo||0}판`,`<button class="go" data-mo="1" ${S.money>=RICE.moPrice?"":"disabled"}>사기</button>`);
    Object.keys(CROPS).forEach(i=>{const c=CROPS[i];b+=goods(c.name+" 씨앗",`${c.seed}원 · ${c.grow}초면 자라요(초안) · 가진 것 ${S.seeds[i]}`,`<button class="go" data-buy="${i}" ${S.money>=c.seed?"":"disabled"}>사기</button>`)});
    b+="</div>";
  }
  b+=`<p class="hint">생선 트럭, 정육점, 우시장도 날마다 열려요</p>`;
  shopSheet(k,hello,b);
  const sell=(i,n)=>{S.inv[i]-=n;const got=ITEMS[i].price*n;S.money+=got;sfx("coin");save();refresh();
    if(i==="sansam")return openShop(k,"세상에, 산삼이잖아! 내 평생 처음 보네. "+got.toLocaleString()+"원 쳐줄게!");
    if(ITEMS[i].grade==="king")return openShop(k,pickOne(["아이고 세상에, 이렇게 큰 건 처음 보네! ","장터 사람들 다 구경 오겠어! ","이건 상 줘야 해! "])+got.toLocaleString()+"원 쳐줄게");
    if(ITEMS[i].grade==="top")return openShop(k,pickOne([`이건 특상이네! 때깔이 달라. ${got}원`,`밭을 얼마나 잘 돌봤으면! 특상으로 ${got}원 쳐줄게`]));
    if(FORAGE[i])return openShop(k,pickOne([`${FORAGE[i].name} 향 좀 봐. ${got.toLocaleString()}원 줄게`,`뒷산 다녀왔구나? ${got.toLocaleString()}원!`]));
    const nm=ITEMS[i].name;openShop(k,k==="veg"?pickOne([`${josa(nm,"이","가")} 싱싱하네! ${got}원 여기 있어요`,`어머, 때깔 좀 봐. ${got}원 줄게`,`${nm} ${n}개, ${got}원! 또 가져와요`]):pickOne([`달걀 ${n}개 ${got}원! 아직 따끈하네`,`좋아요, ${got}원 드릴게`]))};
  sheet.querySelectorAll("[data-sell]").forEach(x=>x.onclick=()=>sell(x.dataset.sell,1));
  sheet.querySelectorAll("[data-sellall]").forEach(x=>x.onclick=()=>sell(x.dataset.sellall,S.inv[x.dataset.sellall]));
  sheet.querySelectorAll("[data-hen]").forEach(x=>x.onclick=()=>{
    if(x.dataset.hen==="buy"){const why=buyAnimal("hen");openShop(k,why?why+"!":pickOne(["튼실한 놈으로 골랐어요! 내일 아침부터 알 낳을 거예요","닭장에 데려다 놨어요. 모이 잘 주세요"]))}
    else{const p=sellAnimal("hen");openShop(k,"그동안 알 잘 낳았지요? "+p+"원 드릴게요")}});
  sheet.querySelectorAll("[data-mo]").forEach(x=>x.onclick=()=>{if(S.money<RICE.moPrice)return;S.money-=RICE.moPrice;S.inv.mo=(S.inv.mo||0)+1;sfx("coin");save();refresh();
    openShop(k,pickOne(["모 한 판 실하게 키운 걸로 줌세. 물 댄 논에 꽂게","모내기는 줄 맞춰서 해야 바람이 잘 통하는 법이여"]))});
  sheet.querySelectorAll("[data-buy]").forEach(x=>x.onclick=()=>{const i=x.dataset.buy,c=CROPS[i];if(S.money<c.seed)return;S.money-=c.seed;S.seeds[i]++;sfx("coin");save();refresh();
    openShop(k,pickOne([`${c.name} 씨앗 한 봉지. 물 잘 주게`,`${josa(c.name,"은","는")} 볕 좋은 데 심으면 잘 커`,`옜다, 한 줌 더 넣었네 허허`]))});
}

// 생선 트럭
function openSeaMarket(line){
  const d=new Date(),list=seaToday(d),star=SEA[list.find(k=>k!=="mackerel")||"mackerel"].name;
  let b='<div class="goods">';
  list.forEach(k=>{const s=SEA[k],r=RECIPES.find(x=>x.need[k]);b+=goods(s.name,`${s.buy}원 · ${s.desc}${r?" · 부뚜막에서 "+r.name:""} · 가진 것 ${S.inv[k]||0}`,`<button class="go" data-sea="${k}" ${S.money>=s.buy?"":"disabled"}>사기</button>`)});
  // 망태 속 고기는 한 마리씩 크기대로 값을 쳐줘요 (월척·대물은 훨씬 비싸게)
  const bag=S.bag.map((f,i)=>Object.assign({i},f,fishPrice(f.k,f.cm))).sort((a,b)=>b.p-a.p);
  if(bag.length){const tot=bag.reduce((a,f)=>a+f.p,0);b+=`</div><h3>냇가에서 잡은 민물고기 사 줘요 · 크기대로 값을 쳐줘요</h3><div class="goods">`;
    bag.slice(0,12).forEach(f=>{b+=goods(`${FRESH[f.k].name} ${f.cm}cm${f.tag?" · "+f.tag+"!":""}`,`${f.p.toLocaleString()}원`,`<button class="go" data-fsell="${f.i}">팔기</button>`)});
    if(bag.length>12)b+=`</div><p class="hint">망태에 ${bag.length-12}마리 더 있어요</p><div class="goods">`;
    b+=`</div><button class="go wide" id="fsellAll">망태 통째로 팔기 · ${bag.length}마리 ${tot.toLocaleString()}원</button><div>`}
  b+=`</div><p class="hint">바다에서 먼 마을이라 값이 좀 나가요. 바다 것은 되팔 수 없어요.</p>`;
  shopSheet("fish",line||`${star} 왔어요~ 싱싱한 ${SEASON_NAME[seasonOf(d)]} 바다 것! `+pickOne(SHOP_HELLO.fish),b);
  const fsell=idxs=>{let got=0,best=null;idxs.sort((a,b)=>b-a).forEach(i=>{const f=S.bag[i];if(!f)return;const pr=fishPrice(f.k,f.cm);got+=pr.p;if(!best||pr.p>best.p)best=Object.assign({},f,pr);S.bag.splice(i,1);S.inv[f.k]=Math.max(0,(S.inv[f.k]||0)-1)});
    S.money+=got;sfx("coin");save();refresh();
    openSeaMarket(best&&best.tag==="월척"?`이야, 월척이네! 이런 건 귀하지. ${got.toLocaleString()}원 쳐줌세`:best&&best.tag==="대물"?`대물이구먼! 값 잘 쳐줄게. ${got.toLocaleString()}원!`:pickOne([`실하네! ${got.toLocaleString()}원 줄게`,`냇가에서 잡았어? 손맛 좋았겠네. ${got.toLocaleString()}원!`]))};
  sheet.querySelectorAll("[data-fsell]").forEach(x=>x.onclick=()=>fsell([+x.dataset.fsell]));
  if($("fsellAll"))$("fsellAll").onclick=()=>fsell(S.bag.map((_,i)=>i));
  sheet.querySelectorAll("[data-sea]").forEach(x=>x.onclick=()=>{const k=x.dataset.sea,s=SEA[k];if(S.money<s.buy)return;S.money-=s.buy;S.inv[k]=(S.inv[k]||0)+1;sfx("coin");save();refresh();
    openSeaMarket(pickOne([`${s.name} 좋은 놈으로 골라 담았어요! 부뚜막에서 구워 봐요`,`${josa(s.name,"은","는")} 소금 살짝 쳐서 구우면 끝이야`,`고마워요~ 내일 또 와요`]))});
}
// 예전 이름 (다른 파일에서 불러도 되게)
function openMarket(){openShop("veg")}

// 우시장 소장수: 송아지·새끼 염소 사기, 우리 외양간 가축 팔기
function openCattle(line){
  let b='<h3>데려가기 · 외양간에 데려다줘요</h3><div class="goods">';
  ["calf","kid"].forEach(k=>{const A=ANIMALS[k],room=S.barnLv&&herdCount(A.kind)<barnCap(A.kind);
    b+=goods(A.name,`${A.buy.toLocaleString()}원 · ${A.desc} · 다 크면 ${ANIMALS[A.grown].sell.toLocaleString()}원`,`<button class="go" data-ani="${k}" ${room&&S.money>=A.buy?"":"disabled"}>데려가기</button>`)});
  b+='</div>';
  if(!S.barnLv)b+='<p class="hint">외양간이 없으면 데려갈 수 없어요 · 집 안 살림 장부에서 외양간을 지어요</p>';
  if(S.herd.length){b+='<h3>우리 외양간 가축 팔기</h3><div class="goods">';
    S.herd.forEach((a,i)=>{const A=ANIMALS[a.k];b+=goods(A.name,(A.feed?"여물 "+a.feed+"/"+A.feed+" · 아직 어려서 싸요":"다 자랐어요")+` · ${A.sell.toLocaleString()}원`,`<button data-sellani="${i}">팔기</button>`)});
    b+='</div>'}
  shopSheet("cattle",line||pickOne(SHOP_HELLO.cattle),b);
  sheet.querySelectorAll("[data-ani]").forEach(x=>x.onclick=()=>{const k=x.dataset.ani,why=buyAnimal(k);
    openCattle(why?why+"!":pickOne([ANIMALS[k].name+" 한 마리, 트럭으로 외양간에 데려다 놨네","여물 잘 먹이게. 금방 클 거야","좋은 놈 골랐구먼. 허허"]))});
  sheet.querySelectorAll("[data-sellani]").forEach(x=>x.onclick=()=>{const a=S.herd[+x.dataset.sellani],nm=ANIMALS[a.k].name,full=!ANIMALS[a.k].feed,p=sellAnimal(a.k,+x.dataset.sellani);
    openCattle(full?nm+" 참 잘 키웠구먼! "+p.toLocaleString()+"원 쳐줌세":"아직 어린데 벌써 파는가? "+p.toLocaleString()+"원일세")});
}

// 목공소 목수 할아버지: 칸별 가구. 사면 집 안 제자리에 들여 줘요. 그 칸이 아직 없으면 집을 넓혀야 해요
function openFurniture(line){
  const lv=S.houseLv||1;let b="";
  ["anbang","kitchen","daecheong","geonneon","sarang"].forEach(r=>{
    const ids=Object.keys(FURN).filter(id=>FURN[id].room===r),open=lv>=ROOM_LV[r];
    b+=`<h3>${ROOM_NAME[r]}${open?"":" · "+HOUSE_LV[ROOM_LV[r]-1].name+"부터"}</h3><div class="goods">`;
    ids.forEach(id=>{const F=FURN[id],have=S.furn[id];
      b+=goods(F.name,`${F.price.toLocaleString()}원 · ${F.desc}`,have?'<span class="done">들였어요</span>':`<button class="go" data-furn="${id}" ${open&&S.money>=F.price?"":"disabled"}>${open?"들이기":"집이 작아요"}</button>`)});
    b+="</div>"});
  b=`<h3>땔감</h3><div class="goods">`+goods("장작 한 짐",`${FUEL.bundle.price}원 · 장작 ${FUEL.bundle.n}개 · 장작가리 ${S.inv.jangjak||0}/${FUEL.pileMax}`,`<button class="go" data-bundle="1" ${S.money>=FUEL.bundle.price&&(S.inv.jangjak||0)+FUEL.bundle.n<=FUEL.pileMax?"":"disabled"}>사기</button>`)+"</div>"+b;
  b+='<p class="hint">산 가구는 집 안 제자리에 놓여요. 누르면 쓸 수 있는 것도 있어요 (물독, 괘종시계, 라디오, 찬장 …)</p>';
  shopSheet("furniture",line||pickOne(SHOP_HELLO.furniture),b);
  sheet.querySelectorAll("[data-bundle]").forEach(x=>x.onclick=()=>{S.money-=FUEL.bundle.price;S.inv.jangjak=(S.inv.jangjak||0)+FUEL.bundle.n;sfx("coin");save();refresh();drawWoodpile();
    openFurniture("장작 한 짐 지게에 지워 보냄세. 그래도 제 손으로 패는 게 제일 따뜻하지 허허")});
  sheet.querySelectorAll("[data-furn]").forEach(x=>x.onclick=()=>{const id=x.dataset.furn,F=FURN[id];if(S.money<F.price)return;
    S.money-=F.price;S.furn[id]=true;sfx("coin");save();refresh();if(inHouse)buildRoom();
    openFurniture(pickOne([F.name+" 하나 잘 짜 놨지. 내 지게로 "+ROOM_NAME[F.room]+"에 들여놓음세",josa(F.name,"은","는")+" 대대로 쓸 수 있게 짰네","고맙네. "+ROOM_NAME[F.room]+" 제자리에 놔뒀으니 가 보게"]))});
}

// 정육점: 고기 사기 (되팔 순 없어요). 부뚜막에서 제육볶음·삼겹살·불고기·백숙
function openButcher(line){
  let b='<div class="goods">';
  Object.entries(MEAT).forEach(([k,m])=>{const r=RECIPES.find(x=>x.need[k]);b+=goods(m.name,`${m.buy}원 · ${m.desc}${r?" · 부뚜막에서 "+r.name:""} · 가진 것 ${S.inv[k]||0}`,`<button class="go" data-meat="${k}" ${S.money>=m.buy?"":"disabled"}>사기</button>`)});
  b+='</div><p class="hint">고기는 되팔 수 없어요. 상추겉절이나 밥이랑 같이 먹으면 밥심이 나요</p>';
  shopSheet("meat",line||pickOne(SHOP_HELLO.meat),b);
  sheet.querySelectorAll("[data-meat]").forEach(x=>x.onclick=()=>{const k=x.dataset.meat,m=MEAT[k];if(S.money<m.buy)return;S.money-=m.buy;S.inv[k]=(S.inv[k]||0)+1;sfx("coin");save();refresh();
    openButcher(pickOne([m.name+" 좋은 데로 썰어 줬어요","신문지에 싸 줄게요. 맛있게 해 먹어요","덤으로 조금 더 넣었어요 허허"]))});
}
