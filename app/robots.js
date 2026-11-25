import { SITE } from '@/lib/util';

export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/profili', '/hyr', '/fjalekalimi'] },
    sitemap: SITE + '/sitemap.xml',
    host: SITE,
  };
}
