import Link from 'next/link';

const steps = [
  ['Kërko', 'Zgjidh profesionin dhe qytetin që të duhet.'],
  ['Shiko profilin', 'Lexo përshkrimin, vlerësimet dhe shiko fotot e punëve.'],
  ['Kontakto direkt', 'Telefono ose shkruaj në WhatsApp. Marrëveshja dhe pagesa janë mes jush.'],
];
export const FAQ = [
  ['A kushton përdorimi i faqes?', 'Jo. Kërkimi dhe kontakti me mjeshtrat janë falas për klientët.'],
  ['Si paguhet mjeshtri?', 'Pagesa bëhet direkt te mjeshtri, sipas marrëveshjes suaj. Faqja nuk merr pagesa nga klientët.'],
  ['A kontrollohen mjeshtrat?', 'Çdo profil kontrollohet nga ne para se të shfaqet publikisht. Mjeshtrat me shenjën ✔ I verifikuar i kemi kontrolluar edhe vetë. Lexo vlerësimet e klientëve të tjerë dhe merr çmimin me mesazh para se të fillojë puna.'],
  ['Nuk kam kohë të kërkoj. Çfarë bëj?', 'Posto një kërkesë: shkruaj çfarë pune të duhet dhe në cilin qytet. Mjeshtrat e atij profesioni e shohin dhe të thërrasin vetë.'],
  ['Si lë vlerësim për një mjeshtër?', 'Hap profilin e mjeshtrit, hyr me email dhe zgjidh nga 1 deri në 5 yje. Mund ta ndryshosh ose ta fshish vlerësimin më vonë.'],
  ['Si regjistrohem si mjeshtër?', "Kliko 'Hyr', krijo llogari me email dhe plotëso profilin me foto dhe punët e tua. Pasi ta aprovojmë, shfaqesh në faqe dhe sheh kërkesat e klientëve."],
  ['Si të gjej mjeshtër në qytetin tim?', 'Zgjidh qytetin dhe profesionin te filtrat në krye të faqes.'],
];

export default function Info() {
  const ld = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
  return (
    <div id="info">
      <section className="sec" id="si-funksionon"><div className="wrap">
        <h2>Si funksionon</h2><p className="sub">Tre hapa, pa formularë të gjatë.</p>
        <div className="steps">{steps.map(([t, d], i) => <div className="step" key={t}><span className="n">{i + 1}</span><h3>{t}</h3><p>{d}</p></div>)}</div>
      </div></section>
      <section className="sec" id="pyetjet"><div className="wrap faq">
        <h2>Pyetje të shpeshta</h2>
        {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
      </div></section>
      <section className="sec"><div className="wrap"><div className="band">
        <div><h2>Je mjeshtër?</h2><p>Shtoje veten në katalog dhe merr thirrje nga klientë në qytetin tënd.</p></div>
        <Link className="btn" href="/hyr">Regjistrohu falas</Link>
      </div></div></section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </div>
  );
}
