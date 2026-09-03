import type { Provider } from '../queries';

/**
 * The Split pilot, captured from the live database.
 *
 * A snapshot rather than a live query, so the ranking tests are deterministic
 * and run offline. It is real data, not invented data: every field here came
 * out of the hosted project, which is what makes the assertions in
 * `ranking.test.ts` meaningful rather than circular.
 *
 * **Regenerate this when the pilot data changes** — a stale fixture makes the
 * tests pass while the product misbehaves. Captured 2026-09-02.
 */
export const SPLIT_PILOT: Provider[] = [
  {
    id: "444ebbd3-19e5-4b8f-b815-a2fab251410b",
    name: "Bila ruža, obrt",
    oib: "53434762221",
    mbs: null,
    entity_type: "obrt",
    data_source: "manual",
    address: "Poljička cesta 22",
    city_id: "279a1fc1-6c86-4a0b-9efc-ade5e343f4bf",
    postal_code: "21000",
    email: "bilaruzast@net.hr",
    website: "https://umrli-split.info",
    latitude: null,
    longitude: null,
    available_24_7: true,
    working_hours: {
      fri: {
        to: "17:00",
        from: "08:00"
      },
      mon: {
        to: "17:00",
        from: "08:00"
      },
      thu: {
        to: "17:00",
        from: "08:00"
      },
      tue: {
        to: "17:00",
        from: "08:00"
      },
      wed: {
        to: "17:00",
        from: "08:00"
      }
    },
    logo_url: null,
    owner_id: null,
    last_verified_at: "2026-08-27T00:00:00+00:00",
    created_at: "2026-08-27T10:59:58.071781+00:00",
    updated_at: "2026-09-02T12:11:32.058712+00:00",
    phones: [
      {
        type: "mobile",
        number: "+385912572599"
      },
      {
        type: "emergency",
        number: "+385912572599"
      }
    ],
    slug: "bila-ruza",
    services: [
      {
        id: "c6ad7d78-815e-4cc5-b481-b188606ff9ee",
        name: "Organizacija pogreba",
        slug: "organizacija-pogreba",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "82d2532a-f1f7-4600-93d3-5cfc4c6a89e7",
        name: "Kremiranje",
        slug: "kremiranje",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "c40ade5e-f70b-4fb1-a621-13f925a47f5e",
        name: "Prijevoz pokojnika",
        slug: "prijevoz-pokojnika",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "f7b635dd-ea56-45c3-b2f7-5c5794a6985d",
        name: "Međunarodni prijevoz pokojnika",
        slug: "prijevoz-pokojnika-inozemstvo",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "4bbfec24-0492-4bcd-b6fa-7a1a549971e8",
        name: "Lijesovi",
        slug: "lijesovi",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "38a919cd-2482-47cd-b94c-25eda35a6d71",
        name: "Cvjetni aranžmani",
        slug: "cvjetni-aranzmani",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "c4fed333-380c-4cc4-95b1-54fb02d98c0a",
        name: "Osmrtnice i tiskane objave",
        slug: "osmrtnice",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "ccf54c07-7195-4e91-a8e2-995e21788c31",
        name: "Sređivanje dokumentacije",
        slug: "sredivanje-dokumentacije",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "7b2b3be5-7a5c-4987-8941-f22bf9771764",
        name: "Organizacija glazbe",
        slug: "glazba-na-pogrebu",
        price_from: null,
        price_to: null,
        note: null
      }
    ]
  },
  {
    id: "45f98c8c-a42c-4191-884e-b8583ddb841d",
    name: "Bradvica d.o.o.",
    oib: "92606051726",
    mbs: "03813517",
    entity_type: "doo",
    data_source: "manual",
    address: "Poljička cesta 22",
    city_id: "279a1fc1-6c86-4a0b-9efc-ade5e343f4bf",
    postal_code: "21000",
    email: "pogrebno.split@bradvica.hr",
    website: "https://bradvica.hr",
    latitude: null,
    longitude: null,
    available_24_7: true,
    working_hours: {
      fri: {
        to: "15:00",
        from: "08:00"
      },
      mon: {
        to: "15:00",
        from: "08:00"
      },
      sat: {
        to: "13:00",
        from: "08:00"
      },
      thu: {
        to: "15:00",
        from: "08:00"
      },
      tue: {
        to: "15:00",
        from: "08:00"
      },
      wed: {
        to: "15:00",
        from: "08:00"
      }
    },
    logo_url: null,
    owner_id: null,
    last_verified_at: "2026-08-27T00:00:00+00:00",
    created_at: "2026-08-27T10:59:58.071781+00:00",
    updated_at: "2026-09-02T12:11:32.058712+00:00",
    phones: [
      {
        type: "emergency",
        number: "+385992128446"
      },
      {
        type: "office",
        number: "+38521389890"
      }
    ],
    slug: "bradvica",
    services: [
      {
        id: "c6ad7d78-815e-4cc5-b481-b188606ff9ee",
        name: "Organizacija pogreba",
        slug: "organizacija-pogreba",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "82d2532a-f1f7-4600-93d3-5cfc4c6a89e7",
        name: "Kremiranje",
        slug: "kremiranje",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "c40ade5e-f70b-4fb1-a621-13f925a47f5e",
        name: "Prijevoz pokojnika",
        slug: "prijevoz-pokojnika",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "f7b635dd-ea56-45c3-b2f7-5c5794a6985d",
        name: "Međunarodni prijevoz pokojnika",
        slug: "prijevoz-pokojnika-inozemstvo",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "4bbfec24-0492-4bcd-b6fa-7a1a549971e8",
        name: "Lijesovi",
        slug: "lijesovi",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "38a919cd-2482-47cd-b94c-25eda35a6d71",
        name: "Cvjetni aranžmani",
        slug: "cvjetni-aranzmani",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "c4fed333-380c-4cc4-95b1-54fb02d98c0a",
        name: "Osmrtnice i tiskane objave",
        slug: "osmrtnice",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "ccf54c07-7195-4e91-a8e2-995e21788c31",
        name: "Sređivanje dokumentacije",
        slug: "sredivanje-dokumentacije",
        price_from: null,
        price_to: null,
        note: null
      }
    ]
  },
  {
    id: "5fc83c1f-56e7-4e37-b5ba-f2ca3f72f3bf",
    name: "Lovrinac d.o.o.",
    oib: "20691511526",
    mbs: "03125190",
    entity_type: "doo",
    data_source: "manual",
    address: "Kavanjinova 12",
    city_id: "279a1fc1-6c86-4a0b-9efc-ade5e343f4bf",
    postal_code: "21000",
    email: "pogrebna_sluzba@lovrinac.hr",
    website: "https://lovrinac.hr",
    latitude: null,
    longitude: null,
    available_24_7: false,
    working_hours: {
      fri: {
        to: "19:00",
        from: "07:00"
      },
      mon: {
        to: "19:00",
        from: "07:00"
      },
      sat: {
        to: "15:00",
        from: "07:00"
      },
      sun: {
        to: "10:00",
        from: "08:00"
      },
      thu: {
        to: "19:00",
        from: "07:00"
      },
      tue: {
        to: "19:00",
        from: "07:00"
      },
      wed: {
        to: "19:00",
        from: "07:00"
      }
    },
    logo_url: null,
    owner_id: null,
    last_verified_at: "2026-08-27T00:00:00+00:00",
    created_at: "2026-08-27T10:59:58.071781+00:00",
    updated_at: "2026-09-02T12:11:32.058712+00:00",
    phones: [
      {
        type: "office",
        number: "+38521389600"
      },
      {
        type: "emergency",
        number: "+38521316750"
      }
    ],
    slug: "lovrinac",
    services: [
      {
        id: "c6ad7d78-815e-4cc5-b481-b188606ff9ee",
        name: "Organizacija pogreba",
        slug: "organizacija-pogreba",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "82d2532a-f1f7-4600-93d3-5cfc4c6a89e7",
        name: "Kremiranje",
        slug: "kremiranje",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "c40ade5e-f70b-4fb1-a621-13f925a47f5e",
        name: "Prijevoz pokojnika",
        slug: "prijevoz-pokojnika",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "f7b635dd-ea56-45c3-b2f7-5c5794a6985d",
        name: "Međunarodni prijevoz pokojnika",
        slug: "prijevoz-pokojnika-inozemstvo",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "22ae718a-90be-4b57-834f-5b0970ef372a",
        name: "Ekshumacija",
        slug: "ekshumacija",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "4bbfec24-0492-4bcd-b6fa-7a1a549971e8",
        name: "Lijesovi",
        slug: "lijesovi",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "38a919cd-2482-47cd-b94c-25eda35a6d71",
        name: "Cvjetni aranžmani",
        slug: "cvjetni-aranzmani",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "c4fed333-380c-4cc4-95b1-54fb02d98c0a",
        name: "Osmrtnice i tiskane objave",
        slug: "osmrtnice",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "e14de8a7-8b06-4ff7-9da3-a80c6d8fab26",
        name: "Klesarske usluge / nadgrobni spomenici",
        slug: "nadgrobni-spomenici",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "942f162b-abc5-42d9-b126-c4013d934755",
        name: "Uređenje i održavanje groba",
        slug: "uredenje-groba",
        price_from: null,
        price_to: null,
        note: null
      }
    ]
  },
  {
    id: "de769bad-d208-4c5d-9d54-ff3a47105524",
    name: "Pogrebne usluge Aničić",
    oib: "02969836411",
    mbs: null,
    entity_type: "jdoo",
    data_source: "manual",
    address: "Poljička cesta 30",
    city_id: "279a1fc1-6c86-4a0b-9efc-ade5e343f4bf",
    postal_code: "21000",
    email: "info@pogrebneuslugeanicic.com",
    website: "https://pogrebneuslugeanicic.com",
    latitude: null,
    longitude: null,
    available_24_7: false,
    working_hours: {
      fri: {
        to: "14:00",
        from: "07:00"
      },
      mon: {
        to: "14:00",
        from: "07:00"
      },
      sat: {
        to: "13:00",
        from: "07:00"
      },
      thu: {
        to: "14:00",
        from: "07:00"
      },
      tue: {
        to: "14:00",
        from: "07:00"
      },
      wed: {
        to: "14:00",
        from: "07:00"
      }
    },
    logo_url: null,
    owner_id: null,
    last_verified_at: "2026-08-27T00:00:00+00:00",
    created_at: "2026-08-27T12:11:36.544276+00:00",
    updated_at: "2026-09-02T12:11:32.058712+00:00",
    phones: [
      {
        type: "office",
        number: "+38521335533"
      },
      {
        type: "mobile",
        number: "+385911950336"
      }
    ],
    slug: "anicic",
    services: [
      {
        id: "c6ad7d78-815e-4cc5-b481-b188606ff9ee",
        name: "Organizacija pogreba",
        slug: "organizacija-pogreba",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "c40ade5e-f70b-4fb1-a621-13f925a47f5e",
        name: "Prijevoz pokojnika",
        slug: "prijevoz-pokojnika",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "f7b635dd-ea56-45c3-b2f7-5c5794a6985d",
        name: "Međunarodni prijevoz pokojnika",
        slug: "prijevoz-pokojnika-inozemstvo",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "38a919cd-2482-47cd-b94c-25eda35a6d71",
        name: "Cvjetni aranžmani",
        slug: "cvjetni-aranzmani",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "c4fed333-380c-4cc4-95b1-54fb02d98c0a",
        name: "Osmrtnice i tiskane objave",
        slug: "osmrtnice",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "942f162b-abc5-42d9-b126-c4013d934755",
        name: "Uređenje i održavanje groba",
        slug: "uredenje-groba",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "ccf54c07-7195-4e91-a8e2-995e21788c31",
        name: "Sređivanje dokumentacije",
        slug: "sredivanje-dokumentacije",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "7ec83e97-4135-45c4-aa7e-594be25473af",
        name: "Oblačenje i uređivanje pokojnika",
        slug: "uredivanje-pokojnika",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "7b2b3be5-7a5c-4987-8941-f22bf9771764",
        name: "Organizacija glazbe",
        slug: "glazba-na-pogrebu",
        price_from: null,
        price_to: null,
        note: null
      }
    ]
  },
  {
    id: "51803b1a-7da7-4b86-b21e-b2fd68fbf706",
    name: "Pogrebne usluge Čagalj, d.o.o.",
    oib: "56765637267",
    mbs: "00626236",
    entity_type: "doo",
    data_source: "manual",
    address: "Poljička cesta 22",
    city_id: "279a1fc1-6c86-4a0b-9efc-ade5e343f4bf",
    postal_code: "21000",
    email: "kokoibrane@gmail.com",
    website: "https://pogrebneuslugecagalj.hr",
    latitude: null,
    longitude: null,
    available_24_7: true,
    working_hours: {
      fri: {
        to: "13:00",
        from: "07:00"
      },
      mon: {
        to: "13:00",
        from: "07:00"
      },
      sat: {
        to: "12:00",
        from: "08:00"
      },
      sun: {
        by_arrangement: true
      },
      thu: {
        to: "13:00",
        from: "07:00"
      },
      tue: {
        to: "13:00",
        from: "07:00"
      },
      wed: {
        to: "13:00",
        from: "07:00"
      }
    },
    logo_url: null,
    owner_id: null,
    last_verified_at: "2026-08-27T00:00:00+00:00",
    created_at: "2026-08-27T10:59:58.071781+00:00",
    updated_at: "2026-09-02T12:11:32.058712+00:00",
    phones: [
      {
        type: "mobile",
        number: "+38598320100"
      },
      {
        type: "mobile",
        number: "+385989861206"
      },
      {
        type: "office",
        number: "+38521389629"
      }
    ],
    slug: "cagalj",
    services: [
      {
        id: "c6ad7d78-815e-4cc5-b481-b188606ff9ee",
        name: "Organizacija pogreba",
        slug: "organizacija-pogreba",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "c40ade5e-f70b-4fb1-a621-13f925a47f5e",
        name: "Prijevoz pokojnika",
        slug: "prijevoz-pokojnika",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "f7b635dd-ea56-45c3-b2f7-5c5794a6985d",
        name: "Međunarodni prijevoz pokojnika",
        slug: "prijevoz-pokojnika-inozemstvo",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "4bbfec24-0492-4bcd-b6fa-7a1a549971e8",
        name: "Lijesovi",
        slug: "lijesovi",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "38a919cd-2482-47cd-b94c-25eda35a6d71",
        name: "Cvjetni aranžmani",
        slug: "cvjetni-aranzmani",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "ccf54c07-7195-4e91-a8e2-995e21788c31",
        name: "Sređivanje dokumentacije",
        slug: "sredivanje-dokumentacije",
        price_from: null,
        price_to: null,
        note: null
      }
    ]
  },
  {
    id: "9a302448-a402-4c23-ab9b-30486f3c185b",
    name: "Pogrebne usluge Zec",
    oib: "99347593665",
    mbs: null,
    entity_type: "doo",
    data_source: "manual",
    address: "Ulica oca Ante Gabrića 16",
    city_id: "279a1fc1-6c86-4a0b-9efc-ade5e343f4bf",
    postal_code: "21000",
    email: "pogrebneuslugezec@gmail.com",
    website: "https://adepto-pogrebne-usluge.hr",
    latitude: null,
    longitude: null,
    available_24_7: false,
    working_hours: {
      fri: {
        to: "13:00",
        from: "07:00"
      },
      mon: {
        to: "13:00",
        from: "07:00"
      },
      sat: {
        to: "13:00",
        from: "07:00"
      },
      thu: {
        to: "13:00",
        from: "07:00"
      },
      tue: {
        to: "13:00",
        from: "07:00"
      },
      wed: {
        to: "13:00",
        from: "07:00"
      }
    },
    logo_url: null,
    owner_id: null,
    last_verified_at: "2026-08-27T00:00:00+00:00",
    created_at: "2026-08-27T10:59:58.071781+00:00",
    updated_at: "2026-09-02T12:11:32.058712+00:00",
    phones: [
      {
        type: "office",
        number: "+38521571542"
      },
      {
        type: "emergency",
        number: "+38598551158"
      },
      {
        type: "emergency",
        number: "+38598853222"
      }
    ],
    slug: "zec",
    services: [
      {
        id: "c6ad7d78-815e-4cc5-b481-b188606ff9ee",
        name: "Organizacija pogreba",
        slug: "organizacija-pogreba",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "82d2532a-f1f7-4600-93d3-5cfc4c6a89e7",
        name: "Kremiranje",
        slug: "kremiranje",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "c40ade5e-f70b-4fb1-a621-13f925a47f5e",
        name: "Prijevoz pokojnika",
        slug: "prijevoz-pokojnika",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "f7b635dd-ea56-45c3-b2f7-5c5794a6985d",
        name: "Međunarodni prijevoz pokojnika",
        slug: "prijevoz-pokojnika-inozemstvo",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "4bbfec24-0492-4bcd-b6fa-7a1a549971e8",
        name: "Lijesovi",
        slug: "lijesovi",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "c6bb35c2-c408-4b5b-b4bd-a22c70472530",
        name: "Urne",
        slug: "urne",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "38a919cd-2482-47cd-b94c-25eda35a6d71",
        name: "Cvjetni aranžmani",
        slug: "cvjetni-aranzmani",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "c4fed333-380c-4cc4-95b1-54fb02d98c0a",
        name: "Osmrtnice i tiskane objave",
        slug: "osmrtnice",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "ccf54c07-7195-4e91-a8e2-995e21788c31",
        name: "Sređivanje dokumentacije",
        slug: "sredivanje-dokumentacije",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "7ec83e97-4135-45c4-aa7e-594be25473af",
        name: "Oblačenje i uređivanje pokojnika",
        slug: "uredivanje-pokojnika",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "7b2b3be5-7a5c-4987-8941-f22bf9771764",
        name: "Organizacija glazbe",
        slug: "glazba-na-pogrebu",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "3cc86a3b-91ee-4381-8eb7-e136a19b9571",
        name: "Fotografiranje i snimanje",
        slug: "fotografiranje-pogreba",
        price_from: null,
        price_to: null,
        note: null
      }
    ]
  },
  {
    id: "b734fd98-ce88-41d3-b32a-682599773575",
    name: "Tonkić d.o.o.",
    oib: "50116101908",
    mbs: "03522563",
    entity_type: "doo",
    data_source: "manual",
    address: "Poljička cesta 22",
    city_id: "279a1fc1-6c86-4a0b-9efc-ade5e343f4bf",
    postal_code: "21000",
    email: "pptonkic@gmail.com",
    website: "https://tonkic.hr",
    latitude: null,
    longitude: null,
    available_24_7: true,
    working_hours: {
      fri: {
        to: "19:00",
        from: "07:00"
      },
      mon: {
        to: "19:00",
        from: "07:00"
      },
      sat: {
        to: "12:00",
        from: "08:00"
      },
      sun: {
        to: "12:00",
        from: "08:00"
      },
      thu: {
        to: "19:00",
        from: "07:00"
      },
      tue: {
        to: "19:00",
        from: "07:00"
      },
      wed: {
        to: "19:00",
        from: "07:00"
      }
    },
    logo_url: null,
    owner_id: null,
    last_verified_at: "2026-08-27T00:00:00+00:00",
    created_at: "2026-08-27T10:59:58.071781+00:00",
    updated_at: "2026-09-02T12:11:32.058712+00:00",
    phones: [
      {
        type: "office",
        number: "+38521571888"
      },
      {
        type: "emergency",
        number: "+38521571888"
      }
    ],
    slug: "tonkic",
    services: [
      {
        id: "c6ad7d78-815e-4cc5-b481-b188606ff9ee",
        name: "Organizacija pogreba",
        slug: "organizacija-pogreba",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "c40ade5e-f70b-4fb1-a621-13f925a47f5e",
        name: "Prijevoz pokojnika",
        slug: "prijevoz-pokojnika",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "f7b635dd-ea56-45c3-b2f7-5c5794a6985d",
        name: "Međunarodni prijevoz pokojnika",
        slug: "prijevoz-pokojnika-inozemstvo",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "4bbfec24-0492-4bcd-b6fa-7a1a549971e8",
        name: "Lijesovi",
        slug: "lijesovi",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "c6bb35c2-c408-4b5b-b4bd-a22c70472530",
        name: "Urne",
        slug: "urne",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "38a919cd-2482-47cd-b94c-25eda35a6d71",
        name: "Cvjetni aranžmani",
        slug: "cvjetni-aranzmani",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "c4fed333-380c-4cc4-95b1-54fb02d98c0a",
        name: "Osmrtnice i tiskane objave",
        slug: "osmrtnice",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "ccf54c07-7195-4e91-a8e2-995e21788c31",
        name: "Sređivanje dokumentacije",
        slug: "sredivanje-dokumentacije",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "7ec83e97-4135-45c4-aa7e-594be25473af",
        name: "Oblačenje i uređivanje pokojnika",
        slug: "uredivanje-pokojnika",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "7b2b3be5-7a5c-4987-8941-f22bf9771764",
        name: "Organizacija glazbe",
        slug: "glazba-na-pogrebu",
        price_from: null,
        price_to: null,
        note: null
      },
      {
        id: "3cc86a3b-91ee-4381-8eb7-e136a19b9571",
        name: "Fotografiranje i snimanje",
        slug: "fotografiranje-pogreba",
        price_from: null,
        price_to: null,
        note: null
      }
    ]
  }
];
