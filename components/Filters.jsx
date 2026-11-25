'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { listPath, ICONS } from '@/lib/util';

const VISIBLE = 8;

/** Zgjedhja e profesionit/qytetit hap faqen përkatëse (p.sh. /hidraulik/prishtine), që Google ta indeksojë. */
export function FilterSelects({ cats, cities, cat, city }) {
  const router = useRouter();
  const go = (c, y) => router.push(listPath(cats.find((x) => x.id === +c), cities.find((x) => x.id === +y)), { scroll: false });
  return (
    <div className="filters">
      <label><span>Profesioni</span>
        <select value={cat?.id || ''} onChange={(e) => go(e.target.value, city?.id)}>
          <option value="">Të gjitha profesionet</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      <label><span>Qyteti</span>
        <select value={city?.id || ''} onChange={(e) => go(cat?.id, e.target.value)}>
          <option value="">Të gjitha qytetet</option>
          {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
    </div>
  );
}

export function CategoryButtons({ cats, cat, city }) {
  const [open, setOpen] = useState(false);
  const list = open ? cats : cats.slice(0, VISIBLE);
  return (
    <section className="wrap kat">
      <h2>Çfarë mjeshtri të duhet?</h2>
      <div className="kat-grid">
        {list.map((c) => {
          const on = cat?.id === c.id;
          return (
            <Link key={c.id} className="kat-btn" href={listPath(on ? null : c, city)} scroll={false} aria-current={on ? 'page' : undefined}>
              <i>{ICONS[c.name] || '🛠️'}</i>{c.name}
            </Link>
          );
        })}
      </div>
      {cats.length > VISIBLE && (
        <button type="button" className="kat-more" onClick={() => setOpen(!open)}>{open ? 'Shiko më pak' : `Shiko të gjitha (${cats.length})`}</button>
      )}
    </section>
  );
}
