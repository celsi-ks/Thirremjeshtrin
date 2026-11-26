import Link from 'next/link';
import ContactButtons from './ContactButtons';
import { craftsmanPath, initials } from '@/lib/util';

export function Stars({ value }) {
  const n = Math.round(+value || 0);
  return <span className="stars" aria-hidden="true">{'★'.repeat(n)}<i>{'★'.repeat(5 - n)}</i></span>;
}

export function Rating({ m }) {
  if (!m.review_count) return <span className="rate mut">Ende pa vlerësime</span>;
  return (
    <span className="rate" aria-label={`Nota ${(+m.avg_rating).toFixed(1)} nga 5`}>
      <Stars value={m.avg_rating} /> <b>{(+m.avg_rating).toFixed(1)}</b>{' '}
      <span className="mut">({m.review_count} {m.review_count === 1 ? 'vlerësim' : 'vlerësime'})</span>
    </span>
  );
}

export function Avatar({ m, big }) {
  const cls = 'av' + (big ? ' big' : '');
  // eslint-disable-next-line @next/next/no-img-element
  return m.photo_url ? <img className={cls} src={m.photo_url} alt="" loading="lazy" /> : <span className={cls + ' ini'} aria-hidden="true">{initials(m.full_name)}</span>;
}

export function Verified({ m }) {
  return m.verified ? <> <span className="ver" title="Mjeshtri është verifikuar nga Thirr Mjeshtrin">✔ I verifikuar</span></> : null;
}

export function Urgent({ m }) {
  return m.urgent ? <span className="urg" title="Ky mjeshtër pranon thirrje urgjente, edhe jashtë orarit">Thirrje urgjente</span> : null;
}

/** Shërbimet si etiketa; në kartë shfaqen vetëm disa të parat. */
export function Services({ m, max }) {
  const s = m.services || [];
  if (!s.length) return null;
  const shown = max ? s.slice(0, max) : s;
  return <div className="svcs">{shown.map((x) => <span key={x}>{x}</span>)}{s.length > shown.length && <span className="more">+{s.length - shown.length}</span>}</div>;
}

export function CraftsmanCard({ m }) {
  return (
    <article className="card">
      <div className="ch">
        <Avatar m={m} />
        <div>
          <h3><Link className="cl" href={craftsmanPath(m)}>{m.full_name}</Link><Verified m={m} /></h3>
          <div className="mut" style={{ marginTop: 4 }}><span className="tag">{m.category_name}</span>{m.city_name}</div>
          <div style={{ marginTop: 6 }}><Rating m={m} /> <Urgent m={m} /></div>
        </div>
      </div>
      <Services m={m} max={3} />
      {m.description && <p className="clamp">{m.description}</p>}
      <ContactButtons m={m} />
    </article>
  );
}
