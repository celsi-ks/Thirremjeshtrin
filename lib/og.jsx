/** Pamja (1200x630) që shfaqet kur lidhja ndahet në WhatsApp, Facebook, Viber etj. */
export const ogSize = { width: 1200, height: 630 };

export function OgCard({ kicker, title, sub, foot }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#12213B', color: '#fff', padding: '64px 72px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', fontSize: 40, fontWeight: 800 }}>Thirr<span style={{ color: '#FF7A33' }}>Mjeshtrin</span></div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {kicker && <div style={{ display: 'flex', fontSize: 34, color: '#FF7A33', fontWeight: 700, marginBottom: 12 }}>{kicker}</div>}
        <div style={{ display: 'flex', fontSize: title.length > 28 ? 64 : 80, fontWeight: 800, lineHeight: 1.08 }}>{title}</div>
        {sub && <div style={{ display: 'flex', fontSize: 36, color: '#C9D2E3', marginTop: 18 }}>{sub}</div>}
      </div>
      <div style={{ display: 'flex', fontSize: 28, color: '#A3AEC4' }}>{foot || 'thirremjeshtrin-ks.com'}</div>
    </div>
  );
}
