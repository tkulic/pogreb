import type { Metadata } from 'next';
import Link from 'next/link';
import { PROCEDURE_STEPS, SOURCES } from '@/lib/guidance';
import styles from '../prose.module.css';

/**
 * "Što učiniti prvo" — the question behind the question.
 *
 * The page has two kinds of content, and the distinction is load-bearing:
 *
 * 1. **Procedural steps**, which are claims about Croatian law and practice.
 *    Every one traces to a primary source — gov.hr, the Pravilnik in Narodne
 *    novine, MVEP — listed in `SOURCES` and rendered at the foot of the page,
 *    so a family can check what they are being told. The rules governing edits
 *    to that text live in `lib/guidance.ts`; read them before touching it.
 * 2. **Statements counted from our own database**, live, at render time. These
 *    assert nothing about procedure and are verifiable against the listing
 *    itself.
 *
 * Both sections disappear on their own if their input disappears: no
 * `PROCEDURE_STEPS`, no steps and no sources block; no providers, no counts.
 * The page renders in every case.
 *
 * ⚠️ The procedural text still needs a native-speaker read and the owner's
 * sign-off before launch — the facts are sourced, the phrasing is not reviewed.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Što učiniti prvo',
  description:
    'Prvi koraci kada netko premine — i što pogrebnik preuzima umjesto vas.',
  alternates: { canonical: '/sto-uciniti-prvo' },
};

/**
 * Reads no provider data, and so is fully static.
 *
 * It used to query every provider to word two sentences from live proportions
 * ("većina pogrebnika navodi…"). The project owner rewrote both sentences to
 * say the same thing without leaning on the data at all, which left the query,
 * the share helpers and the conditional sections dead — so they are gone. The
 * claims that remain are qualitative and true of the trade rather than of our
 * row count, which is why they need no number behind them.
 */
export default function WhatToDoFirstPage() {
  return (
    <main className={`page ${styles.page}`}>
      <Link href="/" className={styles.back}>
        ← Naslovnica
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>Što učiniti prvo</h1>
        <p className={styles.lede}>
          Ne morate znati redoslijed koraka. Kada odaberete pogrebnika i
          nazovete ga, on vas vodi kroz proces. To je, uostalom, posao koji radi
          svaki dan. Mi vam pomažemo da izaberete pravoga.
        </p>
      </header>

      {/*
        Renders only when the sourced procedural text exists. Absent, not
        guessed — see the module docblock and lib/guidance.ts.
      */}
      {PROCEDURE_STEPS.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.heading}>Koraci</h2>
          <ol className={styles.list}>
            {PROCEDURE_STEPS.map((stepItem) => (
              <li key={stepItem.title} className={styles.item}>
                <span className={styles.itemTitle}>{stepItem.title}</span>
                <span className={styles.itemBody}>{stepItem.body}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.heading}>Što pogrebnik preuzima</h2>
        <p className={styles.body}>
          Pogrebnik ne organizira samo pogreb. Mnogi preuzimaju brigu o
          dokumentaciji i inozemni transport pokojnika. Ako niste sigurni što je
          sve potrebno, to je prvo pitanje koje im možete postaviti.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Ako je noć ili vikend</h2>
        <p className={styles.body}>
          Mnoga pogrebna poduzeća dostupna su i izvan radnog vremena. Kada je
          ured zatvoren, na popisu vam nudimo broj dežurne službe umjesto ureda.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Ne zarađujemo na vama</h2>
        <p className={styles.body}>
          Ne tražimo vaše ime, e-mail ni broj telefona i nemamo obrazac za
          slanje upita. Ne prodajemo vaše podatke jer ih ni ne prikupljamo, i
          nitko nam ne plaća za bolju poziciju na popisu. Kada nazovete
          pogrebnika, razgovarate izravno s njim.
        </p>
      </section>

      {/*
        There is no single "all providers" page across seven cities, so this
        goes to the question that picks one — the same place the flow's bypass
        goes before a city is chosen.
      */}
      <Link href="/?korak=mjesto" className={styles.footerLink}>
        Prikažite pogrebnike u svom gradu
      </Link>

      {/*
        The sources are shown, not just recorded in the code. A family acts on
        what this page says, and a procedural claim they cannot check is worth
        less than one they can — this is the same reason the ranking rules are
        published rather than merely documented.
      */}
      {PROCEDURE_STEPS.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.heading}>Izvori</h2>
          <p className={styles.sourceNote}>
            Podaci na ovoj stranici preuzeti su iz službenih izvora. Ovo je opis
            uobičajenog postupka, a ne pravni savjet.
          </p>
          <ul className={styles.sourceList}>
            {SOURCES.map((source) => (
              <li key={source.id}>
                <a
                  className={styles.sourceLink}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
