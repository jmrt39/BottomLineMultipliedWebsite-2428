// Floor scenes: tablets on linen, at the station and at close.
import type { ReactNode } from "react";
import { Cam, type CamKey, PLATES, SCREEN_H, SCREEN_W, quadMatrix } from "./camera";
import { ChecklistScreen, PosScreen, SilverScreen } from "./screens";
import { SCENES } from "./timeline";

type PlateName = keyof typeof PLATES;

/** Where a point on the plate's screen (screen px) lands on the stage. */
export function plateToStage(plate: PlateName, u: number, v: number): [number, number] {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = PLATES[plate].quad.map(([x, y]) => [
    x / 2,
    y / 2,
  ]);
  const s = u / SCREEN_W;
  const r = v / SCREEN_H;
  // bilinear is close enough for camera targets
  const x = (1 - r) * ((1 - s) * x0 + s * x1) + r * ((1 - s) * x3 + s * x2);
  const y = (1 - r) * ((1 - s) * y0 + s * y1) + r * ((1 - s) * y3 + s * y2);
  return [x, y];
}

/** Camera keys aimed at points on a plate screen: [c, u, v, scale]. */
const plateKeys = (plate: PlateName, offset: number, keys: [number, number, number, number][]) =>
  keys.map(([c, u, v, s]): CamKey => {
    const [x, y] = plateToStage(plate, u, v);
    return { t: c + offset, x, y, s };
  });

export function PlateShot({
  plate,
  t,
  keys,
  children,
}: {
  plate: PlateName;
  t: number;
  keys: CamKey[];
  children: ReactNode;
}) {
  const p = PLATES[plate];
  const q = p.quad.map(([x, y]) => [x / 2, y / 2]) as [number, number][];
  return (
    <Cam t={t} keys={keys}>
      <div className="platform-plate">
        <img src={p.src} alt="" />
        <PlateScreen quad={q} light={p.light}>
          {children}
        </PlateScreen>
      </div>
    </Cam>
  );
}

function PlateScreen({
  quad,
  light,
  children,
}: {
  quad: [number, number][];
  light: number;
  children: ReactNode;
}) {
  return (
    <div
      className="platform-plate-screen"
      style={{
        width: SCREEN_W,
        height: SCREEN_H,
        transform: quadMatrix(SCREEN_W, SCREEN_H, quad as never),
        filter: `brightness(${light})`,
      }}
    >
      {children}
      <span className="platform-plate-glare" />
    </div>
  );
}

// ---------- checklists ----------
/**
 * Checklist clocks: c = 0 is set so the UI scene starts at c = 4. Opening: the LB-open shot starts
 * at c = 0 (Kerr presses Verify at c ≈ 0.55). Closing: C8 (Kerr signs) starts at c ≈ 0.65.
 */
export const OPEN_C0 = SCENES.opening[0] - 4;
export const CLOSE_C0 = SCENES.closing[0] - 4;

const OPEN_CAM: [number, number, number, number][] = [
  [3.4, 640, 440, 1.06],
  [4.8, 700, 400, 1.42],
  [5.7, 760, 430, 1.42],
  [6.6, 930, 450, 1.46],
  [7.4, 930, 450, 1.68],
  [8.6, 930, 470, 1.68],
  [9.4, 930, 700, 1.68],
  [10.2, 930, 700, 1.68],
  [11.2, 960, 780, 1.68],
  [12.0, 960, 780, 1.68],
  [13.6, 640, 470, 1.08],
];
const CLOSE_CAM: [number, number, number, number][] = [
  [3.4, 640, 440, 1.06],
  [4.6, 930, 470, 1.6],
  [5.2, 930, 690, 1.68],
  [6.2, 930, 690, 1.68],
  [7.4, 960, 780, 1.68],
  [9.0, 960, 780, 1.68],
  [10.4, 640, 470, 1.08],
  [13.0, 640, 470, 1.04],
];

export function OpeningScene({ t }: { t: number }) {
  return (
    <PlateShot plate="linen" t={t} keys={plateKeys("linen", OPEN_C0, OPEN_CAM)}>
      <ChecklistScreen kind="open" c={t - OPEN_C0} />
    </PlateShot>
  );
}

export function ClosingScene({ t }: { t: number }) {
  return (
    <PlateShot plate="night" t={t} keys={plateKeys("night", CLOSE_C0, CLOSE_CAM)}>
      <ChecklistScreen kind="close" c={t - CLOSE_C0} />
    </PlateShot>
  );
}

// ---------- POS ----------
export const POS_C0 = SCENES.pos[0];
export function PosScene({ t }: { t: number }) {
  const keys = plateKeys("station", POS_C0, [
    [-0.4, 640, 440, 1.04],
    [1.2, 400, 470, 1.45],
    [4.4, 400, 470, 1.45],
    [5.4, 930, 460, 1.45],
    [6.4, 930, 460, 1.45],
    [7.2, 560, 760, 1.6],
    [8.4, 560, 760, 1.6],
    [10.6, 640, 440, 1.12],
  ]);
  return (
    <PlateShot plate="station" t={t} keys={keys}>
      <PosScreen c={t - POS_C0} />
    </PlateShot>
  );
}

// ---------- glassware & silverware (studio tablet) ----------
/** Silver clock: LF-sign keeps c = clip + 11 (as in v2), so T3 runs at c = clip − 2.0. */
export const SILVER_C0 = SCENES.liveSign[0] - 12;
const TAB_S = 0.9;
/** Stage point for a point on the studio tablet screen. */
const tab = (u: number, v: number): [number, number] => [
  960 + (u - SCREEN_W / 2) * TAB_S,
  500 + (v - SCREEN_H / 2) * TAB_S,
];
const tabKeys = (offset: number, keys: [number, number, number, number][]) =>
  keys.map(([c, u, v, s]): CamKey => {
    const [x, y] = tab(u, v);
    return { t: c + offset, x, y, s };
  });

export function StudioTablet({ children }: { children: ReactNode }) {
  return (
    <div className="pv-studio">
      <div className="pv-studio-tablet" style={{ transform: `scale(${TAB_S})` }}>
        <div className="pv-studio-screen">{children}</div>
      </div>
    </div>
  );
}

export function SilverScene({ t }: { t: number }) {
  const keys = tabKeys(SILVER_C0, [
    [3.0, 640, 440, 1.0],
    [4.4, 560, 420, 1.3],
    [7.4, 560, 560, 1.3],
    [8.4, 640, 770, 1.42],
    [9.4, 640, 770, 1.42],
    [10.6, 640, 440, 1.08],
  ]);
  return (
    <Cam t={t} keys={keys}>
      <StudioTablet>
        <SilverScreen c={t - SILVER_C0} />
      </StudioTablet>
    </Cam>
  );
}

export function SilverSignedScene({ t }: { t: number }) {
  const keys = tabKeys(SILVER_C0, [
    [17.0, 640, 500, 1.18],
    [18.2, 760, 560, 1.36],
    [21.6, 760, 560, 1.44],
  ]);
  return (
    <Cam t={t} keys={keys}>
      <StudioTablet>
        <SilverScreen c={t - SILVER_C0} />
      </StudioTablet>
    </Cam>
  );
}
