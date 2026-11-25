import { notFound } from 'next/navigation';
import ListPage, { listTitle } from '@/components/ListPage';
import { findCity, getCraftsmen } from '@/lib/data';
import { listPath } from '@/lib/util';

export const revalidate = 300;
// Faqet krijohen në kërkesën e parë dhe ruhen (ISR) për 5 minuta.
export async function generateStaticParams() { return []; }

export async function generateMetadata({ params }) {
  const city = await findCity((await params).qyteti);
  if (!city) return {};
  const n = (await getCraftsmen({ cityId: city.id })).length;
  return {
    title: listTitle(null, city),
    description: `Mjeshtra në ${city.name}: hidraulik, elektricist, murator e të tjerë me numër telefoni dhe vlerësime. Telefono direkt.`,
    alternates: { canonical: listPath(null, city) },
    robots: n ? undefined : { index: false },
  };
}

export default async function Page({ params }) {
  const city = await findCity((await params).qyteti);
  if (!city) notFound();
  return <ListPage city={city} />;
}
