import type { ButtonHTMLAttributes } from 'react';
import styles from './ActionLink.module.css';

type ActionButtonProps = {
  variant: 'primary' | 'secondary';
  fullWidth?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * A real `<button>` in the two styles `ActionLink` already defines.
 *
 * It exists for exactly one case: submitting a form. Everything else in this
 * product that looks like a button is a link, and `ActionLink`'s contract —
 * always an anchor, never a div with a handler — is what makes the contact
 * actions keyboard-usable, no-JavaScript-safe and meaningful to
 * `event.isTrusted`. A form submit is the one place where an anchor would be
 * wrong instead of right.
 *
 * **It imports `ActionLink.module.css` rather than restyling.** SPEC_frontend.md
 * → Layout and shape says exactly two button styles exist and forbids a third,
 * so this shares the definitions instead of copying them: a second file
 * describing a filled `--ink` button is how a third style gets born by
 * accident.
 */
export function ActionButton({
  variant,
  fullWidth = false,
  className,
  children,
  ...rest
}: ActionButtonProps) {
  const classes = [
    styles.base,
    styles[variant],
    fullWidth ? styles.fullWidth : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
