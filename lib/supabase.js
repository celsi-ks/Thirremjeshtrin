import { createClient } from '@supabase/supabase-js';

export const SB_URL = 'https://yegevgtlwlebiqbzqjbp.supabase.co';
export const SB_KEY = 'sb_publishable_cSCxE00EVabFMXOVAOS2Nw_98kToVML'; // çelës publik, i sigurt në faqe

let browserClient;
/** Klienti i shfletuesit: mban sesionin e hyrjes (localStorage). */
export function sb() {
  return (browserClient ??= createClient(SB_URL, SB_KEY));
}

/** Klienti i serverit: vetëm të dhëna publike, pa sesion. */
export function sbServer() {
  return createClient(SB_URL, SB_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
}
