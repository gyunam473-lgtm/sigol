/* 마당 잡초 (2026-11-13): 우리 마당 빈 풀밭에 가끔 잡초 덤불이 하나씩 돋아요(한꺼번에 둘까지).
   누르면 다가가서 콕콕 뿌리째 뽑기 → 땀방울, 뽑은 풀 세 번마다 두엄이 되어 거름 1포대.
   숫자는 YW (체험용이라 짧아요). 돋는 자리는 집·밭·길 같은 물건 자리를 피해서 골라요. */
const YW={every:360000,first:90000,max:2,perManure:3};
const ywG=new THREE.Group();land.add(ywG);
let ywSpots=null;
// 돋을 수 있는 자리: 집 둘레 마당 안, 물건 자리 피해서 (처음 한 번만 계산)
function ywFreeSpots(){if(ywSpots)return ywSpots;const R=footprints(land),out=[];
  for(let i=0;i<400&&out.length<40;i++){const x=-10+Math.random()*22,z=-6+Math.random()*18;
    if(!R.some(r=>x>r[0]-0.5&&x<r[1]+0.5&&z>r[2]-0.5&&z<r[3]+0.5))out.push([+x.toFixed(2),+z.toFixed(2)])}
  return ywSpots=out}
function drawYardWeeds(){ywG.children.slice().forEach(c=>ywG.remove(c));
  (S.yardWeeds||[]).forEach((w,i)=>{const g=new THREE.Group();g.position.set(w.x,0,w.z);
    for(let k=0;k<4;k++){const t=weedTuft(Math.cos(k*1.7)*0.22,Math.sin(k*1.7)*0.18,g,0);t.scale.setScalar(1.6+(k%2)*0.5)}
    // 누르기 쉽게 보이지 않는 상자
    const hb=hitBox(0.9,0.6,0.9,0,0.3,0);g.add(hb);
    poke(g,()=>pullYardWeed(i),[w.x+0.2,w.z+1.0]);ywG.add(g)})}
function yardWeedTick(){if(!S||!me)return;S.yardWeeds=S.yardWeeds||[];const now=Date.now();
  if(S.yardWeedT==null){S.yardWeedT=now-YW.every+YW.first;return}
  if(S.yardWeeds.length>=YW.max||now-S.yardWeedT<YW.every)return;
  const sp=ywFreeSpots().filter(([x,z])=>!S.yardWeeds.some(w=>Math.hypot(w.x-x,w.z-z)<2));if(!sp.length)return;
  const [x,z]=sp[Math.floor(Math.random()*sp.length)];S.yardWeeds.push({x,z});S.yardWeedT=now;drawYardWeeds();save();
  if(mode==="home"&&!PD&&!W&&!CK)toast("마당에 잡초가 돋았어요. 눌러서 뽑아 볼까요?")}
function pullYardWeed(i){const w=(S.yardWeeds||[])[i];if(!w||PD||SIT)return;const F=new THREE.Vector3(w.x,0.15,w.z);
  startChore(Object.assign(camAt(w.x,0.4,w.z,2.0,1.6),{steps:["pull","pull"],
    targets:()=>near(F,{n:5,d:0.4}),
    stepSetup(){this.g.children.slice().forEach(c=>{if(c.userData.tmp)this.g.remove(c)});
      this.st.t.forEach(t=>{const m=weedTuft(t.p.x,t.p.z,this.g,0.02);m.scale.setScalar(1.5);m.userData.tmp=1;t.m=m})},
    onTap(s,t){sfx("scrape");if(t.m){t.m.userData.v=1;t.m.userData.tmp=1}},
    onRub:noop,onHold:noop,
    frame(dt){this.g.children.forEach(c=>{if(c.userData.v){c.position.y+=dt*1.6;c.rotation.z+=dt*3;if(c.position.y>1)c.visible=false}})},
    finish(){S.yardWeeds.splice(S.yardWeeds.indexOf(w),1);S.yardWeedT=Date.now();S.weedsPulled=(S.weedsPulled||0)+1;sweat(2);
      let msg="잡초를 뿌리째 뽑았어요. 마당이 말끔해요";
      if(S.weedsPulled%YW.perManure===0){S.inv.geoleum=(S.inv.geoleum||0)+1;msg+=" · 모아 둔 풀이 두엄이 되어 거름 1포대"}
      else msg+=` · 풀 ${YW.perManure-S.weedsPulled%YW.perManure}번 더 뽑으면 거름 1포대`;
      drawYardWeeds();endChore(msg)}}))}
setInterval(yardWeedTick,5000);
{const c=homeClicks;homeClicks=function(){return c().concat(mode==="home"?ywG.children:[])}}
setTimeout(()=>{try{drawYardWeeds()}catch(e){}},500);
