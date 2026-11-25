'use client';
import { useEffect } from 'react';
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
