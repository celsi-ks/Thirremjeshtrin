'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { sb } from '@/lib/supabase';
import { useUser, loginHref } from '@/lib/useUser';
import { fmtDate } from '@/lib/util';
import { Stars } from './ui';

/** Lista e vlerësimeve (fillimisht nga serveri, pastaj e freskët nga shfletuesi) dhe forma për vlerësim. */
export default function Reviews({ craftsmanId, initial, path }) {
  const { user, ready } = useUser();
  const [list, setList] = useState(initial);
  const reload = async () => {
    const { data } = await sb().from('reviews').select('id,craftsman_id,client_id,rating,author_name,comment,created_at')
      .eq('craftsman_id', craftsmanId).order('created_at', { ascending: false });
    if (data) setList(data);
  };
  useEffect(() => { reload(); }, [craftsmanId]); // eslint-disable-line react-hooks/exhaustive-deps
  const mine = user && list.find((r) => r.client_id === user.id);

  return (
    <section className="rv">
      <h2>Vlerësimet</h2>
      {ready && (user
        ? <ReviewForm key={mine?.id || 'new'} craftsmanId={craftsmanId} mine={mine} onDone={reload} />
        : <p><Link className="btn ghost" href={loginHref(path)}>Hyr për të lënë vlerësim</Link></p>)}
      {list.length ? list.map((r) => (
        <div className="rvi" key={r.id}>
          <div><Stars value={r.rating} /> <b>{r.author_name || 'Klient'}</b> <span className="mut">· {fmtDate(r.created_at)}</span></div>
          {r.comment && <p>{r.comment}</p>}
        </div>
      )) : <p className="mut">Ende pa vlerësime. Bëhu i pari që e vlerëson.</p>}
    </section>
  );
}

function ReviewForm({ craftsmanId, mine, onDone }) {
  const [rating, setRating] = useState(mine?.rating || 0);
  const [name, setName] = useState(mine?.author_name || '');
  const [comment, setComment] = useState(mine?.comment || '');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!rating) return setMsg('Zgjidh notën me yje.');
    setBusy(true);
    const row = { rating, author_name: name.trim(), comment: comment.trim() || null };
    const { error } = mine
      ? await sb().from('reviews').update(row).eq('id', mine.id)
      : await sb().from('reviews').insert({ ...row, craftsman_id: craftsmanId });
    setBusy(false);
    if (error) return setMsg(/row-level|policy/i.test(error.message) ? 'Nuk mund ta vlerësosh profilin tënd.' : 'Nuk u ruajt: ' + error.message);
    setMsg('✔ U ruajt. Faleminderit!');
    onDone();
  }
  async function remove() {
    if (!confirm('Ta fshij vlerësimin?')) return;
    await sb().from('reviews').delete().eq('id', mine.id);
    onDone();
  }

  return (
    <form className="rf" onSubmit={submit}>
      <p style={{ margin: '0 0 8px', fontWeight: 700 }}>{mine ? 'Vlerësimi yt' : 'Lër vlerësim'}</p>
      <div className="pick" role="radiogroup" aria-label="Nota">
        {[5, 4, 3, 2, 1].map((i) => (
          <label key={i}><input type="radio" name="r" value={i} checked={rating === i} onChange={() => setRating(i)} aria-label={`${i} yje`} /><span>★</span></label>
        ))}
      </div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Emri yt (p.sh. Arben K.)" required minLength={2} maxLength={60} />
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} maxLength={1000} placeholder="Si ishte puna? (opsionale)" />
      <div className="btns">
        <button className="btn" disabled={busy}>{mine ? 'Ruaj ndryshimet' : 'Dërgo vlerësimin'}</button>
        {mine && <button className="btn ghost" type="button" onClick={remove}>Fshije</button>}
      </div>
      {msg && <p className="mut">{msg}</p>}
    </form>
  );
}
