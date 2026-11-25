'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { sb } from '@/lib/supabase';
import { useUser, loginHref } from '@/lib/useUser';
import { ago } from '@/lib/util';

const REQ_DAYS = 30;
const empty = { category_id: '', city_id: '', details: '', name: '', phone: '' };

export default function PostRequest({ cats, cities }) {
  const { user, ready } = useUser();
  const [f, setF] = useState(empty);
  const [msg, setMsg] = useState('');
  const [mine, setMine] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const catName = (id) => cats.find((c) => c.id === id)?.name || '';
  const cityName = (id) => cities.find((c) => c.id === id)?.name || '';

  const loadMine = async () => {
    const { data } = await sb().from('requests').select('*').eq('client_id', user.id).order('created_at', { ascending: false });
    setMine(data || []);
  };
  useEffect(() => { if (user) loadMine(); }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e) {
    e.preventDefault();
    const row = { category_id: +f.category_id, city_id: +f.city_id, details: f.details.trim(), name: f.name.trim(), phone: f.phone.trim() };
    if (row.details.length < 10) return setMsg('Shkruaj pak më shumë për punën (të paktën 10 shkronja).');
    const { error } = await sb().from('requests').insert(row);
    if (error) return setMsg('Nuk u dërgua: ' + error.message);
    setF(empty);
    setMsg('✔ Kërkesa u dërgua. Mjeshtrat do të të thërrasin së shpejti.');
    loadMine();
  }

  return (
    <div className="wrap narrow">
      <h1>Posto një kërkesë</h1>
      <p className="mut">Përshkruaj punën. Mjeshtrat e aprovuar të atij profesioni e shohin kërkesën dhe të thërrasin vetë.</p>
      {ready && !user ? (
        <div className="rf">
          <p style={{ marginTop: 0 }}>Për të postuar kërkesë duhet të hysh me email. Kështu mjeshtrat e dinë që kërkesa është e vërtetë.</p>
          <Link className="btn" href={loginHref('/kerkese')}>Hyr ose krijo llogari</Link>
        </div>
      ) : (
        <form onSubmit={submit}>
          <select required value={f.category_id} onChange={set('category_id')}><option value="">Çfarë mjeshtri të duhet?</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <select required value={f.city_id} onChange={set('city_id')}><option value="">Në cilin qytet?</option>{cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <textarea rows={5} required minLength={10} maxLength={2000} value={f.details} onChange={set('details')} placeholder="P.sh. Më rrjedh uji poshtë lavamanit në kuzhinë, duhet ndërruar sifoni. Jam i lirë pas orës 16." />
          <input placeholder="Emri yt" required minLength={2} maxLength={60} autoComplete="given-name" value={f.name} onChange={set('name')} />
          <input type="tel" placeholder="Telefoni yt, p.sh. 044 123 456" required minLength={6} maxLength={30} autoComplete="tel" value={f.phone} onChange={set('phone')} />
          <p className="mut small" style={{ margin: '0 0 12px' }}>Numri yt u shfaqet vetëm mjeshtrave të aprovuar të këtij profesioni. Kërkesa hiqet automatikisht pas {REQ_DAYS} ditësh.</p>
          <button className="btn" disabled={!user}>Dërgo kërkesën</button>
          {msg && <p className="mut">{msg}</p>}
        </form>
      )}
      {user && (
        <section className="rv">
          <h2>Kërkesat e mia</h2>
          {!mine ? <p className="mut">Duke ngarkuar…</p> : mine.length ? mine.map((q) => (
            <div className="rvi" key={q.id}>
              <div><span className="tag">{catName(q.category_id)}</span>{cityName(q.city_id)} <span className="mut">· {ago(q.created_at)}{Date.now() - new Date(q.created_at) > REQ_DAYS * 864e5 ? ' · skaduar' : ''}</span></div>
              <p>{q.details}</p>
              <button className="btn ghost sm" type="button" onClick={async () => { await sb().from('requests').delete().eq('id', q.id); loadMine(); }}>E gjeta mjeshtrin, fshije</button>
            </div>
          )) : <p className="mut">Nuk ke dërguar ende asnjë kërkesë.</p>}
        </section>
      )}
    </div>
  );
}
