import { SITE_ORIGIN } from './env';
import type { City, Entity, WeekDay, WorkingHours } from './database.types';

/**
 * JSON-LD builders.
 *
 * Search is this product's entire distribution channel (SPEC_frontend.md), and
 * a directory is exactly the shape of site structured data was designed for:
 * it lets a provider page be understood as a business rather than as prose that
 * happens to contain a phone number.
 *
 * **Everything here is a restatement of what the page already shows.** Marking
 * up a fact the reader cannot see is the line between structured data and spam,
 * and it is also the rule that keeps this file honest: if a field is null in
 * the database it is omitted here, never guessed (SPEC.md -> Never: fabricating
 * business data).
 *
 * Deliberately absent, and each for a reason:
 *
 * - **No `geo`.** `latitude`/`longitude` are null for all 45 providers.
 * - **No `aggregateRating` or `review`.** No review data exists, and inventing
 *   it is a Never. This is the single most abused property in local schema and
 *   the product will not have one until it has real reviews.
 * - **No `priceRange`.** Almost every `price_from` is null, and a guessed
 *   price band on a funeral is the worst possible thing to be wrong about.
 * - **No `Organization` for the site itself.** It would have to name a
 *   publisher, and no legal person stands behind the site yet -- the same gap
 *   `/privatnost` records. An `Organization` node with no real identity is a
 *   claim, not markup.
 */

/** Anything with `@type`, ready to be handed to `<JsonLd>`. */
export type Thing = Record<string, unknown>;

/** Absolute, because JSON-LD `@id` and `url` must not be relative. */
function abs(path: string): string {
  return `${SITE_ORIGIN}${path}`;
}

/**
 * schema.org's day names, in the order `working_hours` uses.
 *
 * A day **absent** from `working_hours` means unknown, which is deliberately
 * distinct from closed (`database.types.ts`). Unknown days are omitted from the
 * output entirely rather than emitted as closed -- telling a family a provider
 * is shut when it is not is the worst failure this data can produce, and that
 * is as true in markup a crawler reads as on the page.
 */
const SCHEMA_DAY: Record<WeekDay, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

function openingHours(hours: WorkingHours | null, available24_7: boolean): Thing[] | undefined {
  // A 24/7 provider is one specification covering every day, which is what
  // `available_24_7` means and is simpler than seven identical entries.
  if (available24_7) {
    return [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: Object.values(SCHEMA_DAY),
        opens: '00:00',
        closes: '23:59',
      },
    ];
  }

  if (!hours) return undefined;

  const spec = (Object.keys(SCHEMA_DAY) as WeekDay[]).flatMap((day) => {
    const value = hours[day];
    // Unknown (absent) and `by_arrangement` both have no time range to state.
    // `closed: true` is a real fact, and schema.org expresses it as a day with
    // identical opens and closes.
    if (!value) return [];
    if ('closed' in value) {
      return [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: SCHEMA_DAY[day],
          opens: '00:00',
          closes: '00:00',
        },
      ];
    }
    if ('by_arrangement' in value) return [];
    return [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: SCHEMA_DAY[day],
        opens: value.from,
        closes: value.to,
      },
    ];
  });

  return spec.length > 0 ? spec : undefined;
}

/**
 * One provider, as a business.
 *
 * `FuneralHome` is a real schema.org type and a subtype of `LocalBusiness`,
 * so it is both more specific and no riskier than the generic one.
 */
export function funeralHome(provider: Entity, city: City, servicesOffered: string[]): Thing {
  const path = `/pogrebne-usluge/${city.slug}/${provider.slug}`;
  const primaryPhone = provider.phones?.[0]?.number;
  const hours = openingHours(provider.working_hours, provider.available_24_7);

  return {
    '@context': 'https://schema.org',
    '@type': 'FuneralHome',
    '@id': abs(path),
    url: abs(path),
    name: provider.name,
    address: {
      '@type': 'PostalAddress',
      // Head office only -- never implies branch coverage, same caveat the
      // page itself carries.
      ...(provider.address ? { streetAddress: provider.address } : {}),
      ...(provider.postal_code ? { postalCode: provider.postal_code } : {}),
      addressLocality: city.name,
      addressCountry: 'HR',
    },
    ...(primaryPhone ? { telephone: primaryPhone } : {}),
    ...(provider.email ? { email: provider.email } : {}),
    // The provider's own site, which is a different thing from `url` above.
    ...(provider.website ? { sameAs: [provider.website] } : {}),
    ...(provider.logo_url ? { logo: provider.logo_url } : {}),
    // OIB is the Croatian tax identifier, which is exactly what `taxID` is for.
    ...(provider.oib ? { taxID: provider.oib } : {}),
    ...(hours ? { openingHoursSpecification: hours } : {}),
    ...(servicesOffered.length > 0
      ? {
          makesOffer: servicesOffered.map((name) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name },
          })),
        }
      : {}),
    areaServed: { '@type': 'City', name: city.name },
  };
}

/**
 * The provider list on a city page, in the order the page renders it.
 *
 * Order is the point: this page's whole claim is that the ranking is explained
 * and not sold (`/kako-rangiramo`), so the list a crawler reads must be the
 * list a reader sees.
 */
export function providerItemList(
  providers: readonly { name: string; slug: string }[],
  citySlug: string,
): Thing {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: providers.length,
    itemListElement: providers.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: abs(`/pogrebne-usluge/${citySlug}/${p.slug}`),
    })),
  };
}

/** The trail to the current page. `name` should match the visible heading. */
export function breadcrumbs(trail: readonly { name: string; path: string }[]): Thing {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: abs(crumb.path),
    })),
  };
}
