// Native (iOS/Capacitor) features. No-ops on the web.
(function(){const C=window.Capacitor;if(!C||!C.isNativePlatform||!C.isNativePlatform())return;
const P=C.Plugins,H=P.Haptics,LN=P.LocalNotifications,SH=P.Share;
document.documentElement.classList.add('native');
const st=document.createElement('style');st.textContent='html,body{overscroll-behavior:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;touch-action:manipulation}input,textarea{-webkit-user-select:text;user-select:text}header{padding-top:env(safe-area-inset-top)}body{padding-bottom:env(safe-area-inset-bottom);padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right)}';document.head.appendChild(st);
const vp=document.querySelector('meta[name=viewport]');if(vp)vp.content='width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';
// Haptics on right/wrong
const _sfx=window.sfx;window.sfx=function(k){try{if(k==='ok')H.notification({type:'SUCCESS'});else if(k==='bad')H.notification({type:'ERROR'});}catch(e){}return _sfx.apply(this,arguments)};
// Native share sheet
window.shareCode=function(c,t){SH.share({title:'Parli Pro',text:t,dialogTitle:'Send your code'}).catch(()=>{})};
// Daily streak reminder (opt-in)
const KEY='pp_remind',ID=1001;const b=document.getElementById('bell');
function cfg(){try{return JSON.parse(localStorage.getItem(KEY))||{on:false,h:19,m:0}}catch(e){return{on:false,h:19,m:0}}}
async function sched(c){await LN.cancel({notifications:[{id:ID}]}).catch(()=>{});if(!c.on)return;
 await LN.schedule({notifications:[{id:ID,title:'🔨 Keep your streak alive!',body:'A 60-second Speed Round keeps your Parli Pro streak going.',schedule:{on:{hour:c.h,minute:c.m},allowWhileIdle:true}}]})}
function paint(){const c=cfg();b.textContent=c.on?'🔔':'🔕';b.title=c.on?'Reminder '+c.h+':'+String(c.m).padStart(2,'0'):'Reminders off'}
if(b){b.style.display='';paint();b.onclick=async()=>{const c=cfg();
 if(c.on){c.on=false;localStorage.setItem(KEY,JSON.stringify(c));await sched(c);paint();return window.toast&&toast('Streak reminder off')}
 const t=prompt('Daily streak reminder time (24h, HH:MM)',String(c.h).padStart(2,'0')+':'+String(c.m).padStart(2,'0'));if(!t)return;
 const mm=/^(\d{1,2}):(\d{2})$/.exec(t.trim());if(!mm||+mm[1]>23||+mm[2]>59)return window.toast&&toast('Use HH:MM, like 19:00');
 let p=await LN.checkPermissions();if(p.display!=='granted')p=await LN.requestPermissions();if(p.display!=='granted')return window.toast&&toast('Turn on notifications in Settings');
 c.on=true;c.h=+mm[1];c.m=+mm[2];localStorage.setItem(KEY,JSON.stringify(c));await sched(c);paint();window.toast&&toast('Reminder set for '+t.trim())}}
})();
