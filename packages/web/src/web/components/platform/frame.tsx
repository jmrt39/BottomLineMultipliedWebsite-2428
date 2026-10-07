import type { CSSProperties, ReactNode } from "react";
import {
  Award,
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  LayoutGrid,
  ListChecks,
  MessageSquareQuote,
  UserPlus,
} from "lucide-react";
import { VENUE } from "./data";

const NAV = [
  { key: "dashboard", label: "Team overview", icon: LayoutGrid },
  { key: "colleague", label: "Add a Colleague", icon: UserPlus },
  { key: "checklists", label: "Checklists", icon: ClipboardList },
  { key: "library", label: "Training library", icon: BookOpen },
  { key: "floor", label: "Floor exercises", icon: ClipboardCheck },
  { key: "checks", label: "Knowledge checks", icon: ListChecks },
  { key: "feedback", label: "Guest feedback", icon: MessageSquareQuote },
  { key: "rewards", label: "Recognition & rewards", icon: Award },
];

export function AppFrame({
  active,
  children,
  style,
}: {
  active: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div className="platform-frame" style={style}>
      <aside className="platform-side">
        <div className="platform-side-brand">
          <span className="platform-mark">The Platform</span>
          <span className="platform-venue">{VENUE}</span>
        </div>
        <nav>
          {NAV.map(({ key, label, icon: Icon }) => (
            <span key={key} className={`platform-nav${key === active ? " is-active" : ""}`}>
              <Icon size={17} strokeWidth={1.4} />
              {label}
            </span>
          ))}
        </nav>
        <div className="platform-side-foot">
          <span className="platform-avatar small">DK</span>
          <span>
            D. Kerr
            <small>General Manager</small>
          </span>
        </div>
      </aside>
      <main className="platform-main">{children}</main>
    </div>
  );
}

const STAR =
  "M12 2.6l2.75 6.08 6.63.66-4.98 4.42 1.43 6.52L12 16.9l-5.83 3.38 1.43-6.52-4.98-4.42 6.63-.66z";

function StarIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d={STAR} />
    </svg>
  );
}

/** Five stars; `shown` is the filled amount 0–5 (fractional allowed). */
export function Stars({ shown, size = 18, pop }: { shown: number; size?: number; pop?: number }) {
  return (
    <span className="platform-stars" style={{ gap: size * 0.18 }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const f = Math.min(1, Math.max(0, shown - i));
        const s = pop !== undefined && f > 0 && f < 1 ? 1 + 0.22 * Math.sin(f * Math.PI) : 1;
        return (
          <span
            key={i}
            className="platform-star"
            style={{ width: size, height: size, transform: `scale(${s})` }}
          >
            <span className="platform-star-off">
              <StarIcon size={size} />
            </span>
            <span className="platform-star-on" style={{ width: `${f * 100}%` }}>
              <StarIcon size={size} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function Bar({
  value,
  max = 1,
  style,
}: {
  value: number;
  max?: number;
  style?: CSSProperties;
}) {
  return (
    <span className="platform-bar" style={style}>
      <span style={{ width: `${Math.max(0, Math.min(1, value / max)) * 100}%` }} />
    </span>
  );
}

// Hand-drawn signatures: D. Kerr, Camille Rhodes, Marcus Hill, Maya Collins.
const SIGNATURES = [
  "M8 62 C 18 30, 30 14, 36 22 C 42 32, 26 66, 22 72 C 34 46, 58 30, 64 44 C 68 56, 46 70, 40 62 M84 40 C 82 54, 80 64, 82 72 M100 30 C 92 44, 84 52, 82 54 C 92 58, 100 66, 108 74 M118 60 C 124 50, 134 50, 132 58 C 128 66, 116 66, 120 58 C 130 48, 142 46, 146 56 C 150 46, 160 44, 164 52 C 170 44, 180 42, 186 50 M150 70 C 210 64, 270 58, 330 52",
  "M40 30 C 20 28, 10 50, 22 64 C 34 76, 56 66, 62 56 M70 58 C 74 46, 84 44, 86 54 C 88 62, 76 66, 74 58 C 80 50, 92 48, 96 56 C 98 50, 104 46, 108 54 C 112 60, 116 60, 120 54 C 124 30, 128 18, 130 22 C 132 30, 126 60, 128 66 C 134 58, 140 54, 146 58 M160 26 C 154 40, 150 56, 152 70 C 160 50, 176 42, 184 48 C 190 54, 176 60, 170 58 C 180 62, 190 70, 196 74 M200 60 C 220 56, 240 54, 262 50 C 280 48, 300 50, 318 54",
  "M10 70 C 16 50, 22 30, 26 24 C 30 40, 34 56, 38 64 C 44 48, 50 32, 54 26 C 56 42, 58 58, 62 70 M76 56 C 80 50, 90 48, 92 56 C 94 64, 82 66, 80 58 M104 42 C 102 54, 100 64, 104 70 M118 44 C 112 52, 110 62, 118 66 M150 24 C 146 42, 142 58, 144 72 M146 50 C 156 44, 170 42, 172 52 C 172 60, 168 66, 168 72 M188 30 C 186 46, 184 60, 186 70 M204 28 C 202 44, 200 60, 204 72 M196 64 C 240 60, 290 56, 330 50",
  "M12 70 C 18 46, 24 26, 28 22 C 32 36, 36 52, 40 58 C 46 44, 52 28, 56 24 C 58 40, 60 56, 66 66 M74 56 C 80 46, 92 46, 90 56 C 88 64, 76 64, 78 56 C 84 50, 94 52, 98 60 C 104 48, 110 44, 112 52 C 112 62, 108 78, 100 84 M122 56 C 128 46, 140 46, 138 56 C 136 64, 124 64, 126 56 C 132 50, 142 54, 148 62 M196 30 C 176 22, 160 40, 166 58 C 172 72, 194 70, 204 60 M210 64 C 240 60, 280 56, 326 52",
];

/** A signature drawing itself in as p goes 0 → 1. */
export function Signature({ which, p }: { which: 0 | 1 | 2 | 3; p: number }) {
  return (
    <svg className="pv-signature" viewBox="0 0 340 90" aria-hidden="true">
      <path
        d={SIGNATURES[which]}
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - Math.max(0, Math.min(1, p))}
      />
    </svg>
  );
}
