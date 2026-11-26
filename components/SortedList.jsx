'use client';
import { useState } from 'react';
import { CraftsmanCard } from './ui';
import { slugify } from '@/lib/util';

export default function SortedList({ items }) {
  const [sort, setSort] = useState('new');
  const [q, setQ] = useState('');
  const [svc, setSvc] = useState(null);
  const [urgent, setUrgent] = useState(false);
  // Shërbimet që ofrojnë mjeshtrat e kësaj liste, nga më i shpeshti.
  const counts = new Map();
  items.forEach((m) => (m.services || []).forEach((s) => counts.set(s, (counts.get(s) || 0) + 1)));
  const allSvcs = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([s]) => s).slice(0, 16);
  const anyUrgent = items.some((m) => m.urgent);
  // Kërkim pa shkronja të veçanta: "fushe" gjen "Fushë Kosovë", "hidraulik" gjen "Hidraulikë & Instalime Uji".
  const words = slugify(q).split('-').filter(Boolean);
  const found = items.filter((m) => {
    if (urgent && !m.urgent) return false;
    if (svc && !(m.services || []).includes(svc)) return false;
    if (!words.length) return true;
    const t = slugify([m.full_name, m.category_name, m.city_name, m.description, ...(m.services || [])].join(' '));
    return words.every((w) => t.includes(w));
  });
  const list = sort === 'top'
    ? [...found].sort((a, b) => b.avg_rating - a.avg_rating || b.review_count - a.review_count)
    : found;
  const filtered = q || svc || urgent;
  return (
    <>
      {items.length > 1 && (
        <input className="search" type="search" placeholder="Kërko me emër ose shërbim, p.sh. panele solare" aria-label="Kërko mjeshtër me emër ose shërbim" value={q} onChange={(e) => setQ(e.target.value)} />
      )}
      {(allSvcs.length > 0 || anyUrgent) && (
        <div className="filt" role="group" aria-label="Filtro sipas shërbimit">
          {anyUrgent && <button type="button" aria-pressed={urgent} onClick={() => setUrgent(!urgent)}>Vetëm urgjente</button>}
          {allSvcs.map((s) => <button key={s} type="button" aria-pressed={svc === s} onClick={() => setSvc(svc === s ? null : s)}>{s}</button>)}
        </div>
      )}
      <div className="bar">
        <p className="count" aria-live="polite">{found.length} {found.length === 1 ? 'mjeshtër' : 'mjeshtra'}</p>
        <label className="sort"><span>Rendit</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="new">Më të rinjtë</option>
            <option value="top">Më të vlerësuarit</option>
          </select>
        </label>
      </div>
      <div className="list">
        {list.length ? list.map((m) => <CraftsmanCard key={m.id} m={m} />)
          : <div className="state"><strong>Nuk u gjet asnjë mjeshtër</strong>{filtered ? 'Provo një shërbim ose emër tjetër, ose hiq filtrat.' : 'Provo një qytet ose profesion tjetër, ose posto një kërkesë më poshtë.'}</div>}
      </div>
    </>
  );
}
