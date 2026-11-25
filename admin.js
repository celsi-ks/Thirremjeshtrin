/* admin.js – paneli i administrimit (#admin). Të dhënat vijnë nga funksionet admin_* në Supabase,
   të cilat refuzojnë këdo që nuk është në tabelën admins. */
const ADMIN_TABS={
  mjeshtrat:{label:'Mjeshtrat',render:adminCraftsmen},
  vleresimet:{label:'Vlerësimet',render:adminReviews}
};
function admin(tab){
  if(!ADMIN_TABS[tab])tab='mjeshtrat';
  $('#app').innerHTML=`<div class="wrap adm"><h1>Paneli i administrimit</h1>
  <nav class="tabs" aria-label="Seksionet">${Object.entries(ADMIN_TABS).map(([k,t])=>`<a href="#admin/${k}" ${k===tab?'aria-current="page"':''}>${t.label}</a>`).join('')}</nav>
  <div id="adm"><div class="state">Duke ngarkuar…</div></div></div>`;
  ADMIN_TABS[tab].render($('#adm'));
}
const admErr=(box,e)=>box.innerHTML=`<div class="state"><strong>Gabim</strong>${esc(e.message)}</div>`;
async function adminCraftsmen(box,filter){
  filter=filter||'pritje';
  const [{data,error},{data:ev}]=await Promise.all([sb.rpc('admin_craftsmen'),sb.rpc('admin_event_counts')]);
  if(error)return admErr(box,error);
  const evs=Object.fromEntries((ev||[]).map(e=>[e.craftsman_id,e]));
  const pending=data.filter(m=>!m.approved);
  const rows=filter==='pritje'?pending:data;
  box.innerHTML=`<div class="seg"><button type="button" data-f="pritje" aria-pressed="${filter==='pritje'}">Në pritje (${pending.length})</button><button type="button" data-f="te-gjithe" aria-pressed="${filter!=='pritje'}">Të gjithë (${data.length})</button></div>
  ${rows.length?rows.map(m=>`<article class="card arow" data-id="${m.id}"><div class="ch">${avatar(m)}<div>
    <h3>${m.approved?`<a class="cl" href="#m/${m.id}">${esc(m.full_name)}</a>`:esc(m.full_name)}${badge(m)} ${m.approved?'':'<span class="pend">Në pritje</span>'}</h3>
    <div class="mut"><span class="tag">${esc(m.category_name)}</span>${esc(m.city_name)} · ${esc(m.phone)}</div>
    <div class="mut small">${esc(m.email||'pa llogari')} · regjistruar ${date(m.created_at)} · ${m.review_count} vlerësime${m.approved?` · 30 ditë: ${evs[m.id]?.views||0} shikime, ${evs[m.id]?.contacts||0} kontakte`:''}</div></div></div>
    ${m.description?`<p>${esc(m.description)}</p>`:''}
    ${(m.gallery||[]).length?`<div class="gal sm">${m.gallery.map(u=>`<a href="${esc(u)}" target="_blank" rel="noopener"><img src="${esc(u)}" alt="" loading="lazy"></a>`).join('')}</div>`:''}
    <div class="btns">${m.approved?'<button class="btn ghost" data-a="unapprove">Hiq nga faqja</button>':'<button class="btn" data-a="approve">Aprovo</button>'}
    <button class="btn ghost" data-a="${m.verified?'unverify':'verify'}">${m.verified?'Hiq verifikimin':'Verifiko ✔'}</button>
    <button class="btn ghost danger" data-a="delete">Fshije</button></div></article>`).join(''):`<div class="state"><strong>${filter==='pritje'?'Asnjë mjeshtër në pritje':'Asnjë mjeshtër'}</strong>${filter==='pritje'?'Të gjithë janë shqyrtuar.':''}</div>`}`;
  box.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>adminCraftsmen(box,b.dataset.f));
  box.querySelectorAll('[data-a]').forEach(b=>b.onclick=async()=>{
    const id=b.closest('.arow').dataset.id,m=data.find(x=>x.id===id),a=b.dataset.a;
    if(a==='delete'&&!confirm(`Ta fshij përgjithmonë profilin e "${m.full_name}" dhe vlerësimet e tij?`))return;
    b.disabled=true;
    const {error}=a==='delete'?await sb.rpc('admin_delete_craftsman',{p_id:id}):await sb.rpc('admin_set_flags',{p_id:id,
      p_approved:a==='approve'?true:a==='unapprove'?false:m.approved,
      p_verified:a==='verify'?true:a==='unverify'?false:m.verified});
    if(error){b.disabled=false;return alert('Nuk u krye: '+error.message)}
    adminCraftsmen(box,filter)});
}
async function adminReviews(box){
  const {data,error}=await sb.rpc('admin_reviews');
  if(error)return admErr(box,error);
  box.innerHTML=data.length?data.map(r=>`<div class="rvi" data-id="${r.id}"><div>${stars(r.rating)} <b>${esc(r.author_name||'Klient')}</b> për <a href="#m/${r.craftsman_id}">${esc(r.craftsman_name)}</a> <span class="mut">· ${date(r.created_at)} · ${esc(r.email||'')}</span></div>${r.comment?`<p>${esc(r.comment)}</p>`:''}<button class="btn ghost danger sm" type="button">Fshije</button></div>`).join(''):'<div class="state"><strong>Ende pa vlerësime</strong></div>';
  box.querySelectorAll('.rvi button').forEach(b=>b.onclick=async()=>{
    if(!confirm('Ta fshij këtë vlerësim?'))return;
    const {error}=await sb.rpc('admin_delete_review',{p_id:b.closest('.rvi').dataset.id});
    error?alert('Nuk u fshi: '+error.message):adminReviews(box)});
}
