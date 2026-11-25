'use client';
import { useEffect } from 'react';

/** Lidhjet e vjetra (#m/<id>, #hyr, #profili, #admin, #kerkese) çojnë te faqet e reja. */
export default function HashRedirect() {
  useEffect(() => {
    const h = location.hash.slice(1);
    if (!h) return;
    const map = { hyr: '/hyr', profili: '/profili', admin: '/admin', kerkese: '/kerkese' };
    if (map[h]) return location.replace(map[h]);
    if (h.startsWith('admin/')) return location.replace('/admin?tab=' + h.slice(6));
    if (h.startsWith('m/')) return location.replace('/mjeshtri/m-' + h.slice(2));
  }, []);
  return null;
}
