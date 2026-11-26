import { ImageResponse } from 'next/og';
import { OgCard, ogSize } from '@/lib/og';
import { getCraftsman } from '@/lib/data';

export const alt = 'Profili i mjeshtrit në Thirr Mjeshtrin';
export const size = ogSize;
export const contentType = 'image/png';
export const revalidate = 300;
export async function generateStaticParams() { return []; }

export default async function Image({ params }) {
  const m = await getCraftsman((await params).slug);
  const rating = m?.review_count ? `Nota ${(+m.avg_rating).toFixed(1)}/5 nga ${m.review_count} vlerësime` : null;
  return new ImageResponse(
    m ? <OgCard kicker={`${m.category_name} · ${m.city_name}`} title={m.full_name} sub={rating || 'Telefono ose shkruaj në WhatsApp direkt.'} foot={m.verified ? 'Mjeshtër i verifikuar · thirremjeshtrin-ks.com' : undefined} />
      : <OgCard title="Thirr Mjeshtrin" />,
    size,
  );
}
