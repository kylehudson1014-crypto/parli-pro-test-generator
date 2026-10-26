// ===== Parli Pro game layer: XP, streaks, badges, speed round, feedback, online play =====
const G=Object.assign({xp:0,streak:0,last:'',run:0,bestRun:0,correct:0,topicOk:{},badges:[],speedBest:0,muted:false,dark:null,name:'',pid:''},JSON.parse(localStorage.ppg||'{}'));
const gsave=()=>localStorage.ppg=JSON.stringify(G);
if(!G.pid){G.pid=Math.random().toString(36).slice(2,10);gsave()}
const TITLES=['Rookie','Member','Committee Member','Secretary','Treasurer','Vice President','President','Parliamentarian','Gavel Legend'];
const lvl=x=>Math.floor(Math.sqrt(x/60))+1, lvlXp=l=>60*(l-1)*(l-1);
const title=l=>TITLES[Math.min(l-1,TITLES.length-1)];
const BADGES=[
 ['first','🔨','Called to Order','Get your first answer right'],
 ['run10','🔥','On Fire','10 right in a row'],
 ['run25','☄️','Unstoppable','25 right in a row'],
 ['poo','✋','Point of Order Pro','25 right on incidental motions'],
 ['amend','✏️','Amendment Ace','25 right on amendments'],
 ['vote','🗳️','Vote Counter','25 right on voting'],
 ['c100','🏛️','Floor Leader','100 total right answers'],
 ['c500','👑','Chair of the Board','500 total right answers'],
 ['d3','📅','3-Day Streak','Practice 3 days in a row'],
 ['d7','🗓️','Week Warrior','Practice 7 days in a row'],
 ['sp15','⚡','Speed Demon','15+ right in one Speed Round'],
 ['stump','😈','Stumper','Stump a friend'],
 ['battle','🏆','Battle Champ','Win an online battle'],
 ['lv5','🎓','Vice President','Reach level 5']];
const today=()=>new Date().toLocaleDateString('en-CA');
function touchDay(){const t=today();if(G.last===t)return;const y=new Date(Date.now()-864e5).toLocaleDateString('en-CA');G.streak=G.last===y?G.streak+1:1;G.last=t}
function badge(id){if(G.badges.includes(id))return;G.badges.push(id);const b=BADGES.find(x=>x[0]===id);toast(`${b[1]} Badge unlocked: <b>${b[2]}</b>`,'gold');sfx('badge');confetti(120)}
function gain(n,why){const l0=lvl(G.xp);G.xp+=n;const l1=lvl(G.xp);if(l1>l0){setTimeout(()=>{toast(`⬆️ Level ${l1}: <b>${title(l1)}</b>!`,'gold');sfx('level');confetti(160)},400)}if(l1>=5)badge('lv5');gsave();hud()}
// called for every graded answer anywhere in the app
function award(q,ok,bonus=0){touchDay();if(ok){G.run++;G.correct++;G.topicOk[q.topic]=(G.topicOk[q.topic]||0)+1;G.bestRun=Math.max(G.bestRun,G.run);gain(10+bonus);
  badge('first');if(G.run>=10)badge('run10');if(G.run>=25)badge('run25');if(G.correct>=100)badge('c100');if(G.correct>=500)badge('c500');
  if((G.topicOk['incidental motions']||0)>=25)badge('poo');if((G.topicOk['amendments']||0)>=25)badge('amend');if((G.topicOk['voting']||0)>=25)badge('vote');
  if(G.run&&G.run%5===0)toast(`🔥 ${G.run} in a row!`)}else{G.run=0;gain(1)}
 if(G.streak>=3)badge('d3');if(G.streak>=7)badge('d7');gsave()}
// hook the existing test engine
const _rec=rec;rec=function(q,i){_rec(q,i);if(i!=null){const ok=i===q.correct;award(q,ok);if(T&&T.instant){ok?(sfx('ok'),confetti(40)):sfx('bad')}}};

// ---------- sound (Web Audio, no files) ----------
let AC=null;function sfx(k){if(G.muted)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const seq={ok:[[660,.08],[880,.12]],bad:[[220,.18]],badge:[[523,.09],[659,.09],[784,.09],[1047,.2]],level:[[392,.1],[523,.1],[659,.1],[784,.25]],tick:[[1000,.03]],end:[[784,.12],[523,.25]]}[k]||[];
 let t=AC.currentTime;seq.forEach(([f,d])=>{const o=AC.createOscillator(),g=AC.createGain();o.type=k==='bad'?'sawtooth':'triangle';o.frequency.value=f;g.gain.setValueAtTime(.15,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+d);t+=d})}catch(e){}}
// ---------- confetti ----------
function confetti(n=80){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const c=document.createElement('canvas');c.className='confetti';document.body.appendChild(c);const x=c.getContext('2d');c.width=innerWidth*devicePixelRatio;c.height=innerHeight*devicePixelRatio;x.scale(devicePixelRatio,devicePixelRatio);
 const cols=['#f4b400','#ff4d6d','#4cc9f0','#7bd389','#b388ff','#ff9f1c'];const P=Array.from({length:n},()=>({x:innerWidth/2+(Math.random()-.5)*120,y:innerHeight*.35,vx:(Math.random()-.5)*12,vy:-Math.random()*12-4,r:Math.random()*6+4,c:cols[Math.random()*cols.length|0],a:Math.random()*6}));let f=0;
 (function fr(){x.clearRect(0,0,innerWidth,innerHeight);P.forEach(p=>{p.vy+=.35;p.x+=p.vx;p.y+=p.vy;p.a+=.2;x.save();x.translate(p.x,p.y);x.rotate(p.a);x.fillStyle=p.c;x.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);x.restore()});if(++f<90)requestAnimationFrame(fr);else c.remove()})()}
function toast(h,cls=''){const d=document.createElement('div');d.className='toast '+cls;d.innerHTML=h;document.body.appendChild(d);setTimeout(()=>d.classList.add('out'),2200);setTimeout(()=>d.remove(),2700)}

// ---------- theme + HUD ----------
function theme(){const dark=G.dark==null?matchMedia('(prefers-color-scheme: dark)').matches:G.dark;document.documentElement.dataset.theme=dark?'dark':'light';const b=$('#thm');if(b)b.textContent=dark?'☀️':'🌙'}
function hud(){const h=$('#hud');if(!h)return;const l=lvl(G.xp),a=lvlXp(l),b=lvlXp(l+1);h.innerHTML=`<span class="pill">🔥 ${G.streak||0}</span><span class="pill">⭐ ${G.xp} XP</span><span class="pill lv">Lv ${l}</span><div class="xpbar"><i style="width:${Math.round(100*(G.xp-a)/(b-a))}%"></i></div>`;const m=$('#mute');if(m)m.textContent=G.muted?'🔇':'🔊'}
$('#thm').onclick=()=>{G.dark=document.documentElement.dataset.theme!=='dark';gsave();theme()};
$('#mute').onclick=()=>{G.muted=!G.muted;gsave();hud();if(!G.muted)sfx('ok')};
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',theme);theme();hud();

// ---------- Play hub (home) ----------
const online=()=>!!(window.PP_DB&&navigator.onLine);
function play(){const l=lvl(G.xp),a=lvlXp(l),b=lvlXp(l+1);
 M().innerHTML=`<div class="hero card"><div class="lvbig">Lv ${l}</div><div style="flex:1"><div class="muted2">Your rank</div><h2 style="margin:0">${title(l)}</h2>
 <div class="xpbar big"><i style="width:${Math.round(100*(G.xp-a)/(b-a))}%"></i></div><div class="muted2">${G.xp-a} / ${b-a} XP to ${title(l+1)}</div></div>
 <div class="streak"><div style="font-size:34px">🔥</div><b>${G.streak||0}</b><div class="muted2">day streak</div></div></div>
 <div class="tiles">
 <button class="tile t1" onclick="speed()"><span>⚡</span><b>Speed Round</b><small>60 seconds. Build combos. Best: ${G.speedBest}</small></button>
 <button class="tile t2" onclick="quick()"><span>🎯</span><b>Quick 10</b><small>10 questions with instant feedback</small></button>
 <button class="tile t3 ${online()?'':'off'}" onclick="stumpHome()"><span>😈</span><b>Stump a Friend</b><small>${mpNote()}</small></button>
 <button class="tile t4 ${online()?'':'off'}" onclick="battleHome()"><span>⚔️</span><b>Battle</b><small>${mpNote('Take turns on timed questions with friends')}</small></button>
 </div>
 <div class="card"><h3 style="margin-top:0">Badges <span class="muted">${G.badges.length}/${BADGES.length}</span></h3><div class="badges">${BADGES.map(b=>`<div class="bdg ${G.badges.includes(b[0])?'got':''}" title="${b[3]}"><span>${b[1]}</span><b>${b[2]}</b><small>${b[3]}</small></div>`).join('')}</div></div>
 <p class="muted" style="text-align:center">Best run: ${G.bestRun} in a row · ${G.correct} right answers all-time</p>`}
function mpNote(d='Send a question with a 4-letter code'){return !window.PP_DB?'Online play coming soon':!navigator.onLine?'Needs internet — you\'re offline':d}
addEventListener('online',()=>{if($('.tiles'))play()});addEventListener('offline',()=>{if($('.tiles'))play()});

// ---------- shared single-question renderer ----------
function qhtml(q,a,{reveal,onpick='pickA'}={}){return `<div class="muted">${q.type==='TF'?'True or False?':'Multiple choice'} · ${esc(q.topic)}</div><h3 class="qtext">${esc(q.q)}</h3>
 ${q.opts.map((o,i)=>`<button class="opt ${reveal?(i===q.correct?'ok':(a===i?'bad':'')):''}" ${reveal?'disabled':''} onclick="${onpick}(${i})">${q.type==='MC'?'<i>'+'ABCDE'[i]+'</i> ':''}${esc(o)}</button>`).join('')}
 ${reveal?`<div class="exp ${a===q.correct?'good':'nope'}">${a===q.correct?'✅ <b>Nailed it!</b> ':a==null?'⏰ <b>Time\'s up.</b> ':'❌ <b>Not quite.</b> '}${why(q)}</div>`:''}`}
const praise=['Nailed it!','Point well taken!','Motion carries!','So ordered!','Well said, Madam/Mr. Chair!','Unanimous!'];

// ---------- Quick 10 ----------
let Q=null;function quick(){Q={qs:shuf(BANK).slice(0,10).map(q=>prep(q,true)),i:0,a:null,score:0,combo:0};quickR()}
function quickR(){const q=Q.qs[Q.i];if(!q){const p=Q.score>=8;M().innerHTML=`<div class="card center"><div style="font-size:60px">${p?'🏆':Q.score>=5?'👍':'📚'}</div><h2>${Q.score} / 10</h2><p>${p?'Outstanding! The chair recognizes a pro.':Q.score>=5?'Solid. Keep the streak alive!':'Every expert started as a rookie. Try again!'}</p><button class="btn" onclick="quick()">Play again</button><button class="btn alt" onclick="play()">Home</button></div>`;if(p)confetti(150);return}
 M().innerHTML=`<div class="card"><div class="qtop"><span>Question ${Q.i+1}/10</span><span>Combo x${Q.combo}</span><span>Score ${Q.score}</span></div><div class="prog"><i style="width:${Q.i*10}%"></i></div>${qhtml(q,Q.a,{reveal:Q.a!=null,onpick:'quickA'})}
 ${Q.a!=null?`<button class="btn" style="width:100%" onclick="Q.i++;Q.a=null;quickR()">${Q.i<9?'Next ›':'See results'}</button>`:''}</div>`;scrollTo(0,0)}
function quickA(i){if(Q.a!=null)return;Q.a=i;const q=Q.qs[Q.i],ok=i===q.correct;_rec(q,i);if(ok){Q.score++;Q.combo++;sfx('ok');confetti(40)}else{Q.combo=0;sfx('bad')}award(q,ok,ok?Math.min(Q.combo-1,5)*2:0);quickR()}

// ---------- Speed Round ----------
let SP=null;function speed(){M().innerHTML=`<div class="card center"><div style="font-size:60px">⚡</div><h2>Speed Round</h2><p>60 seconds. Answer as many as you can.<br>Each right answer = <b>10 pts</b> + combo bonus. A miss resets your combo.</p><p class="muted">Personal best: ${G.speedBest} correct</p><button class="btn big" onclick="speedGo()">Start!</button></div>`}
function speedGo(){SP={pool:shuf(BANK).map(q=>prep(q,true)),i:0,score:0,pts:0,combo:0,maxc:0,miss:[],end:Date.now()+60000,lock:false};sfx('tick');speedR();SP.tm=setInterval(()=>{const s=Math.max(0,Math.ceil((SP.end-Date.now())/1000));const e=$('#sptime');if(e){e.textContent=s;e.classList.toggle('hot',s<=10)}const bar=$('#spbar');if(bar)bar.style.width=(100*(SP.end-Date.now())/60000)+'%';if(s<=0)speedEnd()},200)}
function speedR(){if(!SP)return;const q=SP.pool[SP.i];M().innerHTML=`<div class="card sp"><div class="qtop"><span class="timer" id="sptime">${Math.ceil((SP.end-Date.now())/1000)}</span><span>🔥 x${SP.combo}</span><span><b>${SP.pts}</b> pts</span></div><div class="prog t"><i id="spbar"></i></div>
 <div class="muted">${q.type==='TF'?'True or False?':'Multiple choice'}</div><h3 class="qtext">${esc(q.q)}</h3>${q.opts.map((o,i)=>`<button class="opt" onclick="speedA(${i},this)">${q.type==='MC'?'<i>'+'ABCDE'[i]+'</i> ':''}${esc(o)}</button>`).join('')}</div>`}
function speedA(i,el){if(!SP||SP.lock)return;SP.lock=true;const q=SP.pool[SP.i],ok=i===q.correct;_rec(q,i);
 if(ok){SP.score++;SP.combo++;SP.maxc=Math.max(SP.maxc,SP.combo);const add=10+Math.min(SP.combo-1,10)*2;SP.pts+=add;el.classList.add('ok');sfx('ok');award(q,true,Math.min(SP.combo-1,5));floatTxt(el,'+'+add)}
 else{SP.combo=0;el.classList.add('bad');document.querySelectorAll('.sp .opt')[q.correct].classList.add('ok');sfx('bad');SP.miss.push(q);award(q,false)}
 setTimeout(()=>{if(!SP)return;SP.lock=false;SP.i++;speedR()},ok?350:900)}
function floatTxt(el,t){const r=el.getBoundingClientRect(),d=document.createElement('div');d.className='floater';d.textContent=t;d.style.left=(r.right-70)+'px';d.style.top=(r.top+scrollY)+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),900)}
function speedEnd(){clearInterval(SP.tm);const s=SP;SP=null;sfx('end');const pb=s.score>G.speedBest;if(pb)G.speedBest=s.score;if(s.score>=15)badge('sp15');gain(s.pts>>2);gsave();if(pb&&s.score)confetti(180);
 M().innerHTML=`<div class="card center"><div style="font-size:60px">${pb?'🥇':'⏱️'}</div><h2>${s.pts} points</h2><p><b>${s.score}</b> right · best combo <b>x${s.maxc}</b>${pb?'<br><b class="gold">New personal best!</b>':''}</p><p class="muted">+${s.pts>>2} bonus XP</p><button class="btn big" onclick="speedGo()">Again!</button><button class="btn alt" onclick="play()">Home</button></div>
 ${s.miss.length?`<div class="card"><h3 style="margin-top:0">Learn from the misses</h3>${s.miss.map(q=>`<div style="margin-bottom:12px"><b>${esc(q.q)}</b><div class="exp">${why(q)}</div></div>`).join('')}</div>`:''}`}

// ---------- Online play (Firebase Realtime Database via REST; no SDK, no accounts) ----------
const DB=(p,m='GET',b)=>fetch(`${window.PP_DB.replace(/\/$/,'')}/rooms/${p}.json`,{method:m,body:b==null?undefined:JSON.stringify(b)}).then(r=>{if(!r.ok)throw new Error('db '+r.status);return r.json()});
const L4='ABCDEFGHJKLMNPQRSTUVWXYZ';const code4=()=>Array.from({length:4},()=>L4[Math.random()*L4.length|0]).join('');
async function newRoom(data){for(let k=0;k<8;k++){const c=code4();const ex=await DB(c);if(!ex||ex.created<Date.now()-864e5){await DB(c,'PUT',{...data,created:Date.now()});return c}}throw new Error('no code')}
const byId=id=>BANK.find(q=>q.id===id);
let POLL=null;const stopPoll=()=>{clearInterval(POLL);POLL=null};
function needName(cb){if(G.name)return cb();M().innerHTML=`<div class="card center"><h2>What should friends call you?</h2><input id="nm" maxlength="16" placeholder="Nickname (no last names)" autocomplete="off"><button class="btn big" id="nmb">Let's go</button><p class="muted">No account needed. Just a nickname.</p></div>`;$('#nmb').onclick=()=>{const v=$('#nm').value.trim().replace(/[<>]/g,'');if(!v)return;G.name=v.slice(0,16);gsave();cb()}}
function mpGuard(){if(!window.PP_DB){toast('Online play isn\'t set up yet. Ask your teacher!');return false}if(!navigator.onLine){toast('📴 You\'re offline. Online play needs internet.');return false}return true}
const mpErr=e=>{stopPoll();M().innerHTML=`<div class="card center"><h2>📡 Connection problem</h2><p>${esc(e.message||e)}</p><button class="btn" onclick="play()">Home</button></div>`};

// Stump a Friend
let STC=[];function stumpHome(){if(!mpGuard())return;needName(()=>{stopPoll();M().innerHTML=`<div class="card center"><div style="font-size:50px">😈</div><h2>Stump a Friend</h2><p>Pick a tricky question and send your friend the code. You score if they miss it!</p>
 <button class="btn big" onclick="stumpPick()">Pick a question</button><div class="or">or</div><input id="jc" maxlength="4" placeholder="ENTER CODE" class="code" autocapitalize="characters" autocomplete="off"><button class="btn alt" onclick="stumpJoin($('#jc').value)">Answer a friend's question</button></div>`})}
function stumpPick(){STC=shuf(BANK).slice(0,4).map(q=>prep(q,false));M().innerHTML=`<div class="card"><h2 style="margin-top:0">Choose your weapon</h2><p class="muted">The correct answer is highlighted so you know what you're sending.</p>
 ${STC.map((q,k)=>`<button class="pickq" onclick="stumpSend(${k})"><b>${esc(q.q)}</b><small>✔ ${esc(q.opts[q.correct])} · ${esc(q.topic)}</small></button>`).join('')}<button class="btn alt" onclick="stumpPick()">🔀 Shuffle</button></div>`}
async function stumpSend(k){const q=STC[k];try{const c=await newRoom({mode:'stump',from:G.name,fromId:G.pid,qid:q.id});stumpWatch(c)}catch(e){mpErr(e)}}
function stumpWatch(c){const show=r=>{const ans=Object.values(r&&r.answers||{});const q=prep(byId(r.qid),false);const missed=ans.filter(a=>!a.ok).length;
 const prev=+(localStorage['ppst'+c]||0);if(missed>prev){localStorage['ppst'+c]=missed;gain(15*(missed-prev));badge('stump');sfx('badge');toast(`😈 You stumped someone! +${15*(missed-prev)} XP`,'gold')}
 M().innerHTML=`<div class="card center"><p>Tell your friends this code:</p><div class="bigcode">${c}</div><button class="btn alt" onclick="shareCode('${c}','Can you answer my Parli Pro question? Code: ${c}')">📤 Share</button>
 <p class="muted">Code works for 24 hours.</p></div><div class="card"><b>${esc(q.q)}</b><div class="muted">✔ ${esc(q.opts[q.correct])}</div><h3>Results (${ans.length})</h3>${ans.length?ans.map(a=>`<div class="res">${a.ok?'✅':'😈'} <b>${esc(a.name)}</b> ${a.ok?'got it':'was stumped!'}</div>`).join(''):'<p class="muted">Waiting for answers…</p>'}<button class="btn alt" onclick="stopPoll();play()">Done</button></div>`};
 const tick=()=>DB(c).then(show).catch(()=>{});tick();stopPoll();POLL=setInterval(tick,2500)}
function shareCode(c,t){if(navigator.share)navigator.share({text:t}).catch(()=>{});else{navigator.clipboard?.writeText(t);toast('Copied!')}}
let SJ=null;async function stumpJoin(c){c=(c||'').toUpperCase().trim();if(!/^[A-Z]{4}$/.test(c))return toast('Codes are 4 letters');try{const r=await DB(c);if(!r||r.mode!=='stump')return toast('No question with that code');
 if(r.answers&&r.answers[G.pid])return toast('You already answered this one');const q=byId(r.qid);if(!q)return toast('Update the app to play this one');SJ={c,r,q:prep(q,false),a:null};stumpQ()}catch(e){mpErr(e)}}
function stumpQ(){M().innerHTML=`<div class="card"><div class="muted">😈 ${esc(SJ.r.from)} is trying to stump you!</div>${qhtml(SJ.q,SJ.a,{reveal:SJ.a!=null,onpick:'stumpA'})}${SJ.a!=null?`<button class="btn" onclick="play()">Home</button><button class="btn alt" onclick="stumpPick()">Stump them back!</button>`:''}</div>`}
async function stumpA(i){if(SJ.a!=null)return;SJ.a=i;const ok=i===SJ.q.correct;_rec(SJ.q,i);award(SJ.q,ok,ok?10:0);ok?(sfx('ok'),confetti(80)):sfx('bad');stumpQ();try{await DB(SJ.c+'/answers/'+G.pid,'PUT',{name:G.name,ok,t:Date.now()})}catch(e){}}

// Battle: players take turns; each question is timed; everyone watches; live scoreboard
const TURN=15000;let BT=null;
function battleHome(){if(!mpGuard())return;needName(()=>{stopPoll();M().innerHTML=`<div class="card center"><div style="font-size:50px">⚔️</div><h2>Battle</h2><p>2–8 players. Take turns answering timed questions. Faster right answers score more!</p>
 <button class="btn big" onclick="battleCreate()">Create a room</button><div class="or">or</div><input id="jc" maxlength="4" placeholder="ENTER CODE" class="code" autocapitalize="characters" autocomplete="off"><button class="btn alt" onclick="battleJoin($('#jc').value)">Join a room</button></div>`})}
async function battleCreate(){try{const c=await newRoom({mode:'battle',host:G.pid,state:'lobby',i:0,players:{[G.pid]:{name:G.name,score:0,j:Date.now()}}});battleLoop(c)}catch(e){mpErr(e)}}
async function battleJoin(c){c=(c||'').toUpperCase().trim();if(!/^[A-Z]{4}$/.test(c))return toast('Codes are 4 letters');try{const r=await DB(c);if(!r||r.mode!=='battle')return toast('No battle with that code');
 if(r.state!=='lobby'&&!(r.players&&r.players[G.pid]))return toast('That battle already started');if(!(r.players&&r.players[G.pid]))await DB(c+'/players/'+G.pid,'PUT',{name:G.name,score:0,j:Date.now()});battleLoop(c)}catch(e){mpErr(e)}}
function battleLoop(c){BT={c,r:null,shown:-1,picked:null,lastAns:-1};const tick=()=>DB(c).then(r=>{if(!r)return mpErr('Room closed');BT.r=r;battleTick()}).catch(()=>{});tick();stopPoll();POLL=setInterval(tick,900)}
async function battleStart(){const r=BT.r,order=Object.entries(r.players).sort((a,b)=>a[1].j-b[1].j).map(x=>x[0]);const n=Math.min(20,order.length*5);
 const qids=shuf(BANK).slice(0,n).map(q=>q.id);await DB(BT.c,'PATCH',{state:'play',order,qids,i:0,dl:Date.now()+TURN});}
function board(r,hi){return `<div class="board">${Object.entries(r.players).sort((a,b)=>b[1].score-a[1].score).map(([id,p],k)=>`<div class="${id===hi?'act':''} ${id===G.pid?'me':''}"><span>${['🥇','🥈','🥉'][k]||'•'}</span><b>${esc(p.name)}</b><em>${p.score}</em></div>`).join('')}</div>`}
function battleTick(){const r=BT.r,me=G.pid;if(r.state==='lobby'){const ps=Object.entries(r.players||{});const host=r.host===me;
  M().innerHTML=`<div class="card center"><p>Room code</p><div class="bigcode">${BT.c}</div><button class="btn alt" onclick="shareCode('${BT.c}','Join my Parli Pro battle! Code: ${BT.c}')">📤 Invite</button></div><div class="card"><h3 style="margin-top:0">Players (${ps.length})</h3>${ps.map(([id,p])=>`<div class="res">${id===r.host?'👑':'🙋'} ${esc(p.name)}${id===me?' (you)':''}</div>`).join('')}
  ${host?`<button class="btn big" ${ps.length<2?'disabled':''} onclick="battleStart()">${ps.length<2?'Waiting for players…':'Start battle!'}</button>`:'<p class="muted">Waiting for the host to start…</p>'}<button class="btn alt" onclick="stopPoll();play()">Leave</button></div>`;return}
 if(r.state==='done'||r.i>=r.qids.length){if(BT.shown!=='done'){BT.shown='done';stopPoll();const top=Object.entries(r.players).sort((a,b)=>b[1].score-a[1].score);const win=top[0][0]===me;if(win){badge('battle');confetti(200);sfx('level');gain(50)}else sfx('end');
  if(r.state!=='done'&&r.host===me)DB(BT.c+'/state','PUT','done').catch(()=>{});
  M().innerHTML=`<div class="card center"><div style="font-size:60px">${win?'🏆':'⚔️'}</div><h2>${win?'You win!':esc(top[0][1].name)+' wins!'}</h2>${board(r)}<button class="btn" onclick="battleHome()">New battle</button><button class="btn alt" onclick="play()">Home</button></div>`}return}
 const i=r.i,who=r.order[i%r.order.length],q=prep(byId(r.qids[i]),false),mine=who===me,ans=r.answers&&r.answers[i];
 // whoever is host advances the game when time runs out
 if(!ans&&Date.now()>r.dl+1500&&r.host===me)DB(BT.c,'PATCH',{['answers/'+i]:{pid:who,a:-1,ok:false},i:i+1,dl:Date.now()+TURN+2500}).catch(()=>{});
 const prev=r.answers&&r.answers[i-1];const pq=i>0?prep(byId(r.qids[i-1]),false):null;
 if(prev&&BT.lastAns!==i-1){BT.lastAns=i-1;if(prev.pid!==me){prev.ok?sfx('ok'):sfx('bad')}}
 if(BT.shown!==i){BT.shown=i;BT.picked=null}
 const left=Math.max(0,Math.ceil((r.dl-Date.now())/1000));
 M().innerHTML=`<div class="card"><div class="qtop"><span>Q ${i+1}/${r.qids.length}</span><span class="timer ${left<=5?'hot':''}">${Math.min(15,left)}</span></div>
 <div class="turn ${mine?'mine':''}">${mine?'🎯 YOUR TURN!':'👀 '+esc(r.players[who].name)+' is answering…'}</div>
 ${mine&&BT.picked==null?qhtml(q,null,{onpick:'battleA'}):`<h3 class="qtext">${esc(q.q)}</h3>${q.opts.map((o,k)=>`<div class="opt dim">${q.type==='MC'?'<i>'+'ABCDE'[k]+'</i> ':''}${esc(o)}</div>`).join('')}`}
 ${pq&&prev?`<div class="exp ${prev.ok?'good':'nope'}"><b>Last question — ${esc(r.players[prev.pid].name)}: ${prev.ok?'✅ correct (+'+prev.pts+')':prev.a<0?'⏰ out of time':'❌ missed'}</b><br>${why(pq)}</div>`:''}</div>${board(r,who)}`}
async function battleA(k){if(BT.picked!=null)return;BT.picked=k;const r=BT.r,i=r.i,q=prep(byId(r.qids[i]),false),ok=k===q.correct;const pts=ok?100+Math.max(0,Math.round((r.dl-Date.now())/150)):0;
 _rec(q,k);award(q,ok,ok?5:0);ok?(sfx('ok'),confetti(60)):sfx('bad');
 try{await DB(BT.c,'PATCH',{['answers/'+i]:{pid:G.pid,a:k,ok,pts},['players/'+G.pid+'/score']:(r.players[G.pid].score||0)+pts,i:i+1,dl:Date.now()+TURN+2500})}catch(e){toast('Connection hiccup — retrying');BT.picked=null}}
