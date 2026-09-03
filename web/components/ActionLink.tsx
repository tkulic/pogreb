import Link from 'next/link';
import type { AnchorHTMLAttributes } from 'react';
import styles from './ActionLink.module.css';

type Variant = 'primary' | 'secondary';

type ActionLinkProps = {
  variant: Variant;
  /** Full width on the urgent paths; auto width when it sits beside another. */
  fullWidth?: boolean;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

/**
 * The two button styles, and the only source of them.
 *
 * SPEC_frontend.md → Layout and shape defines exactly two — a filled `--ink`
 * primary and an outlined secondary — and forbids a third. A revealed phone
 * number rendered beneath the primary is *not* a third style: it is a
 * `--gold-link` text link, and it does not come from here.
 *
 * **Always renders an anchor, never a `<button>` and never a div with a
 * handler.** The contact actions are real `tel:` and `mailto:` links, which is
 * what makes them work for keyboard users, what gives them a no-JavaScript
 * path, and what makes `event.isTrusted` mean something when the click is
 * logged (SPEC_database.md → Client-side rules).
 *
 * An internal `href` (anything starting with `/`) renders as a Next `<Link>`
 * so navigation stays client-side; everything else — `tel:`, `mailto:`, an
 * external URL — renders as a plain `<a>`, which is what those schemes need.
 * The choice is made from the href rather than from a prop, so a caller cannot
 * get it wrong.
 */
export function ActionLink({
  variant,
  fullWidth = false,
  className,
  children,
  ...rest
}: ActionLinkProps) {
  const classes = [
    styles.base,
    styles[variant],
    fullWidth ? styles.fullWidth : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const { href, ...anchorProps } = rest;

  if (href?.startsWith('/')) {
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  return (
    <a className={classes} href={href} {...anchorProps}>
      {children}
    </a>
  );
}
