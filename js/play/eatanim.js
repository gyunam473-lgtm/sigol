/* 먹고 마시는 모습: 그냥 사라지지 않고 천천히 먹어요
   - 음식: 젓가락(밥·백숙·국수는 숟가락)이 그릇과 입을 네 번 오가며 한 입씩. 한 입마다 음식이 줄고, 머리가 오물오물
   - 마실 것(식혜·막걸리·다방 차): 잔을 들어 입에 대고 기울여 꿀꺽꿀꺽, 차가 줄어들고 빈 잔을 내려놓아요
   다 먹으면 onDone (든든함 채우기 등 원래 하던 일). 먹는 동안 카메라가 그릇과 입 사이로 다가가요 */

let EA=null;
const DRINKS=["sikhye","makgeolli","dabang_coffee","ssanghwa","yulmu","yuja"];
const SPOON_FOOD=["bap","baeksuk","guksu"];
function mouthPos(){return me.g.localToWorld(new THREE.Vector3(0,me.b.position.y+1.48,0.3))}
function utensil(spoon){const g=new THREE.Group();
  if(spoon){g.add(cyl(0.008,0.01,0.22,0xd8d8d0,0,0.11,0,6));const b=sph(0.03,0xd8d8d0,0,0,0);b.scale.set(1,0.35,1.3);g.add(b)}
  else[-0.012,0.012].forEach(x=>g.add(cyl(0.004,0.006,0.24,0x8a5a32,x,0.12,0,5)));
  return g}
// 음식 부분과 국물(마실 것) 부분 찾기: 맨 처음 자식(접시·그릇)을 뺀 나머지 = 음식, 아주 얇은 원판 = 국물
function dishParts(d){const base=d.children[0],food=d.children.slice(1),liq=[];
  d.traverse(o=>{if(o.isMesh&&o.geometry.type==="CylinderGeometry"&&o.geometry.parameters.height<=0.012)liq.push(o)});
  return {base,food,liq}}

function playEat(o){ // o: {dish, id, onDone}
  if(EA||!o.dish){if(o.onDone)o.onDone();return}
  const id=o.id,drink=DRINKS.includes(id),d=o.dish,parts=dishParts(d),from=d.getWorldPosition(new THREE.Vector3()),mouth=mouthPos();
  const center=from.clone().add(mouth).multiplyScalar(0.5),dir=(SIT?SIT.cam.clone():camera.position.clone()).sub(center).setY(0).normalize();
  EA={t:0,o,d,id,drink,parts,from,mouth,bites:drink?2:4,cam:center.clone().addScaledVector(dir,1.7).add(new THREE.Vector3(0,0.7,0)),look:center.clone().add(new THREE.Vector3(0,-0.05,0)),
    home:{pos:d.position.clone(),rot:d.rotation.clone(),parent:d.parent},food0:parts.food.map(f=>f.scale.clone()),liq0:parts.liq.map(l=>({s:l.scale.clone(),y:l.position.y})),head:me.b.children[2]};
  if(!drink){EA.ut=utensil(SPOON_FOOD.includes(id));scene.add(EA.ut);
    const fm=parts.food.map(f=>{let m=null;f.traverse(q=>{if(!m&&q.isMesh)m=q});return m}).find(Boolean);
    const col=fm&&fm.material&&(Array.isArray(fm.material)?fm.material[1]||fm.material[0]:fm.material).color;
    EA.bite=sph(0.025,col?col.getHex():0xd8b070,0,0,0);EA.bite.visible=false;scene.add(EA.bite)}
  else{scene.attach(d)} // 잔은 손에 들어요 (세상 기준으로 옮겨요)
  if($("sitPanel"))$("sitPanel").innerHTML=`<p class="hint" style="text-align:center;font-size:15px">${drink?"꿀꺽꿀꺽… 마시는 중":"냠냠… 맛있게 먹는 중"}</p>`;
  if($("camctl"))$("camctl").hidden=true;
}
function eatFrame(dt){
  if(!EA)return;const E=EA;E.t+=dt;
  const lerpV=(a,b,k)=>a.clone().lerp(b,k);
  if(!E.drink){ // 한 입: 그릇으로 가서(0.35) 입으로(0.35) 오물오물(0.4)
    const per=1.1,k=Math.floor(E.t/per),u=(E.t%per)/per;
    if(k>=E.bites){finishEat();return}
    const above=E.from.clone().add(new THREE.Vector3(0,0.12,0)),tip=u<0.32?lerpV(E.mouth,above,u/0.32):u<0.64?lerpV(above,E.mouth,(u-0.32)/0.32):E.mouth;
    E.ut.position.copy(tip);E.ut.lookAt(E.mouth.clone().add(new THREE.Vector3(0,0.3,0)));E.ut.rotateX(Math.PI/2);
    E.bite.visible=u>0.3&&u<0.64;E.bite.position.copy(tip);
    if(u>=0.3&&!E["b"+k]){E["b"+k]=1;const left=1-(k+1)/E.bites;E.parts.food.forEach((f,i)=>{const s=E.food0[i];f.scale.set(s.x*Math.max(0.05,0.15+0.85*left),s.y*Math.max(0.05,0.3+0.7*left),s.z*Math.max(0.05,0.15+0.85*left));if(left<=0)f.visible=false});
      if(!E.parts.food.length)E.parts.liq.forEach(l=>l.scale.set(left+0.05,1,left+0.05));
      if(soundOn){burst(0.06,1600,0.08);burst(0.06,1200,0.06,0.12)}}
    if(u>0.64&&E.head){E.head.position.y=1.6-Math.abs(Math.sin((u-0.64)*Math.PI*4))*0.03}}
  else{ // 마시기: 들어 올리기(0.6) → 기울여 마시기(1.6) → 내려놓기(0.5)
    const lift=0.6,sip=1.6,put=0.5,T=E.t;
    if(T<lift)E.d.position.copy(lerpV(E.from,E.mouth.clone().add(new THREE.Vector3(0,-0.08,0)),T/lift));
    else if(T<lift+sip){const s=(T-lift)/sip;E.d.rotation.x=-0.9*Math.sin(Math.min(1,s*3)*Math.PI/2);
      E.parts.liq.forEach((l,i)=>{const L=E.liq0[i],k=Math.max(0.15,1-s);l.scale.set(L.s.x*k,L.s.y,L.s.z*k);l.position.y=L.y-0.03*(1-k)});
      if(soundOn&&!E["g"+Math.floor(s*2)]){E["g"+Math.floor(s*2)]=1;tone(260,170,0.16,"sine",0.12)}}
    else if(T<lift+sip+put){const s=(T-lift-sip)/put;E.d.rotation.x=-0.9*(1-s);E.d.position.copy(lerpV(E.mouth.clone().add(new THREE.Vector3(0,-0.08,0)),E.from,s))}
    else{finishEat();return}}
}
function finishEat(){const E=EA;EA=null;
  if(E.ut)scene.remove(E.ut);if(E.bite)scene.remove(E.bite);if(E.head)E.head.position.y=1.6;
  if(E.drink&&E.d.parent===scene){scene.remove(E.d)}
  if($("camctl")&&(SIT||LIE))$("camctl").hidden=false;
  if(E.o.onDone)E.o.onDone()}

// 먹다가 일어나거나 다른 데로 가면: 먹던 건 그대로 두고 멈춰요 (든든함은 안 차요)
function cancelEat(){const E=EA;if(!E)return;EA=null;if(E.ut)scene.remove(E.ut);if(E.bite)scene.remove(E.bite);if(E.head)E.head.position.y=1.6;if(E.drink&&E.d.parent===scene)scene.remove(E.d)}
