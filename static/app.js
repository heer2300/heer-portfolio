const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=u=>/^(https?:|mailto:|tel:)/i.test(u||'')?u:'';
const ss={get:k=>{try{return sessionStorage.getItem(k)||''}catch(e){return ''}},set:(k,v)=>{try{v?sessionStorage.setItem(k,v):sessionStorage.removeItem(k)}catch(e){}}};
let S,TOK=ss.get('tok');
async function api(p,body,raw){const h={...(TOK?{Authorization:'Bearer '+TOK}:{})};if(!raw)h['Content-Type']='application/json';
 const r=await fetch(p,{method:body?'POST':'GET',headers:h,body:body?(raw?body:JSON.stringify(body)):undefined});
 if(r.status===401&&TOK&&p!=='/api/login'){TOK='';ss.set('tok','');$('#adm').classList.remove('open');openLogin()}return r}
const COL=['#e9a35e','#c9563f','#8fc08a','#c8c8c4'];
const hx=s=>{let h=0;for(const ch of s)h=(h*31+ch.charCodeAt(0))>>>0;return h};
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
function tilt(d,flip){const k=flip?24:14;d.onpointermove=e=>{if(flip&&d.classList.contains('flip'))return;const r=d.getBoundingClientRect();d.style.setProperty('--y',((e.clientX-r.left)/r.width-.5)*k+'deg');d.style.setProperty('--x',-((e.clientY-r.top)/r.height-.5)*k+'deg')};d.onpointerleave=()=>{d.style.setProperty('--x','0deg');d.style.setProperty('--y','0deg')}}
/* render */
const term='> boot heer.sys\n> loading skills...\n  python  n8n  web  BI\n> status: ready_\n';
function hero(){$('#nm').innerHTML=esc(S.name).replace(' ','<br>');$('#tag').textContent=S.tag;
 $('#frame').innerHTML=S.hero?`<img src="${esc(S.hero)}" alt="Hero">`:'<div class="crt"><pre id="tp"></pre></div>';
 clearInterval(window.tt);if(!S.hero){let i=0;const p=$('#tp');window.tt=setInterval(()=>{p.textContent=term.slice(0,i++%(term.length+14))},90)}}
function hero2(){$('#h2t').textContent=S.h2t;$('#h2s').textContent=S.h2s;const a=$('#h2art');a.style.backgroundImage=S.h2i?`url('${S.h2i}')`:'';a.textContent=S.h2i?'':'</>';
 const r=$('#rbtn');if(S.resume){r.href=S.resume;r.setAttribute('download',S.resumeName||'Resume');r.style.display=''}else r.style.display='none'}
function socials(){const L=[...S.socials.filter(s=>safeUrl(s.u)&&s.l),{l:'Email',u:'mailto:'+S.email}];
 const h=L.map(s=>`<a href="${esc(s.u)}" ${s.u.startsWith('http')?'target="_blank" rel="noopener noreferrer"':''}>${esc(s.l)} ↗</a>`).join('');
 const res=S.resume?`<a class="res" href="${esc(S.resume)}" download="${esc(S.resumeName||'Resume')}">⬇ Resume</a>`:'';$('#soc1').innerHTML=res+h;$('#soc2').innerHTML=h}
function about(){$('#abt').textContent=S.about;$('#tlb').innerHTML=S.timeline.map(x=>`<div><b>${esc(x.t)}</b><em>${esc(x.m)}</em></div>`).join('')}
function skills(){const g=$('#skg');g.innerHTML='';S.skills.forEach((k,n)=>{const d=document.createElement('div');d.className='sg';d.style.setProperty('--c',COL[n%4]);
 d.innerHTML=`<div class="sh"><span>${String(n+1).padStart(2,'0')}</span><span>${esc(k.g)}</span></div><div class="si">${k.items.map(i=>`<span>${esc(i)}</span>`).join('')}</div>`;tilt(d);g.appendChild(d);io.observe(d)})}
function cards(){const g=$('#cards');g.innerHTML='';S.cats.forEach((c,n)=>{const d=document.createElement('div');d.className='card';d.style.setProperty('--c',COL[n%4]);
 const h=hx(c.id+c.t),hex='#'+h.toString(16).toUpperCase().padStart(6,'0').slice(0,6),no=String(n+1).padStart(2,'0'),L=c.t.length,fs=L<=10?32:L<=16?27:L<=24?23:20;
 const bars=[0,1,2,3].map(i=>`<i style="height:${30+((h>>(i*4))&15)*4}%"></i>`).join('');
 d.innerHTML=`<div class="in-f"><div class="face pc"><div class="pt"><span>${no}</span><span>PORTFOLIO '26</span></div><div class="ttl" style="font-size:${fs}px">${esc(c.t)}<b></b></div>
 <div class="body"><div class="art" style="${c.cover?`background-image:url('${esc(c.cover)}')`:''}">${c.cover?'':esc(c.i)}</div><div class="mt">${bars}</div></div>
 <div class="spec"><p>PROJECTS <u>${c.p.length}</u></p><p>CAT ID <u>${esc(c.id.slice(0,4).toUpperCase())}</u></p></div>
 <div class="pf"><span>${hex}</span><s></s><strong>↗</strong></div></div>
 <div class="face back"><div class="pt"><span>${no}</span><span>${esc(c.t.toUpperCase())}</span></div>${c.p.length?c.p.map((p,i)=>`<div class="pj"><span class="n">${String(i+1).padStart(2,'0')}</span>${p.img?`<img src="${esc(p.img)}" alt="">`:''}<div class="tx"><h5>${esc(p.t)}</h5><p>${esc(p.d)}${safeUrl(p.u)?` <a href="${esc(p.u)}" target="_blank" rel="noopener noreferrer">↗ view</a>`:''}</p></div></div>`).join(''):'<p style="font-size:12px">No projects yet.</p>'}</div></div>`;
 d.onclick=e=>{if(e.target.closest('a'))return;d.classList.toggle('flip')};tilt(d,1);g.appendChild(d);io.observe(d)})}
function certs(){const g=$('#certg');if(!S.certs.length){g.innerHTML='<div class="cert empty"><b>Certificates coming soon</b></div>';return}g.innerHTML='';
 S.certs.forEach((c,n)=>{const d=document.createElement('div');d.className='cert';d.style.setProperty('--c',COL[(n+2)%4]);
 d.innerHTML=`<div class="pt"><span>CERT ${String(n+1).padStart(2,'0')}</span><span>${esc(c.y)}</span></div><div class="ct">${esc(c.t)}</div><div class="cimg" style="${c.img?`background-image:url('${esc(c.img)}')`:''}">${c.img?'':'★'}</div><div class="pf"><span>${esc(c.by)}</span><s></s><strong>↗</strong></div>`;
 d.onclick=()=>{if(c.img){$('#lbi').src=c.img;const l=$('#lbl');l.style.display=safeUrl(c.u)?'':'none';l.href=safeUrl(c.u)||'#';$('#lb').classList.add('open')}else if(safeUrl(c.u))window.open(c.u,'_blank','noopener')};
 tilt(d);g.appendChild(d);io.observe(d)})}
$('#lb').onclick=e=>{if(!e.target.closest('a'))$('#lb').classList.remove('open')};
/* admin */
let st;const msg=t=>$('#ms').textContent=t;
const save=()=>{msg('Saving…');clearTimeout(st);st=setTimeout(async()=>{const r=await api('/api/data',S);msg(r.ok?'Saved ✓':'Save failed')},400)};
function admin(){$('#ac').innerHTML=S.cats.map(c=>`<option value="${esc(c.id)}">${esc(c.t)}</option>`).join('');
 $('#an').value=S.name;$('#at').value=S.tag;$('#ae').value=S.email;$('#a2t').value=S.h2t;$('#a2s').value=S.h2s;$('#aab').value=S.about;
 $('#tll').innerHTML=S.timeline.map((x,i)=>`<div class="sr"><input data-tl="${i}" data-f="t" value="${esc(x.t)}" placeholder="Role · Place"><input data-tl="${i}" data-f="m" value="${esc(x.m)}" placeholder="Dates"><button data-dt="${i}">✕</button></div>`).join('');
 $('#skl').innerHTML=S.skills.map((x,i)=>`<div class="sgrp"><input data-sg="${i}" data-f="g" value="${esc(x.g)}" placeholder="Group name"><textarea data-sg="${i}" data-f="items" rows="4" placeholder="One skill per line">${esc(x.items.join('\n'))}</textarea><button data-dg="${i}">Delete group</button></div>`).join('');
 $('#rn').textContent=S.resume?'Current: '+(S.resumeName||'resume'):'No resume uploaded';
 $('#sl').innerHTML=S.socials.map((s,i)=>`<div class="sr"><input data-s="${i}" data-f="l" value="${esc(s.l)}" placeholder="Label"><input data-s="${i}" data-f="u" value="${esc(s.u)}" placeholder="https://…"><button data-ds="${i}">✕</button></div>`).join('');
 $('#cl').innerHTML=S.cats.map((c,i)=>`<div class="row"><span>${esc(c.i)} ${esc(c.t)}</span><span><label style="cursor:pointer;margin-right:6px">cover<input type="file" accept="image/*" data-cv="${i}" hidden></label><button data-dc="${i}">✕</button></span></div>`).join('');
 $('#pl').innerHTML=S.cats.flatMap((c,ci)=>c.p.map((p,i)=>`<div class="row"><span>${esc(c.t)}: ${esc(p.t)}</span><button data-dp="${ci}-${i}">✕</button></div>`)).join('');
 $('#cel').innerHTML=S.certs.map((c,i)=>`<div class="row"><span>${esc(c.t)}</span><button data-dcert="${i}">✕</button></div>`).join('')}
const all=()=>{hero();hero2();socials();about();skills();cards();certs();admin();music()};
function resize(f){return new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const m=Math.min(1,1400/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*m;c.height=im.height*m;c.getContext('2d').drawImage(im,0,0,c.width,c.height);ok(c.toDataURL('image/webp',.85))};im.onerror=no;im.src=r.result};r.readAsDataURL(f)})}
async function up(f){msg('Uploading…');const r=await api('/api/upload',{data:await resize(f)});if(!r.ok){msg('Upload failed');throw 0}return (await r.json()).url}
async function upRaw(url,f,max){if(f.size>max*1048576){alert('Max '+max+' MB');throw 0}msg('Uploading…');const r=await api(url,f,true);const d=await r.json().catch(()=>({}));if(!r.ok){msg(d.error||'Upload failed');alert(d.error||'Upload failed');throw 0}return d.url}
$('#adminlink').onclick=e=>{e.preventDefault();if(TOK){$('#adm').classList.add('open');loadSmtp()}else openLogin()};
function openLogin(){$('#ls').textContent='';$('#pw').value='';$('#modal').classList.add('open');$('#pw').focus()}
$('#lc').onclick=()=>$('#modal').classList.remove('open');
async function login(){const r=await api('/api/login',{password:$('#pw').value});const d=await r.json().catch(()=>({}));
 if(r.ok){TOK=d.token;ss.set('tok',TOK);$('#modal').classList.remove('open');$('#adm').classList.add('open');msg('Changes save automatically.');loadSmtp()}else $('#ls').textContent=d.error||'Login failed'}
$('#lg').onclick=login;$('#pw').onkeydown=e=>{if(e.key==='Enter')login()};
$('#x').onclick=()=>$('#adm').classList.remove('open');$('#lo').onclick=()=>{TOK='';ss.set('tok','');$('#adm').classList.remove('open')};
[['an','name'],['at','tag'],['ae','email'],['a2t','h2t'],['a2s','h2s'],['aab','about']].forEach(([i,k])=>$('#'+i).oninput=e=>{S[k]=e.target.value;save();hero();hero2();socials();about()});
$('#ah').onchange=async e=>{try{S.hero=await up(e.target.files[0]);save();hero()}catch(x){}};$('#rh').onclick=()=>{S.hero='';save();hero()};
$('#a2i').onchange=async e=>{try{S.h2i=await up(e.target.files[0]);save();hero2()}catch(x){}};$('#r2').onclick=()=>{S.h2i='';save();hero2()};
$('#rf').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{S.resume=await upRaw('/api/resume',f,10);S.resumeName=f.name;save();hero2();socials();admin()}catch(x){}e.target.value=''};
$('#rr').onclick=()=>{S.resume='';S.resumeName='';save();hero2();socials();admin()};
$('#tll').oninput=e=>{const t=e.target;S.timeline[t.dataset.tl][t.dataset.f]=t.value;save();about()};
$('#tll').onclick=e=>{const b=e.target.closest('[data-dt]');if(b){S.timeline.splice(b.dataset.dt,1);save();all()}};
$('#tla').onclick=()=>{S.timeline.push({t:'',m:''});all()};
$('#skl').oninput=e=>{const t=e.target,k=S.skills[t.dataset.sg];if(!k)return;if(t.dataset.f==='g')k.g=t.value;else k.items=t.value.split('\n').map(x=>x.trim()).filter(Boolean);save();skills()};
$('#skl').onclick=e=>{const b=e.target.closest('[data-dg]');if(b&&confirm('Delete this skill group?')){S.skills.splice(b.dataset.dg,1);save();all()}};
$('#ska').onclick=()=>{S.skills.push({g:'New group',items:[]});all()};
$('#sl').oninput=e=>{const t=e.target;S.socials[t.dataset.s][t.dataset.f]=t.value;save();socials()};
$('#sl').onclick=e=>{const b=e.target.closest('[data-ds]');if(b){S.socials.splice(b.dataset.ds,1);save();all()}};
$('#sa').onclick=()=>{S.socials.push({l:'',u:''});all()};
$('#ca').onclick=()=>{const t=$('#cn2').value.trim();if(!t)return;S.cats.push({id:'c'+Date.now().toString(36),t,i:$('#cg').value||'★',cover:'',p:[]});$('#cn2').value='';save();all()};
$('#cl').onclick=e=>{const b=e.target.closest('[data-dc]');if(b&&confirm('Delete this category and all its projects?')){S.cats.splice(b.dataset.dc,1);save();all()}};
$('#cl').onchange=async e=>{const i=e.target.dataset.cv;if(i===undefined)return;try{S.cats[i].cover=await up(e.target.files[0]);save();cards()}catch(x){}};
let pimg='',cimg='';$('#pi').onchange=async e=>{try{pimg=await up(e.target.files[0]);msg('Image ready')}catch(x){}};
$('#pa').onclick=()=>{const t=$('#pt').value.trim(),c=S.cats.find(c=>c.id===$('#ac').value);if(!t||!c)return;c.p.push({t,d:$('#pd').value,u:$('#pu').value.trim(),img:pimg});pimg='';['pt','pd','pu','pi'].forEach(i=>$('#'+i).value='');save();all()};
$('#pl').onclick=e=>{const b=e.target.closest('[data-dp]');if(!b)return;const [c,i]=b.dataset.dp.split('-');S.cats[c].p.splice(i,1);save();all()};
$('#cim').onchange=async e=>{try{cimg=await up(e.target.files[0]);msg('Image ready')}catch(x){}};
$('#cadd').onclick=()=>{const t=$('#ct').value.trim();if(!t)return;S.certs.push({t,by:$('#cb').value,y:$('#cy').value,u:$('#cu').value.trim(),img:cimg});cimg='';['ct','cb','cy','cu','cim'].forEach(i=>$('#'+i).value='');save();all()};
$('#cel').onclick=e=>{const b=e.target.closest('[data-dcert]');if(b){S.certs.splice(b.dataset.dcert,1);save();all()}};
$('#cp').onclick=async()=>{const r=await api('/api/password',{old:$('#op').value,new:$('#np').value});if(r.ok){alert('Password changed. Please log in again.');TOK='';ss.set('tok','');location.reload()}else alert((await r.json()).error||'Failed')};
/* hero tilt */
function stageTilt(sec,el){sec.onpointermove=e=>{const r=sec.getBoundingClientRect();el.style.setProperty('--ry',(((e.clientX-r.left)/r.width-.5)*14)+'deg');el.style.setProperty('--rx',(-((e.clientY-r.top)/r.height-.5)*10)+'deg')};sec.onpointerleave=()=>{el.style.setProperty('--ry','0deg');el.style.setProperty('--rx','0deg')}}
stageTilt($('#hero'),$('#stage'));stageTilt($('#hero2'),$('#h2stage'));
/* bug hunt */
const G=$('#game');for(let i=0;i<9;i++){const h=document.createElement('div');h.className='hole';G.appendChild(h)}
let sc=0,tl=20,best=0,tick,spawn,cur=null;try{best=+localStorage.getItem('hp_best')||0}catch(e){}$('#bs').textContent=best;
G.onpointerdown=e=>{if(e.target===cur&&cur.textContent){cur.textContent='💥';sc++;$('#sc').textContent=sc;cur=null}};
$('#go').onclick=()=>{clearInterval(tick);clearInterval(spawn);sc=0;tl=20;$('#sc').textContent=0;$('#tm').textContent=20;
 spawn=setInterval(()=>{[...G.children].forEach(h=>h.textContent='');cur=G.children[Math.random()*9|0];cur.textContent='🐛'},650);
 tick=setInterval(()=>{$('#tm').textContent=--tl;if(tl<=0){clearInterval(tick);clearInterval(spawn);[...G.children].forEach(h=>h.textContent='');if(sc>best){best=sc;try{localStorage.setItem('hp_best',best)}catch(e){}$('#bs').textContent=best}}},1000)};
/* contact */
$('#send').onclick=async()=>{const n=$('#cn').value.trim(),e=$('#ce').value.trim(),m=$('#cm').value.trim(),b=$('#send');
 if(!n||!m){$('#cs').textContent='Please add your name and a message.';return}
 b.disabled=true;b.textContent='Sending…';$('#cs').textContent='';
 try{const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:n,email:e,message:m})});
  const d=await r.json().catch(()=>({}));
  if(r.ok){$('#cs').textContent='Sent — thanks! I\u2019ll get back to you soon.';$('#cn').value=$('#ce').value=$('#cm').value=''}
  else{$('#cs').innerHTML=esc(d.error||'Could not send.')+' Try <a href="mailto:'+esc(S.email)+'" style="color:var(--lab)">emailing directly</a>.'}
 }catch(x){$('#cs').innerHTML='Network error. Try <a href="mailto:'+esc(S.email)+'" style="color:var(--lab)">emailing directly</a>.'}
 b.disabled=false;b.textContent='Send message ✉'};
$('#copy').onclick=async()=>{try{await navigator.clipboard.writeText(S.email);$('#cs').textContent='Copied '+S.email}catch(e){$('#cs').textContent=S.email}};
/* admin: smtp + backup */
async function loadSmtp(){if(!TOK)return;try{const r=await api('/api/smtp');if(!r.ok)return;const d=await r.json();$('#se').value=d.email||'';$('#sst').textContent=d.has_password?'App password saved.':'No app password saved yet.'}catch(e){}}
$('#ssave').onclick=async()=>{const e=$('#se').value.trim(),p=$('#sp').value;$('#sst').textContent='Saving…';
 const r=await api('/api/smtp',{email:e,app_password:p});const d=await r.json().catch(()=>({}));
 $('#sst').textContent=r.ok?'Saved ✓':(d.error||'Failed');if(r.ok)$('#sp').value=''};
$('#bkp').onclick=async()=>{const r=await api('/api/backup',{});if(!r.ok){alert('Backup failed');return}
 const blob=await r.blob(),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='portfolio-backup.zip';a.click();URL.revokeObjectURL(u)};
/* toast, theme, music */
let tt2;const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(tt2);tt2=setTimeout(()=>e.classList.remove('on'),3200)};
const th=t=>{document.documentElement.dataset.theme=t;try{localStorage.setItem('hp_theme',t)}catch(e){}$('#thm').textContent=t==='dark'?'☀ Light':'☾ Dark'};
th(document.documentElement.dataset.theme||'dark');
$('#thm').onclick=()=>th(document.documentElement.dataset.theme==='dark'?'light':'dark');
const AU=new Audio();AU.loop=true;AU.volume=.5;
const mbtn=()=>$('#mus').textContent=AU.paused?'♫ Play':'❚❚ Pause';AU.onplay=AU.onpause=mbtn;
function music(){const cur=AU.getAttribute('data-u')||'',nu=S.music||'';if(cur!==nu){AU.pause();AU.setAttribute('data-u',nu);if(nu)AU.src=nu;else AU.removeAttribute('src')}
 $('#mn').textContent=nu?'Current: '+(S.musicName||'track'):'No track set';mbtn()}
$('#mus').onclick=()=>{if(!S.music){toast('No music yet. Add a track in the admin panel.');return}AU.paused?AU.play().catch(()=>toast('Could not play this file — try again')):AU.pause()};
$('#mf').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{S.music=await upRaw('/api/audio',f,25);S.musicName=f.name;save();music();AU.play().catch(()=>{})}catch(x){}e.target.value=''};
$('#mr').onclick=()=>{S.music='';S.musicName='';save();music()};
/* minesweeper: sized to fit the container width, no horizontal scroll */
const ME=$('#mine');let MW=16,MH=9,MN=20,started=0,over=0,opened=0,flags=0,secs=0,mtimer,fmode=0,mbest=0,B=[];try{mbest=+localStorage.getItem('hp_msbest')||0}catch(e){}
$('#mbest').textContent=mbest?mbest+'s':'–';
function calcGrid(){const wrap=$('.mwrap')||document.body;const avail=Math.max(240,wrap.clientWidth-8);
 const cell=avail<380?16:avail<560?20:avail<820?26:30;
 let cols=Math.max(10,Math.min(22,Math.floor(avail/cell)));
 const rows=cols>=18?9:cols>=14?8:7;
 return{cols,rows,mines:Math.max(8,Math.round(cols*rows*.16)),cell}}
const nbrs=i=>{const x=i%MW,y=i/MW|0,r=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if((dx||dy)&&X>=0&&X<MW&&Y>=0&&Y<MH)r.push(Y*MW+X)}return r};
function paint(i){const c=B[i],el=ME.children[i];el.className='ms'+(c.o?' o':'')+(c.f&&!c.o?' f':'')+(c.x?' x':'');
 if(c.o&&c.m){el.textContent='💣';el.removeAttribute('data-n')}else if(c.o){el.textContent=c.n||'';c.n?el.dataset.n=c.n:el.removeAttribute('data-n')}else{el.textContent=c.f?'🚩':'';el.removeAttribute('data-n')}}
function mnew(){clearInterval(mtimer);started=over=opened=flags=secs=0;
 const g=calcGrid();MW=g.cols;MH=g.rows;MN=g.mines;ME.style.setProperty('--cs',g.cell+'px');
 B=Array.from({length:MW*MH},()=>({m:0,o:0,f:0,n:0,x:0}));
 ME.style.gridTemplateColumns=`repeat(${MW},var(--cs))`;ME.innerHTML=B.map((_,i)=>`<div class="ms" data-i="${i}"></div>`).join('');
 $('#mleft').textContent=MN;$('#mtime').textContent=0;$('#mmsg').textContent=''}
let mrz;addEventListener('resize',()=>{clearTimeout(mrz);mrz=setTimeout(()=>{if(!started||over)mnew()},250)});
function place(safe){const sx=safe%MW,sy=safe/MW|0;let n=0;while(n<MN){const i=Math.random()*MW*MH|0,x=i%MW,y=i/MW|0;if(B[i].m||(Math.abs(x-sx)<=1&&Math.abs(y-sy)<=1))continue;B[i].m=1;n++}
 B.forEach((c,i)=>c.n=nbrs(i).filter(j=>B[j].m).length)}
function reveal(i){const st=[i];while(st.length){const k=st.pop(),c=B[k];if(c.o||c.f)continue;c.o=1;opened++;paint(k);if(!c.n&&!c.m)nbrs(k).forEach(j=>st.push(j))}}
function mflag(i){const c=B[i];if(c.o)return;c.f=!c.f;flags+=c.f?1:-1;$('#mleft').textContent=MN-flags;paint(i)}
function mend(win,i){over=1;clearInterval(mtimer);
 if(win){B.forEach((c,k)=>{if(c.m&&!c.f){c.f=1;paint(k)}});$('#mleft').textContent=0;$('#mmsg').textContent='BOARD CLEARED IN '+secs+'s!';if(!mbest||secs<mbest){mbest=secs;try{localStorage.setItem('hp_msbest',mbest)}catch(e){}$('#mbest').textContent=mbest+'s'}}
 else{B[i].x=1;B.forEach((c,k)=>{if(c.m){c.o=1;paint(k)}});$('#mmsg').textContent='BOOM! Try again.'}}
ME.onclick=e=>{const el=e.target.closest('.ms');if(!el||over)return;const i=+el.dataset.i,c=B[i];if(fmode){mflag(i);return}if(c.f||c.o)return;
 if(!started){started=1;place(i);mtimer=setInterval(()=>$('#mtime').textContent=++secs,1000)}
 if(c.m){mend(0,i);return}reveal(i);if(opened===MW*MH-MN)mend(1)};
ME.oncontextmenu=e=>{e.preventDefault();const el=e.target.closest('.ms');if(el&&!over)mflag(+el.dataset.i)};
$('#mnew').onclick=mnew;$('#mflag').onclick=()=>{fmode=!fmode;$('#mflag').textContent='⚑ Flag mode: '+(fmode?'on':'off')};mnew();
fetch('/api/data').then(r=>r.json()).then(d=>{S=d;const D={music:'',musicName:'',about:'',h2t:'',h2s:'',h2i:'',resume:'',resumeName:'',timeline:[],skills:[],certs:[]};for(const k in D)if(S[k]==null)S[k]=D[k];all()});
