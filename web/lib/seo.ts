import type { Metadata } from 'next';

/**
 * The OpenGraph block for one page.
 *
 * **This exists because Next merges `metadata` shallowly.** A page that sets
 * its own `openGraph` replaces the root layout's object outright rather than
 * merging into it, so the site-wide parts -- `og:site_name`, `og:locale`,
 * `og:type` -- silently vanish from exactly the pages that bothered to write a
 * good title. The same shallow replacement drops the file-based `og:image` on
 * nested dynamic routes, which is how the city and provider pages ended up
 * previewing with no card image at all while `/kako-rangiramo`, which sets no
 * `openGraph`, had one.
 *
 * So every page that wants a per-page title goes through here, and no page
 * hand-writes an `openGraph` object. The image is referenced by its stable
 * path rather than by the hashed URL Next generates, which serves the same
 * bytes and does not change when the image does.
 */
export function openGraph(opts: {
  title: string;
  description: string;
  /** Route-relative; resolved against `metadataBase`. */
  path: string;
}): Metadata['openGraph'] {
  return {
    type: 'website',
    locale: 'hr_HR',
    siteName: 'Pogrebne usluge',
    title: opts.title,
    description: opts.description,
    url: opts.path,
    images: ['/opengraph-image'],
  };
}
