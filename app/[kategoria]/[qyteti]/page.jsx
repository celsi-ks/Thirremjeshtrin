import { notFound } from 'next/navigation';
import ListPage, { listTitle } from '@/components/ListPage';
import { findCategory, findCity, getCraftsmen } from '@/lib/data';
import { listPath } from '@/lib/util';

export const revalidate = 300;
// Faqet krijohen në kërkesën e parë dhe ruhen (ISR) për 5 minuta.
export async function generateStaticParams() { return []; }

async function load(params) {
  const p = await params;
  const [cat, city] = await Promise.all([findCategory(p.kategoria), findCity(p.qyteti)]);
  return { cat, city };
}

export async function generateMetadata({ params }) {
  const { cat, city } = await load(params);
  if (!cat || !city) return {};
  const n = (await getCraftsmen({ categoryId: cat.id, cityId: city.id })).length;
  return {
    title: listTitle(cat, city),
    description: `Po kërkon ${cat.name.toLowerCase()} në ${city.name}? ${n ? n + ' mjeshtra me numër telefoni dhe vlerësime' : 'Posto kërkesë falas dhe mjeshtrat të thërrasin'}. Kontakto direkt, pa ndërmjetës.`,
    alternates: { canonical: listPath(cat, city) },
    robots: n ? undefined : { index: false },
  };
}

export default async function Page({ params }) {
  const { cat, city } = await load(params);
  if (!cat || !city) notFound();
  return <ListPage cat={cat} city={city} />;
}
