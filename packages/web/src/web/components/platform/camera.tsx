import type { ReactNode } from "react";
import { easeInOut, lerp, progress } from "./timeline";

/** A camera key: at time t, centre the view on (x, y) in stage pixels at scale s. */
export type CamKey = { t: number; x: number; y: number; s: number };

export function camAt(t: number, keys: CamKey[]) {
  if (t <= keys[0].t) return keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (t <= b.t) {
      const p = easeInOut(progress(t, a.t, b.t));
      return { t, x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), s: lerp(a.s, b.s, p) };
    }
  }
  return keys[keys.length - 1];
}

/** Push-ins and pull-backs: the whole 1920×1080 stage moves as one camera. */
export function Cam({ t, keys, children }: { t: number; keys: CamKey[]; children: ReactNode }) {
  const { x, y, s } = camAt(t, keys);
  const tx = Math.min(0, Math.max(1920 - 1920 * s, 960 - x * s));
  const ty = Math.min(0, Math.max(1080 - 1080 * s, 540 - y * s));
  return (
    <div
      className="platform-cam"
      style={{ transform: `translate(${tx}px, ${ty}px) scale(${s})`, transformOrigin: "0 0" }}
    >
      {children}
    </div>
  );
}

type Pt = [number, number];

/** CSS matrix3d that maps a w×h box onto the quad [TL, TR, BR, BL]. */
export function quadMatrix(w: number, bh: number, q: [Pt, Pt, Pt, Pt]) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2;
  const dx2 = x3 - x2;
  const dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2;
  const dy2 = y3 - y2;
  const dy3 = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / den;
  const h = (dx1 * dy3 - dx3 * dy1) / den;
  const a = x1 - x0 + g * x1;
  const b = x3 - x0 + h * x3;
  const d = y1 - y0 + g * y1;
  const e = y3 - y0 + h * y3;
  const m = [a / w, d / w, 0, g / w, b / bh, e / bh, 0, h / bh, 0, 0, 1, 0, x0, y0, 0, 1];
  return `matrix3d(${m.map((v) => +v.toFixed(9)).join(",")})`;
}

export const PLATES = {
  linen: {
    src: "/images/platform/tablet-linen.webp",
    quad: [
      [1073, 790],
      [2757, 792],
      [2929, 1644],
      [921, 1643],
    ],
    light: 0.94,
  },
  station: {
    src: "/images/platform/tablet-station.webp",
    quad: [
      [1211, 710],
      [2635, 714],
      [2751, 1470],
      [1094, 1473],
    ],
    light: 0.9,
  },
  night: {
    src: "/images/platform/tablet-night.webp",
    quad: [
      [1184, 833],
      [2662, 836],
      [2777, 1637],
      [1044, 1637],
    ],
    light: 0.8,
  },
} as const;

export const SCREEN_W = 1280;
export const SCREEN_H = 880;
