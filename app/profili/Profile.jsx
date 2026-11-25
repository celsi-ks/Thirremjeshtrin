'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sb } from '@/lib/supabase';
import { useUser, loginHref } from '@/lib/useUser';
import { craftsmanPath, intlPhone, ago } from '@/lib/util';
import { Avatar } from '@/components/ui';

const REQ_DAYS = 30;

export default function Profile({ cats, cities }) {
  const { user, ready } = useUser();
  const router = useRouter();
  const [m, setM] = useState(undefined); // undefined = duke ngarkuar, null = pa profil

  const load = async () => {
    const { data } = await sb().from('craftsmen').select('*').eq('user_id', user.id).maybeSingle();
    setM(data);
  };
  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace(loginHref('/profili'));
    else load();
  }, [ready, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user || m === undefined) return <div className="wrap narrow">Duke ngarkuar…</div>;
  return (
    <div className="wrap narrow">
      <h1>Profili im</h1>
      <p className="mut">
        {m ? (m.approved ? <>Profili yt është publik. <Link href={craftsmanPath({ ...m })}>Shiko si e shohin klientët</Link></> : 'Profili është në pritje të aprovimit.')
          : 'Je mjeshtër? Plotëso të dhënat që klientët të të gjejnë. Nëse je klient, nuk ke nevojë të plotësosh asgjë.'}
      </p>
      {!m && <p><Link className="btn ghost" href="/kerkese">Je klient? Posto një kërkesë</Link></p>}
      {m?.approved && <><Stats /><Requests m={m} cats={cats} cities={cities} /></>}
      <ProfileForm m={m} cats={cats} cities={cities} userId={user.id} onSaved={load} />
      {m && <Photos m={m} userId={user.id} onChange={(patch) => setM({ ...m, ...patch })} />}
    </div>
  );
}

function ProfileForm({ m, cats, cities, userId, onSaved }) {
  const [f, setF] = useState({ full_name: m?.full_name || '', category_id: m?.category_id || '', city_id: m?.city_id || '', phone: m?.phone || '', description: m?.description || '' });
  const [msg, setMsg] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function save(e) {
    e.preventDefault();
    const row = { ...f, category_id: +f.category_id, city_id: +f.city_id };
    const { error } = m ? await sb().from('craftsmen').update(row).eq('id', m.id) : await sb().from('craftsmen').insert({ ...row, user_id: userId });
    if (error) return setMsg('Nuk u ruajt: ' + error.message);
    setMsg(m?.approved ? 'Profili u ruajt.' : 'Profili u ruajt. Shfaqet publikisht pasi të aprovohet.');
    onSaved();
  }
  return (
    <form onSubmit={save}>
      <input placeholder="Emri dhe mbiemri" required value={f.full_name} onChange={set('full_name')} />
      <select required value={f.category_id} onChange={set('category_id')}><option value="">Profesioni</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <select required value={f.city_id} onChange={set('city_id')}><option value="">Qyteti</option>{cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <input type="tel" placeholder="Telefoni, p.sh. 044 123 456" required value={f.phone} onChange={set('phone')} />
      <textarea rows={4} placeholder="Shkruaj shkurt çfarë pune bën" value={f.description} onChange={set('description')} />
      <button className="btn">Ruaj profilin</button>
      {msg && <p className="mut">{msg}</p>}
    </form>
  );
}

function Stats() {
  const [s, setS] = useState(null);
  useEffect(() => { sb().rpc('my_stats').then(({ data }) => data && setS(Object.fromEntries(data.map((r) => [r.kind, r])))); }, []);
  if (!s) return null;
  const tile = (k, l) => <div className="tile"><b>{s[k]?.last30 ?? 0}</b><span>{l}</span><small className="mut">gjithsej {s[k]?.total ?? 0}</small></div>;
  return <section className="stats"><h2>30 ditët e fundit</h2><div className="tiles">{tile('view', 'Shikime të profilit')}{tile('tel', 'Thirrje')}{tile('wa', 'Mesazhe WhatsApp')}</div></section>;
}

function Requests({ m, cats, cities }) {
  const [list, setList] = useState(null);
  useEffect(() => {
    sb().from('requests').select('*').eq('category_id', m.category_id)
      .gte('created_at', new Date(Date.now() - REQ_DAYS * 864e5).toISOString())
      .order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => data && setList([...data.filter((q) => q.city_id === m.city_id), ...data.filter((q) => q.city_id !== m.city_id)]));
  }, [m.category_id, m.city_id]);
  if (!list) return null;
  const city = (id) => cities.find((c) => c.id === id)?.name || '';
  return (
    <section className="reqs">
      <h2>Kërkesa nga klientët <span className="mut">({list.length})</span></h2>
      <p className="mut small">Kërkesat e {REQ_DAYS} ditëve të fundit për {cats.find((c) => c.id === m.category_id)?.name}. Thirre klientin direkt.</p>
      {list.length ? list.map((q) => (
        <div className="rvi" key={q.id}>
          <div><b>{q.name || 'Klient'}</b> · {city(q.city_id)}{q.city_id === m.city_id && <> <span className="ver">Në qytetin tënd</span></>} <span className="mut">· {ago(q.created_at)}</span></div>
          <p>{q.details}</p>
          <div className="acts" style={{ marginTop: 8 }}>
            <a className="btn" href={`tel:+${intlPhone(q.phone)}`}>Telefono {q.phone}</a>
            <a className="btn wa" href={`https://wa.me/${intlPhone(q.phone)}`} target="_blank" rel="noopener">WhatsApp</a>
          </div>
        </div>
      )) : <p className="mut">Ende nuk ka kërkesa në profesionin tënd. Do t&apos;i shohësh këtu sapo të vijnë.</p>}
    </section>
  );
}

// Zvogëlon foton në shfletues (max 1280px) që ngarkimi të jetë i shpejtë edhe me internet mobil.
function shrink(file, max = 1280) {
  return new Promise((ok, bad) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      c.toBlob((b) => (b ? ok(b) : bad(new Error('Foto nuk u lexua'))), 'image/jpeg', 0.85);
    };
    img.onerror = () => bad(new Error('Ky skedar nuk është foto'));
    img.src = URL.createObjectURL(file);
  });
}
const pathOf = (u) => u && u.split('/object/public/photos/')[1];

function Photos({ m, userId, onChange }) {
  const [msg, setMsg] = useState('');
  const gallery = m.gallery || [];
  async function upload(file) {
    const blob = await shrink(file);
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const { error } = await sb().storage.from('photos').upload(path, blob, { contentType: 'image/jpeg' });
    if (error) throw error;
    return sb().storage.from('photos').getPublicUrl(path).data.publicUrl;
  }
  async function save(patch, old = []) {
    const { error } = await sb().from('craftsmen').update(patch).eq('id', m.id);
    if (error) return setMsg('Nuk u ruajt: ' + error.message);
    if (old.length) await sb().storage.from('photos').remove(old.map(pathOf).filter(Boolean));
    setMsg('');
    onChange(patch);
  }
  async function onProfile(e) {
    const f = e.target.files[0]; if (!f) return;
    setMsg('Duke ngarkuar…');
    try { await save({ photo_url: await upload(f) }, m.photo_url ? [m.photo_url] : []); } catch (err) { setMsg('Nuk u ngarkua: ' + err.message); }
  }
  async function onGallery(e) {
    const fs = [...e.target.files].slice(0, 8 - gallery.length); if (!fs.length) return;
    setMsg(`Duke ngarkuar ${fs.length} foto…`);
    try { const urls = []; for (const f of fs) urls.push(await upload(f)); await save({ gallery: [...gallery, ...urls] }); } catch (err) { setMsg('Nuk u ngarkua: ' + err.message); }
  }
  return (
    <section className="rv">
      <h2>Fotot</h2>
      <p className="mut">Profilet me foto marrin më shumë thirrje. Fotot e punëve u tregojnë klientëve cilësinë tënde (deri në 8).</p>
      <div className="ph">
        <Avatar m={m} big />
        <label className="btn ghost up">Ndrysho foton e profilit<input type="file" accept="image/*" hidden onChange={onProfile} /></label>
        {m.photo_url && <button className="btn ghost" type="button" onClick={() => save({ photo_url: null }, [m.photo_url])}>Hiqe</button>}
      </div>
      <div className="gal edit">
        {gallery.map((u, i) => (
          <div key={u}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt={`Foto e punës ${i + 1}`} />
            <button type="button" className="x" aria-label={`Fshi foton ${i + 1}`} onClick={() => save({ gallery: gallery.filter((x) => x !== u) }, [u])}>✕</button>
          </div>
        ))}
        {gallery.length < 8 && <label className="add">+ Shto foto pune<input type="file" accept="image/*" multiple hidden onChange={onGallery} /></label>}
      </div>
      {msg && <p className="mut">{msg}</p>}
    </section>
  );
}
