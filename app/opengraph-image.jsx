import { ImageResponse } from 'next/og';
import { OgCard, ogSize } from '@/lib/og';

export const alt = 'Thirr Mjeshtrin – gjej mjeshtër në Kosovë';
export const size = ogSize;
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <OgCard kicker="Katalog mjeshtrash në Kosovë" title="Gjej mjeshtrin e duhur sot." sub="Hidraulik, elektricist, murator e më shumë. Telefono direkt." />,
    size,
  );
}
