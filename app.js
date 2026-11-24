const SB_URL='https://yegevgtlwlebiqbzqjbp.supabase.co';
const SB_KEY='sb_publishable_cSCxE00EVabFMXOVAOS2Nw_98kToVML'; // çelës publik, i sigurt në faqe
const sb=supabase.createClient(SB_URL,SB_KEY);
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=p=>{let d=(p||'').replace(/\D/g,'');if(d.startsWith('0'))d='383'+d.slice(1);return d};
const opts=(a,ph)=>`<option value="">${ph}</option>`+a.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('');
let cats=[],cities=[],user=null;

async function init(){
  const [c,t]=await Promise.all([sb.from('categories').select().order('name'),sb.from('cities').select().order('name')]);
  cats=c.data||[];cities=t.data||[];
  const {data}=await sb.auth.getSession();user=data.session?.user||null;
  sb.auth.onAuthStateChange((_,s)=>{user=s?.user||null;nav()});
  addEventListener('hashchange',nav);nav();
}
function nav(){
  const h=location.hash.slice(1);
  $('#nav').innerHTML=user?'<a href="#profili">Profili im</a><a href="#" id="out">Dil</a>':'<a href="#hyr">Hyr si mjeshtër</a>';
  const o=$('#out');if(o)o.onclick=()=>sb.auth.signOut();
  if(h==='hyr')return login();
  if(h==='profili')return user?profile():(location.hash='hyr');
  home();
}
function home(){
  $('#app').innerHTML=`<section class="hero"><div class="wrap"><h1>Gjej mjeshtrin e duhur sot.</h1><p>Zgjidh profesionin dhe qytetin, pastaj telefono drejtpërdrejt.</p>
  <div class="filters"><label><span>Profesioni</span><select id="fc">${opts(cats,'Të gjitha profesionet')}</select></label><label><span>Qyteti</span><select id="fy">${opts(cities,'Të gjitha qytetet')}</select></label></div></div></section>
  <div class="wrap"><p class="count" id="count" aria-live="polite"></p><div class="list" id="list"><div class="state">Duke ngarkuar…</div></div></div>`;
  $('#fc').onchange=$('#fy').onchange=find;find();
}
async function find(){
  let q=sb.from('craftsmen').select('*,categories(name),cities(name)').eq('approved',true).order('created_at',{ascending:false});
  if($('#fc').value)q=q.eq('category_id',$('#fc').value);
  if($('#fy').value)q=q.eq('city_id',$('#fy').value);
  const {data,error}=await q;
  if(!$('#list'))return;
  $('#count').textContent=error||!data?'':data.length+(data.length===1?' mjeshtër':' mjeshtra');
  $('#list').innerHTML=error?'<div class="state"><strong>Nuk u ngarkuan mjeshtrat</strong>Rifresko faqen.</div>':!data.length?'<div class="state"><strong>Nuk u gjet asnjë mjeshtër</strong>Provo një qytet ose profesion tjetër.</div>':data.map(m=>`<article class="card"><div><h3>${esc(m.full_name)}</h3><div class="mut" style="margin-top:4px"><span class="tag">${esc(m.categories?.name)}</span>${esc(m.cities?.name)}</div></div>${m.description?`<p>${esc(m.description)}</p>`:''}<div class="acts"><a class="btn" href="tel:+${num(m.phone)}">Telefono</a><a class="btn wa" href="https://wa.me/${num(m.phone)}" target="_blank" rel="noopener">WhatsApp</a></div></article>`).join('');
}
function login(){
  $('#app').innerHTML=`<div class="wrap narrow"><h1>Je mjeshtër? Regjistrohu.</h1><p class="mut">Krijo llogari që klientët të të gjejnë dhe të të telefonojnë.</p>
  <form id="f"><input id="em" type="email" placeholder="Email" required autocomplete="email"><input id="pw" type="password" placeholder="Fjalëkalimi (të paktën 6 shkronja)" required minlength="6" autocomplete="current-password"><div class="btns"><button class="btn">Hyr</button><button class="btn ghost" type="button" id="up">Krijo llogari</button></div></form><p id="msg" class="mut"></p></div>`;
  const msg=t=>$('#msg').textContent=t,cr=()=>({email:$('#em').value,password:$('#pw').value});
  $('#f').onsubmit=async e=>{e.preventDefault();const {error}=await sb.auth.signInWithPassword(cr());error?msg('Email ose fjalëkalim i gabuar.'):location.hash='profili'};
  $('#up').onclick=async()=>{if(!$('#f').reportValidity())return;const {data,error}=await sb.auth.signUp(cr());error?msg(error.message):data.session?location.hash='profili':msg('Kontrollo email-in dhe kliko lidhjen e konfirmimit, pastaj hyr.')};
}
async function profile(){
  const {data:m}=await sb.from('craftsmen').select('*').eq('user_id',user.id).maybeSingle();
  $('#app').innerHTML=`<div class="wrap narrow"><h1>Profili im</h1><p class="mut">${m?(m.approved?'Profili yt është publik.':'Profili është në pritje të aprovimit.'):'Plotëso të dhënat që klientët të të gjejnë.'}</p>
  <form id="f"><input id="n" placeholder="Emri dhe mbiemri" required><select id="c" required>${opts(cats,'Profesioni')}</select><select id="y" required>${opts(cities,'Qyteti')}</select><input id="p" type="tel" placeholder="Telefoni, p.sh. 044 123 456" required><textarea id="d" rows="4" placeholder="Shkruaj shkurt çfarë pune bën"></textarea><button class="btn">Ruaj profilin</button></form><p id="msg" class="mut"></p></div>`;
  if(m){$('#n').value=m.full_name;$('#c').value=m.category_id;$('#y').value=m.city_id;$('#p').value=m.phone;$('#d').value=m.description||''}
  $('#f').onsubmit=async e=>{e.preventDefault();
    const row={full_name:$('#n').value,category_id:+$('#c').value,city_id:+$('#y').value,phone:$('#p').value,description:$('#d').value};
    const {error}=m?await sb.from('craftsmen').update(row).eq('id',m.id):await sb.from('craftsmen').insert({...row,user_id:user.id});
    $('#msg').textContent=error?'Nuk u ruajt: '+error.message:'Profili u ruajt. Shfaqet publikisht pasi të aprovohet.'};
}
init();
