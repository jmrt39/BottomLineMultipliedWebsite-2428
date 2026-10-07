import { useCallback, useEffect, useRef, useState } from "react";
import { isTouchScreen, prepareForAutoplay } from "./cinematic-room";

const PHONE = "(max-width: 800px)";

type AmbientClipProps = {
  src: string;
  poster: string;
  label: string;
};

// A short silent loop layered over a still. The still stays underneath as the
// fallback; the clip only plays while it is on screen.
export function AmbientClip({ src, poster, label }: AmbientClipProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);
  // Phones keep the still: no loop starts while the visitor is scrolling past.
  const [phone, setPhone] = useState(() => !!window.matchMedia?.(PHONE).matches);

  useEffect(() => {
    const mq = window.matchMedia?.(PHONE);
    if (!mq) return;
    const update = () => setPhone(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const attach = useCallback((video: HTMLVideoElement | null) => {
    videoRef.current = video;
    if (video) prepareForAutoplay(video);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || failed || phone) return;
    // Decorative loop: visitors who ask for reduced motion keep the still.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const play = () => {
      prepareForAutoplay(video);
      void video.play().catch(() => undefined);
    };
    if (typeof IntersectionObserver === "undefined") {
      play();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) play();
        else video.pause();
      },
      { rootMargin: "120px 0px" },
    );
    observer.observe(video);
    // Desktop only: retry on the first click if the browser refused autoplay.
    const events = isTouchScreen() ? [] : (["pointerdown"] as const);
    const retry = () => {
      const rect = video.getBoundingClientRect();
      if (video.paused && rect.bottom > 0 && rect.top < window.innerHeight) play();
    };
    for (const name of events) window.addEventListener(name, retry, { passive: true });
    return () => {
      observer.disconnect();
      for (const name of events) window.removeEventListener(name, retry);
    };
  }, [failed, phone]);

  if (failed || phone) return null;

  return (
    <video
      ref={attach}
      className="ambient-clip"
      data-visible={visible ? "true" : "false"}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label}
      disablePictureInPicture
      tabIndex={-1}
      onPlaying={() => setVisible(true)}
      onError={() => setFailed(true)}
    />
  );
}
