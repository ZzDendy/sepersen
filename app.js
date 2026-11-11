const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const K='sepersen:v2', esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let S; try{S=JSON.parse(localStorage.getItem(K))}catch{}
S=S||{}; S.days=S.days||{}; S.ide=S.ide||[]; S.niat=S.niat||[];
const RIT=['Bangun tanpa scroll','Minum air putih','Rapikan kasur','Taruh HP di luar kamar','Tulis jurnal 1 menit','Tidur sebelum larut'];
S.set=Object.assign({t:['07:00','12:00','19:00'],w:8,n:false,h:false,seen:false,rit:RIT.slice()},S.set);
if(!Array.isArray(S.set.rit)||S.set.rit.length!==6)S.set.rit=RIT.slice();
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch{}};
const dk=d=>new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
const T=dk(new Date()), blank=()=>({win:'',mood:'',m:[0,0,0],w:0,j:null,r:[0,0,0,0,0,0],calm:0,fokus:0,rem:0});
const D=(k=T)=>S.days[k]=Object.assign(blank(),S.days[k]);
const done=d=>[!!d.win,...d.m.map(Boolean),d.w>=S.set.w,...d.r.map((x,i)=>!!x&&!!(S.set.rit[i]||''))];
const N=11, buzz=p=>{if(S.set.h&&navigator.vibrate)navigator.vibrate(p)};
let tt; const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),2400)};
const flash=id=>{const e=$(id);e.hidden=false;setTimeout(()=>e.hidden=true,2600)};

const RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
function tween(el,to,ms=700){const from=+el.dataset.v||0;el.dataset.v=to;if(RM||from===to){el.textContent=to;return}const t0=performance.now();(function f(t){const p=Math.min(1,(t-t0)/ms),e=1-Math.pow(1-p,3);el.textContent=Math.round(from+(to-from)*e);if(p<1)requestAnimationFrame(f)})(t0)}
document.addEventListener('pointerdown',e=>{const b=e.target.closest('.btn,.ghost,.chip');if(!b||RM)return;const r=b.getBoundingClientRect(),z=Math.max(r.width,r.height)*2.2,s=document.createElement('span');s.className='rp';s.style.cssText=`width:${z}px;height:${z}px;left:${e.clientX-r.left-z/2}px;top:${e.clientY-r.top-z/2}px`;b.appendChild(s);setTimeout(()=>s.remove(),700)});

/* Orb: 11 segmen = 11 hal kecil */
const C=2*Math.PI*88, SEG=C/N-9;
$('#segs').innerHTML=[...Array(N)].map((_,i)=>`<circle class="sg" cx="110" cy="110" r="88" stroke-dasharray="${SEG} ${C-SEG}" transform="rotate(${i*360/N-88} 110 110)" style="--d:${i*80+200}ms"/>`).join('');
setTimeout(()=>$('#orb').classList.remove('boot'),1800);

function home(){
  const d=D(), h=new Date().getHours(), f=done(d), n=f.filter(Boolean).length;
  $('#greet').textContent=(h<11?'Selamat pagi':h<15?'Selamat siang':h<18?'Selamat sore':'Selamat malam')+' · '+new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long'});
  $$('.sg').forEach((s,i)=>s.classList.toggle('on',f[i]));
  tween($('#cnt'),n); $('#orb').style.setProperty('--p',n/N);
  ideList(); niatList();
  $('#win').value=d.win;
  S.set.rit.forEach((v,i)=>{const el=document.querySelector(`[data-rl="${i}"]`);if(!el)return;el.textContent=v||'Kosong, ketuk Ubah';const row=el.closest('.meal'),cb=row&&row.querySelector('input');if(cb){cb.disabled=!v;if(!v)cb.checked=false}el.style.opacity=v?'':'0.55'});
  const heavy=/lelah|berat/i.test(d.mood||'');
  document.body.classList.toggle('heavy',heavy);
  const hn=$('#heavyNote'),lama=winLama();
  if(heavy){hn.hidden=false;hn.textContent='Hari berat? Cukup win, makan, dan air. Ritual dan niat menunggu.'+(lama?' Kamu pernah: '+lama:'');}else hn.hidden=true;
  $$('#moods .chip').forEach(c=>c.setAttribute('aria-pressed',c.dataset.m===d.mood));
  $$('[data-meal]').forEach(c=>c.checked=!!d.m[c.dataset.meal]);
  $$('[data-r]').forEach(c=>c.checked=!!d.r[c.dataset.r]);
  $$('[data-t]').forEach(t=>t.textContent=S.set.t[t.dataset.t]);
  $('#wTxt').textContent=d.w+' dari '+S.set.w+' gelas';
  const gl=$('#glasses'), gn=Math.max(S.set.w,d.w);
  if(gl.children.length!==gn)gl.innerHTML=[...Array(gn)].map((_,i)=>`<button class="g" data-g="${i}" style="--k:${i}" aria-label="Gelas ${i+1}"><i></i></button>`).join('');
  [...gl.children].forEach((b,i)=>{b.classList.toggle('on',i<d.w);b.setAttribute('aria-pressed',i<d.w)});
}
function winLama(){const ks=Object.keys(S.days).filter(k=>k!==T&&S.days[k]&&S.days[k].win).sort().reverse();return ks.length?S.days[ks[0]].win:''}
$$('[data-rubah]').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();const i=+b.dataset.rubah,baru=prompt('Nama ritual ini (kosongkan untuk mematikan):',S.set.rit[i]||'');if(baru===null)return;S.set.rit[i]=baru.trim();save();home();toast(baru.trim()?'Ritual diubah.':'Ritual dimatikan.')});
$('#winSave').onclick=()=>{const v=$('#win').value.trim();if(!v)return toast('Tulis dulu satu hal kecilnya.');D().win=v;save();home();flash('#winOk');toast('Win tersimpan.')};
$('#moods').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;const d=D();d.mood=d.mood===b.dataset.m?'':b.dataset.m;save();home()};
$$('[data-meal]').forEach(c=>c.onchange=()=>{D().m[c.dataset.meal]=c.checked?1:0;save();home()});
$$('[data-r]').forEach(c=>c.onchange=()=>{D().r[c.dataset.r]=c.checked?1:0;save();home()});
$('#glasses').onclick=e=>{const b=e.target.closest('.g');if(!b)return;const d=D(),i=+b.dataset.g,was=d.w;d.w=d.w===i+1?i:i+1;save();home();if(was<S.set.w&&d.w>=S.set.w){buzz([40,60,40]);toast('Target air hari ini tercapai.')}};
$$('[data-go]').forEach(b=>b.onclick=()=>{const g=b.dataset.go;go(g==='fokus'?'bengong':g);if(g==='fokus')setMode('fokus')});

/* Ide kilat + Niat */
function ideList(){ $('#ideList').innerHTML=S.ide.length?[...S.ide].reverse().map((x,i)=>{const k=S.ide.length-1-i;return `<li><time>${fmt(x.k)}</time><span class="w">${esc(x.t)}</span><span class="row"><button class="ghost" data-ideok="${k}" style="min-height:44px;padding:8px 14px">Beres</button><button class="ghost" data-ideniat="${k}" style="min-height:44px;padding:8px 14px">Jadi niat</button><button class="ghost" data-iderm="${k}" style="min-height:44px;padding:8px 14px" aria-label="Hapus ide">Hapus</button></span></li>`}).join(''):'<li><span class="mut">Belum ada ide. Tulis yang barusan lewat.</span></li>' }
$('#ideSave').onclick=()=>{const v=$('#ide').value.trim();if(!v)return toast('Tulis dulu idenya satu baris.');S.ide.push({t:v,k:T});if(S.ide.length>50)S.ide=S.ide.slice(-50);save();$('#ide').value='';ideList();toast('Ide tersimpan.')};
$('#ideList').onclick=e=>{const ok=e.target.closest('[data-ideok]'),rm=e.target.closest('[data-iderm]'),ni=e.target.closest('[data-ideniat]');
if(ok){const x=S.ide[+ok.dataset.ideok];if(x){const d=D();if(!d.win)d.win=x.t;S.ide.splice(+ok.dataset.ideok,1);save();home();toast('Pindah jadi win hari ini.')}}
if(ni){const x=S.ide[+ni.dataset.ideniat];if(x){$('#niatApa').value=x.t;$('#niatJam').focus();$('#niatApa').scrollIntoView({block:'center',behavior:RM?'auto':'smooth'});toast('Isi jamnya, lalu Pasang pengingat.')}}
if(rm){S.ide.splice(+rm.dataset.iderm,1);save();home()}};

let niatUlang=false;
$('#niatUlang').onclick=e=>{niatUlang=!niatUlang;e.currentTarget.textContent=niatUlang?'Tiap hari':'Sekali saja';e.currentTarget.setAttribute('aria-pressed',niatUlang)};
function niatList(){ $('#niatList').innerHTML=S.niat.length?S.niat.map((x,i)=>`<li><time>${x.jam}</time><span class="w">${esc(x.apa)}${x.ulang?' · tiap hari':''}${x.bunyi?' · sudah bunyi':''}</span><span class="row"><button class="ghost" data-niatrm="${i}" style="min-height:44px;padding:8px 14px" aria-label="Hapus pengingat">Hapus</button></span></li>`).join(''):'<li><span class="mut">Belum ada niat. Contoh: masak nasi jam 17:30.</span></li>' }
function niatDaftar(i){ try{ const j=window.JadwalNiat; if(j&&j.simpan){ const x=S.niat[i]; j.simpan(String(i),x.apa,x.jam,!!x.ulang); return } }catch{} }
$('#niatSave').onclick=()=>{const apa=$('#niatApa').value.trim(),jam=$('#niatJam').value;if(!apa)return toast('Tulis dulu maunya apa.');if(!jam)return toast('Atur dulu jam berapa.');S.niat.push({apa,jam,ulang:niatUlang,bunyi:false});save();niatDaftar(S.niat.length-1);$('#niatApa').value='';flash('#niatOk');niatList();toast('Pengingat niat terpasang.')};
$('#niatList').onclick=e=>{const rm=e.target.closest('[data-niatrm]');if(!rm)return;const i=+rm.dataset.niatrm;try{const j=window.JadwalNiat;if(j&&j.hapus)j.hapus(String(i))}catch{}S.niat.splice(i,1);save();niatList()};
function niatCek(){const n=new Date(),hm=String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0');let ubah=false;S.niat.forEach((x,i)=>{if(x.jam!==hm||x.bunyi&&!x.ulang)return;if(x.bunyi&&x.ulang&&fired['n'+T+i])return;fired['n'+T+i]=1;toast(x.apa);buzz([60,60,60]);if(!window.JadwalNiat&&S.set.n&&'Notification' in window&&Notification.permission==='granted'){try{new Notification('Sepersen · niat',{body:x.apa})}catch{}}if(!x.ulang){x.bunyi=true;ubah=true}});if(ubah){save();niatList()}}
setInterval(niatCek,20000);

/* Jurnal */
const fmt=k=>new Date(k+'T00:00:00').toLocaleDateString('id-ID',{weekday:'short',day:'numeric',month:'short'});
function jurnal(){
  const j=D().j||{}; ['a','b','c'].forEach((k,i)=>$('#j'+(i+1)).value=j[k]||'');
  const ks=Object.keys(S.days).filter(k=>k!==T&&S.days[k].j).sort().reverse().slice(0,10);
  $('#hist').innerHTML=ks.length?ks.map(k=>{const j=S.days[k].j;return `<div class="hist"><time>${fmt(k)}</time><p>${esc(j.a||'')}</p><p>${esc(j.b||'')}</p><p>${esc(j.c||'')}</p></div>`}).join(''):'<p class="mut">Belum ada jurnal sebelumnya. Tulis yang pertama malam ini, cukup tiga kalimat.</p>';
}
$('#jSave').onclick=()=>{const j={a:$('#j1').value.trim(),b:$('#j2').value.trim(),c:$('#j3').value.trim()};if(!j.a&&!j.b&&!j.c)return toast('Isi minimal satu kalimat dulu.');const d=D();d.j=j;d.r[4]=1;save();flash('#jOk');buzz([60,40,60]);toast('Jurnal tersimpan.')};

/* Timer: 3 mode */
const M={
  bengong:{m:10,k:'calm',t:'Bengong 10 menit',go:'Mulai bengong',d:'Duduk diam, tatap tembok, tidak perlu melakukan apa pun.',ok:'Selesai. Sepuluh menit tanpa layar, itu sudah cukup.'},
  fokus:{m:15,k:'fokus',t:'Fokus 15 menit',go:'Mulai fokus',d:'Satu tugas saja. Notifikasi dimatikan, sisanya menunggu.',ok:'Selesai. Lima belas menit fokus, istirahat sebentar ya.'},
  rem:{m:10,k:'rem',t:'Rem 10 menit',go:'Mulai rem',d:'Berhenti sebentar: berdiri, minum, lihat yang jauh.',ok:'Selesai. Badanmu bilang terima kasih.'}
};
let mode='bengong', TOTAL=600, rem=600, end=0, iv=0; const CR=2*Math.PI*100;
$('#pr').style.strokeDasharray=CR;
const paint=()=>{const s=Math.max(0,Math.ceil(rem));$('#tShow').textContent=String(s/60|0).padStart(2,'0')+':'+String(s%60).padStart(2,'0');$('#pr').style.strokeDashoffset=CR*(1-rem/TOTAL)};
const ui=r=>{$('#timer').classList.toggle('run',r);$('#tStart').hidden=r;$('#tPause').hidden=!r;$('#tEnd').hidden=!(r||rem<TOTAL)};
function stop(){clearInterval(iv);iv=0}
function setMode(m){stop();mode=m;TOTAL=rem=M[m].m*60;$('#tTitle').textContent=M[m].t;$('#tDesc').textContent=M[m].d;$('#tStart').textContent=M[m].go;$('#tMsg').textContent='';$$('#modes button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===m));paint();ui(false)}
function finish(full){stop();const x=M[mode],min=full?x.m:Math.floor((TOTAL-rem)/60);D()[x.k]+=min;save();rem=TOTAL;paint();ui(false);$('#tStart').textContent=x.go;$('#tMsg').textContent=full?x.ok:'Selesai lebih awal. Tidak apa-apa, tetap dihitung.';if(full)buzz([200,100,200])}
$('#tStart').onclick=()=>{end=Date.now()+rem*1000;$('#tMsg').textContent='';iv=setInterval(()=>{rem=(end-Date.now())/1000;if(rem<=0){rem=0;finish(true)}else paint()},250);ui(true)};
$('#tPause').onclick=()=>{stop();ui(false);$('#tStart').textContent='Lanjut'};
$('#tEnd').onclick=()=>finish(false);
$('#modes').onclick=e=>{const b=e.target.closest('button');if(b&&b.dataset.mode!==mode)setMode(b.dataset.mode)};

/* Pengingat + izin */
const OS=window.NotifikasiAndroid||null, JADWAL=window.JadwalMakan||null;
/* Di APK alarm OS yang mengirim, jadi jangan dobel. */
function kabar(judul,isi){if(OS)return;if('Notification' in window&&Notification.permission==='granted'){try{new Notification(judul,{body:isi})}catch{}}}
function daftarJadwal(){if(JADWAL&&JADWAL.simpan){try{JADWAL.simpan(S.set.t[0],S.set.t[1],S.set.t[2])}catch{}}}
function ingat(){S.set.t.forEach((t,i)=>$('#s'+i).value=t);$('#sw').value=S.set.w;nstate()}
function nstate(){
  if(OS){let izin='';try{izin=OS.izinNotifikasi()}catch{}
    const on=izin==='granted';
    $('#nState').textContent=on?'Pengingat menyala. HP mengingatkan di jam makan, walau Sepersen ditutup.':'Pengingat mati. Ketuk Nyalakan pengingat, lalu izinkan notifikasi Sepersen.';
    $('#wNotifSt').textContent='Status: '+(on?'menyala':'mati');return}
  const p='Notification' in window?Notification.permission:'none', on=S.set.n&&p==='granted';
  $('#nState').textContent=p==='none'?'Pengingat bunyi di aplikasi saat Sepersen terbuka.':'Pengingat '+(p==='denied'?'diblokir. Izinkan lewat pengaturan browser.':on?'menyala. Bunyi saat Sepersen terbuka.':'mati. Nyalakan agar HP mengingatkan di jam makan.');
  $('#wNotifSt').textContent='Status: '+(p==='denied'?'ditolak':on?'menyala':'mati')}
async function reqNotif(){
  if(OS){try{OS.mintaIzin()}catch{};S.set.n=true;save();nstate();toast('Izinkan notifikasi Sepersen.');return}
  if(!('Notification' in window))return nstate();
  const p=await Notification.requestPermission();S.set.n=p==='granted';save();nstate()}
$('#notif').onclick=reqNotif; $('#wNotif').onclick=reqNotif;
document.addEventListener('visibilitychange',()=>{if(!document.hidden)nstate()});
$('#sSave').onclick=()=>{S.set.t=[0,1,2].map(i=>$('#s'+i).value||S.set.t[i]);S.set.w=Math.min(20,Math.max(1,+$('#sw').value||8));save();daftarJadwal();toast('Pengaturan tersimpan.')};

/* Cadangan: ekspor / impor JSON */
function cadangan(){return JSON.stringify(S,null,2)}
function simpanTeks(nama,teks,mime){
  try{if(window.UnduhAndroid&&window.UnduhAndroid.simpan){window.UnduhAndroid.simpan(nama,btoa(unescape(encodeURIComponent(teks))),mime);toast('Cadangan disimpan ke Unduhan.');return true}}catch{}
  try{const b=new Blob([teks],{type:mime}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=nama;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);toast('Cadangan terunduh.');return true}catch{return false}
}
$('#ekspor').onclick=()=>{if(!simpanTeks('sepersen-'+T+'.json',cadangan(),'application/json'))toast('Gagal membuat cadangan.')};
$('#imporBtn').onclick=()=>$('#imporFile').click();
$('#imporFile').onchange=()=>{const f=$('#imporFile').files[0];if(!f)return;const r=new FileReader();
r.onload=()=>{try{const o=JSON.parse(r.result);if(!o||typeof o!=='object'||!o.days)throw 0;
S=Object.assign({days:{},ide:[],niat:[]},o);
S.set=Object.assign({t:['07:00','12:00','19:00'],w:8,n:false,h:false,seen:true,rit:RIT.slice()},S.set);
if(!Array.isArray(S.set.rit)||S.set.rit.length!==6)S.set.rit=RIT.slice();
save();home();setMode(mode);ringkas();toast('Data dipulihkan dari cadangan.')}catch{toast('Berkas cadangan tidak dikenali.')}
$('#imporFile').value=''};
r.readAsText(f)};
const fired={}; setInterval(()=>{const n=new Date(),hm=String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0');S.set.t.forEach((t,i)=>{if(t!==hm||fired[T+i])return;fired[T+i]=1;const m=['sarapan','makan siang','makan malam'][i];toast('Waktunya '+m+'.');kabar('Sepersen','Waktunya '+m+'.')})},20000);
daftarJadwal(); setInterval(daftarJadwal,6e5);

/* Sambutan */
const closeWelcome=()=>{S.set.seen=true;save();$('#welcome').hidden=true};
$('#wBuzz').onclick=()=>{if(navigator.vibrate){navigator.vibrate(60);S.set.h=true;save();$('#wBuzzSt').textContent='Status: menyala'}else $('#wBuzzSt').textContent='Status: perangkat tidak mendukung'};
$('#wStart').onclick=closeWelcome; $('#wLater').onclick=closeWelcome;
if(!S.set.seen){$('#welcome').hidden=false;$('#wStart').focus()}

/* Ringkas */
function ringkas(){
  const ks=[...Array(7)].map((_,i)=>dk(new Date(Date.now()-(6-i)*864e5))), ds=ks.map(k=>Object.assign(blank(),S.days[k])), sum=f=>ds.reduce((a,d)=>a+f(d),0);
  $('#sumLine').textContent=ds.some(d=>done(d).some(Boolean))?'Tanpa skor, tanpa streak yang hangus. Ini hitungan jujurnya.':'Belum ada catatan minggu ini. Mulai dari satu win kecil hari ini.';
  $('#stats').innerHTML=[[sum(d=>d.win?1:0),'win kecil'],[sum(d=>d.j?1:0),'jurnal'],[sum(d=>d.w),'gelas air'],[sum(d=>d.r.filter(Boolean).length),'ritual beres'],[sum(d=>d.calm),'menit bengong'],[sum(d=>d.fokus),'menit fokus']].map(([n,l])=>`<div><div class="num">${n}</div><span>${l}</span></div>`).join('');
  $$('#stats .num').forEach(e=>{const v=+e.textContent;e.dataset.v=0;tween(e,v,900)});
  $('#bars').setAttribute('aria-label','Air putih 7 hari: '+ds.map((d,i)=>fmt(ks[i])+' '+d.w+' gelas').join(', '));
  $('#bars').innerHTML=ds.map((d,i)=>`<div class="b"><em>${d.w}</em><i class="${d.w>=S.set.w?'hit':''}" style="--k:${i};height:${d.w?Math.max(5,Math.min(100,d.w/S.set.w*100)):0}%"></i><time>${new Date(ks[i]+'T00:00:00').toLocaleDateString('id-ID',{weekday:'short'})}</time></div>`).join('');
  $('#wk').innerHTML=ks.map((k,i)=>`<li><time>${new Date(k+'T00:00:00').toLocaleDateString('id-ID',{weekday:'short'})}</time><span class="w">${ds[i].win?esc(ds[i].win):'<span class="mut">Belum ada catatan</span>'}</span><span class="pips" aria-label="${done(ds[i]).filter(Boolean).length} dari ${N}">${done(ds[i]).map(x=>`<i class="${x?'on':''}"></i>`).join('')}</span></li>`).reverse().join('');
}

/* Navigasi */
const views={home,jurnal,bengong:()=>{},ingat,ringkas};
function go(t){$$('main,section').forEach(s=>s.hidden=s.id!==t);$$('[data-tab]').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===t));views[t]();[...$('#'+t).children].forEach((c,i)=>c.style.setProperty('--i',i));$('#ind').style.transform='translateX('+100*$$('[data-tab]').findIndex(b=>b.dataset.tab===t)+'%)';scrollTo({top:0,behavior:RM?'auto':'smooth'})}
$$('[data-tab]').forEach(b=>b.onclick=()=>go(b.dataset.tab));
$('nav').insertAdjacentHTML('afterbegin','<i class="ind" id="ind" aria-hidden="true"></i>');
[...$('#home').children].forEach((c,i)=>c.style.setProperty('--i',i));
home(); setMode('bengong'); nstate();

/* Back Android: tutup sambutan atau kembali ke Hari Ini dulu. */
window.kembali=()=>{if(!$('#welcome').hidden){closeWelcome();return true}const aktif=$$('section').find(s=>!s.hidden);if(aktif&&aktif.id!=='home'){go('home');return true}return false};
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
