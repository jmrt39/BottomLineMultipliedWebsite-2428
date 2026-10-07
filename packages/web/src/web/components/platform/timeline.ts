// Every frame of the Platform film is a pure function of t (seconds).

export const DURATION = 183.8;
export const FPS = 30;

// Scenes are contiguous; neighbours dissolve across each boundary.
// Live scenes are filmed montages composited in after the stage render (see LIVE).
export const SCENES = {
  title: [0, 5.5],
  liveOpen: [5.5, 27.4],
  opening: [27.4, 36.4],
  dashboard: [36.4, 44.9],
  colleague: [44.9, 55.9],
  livePos: [55.9, 60.9],
  pos: [60.9, 70.9],
  liveTrain: [70.9, 77.9],
  silver: [77.9, 86.4],
  liveSign: [86.4, 91.9],
  silverSigned: [91.9, 95.9],
  grading: [95.9, 105.9],
  education: [105.9, 113.9],
  quiz: [113.9, 124.4],
  quotes: [124.4, 132.9],
  rewards: [132.9, 143.9],
  liveClose: [143.9, 169.8],
  closing: [169.8, 178.3],
  close: [178.3, 183.8],
} as const;

export type SceneName = keyof typeof SCENES;

/** One filmed shot inside a live scene: the clip, its in-point, and how long it holds. */
export type Shot = { clip: string; at: number; dur: number };

/**
 * Filmed montages. Shots inside a scene follow each other with straight cuts; the first and
 * last shot dissolve into the neighbouring UI scenes. Durations add up to the scene length.
 */
export const LIVE: Partial<Record<SceneName, Shot[]>> = {
  liveOpen: [
    { clip: "O1-arrive", at: 0.45, dur: 4.0 },
    { clip: "O2-centre", at: 0, dur: 3.0 },
    { clip: "O3-ice", at: 0, dur: 4.0 },
    { clip: "O4-check", at: 0.15, dur: 3.4 },
    { clip: "O5-walk-r2", at: 1.3, dur: 3.5 },
    { clip: "LB-open", at: 0.6, dur: 4.0 },
  ],
  livePos: [{ clip: "L2-pos", at: 0.5, dur: 5 }],
  liveTrain: [
    { clip: "T2-polish", at: 0.95, dur: 4.0 },
    { clip: "T3-setting", at: 2.5, dur: 3.0 },
  ],
  liveSign: [{ clip: "LF-sign", at: 1.0, dur: 5.5 }],
  liveClose: [
    { clip: "C1-centre-off", at: 0.45, dur: 2.55 },
    { clip: "C2-strip", at: 0, dur: 3.0 },
    { clip: "C3-wipe", at: 0, dur: 3.0 },
    { clip: "C4-linen", at: 0, dur: 3.5 },
    { clip: "C5-roll-r2", at: 0.3, dur: 4.0 },
    { clip: "C6-vac", at: 0, dur: 3.0 },
    { clip: "C7-check", at: 0, dur: 3.5 },
    { clip: "C8-sign", at: 0, dur: 3.35 },
  ],
};

/** Stage time at which a shot starts (its clip time is `at` there). */
export const shotStart = (scene: SceneName, clip: string) => {
  let s: number = SCENES[scene][0];
  for (const shot of LIVE[scene] ?? []) {
    if (shot.clip === clip) return s;
    s += shot.dur;
  }
  throw new Error(`no shot ${clip} in ${scene}`);
};

export const CAPTIONS: { text: string; start: number; end: number }[] = [
  { text: "7:40 am. Before the doors open.", start: 6.4, end: 13.4 },
  { text: "Done by the team. Initialled as it’s done.", start: 14.4, end: 22.6 },
  { text: "Checked by the manager. Signed off.", start: 24.0, end: 35.6 },
  { text: "Every server. Every bartender. One view.", start: 37.6, end: 44.4 },
  { text: "A new colleague. A full program on day one.", start: 46.2, end: 55.2 },
  { text: "Rung in right. Checked by the trainer.", start: 56.8, end: 70.2 },
  { text: "Graded on the floor. Signed by both.", start: 71.6, end: 95.2 },
  { text: "Trainee, trainer, manager. All on record.", start: 97.2, end: 105.2 },
  { text: "The menu changes. So does the training.", start: 107.2, end: 113.2 },
  { text: "Knowledge, checked. Not assumed.", start: 115.2, end: 123.8 },
  { text: "Setting the standard. Always going above and beyond.", start: 125.6, end: 132.3 },
  { text: "A target worth hitting.", start: 134.6, end: 143.2 },
  { text: "After the last table. The work nobody sees.", start: 145.0, end: 161.6 },
  { text: "11:52 pm. Closed to standard.", start: 163.4, end: 177.6 },
];

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** 0 → 1 as t moves from start to end, clamped. */
export const progress = (t: number, start: number, end: number) =>
  end <= start ? (t >= end ? 1 : 0) : clamp((t - start) / (end - start));

export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeSoft = (x: number) => 0.5 - Math.cos(Math.PI * x) / 2;

export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;

/** Eased 0 → 1 between start and end. */
export const ease = (t: number, start: number, end: number, fn = easeInOut) =>
  fn(progress(t, start, end));

/** Fade in over [a, a + d], hold, fade out over [b - d, b]. */
export const window_ = (t: number, a: number, b: number, d = 0.7) =>
  Math.min(ease(t, a, a + d, easeSoft), 1 - ease(t, b - d, b, easeSoft));

export const DISSOLVE = 0.9;

/** Opacity of a scene, dissolving across its boundaries. */
export const sceneOpacity = (t: number, name: SceneName, d = DISSOLVE) => {
  const [a, b] = SCENES[name];
  const first = a === 0;
  const last = b === DURATION;
  const fadeIn = first ? ease(t, 0.2, 1.4, easeSoft) : ease(t, a - d / 2, a + d / 2, easeSoft);
  const fadeOut = last
    ? 1 - ease(t, b - 1.4, b - 0.2, easeSoft)
    : 1 - ease(t, b - d / 2, b + d / 2, easeSoft);
  return Math.min(fadeIn, fadeOut);
};

/**
 * Live clips visible at t, with their weight and clip time (read by the renderer). Inside a
 * montage only one shot shows at a time; the montage as a whole dissolves at its edges.
 */
export const liveAt = (t: number) =>
  (Object.keys(LIVE) as SceneName[])
    .map((name) => {
      const w = sceneOpacity(t, name);
      const shots = LIVE[name]!;
      let s: number = SCENES[name][0];
      let i = 0;
      while (i < shots.length - 1 && t >= s + shots[i].dur) s += shots[i++].dur;
      const shot = shots[i];
      return { clip: shot.clip, w, time: shot.at + (t - s) };
    })
    .filter((l) => l.w > 0.001);

/** Seconds since a scene started, optionally played faster (v3 trims some UI scenes). */
export const local = (t: number, name: SceneName, speed = 1) => (t - SCENES[name][0]) * speed;

/** Time inside a v1 scene: maps the v2 window onto the v1 timings, optionally faster. */
export const remap = (t: number, name: SceneName, v1Start: number, speed = 1) =>
  v1Start + (t - SCENES[name][0]) * speed;

/** Staggered rise-in for list items: returns {o, y}. */
export const rise = (t: number, start: number, i: number, gap = 0.08, dur = 0.7, dist = 18) => {
  const p = ease(t, start + i * gap, start + i * gap + dur, easeOut);
  return { opacity: p, transform: `translateY(${(1 - p) * dist}px)` };
};

/** Typed-out text. */
export const typed = (text: string, t: number, start: number, cps = 38) => {
  const n = Math.max(0, Math.floor((t - start) * cps));
  return text.slice(0, Math.min(text.length, n));
};

export const money = (v: number) => `$${v.toFixed(2)}`;
