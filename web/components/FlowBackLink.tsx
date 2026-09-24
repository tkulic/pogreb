'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { answersToQuery, parseAnswers } from '@/lib/answers';

/**
 * "← Svi pogrebnici", back to the city listing with the flow's answers intact.
 *
 * **This exists so the detail page can be statically rendered.** Reading
 * `searchParams` in a server component opts the whole route into per-request
 * rendering in the App Router, no matter what `revalidate` says — and that one
 * line was enough to keep all 55 provider pages uncacheable, which is what
 * stalled crawling (`.seo/ANALYSIS_2026-09-24.md` → ROOT CAUSE). The answers
 * were never used for anything the page *renders*; they only had to survive
 * the round trip, so reading them in the browser costs nothing.
 *
 * `useSearchParams` requires a Suspense boundary during static rendering. The
 * fallback is the same link without the query — correct rather than empty: a
 * reader with no answers is exactly who gets the bare listing.
 */
export function FlowBackLink({
  citySlug,
  className,
}: {
  citySlug: string;
  className?: string;
}) {
  const params = useSearchParams();

  // `parseAnswers` takes the same shape `searchParams` produced, so the
  // validation rules stay in one place and this component asserts nothing
  // about which answers are legal.
  const raw = Object.fromEntries(params.entries());
  const query = answersToQuery(parseAnswers(raw));

  return (
    <Link href={`/pogrebne-usluge/${citySlug}${query}`} className={className}>
      ← Svi pogrebnici
    </Link>
  );
}
