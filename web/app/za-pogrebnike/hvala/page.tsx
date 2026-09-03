import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '../provider.module.css';

/**
 * Where a successful submission lands.
 *
 * The redirect is Netlify's, driven by the `action` on the form definition in
 * `public/__forms.html` — this page is never reached by navigation from within
 * the product, which is why it is `noindex` and absent from the sitemap.
 *
 * It promises a reply without promising a deadline. With manual data entry and
 * no named owner yet, "javit ćemo se u roku od 24 sata" would be a commitment
 * nobody has agreed to keep, and a broken one on this page in particular would
 * cost more than the reassurance is worth.
 */
export const metadata: Metadata = {
  title: 'Poruka je poslana',
  robots: { index: false, follow: false },
};

export default function ThanksPage() {
  return (
    <main className={`page ${styles.page}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Poruka je poslana</h1>
        <p className={styles.lede}>
          Hvala. Pročitat ćemo je i javiti se na e-mail koji ste ostavili. Ako
          se radi o ispravku podataka, ispravit ćemo ih čim ih provjerimo.
        </p>
      </header>

      <Link href="/" className={styles.back}>
        ← Natrag na naslovnicu
      </Link>
    </main>
  );
}
