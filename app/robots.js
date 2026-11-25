import { SITE } from '@/lib/util';

export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/profili', '/hyr'] },
    sitemap: SITE + '/sitemap.xml',
    host: SITE,
  };
}
