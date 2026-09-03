import Link from 'next/link';
import styles from './OptionTile.module.css';

/**
 * One answer in the flow.
 *
 * Always a `<Link>`: an answer is a URL, so choosing one is a navigation. That
 * is what makes the whole flow work without a line of client JavaScript, makes
 * browser Back preserve answers for free, and makes every intermediate state
 * shareable.
 *
 * `selected` is for the return trip — a user who followed "Promijeni odgovore"
 * sees what they picked last time still marked.
 */
export function OptionTile({
  href,
  children,
  selected = false,
  quiet = false,
}: {
  href: string;
  children: React.ReactNode;
  selected?: boolean;
  quiet?: boolean;
}) {
  const classes = [styles.tile, quiet ? styles.quiet : null, selected ? styles.selected : null]
    .filter(Boolean)
    .join(' ');

  return (
    <Link href={href} className={classes} aria-current={selected ? 'true' : undefined}>
      <span>{children}</span>
      {/* Never colour-only: the selected state carries a word. */}
      {selected && <span className={styles.selectedMark}>odabrano</span>}
    </Link>
  );
}
