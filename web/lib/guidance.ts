import type { FlowAnswers } from './answers';

/**
 * The guidance strip and the `/sto-uciniti-prvo` procedure.
 *
 * ## Where this text comes from — read before editing
 *
 * Every sentence here is a claim about Croatian procedure, so each one is
 * traceable to a primary source listed in `SOURCES` below: the citizen-facing
 * government portal, the Pravilnik in Narodne novine, and the Ministry of
 * Foreign Affairs for the death-abroad case. Funeral-home marketing pages were
 * deliberately not used as a source, and neither were the German reference
 * sites the flow was designed against.
 *
 * Three rules bind any edit to this file:
 *
 * 1. **A sentence that cannot be attributed to a source in `SOURCES` does not
 *    go in.** Not "it is generally known", not "the German site says so".
 * 2. **This is a description of the ordinary procedure, not legal advice**, and
 *    the wording must not drift into instructing anyone about their legal
 *    obligations. Where practice varies, say what usually happens.
 * 3. **Deadlines and document names are quoted, not paraphrased.** "U roku od
 *    tri dana", "Potvrda o smrti", "sprovodnica" — a family repeating the wrong
 *    word at a counter is a real cost.
 *
 * ⚠️ **Pending sign-off.** SPEC_frontend.md specifies this text as coming from
 * a source the project owner supplies; it was instead researched from the
 * primary sources below at the owner's direction. It still needs a
 * native-speaker read and the owner's confirmation before launch — the facts
 * are sourced, but the phrasing has not been reviewed by a Croatian speaker.
 */

/** Primary sources. Every claim below traces to one of these. */
export const SOURCES = [
  {
    id: 'gov.hr',
    title: 'Postupak kod smrtnog slučaja',
    url: 'https://gov.hr/hr/postupak-kod-smrtnog-slucaja/760',
    supports:
      'who to call by place of death; the documents the mrtvozornik issues; ' +
      'the three-day reporting deadline; who is obliged to report; that the ' +
      'family arranges transport with an authorised funeral company either ' +
      'directly or through the health institution.',
  },
  {
    id: 'nn-pravilnik-46/2011',
    title:
      'Pravilnik o načinu pregleda umrlih te utvrđivanju vremena i uzroka smrti (NN 46/2011)',
    url: 'https://narodne-novine.nn.hr/clanci/sluzbeni/2011_04_46_1067.html',
    supports:
      'art. 8 — examination within 12 hours of notification for a death ' +
      'outside a health institution; art. 10 — Potvrda o smrti in four ' +
      'copies and where each goes; art. 15 — burial ordinarily 24–48 hours ' +
      'after death, and the dozvola za ukop required before transfer.',
  },
  {
    id: 'mvep',
    title: 'Ministarstvo vanjskih i europskih poslova — Prijava smrti',
    url: 'https://mvep.gov.hr/konzularne-informacije-99074/maticarstvo-prijava-rodjenja-braka-ili-smrti/prijava-smrti-179979/179979',
    supports:
      'death abroad — reporting to the Croatian embassy or consulate; the ' +
      'sprovodnica required to repatriate remains; that an urn of ashes ' +
      'needs no sprovodnica.',
  },
] as const;

export type Guidance = {
  /** Rendered as separate paragraphs, in order. */
  lines: string[];
};

/**
 * Guidance keyed on what has happened.
 *
 * `planiranje` gets none by design — there is nothing urgent to tell someone
 * planning ahead, and a procedural paragraph would be noise on that path.
 */
const BY_SITUACIJA: Partial<Record<NonNullable<FlowAnswers['situacija']>, string>> = {
  // gov.hr; Pravilnik art. 10 and 15.
  preminuo:
    'Smrt najprije mora utvrditi mrtvozornik. On izdaje Potvrdu o smrti i ' +
    'dozvolu za ukop, a tek nakon toga pogrebnik može preuzeti prijevoz i ' +
    'organizaciju pogreba. Pogrebnika možete nazvati odmah — obično on ' +
    'preuzme i prijavu smrti matičnom uredu.',

  // Not a procedural claim: nothing in the procedure applies before a death.
  // Deliberately framed as "this obliges you to nothing".
  'posljednji-dani':
    'Ništa se ne mora dogovarati unaprijed. Ako želite biti spremni, ' +
    'pogrebnika možete nazvati i sada i pitati što će biti potrebno — takav ' +
    'razgovor vas ne obvezuje ni na što.',
};

/**
 * Guidance keyed on where the deceased is now.
 *
 * This is the strongest question on any of the three reference sites, because
 * it decides what happens in the next hour — who may collect the deceased, and
 * how fast.
 */
const BY_POKOJNIK: Partial<Record<NonNullable<FlowAnswers['pokojnik']>, string>> = {
  // gov.hr — call 194/192, who summon the mrtvozornik. 112 is Croatia's
  // unified emergency number and reaches the same services.
  // Pravilnik art. 8 — examination within 12 hours of notification.
  kuca:
    'Nazovite 112 ili hitnu pomoć na 194 — oni pozivaju mrtvozornika. Pregled ' +
    'se obavlja najkasnije u roku od 12 sati od dojave. Pogrebnik može ' +
    'preuzeti pokojnika tek nakon što mrtvozornik utvrdi smrt i izda ' +
    'dokumentaciju.',

  // gov.hr — the institution notifies; the family still chooses the provider.
  bolnica:
    'Ustanova sama obavještava nadležnu službu i mrtvozornika, pa to ne morate ' +
    'vi. Pogrebnika birate sami — izravno ili preko ustanove; niste vezani uz ' +
    'onoga kojeg vam ustanova predloži.',

  // Same document flow as any death outside a health institution; the home
  // ordinarily makes the call. Hedged, because practice varies by home.
  dom:
    'Dom u pravilu sam poziva mrtvozornika — provjerite s osobljem je li to ' +
    'učinjeno. Pogrebnika i dalje birate sami i možete ga nazvati odmah.',

  // MVEP.
  inozemstvo:
    'Javite se najbližem veleposlanstvu ili konzulatu Republike Hrvatske. Za ' +
    'prijevoz posmrtnih ostataka potrebna je sprovodnica, uz odobrenje države ' +
    'u kojoj je osoba preminula; za prijenos urne s pepelom sprovodnica nije ' +
    'potrebna. Pogrebnici na ovom popisu organiziraju i međunarodni prijevoz.',
};

/**
 * The step-by-step procedure on `/sto-uciniti-prvo`.
 *
 * Ordered as a family actually meets them, not as the law is structured.
 */
export const PROCEDURE_STEPS: { title: string; body: string }[] = [
  {
    // gov.hr; Pravilnik art. 8.
    title: 'Smrt utvrđuje mrtvozornik',
    body:
      'Ako je osoba preminula kod kuće, nazovite 112 ili hitnu pomoć na 194 — ' +
      'oni pozivaju mrtvozornika. Pregled se obavlja najkasnije u roku od 12 ' +
      'sati od dojave. Ako je preminula u bolnici ili domu, ustanova to ' +
      'obavlja sama.',
  },
  {
    // Pravilnik art. 10; gov.hr.
    title: 'Preuzmite dokumentaciju',
    body:
      'Mrtvozornik izdaje Potvrdu o smrti u četiri primjerka. Jedan primjerak ' +
      'dobiva obitelj i s njim se organizira pogreb, a dva mrtvozornik sam ' +
      'dostavlja matičnom uredu. Izdaje i dozvolu za ukop, bez koje se ' +
      'pokojnika ne može prenijeti na groblje.',
  },
  {
    // gov.hr; Pravilnik art. 15.
    title: 'Nazovite pogrebnika',
    body:
      'Pogrebnik preuzima prijevoz pokojnika i organizaciju pogreba, a u ' +
      'pravilu i sređivanje dokumentacije. Pokop se obično obavlja između 24 ' +
      'i 48 sati od nastupa smrti, pa je ovo poziv koji ne treba odgađati.',
  },
  {
    // gov.hr.
    title: 'Prijava smrti matičnom uredu',
    body:
      'Smrt se prijavljuje u roku od tri dana matičaru na čijem je području ' +
      'nastupila. Prijaviti su je dužni ukućani, srodnici ili susjedi, ali u ' +
      'praksi to najčešće obavi pogrebnik umjesto obitelji.',
  },
  {
    // gov.hr — smrtni list is issued only after registration.
    title: 'Smrtni list dolazi poslije',
    body:
      'Smrtni list, službeno izvadak iz matice umrlih, matični ured izdaje tek ' +
      'nakon što je smrt upisana. Njime se činjenica smrti dokazuje bankama, ' +
      'sudu i osiguravajućim društvima — trebat će vam, ali ne prvog dana.',
  },
];

/**
 * Compose the strip for a set of answers, or `null` when there is nothing to
 * say.
 *
 * Returning `null` rather than an empty object matters: the page omits the
 * whole block, including its rules and its link, rather than rendering an
 * empty bordered strip.
 */
export function guidanceFor(answers: FlowAnswers): Guidance | null {
  const lines = [
    answers.situacija ? BY_SITUACIJA[answers.situacija] : undefined,
    answers.pokojnik ? BY_POKOJNIK[answers.pokojnik] : undefined,
  ].filter((l): l is string => typeof l === 'string' && l.length > 0);

  return lines.length > 0 ? { lines } : null;
}
