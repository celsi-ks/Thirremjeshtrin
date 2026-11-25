'use client';
/* Paneli i administrimit. Të dhënat vijnë nga funksionet admin_* në Supabase,
   të cilat refuzojnë këdo që nuk është në tabelën admins. */
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sb } from '@/lib/supabase';
import { useUser, loginHref } from '@/lib/useUser';
import { craftsmanPath, fmtDate, ago } from '@/lib/util';
import { Avatar, Stars, Verified } from '@/components/ui';

const TABS = { mjeshtrat: 'Mjeshtrat', vleresimet: 'Vlerësimet', kerkesat: 'Kërkesat' };

export default function Admin() {
  const { user, isAdmin, ready } = useUser();
  const router = useRouter();
  const [tab, setTab] = useState('mjeshtrat');
  useEffect(() => { const t = new URLSearchParams(location.search).get('tab'); if (TABS[t]) setTab(t); }, []);
  useEffect(() => { if (ready && !user) router.replace(loginHref('/admin')); }, [ready, user, router]);
  const pick = (t) => { setTab(t); history.replaceState(null, '', '/admin?tab=' + t); };

  if (!ready || !user) return <div className="wrap narrow">Duke ngarkuar…</div>;
  if (!isAdmin) return <div className="wrap narrow"><h1>Nuk ke qasje</h1><p className="mut">Kjo faqe është vetëm për administratorët.</p><Link className="btn" href="/">Kthehu</Link></div>;
  return (
    <div className="wrap adm">
      <h1>Paneli i administrimit</h1>
      <nav className="tabs" aria-label="Seksionet">
        {Object.entries(TABS).map(([k, l]) => <a key={k} href={'/admin?tab=' + k} aria-current={k === tab ? 'page' : undefined} onClick={(e) => { e.preventDefault(); pick(k); }}>{l}</a>)}
      </nav>
      {tab === 'mjeshtrat' && <Craftsmen />}
      {tab === 'vleresimet' && <AdminReviews />}
      {tab === 'kerkesat' && <AdminRequests />}
    </div>
  );
}

function useRpc(name) {
  const [state, setState] = useState({ data: null, error: null });
  const load = useCallback(async () => setState(await sb().rpc(name)), [name]);
  useEffect(() => { load(); }, [load]);
  return [state, load];
}
const Err = ({ e }) => <div className="state"><strong>Gabim</strong>{e.message}</div>;

function Craftsmen() {
  const [{ data, error }, reload] = useRpc('admin_craftsmen');
  const [{ data: ev }] = useRpc('admin_event_counts');
  const [filter, setFilter] = useState('pritje');
  const [busy, setBusy] = useState(null);
  if (error) return <Err e={error} />;
  if (!data) return <div className="state">Duke ngarkuar…</div>;
  const evs = Object.fromEntries((ev || []).map((e) => [e.craftsman_id, e]));
  const pending = data.filter((m) => !m.approved);
  const rows = filter === 'pritje' ? pending : data;

  async function act(m, a) {
    if (a === 'delete' && !confirm(`Ta fshij përgjithmonë profilin e "${m.full_name}" dhe vlerësimet e tij?`)) return;
    setBusy(m.id);
    const { error } = a === 'delete'
      ? await sb().rpc('admin_delete_craftsman', { p_id: m.id })
      : await sb().rpc('admin_set_flags', {
        p_id: m.id,
        p_approved: a === 'approve' ? true : a === 'unapprove' ? false : m.approved,
        p_verified: a === 'verify' ? true : a === 'unverify' ? false : m.verified,
      });
    setBusy(null);
    if (error) return alert('Nuk u krye: ' + error.message);
    reload();
  }

  return (
    <>
      <div className="seg">
        <button type="button" aria-pressed={filter === 'pritje'} onClick={() => setFilter('pritje')}>Në pritje ({pending.length})</button>
        <button type="button" aria-pressed={filter !== 'pritje'} onClick={() => setFilter('te-gjithe')}>Të gjithë ({data.length})</button>
      </div>
      {rows.length ? rows.map((m) => (
        <article className="card arow" key={m.id}>
          <div className="ch"><Avatar m={m} /><div>
            <h3>{m.approved ? <Link className="cl" href={craftsmanPath(m)}>{m.full_name}</Link> : m.full_name}<Verified m={m} /> {!m.approved && <span className="pend">Në pritje</span>}</h3>
            <div className="mut"><span className="tag">{m.category_name}</span>{m.city_name} · {m.phone}</div>
            <div className="mut small">{m.email || 'pa llogari'} · regjistruar {fmtDate(m.created_at)} · {m.review_count} vlerësime
              {m.approved && ` · 30 ditë: ${evs[m.id]?.views || 0} shikime, ${evs[m.id]?.contacts || 0} kontakte`}</div>
          </div></div>
          {m.description && <p>{m.description}</p>}
          {m.gallery?.length > 0 && <div className="gal sm">{m.gallery.map((u) => <a key={u} href={u} target="_blank" rel="noopener">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={u} alt="" loading="lazy" /></a>)}</div>}
          <div className="btns">
            {m.approved
              ? <button className="btn ghost" disabled={busy === m.id} onClick={() => act(m, 'unapprove')}>Hiq nga faqja</button>
              : <button className="btn" disabled={busy === m.id} onClick={() => act(m, 'approve')}>Aprovo</button>}
            <button className="btn ghost" disabled={busy === m.id} onClick={() => act(m, m.verified ? 'unverify' : 'verify')}>{m.verified ? 'Hiq verifikimin' : 'Verifiko ✔'}</button>
            <button className="btn ghost danger" disabled={busy === m.id} onClick={() => act(m, 'delete')}>Fshije</button>
          </div>
        </article>
      )) : <div className="state"><strong>{filter === 'pritje' ? 'Asnjë mjeshtër në pritje' : 'Asnjë mjeshtër'}</strong>{filter === 'pritje' && 'Të gjithë janë shqyrtuar.'}</div>}
    </>
  );
}

function AdminReviews() {
  const [{ data, error }, reload] = useRpc('admin_reviews');
  if (error) return <Err e={error} />;
  if (!data) return <div className="state">Duke ngarkuar…</div>;
  if (!data.length) return <div className="state"><strong>Ende pa vlerësime</strong></div>;
  return data.map((r) => (
    <div className="rvi" key={r.id}>
      <div><Stars value={r.rating} /> <b>{r.author_name || 'Klient'}</b> për <Link href={craftsmanPath({ id: r.craftsman_id, full_name: r.craftsman_name })}>{r.craftsman_name}</Link> <span className="mut">· {fmtDate(r.created_at)} · {r.email}</span></div>
      {r.comment && <p>{r.comment}</p>}
      <button className="btn ghost danger sm" type="button" onClick={async () => {
        if (!confirm('Ta fshij këtë vlerësim?')) return;
        const { error } = await sb().rpc('admin_delete_review', { p_id: r.id });
        error ? alert('Nuk u fshi: ' + error.message) : reload();
      }}>Fshije</button>
    </div>
  ));
}

function AdminRequests() {
  const [{ data, error }, reload] = useRpc('admin_requests');
  if (error) return <Err e={error} />;
  if (!data) return <div className="state">Duke ngarkuar…</div>;
  if (!data.length) return <div className="state"><strong>Ende pa kërkesa</strong></div>;
  return data.map((q) => (
    <div className="rvi" key={q.id}>
      <div><span className="tag">{q.category_name}</span>{q.city_name} · <b>{q.name || 'Klient'}</b> {q.phone} <span className="mut">· {ago(q.created_at)} · {q.email}</span></div>
      <p>{q.details}</p>
      <button className="btn ghost danger sm" type="button" onClick={async () => {
        if (!confirm('Ta fshij këtë kërkesë?')) return;
        const { error } = await sb().rpc('admin_delete_request', { p_id: q.id });
        error ? alert(error.message) : reload();
      }}>Fshije</button>
    </div>
  ));
}
