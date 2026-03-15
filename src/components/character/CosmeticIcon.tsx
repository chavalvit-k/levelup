"use client";
import React from "react";
/**
 * CosmeticIcon — Small pixel-art icons for each cosmetic slot.
 *
 * Grid: 16x16 cells, each cell = IP=3 SVG units -> 48x48 viewBox.
 * Slots: hat | glasses | color | background | reward
 */

const IP = 3; // units per icon pixel
const IW = 16 * IP; // 48
const IH = 16 * IP; // 48

type Pixel = [number, number];

function box(r1: number, r2: number, c1: number, c2: number): Pixel[] {
  const out: Pixel[] = [];
  for (let r = r1; r <= r2; r++)
    for (let c = c1; c <= c2; c++) out.push([c, r] as Pixel);
  return out;
}

function shadeDown(hex: string, factor: number): string {
  const c = parseH(hex);
  if (!c) return hex;
  return toH(Math.round(c.r*(1-factor)), Math.round(c.g*(1-factor)), Math.round(c.b*(1-factor)));
}
function shadeUp(hex: string, factor: number): string {
  const c = parseH(hex);
  if (!c) return hex;
  return toH(
    Math.round(c.r+(255-c.r)*factor),
    Math.round(c.g+(255-c.g)*factor),
    Math.round(c.b+(255-c.b)*factor),
  );
}
function parseH(hex: string) {
  const clean = hex.replace('#','');
  if (clean.length !== 6) return null;
  return { r: parseInt(clean.slice(0,2),16), g: parseInt(clean.slice(2,4),16), b: parseInt(clean.slice(4,6),16) };
}
function toH(r: number, g: number, b: number): string {
  return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,v)).toString(16).padStart(2,'0')).join('');
}

function Pix({ pixels, fill, opacity=1 }: { pixels: Pixel[]; fill: string; opacity?: number }) {
  return <>{ pixels.map(([c,r],i)=><rect key={i} x={c*IP} y={r*IP} width={IP} height={IP} fill={fill} opacity={opacity}/>) }</>;
}

// Hat icon — classic top-hat
function HatIcon({ color }: { color: string }) {
  const dark = shadeDown(color, 0.3);
  const light = shadeUp(color, 0.25);
  return <g>
    <Pix pixels={[...box(2,2,5,10), ...box(3,7,4,11)]} fill={color} />
    <Pix pixels={box(6,7,4,11)} fill={dark} />
    <Pix pixels={box(8,9,2,13)} fill={dark} />
    <Pix pixels={box(2,5,4,5)} fill={light} />
  </g>;
}

// Glasses icon
function GlassesIcon({ color }: { color: string }) {
  const dark = shadeDown(color, 0.4);
  const lens = shadeUp(color, 0.1);
  return <g>
    <Pix pixels={box(4,8,1,6)} fill={lens} opacity={0.6} />
    <Pix pixels={[...box(4,4,1,6),...box(8,8,1,6),...box(4,8,1,1),...box(4,8,6,6)]} fill={dark} />
    <Pix pixels={box(4,8,9,14)} fill={lens} opacity={0.6} />
    <Pix pixels={[...box(4,4,9,14),...box(8,8,9,14),...box(4,8,9,9),...box(4,8,14,14)]} fill={dark} />
    <Pix pixels={box(6,6,7,8)} fill={dark} />
    <Pix pixels={[[4,0],[4,15]] as Pixel[]} fill={dark} />
  </g>;
}

// Color icon — solid circle swatch
function ColorIcon({ color }: { color: string }) {
  const light = shadeUp(color, 0.35);
  return <g>
    <Pix pixels={box(3,3,5,10)} fill={color} />
    <Pix pixels={box(4,11,4,11)} fill={color} />
    <Pix pixels={box(12,12,5,10)} fill={color} />
    <Pix pixels={box(4,5,5,7)} fill={light} />
  </g>;
}

// Background icon — landscape horizon
function BackgroundIcon({ color }: { color: string }) {
  const sky = shadeUp(color, 0.3);
  const ground = shadeDown(color, 0.2);
  const mtn = shadeUp(color, 0.08);
  return <g>
    <Pix pixels={box(0,8,0,15)} fill={sky} />
    <Pix pixels={box(9,15,0,15)} fill={ground} />
    <Pix pixels={[[8,7],[8,8]] as Pixel[]} fill={mtn} />
    <Pix pixels={box(7,7,6,9)} fill={mtn} />
    <Pix pixels={box(6,6,5,10)} fill={mtn} />
    <Pix pixels={box(5,5,4,11)} fill={mtn} />
    <Pix pixels={[[8,7]] as Pixel[]} fill="#E5E7EB" />
    <Pix pixels={box(7,7,7,8)} fill="#E5E7EB" />
  </g>;
}

// Reward icon — star burst
function RewardIcon({ color }: { color: string }) {
  const dark = shadeDown(color, 0.25);
  return <g>
    <Pix pixels={box(4,11,7,8)} fill={color} />
    <Pix pixels={box(6,9,4,11)} fill={color} />
    <Pix pixels={[...box(5,6,5,6),...box(5,6,9,10),...box(9,10,5,6),...box(9,10,9,10)]} fill={color} />
    <Pix pixels={[[7,7]] as Pixel[]} fill="#ffffff" opacity={0.6} />
    <Pix pixels={[[5,4],[10,4],[5,11],[10,11]] as Pixel[]} fill={dark} />
  </g>;
}

const ICONS: Record<string, (props: { color: string }) => React.ReactElement> = {
  hat: HatIcon,
  glasses: GlassesIcon,
  color: ColorIcon,
  background: BackgroundIcon,
  reward: RewardIcon,
};

interface CosmeticIconProps {
  slot: string;
  color?: string;
  size?: number;   // display size in px (default 36)
  muted?: boolean; // greyscale for locked/past items
}

export function CosmeticIcon({ slot, color = "#6366F1", size = 36, muted = false }: CosmeticIconProps) {
  const IconFn = ICONS[slot];
  if (!IconFn) return null;
  const displayColor = muted ? "#374151" : color;
  return (
    <svg
      viewBox={`0 0 ${IW} ${IH}`}
      width={size}
      height={size}
      className="pixel-art select-none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: "pixelated" }}
    >
      <defs>
        <filter id={`icon-outline-${slot}`} x="-20%" y="-20%" width="140%" height="140%">
          <feMorphology in="SourceAlpha" operator="dilate" radius={IP} result="expanded" />
          <feFlood floodColor="#0d1117" result="outlineColor" />
          <feComposite in="outlineColor" in2="expanded" operator="in" result="outline" />
          <feMerge>
            <feMergeNode in="outline" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#icon-outline-${slot})`}>
        <IconFn color={displayColor} />
      </g>
    </svg>
  );
}
