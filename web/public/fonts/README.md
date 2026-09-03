# Self-hosted fonts

These files are served from our own origin, **not** from `fonts.googleapis.com`.

## Why self-hosted

A `fonts.googleapis.com` or `fonts.gstatic.com` request transmits the visitor's
IP address to Google on every page load. That is a transfer of personal data to
a third party, and it is the one thing that would put this product back inside
the territory a consent banner exists to cover — see `SPEC_frontend.md` →
*What this is*, where having no cookie banner is a stated requirement rather
than a nicety. Self-hosting removes the transfer, and with it the last external
runtime dependency the pages have.

## Provenance

Downloaded from the `css2` payloads Google serves to a current Chrome user
agent, then vendored here:

| file | family | version | weight | subset |
|---|---|---|---|---|
| `spectral-sc-400-latin.woff2` | Spectral SC | v15 | 400 | `latin` |
| `spectral-sc-400-latin-ext.woff2` | Spectral SC | v15 | 400 | `latin-ext` |
| `spectral-sc-600-latin.woff2` | Spectral SC | v15 | 600 | `latin` |
| `spectral-sc-600-latin-ext.woff2` | Spectral SC | v15 | 600 | `latin-ext` |
| `archivo-latin.woff2` | Archivo | v25 | variable `100..900` | `latin` |
| `archivo-latin-ext.woff2` | Archivo | v25 | variable `100..900` | `latin-ext` |

Archivo is **variable** on `wght`, so one file per subset covers the three
weights the design uses (400/500/600). Spectral SC is **static**, so it needs
one file per weight per subset — four files for two weights.

The `latin` / `latin-ext` split and its `unicode-range` values are Google's own
subsetting, kept because it is good: the `latin-ext` files are only fetched by
a page that actually renders a Croatian diacritic. Only these two subsets are
vendored; Google also serves `cyrillic`, `cyrillic-ext` and `vietnamese` for
Spectral SC, and the product needs none of them.

## Croatian diacritics — check by eye after any font change

`SPEC_frontend.md` → *The diacritic constraint* makes correct rendering of
`Č č Ć ć Ž ž Š š Đ đ` a condition of shipping a face.

**Coverage is not the test — shape is.** The original display face was Cinzel,
and Cinzel has a glyph for every one of those ten characters. It also draws `Đ`
and `đ` as `D` and `d` with a **macron above** rather than a stroke through the
stem, so `Đakovo` rendered as `D̄akovo`. A `cmap` coverage check passes that
font: the letters were present and wrong. That is what cost the original
display face and why the face is now Spectral SC.

There is no automated check any more. Both faces are vendored here, so the
payload cannot change underneath us and the risk only returns when someone
swaps or version-bumps a face. If you do, open `/specimen` and look at the
diacritic line: the stroke must cut through the stem of the D, not float above
it.

## Licence

Both families are SIL Open Font License 1.1, which permits redistribution and
self-hosting. The licences ship alongside the fonts as `OFL-Spectral-SC.txt`
and `OFL-Archivo.txt` and must not be removed.
