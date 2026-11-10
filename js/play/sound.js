/* 소리: 파일 없이 브라우저가 직접 만드는 소리 (물, 동전, 손동작, 날씨, 시골 생물들)
   시골 소리는 철과 시간을 따라요 (실제 시골 기준):
   - 밤: 귀뚜라미(8월~11월 중순, 늦가을엔 드문드문) · 맹꽁이(6~8월, 비 오는 밤에 떼로) · 개구리(4~7월 논) · 소쩍새(4~8월) · 부엉이(10~3월)
   - 낮: 매미(7~8월) · 참새와 산새(3~11월) · 까치(사철) · 해 뜰 무렵 수탉 "꼬끼오"
   - 냇가에선 물소리, 비 오는 날은 빗소리, 큰비·태풍 땐 거센 빗소리와 바람, 천둥
   집 안에 들어가면 바깥 소리는 작게 들려요 */

let AC=null,soundOn=false,amb=null,ambTimer=null,master=null;
function out(){return master||AC.destination}
function noiseBuf(){const b=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b}
// 소리 한 음: f0 → f1 로 미끄러지며 dur 초. bp 를 주면 그 높이 근처만 남겨서 콧소리·울림 같은 결을 내요
function tone(f0,f1,dur,type="sine",vol=0.08,delay=0,bp){if(!soundOn||!AC)return;const t=AC.currentTime+delay,o=AC.createOscillator(),g=AC.createGain();
  o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+Math.min(0.02,dur/4));g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  let n=o;if(bp){const f=AC.createBiquadFilter();f.type="bandpass";f.frequency.value=bp;f.Q.value=3;o.connect(f);n=f}
  n.connect(g);g.connect(out());o.start(t);o.stop(t+dur+0.03)}
function burst(dur,freq,vol,delay=0,type="lowpass"){if(!soundOn||!AC)return;const t=AC.currentTime+delay,src=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();
  src.buffer=noiseBuf();f.type=type;f.frequency.value=freq;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);src.connect(f);f.connect(g);g.connect(out());src.start(t);src.stop(t+dur)}
function sfx(k){if(!soundOn)return;
  if(k==="water")burst(0.6,1800,0.25);
  if(k==="pop")tone(500,900,0.12,"sine",0.12);
  if(k==="coin"){tone(1300,1300,0.09,"triangle",0.08);tone(1750,1750,0.15,"triangle",0.08,0.08)}
  // 작업 화면 손동작 소리
  if(k==="scrape")burst(0.16,700,0.2); // 흙 긁는 소리
  if(k==="seed")tone(1100,800,0.05,"sine",0.08); // 씨앗 쏙
  if(k==="pour")burst(0.3,2200,0.08); // 물 쏟아지는 소리
  if(k==="pluck")tone(700,1200,0.07,"triangle",0.1); // 톡 따기
  // 부뚜막 요리 소리
  if(k==="crackle"){burst(0.25,500,0.18);tone(180,90,0.15,"sawtooth",0.02)} // 장작 타닥
  if(k==="chop")tone(1500,900,0.04,"square",0.04); // 칼질
  if(k==="sizzle")burst(0.35,4500,0.05); // 지글지글
  if(k==="crack")tone(900,500,0.05,"triangle",0.1); // 달걀 톡
  if(k==="whisk")burst(0.1,3000,0.06); // 젓기
  if(k==="level")[523,659,784,1047].forEach((f,i)=>tone(f,f,0.18,"triangle",0.08,i*0.12))}

/* ---------- 시골 생물 소리 ---------- */
const CRITTER={
  // 귀뚜라미: "귀뚤귀뚤" 짧은 떨림 세 번이 한 마디. 두 마리가 조금 다른 높이로 번갈아
  cricket:(d=0,v=1)=>{[4300,4650].forEach((f,c)=>{for(let m=0;m<2;m++)for(let i=0;i<3;i++)tone(f,f*0.99,0.03,"sine",0.03*v,d+c*0.45+m*0.9+i*0.045)})},
  // 맹꽁이: 한 마리가 "맹~", 다른 마리가 "꽁~" (콧소리 나는 낮은 울음)
  maeng:(d=0,v=1)=>{for(let r=0;r<2;r++){const b=d+r*0.9;tone(620,560,0.2,"sawtooth",0.05*v,b,700);tone(430,380,0.24,"sawtooth",0.05*v,b+0.3,480)}},
  // 개구리: "개굴개굴" 빠르게 떨리는 소리
  frog:(d=0,v=1)=>{for(let r=0;r<2;r++)for(let i=0;i<5;i++)tone(780,700,0.035,"square",0.025*v,d+r*0.55+i*0.055,900)},
  // 소쩍새: "소쩍— 소쩍다" 맑은 휘파람
  owl2:(d=0,v=1)=>{tone(1180,1120,0.22,"sine",0.05*v,d);tone(1180,1060,0.3,"sine",0.05*v,d+0.42);tone(1120,1000,0.18,"sine",0.04*v,d+0.8)},
  // 부엉이: "부엉 부엉" 낮게
  owl:(d=0,v=1)=>{tone(400,360,0.35,"sine",0.07*v,d);tone(380,330,0.45,"sine",0.07*v,d+0.65)},
  // 매미: "맴맴맴—" 떨리는 높은 소리
  cicada:(d=0,v=1)=>{for(let i=0;i<10;i++)tone(5200,5000,0.12,"sawtooth",0.012*v,d+i*0.13,5200)},
  // 참새·산새: 짹짹
  bird:(d=0,v=1)=>{const b=2600+Math.random()*900;for(let i=0;i<3;i++)tone(b,b*1.3,0.08,"sine",0.04*v,d+i*0.13)},
  // 까치: "깍 깍"
  magpie:(d=0,v=1)=>{for(let i=0;i<3;i++){burst(0.09,2200,0.07*v,d+i*0.22,"bandpass");tone(1400,1100,0.08,"square",0.012*v,d+i*0.22,1500)}},
  // 수탉: "꼬끼오—"
  rooster:(d=0,v=1)=>{tone(620,700,0.12,"sawtooth",0.03*v,d,900);tone(760,980,0.16,"sawtooth",0.03*v,d+0.15,1100);tone(980,620,0.5,"sawtooth",0.03*v,d+0.33,1000)},
  hen:(d=0,v=1)=>{tone(420,330,0.12,"square",0.025*v,d);tone(460,360,0.1,"square",0.02*v,d+0.16)},
  dog:(d=0,v=1)=>{burst(0.12,700,0.12*v,d);tone(320,240,0.1,"square",0.03*v,d)}};
function thunder(){if(!soundOn)return;burst(1.8,180,0.5);burst(0.4,900,0.15);tone(70,40,1.4,"sine",0.12)}

// 배경 소리: 빗소리 / 큰비 / 태풍 바람 / 냇물 / 평소엔 잔잔한 바람
function setAmbience(){
  if(!AC)return;
  if(amb){amb.forEach(n=>{try{n.stop()}catch(e){}});amb=null}
  if(!soundOn)return;amb=[];
  const st=typeof stormActive==="function"?stormActive():null,w=weather.kind;
  const layer=(type,freq,vol,lfo)=>{const src=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();src.buffer=noiseBuf();src.loop=true;f.type=type;f.frequency.value=freq;g.gain.value=vol;
    src.connect(f);f.connect(g);g.connect(out());src.start();amb.push(src);
    if(lfo){const o=AC.createOscillator(),og=AC.createGain();o.frequency.value=lfo;og.gain.value=vol*0.9;o.connect(og);og.connect(g.gain);o.start();amb.push(o)}};
  if(st&&st.kind!=="frost"){layer("highpass",700,0.16);if(st.kind==="typhoon")layer("lowpass",500,0.22,0.18)} // 거센 비, 태풍 바람(휘이잉 오르내림)
  else if(w==="비")layer("highpass",900,0.07);
  else layer("lowpass",380,0.03);
  if(mode==="stream")layer("bandpass",1400,0.05,0.3); // 졸졸 냇물
}
function ambientTick(){
  if(!soundOn)return;
  if(master)master.gain.value=inHouse||mode==="dabang"?0.35:1; // 집 안에선 바깥 소리가 작게
  const d=new Date(),m=d.getMonth()+1,day=d.getDate(),night=skyNow.night>0.5,rain=weather.kind==="비",h=hourNow();
  const st=typeof stormActive==="function"?stormActive():null;if(st&&st.kind!=="frost")return; // 큰비·태풍 땐 생물들도 숨어요
  const r=Math.random,C=CRITTER;
  if(night){
    if(m>=8&&(m<=10||m===11&&day<=20)){const late=m===11?0.45:m===10?0.75:1;if(r()<late)C.cricket(0,late);if(r()<late*0.8)C.cricket(1.7,late*0.8)} // 늦가을엔 드문드문
    if(m>=6&&m<=8&&(rain?r()<0.95:r()<0.35)){C.maeng(0.2);if(rain)C.maeng(1.9,0.7)} // 비 오는 여름밤엔 맹꽁이 합창
    if(m>=4&&m<=7&&!rain&&r()<0.7){C.frog(0.4);C.frog(1.6,0.7)}
    if(m>=4&&m<=8&&r()<0.18)C.owl2(2.2);
    if((m>=10||m<=3)&&r()<0.14)C.owl(1.5);
  }else{
    if(m>=7&&m<=8&&!rain&&h>9&&h<18&&r()<0.75)C.cicada(0.2);
    else if(!rain&&m>=3&&m<=11&&r()<0.55)C.bird(0.3);
    if(!rain&&r()<0.12)C.magpie(1.4);
  }
  if(land.visible&&chickens.visible){if(Math.abs(h-skyNow.rise)<1.2&&r()<0.5)C.rooster(0.5);else if(!night&&r()<0.3)C.hen(2)}
  if(land.visible&&ijang.visible&&r()<0.2)C.dog(1);
}
// 체험용: 시골 소리 차례로 들어 보기 (철이 아니어도)
function soundTest(){if(!soundOn){toast("먼저 오른쪽 위 '소리 켜기'를 눌러 주세요");return}
  const L=[["귀뚜라미",()=>{CRITTER.cricket(0);CRITTER.cricket(1.5)}],["맹꽁이",()=>{CRITTER.maeng(0);CRITTER.maeng(1.7)}],["개구리",()=>{CRITTER.frog(0);CRITTER.frog(1)}],["소쩍새",()=>CRITTER.owl2(0)],["부엉이",()=>CRITTER.owl(0)],["매미",()=>{CRITTER.cicada(0);CRITTER.cicada(1.4)}],["까치",()=>CRITTER.magpie(0)],["수탉",()=>CRITTER.rooster(0)],["천둥",thunder]];
  L.forEach(([n,f],i)=>setTimeout(()=>{toast("소리 들어 보기: "+n);f()},i*3300))}
$("sndBtn").onclick=()=>{
  try{if(!AC){AC=new (window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.connect(AC.destination)}AC.resume&&AC.resume()}catch(e){toast("이 기기에선 소리를 낼 수 없어요");return}
  soundOn=!soundOn;$("sndBtn").textContent=soundOn?"소리 끄기":"소리 켜기";$("sndBtn").classList.toggle("on",soundOn);
  setAmbience();clearInterval(ambTimer);if(soundOn){ambTimer=setInterval(ambientTick,3500);sfx("pop");setTimeout(ambientTick,400)}};
