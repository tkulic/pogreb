/**
 * The landing page's hero visual — a colonnade, drawn as engraved line art.
 *
 * The image policy (SPEC_frontend.md → Image policy) permits illustration on
 * the same terms as a photograph: engraving-style line art, ink on stone,
 * subject stone and architecture, never people, hands, candles or lilies. That
 * imagery is the funeral industry's own native slop and it loses the register
 * instantly, which is the whole reason the policy exists.
 *
 * Three things it is deliberately not:
 *
 * - **Not a placeholder for a photograph.** It is the finished state of the
 *   band. If a photograph is ever chosen it replaces this, but nothing is
 *   pending — every page must render correctly with no image at all, and this
 *   page now does more than that.
 * - **Not behind text.** It sits in its own bounded band under the hero, with
 *   the gold rule beneath it, exactly where a photograph would go.
 * - **Not an icon.** One drawing on one page is not a set, so the rule that the
 *   phone glyph is the product's only icon still holds.
 *
 * **The viewBox is the desktop band's exact size**, 1000×260, and the drawing
 * fills it edge to edge. That is what lets `slice` crop horizontally and only
 * horizontally: on a phone the band is shorter and narrower, so the drawing
 * scales to the height and loses columns off the sides, which is how an arcade
 * should meet a frame. Sized any other way it crops vertically instead and
 * takes the tops off the arches, which turns a colonnade into a fence.
 *
 * Generated from an interval rather than hand-written as paths, so the rhythm
 * of the columns stays exact and remains one number to adjust.
 */

const WIDTH = 1000;
const HEIGHT = 260;

/** Columns across the span, the outermost two cut by the frame on purpose. */
const SPACING = 100;
const COLUMN_HALF = 8;
const CAPITAL_Y = 104;
const GROUND_Y = 228;

const columnX = Array.from(
  { length: WIDTH / SPACING + 1 },
  (_, i) => i * SPACING,
);

/** Half the clear span between two column faces — the arch's radius. */
const ARCH_R = (SPACING - COLUMN_HALF * 2) / 2;

export function StoneEngraving({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {/* Sky hatching — engraving's own texture, kept near-invisible so it
          reads as tone rather than as lines. */}
      <g strokeWidth="1" opacity="0.14">
        {[18, 32, 46, 60].map((y) => (
          <line key={y} x1="0" y1={y} x2={WIDTH} y2={y} />
        ))}
      </g>

      {/* Cornice — the two cut rules the colonnade hangs from. */}
      <g strokeWidth="1.4" opacity="0.45">
        <line x1="0" y1="84" x2={WIDTH} y2="84" />
        <line x1="0" y1="92" x2={WIDTH} y2="92" />
      </g>

      {/* The arcade. */}
      <g strokeWidth="1.4" opacity="0.5">
        {columnX.slice(0, -1).map((x) => (
          <path
            key={x}
            d={`M ${x + COLUMN_HALF} ${CAPITAL_Y} A ${ARCH_R} ${ARCH_R} 0 0 1 ${
              x + SPACING - COLUMN_HALF
            } ${CAPITAL_Y}`}
          />
        ))}
      </g>

      {/* Columns, each with its capital. */}
      <g strokeWidth="1.4" opacity="0.5">
        {columnX.map((x) => (
          <g key={x}>
            <line x1={x - COLUMN_HALF} y1={CAPITAL_Y} x2={x - COLUMN_HALF} y2={GROUND_Y} />
            <line x1={x + COLUMN_HALF} y1={CAPITAL_Y} x2={x + COLUMN_HALF} y2={GROUND_Y} />
            <line
              x1={x - COLUMN_HALF - 4}
              y1={CAPITAL_Y}
              x2={x + COLUMN_HALF + 4}
              y2={CAPITAL_Y}
            />
          </g>
        ))}
      </g>

      {/* Stylobate — the ground the whole thing stands on, and the heaviest
          line in the drawing. */}
      <g strokeWidth="1.6" opacity="0.55">
        <line x1="0" y1={GROUND_Y} x2={WIDTH} y2={GROUND_Y} />
        <line x1="0" y1={GROUND_Y + 9} x2={WIDTH} y2={GROUND_Y + 9} />
      </g>
    </svg>
  );
}
