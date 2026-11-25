import Link from 'next/link';

export const metadata = { title: 'Faqja nuk u gjet', robots: { index: false } };

export default function NotFound() {
  return (
    <div className="wrap narrow">
      <h1>Faqja nuk u gjet</h1>
      <p className="mut">Mjeshtri ose faqja që kërkon mund të jetë hequr.</p>
      <Link className="btn" href="/">Kthehu te lista e mjeshtrave</Link>
    </div>
  );
}
