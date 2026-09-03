import Link from 'next/link';
import styles from './prose.module.css';

/**
 * 404.
 *
 * Reached by an unknown city slug, an unknown provider slug, or a service that
 * did not qualify for its own page. In every one of those cases this is a
 * genuine 404 rather than a redirect to something plausible: quietly landing
 * someone on a different provider's page than the link they followed would be
 * worse than telling them the page is gone.
 *
 * It still offers the one thing they came for.
 */
export default function NotFound() {
  return (
    <main className={`page ${styles.page}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Stranica nije pronađena</h1>
        <p className={styles.lede}>
          Poveznica koju ste otvorili više ne postoji ili je pogrešno prepisana.
        </p>
      </header>

      <Link href="/pogrebne-usluge/split" className={styles.footerLink}>
        Prikaži sve pogrebnike u Splitu i okolici
      </Link>
      <Link href="/" className={styles.back}>
        Naslovnica
      </Link>
    </main>
  );
}
