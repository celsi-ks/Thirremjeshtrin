'use client';
import { useEffect, useState } from 'react';
import { sb } from '@/lib/supabase';
import { intlPhone } from '@/lib/util';

/** Numërojmë shikimet dhe klikimet që mjeshtri të shohë sa klientë e kontaktuan. */
export const logEvent = (id, kind) => sb().rpc('log_event', { p_id: id, p_kind: kind }).then(() => {}, () => {});

export default function ContactButtons({ m }) {
  const tel = intlPhone(m.phone);
  return (
    <div className="acts">
      <a className="btn" href={`tel:+${tel}`} onClick={() => logEvent(m.id, 'tel')}>Telefono</a>
      <a className="btn wa" href={`https://wa.me/${tel}`} target="_blank" rel="noopener" onClick={() => logEvent(m.id, 'wa')}>WhatsApp</a>
    </div>
  );
}

export function ViewLogger({ id }) {
  useEffect(() => { logEvent(id, 'view'); }, [id]);
  return null;
}

/** Ndaj profilin: në telefon hapet menyja e ndarjes (WhatsApp, Viber...), në kompjuter kopjohet lidhja. */
export function ShareButton({ title }) {
  const [done, setDone] = useState(false);
  async function share() {
    const url = location.href.split('#')[0];
    try {
      if (navigator.share) return await navigator.share({ title, url });
      await navigator.clipboard.writeText(url);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch { /* përdoruesi e mbylli menynë */ }
  }
  return <button type="button" className="linkbtn share" onClick={share}>{done ? '✔ Lidhja u kopjua' : 'Ndaj këtë mjeshtër'}</button>;
}
