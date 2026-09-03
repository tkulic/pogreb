import type { MetadataRoute } from 'next';
import { SITE_HOST } from '@/lib/env';
import { getCities, getCityProviders, getServicePageParams } from '@/lib/queries';

/**
 * The sitemap.
 *
 * **What is deliberately absent matters as much as what is here:**
 *
 * - **No filter-state URLs.** `?situacija=…&nacin=…` combinations are not
 *   canonical pages — each carries `rel=canonical` back to the bare city page.
 *   Listing them would offer search engines a combinatorial set of
 *   near-identical pages, which is the definition of thin content.
 * - **No `/specimen`.** It is a development page and is `noindex`.
 * - **No service page that failed the ≥3-and-fewer-than-all rule**, because
 *   `getServicePageParams` is the single place that rule is evaluated.
 */
const BASE = SITE_HOST ? `https://${SITE_HOST}` : 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cities = await getCities();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/sto-uciniti-prvo`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE}/kako-rangiramo`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/nase-obecanje`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${BASE}/pogrebne-usluge/${city.slug}`,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const providerPages: MetadataRoute.Sitemap = (
    await Promise.all(
      cities.map(async (city) => {
        const providers = await getCityProviders(city.id);
        return providers.map((p) => ({
          url: `${BASE}/pogrebne-usluge/${city.slug}/${p.slug}`,
          // `last_verified_at` is internal and never displayed, but it is the
          // honest signal of when a record actually changed.
          lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        }));
      }),
    )
  ).flat();

  const servicePages: MetadataRoute.Sitemap = (await getServicePageParams()).map(
    ({ grad, usluga }) => ({
      url: `${BASE}/pogrebne-usluge/${grad}/usluga/${usluga}`,
      changeFrequency: 'monthly',
      priority: 0.6,
    }),
  );

  return [...staticPages, ...cityPages, ...providerPages, ...servicePages];
}
