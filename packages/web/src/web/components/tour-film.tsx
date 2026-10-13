import { useRef, useState } from "react";
import { Play } from "lucide-react";

/**
 * The platform tour. Native controls stay off until the first play, so the browser's
 * centered play button never sits over the title on the poster. Our own button sits in
 * the lower corner instead.
 */
export function TourFilm() {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const start = () => {
    setStarted(true);
    void video.current?.play().catch(() => {});
  };

  return (
    <figure className="tour-film">
      <div className="tour-stage">
        <video
          ref={video}
          src="/videos/platform-demo-95s.mp4"
          poster="/images/platform-demo-poster.webp"
          controls={started}
          playsInline
          preload="none"
          aria-label="Platform tour, 1 minute 35 seconds, music only"
          onPlay={() => setStarted(true)}
        >
          <track kind="captions" src="/videos/platform-demo-95s.vtt" srcLang="en" label="English" />
        </video>
        {!started && (
          <button type="button" className="tour-play" onClick={start}>
            <span className="tour-play-icon" aria-hidden="true">
              <Play size={16} fill="currentColor" />
            </span>
            <span>
              Watch the tour <em>1:35</em>
            </span>
          </button>
        )}
      </div>
      <figcaption>Demo data · staff names and figures are fictional.</figcaption>
    </figure>
  );
}
