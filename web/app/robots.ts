import type { MetadataRoute } from 'next';
import { SITE_ORIGIN } from '@/lib/env';

/**
 * Crawling is welcome — search is this product's entire distribution channel.
 *
 * `/specimen` is disallowed because it is a development page, and the query
 * strings are disallowed because the flow's answers produce a combinatorial
 * set of URLs that all `rel=canonical` back to the bare city page. Blocking
 * them saves crawl budget for pages that are actually distinct; the canonical
 * tag is what makes it correct either way.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/specimen', '/*?situacija=', '/*?nacin=', '/*?korak='],
    },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
