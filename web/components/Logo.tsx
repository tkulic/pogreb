/**
 * The wordmark's mark — the only piece of brand illustration in the product.
 *
 * A Diocletian arch reduced to its structure: two piers, the span above, the
 * ground line beneath. It is local and literal in the same way the rest of
 * Kamen is (SPEC_frontend.md → Visual system), and it is architecture rather
 * than iconography, so it does not open the door to an icon set — the phone
 * glyph on the call button is still the only *icon* in the product.
 *
 * Stroke-based on a 24px grid in `currentColor`, matching the phone glyph, so
 * it inherits ink in the masthead and never needs a colour of its own.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
      // Decorative: the wordmark beside it already says the name, so a second
      // reading of it would be noise to a screen reader.
      aria-hidden="true"
      focusable="false"
    >
      {/* The span. */}
      <path d="M5 12.5a7 7 0 0 1 14 0" />
      {/* The piers. */}
      <path d="M5 12.5V20M19 12.5V20" />
      {/* The ground line — the cut rule the rest of the design is made of. */}
      <path d="M2.5 20h19" />
    </svg>
  );
}
