import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { getCraftsman, getReviews, getCategories, getCities } from '@/lib/data';
import { craftsmanPath, listPath, intlPhone, SITE } from '@/lib/util';
import { Avatar, Rating, Verified } from '@/components/ui';
import ContactButtons, { ViewLogger } from '@/components/ContactButtons';
import Reviews from '@/components/Reviews';

export const revalidate = 300;
// Faqet krijohen në kërkesën e parë dhe ruhen (ISR) për 5 minuta.
export async function generateStaticParams() { return []; }

export async function generateMetadata({ params }) {
  const m = await getCraftsman((await params).slug);
  if (!m) return { title: 'Mjeshtri nuk u gjet', robots: { index: false } };
  const title = `${m.full_name} – ${m.category_name} në ${m.city_name}`;
  const description = (m.description ? m.description.slice(0, 140) + (m.description.length > 140 ? '…' : '') + ' ' : '')
    + `${m.category_name} në ${m.city_name}. Telefono direkt${m.review_count ? `, nota ${(+m.avg_rating).toFixed(1)}/5 nga ${m.review_count} vlerësime` : ''}.`;
  return {
    title, description,
    alternates: { canonical: craftsmanPath(m) },
    openGraph: { title, description, url: craftsmanPath(m), type: 'profile', images: m.photo_url ? [m.photo_url] : undefined },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const m = await getCraftsman(slug);
  if (!m) notFound();
  const path = craftsmanPath(m);
  if (decodeURIComponent(`/mjeshtri/${slug}`) !== path) permanentRedirect(path);
  const [reviews, cats, cities] = await Promise.all([getReviews(m.id), getCategories(), getCities()]);
  const cat = cats.find((c) => c.id === m.category_id), city = cities.find((c) => c.id === m.city_id);

  const ld = {
    '@context': 'https://schema.org', '@type': 'HomeAndConstructionBusiness',
    name: m.full_name, url: SITE + path, telephone: '+' + intlPhone(m.phone),
    description: m.description || undefined, image: m.photo_url || undefined,
    address: { '@type': 'PostalAddress', addressLocality: m.city_name, addressCountry: 'XK' },
    areaServed: m.city_name,
    aggregateRating: m.review_count ? { '@type': 'AggregateRating', ratingValue: (+m.avg_rating).toFixed(1), reviewCount: m.review_count, bestRating: 5, worstRating: 1 } : undefined,
    review: reviews.slice(0, 10).map((r) => ({
      '@type': 'Review', author: { '@type': 'Person', name: r.author_name || 'Klient' }, datePublished: r.created_at.slice(0, 10),
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 }, reviewBody: r.comment || undefined,
    })),
  };

  return (
    <div className="wrap narrow">
      <ViewLogger id={m.id} />
      <p className="back">
        <Link href="/" className="back" style={{ margin: 0 }}>Kryefaqja</Link>
        {cat && <> › <Link className="back" style={{ margin: 0 }} href={listPath(cat)}>{cat.name}</Link></>}
        {cat && city && <> › <Link className="back" style={{ margin: 0 }} href={listPath(cat, city)}>{city.name}</Link></>}
      </p>
      <div className="dh">
        <Avatar m={m} big />
        <div>
          <h1>{m.full_name}</h1>
          <div className="mut"><span className="tag">{m.category_name}</span>{m.city_name}<Verified m={m} /></div>
          <div style={{ marginTop: 8 }}><Rating m={m} /></div>
        </div>
      </div>
      {m.description && <p className="desc">{m.description}</p>}
      <ContactButtons m={m} />
      {m.gallery?.length > 0 && (
        <section className="rv">
          <h2>Punët e mia</h2>
          <div className="gal">
            {m.gallery.map((u, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <a key={u} href={u} target="_blank" rel="noopener"><img src={u} alt={`${m.category_name} – puna ${i + 1} nga ${m.full_name}`} loading="lazy" /></a>
            ))}
          </div>
        </section>
      )}
      <Reviews craftsmanId={m.id} initial={reviews} path={path} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </div>
  );
}
