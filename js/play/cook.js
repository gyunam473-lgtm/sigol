/* 부뚜막 요리: 처마 밑 가마솥 앞에서 손동작으로 요리해요 (DESIGN.md 5번 + 손맛)
   감자전: 불 지피기 → 감자 갈기 → 솥뚜껑에 붓기 → 노릇할 때 뒤집기 → 접시에 담기
   다른 요리도 같은 손동작(콕콕·슥슥·빙글·끌기·때 맞추기)을 섞어서 만들어요.
   - 재료와 도구가 실제로 움직여요: 썬 토마토·뜯은 상추는 양푼으로 날아가고, 양푼을 끌면 손을 따라 들려서
     솥뚜껑 위에서 기울어지며 쏟아지고, 뒤집개로 전을 떠서 접시로 옮겨요.
   - 지금 쓰는 도구 위에 이름표(양푼, 솥뚜껑, 접시 …)가 떠요.
   다 만들면 재료가 쓰이고, 음식은 마당 평상 소반에 올라가요. 중간에 그만두면 재료는 그대로예요.
   음식·도구 모양은 world/food.js, 화면 틀(단계, 안내, 손가락, 게이지)은 밭일 작업 화면(play/work.js)과 같이 써요. */

const RECIPE_STEPS={jeon:["fire","grate","season","pour","flip","plate","garnish"],geot:["tear","season","toss","plate","garnish"],salad:["chop","tear","season","toss","plate"],
  egg:["fire","crack","season","whisk","pour","roll","plate","garnish"],tomegg:["fire","chop","crack","pour","stirfry","season","plate"],kimjang:["salt","season","toss","plate"],
  guljeon:["fire","crack","whisk","pour","flip","plate","garnish"],
  bap:["fire","wash","anchi","tteum","plate"],
  // 고기 요리: 삼겹살은 솥뚜껑에 굽고 뒤집기, 제육·불고기는 볶기, 백숙은 가마솥에 넣고 푹 고기
  samgyeopsal:["fire","place","season","flip","plate","garnish"],jeyuk:["fire","place","season","stirfry","plate","garnish"],bulgogi:["fire","place","season","stirfry","plate","garnish"],baeksuk:["fire","dakin","tteum","plate","garnish"]};
// 양념 (요리마다 다른 병): [이름, 색]
const SEASON_JARS={jeon:[["소금",0xf4f4f0],["들기름",0xc89a3a]],geot:[["고춧가루",0xc0392b],["간장",0x3a2214],["참기름",0xd8a838]],salad:[["소금",0xf4f4f0],["식초",0xe8e0b0],["참기름",0xd8a838]],
  egg:[["소금",0xf4f4f0],["송송 파",0x5d9a3e]],tomegg:[["소금",0xf4f4f0],["설탕",0xfafafa],["후추",0x3a3a3a]],kimjang:[["고춧가루",0xc0392b],["젓갈",0x8a6a4a],["마늘",0xf2ead6]],
  samgyeopsal:[["굵은소금",0xf4f4f0],["후추",0x3a3a3a]],jeyuk:[["고추장",0xa8281a],["설탕",0xfafafa],["다진 마늘",0xf2ead6]],bulgogi:[["간장",0x3a2214],["설탕",0xfafafa],["참기름",0xd8a838]]};
const seasonJars=()=>SEASON_JARS[CK.id]||(fishOf(CK.id)?[["굵은소금",0xf4f4f0]]:[["소금",0xf4f4f0],["간장",0x3a2214],["참기름",0xd8a838]]);
// 고명 (다 담은 뒤 위에 솔솔): 색들
const GARNISH={jeon:[0x5d9a3e,0xc0392b],geot:[0xf6eedc,0xc0392b],egg:[0x5d9a3e,0xc0392b],guljeon:[0x5d9a3e,0xc0392b],samgyeopsal:[0x5d9a3e,0xf2ead6],jeyuk:[0xf6eedc,0x5d9a3e],bulgogi:[0xf6eedc,0x5d9a3e],baeksuk:[0x5d9a3e,0xf6eedc]};
const GARNISH_NAME={jeon:"실고추·쪽파",geot:"통깨·실고추",egg:"쪽파·실고추",guljeon:"쪽파·실고추",samgyeopsal:"파채·마늘",jeyuk:"통깨·쪽파",bulgogi:"통깨·쪽파",baeksuk:"송송 파·통깨"};
// 요리마다 단계 이름을 조금 다르게
const STEP_ALIAS={bap:{plate:"밥 푸기"},baeksuk:{tteum:"푹 고기",plate:"그릇에 담기"},jeyuk:{stirfry:"달달 볶기"},bulgogi:{stirfry:"볶기"},samgyeopsal:{flip:"뒤집기"}}; // 가마솥 밥: 불 지피기 → 쌀 씻기 → 솥에 안치기 → 뜸 들이기 → 밥 푸기
// 생선구이: 불 지피기 → 생선을 솥뚜껑에 올리기 → 밑면이 노릇할 때 뒤집기 → 접시에 담기
Object.keys(FISH).forEach(k=>RECIPE_STEPS["gui_"+k]=["fire","place","season","flip","plate"]);
const fishOf=id=>id&&id.startsWith("gui_")?id.slice(4):null;
// 부뚜막 위 자리 (부뚜막 기준). 왼쪽 = 가마솥(뒤집은 솥뚜껑을 프라이팬으로), 오른쪽 = 도마
const P_FIRE=[-0.45,0.24,0.58],P_PAN=[-0.45,0.975,0],P_BOWL=[0.27,0.85,0.04],P_ING=[0.66,0.85,0],P_SALT=[0.86,0.8,0.2];
const FOCUS={fire:{cam:[-0.45,0.95,1.75],look:[-0.45,0.25,0.4]},board:{cam:[0.45,1.75,1.05],look:[0.45,0.6,-0.1]},
  pot:{cam:[-0.45,1.85,1.0],look:[-0.45,0.65,-0.1]},mid:{cam:[-0.05,2.2,1.55],look:[-0.05,0.6,-0.1]}};
// 접시 자리: 전처럼 솥뚜껑에서 옮길 땐 양푼을 치우고 솥뚜껑 가까이, 양푼에서 옮길 땐 도마 오른쪽
const plateAt=()=>CK&&CK.inPan?[0.42,0.85,0]:[0.64,0.85,0];
const focusOf=d=>typeof d.focus==="function"?d.focus():d.focus;
const JEON_BURNT=new THREE.Color(0x4a3020),WHITE=new THREE.Color(0xffffff),FISH_GOLD=new THREE.Color(0xc98a3a);
const FLIP_ZONE=[0.55,0.82];
const lerp=(a,b,k)=>a+(b-a)*k;

let CK=null; // 지금 하는 요리 (없으면 null)
function tw(dur,fn,done){CK.tw.push({t:0,dur,fn,done})} // 짧은 움직임
const vpos=o=>[o.position.x,o.position.y,o.position.z];

/* ---------- 단계 ---------- */
// g: tap(콕콕) · rub(슥슥, axis x/y) · circle(빙글) · drag(끌어 옮기기) · timing(때 맞춰 위로 휙)
const CS={
  fire:{name:"불 지피기",focus:"fire",g:"tap",pts:()=>[P_FIRE,P_FIRE],tags:()=>[[P_FIRE,"아궁이"]],guide:()=>"아궁이를 콕콕 눌러 장작을 넣고 불을 붙여요",
    hit(k){sfx("crackle");const l=cyl(0.04,0.04,0.3,0x7a5a3a,-0.45+(k-0.5)*0.13,0.11,1.15,6);l.rotation.x=Math.PI/2;CK.g.add(l);
      tw(0.3,e=>l.position.z=lerp(1.15,0.66,e),()=>{CK.g.remove(l);stoveLogs.visible=true;stoveLogs.children[k].visible=true;
        if(k===1){stoveFireMat.opacity=0.9;CK.fire=true;popAt(P_FIRE,"화르르")}})}},
  grate:{name:"감자 갈기",focus:"board",g:"rub",axis:"y",n:4,tags:()=>[[P_ING,"감자 · 강판"],[P_BOWL,"양푼"]],guide:n=>`감자를 강판에 위아래로 슥슥 갈아요. 간 감자는 양푼에 모여요 · ${n}번 남음`,
    setup(){const gr=grater();gr.rotation.x=-0.3;gr.position.y=0.06;setIng(gr);CK.potato=potato();CK.potato.position.y=0.15;CK.ing.add(CK.potato)},
    stroke(k,n){sfx("scrape");const p=CK.potato;tw(0.2,e=>p.position.z=Math.sin(e*Math.PI)*0.09,null);p.scale.multiplyScalar(0.86);bowlLiquid("batter",k/n)}},
  tear:{name:"상추 뜯기",focus:"board",g:"rub",axis:"x",n:3,tags:()=>[[P_ING,"상추"],[P_BOWL,"양푼"]],guide:n=>`상추를 좌우로 쭉쭉 뜯어 양푼에 담아요 · ${n}번 남음`,
    setup(){setIng(lettuceHead())},
    stroke(){sfx("scrape");for(let i=0;i<2;i++){const h=CK.ing.children[0];if(h&&h.children.length>1)h.remove(h.children[h.children.length-1]);flyToBowl(()=>leafPiece(T.leaf(false)))}}},
  chop:{name:"토마토 썰기",focus:"board",g:"tap",r:15,pts:()=>[-0.05,0,0.05].map(d=>[P_ING[0]+d,P_ING[1]+0.09,P_ING[2]]),tags:()=>[[P_ING,"토마토 · 칼"],[P_BOWL,"양푼"]],guide:()=>"칼 자리를 콕콕 눌러 토마토를 썰어요",
    setup(){CK.tomato=tomato();CK.tomato.position.y=0.065;setIng(CK.tomato);CK.knife=knife();CK.knife.position.set(P_ING[0]+0.02,P_ING[1]+0.3,P_ING[2]);CK.g.add(CK.knife)},
    hit(k){sfx("chop");const kn=CK.knife,x=P_ING[0]+(k-1)*0.05;tw(0.22,e=>kn.position.set(x,P_ING[1]+0.24-Math.sin(e*Math.PI)*0.12,P_ING[2]),null);
      const s=tomatoSlice();s.position.set((k-1)*0.05,0.012,0.1);s.rotation.x=0.2;CK.ing.add(s);CK.tomato.scale.x*=0.72},
    done(){CK.ing.children.filter(c=>c.userData.slice).forEach(s=>{CK.ing.remove(s);flyToBowl(tomatoSlice)});CK.tomato.visible=false;const kn=CK.knife;tw(0.3,e=>kn.position.y=P_ING[1]+0.24+e*0.3,()=>CK.g.remove(kn));return 700}},
  crack:{name:"달걀 깨기",focus:"board",g:"tap",pts:()=>[[P_ING[0],P_ING[1]+0.06,P_ING[2]],[P_ING[0],P_ING[1]+0.06,P_ING[2]]],tags:()=>[[P_ING,"달걀"],[P_BOWL,"양푼"]],guide:()=>"달걀을 양푼 가장자리에 톡, 톡 쳐서 깨요",
    setup(){CK.egg=egg();CK.egg.position.y=0.06;setIng(CK.egg)},
    hit(k){sfx("crack");const e=CK.egg,dx=P_BOWL[0]+0.17-P_ING[0],bx=P_BOWL[0]-P_ING[0],bz=P_BOWL[2]-P_ING[2];
      if(k===0)tw(0.3,q=>{const s=Math.sin(q*Math.PI);e.position.x=dx*s;e.position.y=0.06+0.05*s},()=>{const c=new THREE.Mesh(new THREE.TorusGeometry(0.046,0.003,4,20),new THREE.MeshBasicMaterial({color:0x5a4030}));c.rotation.x=Math.PI/2;e.add(c)});
      else tw(0.3,q=>e.position.set(bx*q,0.06+0.14*Math.sin(q*Math.PI/2),bz*q),()=>{e.visible=false;shellHalves();bowlLiquid("eggRaw",0.35)})}},
  salt:{name:"배추 절이기",focus:"board",g:"tap",pts:()=>[[-0.06,-0.03],[0.06,0],[0,0.06]].map(d=>[P_ING[0]+d[0],P_ING[1]+0.12,P_ING[2]+d[1]]),tags:()=>[[P_ING,"배추"],[P_SALT,"소금"]],guide:()=>"배추 사이사이에 소금을 콕콕 뿌려 절여요",
    setup(){setIng(cabbageHalf());const sd=sabal(0.05,0.04);const s=disc(0.045,0.004,lmat(T.salt()),0xffffff);s.position.y=0.03;sd.add(s);sd.position.set(...P_SALT);CK.g.add(sd);CK.saltDish=sd},
    hit(k){sfx("seed");const p=CS.salt.pts()[k];for(let i=0;i<14;i++){const s=sph(0.006,0xffffff,p[0]+fr(-0.04,0.04),p[1]+0.2,p[2]+fr(-0.04,0.04));s.castShadow=false;CK.g.add(s);
      const y1=p[1]-0.01+fr(0,0.015);tw(0.3+fr(0,0.15),e=>s.position.y=lerp(p[1]+0.2,y1,e*e),null)}}},
  whisk:{name:"달걀 풀기",focus:"board",g:"circle",n:2,tags:()=>[[P_BOWL,"양푼 · 젓가락"]],guide:n=>(CK.id==="guljeon"?"굴에 달걀옷이 입혀지게 ":"")+`젓가락으로 양푼을 빙글빙글 저어 달걀을 풀어요 · ${n}바퀴 남음`,
    setup(){clearIng();CK.tool=chopsticks();CK.bowl.add(CK.tool);CK.tool.position.set(0.06,0.06,0);bowlLiquid2("eggBeat");
      if(CK.id==="guljeon")for(let i=0;i<5;i++){const o=gulPiece();o.position.set(fr(-0.06,0.06),0.06,fr(-0.06,0.06));CK.bc.add(o)}},
    move(f){if(CK.bLiq2)CK.bLiq2.material[1].opacity=Math.min(1,f)},stroke(){sfx("whisk")}},
  toss:{name:"버무리기",focus:"board",g:"circle",n:2,tags:()=>[[P_BOWL,"양푼 · 주걱"]],
    guide:n=>({geot:"양념이 골고루 묻게",salad:"토마토와 상추가 섞이게",kimjang:"배추에 김치 양념이 배게"}[CK.id]||"")+` 빙글빙글 버무려요 · ${n}바퀴 남음`,
    setup(){clearIng();if(CK.saltDish){CK.g.remove(CK.saltDish);CK.saltDish=null}
      if(CK.id==="kimjang")for(let i=0;i<6;i++){const l=leafPiece(T.cabbageLeaf(),0.1,0.15);l.position.set(fr(-0.05,0.05),fr(0.03,0.06),fr(-0.05,0.05));l.rotation.y=fr(0,TAU);CK.bc.add(l)}
      if(CK.id!=="salad"){CK.paste=sph(0.045,CK.id==="kimjang"?0xb8321f:0xc0392b,0,0.08,0);CK.paste.scale.y=0.6;CK.bc.add(CK.paste)} // 양념
      CK.tool=juguk();CK.bowl.add(CK.tool);CK.tool.position.set(0.06,0.06,0)},
    move(f){if(CK.paste){const s=Math.max(0.02,1-f);CK.paste.scale.set(s,s*0.6,s)}},
    stroke(k,n){sfx("whisk");if(CK.id==="salad")return;const sw=CK.id==="kimjang"?T.kimchi():T.leaf(true),ls=CK.bc.children.filter(c=>c.userData.leaf);
      ls.slice(0,Math.ceil(ls.length*k/n)).forEach(l=>{l.userData.mesh.material.map=sw;l.userData.mesh.material.needsUpdate=true})}},
  wash:{name:"쌀 씻기",focus:"board",g:"circle",n:2,tags:()=>[[P_BOWL,"양푼 · 쌀"]],guide:n=>`양푼에 쌀을 담아 손으로 빙글빙글 씻어요. 뽀얀 쌀뜨물이 나와요 · ${n}바퀴 남음`,
    setup(){bowlLiquid("riceWash",0.5)},move(f){if(CK.bLiq)CK.bLiq.material[0].color.setHex(0xffffff).lerp(new THREE.Color(0xdde8ec),Math.min(1,f))},stroke(){sfx("whisk");sfx("water")}},
  anchi:{name:"솥에 안치기",focus:"mid",g:"drag",src:()=>CK.bowl,lift:1.15,to:()=>P_PAN,tags:()=>[[()=>vpos(CK.bowl),"씻은 쌀"],[P_PAN,"가마솥"]],
    guide:()=>"씻은 쌀이 담긴 양푼을 들어 왼쪽 가마솥에 부어요. 물은 손등이 잠길 만큼",
    success:()=>{const b=CK.bowl,from=b.position.clone(),to=new THREE.Vector3(P_PAN[0]+0.2,1.25,P_PAN[2]),home=new THREE.Vector3(...P_BOWL);
      tw(0.3,e=>{stoveLid.position.y=0.95+0.4*e;stoveLid.rotation.z=0.5*e;b.position.lerpVectors(from,to,e)},()=>tw(0.6,e=>{b.rotation.z=1.1*Math.sin(Math.min(1,e*1.4)*Math.PI/2);if(CK.bLiq)CK.bLiq.scale.y=Math.max(0.01,1-e)},
        ()=>{sfx("water");CK.bc.children.slice().forEach(o=>CK.bc.remove(o));CK.bLiq=null;tw(0.35,e=>{stoveLid.position.y=1.35-0.4*e;stoveLid.rotation.z=0.5*(1-e);b.rotation.z=1.1*(1-e);b.position.lerpVectors(to,home,e)},null)}));
      return 1400}},
  tteum:{name:"뜸 들이기",focus:"pot",g:"timing",tags:()=>[[P_PAN,"가마솥"]],guide:()=>CK.id==="baeksuk"?"닭이 푹 고아져 김이 푹푹 나면 위로 휙 밀어 불을 줄여요. 너무 오래 끓이면 국물이 졸아요":"밥물이 끓어 솥뚜껑이 눈물을 흘리면(김이 푹푹) 위로 휙 밀어 불을 빼고 뜸을 들여요"},
  season:{name:"양념하기",focus:()=>CK.inPan?"mid":"board",g:"tap",pts:()=>CK.jars.map(j=>vpos(j).map((v,i)=>i===1?v+0.1:v)),tags:()=>[[()=>CK.inPan?P_PAN:vpos(CK.bowl),CK.inPan?"솥뚜껑":"양푼"]],
    guide:()=>"양념 병을 하나씩 콕 눌러 "+seasonJars().map(j=>j[0]).join(", ")+"을 넣어요",
    setup(){CK.jars=seasonJars().map(([n,c],i,a)=>{const g=new THREE.Group();g.add(cyl(0.035,0.04,0.12,0xf2f0ea,0,0.06,0,10));g.add(cyl(0.036,0.036,0.05,c,0,0.08,0,10));g.add(cyl(0.02,0.02,0.03,0x8a5a32,0,0.135,0,8));
      g.position.set(0.36+(i-(a.length-1)/2)*0.14,P_ING[1]-0.02,0.3);CK.g.add(g);g.userData.home=g.position.clone();g.userData.col=c;return g})},
    hit(k){const j=CK.jars[k],to=CK.inPan?new THREE.Vector3(...P_PAN):CK.bowl.position.clone(),home=j.userData.home,top=to.clone().add(new THREE.Vector3(0.05,0.32,0));sfx("pour");
      tw(0.3,e=>j.position.lerpVectors(home,top,e),()=>{tw(0.5,e=>{j.rotation.z=2.1*Math.sin(e*Math.PI)},()=>tw(0.3,e=>j.position.lerpVectors(top,home,e),null));
        for(let i=0;i<14;i++){const p=sph(0.008,j.userData.col,top.x-0.06+fr(-0.03,0.03),top.y-0.05,top.z+fr(-0.03,0.03));p.castShadow=false;CK.g.add(p);const y1=to.y+0.03+fr(0,0.02),x1=to.x+fr(-0.1,0.1),z1=to.z+fr(-0.1,0.1),x0=p.position.x,z0=p.position.z,y0=p.position.y;
          tw(0.35+fr(0,0.25),e=>p.position.set(lerp(x0,x1,e),lerp(y0,y1,e*e),lerp(z0,z1,e)),()=>{if(!CK)return;CK.g.remove(p);if(CK.inPan&&CK.pc){p.position.sub(CK.pc.position);CK.pc.add(p)}else{p.position.sub(CK.bowl.position);CK.bc.add(p)}})}})},
    done(){const js=CK.jars;setTimeout(()=>{if(CK)js.forEach(j=>CK.g.remove(j))},900);return 900}},
  garnish:{name:"고명 올리기",focus:"board",g:"tap",pts:()=>{const p=plateAt();return [[-0.05,0],[0.05,-0.03],[0,0.05]].map(([a,b])=>[p[0]+a,p[1]+0.09,p[2]+b])},tags:()=>[[plateAt(),"다 담은 "+CK.r.name]],
    guide:()=>"마지막으로 "+(GARNISH_NAME[CK.id]||"고명")+"을 콕콕 솔솔 올려요",
    hit(k){sfx("seed");const p=plateAt(),cols=GARNISH[CK.id]||[0x5d9a3e,0xf6eedc];
      for(let i=0;i<10;i++){const c=cols[i%cols.length],m=i%2?box(0.022,0.004,0.004,c,0,0,0):sph(0.0055,c,0,0,0);m.castShadow=false;const x=p[0]+fr(-0.07,0.07),z=p[2]+fr(-0.07,0.07),y1=p[1]+0.06+fr(0,0.02);
        m.position.set(x,p[1]+0.25,z);m.rotation.y=fr(0,TAU);CK.g.add(m);tw(0.3+fr(0,0.2),e=>m.position.y=lerp(p[1]+0.25,y1,e*e),null)}}},
  pour:{name:"솥뚜껑에 붓기",focus:"mid",g:"drag",src:()=>CK.bowl,lift:1.05,to:()=>P_PAN,
    tags:()=>[[()=>vpos(CK.bowl),"양푼"],[P_PAN,"솥뚜껑 (뒤집어서 프라이팬으로)"]],
    guide:()=>({jeon:"반죽 담긴 양푼을",egg:"달걀물 담긴 양푼을",tomegg:"양푼째",guljeon:"굴 넣은 달걀물 양푼을"}[CK.id]||"양푼을")+" 들어 왼쪽 솥뚜껑에 부어요",
    setup(){flipLid()},success:()=>pourAnim()},
  place:{name:"솥뚜껑에 올리기",focus:"mid",g:"drag",src:()=>CK.ing,lift:1.05,to:()=>P_PAN,
    tags:()=>[[()=>vpos(CK.ing),CK.meat?ITEMS[Object.keys(CK.r.need)[0]].name:CK.r.name.replace("구이","")],[P_PAN,"솥뚜껑 (뒤집어서 프라이팬으로)"]],
    guide:()=>CK.meat?"도마 위 고기를 집어 왼쪽 솥뚜껑에 올려요. 치익 소리가 나요":"도마 위 생선을 집어 왼쪽 솥뚜껑에 올려요. 들기름을 둘러 뒀어요",
    setup(){flipLid();const f=CK.meat?meatGroup(CK.id):fishGroup(fishOf(CK.id),false);setIng(f);CK.ing.position.y=P_ING[1]+0.01},success:()=>placeFishAnim()},
  dakin:{name:"솥에 넣기",focus:"mid",g:"drag",src:()=>CK.ing,lift:1.15,to:()=>P_PAN,tags:()=>[[()=>vpos(CK.ing),"토종닭"],[P_PAN,"가마솥"]],
    guide:()=>"손질한 토종닭을 들어 왼쪽 가마솥에 넣어요. 마늘이랑 대추도 넣었어요",
    setup(){setIng(meatGroup("baeksuk"));CK.ing.position.y=P_ING[1]+0.01},
    success:()=>{const o=CK.ing,from=o.position.clone(),to=new THREE.Vector3(P_PAN[0],1.1,P_PAN[2]);
      tw(0.3,e=>{stoveLid.position.y=0.95+0.45*e;stoveLid.rotation.z=0.5*e;o.position.lerpVectors(from,to,e)},()=>tw(0.3,e=>{o.position.y=1.1-0.25*e;o.scale.setScalar(1-0.5*e)},
        ()=>{sfx("water");o.visible=false;tw(0.35,e=>{stoveLid.position.y=1.4-0.45*e;stoveLid.rotation.z=0.5*(1-e)},null)}));return 1100}},
  flip:{name:"뒤집기",focus:"pot",g:"timing",tags:()=>[[P_PAN,CK.panName||"감자전"]],guide:()=>CK.fish?"생선 밑면이 노릇노릇 구워지면 위로 휙 밀어 뒤집어요":"가장자리가 노릇노릇해지면 위로 휙 밀어 뒤집어요"},
  roll:{name:"돌돌 말기",focus:"pot",g:"rub",axis:"y",n:3,tags:()=>[[P_PAN,"달걀 · 뒤집개"]],guide:n=>`뒤집개로 위아래로 밀어 돌돌 말아요 · ${n}번 남음`,
    setup(){CK.roll=eggRoll();CK.roll.scale.set(1,0.25,0.25);CK.roll.position.set(0,0.03,-0.18);CK.pc.add(CK.roll);CK.tool=spatula();CK.tool.position.set(0,0.03,-0.1);CK.pc.add(CK.tool)},
    stroke(k,n){sfx("scrape");const f=k/n;CK.sheet.scale.z=1-0.85*f;CK.sheet.position.z=0.19*f;const r=0.25+0.75*f;CK.roll.scale.set(1,r,r);CK.roll.position.set(0,0.01+0.035*r,-0.18+0.2*f);CK.tool.position.z=-0.1+0.2*f;
      if(k>=n)CK.sheet.visible=false}},
  stirfry:{name:"볶기",focus:"pot",g:"circle",n:2,tags:()=>[[P_PAN,"솥뚜껑 · 주걱"]],guide:n=>`주걱으로 빙글빙글 볶아요. ${CK.meat?(CK.id==="jeyuk"?"고추장 양념이 지글지글 졸아요":"간장 양념이 배어들어요"):"달걀이 몽글몽글 익어요"} · ${n}바퀴 남음`,
    setup(){CK.tool=juguk();CK.pc.add(CK.tool);CK.tool.position.set(0.1,0.04,0);CK.blobs=[];if(CK.meat)return
      for(let i=0;i<10;i++){const b=scrambleBlob();b.position.set(fr(-0.14,0.14),0.015,fr(-0.14,0.14));b.visible=false;CK.pc.add(b);CK.blobs.push(b)}},
    move(f){if(CK.meat){if(CK.cake&&CK.cake.userData.cook)CK.cake.userData.cook(Math.min(1,f));return}const n=Math.floor(Math.min(1,f)*CK.blobs.length);CK.blobs.forEach((b,i)=>b.visible=i<n);if(CK.sheet){const s=Math.max(0.05,1-f);CK.sheet.scale.set(s,1,s)}},stroke(){sfx("sizzle")}},
  plate:{name:"접시에 담기",focus:()=>CK.inPan?"mid":"board",g:"drag",src:()=>CK.inPan?CK.pc:CK.bowl,lift:1.1,to:()=>plateAt(),
    tags:()=>[[()=>vpos(CS.plate.src()),CK.id==="baeksuk"?"국자로 떠요":CK.id==="bap"?"주걱으로 떠요":CK.inPan?(CK.meat?"주걱으로 떠요":"뒤집개로 떠요"):"양푼"],[plateAt(),CK.pot?"그릇":"접시"]],
    guide:()=>CK.id==="baeksuk"?"국자로 닭과 국물을 떠서 오른쪽 그릇에 담아요":CK.id==="bap"?"주걱으로 밥을 떠서 오른쪽 사발에 고봉으로 담아요":CK.meat?"주걱으로 떠서 오른쪽 접시에 담아요":CK.inPan?"뒤집개로 떠서 오른쪽 접시에 옮겨 담아요":"양푼을 들어 오른쪽 접시에 담아요",
    setup(){clearIng();removeTool();if(CK.saltDish){CK.g.remove(CK.saltDish);CK.saltDish=null}
      CK.plate=plateMesh();CK.plate.position.set(...plateAt());CK.g.add(CK.plate);
      if(CK.inPan){CK.bowl.visible=false;CK.tool=CK.pot||CK.meat?juguk():spatula();CK.tool.position.set(0,-0.004,0.06);CK.pc.add(CK.tool)}},
    success:()=>plateAnim()}
};

/* ---------- 부뚜막 위 소품 다루기 ---------- */
function setIng(m){clearIng();CK.ing=new THREE.Group();CK.ing.position.set(...P_ING);CK.ing.add(m);CK.g.add(CK.ing)}
function clearIng(){if(CK.ing){CK.g.remove(CK.ing);CK.ing=null}}
function removeTool(){if(CK.tool&&CK.tool.parent)CK.tool.parent.remove(CK.tool);CK.tool=null}
// 양푼 속 물기 있는 것(반죽, 달걀물): level 0~1 만큼 차올라요
function bowlLiquid(key,level){let l=CK.bLiq;if(!l||l.userData.key!==key){if(l)CK.bc.remove(l);l=CK.bLiq=disc(0.14,0.006,lmat(T[key]()),0xe9d9a6);l.userData.key=key;CK.bc.add(l)}
  l.visible=true;l.position.y=0.012+level*0.05;const r=(0.11+level*0.05)/0.14;l.scale.set(r,1,r)}
function bowlLiquid2(key){const b=CK.bLiq;const l=CK.bLiq2=disc(0.14,0.004,lmat(T[key](),{transparent:true,opacity:0}),new THREE.MeshLambertMaterial({transparent:true,opacity:0}));
  l.position.y=b.position.y+0.004;l.scale.copy(b.scale);CK.bc.add(l)}
function flyToBowl(make){const m=make(),b=CK.bowl.position,t=[fr(-0.07,0.07),fr(0.03,0.06),fr(-0.07,0.07)],f=[P_ING[0],P_ING[1]+0.12,P_ING[2]];
  m.position.set(...f);m.rotation.y=fr(0,TAU);CK.g.add(m);
  tw(0.35,e=>m.position.set(lerp(f[0],b.x+t[0],e),lerp(f[1],b.y+t[1],e)+Math.sin(e*Math.PI)*0.12,lerp(f[2],b.z+t[2],e)),()=>{CK.g.remove(m);m.position.set(...t);CK.bc.add(m)})}
function shellHalves(){const b=CK.bowl.position;[-1,1].forEach(d=>{const h=solid(new THREE.Mesh(new THREE.SphereGeometry(0.045,12,8,0,TAU,0,Math.PI/2),new THREE.MeshPhongMaterial({color:0xe6c29a,side:THREE.DoubleSide})));
  h.rotation.z=d*Math.PI/2;h.position.set(b.x,b.y+0.16,b.z);CK.g.add(h);tw(0.4,e=>{h.position.x=b.x+d*0.12*e;h.position.y=b.y+0.16+0.05*e},()=>CK.g.remove(h))})}
function flipLid(){if(!CK.lidFlipped){CK.lidFlipped=true;tw(0.45,e=>{stoveLid.rotation.x=Math.PI*e;stoveLid.position.y=0.95+Math.sin(Math.PI*e)*0.35},null)}}
// 솥뚜껑에 부은 것 만들기
function makePanContent(){
  const pc=CK.pc;
  if(CK.id==="guljeon"){CK.panName="굴전";const top=lmat(T_SEA.guljeon()),bottom=lmat(T_SEA.guljeonRaw()),side=new THREE.MeshLambertMaterial({color:0xe9b84a});CK.cakeBottom=bottom;CK.texRaw=T_SEA.guljeonRaw;CK.texDone=T_SEA.guljeon;
    const g=new THREE.Group(),rawM=lmat(T_SEA.guljeonRaw(),{transparent:true,opacity:1}),raws=new THREE.Group();
    for(let i=0;i<5;i++){const a=i/5*TAU,x=Math.cos(a)*0.17,z=Math.sin(a)*0.17,d=disc(0.07,0.018,top,side,0.12,bottom);d.position.set(x,0.011,z);g.add(d);
      const r=solid(new THREE.Mesh(new THREE.CircleGeometry(0.072,24),rawM));r.rotation.x=-Math.PI/2;r.position.set(x,0.0215,z);raws.add(r)}
    raws.material=rawM;g.add(raws);pc.add(g);CK.cake=g;CK.cakeTop=g.children[0];CK.cakeRaw=raws;return g}
  if(CK.id==="jeon"){CK.panName="감자전";CK.texRaw=T.batter;CK.texDone=T.jeon;const bottom=lmat(T.jeon());CK.cakeBottom=bottom;
    const cake=disc(0.2,0.02,lmat(T.jeon()),new THREE.MeshLambertMaterial({color:0xd9a441}),0.05,bottom);cake.position.y=0.012;
    const raw=solid(new THREE.Mesh(new THREE.CircleGeometry(0.205,40),lmat(T.batter(),{transparent:true,opacity:1})));raw.rotation.x=-Math.PI/2;raw.position.y=0.0235;
    const g=new THREE.Group();g.add(cake,raw);pc.add(g);CK.cake=g;CK.cakeTop=cake;CK.cakeRaw=raw;return g}
  const g=new THREE.Group();pc.add(g);
  const sheet=disc(CK.id==="egg"?0.22:0.17,0.008,lmat(T[CK.id==="egg"?"eggBeat":"eggRaw"]()),0xf2cc52,0.04);sheet.position.y=0.006;g.add(sheet);CK.sheet=sheet;
  if(CK.id==="tomegg")for(let i=0;i<3;i++){const s=tomatoSlice();s.position.set(fr(-0.12,0.12),0.016,fr(-0.12,0.12));g.add(s)}
  return g}
// 생선을 솥뚜껑에 올려요: 살짝 들었다가 내려놓으면 치익
function placeFishAnim(){
  if(CK.meat){const src=CK.ing,from=src.position.clone(),to=new THREE.Vector3(...P_PAN).add(new THREE.Vector3(0,0.012,0));
    tw(0.35,e=>{src.position.lerpVectors(from,to,e);src.position.y+=Math.sin(e*Math.PI)*0.08},()=>{const f=src.children[0];src.remove(f);src.position.copy(from);f.position.set(0,0.008,0);f.scale.setScalar(1.25);CK.pc.add(f);
      CK.cake=f;CK.inPan=true;CK.panName=CK.r.name;sfx("sizzle");popAt(P_PAN,"치익")});return 500}
  const src=CK.ing,from=src.position.clone(),to=new THREE.Vector3(...P_PAN).add(new THREE.Vector3(0,0.012,0));
  tw(0.35,e=>{src.position.lerpVectors(from,to,e);src.position.y+=Math.sin(e*Math.PI)*0.08},()=>{
    const f=src.children[0];src.remove(f);src.position.copy(from);f.position.set(0,0.012,0);f.scale.setScalar(1.35);CK.pc.add(f);
    CK.cake=f;CK.fish=true;CK.inPan=true;CK.panName=CK.r.name.replace("구이","");CK.sideRaw=f.userData.side.color.clone();sfx("sizzle");popAt(P_PAN,"치익")});
  return 500}
function pourAnim(){
  const b=CK.bowl,from=b.position.clone(),to=new THREE.Vector3(P_PAN[0]+0.22,1.13,P_PAN[2]),home=new THREE.Vector3(...P_BOWL);
  tw(0.25,e=>b.position.lerpVectors(from,to,e),()=>{
    const col=CK.id==="jeon"?0xe9d9a6:0xf2cc52,st=cyl(0.012,0.022,0.12,col,to.x-0.17,1.04,to.z,8);st.castShadow=false;CK.g.add(st);
    const c=makePanContent();c.scale.set(0.2,1,0.2);
    tw(0.7,e=>{b.rotation.z=1.15*Math.sin(Math.min(1,e*1.4)*Math.PI/2);c.scale.set(0.2+0.8*e,1,0.2+0.8*e);if(CK.bLiq)CK.bLiq.scale.y=Math.max(0.01,1-e);st.visible=e>0.15&&e<0.92},()=>{
      CK.g.remove(st);CK.bc.children.slice().forEach(o=>CK.bc.remove(o));CK.bLiq=CK.bLiq2=null;CK.inPan=true;sfx("sizzle");
      tw(0.3,e=>{b.rotation.z=1.15*(1-e);b.position.lerpVectors(to,home,e)},null)})});
  return 1350}
function plateAnim(){
  const id=CK.id,dish=dish3D(id);dish.position.set(...plateAt());
  if(CK.inPan){const pc=CK.pc,from=pc.position.clone(),to=new THREE.Vector3(plateAt()[0],plateAt()[1]+0.03,plateAt()[2]);
    tw(0.4,e=>{pc.position.lerpVectors(from,to,e);pc.position.y+=Math.sin(e*Math.PI)*0.12;const s=1-0.4*e;pc.scale.set(s,1,s)},()=>{pc.visible=false;CK.plate.visible=false;CK.g.add(dish);sfx("pop")})}
  else{const b=CK.bowl,from=b.position.clone(),to=new THREE.Vector3(plateAt()[0]-0.12,1.02,plateAt()[2]),home=new THREE.Vector3(...P_BOWL);
    tw(0.25,e=>b.position.lerpVectors(from,to,e),()=>tw(0.5,e=>b.rotation.z=-1.1*Math.sin(e*Math.PI/2),()=>{
      CK.bc.children.slice().forEach(o=>CK.bc.remove(o));CK.plate.visible=false;CK.g.add(dish);sfx("pop");
      tw(0.3,e=>{b.rotation.z=-1.1*(1-e);b.position.lerpVectors(to,home,e)},null)}))}
  return 1100}
function popAt(lp,t){const q=cp(lp);wPop(q.x,q.y-30,t)}
const _cv=new THREE.Vector3();
function cp(lp){_cv.set(STOVE.x+lp[0],lp[1],STOVE.z+lp[2]).project(camera);return {x:(_cv.x+1)/2*wEl.clientWidth,y:(1-_cv.y)/2*wEl.clientHeight}}
function cr(lp){const a=cp(lp),b=cp([lp[0]+0.1,lp[1],lp[2]]);return Math.max(22,Math.hypot(b.x-a.x,b.y-a.y))} // 화면에서 누를 자리 크기
// 화면 위 손가락 자리 → 부뚜막 위 높이 y 평면의 자리 (끌어 옮길 때 그릇이 손을 따라와요)
const _ray=new THREE.Raycaster(),_ndc=new THREE.Vector2(),_pl=new THREE.Plane(new THREE.Vector3(0,1,0),0),_hit=new THREE.Vector3();
function screenToLocal(p,y){_ndc.set(p.x/wEl.clientWidth*2-1,-(p.y/wEl.clientHeight)*2+1);_ray.setFromCamera(_ndc,camera);_pl.constant=-y;
  return _ray.ray.intersectPlane(_pl,_hit)?[_hit.x-STOVE.x,y,_hit.z-STOVE.z]:null}

/* ---------- 시작과 끝 ---------- */
function goCook(id){if(inHouse)return leaveHouse(()=>goCook(id));go(STOVE.stand[0],STOVE.stand[1],{type:"cook",id})}
function openStove(){openSheet(`<div class="stovehead"><h2>부뚜막</h2><small>가마솥 걸어 두었어요 · 무엇을 해 먹을까</small></div>`+recipeListHtml());sheet.classList.add("stove");bindCook(true)}
function startCook(id){
  const r=RECIPES.find(x=>x.id===id);if(!r||!can(r)){toast("재료가 모자라요");return}
  if((S.inv.jangjak||0)<FUEL.cook){toast("장작이 없어요. 모탕에서 장작을 패 오거나 목공소에서 한 짐 사 와요");return}
  stashHold();if(S.hold){toast("두 손에 "+josa(dishName(S.hold),"을","를")+" 들고 있어요. 평상 소반이 꽉 찼으면 먼저 먹고 와요");return}
  CK={id,r,meat:!!r.meat,pot:id==="bap"||id==="baeksuk",steps:RECIPE_STEPS[id]||["toss","plate"],si:-1,scores:[],g:new THREE.Group(),cam:new THREE.Vector3(),look:new THREE.Vector3(),smoke:[],smT:0,tw:[],tags:[]};
  stove.add(CK.g);
  CK.bowl=yangpun();CK.bowl.position.set(...P_BOWL);CK.bc=new THREE.Group();CK.bowl.add(CK.bc);CK.g.add(CK.bowl);
  CK.pc=new THREE.Group();CK.pc.position.set(...P_PAN);CK.g.add(CK.pc);
  stoveLogs.children.forEach(c=>c.visible=false);
  me.g.visible=false;
  CK.hidLabels=[];const sc=stoveLocal(0,1,1);scene.traverse(o=>{if(o.isSprite&&o.visible){const p=new THREE.Vector3();o.getWorldPosition(p);if(p.distanceTo(sc)<4){o.visible=false;CK.hidLabels.push(o)}}});
  document.querySelector(".top").hidden=true;document.querySelector(".bottom").hidden=true;wEl.hidden=false;
  $("wSteps").innerHTML=CK.steps.map(s=>`<li>${(STEP_ALIAS[id]||{})[s]||CS[s].name}</li>`).join("");$("wCare").textContent="";
  toast(r.name+" 만들기");nextCookStep();
}
function endCook(msg){
  if(!CK)return;
  stoveFireMat.opacity=0;stoveLogs.visible=false;stoveLogs.children.forEach(c=>c.visible=true);stoveLid.rotation.set(0,0,0);stoveLid.position.set(-0.45,0.95,0);stove.remove(CK.g);
  CK.tags.forEach(t=>t.el.remove());CK.hidLabels.forEach(o=>o.visible=true);
  const [x,z]=STOVE.stand;me.g.position.set(x,0,z);me.tx=x;me.tz=z;me.g.visible=true;
  CK=null;wEl.hidden=true;wSvg.innerHTML="";$("wGauge").hidden=true;document.querySelector(".bottom").hidden=false;document.querySelector(".top").hidden=false;
  refresh();if(msg)toast(msg);if(lvQueue!=null)setTimeout(showLevelUp,700);
}
{const q=$("wQuit").onclick;$("wQuit").onclick=()=>CK?endCook("요리를 그만뒀어요. 재료는 그대로예요"):q()}
function finishCook(){
  const r=CK.r;if(!can(r)){endCook("재료가 모자라요");return}
  Object.entries(r.need).forEach(([k,n])=>S.inv[k]-=n);S.inv.jangjak=Math.max(0,(S.inv.jangjak||0)-FUEL.cook);drawWoodpile(); // 장작 하나
  const first=!S.dex[r.id],sk=avg(CK.scores);S.dex[r.id]=true;
  sweat(2);
  const taste=sk>=0.85?"아주 맛있게 됐어요":sk>=0.6?"맛있게 됐어요":"조금 아쉽지만 먹을 만해요";
  endCook(`${r.name} 완성! ${taste}`+(first?" · 도감에 새로 담았어요":"")+" · 들고 가서 평상에 내려놓아요");
  setHold(r.id);save();
}

/* ---------- 단계 넘기기 ---------- */
function nextCookStep(){
  CK.si++;wSvg.innerHTML="";CK.st={};CK.hint=true;CK.busy=false;CK.tags.forEach(t=>t.el.remove());CK.tags=[];
  const s=CK.steps[CK.si];
  if(!s){CK.busy=true;startShowcase();return}
  const d=CS[s],st=CK.st,F=FOCUS[focusOf(d)];
  CK.cam.copy(stoveLocal(...F.cam));CK.look.copy(stoveLocal(...F.look));
  [...$("wSteps").children].forEach((li,k)=>li.className=k<CK.si?"done":k===CK.si?"on":"");
  $("wGauge").hidden=d.g!=="timing";
  if(d.setup)d.setup();
  if(d.g==="tap"){st.t=d.pts().map(p=>({p,el:svgEl("circle","wtarget"),done:false}));st.sc=[]}
  if(d.g==="rub"){st.need=d.n;st.n=0;st.run=0;st.dir=0}
  if(d.g==="circle"){st.need=d.n;st.n=0;st.len=0;st.ang=null}
  if(d.g==="drag"){st.a=svgEl("circle","wtarget");st.b=svgEl("circle","wtarget wto")}
  if(d.g==="timing"){st.g=0;st.tick=0;const z=$("wZone");z.style.left=FLIP_ZONE[0]*100+"%";z.style.width=(FLIP_ZONE[1]-FLIP_ZONE[0])*100+"%";$("wFill").style.width="0%"}
  CK.tags=(d.tags?d.tags():[]).map(([p,t])=>{const el=document.createElement("span");el.className="ctag";el.textContent=t;wEl.appendChild(el);return {p,el}});
  wFinger.className="finger "+({tap:"f-seed",circle:"f-cover",drag:"f-ridge",timing:"f-flick"}[d.g]||(d.axis==="y"?"f-rubY":"f-till"));
  cookGuide();
}
function cookGuide(){const d=CS[CK.steps[CK.si]],st=CK.st;$("wGuide").textContent=d.guide(st.need-st.n)}
const REST={pour:"지글지글…",place:"치이익… 지글지글",anchi:"보글보글…",dakin:"보글보글…",stirfry:"달달달… 볶는 냄새",grate:"",toss:"솔솔 양념 냄새…"};
function cookStepDone(score,msg,wait=550){
  const d=CS[CK.steps[CK.si]];CK.scores.push(score);CK.busy=true;const rest=REST[CK.steps[CK.si]];
  if(rest){wait+=1300;setTimeout(()=>{if(!CK)return;popAt(CK.pot?P_PAN:CK.inPan?P_PAN:P_BOWL,rest);sfx(CK.pot?"pour":"sizzle");setTimeout(()=>{if(CK)sfx("sizzle")},500)},wait-1200);$("wGuide").textContent=rest+" 잠깐 기다려요"}
  if(d.done){const w=d.done();if(w)wait=Math.max(wait,w)}
  if(msg)popAt(focusOf(d)==="fire"?P_FIRE:focusOf(d)==="board"?P_ING:P_PAN,msg);
  $("wCare").textContent="솜씨 "+careDots(avg(CK.scores));
  setTimeout(()=>{if(CK)nextCookStep()},wait);
}

/* ---------- 손동작 받기 ---------- */
wEl.addEventListener("pointerdown",e=>{if(!CK||CK.busy||e.target.closest("button"))return;e.preventDefault();try{wEl.setPointerCapture(e.pointerId)}catch(_){}
  const p=wpt(e);CK.down=true;CK.path=[p];CK.last=p;cDown(p)});
wEl.addEventListener("pointermove",e=>{if(!CK||!CK.down||CK.busy)return;const p=wpt(e);CK.path.push(p);cMove(p,CK.last);if(CK)CK.last=p});
const cUpH=e=>{if(!CK||!CK.down)return;CK.down=false;if(!CK.busy)cUp(wpt(e))};
wEl.addEventListener("pointerup",cUpH);wEl.addEventListener("pointercancel",cUpH);

function cDown(p){
  const d=CS[CK.steps[CK.si]],st=CK.st;
  if(d.g==="rub"){st.dir=0;st.run=0}
  if(d.g==="tap"){
    let best=null,bd=1e9;st.t.forEach(t=>{if(t.done)return;const q=cp(t.p),dd=Math.hypot(p.x-q.x,p.y-q.y);if(dd<bd){bd=dd;best=t}});
    const R=best?(d.r||cr(best.p)):0;if(!best||bd>R*1.5){wPop(p.x,p.y-30,"동그라미를 눌러요");return}
    best.done=true;best.el.remove();CK.hint=false;st.sc.push(Math.max(0.5,1-bd/(R*1.5)*0.5));buzz(12);
    d.hit(st.t.filter(t=>t.done).length-1);wPop(p.x,p.y-30,"콕");
    if(st.t.every(t=>t.done))cookStepDone(avg(st.sc));
  }
  if(d.g==="drag"){const o=d.src(),q=cp(vpos(o));st.drag=Math.hypot(p.x-q.x,p.y-q.y)<=cr(vpos(o))*2;
    if(st.drag){st.home=o.position.clone();CK.hint=false}else wPop(p.x,p.y-30,"동그라미에서 시작해요")}
}
function cMove(p,l){
  const d=CS[CK.steps[CK.si]],st=CK.st;
  if(d.g==="rub"){const dv=d.axis==="y"?p.y-l.y:p.x-l.x,s=Math.sign(dv);if(!s)return;
    if(s!==st.dir){st.dir=s;st.run=0;st.counted=false}
    st.run+=Math.abs(dv);if(!st.counted&&st.run>=40){st.counted=true;st.n++;CK.hint=false;buzz(10);wPop(p.x,p.y-30,"슥");d.stroke(st.n,st.need);cookGuide();if(st.n>=st.need)cookStepDone(1)}}
  if(d.g==="circle"){
    // 도구가 손가락 방향을 따라 그릇 안을 빙글빙글 돌아요
    const c=cp(d.focus==="pot"?P_PAN:P_BOWL),a=Math.atan2(p.y-c.y,p.x-c.x),r=d.focus==="pot"?0.12:0.07;
    if(CK.tool)CK.tool.position.set(Math.cos(a)*r,CK.tool.position.y,Math.sin(a)*r);
    if(st.ang!=null){let da=a-st.ang;if(da>Math.PI)da-=TAU;if(da<-Math.PI)da+=TAU;(d.focus==="pot"?CK.pc:CK.bc).rotation.y-=da*0.5}st.ang=a;
    st.len+=Math.hypot(p.x-l.x,p.y-l.y);if(d.move)d.move((st.n+st.len/220)/st.need);
    if(st.len>=220){st.len=0;st.n++;CK.hint=false;buzz(10);wPop(p.x,p.y-30,"빙글");d.stroke(st.n,st.need);cookGuide();if(st.n>=st.need)cookStepDone(1)}}
  if(d.g==="drag"&&st.drag){const o=d.src(),q=screenToLocal(p,d.lift);if(q)o.position.set(...q)}
}
function cUp(p){
  const d=CS[CK.steps[CK.si]],st=CK.st;
  if(d.g==="drag"&&st.drag){st.drag=false;const o=d.src(),B=d.to(),q=cp(B),dd=Math.hypot(p.x-q.x,p.y-q.y),R=cr(B)*2;
    if(dd>R){wPop(p.x,p.y-30,"끝까지 끌어요");const from=o.position.clone(),home=st.home;tw(0.25,e=>o.position.lerpVectors(from,home,e),null);return}
    buzz(15);const w=d.success();cookStepDone(Math.max(0.6,1-dd/R*0.4),"좋아요",w+250)}
  if(d.g==="timing"){const dy=p.y-CK.path[0].y;if(dy>-40){wPop(p.x,p.y-30,"위로 휙 밀어요");return}
    if(st.g<0.25){wPop(p.x,p.y-30,"아직 덜 익었어요");return}CK.pot?tteumNow():flipNow()}
}
// 뜸 들이기 끝: 불을 빼고 솥뚜껑을 열면 하얀 밥. 늦으면 바닥이 눌어 누룽지
function tteumNow(){const st=CK.st,[a,b]=FLIP_ZONE,g=st.g,ok=g>=a&&g<=b;CK.busy=true;stoveFireMat.opacity=0.25;CK.fire=false;
  if(CK.id==="baeksuk"){const br=disc(0.3,0.02,lmat(T_MEAT.broth()),0xdcc898);br.position.y=-0.03;CK.pc.add(br);const ch=meatGroup("baeksuk");ch.userData.cook(1);ch.scale.setScalar(1.3);ch.position.y=-0.03;CK.pc.add(ch)}
  else{const r=disc(0.3,0.03,lmat(T.rice()),0xf4f1e8);r.position.y=-0.02;CK.pc.add(r);if(g>b){const n=disc(0.31,0.01,new THREE.MeshLambertMaterial({color:0xc98a3a}),0xc98a3a);n.position.y=-0.035;CK.pc.add(n)}}
  tw(0.5,e=>{stoveLid.position.y=0.95+0.55*e;stoveLid.position.x=-0.45-0.5*e;stoveLid.rotation.z=0.9*e},null);CK.inPan=true;CK.panName=CK.id==="baeksuk"?"백숙":"밥";buzz(20);sfx("pop");CK.hint=false;const bk=CK.id==="baeksuk";
  cookStepDone(g>=1?0.4:ok?1:g<a?0.5+0.4*g/a:0.7,g>=1?(bk?"앗, 국물이 바짝 졸았어요!":"앗, 누룽지가 생겼어요!"):ok?(bk?"푹 고아졌어요!":"밥이 고슬고슬!"):g<a?(bk?"조금 덜 고았지만 괜찮아요":"조금 질지만 괜찮아요"):(bk?"국물이 살짝 졸았어요":"바닥이 살짝 눌었어요"),900)}
// 전 뒤집기: 뒤집개가 밑으로 들어가 휙 뒤집어요. 밑면이 얼마나 익었는지가 보여요
function flipNow(){
  const st=CK.st,[a,b]=FLIP_ZONE,g=st.g,ok=g>=a&&g<=b;
  const burnt=g>b?Math.min(1,(g-b)/(1-b)):0;
  if(CK.meat){} // 삼겹살은 돌다가 구운 면으로 바꿔요
  else if(CK.fish){const k=fishOf(CK.id),m=new THREE.MeshPhongMaterial({map:g<0.35?T_SEA.raw(k):T_SEA.grilled(k),shininess:20,specular:0x555555});m.color.copy(WHITE).lerp(JEON_BURNT,burnt*0.8);CK.fishDone=m}
  else{CK.cakeBottom.map=g<0.4?CK.texRaw():CK.texDone();CK.cakeBottom.color.copy(WHITE).lerp(JEON_BURNT,burnt);CK.cakeBottom.needsUpdate=true}
  const sp=spatula();sp.position.set(0.25,0.01,0.06);CK.pc.add(sp);const c=CK.cake;let swapped=false;
  tw(0.2,e=>sp.position.x=lerp(0.25,0.05,e),()=>tw(0.5,e=>{c.rotation.x=Math.PI*e;c.position.y=Math.sin(Math.PI*e)*0.22+(CK.fish?FISH[fishOf(CK.id)].L*0.09+0.014:0.035)*e;sp.position.y=0.01+Math.sin(Math.PI*e)*0.1;
      if(CK.fish&&!swapped&&e>0.5){swapped=true;c.traverse(o=>{if(o.isMesh)o.material=[CK.fishDone,o.material[1]]})} // 반 넘게 돌면 구운 쪽이 위로
      if(CK.meat&&!swapped&&e>0.5){swapped=true;c.userData.flipTo(burnt)}},
    ()=>{CK.pc.remove(sp);if(CK.cakeRaw)CK.cakeRaw.visible=false}));
  buzz(20);sfx("pop");CK.hint=false;
  cookStepDone(g>=1?0.3:ok?1:g<a?0.5+0.4*g/a:0.6,g>=1?"앗, 탔어요!":ok?"노릇노릇!":g<a?"조금 덜 익었지만 괜찮아요":"조금 탔어요",1000);
}

function startShowcase(){const p=plateAt();CK.show={t:0,c:stoveLocal(p[0],p[1]+0.06,p[2])};CK.hint=false;wSvg.innerHTML="";
  [...$("wSteps").children].forEach(li=>li.className="done");$("wGuide").textContent="완성! "+CK.r.name+" 한 상 차렸어요";popAt(p,"완성!");sfx("level")}
/* ---------- 매 순간 ---------- */
function cookFrame(dt,now){
  if(!CK)return;
  if(CK.show){const S_=CK.show;S_.t+=dt;const a=-0.8+1.6*Math.min(1,S_.t/2.6),c=S_.c;CK.cam.set(c.x+Math.sin(a)*0.85,c.y+0.5,c.z+Math.cos(a)*0.85);CK.look.copy(c);
    if(Math.random()<dt*8){const sp=sph(0.012,0xfff2a0,0,0,0);sp.position.copy(c).add(new THREE.Vector3(fr(-0.15,0.15),fr(0,0.2),fr(-0.15,0.15)));scene.add(sp);setTimeout(()=>scene.remove(sp),500)}
    if(S_.t>2.6){CK.show=null;finishCook();return}}
  CK.tw.slice().forEach(w=>{if(!CK)return;w.t+=dt;const k=Math.min(1,w.t/w.dur);w.fn(k);if(k>=1){CK.tw.splice(CK.tw.indexOf(w),1);if(w.done)w.done()}});if(!CK)return;
  if(CK.fire){stoveFire.scale.set(1+Math.sin(now/90)*0.05,0.85+Math.sin(now/70)*0.15,1);stoveFireMat.opacity=0.8+Math.sin(now/60)*0.15;CK.smT-=dt;
    if(CK.smT<=0){CK.smT=0.45;const m=new THREE.Mesh(new THREE.SphereGeometry(0.12,8,6),new THREE.MeshLambertMaterial({color:0xe8e4dc,transparent:true,opacity:0.55}));m.position.set(-0.85,2.45,-0.45);CK.g.add(m);CK.smoke.push(m)}}
  CK.smoke=CK.smoke.filter(m=>{m.position.y+=dt*0.5;m.position.x+=dt*0.12;m.scale.multiplyScalar(1+dt*0.6);m.material.opacity-=dt*0.18;if(m.material.opacity<=0){CK.g.remove(m);return false}return true});
  // 이름표는 도구 위에
  CK.tags.forEach(t=>{const q=cp(typeof t.p==="function"?t.p():t.p);t.el.style.left=q.x+"px";t.el.style.top=(q.y-46)+"px"});
  const s=CK.steps[CK.si];if(!s)return;const d=CS[s],st=CK.st;let f=null;
  if(d.g==="tap")st.t.forEach(t=>{if(t.done)return;const q=cp(t.p),R=d.r||cr(t.p);t.el.setAttribute("cx",q.x);t.el.setAttribute("cy",q.y);t.el.setAttribute("r",R);if(!f)f=q});
  if(d.g==="drag"){const src=vpos(d.src()),A=cp(src),B=cp(d.to()),Ra=cr(src),Rb=cr(d.to());
    st.a.setAttribute("cx",A.x);st.a.setAttribute("cy",A.y);st.a.setAttribute("r",st.drag?0:Ra);st.b.setAttribute("cx",B.x);st.b.setAttribute("cy",B.y);st.b.setAttribute("r",Rb);
    f=A;wFinger.style.setProperty("--dx",(B.x-A.x)+"px");wFinger.style.setProperty("--dy",(B.y-A.y)+"px")}
  if(d.g==="rub"||d.g==="circle")f=cp(d.focus==="pot"?P_PAN:d.g==="circle"?P_BOWL:P_ING);
  if(d.g==="timing"){f=cp(P_PAN);
    if(!CK.busy){st.g+=dt/3.0;$("wFill").style.width=Math.min(100,st.g*100)+"%";
      // 반죽이 익어 가며 위의 날반죽이 사라지고, 너무 오래 두면 타요
      const burnt=st.g>FLIP_ZONE[1]?Math.min(1,(st.g-FLIP_ZONE[1])/(1-FLIP_ZONE[1])):0;
      if(CK.pot){CK.steamT=(CK.steamT||0)-dt;if(CK.steamT<=0){CK.steamT=0.5-Math.min(0.35,st.g*0.35); // 끓을수록 김이 많이
          const m=new THREE.Mesh(new THREE.SphereGeometry(0.06,8,6),new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:0.6}));m.position.set(P_PAN[0]+fr(-0.25,0.25),1.05,P_PAN[2]+fr(-0.2,0.2));CK.g.add(m);CK.smoke.push(m)}
        if(st.g>FLIP_ZONE[0]&&!CK.tear){CK.tear=true;const c=cp(P_PAN);wPop(c.x+40,c.y,"눈물!")}}
      else if(CK.meat){if(CK.cake&&CK.cake.userData.cook)CK.cake.userData.cook(Math.min(1,st.g/FLIP_ZONE[0]))}
      else if(CK.fish){CK.cake.userData.side.color.copy(CK.sideRaw).lerp(FISH_GOLD,Math.min(1,st.g/FLIP_ZONE[0])).lerp(JEON_BURNT,burnt)} // 옆면이 노릇해지며 익는 게 보여요
      else if(CK.cakeRaw){CK.cakeRaw.material.opacity=Math.max(0,1-(st.g-0.05)/0.5);CK.cakeTop.material[1].color.copy(WHITE).lerp(JEON_BURNT,burnt*0.6);CK.cakeTop.material[0].color.setHex(0xd9a441).lerp(JEON_BURNT,burnt)}
      st.tick-=dt;if(st.tick<=0){st.tick=0.5;sfx("sizzle")}
      if(st.g>=1)CK.pot?tteumNow():flipNow()}}
  const show=CK.hint&&!CK.busy&&f;wFinger.style.display=show?"block":"none";if(show){wFinger.style.left=f.x+"px";wFinger.style.top=f.y+"px"}
}
