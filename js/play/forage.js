/* 뒷산 캐기: 날마다 새로 돋는 나물·버섯·약초 (모양 자리는 world/places2.js 의 FORAGE_POS)
   - 뜯는 것(고사리·취나물·두릅·표고·송이·밤·도토리): 콕콕 세 번 따기
   - 캐는 것(도라지·더덕·산삼): 호미질(좌우 슥슥) → 살살 캐기(콕콕)
   철 따라 나오는 게 달라요. 아주 가끔 빨간 열매 달린 산삼이 보이면 "심봤다!"
   캐면 숙련도(FORAGE_LV)가 쌓여 귀한 게 더 잘 보이고, 많이 캐요. 채소가게 아줌마가 사 줘요. 도감에 산나물 도감
   마당일 작업 화면(play/chore.js)을 같이 써요. 종류·값은 data.js 의 FORAGE */

const forageXp=()=>S.skill.forage||0;
const forageLv=()=>{let l=0;FORAGE_LV.forEach((L,i)=>{if(forageXp()>=L.xp)l=i});return l};
Object.assign(CH,{
  nip:{name:"따기",g:"tap",guide:()=>"동그라미를 콕콕 눌러 하나씩 따요"},
  hoe:{name:"호미질",g:"rub",n:3,guide:n=>`호미로 둘레 흙을 좌우로 슥슥 파요 · ${n}번 남음`,pop:"슥",sfx:"scrape"},
  dig:{name:"살살 캐기",g:"tap",guide:()=>"뿌리가 다치지 않게 동그라미를 살살 콕콕"}});

// 오늘 돋은 것 (날마다 새로)
function rollForage(){const lv=forageLv(),se=seasonOf(new Date());
  const L=Object.entries(FORAGE).filter(([k,f])=>(!f.season||f.season.includes(se))&&unlocked("forage",k,lv));
  const wts=L.map(([k,f])=>f.w*(f.w<15?1+0.3*lv:1)*(k==="sansam"?1+0.5*lv:1));
  let r=Math.random()*wts.reduce((a,b)=>a+b,0),i=0;while(r>wts[i]){r-=wts[i];i++}return L[Math.min(i,L.length-1)][0]}
function forageToday(){const d=dayKey(new Date());
  if(S.forageDay!==d){S.forageDay=d;S.forageDone=[];S.forageAt={};S.forageSpots=FORAGE_POS.map(rollForage);save()}
  return S.forageSpots}
// 캔 자리는 FORAGE_REGROW 초 뒤 다시 돋아요 (무엇이 돋을지는 새로 정해요). 돋은 게 있으면 true
function forageRegrow(){forageToday();S.forageAt=S.forageAt||{};const now=Date.now();let ch=false;
  S.forageDone=S.forageDone.filter(i=>{if(!S.forageAt[i])S.forageAt[i]=now+FORAGE_REGROW*1000;if(now<S.forageAt[i])return true;
    delete S.forageAt[i];S.forageSpots[i]=rollForage();ch=true;return false});
  if(ch)save();return ch}
// 풀 모양 (무엇인지 눈치챌 수 있게)
function forageMesh(k){const g=new THREE.Group(),G=0x5f9a3e;
  if(k==="gosari")for(let i=0;i<5;i++){const s=cyl(0.015,0.02,0.4,0x7a8a3a,(i-2)*0.06,0.2,(i%2)*0.05,5);g.add(s);g.add(sph(0.04,0x7a8a3a,(i-2)*0.06,0.42,(i%2)*0.05))} // 돌돌 말린 새순
  else if(k==="chwi"||k==="doraji"||k==="deodeok")for(let i=0;i<7;i++){const l=box(0.12,0.01,0.06,k==="deodeok"?0x4a7a3a:G,0,0.12+i*0.02,0);l.rotation.y=i*0.9;l.rotation.z=0.4;g.add(l)}
  else if(k==="dureup"){g.add(cyl(0.025,0.03,0.7,0x7a5a3a,0,0.35,0,6));[0.72,0.6].forEach(y=>g.add(cone(0.05,0.12,0x8fbf5a,0,y,0,5)))}
  else if(k==="pyogo"||k==="songi"){if(k==="pyogo"){const lg=cyl(0.12,0.12,0.7,0x6a5a48,0,0.12,0,8);lg.rotation.z=Math.PI/2;g.add(lg)}
    for(let i=0;i<4;i++){const cap=sph(0.06,k==="songi"?0xb89a6a:0x6a4028,(i-1.5)*0.13,k==="pyogo"?0.25:0.12,0);cap.scale.y=0.5;g.add(cap);if(k==="songi")g.add(cyl(0.025,0.03,0.12,0xf2ead6,(i-1.5)*0.13,0.06,0,6))}}
  else if(k==="bam")for(let i=0;i<4;i++){const b=sph(0.07,0x8fae4a,(i-1.5)*0.1,0.07,(i%2)*0.08);g.add(b);g.add(sph(0.04,0x7a4a20,(i-1.5)*0.1+0.03,0.1,(i%2)*0.08+0.03))} // 밤송이
  else if(k==="dotori")for(let i=0;i<6;i++){const a=sph(0.03,0x9a6a3a,(Math.random()-.5)*0.3,0.03,(Math.random()-.5)*0.3);a.scale.y=1.3;g.add(a)}
  else if(k==="sansam"){for(let i=0;i<5;i++){const l=box(0.1,0.008,0.05,0x4f8a3a,0,0.3,0);l.rotation.y=i*1.25;l.position.x=Math.cos(i*1.25)*0.06;l.position.z=-Math.sin(i*1.25)*0.06;g.add(l)}
    g.add(cyl(0.008,0.008,0.3,0x5a7a3a,0,0.15,0,4));for(let i=0;i<6;i++)g.add(sph(0.018,0xd8201a,(i%3-1)*0.02,0.38+Math.floor(i/3)*0.02,(i%2)*0.02))} // 빨간 열매
  const sp=sph(0.06,0xf6e05a,0,0.75,0);sp.userData.spark=true;g.add(sp);
  const hit=new THREE.Mesh(new THREE.CylinderGeometry(0.75,0.75,1.4,10),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));hit.position.y=0.7;g.add(hit); // 누르는 자리를 넓게
  return g}
function applyForage(){forageRegrow();while(forageG.children.length)forageG.remove(forageG.children[0]);
  const sp=forageToday();sp.forEach((k,i)=>{if(S.forageDone.includes(i))return;const m=forageMesh(k);m.position.set(FORAGE_POS[i][0],sanH(FORAGE_POS[i][0],FORAGE_POS[i][1]),FORAGE_POS[i][1]);m.userData={kind:"forage",i};forageG.add(m)})}

function useForage(i){
  const k=forageToday()[i],f=FORAGE[k],[x,z]=FORAGE_POS[i],dig=f.how==="dig",lv=forageLv(),H=sanH(x,z);
  const ring=[0,1,2].map(j=>new THREE.Vector3(x+Math.cos(j*2.1)*0.18,H+0.3,z+Math.sin(j*2.1)*0.18));
  startChore({steps:dig?["hoe","dig"]:["nip"],focus:new THREE.Vector3(x,H+0.3,z),cam:new THREE.Vector3(x+0.5,H+1.8,z+1.9),look:new THREE.Vector3(x,H+0.2,z),
    targets:()=>ring,
    onRub(){const c=sp(this.focus);for(let j=0;j<5;j++){const b=sph(0.025,0x6a4a2e,x+(Math.random()-.5)*0.4,H+0.1,z+(Math.random()-.5)*0.4);b.userData.v=-1;this.g.add(b)}},
    onTap(s,t){sfx("pluck");const c=sp(t.p);wPop(c.x,c.y-30,s==="dig"?"살살":"똑")},
    frame(dt){this.g.children.forEach(b=>{if(b.userData.v){b.position.y+=dt*0.6;if(b.position.y>H+0.4)b.userData.v=0}})},
    finish(){
      const good=Math.random()<0.2+0.08*lv+avg(this.scores)*0.15,n=k==="sansam"?1:(dig?1:2)+(good?1:0)+(lv>=3&&!dig?1:0);
      S.inv[k]=(S.inv[k]||0)+n;const d=S.forageDex[k]||{n:0};const first=!d.n;d.n+=n;S.forageDex[k]=d;S.forageDone.push(i);S.forageAt=S.forageAt||{};S.forageAt[i]=Date.now()+FORAGE_REGROW*1000;
      const lv0=forageLv(),xp=k==="sansam"?40:f.w>=25?1:f.w>=12?2:4;S.skill.forage=forageXp()+xp;const lv1=forageLv();
      applyForage();
      if(k==="sansam"){endChore("");sfx("level");buzz([60,40,60,40,120]);
        openSheet(`<h2>심봤다!!!</h2><p class="hint">빨간 열매 아래, 백 년 묵은 산삼 한 뿌리를 캤어요.</p><div class="item"><div>산삼<small>채소가게 아줌마가 ${f.sell.toLocaleString()}원에 사 줘요 · 아니면 고이 간직해요</small></div><span class="done">대박</span></div><div class="item"><div>캐기 숙련도 +${xp}<small>${FORAGE_LV[lv1].name}</small></div></div>`);return}
      endChore(`${f.name} ${n}${dig?"뿌리를":"줌을"} 캤어요${good?" · 실한 걸로!":""}${first?" · 산나물 도감에 새로 담았어요":""} · 캐기 숙련도 +${xp}`+(lv1>lv0?` · '${FORAGE_LV[lv1].name}'가 됐어요!`+newlyOpen("forage",lv1,q=>FORAGE[q].name):""))}})}

function forageDexHtml(){const lv=forageLv();
  let h=`<h3>산나물 도감 · 캐기 숙련도 ${FORAGE_LV[lv].name} (${forageXp()}${FORAGE_LV[lv+1]?"/"+FORAGE_LV[lv+1].xp:""})</h3>`;
  Object.entries(FORAGE).forEach(([k,f])=>{const d=S.forageDex[k];
    const lk=(UNLOCK.forage[k]||0)>lv;
    h+=`<div class="item${lk?" locked":""}"><div>${d?f.name:lk?"🔒 ???":"???"}<small>${lk?"캐기 숙련도 '"+FORAGE_LV[UNLOCK.forage[k]].name+"'가 되면 눈에 띄어요":d?`${d.n}개 캤어요 · ${f.desc}`:(f.season?f.season.map(s=>SEASON_NAME[s]).join("·")+"에 돋아요":"뒷산 어딘가에")}</small></div>${d?'<span class="done">캤어요</span>':""}</div>`});
  return h}
