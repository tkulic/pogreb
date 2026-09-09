/**
 * The wordmark's mark — the only piece of brand illustration in the product.
 *
 * An olive branch read through a magnifying glass: the two halves of what this
 * site actually does. The branch is the domain — Mediterranean, funerary,
 * local in the same literal way the rest of Kamen is (SPEC_frontend.md →
 * Visual system) — and the glass is the act, which is *looking something up*,
 * not comparing, rating or brokering. It replaces the Diocletian arch drawn
 * for the first build, which said the place but not the job.
 *
 * **A raster, where the arch was an SVG in `currentColor`.** That is the one
 * real cost of the change: this mark carries its own ink — olive over
 * near-black — so it no longer inherits colour from whatever it sits inside,
 * and `.mark` in the header and footer no longer sets one. The artwork has
 * tonal shading that a hand-written path could not carry honestly, and Kamen
 * is a single-theme light design, so there is no second ground for it to have
 * to survive. Both call sites sit on `--stone`, which is the ground it was
 * drawn against.
 *
 * Served from our own origin at 4x the largest size it is drawn at, as one
 * 8.8 KB PNG — no `<picture>`, because WebP measured *larger* than PNG for
 * artwork this flat, and a second file to save nothing is a second file to
 * keep in step. No `next/image`: that routes the file through an image CDN at
 * runtime, and a single origin is a GDPR position here rather than a
 * preference (SPEC.md → Project Structure).
 *
 * `alt=""`, deliberately: the wordmark beside it already says the name, so a
 * second reading of it would be noise to a screen reader. `width`/`height` are
 * the intrinsic pixels and exist only to stop the decoded image reflowing the
 * masthead; CSS sets the drawn height at each call site.
 */
export function Logo({ className }: { className?: string }) {
  return (
    /* `next/image` is ruled out by the single-origin position stated above,
       not overlooked. The hero in Landing.tsx makes the same call and only
       escapes this rule because it happens to sit inside a `<picture>`. */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src="/img/logo-mark.png"
      alt=""
      width={189}
      height={112}
      decoding="async"
    />
  );
}
