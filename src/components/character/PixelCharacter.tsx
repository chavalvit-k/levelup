"use client";
/**
 * PixelCharacter — 32×32 pixel-art sprite with automatic silhouette outline.
 *
 * Grid : 32 × 32 cells, each cell = P=6 SVG units → 192×192 viewBox.
 * Outline: SVG feMorphology dilate filter expands the sprite silhouette by
 *          exactly 1 "sprite pixel" (radius=P) in dark color, producing a
 *          clean 1-pixel border around every equipped layer with zero manual
 *          outline pixel definitions.
 *
 * Proportions (Adventure Time / chibi cartoon):
 *   Head  : rows  3–14  (12 rows = 44 % of 27-row character)
 *   Neck  : rows 15–16
 *   Shirt : rows 17–23  (with arm stubs rows 18–20)
 *   Belt  : row  24
 *   Pants : rows 25–28
 *   Shoes : rows 29–31
 *
 * Equipment overlays (rendered last so outline wraps whole sprite):
 *   Hat   : rows  0–4  (crown rows 0–3, brim row 4)
 *   Glasses: rows 5–9  over the eye region
 */

const P = 6; // SVG units per sprite pixel
const W = 32 * P; // 192
const H = 32 * P; // 192

type Pixel = [number, number]; // [col, row]

/** Fill a rectangular region of the pixel grid. */
function box(r1: number, r2: number, c1: number, c2: number): Pixel[] {
  const out: Pixel[] = [];
  for (let r = r1; r <= r2; r++)
    for (let c = c1; c <= c2; c++) out.push([c, r] as Pixel);
  return out;
}

// ─── HEAD ─────────────────────────────────────────────────────────────────────
// Large round cartoon head occupying rows 3–14 (12 rows)
const HEAD: Pixel[] = [
  ...box(3, 3, 13, 18), // top arc — 6 wide
  ...box(4, 4, 11, 20), // widening — 10 wide
  ...box(5, 12, 9, 22), // full face — 14 wide
  ...box(13, 13, 11, 20), // jaw taper — 10 wide
  ...box(14, 14, 13, 18), // chin tip — 6 wide
];

const HEAD_HIGHLIGHT: Pixel[] = [...box(4, 5, 11, 13), [11, 6], [12, 6]];

const HEAD_SHADOW: Pixel[] = [...box(5, 12, 21, 22), ...box(13, 13, 20, 20)];

// ─── EYES ─────────────────────────────────────────────────────────────────────
// Big kawaii eyes: 4 wide × 6 tall white area, large pupils, double sparkle glints
const EYE_LEFT_WHITE: Pixel[] = box(5, 10, 11, 14); // 4 × 6 — wider + taller
const EYE_RIGHT_WHITE: Pixel[] = box(5, 10, 17, 20); // 4 × 6

const EYE_LEFT_PUPIL: Pixel[] = box(7, 10, 12, 14); // 3 × 4 — large dark pupils
const EYE_RIGHT_PUPIL: Pixel[] = box(7, 10, 17, 19); // 3 × 4

// Double-pixel sparkle glints in top-left of each pupil
const EYE_GLINT: Pixel[] = [
  [12, 7],
  [12, 8], // left eye (vertical 2-px glint)
  [17, 7],
  [17, 8], // right eye
];

// ─── EYEBROWS + NOSE ──────────────────────────────────────────────────────────
// Simple 4-pixel arched brows above each eye at row 4
const EYEBROW_LEFT: Pixel[] = [
  [11, 4],
  [12, 4],
  [13, 4],
  [14, 4],
];
const EYEBROW_RIGHT: Pixel[] = [
  [17, 4],
  [18, 4],
  [19, 4],
  [20, 4],
];

// Tiny 2-pixel button nose between the eyes
const NOSE: Pixel[] = [
  [15, 11],
  [16, 11],
];

// ─── FACE DETAILS ─────────────────────────────────────────────────────────────
// Rosy cheeks — 2×2 per side, warm anime pink, positioned below eyes at rows 11-12
const BLUSH: Pixel[] = [
  ...box(11, 12, 9, 10), // left cheek — 2×2
  ...box(11, 12, 21, 22), // right cheek — 2×2
];

// Smile — corners raised (row 12), bottom arc at row 13 = genuine happy smile
const MOUTH: Pixel[] = [
  [13, 12],
  [18, 12], // raised corners
  ...box(13, 13, 14, 17), // bottom arc (4 wide)
];

// ─── NECK ─────────────────────────────────────────────────────────────────────
const NECK: Pixel[] = box(15, 16, 14, 17); // 4 wide × 2 tall

// ─── SHIRT ────────────────────────────────────────────────────────────────────
const SHIRT: Pixel[] = box(17, 23, 11, 20); // 10 wide × 7 tall

// Arm stubs (small shoulder protrusions, same shirt color)
const ARMS: Pixel[] = [
  ...box(18, 20, 9, 10), // left arm
  ...box(18, 20, 21, 22), // right arm
];

// Collar — 2 pixels at top center, slightly darker
const SHIRT_COLLAR: Pixel[] = [
  [15, 17],
  [16, 17],
];

// Shirt shadow — right edge
const SHIRT_SHADOW: Pixel[] = [...box(17, 23, 20, 20), ...box(18, 20, 22, 22)];

// ─── BELT ─────────────────────────────────────────────────────────────────────
const BELT: Pixel[] = box(24, 24, 11, 20);
const BELT_BUCKLE: Pixel[] = [
  [15, 24],
  [16, 24],
]; // gold accent

// ─── PANTS ────────────────────────────────────────────────────────────────────
const PANTS_LEFT: Pixel[] = box(25, 28, 11, 14); // 4 × 4
const PANTS_RIGHT: Pixel[] = box(25, 28, 17, 20); // 4 × 4

// Gap / crotch shadow between legs
const PANTS_CROTCH: Pixel[] = box(25, 26, 15, 16);

// Inner-seam shadows on each leg
const PANTS_SHADOW: Pixel[] = [
  ...box(25, 28, 14, 14), // right edge of left leg
  ...box(25, 28, 17, 17), // left edge of right leg
];

// ─── SHOES ────────────────────────────────────────────────────────────────────
const SHOE_LEFT: Pixel[] = [
  ...box(29, 30, 9, 14), // 6 × 2
  ...box(31, 31, 8, 15), // 8 × 1 toe widens
];
const SHOE_RIGHT: Pixel[] = [
  ...box(29, 30, 17, 22), // 6 × 2
  ...box(31, 31, 16, 23), // 8 × 1 toe widens
];

// Shoe toe highlights
const SHOE_HIGHLIGHT: Pixel[] = [
  [8, 29],
  [9, 29], // left
  [22, 29],
  [23, 29], // right
];

// ─── HAT OVERLAY ──────────────────────────────────────────────────────────────
// Sits above head; brim (row 4) overlaps head top arc
const HAT_CROWN: Pixel[] = [
  ...box(0, 0, 13, 18), // narrow tip
  ...box(1, 3, 11, 20), // crown body
];
const HAT_BAND: Pixel[] = box(3, 3, 11, 20); // darker stripe row
const HAT_BRIM: Pixel[] = box(4, 4, 9, 22); // wide brim

// ─── GLASSES OVERLAY ──────────────────────────────────────────────────────────
// Updated to 5×6 lenses matching the new taller eye shape
const GLASSES_LEFT: Pixel[] = box(5, 10, 10, 14); // 5 × 6
const GLASSES_RIGHT: Pixel[] = box(5, 10, 17, 21); // 5 × 6
const GLASSES_BRIDGE: Pixel[] = box(7, 7, 15, 16); // thin 2-px bridge

// Frame edges
const GLASSES_FRAME_L: Pixel[] = [
  ...box(5, 5, 10, 14), // top
  ...box(10, 10, 10, 14), // bottom
  ...box(5, 10, 10, 10), // left
  ...box(5, 10, 14, 14), // right
];
const GLASSES_FRAME_R: Pixel[] = [
  ...box(5, 5, 17, 21), // top
  ...box(10, 10, 17, 21), // bottom
  ...box(5, 10, 17, 17), // left
  ...box(5, 10, 21, 21), // right
];

// ─── Component ────────────────────────────────────────────────────────────────

interface EquippedCosmetics {
  hat?: { color: string } | undefined;
  glasses?: { color: string } | undefined;
  shirt?: { color: string } | undefined;
  pants?: { color: string } | undefined;
  shoes?: { color: string } | undefined;
}

interface PixelCharacterProps {
  baseColor: string;
  equipped?: EquippedCosmetics;
  scale?: number;
}

/** Render a list of [col, row] pixel coordinates as crisp SVG rect elements. */
function Pixels({
  pixels,
  fill,
  opacity = 1,
}: {
  pixels: Pixel[];
  fill: string;
  opacity?: number;
}) {
  return (
    <>
      {pixels.map(([col, row], i) => (
        <rect
          key={i}
          x={col * P}
          y={row * P}
          width={P}
          height={P}
          fill={fill}
          opacity={opacity}
        />
      ))}
    </>
  );
}

export function PixelCharacter({
  baseColor,
  equipped = {},
  scale = 1,
}: PixelCharacterProps) {
  const shirtColor = equipped.shirt?.color ?? darken(baseColor, 0.22);
  const pantsColor = equipped.pants?.color ?? darken(baseColor, 0.42);
  const shoeColor = equipped.shoes?.color ?? "#111827";
  const hatColor = equipped.hat?.color ?? null;
  const glassesColor = equipped.glasses?.color ?? null;

  const skinHighlight = lighten(baseColor, 0.2);
  const skinShadow = darken(baseColor, 0.2);
  const pantsShadow = darken(pantsColor, 0.22);
  const shirtShadow = darken(shirtColor, 0.22);
  const shoeToe = lighten(shoeColor, 0.3);
  const beltColor = darken(pantsColor, 0.18);

  const OUTLINE_COLOR = "#0d1117";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W * scale}
      height={H * scale}
      className="pixel-art select-none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: "pixelated" }}
    >
      <defs>
        {/*
         * Pixel-art outline filter:
         * 1. dilate the sprite alpha by exactly P (=6) units → 1 sprite-pixel border
         * 2. fill that expanded area with the outline color
         * 3. merge outline (behind) with the original sprite (in front)
         */}
        <filter
          id="px-outline"
          x="-15%"
          y="-15%"
          width="130%"
          height="130%"
          colorInterpolationFilters="sRGB"
        >
          <feMorphology
            in="SourceAlpha"
            operator="dilate"
            radius={P}
            result="expanded"
          />
          <feFlood floodColor={OUTLINE_COLOR} result="outlineColor" />
          <feComposite
            in="outlineColor"
            in2="expanded"
            operator="in"
            result="outline"
          />
          <feMerge>
            <feMergeNode in="outline" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Apply outline filter to entire sprite group */}
      <g filter="url(#px-outline)">
        {/* ── Shoes (bottom layer) ── */}
        <Pixels pixels={[...SHOE_LEFT, ...SHOE_RIGHT]} fill={shoeColor} />
        <Pixels pixels={SHOE_HIGHLIGHT} fill={shoeToe} />

        {/* ── Pants ── */}
        <Pixels pixels={[...PANTS_LEFT, ...PANTS_RIGHT]} fill={pantsColor} />
        <Pixels pixels={PANTS_CROTCH} fill={pantsShadow} />
        <Pixels pixels={PANTS_SHADOW} fill={pantsShadow} />

        {/* ── Belt ── */}
        <Pixels pixels={BELT} fill={beltColor} />
        <Pixels pixels={BELT_BUCKLE} fill="#D4AF37" />

        {/* ── Shirt + Arms ── */}
        <Pixels pixels={[...SHIRT, ...ARMS]} fill={shirtColor} />
        <Pixels pixels={SHIRT_SHADOW} fill={shirtShadow} />
        <Pixels pixels={SHIRT_COLLAR} fill={darken(shirtColor, 0.18)} />

        {/* ── Neck ── */}
        <Pixels pixels={NECK} fill={skinShadow} />

        {/* ── Head skin ── */}
        <Pixels pixels={HEAD} fill={baseColor} />
        <Pixels pixels={HEAD_HIGHLIGHT} fill={skinHighlight} />
        <Pixels pixels={HEAD_SHADOW} fill={skinShadow} />

        {/* ── Eyebrows ── */}
        <Pixels
          pixels={[...EYEBROW_LEFT, ...EYEBROW_RIGHT]}
          fill={darken(baseColor, 0.55)}
        />

        {/* ── Eyes ── */}
        <Pixels
          pixels={[...EYE_LEFT_WHITE, ...EYE_RIGHT_WHITE]}
          fill="#f8f8f8"
        />
        <Pixels
          pixels={[...EYE_LEFT_PUPIL, ...EYE_RIGHT_PUPIL]}
          fill="#0d1117"
        />
        <Pixels pixels={EYE_GLINT} fill="#ffffff" />

        {/* ── Face details ── */}
        <Pixels pixels={NOSE} fill={darken(baseColor, 0.2)} />
        <Pixels pixels={BLUSH} fill="#FF8FAB" opacity={0.72} />
        <Pixels pixels={MOUTH} fill={darken(baseColor, 0.45)} />

        {/* ── Hat overlay ── */}
        {hatColor && (
          <>
            <Pixels pixels={HAT_CROWN} fill={hatColor} />
            <Pixels pixels={HAT_BAND} fill={darken(hatColor, 0.28)} />
            <Pixels pixels={HAT_BRIM} fill={darken(hatColor, 0.12)} />
            {/* Crown highlight */}
            <Pixels pixels={box(1, 1, 12, 15)} fill={lighten(hatColor, 0.2)} />
          </>
        )}

        {/* ── Glasses overlay ── */}
        {glassesColor && (
          <>
            <Pixels
              pixels={[...GLASSES_LEFT, ...GLASSES_RIGHT]}
              fill={glassesColor}
              opacity={0.4}
            />
            <Pixels pixels={GLASSES_BRIDGE} fill={glassesColor} opacity={0.6} />
            <Pixels
              pixels={[...GLASSES_FRAME_L, ...GLASSES_FRAME_R]}
              fill={darken(glassesColor, 0.35)}
              opacity={0.9}
            />
          </>
        )}
      </g>
    </svg>
  );
}

// ─── Color utilities ──────────────────────────────────────────────────────────

function darken(hex: string, factor: number): string {
  const c = parseHex(hex);
  if (!c) return hex;
  return toHex(
    Math.round(c.r * (1 - factor)),
    Math.round(c.g * (1 - factor)),
    Math.round(c.b * (1 - factor)),
  );
}

function lighten(hex: string, factor: number): string {
  const c = parseHex(hex);
  if (!c) return hex;
  return toHex(
    Math.round(c.r + (255 - c.r) * factor),
    Math.round(c.g + (255 - c.g) * factor),
    Math.round(c.b + (255 - c.b) * factor),
  );
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function toHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
      .join("")
  );
}
