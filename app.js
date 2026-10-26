let BANK=[],T=null;const $=s=>document.querySelector(s),M=()=>$('#m');
const S=JSON.parse(localStorage.pp||'{"seen":[],"missed":{},"hist":[]}');const save=()=>localStorage.pp=JSON.stringify(S);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const TOP=()=>[...new Set(BANK.map(q=>q.topic))].sort();
function prep(q,shuffle){const o={...q};if(q.type==='TF'){o.opts=['True','False'];o.correct=q.ans==='T'?0:1}
 else{let idx=q.choices.map((_,i)=>i);const fixed=q.choices.some(c=>/(all|none|both) of the above|^[A-D] and [A-D]/i.test(c));if(shuffle&&!fixed)idx=shuf(idx);o.opts=idx.map(i=>q.choices[i]);o.correct=idx.indexOf(q.ans)}return o}
function why(q){let s='<b>Answer:</b> '+esc(q.opts[q.correct]).replace(/\.$/,'')+'.';if(q.exp&&q.exp!==q.q)s+=(q.type==='TF'&&q.ans==='F'?' <b>Correct statement:</b> ':' ')+esc(q.exp.replace(/\s*\(RONR topic:[^)]*\)\s*$/,''));
 return s+(q.section?'<div class="muted">RONR topic: '+esc(q.section)+'</div>':'')}
function pick({n,mix,topics,fresh}){let pool=BANK.filter(q=>topics.includes(q.topic));const seen=new Set(S.seen);
 const take=(arr,k)=>{let a=shuf(arr);if(fresh){const un=a.filter(q=>!seen.has(q.id));a=un.length>=k?un:un.concat(a.filter(q=>seen.has(q.id)))}return a.slice(0,k)};
 const tf=pool.filter(q=>q.type==='TF'),mc=pool.filter(q=>q.type==='MC');let ntf=Math.round(n*mix/100);ntf=Math.min(ntf,tf.length);let nmc=Math.min(n-ntf,mc.length);
 return shuf(take(tf,ntf).concat(take(mc,nmc)))}
function gen(){M().innerHTML=`<div class="card"><h2 style="margin-top:0">Build a test</h2><div class="row"><div><label>Questions</label><input id="n" type="number" min="1" max="200" value="25" inputmode="numeric"></div>
<div><label>True/False share: <span id="mv">50</span>%</label><input id="mix" type="range" min="0" max="100" step="10" value="50" oninput="mv.textContent=this.value"></div>
<div><label>Options</label><label style="font-weight:400"><input type="checkbox" id="fresh" checked style="width:22px;min-height:22px"> Avoid questions I've already seen</label></div></div>
<label>Topics <button class="btn alt" style="min-height:36px;padding:4px 10px;font-size:14px" onclick="document.querySelectorAll('.tp').forEach(c=>c.checked=!c.checked)">Toggle all</button></label>
<div class="topics">${TOP().map(t=>`<label><input type="checkbox" class="tp" value="${esc(t)}" checked>${esc(t)} <span class="muted">(${BANK.filter(q=>q.topic===t).length})</span></label>`).join('')}</div>
<button class="btn" id="go">Take test online</button><button class="btn alt" id="pr">Printable test + answer key</button></div>
<p class="muted">${BANK.length} questions in the bank. Your progress is saved only on this device.</p>`;
 const opts=()=>({n:Math.max(1,+$('#n').value||25),mix:+$('#mix').value,fresh:$('#fresh').checked,topics:[...document.querySelectorAll('.tp:checked')].map(c=>c.value)});
 $('#go').onclick=()=>{const o=opts();if(!o.topics.length)return alert('Pick at least one topic');start(pick(o))};
 $('#pr').onclick=()=>{const o=opts();if(!o.topics.length)return alert('Pick at least one topic');printTest(pick(o))}}
function start(qs){if(!qs.length)return alert('No questions match.');T={qs:qs.map(q=>prep(q,true)),a:{},i:0,done:false};test()}
function test(){const q=T.qs[T.i],a=T.a[T.i];const st=i=>T.done?(i===q.correct?'ok':(a===i?'bad':'')):(a===i?'sel':'');
 M().innerHTML=`<div class="split"><div class="card qlist">${T.qs.map((x,i)=>`<button class="${T.done?(T.a[i]===x.correct?'ok':'bad'):(T.a[i]!=null?'ans':'')} ${i===T.i?'cur':''}" onclick="T.i=${i};test()">${i+1}</button>`).join('')}
 <div>${T.done?`<h3>Score: ${T.score}/${T.qs.length} (${Math.round(100*T.score/T.qs.length)}%)</h3>`:`<button class="btn" style="width:100%" onclick="finish()">Submit test</button>`}</div></div>
 <div class="card"><div class="muted">Question ${T.i+1} of ${T.qs.length} · ${q.type==='TF'?'True/False':'Multiple choice'} · ${esc(q.topic)}</div><h3>${esc(q.q)}</h3>
 ${q.opts.map((o,i)=>`<button class="opt ${st(i)}" onclick="ans(${i})">${q.type==='MC'?'ABCDE'[i]+'. ':''}${esc(o)}</button>`).join('')}
 ${a!=null&&(T.done||T.instant)?`<div class="exp">${a===q.correct?'✅ Correct. ':'❌ Not quite. '}${why(q)}</div>`:''}
 <label style="font-weight:400"><input type="checkbox" style="width:22px;min-height:22px" ${T.instant?'checked':''} onchange="T.instant=this.checked;test()"> Show feedback right away</label>
 <div class="row"><button class="btn alt" ${T.i?'':'disabled'} onclick="T.i--;test()">‹ Prev</button><button class="btn" ${T.i<T.qs.length-1?'':'disabled'} onclick="T.i++;test()">Next ›</button></div></div></div>`;scrollTo(0,0)}
function ans(i){if(T.done||(T.instant&&T.a[T.i]!=null))return;T.a[T.i]=i;if(T.instant)rec(T.qs[T.i],i);test()}
function rec(q,i){if(!S.seen.includes(q.id))S.seen.push(q.id);if(i===q.correct)delete S.missed[q.id];else S.missed[q.id]=(S.missed[q.id]||0)+1;save()}
function finish(){const un=T.qs.length-Object.keys(T.a).length;if(un&&!confirm(un+' unanswered. Submit anyway?'))return;T.done=true;T.score=0;
 T.qs.forEach((q,i)=>{if(T.a[i]===q.correct)T.score++;if(!T.instant||T.a[i]==null)rec(q,T.a[i])});S.hist.push({d:Date.now(),s:T.score,n:T.qs.length});save();T.i=0;test()}
function printTest(qs){const p=qs.map(q=>prep(q,true));const L='ABCDE';
 $('#print').innerHTML=`<h1>Parliamentary Procedure Test</h1><p>Name: ____________________ Date: __________ Score: ____ / ${p.length}</p>
 ${p.map((q,i)=>`<div class="pq"><b>${i+1}.</b> ${q.type==='TF'?'T&nbsp;&nbsp;F&nbsp;&nbsp; ':''}${esc(q.q)}${q.type==='MC'?'<br>'+q.opts.map((o,j)=>`&nbsp;&nbsp;${L[j]}) ${esc(o)}`).join('<br>'):''}</div>`).join('')}
 <p style="font-size:9pt">Tactical Edge Solutions · Parli Pro Test Generator · Based on Robert's Rules of Order Newly Revised</p>
 <div class="key"><h1>Answer Key (Advisor)</h1>${p.map((q,i)=>`<div class="pq"><b>${i+1}.</b> ${q.type==='TF'?(q.correct?'F':'T'):L[q.correct]}. <span style="font-size:10pt">${q.section?'RONR topic: '+esc(q.section):''}${q.exp&&q.exp!==q.q?' · '+esc(q.exp.replace(/\s*\(RONR topic:[^)]*\)\s*$/,'')):''}</span></div>`).join('')}</div>`;
 setTimeout(()=>print(),50)}
let F=null;function study(ids){const topics=TOP();M().innerHTML=`<div class="card"><h2 style="margin-top:0">Flashcards</h2><label>Topic</label><select id="st"><option value="">All topics</option>${topics.map(t=>`<option>${esc(t)}</option>`).join('')}</select><button class="btn" id="sb">Start</button></div><div id="fc"></div>`;
 $('#sb').onclick=()=>{const t=$('#st').value;F={qs:shuf(BANK.filter(q=>!t||q.topic===t)).map(q=>prep(q,false)),i:0,flip:false};card()};if(ids){F={qs:shuf(BANK.filter(q=>ids.includes(q.id))).map(q=>prep(q,false)),i:0};card()}}
function card(){const q=F.qs[F.i];if(!q){$('#fc').innerHTML='<div class="card">No cards.</div>';return}
 $('#fc').innerHTML=`<div class="card flash" onclick="F.flip=!F.flip;card()">${F.flip?`<div>${why(q)}</div>`:`<div>${esc(q.q)}${q.type==='MC'?'<div class="muted" style="margin-top:8px;text-align:left">'+q.opts.map((o,j)=>'ABCDE'[j]+'. '+esc(o)).join('<br>')+'</div>':''}<div class="muted">Tap to flip</div></div>`}</div>
 <div class="row"><button class="btn alt" onclick="F.i=(F.i-1+F.qs.length)%F.qs.length;F.flip=false;card()">‹ Prev</button><button class="btn" style="background:var(--bad)" onclick="S.missed['${q.id}']=(S.missed['${q.id}']||0)+1;save();F.i=(F.i+1)%F.qs.length;F.flip=false;card()">Still learning</button><button class="btn" style="background:var(--ok)" onclick="delete S.missed['${q.id}'];save();F.i=(F.i+1)%F.qs.length;F.flip=false;card()">Got it</button></div><p class="muted">Card ${F.i+1} of ${F.qs.length}</p>`}
function review(){const ids=Object.keys(S.missed);M().innerHTML=`<div class="card"><h2 style="margin-top:0">Missed questions (${ids.length})</h2>${ids.length?`<button class="btn" id="rt">Retest missed</button><button class="btn alt" id="rf">Flashcards</button>`:'<p>Nothing missed yet. Nice work!</p>'}</div>
 ${BANK.filter(q=>S.missed[q.id]).slice(0,100).map(q=>{const p=prep(q,false);return `<div class="card"><b>${esc(q.q)}</b><div class="exp">${why(p)}</div><span class="muted">Missed ${S.missed[q.id]}×</span></div>`}).join('')}`;
 if(ids.length){$('#rt').onclick=()=>start(shuf(BANK.filter(q=>S.missed[q.id])).slice(0,50));$('#rf').onclick=()=>{study(ids)}}}
function progress(){const h=S.hist,avg=h.length?Math.round(100*h.reduce((a,x)=>a+x.s,0)/h.reduce((a,x)=>a+x.n,0)):0;
 M().innerHTML=`<div class="card"><h2 style="margin-top:0">Your progress</h2><p>Tests taken: <b>${h.length}</b> · Average: <b>${avg}%</b> · Questions seen: <b>${S.seen.length}</b> of ${BANK.length} · Missed list: <b>${Object.keys(S.missed).length}</b></p>
 ${h.slice(-15).reverse().map(x=>`<div>${new Date(x.d).toLocaleString()} — ${x.s}/${x.n} (${Math.round(100*x.s/x.n)}%)</div>`).join('')}
 <button class="btn alt" onclick="if(confirm('Reset all progress on this device?')){localStorage.removeItem('pp');location.reload()}">Reset progress</button></div>`}
function about(){M().innerHTML=`<div class="card"><h2 style="margin-top:0">About</h2><p>Parli Pro Test Generator by <b>Tactical Edge Solutions</b>: practice tests for parliamentary procedure teams and advisors, based on <i>Robert's Rules of Order Newly Revised</i> (12th ed., 2020). Explanations name the RONR topic only.</p>
 <p>Works offline once loaded. On iPhone or iPad, tap Share → <b>Add to Home Screen</b>.</p><p class="muted">Not affiliated with or endorsed by the Robert's Rules Association or the National FFA Organization.</p></div>`}
const V={gen,study:()=>study(),review,progress,about};
$('#nav').onclick=e=>{const b=e.target.closest('button');if(!b)return;document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x===b));V[b.dataset.v]()};
fetch('bank.json').then(r=>r.json()).then(b=>{BANK=b;gen()});
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
