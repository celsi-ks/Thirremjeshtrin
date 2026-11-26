export const SITE = 'https://thirremjeshtrin-ks.com';

/** "Fushë Kosovë" -> "fushe-kosove", "Dyer & Dritare" -> "dyer-dritare" */
export function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/ë/g, 'e').replace(/ç/g, 'c')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const craftsmanPath = (m) => `/mjeshtri/${slugify(m.full_name) || 'mjeshtri'}-${m.id}`;
export const idFromSlug = (slug) => (String(slug).match(UUID) || [])[0] || null;

export const listPath = (cat, city) =>
  cat && city ? `/${slugify(cat.name)}/${slugify(city.name)}` : cat ? `/${slugify(cat.name)}` : city ? `/mjeshtra-ne/${slugify(city.name)}` : '/';

/** Numri në formatin ndërkombëtar pa "+": 044 123 456 -> 38344123456 */
export function intlPhone(p) {
  let d = String(p || '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = '383' + d.slice(1);
  return d;
}

export const initials = (name) =>
  String(name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export const fmtDate = (d) => new Date(d).toLocaleDateString('sq-AL', { day: 'numeric', month: 'short', year: 'numeric' });

export function ago(d) {
  const m = Math.round((Date.now() - new Date(d)) / 6e4);
  return m < 60 ? `${Math.max(m, 1)} min më parë` : m < 1440 ? `${Math.round(m / 60)} orë më parë` : `${Math.round(m / 1440)} ditë më parë`;
}

export const ICONS = {
  'Hidraulik': '🔧', 'Elektriçar': '⚡', 'Murator': '🧱', 'Moler': '🎨', 'Dyer & Dritare': '🚪', 'Pastrim': '🧹',
  'Kanalizim': '🚰', 'Servis kaldajash': '🔥', 'Klima servis': '❄️', 'Bravatar': '🔑', 'Mekanik': '🚗',
  'Autoelektricist': '🔋', 'Parketar': '🪵', 'Kopshtar': '🌿', 'Limar': '🏠', 'Izolues': '🧊', 'Saldues': '🔩',
  'Tapecier': '🛋️', 'Vulkanizer': '🛞', 'Alumin dhe PVC': '🪟', 'Autolarje & Detaling': '🚿', 'Servis i teknikës së bardhë': '🧺',
  // Emrat e rinj (nëntor 2026)
  'Hidraulikë & Instalime Uji': '🔧', 'Elektrikë & Energji': '⚡', 'Ndërtim & Murim': '🧱', 'Lyerje & Gips': '🎨',
  'Pastrim & Mirëmbajtje': '🧹', 'Saldim & Konstruksione Metalike': '🔩', 'Ngrohje & Kaldaja': '🔥', 'Bravari & Çelësa': '🔑',
  'Autoelektrikë': '🔋', 'Klimë & Ventilim': '❄️', 'Elektronikë & Elektroservis': '🔌', 'Llamarinë & Olluqe': '🌧️',
  'Vullkanizim & Goma': '🛞', 'Automjete': '🚗', 'Tapeceri': '🛋️', 'Parket & Laminat': '🪵', 'Alumin & PVC': '🪟',
  'Fasada & Izolime': '🧊', 'Kopshtari & Oborr': '🌿', 'Çati & Kulme': '🏠', 'Keramikë & Pllaka': '🛁', 'Kompjuter/IT': '💻',
};
