/** @type {import('next').NextConfig} */
export default {
  images: { remotePatterns: [{ protocol: 'https', hostname: 'yegevgtlwlebiqbzqjbp.supabase.co' }] },
  poweredByHeader: false,
  // Disa shfletues kërkojnë /favicon.ico vetë; e çojmë te ikona e faqes.
  async redirects() { return [{ source: '/favicon.ico', destination: '/icon.svg', permanent: true }]; },
};
