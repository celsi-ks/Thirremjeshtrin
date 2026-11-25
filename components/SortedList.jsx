'use client';
import { useState } from 'react';
import { CraftsmanCard } from './ui';

export default function SortedList({ items }) {
  const [sort, setSort] = useState('new');
  const list = sort === 'top'
    ? [...items].sort((a, b) => b.avg_rating - a.avg_rating || b.review_count - a.review_count)
    : items;
  return (
    <>
      <div className="bar">
        <p className="count" aria-live="polite">{items.length} {items.length === 1 ? 'mjeshtër' : 'mjeshtra'}</p>
        <label className="sort"><span>Rendit</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="new">Më të rinjtë</option>
            <option value="top">Më të vlerësuarit</option>
          </select>
        </label>
      </div>
      <div className="list">
        {list.length ? list.map((m) => <CraftsmanCard key={m.id} m={m} />)
          : <div className="state"><strong>Nuk u gjet asnjë mjeshtër</strong>Provo një qytet ose profesion tjetër, ose posto një kërkesë më poshtë.</div>}
      </div>
    </>
  );
}
