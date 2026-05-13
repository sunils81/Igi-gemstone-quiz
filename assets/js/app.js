/* IGI Colored Stone Quiz — app.js v1 */

const QUIZ_DURATION_SECONDS = 6 * 60;
const GAS_URL = 'https://script.google.com/macros/s/AKfycbw6-svkiHn8GIW-Mp9Ia51ka6xb6J-a3Uo3tx-uSZKNW14VF2HbYYx684TMuxz3slIk/exec';
const QUIZ_URL = 'https://igi-colored-stone-quiz.vercel.app';

// ── EmailJS Config ── (fill these in after EmailJS setup)
const EMAILJS_SERVICE_ID  = 'service_jglwfxg';
const EMAILJS_TEMPLATE_ID = 'template_xnuvsjy';
const EMAILJS_PUBLIC_KEY  = 'ubOFK0SB5o7vcTANR';

// ── OTP State ──
let otpCode        = '';
let otpExpiry      = null;
let otpCountdownIv = null;
let otpAttempts    = 0;
const OTP_EXPIRY_SEC = 300; // 5 minutes
const OTP_MAX_ATTEMPTS = 5;

const GEM_COLORS = {
  ruby:       { color:'#e74c3c', glow:'rgba(231,76,60,0.35)',   subtle:'rgba(231,76,60,0.08)'   },
  sapphire:   { color:'#2980b9', glow:'rgba(41,128,185,0.35)',  subtle:'rgba(41,128,185,0.08)'  },
  emerald:    { color:'#27ae60', glow:'rgba(39,174,96,0.35)',   subtle:'rgba(39,174,96,0.08)'   },
  alexandrite:{ color:'#8e44ad', glow:'rgba(142,68,173,0.35)',  subtle:'rgba(142,68,173,0.08)'  },
  tanzanite:  { color:'#6c3483', glow:'rgba(108,52,131,0.35)',  subtle:'rgba(108,52,131,0.08)'  },
  topaz:      { color:'#c9a84c', glow:'rgba(201,168,76,0.35)',  subtle:'rgba(201,168,76,0.08)'  },
  tourmaline: { color:'#e67e22', glow:'rgba(230,126,34,0.35)',  subtle:'rgba(230,126,34,0.08)'  },
  beryl:      { color:'#1abc9c', glow:'rgba(26,188,156,0.35)',  subtle:'rgba(26,188,156,0.08)'  },
  teal:       { color:'#16a085', glow:'rgba(22,160,133,0.35)',  subtle:'rgba(22,160,133,0.08)'  },
};

const quizQuestions = [
  { id:1,  question:"Which of the following are considered the 'Big Three' precious colored stones?", options:["Emerald, Sapphire, Tanzanite","Ruby, Sapphire, Emerald","Ruby, Opal, Sapphire","Amethyst, Ruby, Emerald"], correct:1, gem:'teal', gemLabel:'The Big Three', img:'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=560&q=80' },
  { id:2,  question:"Ruby is a variety of which mineral?", options:["Beryl","Spinel","Corundum","Tourmaline"], correct:2, gem:'ruby', gemLabel:'Ruby', img:'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=560&q=80' },
  { id:3,  question:"The red color in ruby is caused by the presence of which element?", options:["Iron","Chromium","Vanadium","Titanium"], correct:1, gem:'ruby', gemLabel:'Ruby Color Science', img:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=560&q=80' },
  { id:4,  question:"Blue sapphire gets its color primarily from which elements?", options:["Chromium and Vanadium","Iron and Titanium","Copper and Manganese","Cobalt and Nickel"], correct:1, gem:'sapphire', gemLabel:'Blue Sapphire', img:'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=560&q=80' },
  { id:5,  question:"Emerald is a variety of which mineral?", options:["Corundum","Quartz","Beryl","Tourmaline"], correct:2, gem:'emerald', gemLabel:'Emerald', img:'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=560&q=80' },
  { id:6,  question:"The green color in emerald is caused primarily by:", options:["Iron and Titanium","Chromium and/or Vanadium","Copper and Zinc","Manganese and Cobalt"], correct:1, gem:'emerald', gemLabel:'Emerald Color', img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=560&q=80' },
  { id:7,  question:"Which term describes the three-part assessment of color quality in a colored-stone?", options:["Hue, Tone, Saturation","Cut, Color, Carat","Fire, Luster, Brilliance","Shade, Tint, Depth"], correct:0, gem:'teal', gemLabel:'Color Grading', img:'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=560&q=80' },
  { id:8,  question:"What does 'Hue' refer to in colored-stone color grading?", options:["The lightness or darkness of the color","The intensity or strength of the color","The basic color itself (e.g. red, blue, green)","The surface reflection of the gem"], correct:2, gem:'teal', gemLabel:'Hue Definition', img:'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=560&q=80' },
  { id:9,  question:"'Pigeon's Blood' is a term used to describe the finest quality of which colored-stone?", options:["Spinel","Garnet","Ruby","Red Tourmaline"], correct:2, gem:'ruby', gemLabel:"Pigeon's Blood Ruby", img:'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=560&q=80' },
  { id:10, question:"'Royal Blue' or 'Cornflower Blue' is used to describe the finest quality of which colored-stone?", options:["Aquamarine","Tanzanite","Blue Topaz","Sapphire"], correct:3, gem:'sapphire', gemLabel:'Cornflower Sapphire', img:'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=560&q=80' },
  { id:11, question:"The clarity standard for colored stones is generally:", options:["The same as diamonds — all inclusions are undesirable","More lenient — some inclusions are expected and accepted","Stricter than diamonds — all inclusions reduce value to zero","Irrelevant — clarity is not graded in colored stones"], correct:1, gem:'teal', gemLabel:'Clarity Standards', img:'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=560&q=80' },
  { id:12, question:"Which colored-stone is known for its phenomenon called 'asterism'?", options:["Emerald","Star Ruby or Star Sapphire","Alexandrite","Tanzanite"], correct:1, gem:'ruby', gemLabel:'Asterism', img:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=560&q=80' },
  { id:13, question:"Alexandrite is famous for which optical phenomenon?", options:["Adularescence","Asterism","Color change depending on light source","Chatoyancy"], correct:2, gem:'alexandrite', gemLabel:'Alexandrite', img:'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=560&q=80' },
  { id:14, question:"The 'cat's eye' effect seen in certain colored-stones is known as:", options:["Adularescence","Asterism","Chatoyancy","Iridescence"], correct:2, gem:'teal', gemLabel:"Cat's Eye Effect", img:'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=560&q=80' },
  { id:15, question:"Which colored-stone is the birthstone for May?", options:["Sapphire","Emerald","Ruby","Aquamarine"], correct:1, gem:'emerald', gemLabel:'May Birthstone', img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=560&q=80' },
  { id:16, question:"On the Mohs hardness scale, which colored-stone is the hardest after diamond?", options:["Emerald","Ruby and Sapphire (Corundum)","Spinel","Topaz"], correct:1, gem:'topaz', gemLabel:'Mohs Hardness', img:'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=560&q=80' },
  { id:17, question:"What is the hardness of Corundum (Ruby and Sapphire) on the Mohs scale?", options:["7","7.5","8","9"], correct:3, gem:'topaz', gemLabel:'Corundum Hardness', img:'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=560&q=80' },
  { id:18, question:"Which country is the most famous source of the finest 'Pigeon's Blood' rubies?", options:["Thailand","Sri Lanka","Myanmar (Burma)","Mozambique"], correct:2, gem:'ruby', gemLabel:'Burma Ruby Origin', img:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=560&q=80' },
  { id:19, question:"Tanzanite is found commercially in only one location in the world. Where?", options:["Kenya","Tanzania","South Africa","Madagascar"], correct:1, gem:'tanzanite', gemLabel:'Tanzanite Origin', img:'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=560&q=80' },
  { id:20, question:"Which treatment is most commonly applied to rubies and sapphires to improve their color and clarity?", options:["Fracture filling with glass","Irradiation","Heat treatment","Oiling"], correct:2, gem:'teal', gemLabel:'Gem Treatments', img:'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=560&q=80' },
  { id:21, question:"Which treatment is most commonly applied to emeralds to improve their appearance?", options:["Heat treatment","Laser drilling","Oiling / resin filling","Irradiation"], correct:2, gem:'emerald', gemLabel:'Emerald Treatment', img:'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=560&q=80' },
  { id:22, question:"A colored-stone described as 'natural, no treatment' is considered:", options:["Less valuable — not enhanced","Equal in value to treated stones of the same grade","Most valuable — untreated stones command a premium","Not certifiable by gem labs"], correct:2, gem:'teal', gemLabel:'No-Treatment Premium', img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=560&q=80' },
  { id:23, question:"Which of the following is NOT a variety of the mineral Beryl?", options:["Emerald","Aquamarine","Morganite","Tanzanite"], correct:3, gem:'beryl', gemLabel:'Beryl Family', img:'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=560&q=80' },
  { id:24, question:"The term 'inclusion' in a colored stone refers to:", options:["The cut style of the colored-stone","Any internal characteristic such as crystals, needles, or fractures","The weight of the stone in carats","The country of origin"], correct:1, gem:'teal', gemLabel:'Gem Inclusions', img:'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=560&q=80' },
  { id:25, question:"Which colored-stone is known as the 'stone of all colors' because it comes in virtually every color?", options:["Garnet","Spinel","Tourmaline","Sapphire"], correct:2, gem:'tourmaline', gemLabel:'Tourmaline', img:'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=560&q=80' }
];

// STATE
let currentUser={},timeRemaining=QUIZ_DURATION_SECONDS,timerInterval=null,quizSubmitted=false,quizStartTime=null,userAnswers={},shuffledQuestions=[],currentQIndex=0,finalScore=0;
const finalTotal=25;

// PARTICLES
(function(){
  const canvas=document.getElementById('particle-canvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  let W,H,particles=[];
  const COLORS=['#c9a84c','#e74c3c','#2980b9','#27ae60','#8e44ad','#1abc9c','#e67e22'];
  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;}
  function mkp(){return{x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.4+0.3,dx:(Math.random()-0.5)*0.3,dy:(Math.random()-0.5)*0.3,color:COLORS[Math.floor(Math.random()*COLORS.length)],alpha:Math.random()*0.6+0.1};}
  resize();for(let i=0;i<110;i++)particles.push(mkp());
  window.addEventListener('resize',resize);
  function draw(){ctx.clearRect(0,0,W,H);particles.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=p.color;ctx.globalAlpha=p.alpha;ctx.fill();p.x+=p.dx;p.y+=p.dy;if(p.x<0||p.x>W)p.dx*=-1;if(p.y<0||p.y>H)p.dy*=-1;});ctx.globalAlpha=1;requestAnimationFrame(draw);}
  draw();
})();

// HELPERS
function shuffle(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function esc(t){const d=document.createElement('div');d.textContent=t;return d.innerHTML;}
function formatDur(s){return`${Math.floor(s/60)}m ${s%60}s`;}
function setGemColor(k){const g=GEM_COLORS[k]||GEM_COLORS.teal;document.documentElement.style.setProperty('--gem-color',g.color);document.documentElement.style.setProperty('--gem-glow',g.glow);document.documentElement.style.setProperty('--gem-subtle',g.subtle);}

// TOAST
const MILESTONES={5:{e:'🌟',t:'5 down, 20 to go!'},10:{e:'💎',t:"10 done — you're on a roll!"},15:{e:'🔥',t:'Halfway! Keep going!'},20:{e:'🏆',t:'Only 5 left — finish strong!'},25:{e:'🎉',t:'All 25 answered!'}};
function showToast(emoji,text){const t=document.getElementById('toast');document.getElementById('toast-emoji').textContent=emoji;document.getElementById('toast-text').textContent=text;t.classList.add('visible');setTimeout(()=>t.classList.remove('visible'),3200);}

// COUNTRY/CITY
const CC_MAP={India:'+91',Belgium:'+32',USA:'+1',UAE:'+971',China:'+86','Hong Kong':'+852',UK:'+44',Singapore:'+65',Australia:'+61',Canada:'+1',Japan:'+81',Israel:'+972',Thailand:'+66',Turkey:'+90',Italy:'+39','South Africa':'+27'};
function updateCityField(c){const g=document.getElementById('city-group'),l=document.getElementById('city-label'),i=document.getElementById('city');if(!c){g.style.display='none';i.required=false;return;}g.style.display='flex';if(c==='India'){l.textContent='City *';i.placeholder='e.g. Mumbai, Delhi, Surat...';i.required=true;}else{l.textContent='State / Region (optional)';i.placeholder='e.g. California, Dubai Marina...';i.required=false;}}

// DOM READY
document.addEventListener('DOMContentLoaded',()=>{
  const co=document.getElementById('country');
  updateCityField(co.value);
  co.addEventListener('change',()=>{const c=CC_MAP[co.value];if(c)document.getElementById('countryCode').value=c;updateCityField(co.value);});
  document.getElementById('take-quiz-btn').addEventListener('click',()=>{document.getElementById('landing-section').classList.add('hidden');document.getElementById('registration-section').classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'});});
  document.getElementById('start-btn').addEventListener('click',handleStart);
});

// REGISTRATION → triggers OTP send
function handleStart(){
  const name=document.getElementById('fullName').value.trim(),email=document.getElementById('email').value.trim();
  if(!name||!email){alert('Please enter your name and email.');return;}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){alert('Please enter a valid email address.');return;}
  const country=document.getElementById('country').value||'India';
  if(country==='India'&&!document.getElementById('city').value.trim()){alert('Please enter your city.');return;}
  currentUser={name,email,mobile:document.getElementById('mobile').value.trim()||'',countryCode:document.getElementById('mobile').value.trim()?document.getElementById('countryCode').value:'',country,profession:document.getElementById('profession').value||'Not specified',city:document.getElementById('city').value.trim()||''};
  sendOTP();
}

// ────────────────────────────────────
// OTP ENGINE
// ────────────────────────────────────
function generateOTP(){
  return Math.floor(100000+Math.random()*900000).toString();
}

function sendOTP(){
  const btn=document.getElementById('start-btn');
  btn.textContent='Sending Code...';btn.classList.add('otp-sending');

  otpCode=generateOTP();
  otpExpiry=Date.now()+(OTP_EXPIRY_SEC*1000);
  otpAttempts=0;

  // Init EmailJS and send
  emailjs.init(EMAILJS_PUBLIC_KEY);
  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    to_name:   currentUser.name,
    to_email:  currentUser.email,
    otp_code:  otpCode,
    quiz_name: 'IGI Colored Stone Quiz',
    expiry_min:'5'
  }).then(()=>{
    btn.textContent='Start Quiz →';btn.classList.remove('otp-sending');
    showOTPSection();
  }).catch(err=>{
    btn.textContent='Start Quiz →';btn.classList.remove('otp-sending');
    console.error('EmailJS error:',err);
    // Fallback: proceed without OTP if EmailJS not configured yet
    if(EMAILJS_SERVICE_ID==='YOUR_SERVICE_ID'){
      alert('EmailJS not configured yet. Proceeding without OTP for now.');
      startQuiz();
    } else {
      alert('Failed to send verification code. Please check your email address and try again.');
    }
  });
}

function showOTPSection(){
  document.getElementById('registration-section').classList.add('hidden');
  const sec=document.getElementById('otp-section');
  sec.classList.remove('hidden');
  document.getElementById('otp-email-display').textContent=currentUser.email;
  document.getElementById('otp-error').classList.add('hidden');
  document.getElementById('otp-expired').classList.add('hidden');
  clearOTPBoxes();
  startOTPCountdown();
  initOTPBoxes();
  // Focus first box
  setTimeout(()=>document.querySelectorAll('.otp-box')[0]?.focus(),100);
  window.scrollTo({top:0,behavior:'smooth'});
}

function clearOTPBoxes(){
  document.querySelectorAll('.otp-box').forEach(b=>{b.value='';b.classList.remove('filled','success','error');});
}

function initOTPBoxes(){
  const boxes=[...document.querySelectorAll('.otp-box')];
  boxes.forEach((box,i)=>{
    // Remove old listeners by cloning
    const nb=box.cloneNode(true);
    box.parentNode.replaceChild(nb,box);
  });
  const freshBoxes=[...document.querySelectorAll('.otp-box')];
  freshBoxes.forEach((box,i)=>{
    box.addEventListener('input',e=>{
      // Only allow digits
      box.value=box.value.replace(/[^0-9]/g,'');
      if(box.value) box.classList.add('filled');
      else box.classList.remove('filled');
      // Auto-advance
      if(box.value&&i<freshBoxes.length-1) freshBoxes[i+1].focus();
      // Auto-submit when all filled
      if(freshBoxes.every(b=>b.value)) verifyOTP();
    });
    box.addEventListener('keydown',e=>{
      if(e.key==='Backspace'&&!box.value&&i>0){ freshBoxes[i-1].focus(); freshBoxes[i-1].value=''; freshBoxes[i-1].classList.remove('filled'); }
      if(e.key==='Enter') verifyOTP();
    });
    box.addEventListener('paste',e=>{
      e.preventDefault();
      const text=(e.clipboardData||window.clipboardData).getData('text').replace(/[^0-9]/g,'').slice(0,6);
      text.split('').forEach((ch,idx)=>{ if(freshBoxes[idx]){freshBoxes[idx].value=ch;freshBoxes[idx].classList.add('filled');} });
      if(freshBoxes.every(b=>b.value)) verifyOTP();
    });
  });
}

function verifyOTP(){
  const entered=[...document.querySelectorAll('.otp-box')].map(b=>b.value).join('');
  if(entered.length<6) return;

  document.getElementById('otp-error').classList.add('hidden');
  document.getElementById('otp-expired').classList.add('hidden');

  // Check expiry
  if(Date.now()>otpExpiry){
    document.querySelectorAll('.otp-box').forEach(b=>b.classList.add('error'));
    document.getElementById('otp-expired').classList.remove('hidden');
    document.getElementById('otp-timer-txt').classList.add('hidden');
    document.getElementById('resend-otp-btn').classList.remove('hidden');
    stopOTPCountdown();
    return;
  }

  otpAttempts++;

  if(entered===otpCode){
    // Success!
    document.querySelectorAll('.otp-box').forEach(b=>b.classList.add('success'));
    stopOTPCountdown();
    showToast('✅','Email verified! Starting quiz...');
    setTimeout(()=>{
      document.getElementById('otp-section').classList.add('hidden');
      startQuiz();
    },900);
  } else {
    // Wrong code
    document.querySelectorAll('.otp-box').forEach(b=>b.classList.add('error'));
    setTimeout(()=>{
      document.querySelectorAll('.otp-box').forEach(b=>b.classList.remove('error'));
      if(otpAttempts>=OTP_MAX_ATTEMPTS){
        document.getElementById('otp-error').textContent='❌ Too many incorrect attempts. Please request a new code.';
      } else {
        document.getElementById('otp-error').textContent=`❌ Incorrect code. ${OTP_MAX_ATTEMPTS-otpAttempts} attempt${OTP_MAX_ATTEMPTS-otpAttempts===1?'':'s'} remaining.`;
      }
      document.getElementById('otp-error').classList.remove('hidden');
      clearOTPBoxes();
      document.querySelectorAll('.otp-box')[0]?.focus();
    },500);
  }
}

function startOTPCountdown(){
  stopOTPCountdown();
  const timerEl=document.getElementById('otp-countdown');
  const txtEl=document.getElementById('otp-timer-txt');
  const resendBtn=document.getElementById('resend-otp-btn');
  txtEl.classList.remove('hidden');txtEl.classList.remove('urgent');
  resendBtn.classList.add('hidden');

  otpCountdownIv=setInterval(()=>{
    const remaining=Math.max(0,Math.ceil((otpExpiry-Date.now())/1000));
    const m=Math.floor(remaining/60).toString().padStart(2,'0');
    const s=(remaining%60).toString().padStart(2,'0');
    timerEl.textContent=`${m}:${s}`;
    if(remaining<=60) txtEl.classList.add('urgent');
    if(remaining<=0){
      stopOTPCountdown();
      txtEl.classList.add('hidden');
      resendBtn.classList.remove('hidden');
    }
  },1000);
}

function stopOTPCountdown(){
  if(otpCountdownIv){clearInterval(otpCountdownIv);otpCountdownIv=null;}
}

function goBackToRegistration(){
  stopOTPCountdown();
  document.getElementById('otp-section').classList.add('hidden');
  document.getElementById('registration-section').classList.remove('hidden');
}

// Wire resend button
document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('resend-otp-btn')?.addEventListener('click',()=>{
    clearOTPBoxes();
    document.getElementById('otp-error').classList.add('hidden');
    document.getElementById('otp-expired').classList.add('hidden');
    otpAttempts=0;
    otpCode=generateOTP();
    otpExpiry=Date.now()+(OTP_EXPIRY_SEC*1000);
    emailjs.send(EMAILJS_SERVICE_ID,EMAILJS_TEMPLATE_ID,{to_name:currentUser.name,to_email:currentUser.email,otp_code:otpCode,quiz_name:'IGI Colored Stone Quiz',expiry_min:'5'}).then(()=>{
      startOTPCountdown();
      showToast('✉️','New code sent to your email!');
    }).catch(()=>showToast('⚠️','Failed to resend. Please try again.'));
  });
  document.getElementById('verify-otp-btn')?.addEventListener('click',verifyOTP);
});

// START QUIZ
function startQuiz(){
  shuffledQuestions=shuffle(quizQuestions).map(q=>{const idx=shuffle([0,1,2,3]);return{...q,options:idx.map(i=>q.options[i]),correct:idx.indexOf(q.correct),originalId:q.id};});
  userAnswers={};quizSubmitted=false;currentQIndex=0;
  document.getElementById('registration-section').classList.add('hidden');
  document.getElementById('quiz-section').classList.remove('hidden');
  document.getElementById('quiz-name-display').textContent=currentUser.name;
  quizStartTime=Date.now();startTimer();renderQuestion(0);window.scrollTo({top:0,behavior:'smooth'});
  if(typeof fbq!=='undefined')fbq('track','InitiateCheckout',{content_name:'IGI Stone Quiz Started'});
}

// TIMER
function startTimer(){
  timeRemaining=QUIZ_DURATION_SECONDS;const endTime=Date.now()+QUIZ_DURATION_SECONDS*1000;const el=document.getElementById('timer');
  timerInterval=setInterval(()=>{timeRemaining=Math.max(0,Math.ceil((endTime-Date.now())/1000));const m=Math.floor(timeRemaining/60).toString().padStart(2,'0'),s=(timeRemaining%60).toString().padStart(2,'0');el.textContent=`${m}:${s}`;if(timeRemaining<=60)el.classList.add('warning');if(timeRemaining<=0){clearInterval(timerInterval);submitQuiz('Time expired');}},1000);
}

// RENDER QUESTION
function renderQuestion(idx){
  const q=shuffledQuestions[idx],total=shuffledQuestions.length,saved=userAnswers[q.id];
  setGemColor(q.gem);
  document.getElementById('global-progress-fill').style.width=`${((idx+1)/total)*100}%`;
  document.getElementById('questions-container').innerHTML=`
    <div class="question-card">
      <div class="question-left">
        <div class="q-meta">
          <span class="q-num">Question ${idx+1} of ${total}</span>
          <div class="q-progress-mini"><div class="q-progress-mini-fill" style="width:${((idx+1)/total)*100}%"></div></div>
        </div>
        <p class="question-text">${esc(q.question)}</p>
        <div class="options">${q.options.map((opt,oIdx)=>`<label class="option-label ${saved===oIdx?'selected':''}"><input type="radio" name="q${q.id}" value="${oIdx}" ${saved===oIdx?'checked':''}><span class="option-dot"></span><span>${esc(opt)}</span></label>`).join('')}</div>
      </div>
    </div>
    <div class="question-nav">
      <button class="btn-nav" onclick="goToPrev()" ${idx===0?'disabled':''}>← Prev</button>
      <span class="nav-dots">${shuffledQuestions.map((_,i)=>`<span class="ndot ${i===idx?'active':(userAnswers[shuffledQuestions[i].id]!==undefined?'answered':'')}" onclick="goToQuestion(${i})"></span>`).join('')}</span>
      ${idx<total-1?`<button class="btn-nav" onclick="goToNext()">Next →</button>`:`<button class="btn-nav btn-nav-submit" onclick="submitQuiz('Manual submission')">Submit ✓</button>`}
    </div>`;
  document.getElementById('questions-container').querySelectorAll('.option-label').forEach(label=>{
    label.addEventListener('click',()=>{
      const radio=label.querySelector('input[type="radio"]');const was=userAnswers[q.id]!==undefined;userAnswers[q.id]=parseInt(radio.value);
      document.getElementById('questions-container').querySelectorAll('.option-label').forEach(l=>l.classList.remove('selected'));label.classList.add('selected');
      document.querySelectorAll('.ndot')[idx]?.classList.add('answered');
      if(!was){const c=Object.keys(userAnswers).length;if(MILESTONES[c])showToast(MILESTONES[c].e,MILESTONES[c].t);}
    });
  });
}
function goToNext(){if(currentQIndex<shuffledQuestions.length-1)renderQuestion(++currentQIndex);}
function goToPrev(){if(currentQIndex>0)renderQuestion(--currentQIndex);}
function goToQuestion(idx){currentQIndex=idx;renderQuestion(idx);}

// SUBMIT
function submitQuiz(reason){
  if(quizSubmitted)return;quizSubmitted=true;if(timerInterval)clearInterval(timerInterval);
  let score=0;shuffledQuestions.forEach(q=>{if(userAnswers[q.id]===q.correct)score++;});finalScore=score;
  const rawSec=quizStartTime?Math.floor((Date.now()-quizStartTime)/1000):QUIZ_DURATION_SECONDS;
  const timeStr=formatDur(rawSec),pct=Math.round((score/finalTotal)*100);
  const wrongAnswers=shuffledQuestions.filter(q=>userAnswers[q.id]!==q.correct).map(q=>({qNum:q.originalId,question:q.question,given:userAnswers[q.id]!==undefined?q.options[userAnswers[q.id]]:'Not answered',correct:q.options[q.correct]}));
  if(typeof fbq!=='undefined')fbq('track','CompleteRegistration',{content_name:'IGI Stone Quiz Completed',value:score,currency:'INR'});
  const payload={source:'colored-stone',name:currentUser.name,email:currentUser.email,mobile:currentUser.mobile,countryCode:currentUser.countryCode,country:currentUser.country,profession:currentUser.profession,city:currentUser.city,score,total:finalTotal,pct:pct+'%',timeTaken:timeStr,submitReason:reason,deviceType:/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)?'Mobile':'Desktop',screenRes:`${window.screen.width}x${window.screen.height}`,userAgent:navigator.userAgent,wrongAnswers,submittedAt:new Date().toISOString()};
  fetch(GAS_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify(payload)}).catch(()=>{});
  showResult(score,timeStr,pct,wrongAnswers);
}

// SHOW RESULT
function showResult(score,timeStr,pct,wrongAnswers){
  document.getElementById('quiz-section').classList.add('hidden');
  const rs=document.getElementById('result-section');rs.classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'});
  setGemColor(pct>=92?'topaz':pct>=76?'emerald':pct>=60?'sapphire':'teal');
  document.getElementById('res-name').textContent=currentUser.name;
  document.getElementById('res-time').textContent=timeStr;
  document.getElementById('res-pct').textContent=pct+'%';
  let cur=0;document.getElementById('res-score').textContent=`0 / ${finalTotal}`;
  const iv=setInterval(()=>{cur=Math.min(cur+1,score);document.getElementById('res-score').textContent=`${cur} / ${finalTotal}`;if(cur>=score)clearInterval(iv);},55);
  let badge,badgeColor;
  if(pct>=92){badge='🏆 Colored Stone Expert';badgeColor='#c9a84c';}
  else if(pct>=76){badge='💎 Stone Connoisseur';badgeColor='#27ae60';}
  else if(pct>=60){badge='🌿 On Your Way';badgeColor='#2980b9';}
  else{badge='📚 Keep Exploring';badgeColor='#8e44ad';}
  const be=document.getElementById('res-badge');be.textContent=badge;be.style.color=badgeColor;be.style.borderColor=badgeColor+'40';
  document.getElementById('review-list').innerHTML=shuffledQuestions.map((q,i)=>{
    const gi=userAnswers[q.id],ok=gi===q.correct,gt=gi!==undefined?q.options[gi]:'Not answered',ct=q.options[q.correct];
    return`<div class="review-item ${ok?'correct':'wrong'}"><div class="review-q"><span>Q${i+1}.</span>${esc(q.question)}</div><div class="review-answers">${ok?`<span class="review-given correct-ans">✓ ${esc(gt)}</span>`:`<span class="review-given">✗ ${esc(gt)}</span><span class="review-correct">✓ ${esc(ct)}</span>`}</div></div>`;
  }).join('');
  bindCourseInterest();
}

// COURSE INTEREST
function bindCourseInterest(){
  const btn=document.getElementById('course-submit-btn');if(!btn)return;
  btn.addEventListener('click',()=>{
    const course=document.getElementById('course-select').value;if(!course){alert('Please select a course.');return;}
    btn.disabled=true;btn.textContent='Sending...';
    fetch(GAS_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify({source:'course_interest_colored-stone',name:currentUser.name,email:currentUser.email,mobile:currentUser.mobile,countryCode:currentUser.countryCode,country:currentUser.country,city:currentUser.city,profession:currentUser.profession,course,score:finalScore,total:finalTotal,pct:Math.round((finalScore/finalTotal)*100)+'%',submittedAt:new Date().toISOString()})}).catch(()=>{});
    document.getElementById('course-confirm').classList.remove('hidden');btn.textContent='✓ Sent';
    if(typeof fbq!=='undefined')fbq('track','Lead',{content_name:course,content_category:'IGI Course Enquiry'});
  });
}

// SHARE
function getShareText(){const pct=Math.round((finalScore/finalTotal)*100);const badge=pct>=92?'🏆 Colored Stone Expert':pct>=76?'💎 Stone Connoisseur':pct>=60?'🌿 On Your Way':'📚 Keep Exploring';return`I scored ${finalScore}/${finalTotal} (${pct}%) on the IGI Colored Stone Quiz and earned: ${badge}! 💎\n\nCan you beat my score? Take the quiz: ${QUIZ_URL}`;}
function shareWhatsApp(){window.open(`https://wa.me/?text=${encodeURIComponent(getShareText())}`,'_blank');}
function shareLinkedIn(){const url=encodeURIComponent(QUIZ_URL);const pct=Math.round((finalScore/finalTotal)*100);const text=encodeURIComponent(`I scored ${finalScore}/${finalTotal} (${pct}%) on the IGI Colored Stone Quiz! 💎 Test your gem knowledge:`);window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`,'_blank');}
function copyShareLink(){navigator.clipboard.writeText(getShareText()).then(()=>{const btn=document.getElementById('copy-btn');btn.textContent='✅ Copied!';setTimeout(()=>{btn.textContent='🔗 Copy Link';},2500);}).catch(()=>alert('Copy this link: '+QUIZ_URL));}

// RETAKE
function retakeQuiz(){userAnswers={};quizSubmitted=false;currentQIndex=0;finalScore=0;setGemColor('teal');document.getElementById('result-section').classList.add('hidden');document.getElementById('landing-section').classList.remove('hidden');document.getElementById('timer').classList.remove('warning');document.getElementById('timer').textContent='06:00';window.scrollTo({top:0,behavior:'smooth'});}
