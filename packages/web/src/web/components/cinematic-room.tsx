import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

// Horizontal focal point per shot, used by the narrow phone crop so the subject
// (bottle and glass, server walking off, clinking glasses, risotto, lifted fork)
// stays in frame.
const FILM_FOCAL: [until: number, focal: string][] = [
  [9.1, "68%"],
  [12.1, "60%"],
  [15.1, "84%"],
  [18.1, "72%"],
];

function filmFocal(time: number) {
  return FILM_FOCAL.find(([until]) => time < until)?.[1] ?? "68%";
}

// iOS only autoplays when the muted/playsinline *attributes* are present before playback,
// so they are set directly on the element rather than relying on React props alone.
export function prepareForAutoplay(video: HTMLVideoElement) {
  video.muted = true;
  video.defaultMuted = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("disablepictureinpicture", "");
  video.setAttribute("disableremoteplayback", "");
  video.setAttribute("x-webkit-airplay", "deny");
}

// Touch screens never start a film from a scroll gesture: on some phones and in-app
// browsers a gesture-started play() takes over the screen. They autoplay when the
// browser allows it, and otherwise keep the still until the visitor taps Play.
export const isTouchScreen = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(hover: none), (pointer: coarse)").matches;

export function CinematicRoom() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  const attach = useCallback((video: HTMLVideoElement | null) => {
    videoRef.current = video;
    if (video) prepareForAutoplay(video);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || failed) return;
    let onScreen = true;
    const tryPlay = () => {
      if (userPaused.current || !onScreen || !video.paused) return;
      prepareForAutoplay(video);
      void video.play().catch(() => setPlaying(false));
    };
    tryPlay();

    // Pause once the hero is scrolled away, resume when it comes back.
    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        ([entry]) => {
          onScreen = !!entry?.isIntersecting;
          if (onScreen) tryPlay();
          else if (!video.paused) video.pause();
        },
        { threshold: 0.2 },
      );
      observer.observe(video);
    }

    // Desktop only: browsers that refuse autoplay start the film on the first click or key.
    const events = isTouchScreen() ? [] : (["pointerdown", "keydown"] as const);
    for (const name of events) window.addEventListener(name, tryPlay, { passive: true });
    const onVisible = () => document.visibilityState === "visible" && tryPlay();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      observer?.disconnect();
      for (const name of events) window.removeEventListener(name, tryPlay);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [failed]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPaused.current = false;
      void video.play().catch(() => setPlaying(false));
    } else {
      userPaused.current = true;
      video.pause();
    }
  };

  return (
    <>
      <img
        src="/images/pour-gloves-label-v6.webp"
        alt="Illustrative close view of wine service, framed below the server's face: a server in a black shirt, tie and white gloves pours red wine with the bottle cradled at its base, a white serviette draped over his left forearm"
        fetchPriority="high"
      />
      {!failed && (
        <video
          ref={attach}
          className="room-film"
          src="/videos/evening-film-v8.mp4"
          poster="/images/pour-gloves-label-v6.webp"
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          aria-label="Silent, illustrative evening dining film: a server in a black shirt, tie and white gloves pours red wine, wipes the mouth of the bottle with the serviette and drapes it back over his forearm, followed by two guests clinking and sipping red wine, a plate of prawn risotto, and a guest cutting into and tasting a steak"
          disablePictureInPicture
          tabIndex={-1}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(event) => {
            const video = event.currentTarget;
            video.style.setProperty("--film-focal", filmFocal(video.currentTime));
          }}
          onError={() => setFailed(true)}
        />
      )}
      {!failed && (
        <button
          className="film-control"
          aria-label={playing ? "Pause background film" : "Play background film"}
          onClick={togglePlayback}
        >
          <span>THE ART OF SERVICE</span>
          {playing ? <Pause size={12} /> : <Play size={12} />}
          <span className="film-state">{playing ? "PAUSE FILM" : "PLAY FILM"}</span>
        </button>
      )}
      {failed && (
        <div className="film-preview-label">
          <span>WHITE GLOVE SERVICE</span>
          <span>STILL VIEW</span>
        </div>
      )}
    </>
  );
}
