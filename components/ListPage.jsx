import Link from 'next/link';
import { getCategories, getCities, getCraftsmen } from '@/lib/data';
import { listPath } from '@/lib/util';
import { FilterSelects, CategoryButtons } from './Filters';
import SortedList from './SortedList';
import Info from './Info';

export function listTitle(cat, city) {
  if (cat && city) return `${cat.name} në ${city.name}`;
  if (cat) return `${cat.name} në Kosovë`;
  if (city) return `Mjeshtra në ${city.name}`;
  return null;
}

/** Faqja e listës: kryefaqja dhe faqet /profesioni, /profesioni/qyteti, /mjeshtra-ne/qyteti. */
export default async function ListPage({ cat = null, city = null }) {
  const [cats, cities, items] = await Promise.all([
    getCategories(), getCities(), getCraftsmen({ categoryId: cat?.id, cityId: city?.id }),
  ]);
  const title = listTitle(cat, city);
  // Lidhje të brendshme për Google: qytetet ku ka mjeshtra të këtij profesioni, ose profesionet në këtë qytet.
  const related = cat && !city ? [...new Map(items.map((m) => [m.city_id, cities.find((c) => c.id === m.city_id)])).values()].filter(Boolean)
    : city && !cat ? [...new Map(items.map((m) => [m.category_id, cats.find((c) => c.id === m.category_id)])).values()].filter(Boolean) : [];
  return (
    <>
      <section className="hero">
        <div className="wrap">
          {title && (
            <p className="crumbs"><Link href="/">Kryefaqja</Link>{cat && city && <> › <Link href={listPath(cat)}>{cat.name}</Link></>} › {title}</p>
          )}
          <h1>{title ? `${title}` : 'Gjej mjeshtrin e duhur sot.'}</h1>
          <p>{title ? `${items.length ? items.length + ' ' + (items.length === 1 ? 'mjeshtër' : 'mjeshtra') + ' me numër telefoni' : 'Ende pa mjeshtra këtu'}. Zgjidh dhe telefono drejtpërdrejt, pa ndërmjetës.` : 'Zgjidh profesionin dhe qytetin, pastaj telefono drejtpërdrejt.'}</p>
          <FilterSelects cats={cats} cities={cities} cat={cat} city={city} />
        </div>
      </section>
      <CategoryButtons cats={cats} cat={cat} city={city} />
      <div className="wrap">
        <SortedList items={items} />
        {related.length > 0 && (
          <div style={{ margin: '-30px 0 40px' }}>
            <h2 style={{ fontSize: '1.05rem', margin: 0 }}>{cat ? `${cat.name} sipas qytetit` : `Profesionet në ${city.name}`}</h2>
            <div className="links">{related.map((r) => <Link key={r.id} href={cat ? listPath(cat, r) : listPath(r, city)}>{cat ? `${cat.name} në ${r.name}` : r.name}</Link>)}</div>
          </div>
        )}
        <div className="band post">
          <div><h2>Nuk ke kohë të kërkosh?</h2><p>Posto punën që të duhet dhe mjeshtrat e atij profesioni të thërrasin vetë.</p></div>
          <Link className="btn" href="/kerkese">Posto kërkesë falas</Link>
        </div>
      </div>
      <Info />
    </>
  );
}
