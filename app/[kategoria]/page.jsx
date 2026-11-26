import { notFound, permanentRedirect } from 'next/navigation';
import ListPage, { listTitle } from '@/components/ListPage';
import { findCategory, findOldCategory, getCraftsmen } from '@/lib/data';
import { listPath } from '@/lib/util';

export const revalidate = 300;
// Faqet krijohen në kërkesën e parë dhe ruhen (ISR) për 5 minuta.
export async function generateStaticParams() { return []; }

export async function generateMetadata({ params }) {
  const cat = await findCategory((await params).kategoria);
  if (!cat) return {};
  const n = (await getCraftsmen({ categoryId: cat.id })).length;
  return {
    title: listTitle(cat),
    description: `${cat.name} në Kosovë: ${n || 'lista e'} mjeshtra me numër telefoni, vlerësime dhe foto punësh. Telefono direkt ose posto kërkesë falas.`,
    alternates: { canonical: listPath(cat) },
    robots: n ? undefined : { index: false },
  };
}

export default async function Page({ params }) {
  const slug = (await params).kategoria;
  const cat = await findCategory(slug);
  if (!cat) {
    const old = await findOldCategory(slug);
    if (old) permanentRedirect(listPath(old));
    notFound();
  }
  return <ListPage cat={cat} />;
}
