'use client';
import { useEffect } from 'react';

/** Lidhjet e vjetra (#m/<id>, #hyr, #profili, #admin, #kerkese) çojnë te faqet e reja. */
export default function HashRedirect() {
  useEffect(() => {
    const h = location.hash.slice(1);
    if (!h) return;
    // Lidhja e rivendosjes së fjalëkalimit (edhe ajo e dërguar nga paneli i Supabase) hap faqen për fjalëkalim të ri.
    if (/(^|&)type=recovery(&|$)/.test(h) && location.pathname !== '/fjalekalimi') return location.replace('/fjalekalimi' + location.hash);
    const map = { hyr: '/hyr', profili: '/profili', admin: '/admin', kerkese: '/kerkese' };
    if (map[h]) return location.replace(map[h]);
    if (h.startsWith('admin/')) return location.replace('/admin?tab=' + h.slice(6));
    if (h.startsWith('m/')) return location.replace('/mjeshtri/m-' + h.slice(2));
  }, []);
  return null;
}
