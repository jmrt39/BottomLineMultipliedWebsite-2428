import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { PlatformStage, type StageLayer } from "../components/platform/stage";
import { ChecklistScreen, PosScreen, SilverScreen } from "../components/platform/screens";
import { SCREEN_H, SCREEN_W } from "../components/platform/camera";
import { DURATION } from "../components/platform/timeline";

declare global {
  interface Window {
    __seek?: (t: number) => Promise<void>;
  }
}

function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);
    const prevTitle = document.title;
    document.title = "The Platform · 1906 Bar & Grille demo";
    return () => {
      meta.remove();
      document.title = prevTitle;
    };
  }, []);
}

function RenderStage() {
  const params = new URLSearchParams(window.location.search);
  const [t, setT] = useState(() => Number(params.get("t") ?? 0));
  const [fit, setFit] = useState(1);

  useEffect(() => {
    window.__seek = (next: number) =>
      new Promise((resolve) => {
        flushSync(() => setT(next));
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
    const onResize = () => setFit(Math.min(1, window.innerWidth / 1920, window.innerHeight / 1080));
    onResize();
    window.addEventListener("resize", onResize);
    let raf = 0;
    if (params.get("play")) {
      const t0 = performance.now() - t * 1000;
      const tick = (now: number) => {
        setT(((now - t0) / 1000) % DURATION);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    return () => {
      delete window.__seek;
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const screen = params.get("screen");
  if (screen) {
    // A single tablet screen at its native size, for keying onto the filmed green screens.
    return (
      <div className="platform-stage-host is-screen">
        <div className="platform-stage is-screen" style={{ width: SCREEN_W, height: SCREEN_H }}>
          {screen === "silver" ? (
            <SilverScreen c={t} />
          ) : screen === "pos" ? (
            <PosScreen c={t} />
          ) : (
            <ChecklistScreen
              kind={screen === "close" ? "close" : "open"}
              c={t}
              sheetOpen={params.get("sheet") === "1"}
            />
          )}
        </div>
      </div>
    );
  }
  const layer = (params.get("layer") ?? "all") as StageLayer;
  return (
    <div className={`platform-stage-host${layer === "captions" ? " is-captions" : ""}`}>
      <div style={{ transform: `scale(${fit})`, transformOrigin: "0 0" }}>
        <PlatformStage t={t} layer={layer} />
      </div>
    </div>
  );
}

// /platform plays the full film; /platform?cut=90 plays the short cut (1 minute 35 seconds).
const FILMS = {
  full: { file: "platform-demo-v3", length: "3 minutes 4 seconds" },
  short: { file: "platform-demo-95s", length: "1 minute 35 seconds" },
} as const;

function Player() {
  const film =
    new URLSearchParams(window.location.search).get("cut") === "90" ? FILMS.short : FILMS.full;
  return (
    <main className="platform-player">
      <header>
        <span>The Platform</span>
        <em>1906 Bar &amp; Grille · demo film</em>
      </header>
      <video
        src={`/videos/${film.file}.mp4`}
        poster="/images/platform-demo-poster.webp"
        controls
        playsInline
        preload="metadata"
        aria-label={`The Platform demo film for 1906 Bar & Grille, ${film.length}, music only`}
      >
        <track kind="captions" src={`/videos/${film.file}.vtt`} srcLang="en" label="English" />
      </video>
      <p>Demo data · illustrative. Staff names and figures are fictional.</p>
    </main>
  );
}

export default function Platform() {
  useNoIndex();
  const stage = new URLSearchParams(window.location.search).get("stage");
  return stage ? <RenderStage /> : <Player />;
}
