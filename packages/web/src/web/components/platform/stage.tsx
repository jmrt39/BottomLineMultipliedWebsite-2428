import type { ReactNode } from "react";
import {
  CAPTIONS,
  DURATION,
  LIVE,
  SCENES,
  type SceneName,
  sceneOpacity,
  window_,
  ease,
  easeOut,
} from "./timeline";
import { CloseScene, TitleScene } from "./title";
import { DashboardScene } from "./dashboard";
import { GradingScene } from "./grading-tablet";
import { QuizScene } from "./quiz-phone";
import { ClosingScene, OpeningScene, PosScene, SilverScene, SilverSignedScene } from "./floor";
import { ColleagueScene, EducationScene, QuotesScene, RewardsScene } from "./team";

// Live scenes are filmed clips composited in after the stage render, so they draw nothing here.
const RENDER: Partial<Record<SceneName, (t: number) => ReactNode>> = {
  title: (t) => <TitleScene t={t} />,
  opening: (t) => <OpeningScene t={t} />,
  dashboard: (t) => <DashboardScene t={t} />,
  colleague: (t) => <ColleagueScene t={t} />,
  pos: (t) => <PosScene t={t} />,
  silver: (t) => <SilverScene t={t} />,
  silverSigned: (t) => <SilverSignedScene t={t} />,
  grading: (t) => <GradingScene t={t} />,
  education: (t) => <EducationScene t={t} />,
  quiz: (t) => <QuizScene t={t} />,
  quotes: (t) => <QuotesScene t={t} />,
  rewards: (t) => <RewardsScene t={t} />,
  closing: (t) => <ClosingScene t={t} />,
  close: (t) => <CloseScene t={t} />,
};

export type StageLayer = "all" | "scenes" | "captions";

export function PlatformStage({ t, layer = "all" }: { t: number; layer?: StageLayer }) {
  const caption = CAPTIONS.find((c) => t >= c.start - 0.1 && t <= c.end + 0.1);
  const labelOpacity = Math.min(ease(t, 1.2, 2.6), 1 - ease(t, DURATION - 2.2, DURATION - 0.6));
  // The compositor lays the live clip over the stage with the live weight, so the stage scenes
  // next to a live scene stay at full strength instead of dissolving into the background.
  const liveW = Math.min(
    1,
    (Object.keys(LIVE) as SceneName[]).reduce((s, n) => s + sceneOpacity(t, n), 0),
  );
  return (
    <div className={`platform-stage${layer === "captions" ? " is-captions" : ""}`}>
      {layer !== "captions" &&
        (Object.keys(SCENES) as SceneName[]).map((name) => {
          const render = RENDER[name];
          if (!render || liveW > 0.999) return null;
          const o = Math.min(1, sceneOpacity(t, name) / (1 - liveW));
          if (o <= 0.001) return null;
          return (
            <div key={name} className={`platform-scene scene-${name}`} style={{ opacity: o }}>
              {render(t)}
            </div>
          );
        })}
      {layer !== "scenes" && caption && (
        <span
          className="platform-caption-scrim"
          style={{ opacity: window_(t, caption.start - 0.3, caption.end + 0.3, 1.0) }}
        />
      )}
      {layer !== "scenes" && caption && (
        <p
          className="platform-caption"
          style={{
            opacity: window_(t, caption.start, caption.end, 0.8),
            transform: `translateY(${(1 - ease(t, caption.start, caption.start + 0.9, easeOut)) * 10}px)`,
          }}
        >
          {caption.text}
        </p>
      )}
      {layer !== "scenes" && (
        <span className="platform-demo-label" style={{ opacity: labelOpacity }}>
          Demo data · illustrative
        </span>
      )}
    </div>
  );
}
