import { getCategories, getCities, getCraftsmen } from '@/lib/data';
import { SITE, listPath, craftsmanPath } from '@/lib/util';

export const revalidate = 3600;

/** Vetëm faqet që kanë mjeshtra, që Google të mos indeksojë faqe bosh. */
export default async function sitemap() {
  const [cats, cities, all] = await Promise.all([getCategories(), getCities(), getCraftsmen()]);
  const byId = (list, id) => list.find((x) => x.id === id);
  const urls = new Map([['/', null], ['/kerkese', null]]);
  for (const m of all) {
    const cat = byId(cats, m.category_id), city = byId(cities, m.city_id);
    if (cat) urls.set(listPath(cat), m.created_at);
    if (cat && city) urls.set(listPath(cat, city), m.created_at);
    if (city) urls.set(listPath(null, city), m.created_at);
    urls.set(craftsmanPath(m), m.created_at);
  }
  return [...urls].map(([path, d]) => ({
    url: SITE + path,
    lastModified: d ? new Date(d) : new Date(),
    changeFrequency: path.startsWith('/mjeshtri/') ? 'weekly' : 'daily',
    priority: path === '/' ? 1 : path.startsWith('/mjeshtri/') ? 0.6 : 0.8,
  }));
}
