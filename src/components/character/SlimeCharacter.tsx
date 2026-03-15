"use client";
import React from "react";

/**
 * SlimeCharacter — Cute pixel-art slime sprite.
 *
 * Grid : 32 × 32 cells, each cell = P=6 SVG units → 192×192 viewBox.
 * Shape: Classic RPG blob — droopy top, round body, flat base, big cute eyes.
 *
 * Render order (back → front):
 *   Background rect → Slime body → Glasses → Hat
 *
 * Outline: feMorphology dilate wraps the slime + cosmetics group with a 1-cell
 *          dark border — same technique as the old PixelCharacter.
 */

const P = 6; // SVG units per sprite pixel
const W = 32 * P; // 192
const H = 32 * P; // 192

export const DEFAULT_SLIME_COLOR = "#5B6CF9";

type Pixel = [number, number]; // [col, row]

function box(r1: number, r2: number, c1: number, c2: number): Pixel[] {
  const out: Pixel[] = [];
  for (let r = r1; r <= r2; r++)
    for (let c = c1; c <= c2; c++) out.push([c, r] as Pixel);
  return out;
}

// ─── SLIME BODY ───────────────────────────────────────────────────────────────
// Classic RPG blob: narrow droopy tip, round expanding sides, flat base.
// Rows 2–20, widest = 18 cols wide at rows 9–14.
const SLIME_BODY: Pixel[] = [
  ...box(2, 2, 15, 16), // top droop tip (2 wide)
  ...box(3, 3, 14, 17), // (4 wide)
  ...box(4, 4, 12, 19), // (8 wide)
  ...box(5, 6, 10, 21), // (12 wide)
  ...box(7, 8, 8, 23), // (16 wide)
  ...box(9, 14, 7, 24), // main body — 18 wide (eye area)
  ...box(15, 16, 8, 23), // (16 wide)
  ...box(17, 18, 10, 21), // (12 wide)
  ...box(19, 19, 12, 19), // (8 wide)
  ...box(20, 20, 14, 17), // flat base (4 wide)
];

// Top‑left highlight — gives body depth / light source feel
const SLIME_HIGHLIGHT: Pixel[] = [
  [9, 9],
  [10, 9],
  [11, 9],
  [9, 10],
  [10, 10],
  [9, 11],
];

// Lower‑right shadow
const SLIME_SHADOW: Pixel[] = [...box(12, 15, 22, 23), ...box(16, 17, 20, 22)];

// ─── EYES ─────────────────────────────────────────────────────────────────────
// Simple 2×2 solid dark eyes — classic slime look
const EYE_LEFT: Pixel[] = box(11, 12, 10, 11); // 2×2
const EYE_RIGHT: Pixel[] = box(11, 12, 20, 21); // 2×2

// Single bright glint at top‑left of each eye
const EYE_GLINT: Pixel[] = [
  [10, 11],
  [20, 11],
];

// ─── FACE ─────────────────────────────────────────────────────────────────────
// Happy smile: two raised corner pixels + bottom arc
const MOUTH: Pixel[] = [
  [13, 15],
  [18, 15], // raised corners
  [14, 16],
  [15, 16],
  [16, 16],
  [17, 16], // bottom arc
];

// Soft rosy cheek blushes (2×2 per side)
const CHEEKS: Pixel[] = [
  ...box(13, 14, 8, 9), // left
  ...box(13, 14, 22, 23), // right
];

// ─── HAT OVERLAY ──────────────────────────────────────────────────────────────
// Crown rows 0–3, wide brim rows 4–5 that cover and replace the droop tip.
const HAT_TIP: Pixel[] = box(0, 0, 14, 17); // pointed tip (4 wide)
const HAT_CROWN: Pixel[] = box(0, 3, 12, 19); // crown body (8 wide)
const HAT_BAND: Pixel[] = box(3, 3, 12, 19); // band at base of crown (re-render darker)
const HAT_BRIM: Pixel[] = box(4, 5, 9, 22); // brim (14 wide — covers slime rows 4–5)

// ─── GLASSES OVERLAY ──────────────────────────────────────────────────────────
// Lenses align with eyes at rows 11–12; lens box rows 10–13
const GLASSES_LEFT: Pixel[] = box(10, 13, 9, 12); // 4×4 left lens
const GLASSES_RIGHT: Pixel[] = box(10, 13, 19, 22); // 4×4 right lens
const GLASSES_BRIDGE: Pixel[] = box(11, 12, 13, 18); // horizontal bridge

const GLASSES_FRAME_L: Pixel[] = [
  ...box(10, 10, 9, 12), // top
  ...box(13, 13, 9, 12), // bottom
  ...box(10, 13, 9, 9), // left
  ...box(10, 13, 12, 12), // right
];
const GLASSES_FRAME_R: Pixel[] = [
  ...box(10, 10, 19, 22), // top
  ...box(13, 13, 19, 22), // bottom
  ...box(10, 13, 19, 19), // left
  ...box(10, 13, 22, 22), // right
];

// ─── Component ────────────────────────────────────────────────────────────────

export interface SlimeEquipped {
  hat?: { color: string } | undefined;
  glasses?: { color: string } | undefined;
  background?: { color: string } | undefined;
}

export interface SlimeCharacterProps {
  /** Active slime body color. Defaults to DEFAULT_SLIME_COLOR. */
  color?: string;
  /** Currently equipped cosmetics. */
  equipped?: SlimeEquipped;
  /** Uniform scale factor (1 = 192×192 px). */
  scale?: number;
}

/** Render a list of [col, row] pixel coordinates as crisp SVG rects. */
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

export function SlimeCharacter({
  color = DEFAULT_SLIME_COLOR,
  equipped = {},
  scale = 1,
}: SlimeCharacterProps) {
  const bgColor = equipped.background?.color ?? null;
  const hatColor = equipped.hat?.color ?? null;
  const glassesColor = equipped.glasses?.color ?? null;

  const bodyHighlight = lighten(color, 0.38);
  const bodyShadow = darken(color, 0.25);
  const mouthColor = darken(color, 0.45);

  const OUTLINE = "#0d1117";

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
         * Pixel-art outline:
         * 1. Dilate the sprite alpha by P units → 1 sprite-pixel border
         * 2. Flood-fill with dark colour → outline layer
         * 3. Merge outline behind original pixels
         */}
        <filter
          id="slime-outline"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feMorphology
            in="SourceAlpha"
            operator="dilate"
            radius={P}
            result="expanded"
          />
          <feFlood floodColor={OUTLINE} result="outlineColor" />
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

      {/* ── Background (outside filter so it fills the full canvas) ── */}
      {bgColor && (
        <rect x={0} y={0} width={W} height={H} fill={bgColor} rx={4} />
      )}

      {/* ── Slime + cosmetics (outlined as one unit) ── */}
      <g filter="url(#slime-outline)">
        {/* Body */}
        <Pixels pixels={SLIME_BODY} fill={color} />
        <Pixels pixels={SLIME_HIGHLIGHT} fill={bodyHighlight} />
        <Pixels pixels={SLIME_SHADOW} fill={bodyShadow} />

        {/* Eyes */}
        <Pixels pixels={[...EYE_LEFT, ...EYE_RIGHT]} fill="#1a1a2e" />
        <Pixels pixels={EYE_GLINT} fill="#ffffff" />

        {/* Face */}
        <Pixels pixels={MOUTH} fill={mouthColor} />
        <Pixels pixels={CHEEKS} fill="#FF8FAB" opacity={0.72} />

        {/* Glasses overlay */}
        {glassesColor && (
          <>
            <Pixels
              pixels={[...GLASSES_LEFT, ...GLASSES_RIGHT]}
              fill={glassesColor}
              opacity={0.38}
            />
            <Pixels pixels={GLASSES_BRIDGE} fill={glassesColor} opacity={0.6} />
            <Pixels
              pixels={[...GLASSES_FRAME_L, ...GLASSES_FRAME_R]}
              fill={darken(glassesColor, 0.38)}
            />
          </>
        )}

        {/* Hat overlay */}
        {hatColor && (
          <>
            <Pixels pixels={[...HAT_TIP, ...HAT_CROWN]} fill={hatColor} />
            <Pixels pixels={HAT_BAND} fill={darken(hatColor, 0.26)} />
            <Pixels pixels={HAT_BRIM} fill={darken(hatColor, 0.13)} />
            {/* Crown highlight */}
            <Pixels pixels={box(1, 1, 13, 16)} fill={lighten(hatColor, 0.22)} />
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
