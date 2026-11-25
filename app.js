const SB_URL='https://yegevgtlwlebiqbzqjbp.supabase.co';
const SB_KEY='sb_publishable_cSCxE00EVabFMXOVAOS2Nw_98kToVML'; // çelës publik, i sigurt në faqe
const sb=supabase.createClient(SB_URL,SB_KEY);
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=p=>{let d=(p||'').replace(/\D/g,'');if(d.startsWith('0'))d='383'+d.slice(1);return d};
const opts=(a,ph)=>`<option value="">${ph}</option>`+a.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('');
const stars=r=>{const n=Math.round(+r||0);return '<span class="stars" aria-hidden="true">'+'★'.repeat(n)+'<i>'+'★'.repeat(5-n)+'</i></span>'};
const rating=m=>m.review_count?`<span class="rate">${stars(m.avg_rating)} <b>${(+m.avg_rating).toFixed(1)}</b> <span class="mut">(${m.review_count} ${m.review_count===1?'vlerësim':'vlerësime'})</span></span>`:'<span class="rate mut">Ende pa vlerësime</span>';
const date=d=>new Date(d).toLocaleDateString('sq-AL',{day:'numeric',month:'short',year:'numeric'});
let cats=[],cities=[],user=null;

async function init(){
  const [c,t]=await Promise.all([sb.from('categories').select().order('name'),sb.from('cities').select().order('name')]);
  cats=c.data||[];cities=t.data||[];
  const {data}=await sb.auth.getSession();user=data.session?.user||null;
  sb.auth.onAuthStateChange((ev,s)=>{const was=user?.id;user=s?.user||null;if(was!==user?.id)nav()});
  addEventListener('hashchange',nav);nav();
}
function nav(){
  const h=location.hash.slice(1);
  $('#nav').innerHTML=user?'<a href="#profili">Profili im</a><a href="#" id="out">Dil</a>':'<a href="#hyr">Hyr</a>';
  const o=$('#out');if(o)o.onclick=()=>sb.auth.signOut();
  scrollTo(0,0);
  if(h==='hyr')return login();
  if(h==='profili')return user?profile():needLogin('profili');
  if(h.startsWith('m/'))return detail(h.slice(2));
  home();
}
function needLogin(next){try{sessionStorage.setItem('next',next)}catch(e){}location.hash='hyr'}
function home(){
  $('#app').innerHTML=`<section class="hero"><div class="wrap"><h1>Gjej mjeshtrin e duhur sot.</h1><p>Zgjidh profesionin dhe qytetin, pastaj telefono drejtpërdrejt.</p>
  <div class="filters"><label><span>Profesioni</span><select id="fc">${opts(cats,'Të gjitha profesionet')}</select></label><label><span>Qyteti</span><select id="fy">${opts(cities,'Të gjitha qytetet')}</select></label></div></div></section>
  <div class="wrap"><div class="bar"><p class="count" id="count" aria-live="polite"></p><label class="sort"><span>Rendit</span><select id="fs"><option value="new">Më të rinjtë</option><option value="top">Më të vlerësuarit</option></select></label></div><div class="list" id="list"><div class="state">Duke ngarkuar…</div></div></div>`;
  $('#fc').onchange=$('#fy').onchange=$('#fs').onchange=find;find();
}
async function find(){
  let q=sb.from('craftsmen_public').select('*');
  q=$('#fs').value==='top'?q.order('avg_rating',{ascending:false}).order('review_count',{ascending:false}):q.order('created_at',{ascending:false});
  if($('#fc').value)q=q.eq('category_id',$('#fc').value);
  if($('#fy').value)q=q.eq('city_id',$('#fy').value);
  const {data,error}=await q;
  if(!$('#list'))return;
  $('#count').textContent=error||!data?'':data.length+(data.length===1?' mjeshtër':' mjeshtra');
  $('#list').innerHTML=error?'<div class="state"><strong>Nuk u ngarkuan mjeshtrat</strong>Rifresko faqen.</div>':!data.length?'<div class="state"><strong>Nuk u gjet asnjë mjeshtër</strong>Provo një qytet ose profesion tjetër.</div>':data.map(card).join('');
}
function contacts(m){return `<div class="acts"><a class="btn" href="tel:+${num(m.phone)}">Telefono</a><a class="btn wa" href="https://wa.me/${num(m.phone)}" target="_blank" rel="noopener">WhatsApp</a></div>`}
function card(m){
  return `<article class="card"><div><h3><a class="cl" href="#m/${m.id}">${esc(m.full_name)}</a></h3><div class="mut" style="margin-top:4px"><span class="tag">${esc(m.category_name)}</span>${esc(m.city_name)}</div><div style="margin-top:6px">${rating(m)}</div></div>${m.description?`<p class="clamp">${esc(m.description)}</p>`:''}${contacts(m)}</article>`;
}
async function detail(id){
  $('#app').innerHTML='<div class="wrap narrow">Duke ngarkuar…</div>';
  const [{data:m},{data:rv}]=await Promise.all([
    sb.from('craftsmen_public').select('*').eq('id',id).maybeSingle(),
    sb.from('reviews').select('*').eq('craftsman_id',id).order('created_at',{ascending:false})]);
  if(location.hash.slice(1)!=='m/'+id)return;
  if(!m){$('#app').innerHTML='<div class="wrap narrow"><h1>Mjeshtri nuk u gjet</h1><p class="mut">Profili mund të jetë hequr.</p><a class="btn" href="#">Kthehu te lista</a></div>';return}
  document.title=m.full_name+' – '+m.category_name+' në '+m.city_name+' | Thirr Mjeshtrin';
  const mine=user&&(rv||[]).find(r=>r.client_id===user.id);
  $('#app').innerHTML=`<div class="wrap narrow"><a class="back" href="#">← Të gjithë mjeshtrat</a>
  <h1>${esc(m.full_name)}</h1><div class="mut"><span class="tag">${esc(m.category_name)}</span>${esc(m.city_name)}</div><div style="margin:10px 0 14px">${rating(m)}</div>
  ${m.description?`<p class="desc">${esc(m.description)}</p>`:''}${contacts(m)}
  <section class="rv"><h2>Vlerësimet</h2><div id="rvform"></div>${(rv||[]).length?rv.map(r=>`<div class="rvi"><div>${stars(r.rating)} <b>${esc(r.author_name||'Klient')}</b> <span class="mut">· ${date(r.created_at)}</span></div>${r.comment?`<p>${esc(r.comment)}</p>`:''}</div>`).join(''):'<p class="mut">Ende pa vlerësime. Bëhu i pari që e vlerëson.</p>'}</section></div>`;
  reviewForm(m,mine);
}
function reviewForm(m,mine){
  const box=$('#rvform');
  if(!user){box.innerHTML='<p><a class="btn ghost" href="#" id="rvlogin">Hyr për të lënë vlerësim</a></p>';$('#rvlogin').onclick=e=>{e.preventDefault();needLogin('m/'+m.id)};return}
  box.innerHTML=`<form id="rf" class="rf"><p style="margin:0 0 8px;font-weight:700">${mine?'Vlerësimi yt':'Lër vlerësim'}</p>
  <div class="pick" role="radiogroup" aria-label="Nota">${[5,4,3,2,1].map(i=>`<label><input type="radio" name="r" value="${i}" required ${mine&&mine.rating===i?'checked':''}><span>★</span></label>`).join('')}</div>
  <input id="ra" placeholder="Emri yt (p.sh. Arben K.)" required minlength="2" maxlength="60"><textarea id="rc" rows="3" maxlength="1000" placeholder="Si ishte puna? (opsionale)"></textarea>
  <div class="btns"><button class="btn">${mine?'Ruaj ndryshimet':'Dërgo vlerësimin'}</button>${mine?'<button class="btn ghost" type="button" id="rd">Fshije</button>':''}</div><p id="rmsg" class="mut"></p></form>`;
  if(mine){$('#ra').value=mine.author_name||'';$('#rc').value=mine.comment||''}
  $('#rf').onsubmit=async e=>{e.preventDefault();
    const row={rating:+$('#rf').r.value,author_name:$('#ra').value.trim(),comment:$('#rc').value.trim()||null};
    const {error}=mine?await sb.from('reviews').update(row).eq('id',mine.id):await sb.from('reviews').insert({...row,craftsman_id:m.id});
    if(error)return $('#rmsg').textContent=/row-level|policy/i.test(error.message)?'Nuk mund ta vlerësosh profilin tënd.':'Nuk u ruajt: '+error.message;
    detail(m.id)};
  if(mine)$('#rd').onclick=async()=>{if(!confirm('Ta fshij vlerësimin?'))return;await sb.from('reviews').delete().eq('id',mine.id);detail(m.id)};
}
function login(){
  $('#app').innerHTML=`<div class="wrap narrow"><h1>Hyr ose krijo llogari</h1><p class="mut">Klientët hyjnë për të lënë vlerësime. Mjeshtrat hyjnë për të krijuar profilin që klientët t'i gjejnë.</p>
  <form id="f"><input id="em" type="email" placeholder="Email" required autocomplete="email"><input id="pw" type="password" placeholder="Fjalëkalimi (të paktën 8 shkronja)" required minlength="6" autocomplete="current-password"><div class="btns"><button class="btn">Hyr</button><button class="btn ghost" type="button" id="up">Krijo llogari</button></div></form><p id="msg" class="mut"></p></div>`;
  const msg=t=>$('#msg').textContent=t,cr=()=>({email:$('#em').value,password:$('#pw').value});
  const go=()=>{let n='profili';try{n=sessionStorage.getItem('next')||n;sessionStorage.removeItem('next')}catch(e){}location.hash=n};
  $('#f').onsubmit=async e=>{e.preventDefault();const {error}=await sb.auth.signInWithPassword(cr());error?msg('Email ose fjalëkalim i gabuar.'):go()};
  $('#up').onclick=async()=>{if(!$('#f').reportValidity())return;if($('#pw').value.length<8)return msg('Për llogari të re, fjalëkalimi duhet të ketë të paktën 8 shkronja.');const {data,error}=await sb.auth.signUp({...cr(),options:{emailRedirectTo:location.origin}});error?msg(/pwned|leaked|weak/i.test(error.message)?'Ky fjalëkalim është i dobët ose i rrjedhur. Zgjidh një tjetër.':error.message):data.session?go():msg('Kontrollo email-in dhe kliko lidhjen e konfirmimit, pastaj hyr.')};
}
async function profile(){
  const {data:m}=await sb.from('craftsmen').select('*').eq('user_id',user.id).maybeSingle();
  $('#app').innerHTML=`<div class="wrap narrow"><h1>Profili im</h1><p class="mut">${m?(m.approved?`Profili yt është publik. <a href="#m/${m.id}">Shiko si e shohin klientët</a>`:'Profili është në pritje të aprovimit.'):'Je mjeshtër? Plotëso të dhënat që klientët të të gjejnë. Nëse je klient, nuk ke nevojë të plotësosh asgjë.'}</p>
  <form id="f"><input id="n" placeholder="Emri dhe mbiemri" required><select id="c" required>${opts(cats,'Profesioni')}</select><select id="y" required>${opts(cities,'Qyteti')}</select><input id="p" type="tel" placeholder="Telefoni, p.sh. 044 123 456" required><textarea id="d" rows="4" placeholder="Shkruaj shkurt çfarë pune bën"></textarea><button class="btn">Ruaj profilin</button></form><p id="msg" class="mut"></p></div>`;
  if(m){$('#n').value=m.full_name;$('#c').value=m.category_id;$('#y').value=m.city_id;$('#p').value=m.phone;$('#d').value=m.description||''}
  $('#f').onsubmit=async e=>{e.preventDefault();
    const row={full_name:$('#n').value,category_id:+$('#c').value,city_id:+$('#y').value,phone:$('#p').value,description:$('#d').value};
    const {error}=m?await sb.from('craftsmen').update(row).eq('id',m.id):await sb.from('craftsmen').insert({...row,user_id:user.id});
    $('#msg').textContent=error?'Nuk u ruajt: '+error.message:'Profili u ruajt. Shfaqet publikisht pasi të aprovohet.'};
}
init();
