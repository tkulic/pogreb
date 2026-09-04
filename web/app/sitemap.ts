import type { MetadataRoute } from 'next';
import { SITE_ORIGIN } from '@/lib/env';
import { PROVIDER_FORM_PUBLIC } from '@/lib/nav';
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
 * - **No `/za-pogrebnike/hvala`.** It is reachable only by Netlify's redirect
 *   after a submission, and it is `noindex` for the same reason.
 * - **No service page that failed the ≥3-and-fewer-than-all rule**, because
 *   `getServicePageParams` is the single place that rule is evaluated.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cities = await getCities();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_ORIGIN}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_ORIGIN}/sto-uciniti-prvo`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_ORIGIN}/kako-rangiramo`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_ORIGIN}/nase-obecanje`, changeFrequency: 'yearly', priority: 0.3 },
    // Omitted while PROVIDER_FORM_PUBLIC is false: a page kept out of the
    // navigation for a compliance reason must not be handed to a crawler
    // instead. See lib/nav.ts.
    ...(PROVIDER_FORM_PUBLIC
      ? [
          {
            url: `${SITE_ORIGIN}/za-pogrebnike`,
            changeFrequency: 'yearly' as const,
            priority: 0.3,
          },
        ]
      : []),
  ];

  const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${SITE_ORIGIN}/pogrebne-usluge/${city.slug}`,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const providerPages: MetadataRoute.Sitemap = (
    await Promise.all(
      cities.map(async (city) => {
        const providers = await getCityProviders(city.id);
        return providers.map((p) => ({
          url: `${SITE_ORIGIN}/pogrebne-usluge/${city.slug}/${p.slug}`,
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
      url: `${SITE_ORIGIN}/pogrebne-usluge/${grad}/usluga/${usluga}`,
      changeFrequency: 'monthly',
      priority: 0.6,
    }),
  );

  return [...staticPages, ...cityPages, ...providerPages, ...servicePages];
}
