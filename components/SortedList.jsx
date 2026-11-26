'use client';
import { useState } from 'react';
import { CraftsmanCard } from './ui';
import { slugify } from '@/lib/util';

export default function SortedList({ items }) {
  const [sort, setSort] = useState('new');
  const [q, setQ] = useState('');
  // Kërkim pa shkronja të veçanta: "fushe" gjen "Fushë Kosovë", "elektricist" gjen "Elektriçar".
  const words = slugify(q).split('-').filter(Boolean);
  const found = words.length
    ? items.filter((m) => { const t = slugify([m.full_name, m.category_name, m.city_name, m.description].join(' ')); return words.every((w) => t.includes(w)); })
    : items;
  const list = sort === 'top'
    ? [...found].sort((a, b) => b.avg_rating - a.avg_rating || b.review_count - a.review_count)
    : found;
  return (
    <>
      {items.length > 1 && (
        <input className="search" type="search" placeholder="Kërko me emër, p.sh. Genc" aria-label="Kërko mjeshtër me emër" value={q} onChange={(e) => setQ(e.target.value)} />
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
          : <div className="state"><strong>Nuk u gjet asnjë mjeshtër</strong>{q ? 'Provo një emër tjetër ose fshi kërkimin.' : 'Provo një qytet ose profesion tjetër, ose posto një kërkesë më poshtë.'}</div>}
      </div>
    </>
  );
}
