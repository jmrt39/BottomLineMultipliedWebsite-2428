import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

// Horizontal focal point per shot, used by the narrow phone crop so the subject
// (bottle and glass, server walking off, clinking glasses, risotto, lifted fork)
// stays in frame.
const FILM_FOCAL: [until: number, focal: string][] = [
  [7.3, "68%"],
  [9.725, "54%"],
  [12.125, "60%"],
  [15.125, "84%"],
  [18.125, "72%"],
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

const PHONE = "(max-width: 800px)";

// Leave any fullscreen or floating player a browser opened on its own and settle on
// the still. Some in-app browsers cannot play inline and take over the screen instead.
function refuseTakeover(video: HTMLVideoElement, onRefused: () => void) {
  const leave = () => {
    const v = video as HTMLVideoElement & { webkitExitFullscreen?: () => void };
    try {
      v.webkitExitFullscreen?.();
    } catch {
      // Already left.
    }
    if (document.fullscreenElement) void document.exitFullscreen?.().catch(() => {});
    if (document.pictureInPictureElement) {
      void document.exitPictureInPicture?.().catch(() => {});
    }
    video.pause();
    onRefused();
  };
  video.addEventListener("webkitbeginfullscreen", leave);
  video.addEventListener("enterpictureinpicture", leave);
  video.addEventListener("fullscreenchange", () => document.fullscreenElement === video && leave());
}

export function CinematicRoom() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  // Phones get the same film as an animated image cut for a tall screen. An image never
  // opens a player window, goes fullscreen or floats over the page while scrolling.
  const [phone, setPhone] = useState(() => !!window.matchMedia?.(PHONE).matches);
  const [imagePlaying, setImagePlaying] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia?.(PHONE);
    if (!mq) return;
    const update = () => setPhone(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const attach = useCallback((video: HTMLVideoElement | null) => {
    videoRef.current = video;
    if (video) {
      prepareForAutoplay(video);
      refuseTakeover(video, () => setFailed(true));
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || failed || phone) return;
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
  }, [failed, phone]);

  const togglePlayback = () => {
    if (phone) {
      setImagePlaying(!imagePlaying);
      return;
    }
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
      {phone && imagePlaying && (
        <picture>
          <source srcSet="/images/hero-phone-v11.avif" type="image/avif" />
          <img
            className="room-film room-film-image"
            src="/images/hero-phone-v11.webp"
            alt=""
            decoding="async"
            onError={() => setImagePlaying(false)}
          />
        </picture>
      )}
      {!failed && !phone && (
        <video
          ref={attach}
          className="room-film"
          src="/videos/evening-film-v11.mp4"
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
      {phone && (
        <button
          className="film-control"
          aria-label={imagePlaying ? "Pause background film" : "Play background film"}
          onClick={togglePlayback}
        >
          <span>THE ART OF SERVICE</span>
          {imagePlaying ? <Pause size={12} /> : <Play size={12} />}
          <span className="film-state">{imagePlaying ? "PAUSE FILM" : "PLAY FILM"}</span>
        </button>
      )}
      {!failed && !phone && (
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
      {failed && !phone && (
        <div className="film-preview-label">
          <span>WHITE GLOVE SERVICE</span>
          <span>STILL VIEW</span>
        </div>
      )}
    </>
  );
}
