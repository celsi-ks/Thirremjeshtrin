'use client';
import { useEffect, useState } from 'react';
import { sb } from './supabase';

/** Përdoruesi i hyrë (ose null) dhe nëse është administrator. ready=false derisa të lexohet sesioni. */
export function useUser() {
  const [state, setState] = useState({ user: null, isAdmin: false, ready: false });
  useEffect(() => {
    let alive = true;
    const load = async (user) => {
      let isAdmin = false;
      if (user) {
        const { data } = await sb().rpc('is_admin');
        isAdmin = data === true;
      }
      if (alive) setState({ user, isAdmin, ready: true });
    };
    sb().auth.getSession().then(({ data }) => load(data.session?.user || null));
    const { data: sub } = sb().auth.onAuthStateChange((ev, s) => {
      if (ev === 'SIGNED_IN' || ev === 'SIGNED_OUT' || ev === 'USER_UPDATED') setTimeout(() => load(s?.user || null));
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);
  return state;
}

/** Ruan faqen ku të kthehet përdoruesi pas hyrjes. */
export const loginHref = (next) => `/hyr?next=${encodeURIComponent(next)}`;
