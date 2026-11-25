import Link from 'next/link';
import './globals.css';
import AuthNav from '@/components/AuthNav';
import HashRedirect from '@/components/HashRedirect';
import { SITE } from '@/lib/util';

export const metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Thirr Mjeshtrin – gjej mjeshtër në Kosovë', template: '%s | Thirr Mjeshtrin' },
  description: 'Gjej hidraulik, elektricist, murator dhe mjeshtra të tjerë në qytetin tënd dhe telefono drejtpërdrejt.',
  openGraph: { siteName: 'Thirr Mjeshtrin', locale: 'sq_AL', type: 'website' },
  alternates: { canonical: '/' },
};
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#12213B' };

export default function RootLayout({ children }) {
  return (
    <html lang="sq">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..125,400..800&display=swap" />
      </head>
      <body>
        <HashRedirect />
        <header>
          <Link className="logo" href="/">Thirr<b>Mjeshtrin</b></Link>
          <AuthNav />
        </header>
        <main id="app">{children}</main>
        <footer>
          <div className="wrap">
            <Link className="logo" href="/">Thirr<b>Mjeshtrin</b></Link>
            <p>Katalog mjeshtrash në Kosovë. Gjej mjeshtrin e duhur dhe kontakto direkt.</p>
            <div className="fl">
              <Link href="/">Gjej mjeshtër</Link>
              <Link href="/kerkese">Posto kërkesë</Link>
              <Link href="/#si-funksionon">Si funksionon</Link>
              <Link href="/#pyetjet">Pyetjet</Link>
              <Link href="/hyr">Hyr si mjeshtër</Link>
            </div>
            <small>© {new Date().getFullYear()} Thirr Mjeshtrin</small>
          </div>
        </footer>
      </body>
    </html>
  );
}
