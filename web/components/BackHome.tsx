import Link from 'next/link';
import styles from './BackHome.module.css';

/**
 * *← Natrag na naslovnicu*, above a page's heading.
 *
 * **It replaced `← Pitanja` on the city pages on 2026-09-24, and the height is
 * half the reason.** `PageBack` is a 44px tap target plus 4px of padding, and
 * as a direct child of `.page` it also took the shell's 26px gap — 74px before
 * the `<h1>`, on the page where we had just spent a session recovering 30px at
 * a time. This is one 11px line inside the header block, about 30px with its
 * padding.
 *
 * The other half is that `← Pitanja` had stopped being the useful destination.
 * It duplicated the *"promijenite"* link in the answers strip, which is the one
 * that carries the answers and appears exactly when there are answers to carry;
 * and 16 of 19 search clicks land here having never seen the flow, so for
 * almost every reader it pointed at a wizard they had not used. Home is the
 * destination a reader of this page actually wants.
 *
 * **It was briefly a two-crumb breadcrumb** (`Pogrebne usluge › Zagreb i
 * okolica`) and the owner cut it back: the second crumb repeated the `<h1>`
 * directly beneath it. The `BreadcrumbList` markup still carries both crumbs,
 * and this link is the first of them worded as an action rather than a name —
 * the page's one piece of upward navigation, which is what the markup
 * describes.
 *
 * **Not a tap-target exception.** An inline text link in a line of text is the
 * case WCAG's target-size rule explicitly exempts; the padding below still
 * gives roughly 30px of height without turning it into a button.
 */
export function BackHome() {
  return (
    <Link className={styles.link} href="/">
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M19.5 12h-14" />
        <path d="m11.5 6-6 6 6 6" />
      </svg>
      Natrag na naslovnicu
    </Link>
  );
}
