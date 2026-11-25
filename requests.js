/* requests.js – kërkesat e klientëve: klienti poston punën, mjeshtrat e aprovuar të asaj kategorie e shohin dhe e thërrasin. */
const REQ_DAYS=30; // kërkesat më të vjetra se kaq nuk shfaqen më te mjeshtrat
const since=()=>new Date(Date.now()-REQ_DAYS*864e5).toISOString();
const ago=d=>{const m=Math.round((Date.now()-new Date(d))/6e4);return m<60?`${Math.max(m,1)} min më parë`:m<1440?`${Math.round(m/60)} orë më parë`:`${Math.round(m/1440)} ditë më parë`};
const catName=id=>cats.find(c=>c.id===id)?.name||'';
const cityName=id=>cities.find(c=>c.id===id)?.name||'';

async function postRequest(){
  $('#app').innerHTML=`<div class="wrap narrow"><h1>Posto një kërkesë</h1><p class="mut">Përshkruaj punën. Mjeshtrat e aprovuar të atij profesioni e shohin kërkesën dhe të thërrasin vetë.</p>
  <form id="qf"><select id="qc" required>${opts(cats,'Çfarë mjeshtri të duhet?')}</select><select id="qy" required>${opts(cities,'Në cilin qytet?')}</select>
  <textarea id="qd" rows="5" required minlength="10" maxlength="2000" placeholder="P.sh. Më rrjedh uji poshtë lavamanit në kuzhinë, duhet ndërruar sifoni. Jam i lirë pas orës 16."></textarea>
  <input id="qn" placeholder="Emri yt" required minlength="2" maxlength="60" autocomplete="given-name"><input id="qp" type="tel" placeholder="Telefoni yt, p.sh. 044 123 456" required minlength="6" maxlength="30" autocomplete="tel">
  <p class="mut small" style="margin:0 0 12px">Numri yt u shfaqet vetëm mjeshtrave të aprovuar të këtij profesioni. Kërkesa hiqet automatikisht pas ${REQ_DAYS} ditësh.</p>
  <button class="btn">Dërgo kërkesën</button></form><p id="qmsg" class="mut"></p>
  <section class="rv"><h2>Kërkesat e mia</h2><div id="mine"><p class="mut">Duke ngarkuar…</p></div></section></div>`;
  const fc=$('.filters select');
  $('#qf').onsubmit=async e=>{e.preventDefault();
    const row={category_id:+$('#qc').value,city_id:+$('#qy').value,details:$('#qd').value.trim(),name:$('#qn').value.trim(),phone:$('#qp').value.trim()};
    if(row.details.length<10)return $('#qmsg').textContent='Shkruaj pak më shumë për punën (të paktën 10 shkronja).';
    const {error}=await sb.from('requests').insert(row);
    if(error)return $('#qmsg').textContent='Nuk u dërgua: '+error.message;
    $('#qf').reset();$('#qmsg').textContent='✔ Kërkesa u dërgua. Mjeshtrat do të të thërrasin së shpejti.';myRequests()};
  myRequests();
}
async function myRequests(){
  const {data,error}=await sb.from('requests').select('*').eq('client_id',user.id).order('created_at',{ascending:false});
  const box=$('#mine');if(!box)return;
  if(error)return box.innerHTML='<p class="mut">Nuk u ngarkuan.</p>';
  box.innerHTML=data.length?data.map(q=>`<div class="rvi" data-id="${q.id}"><div><span class="tag">${esc(catName(q.category_id))}</span>${esc(cityName(q.city_id))} <span class="mut">· ${ago(q.created_at)}${new Date(q.created_at)<new Date(since())?' · skaduar':''}</span></div><p>${esc(q.details)}</p><button class="btn ghost sm" type="button">E gjeta mjeshtrin, fshije</button></div>`).join(''):'<p class="mut">Nuk ke dërguar ende asnjë kërkesë.</p>';
  box.querySelectorAll('.rvi button').forEach(b=>b.onclick=async()=>{await sb.from('requests').delete().eq('id',b.closest('.rvi').dataset.id);myRequests()});
}
// Te profili i mjeshtrit të aprovuar: kërkesat e fundit në profesionin e tij, së pari ato në qytetin e tij.
async function craftsmanRequests(m,box){
  const {data,error}=await sb.from('requests').select('*').eq('category_id',m.category_id).gte('created_at',since()).order('created_at',{ascending:false}).limit(50);
  if(error||!box.isConnected)return;
  const list=[...data.filter(q=>q.city_id===m.city_id),...data.filter(q=>q.city_id!==m.city_id)];
  box.innerHTML=`<section class="reqs"><h2>Kërkesa nga klientët <span class="mut">(${list.length})</span></h2><p class="mut small">Kërkesat e ${REQ_DAYS} ditëve të fundit për ${esc(catName(m.category_id))}. Thirre klientin direkt.</p>
  ${list.length?list.map(q=>`<div class="rvi"><div><b>${esc(q.name||'Klient')}</b> · ${esc(cityName(q.city_id))}${q.city_id===m.city_id?' <span class="ver">Në qytetin tënd</span>':''} <span class="mut">· ${ago(q.created_at)}</span></div><p>${esc(q.details)}</p>
    <div class="acts" style="margin-top:8px"><a class="btn" href="tel:+${num(q.phone)}">Telefono ${esc(q.phone)}</a><a class="btn wa" href="https://wa.me/${num(q.phone)}" target="_blank" rel="noopener">WhatsApp</a></div></div>`).join(''):'<p class="mut">Ende nuk ka kërkesa në profesionin tënd. Do t\'i shohësh këtu sapo të vijnë.</p>'}</section>`;
}
ADMIN_TABS.kerkesat={label:'Kërkesat',render:async function adminRequests(box){
  const {data,error}=await sb.rpc('admin_requests');
  if(error)return admErr(box,error);
  box.innerHTML=data.length?data.map(q=>`<div class="rvi" data-id="${q.id}"><div><span class="tag">${esc(q.category_name)}</span>${esc(q.city_name)} · <b>${esc(q.name||'Klient')}</b> ${esc(q.phone)} <span class="mut">· ${ago(q.created_at)} · ${esc(q.email||'')}</span></div><p>${esc(q.details)}</p><button class="btn ghost danger sm" type="button">Fshije</button></div>`).join(''):'<div class="state"><strong>Ende pa kërkesa</strong></div>';
  box.querySelectorAll('.rvi button').forEach(b=>b.onclick=async()=>{if(!confirm('Ta fshij këtë kërkesë?'))return;
    const {error}=await sb.rpc('admin_delete_request',{p_id:b.closest('.rvi').dataset.id});error?alert(error.message):adminRequests(box)});
}};
