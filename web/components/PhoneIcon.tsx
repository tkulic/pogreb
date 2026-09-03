/**
 * The only icon in the product.
 *
 * SPEC_frontend.md → Icons: exactly one icon exists, and it is this one. No
 * icon set, no emoji, anywhere. Stroke-based, 1.8px on a 24px grid, painted in
 * `currentColor` so it inherits the button label colour rather than carrying
 * its own.
 *
 * Inline rather than from a sprite or a package: an external icon set would be
 * a third-party dependency the one-origin rule does not permit, and at one
 * icon it would be absurd regardless.
 */
export function PhoneIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      /* Decorative: the button already reads "Nazovi". */
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8.4 4H5.2C4.5 4 4 4.6 4 5.3 4 13.9 10.1 20 18.7 20c.7 0 1.3-.5 1.3-1.2v-3.2c0-.6-.4-1.1-1-1.2l-3-.6c-.5-.1-1 .1-1.2.6l-.9 1.7c-2.5-1.1-4.5-3.1-5.6-5.6l1.7-.9c.5-.2.7-.7.6-1.2l-.6-3c-.1-.6-.6-1-1.2-1Z" />
    </svg>
  );
}
