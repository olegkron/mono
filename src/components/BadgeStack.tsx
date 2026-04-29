import { type FC, useState, useRef, useEffect, useCallback } from "react";
import styles from "./BadgeStack.module.css";

export interface Badge {
  text: string;
  /** Badge design variant (1–5). Defaults to 1. */
  variant?: 1 | 2 | 3 | 4 | 5;
}

interface BadgeStackProps {
  badges: Badge[];
  carousel?: boolean;
}

const rand = (range: number) => (Math.random() * 2 - 1) * range;
const MAX_TRIES = 50;

function generatePositions(count: number) {
  const bounds = count === 1 ? 0 : 15 + (count - 2) * 10;
  const minDist = bounds * 1.2;
  const placed: { tx: number; ty: number; rot: number }[] = [];
  for (let i = 0; i < count; i++) {
    let tx = 0, ty = 0;
    for (let t = 0; t < MAX_TRIES; t++) {
      tx = rand(bounds);
      ty = rand(bounds);
      if (!placed.some((p) => Math.hypot(p.tx - tx, p.ty - ty) < minDist)) break;
    }
    placed.push({ tx, ty, rot: count === 1 ? 0 : rand(15) });
  }
  return placed;
}

// 8-point star: alternating outer (r=46) and inner (r=20) points
function starPath(cx: number, cy: number, outerR: number, innerR: number, points: number) {
  const step = Math.PI / points;
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    d += (i === 0 ? "M" : "L") + `${x.toFixed(2)},${y.toFixed(2)}`;
  }
  return d + "Z";
}

const STAR = starPath(50, 50, 46, 20, 8);
const STAR_SM = starPath(50, 50, 43, 18, 8); // inner bevel edge

const StarBadge: FC<{ text: string }> = ({ text }) => {
  const id = text.replace(/\s+/g, "-"); // unique per badge to avoid gradient id collisions
  return (
  <svg
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: "100%", height: "100%", overflow: "visible" }}
  >
    <defs>
      {/* Base metal — brushed gold */}
      <radialGradient id={`face-${id}`} cx="42%" cy="38%" r="62%">
        <stop offset="0%"   stopColor="#fff0a0" />
        <stop offset="25%"  stopColor="#e8b820" />
        <stop offset="60%"  stopColor="#b8860b" />
        <stop offset="100%" stopColor="#6b4800" />
      </radialGradient>

      {/* Rim bevel — light top-left, dark bottom-right */}
      <linearGradient id={`rim-${id}`} x1="15%" y1="10%" x2="85%" y2="90%">
        <stop offset="0%"   stopColor="#fff5c0" />
        <stop offset="30%"  stopColor="#d4a017" />
        <stop offset="70%"  stopColor="#8a6000" />
        <stop offset="100%" stopColor="#3d2200" />
      </linearGradient>

      {/* Specular streak — top-left glint */}
      <linearGradient id={`glint-${id}`} x1="20%" y1="5%" x2="60%" y2="55%">
        <stop offset="0%"   stopColor="rgba(255,255,255,0.75)" />
        <stop offset="45%"  stopColor="rgba(255,255,255,0.15)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>

      {/* Inner circle gradient for the text well */}
      <radialGradient id={`well-${id}`} cx="45%" cy="40%" r="60%">
        <stop offset="0%"   stopColor="#ffd84a" />
        <stop offset="55%"  stopColor="#c49010" />
        <stop offset="100%" stopColor="#7a5200" />
      </radialGradient>

      {/* Clip to star shape */}
      <clipPath id={`clip-${id}`}>
        <path d={STAR} />
      </clipPath>
    </defs>

    {/* ── Shadow ── */}
    <path d={STAR} fill="rgba(0,0,0,0.45)" transform="translate(2.5,3.5)" />

    {/* ── Rim (outer bevel, slightly scaled up) ── */}
    <path d={STAR} fill={`url(#rim-${id})`} transform="scale(1.07) translate(-3.5,-3.5)" />

    {/* ── Face ── */}
    <path d={STAR} fill={`url(#face-${id})`} />

    {/* ── Inner bevel edge (dark inset line) ── */}
    <path d={STAR_SM} fill="none" stroke="rgba(60,30,0,0.45)" strokeWidth="1.2" />

    {/* ── Engraved inner circle ── */}
    <circle cx="50" cy="50" r="18" fill={`url(#well-${id})`} />
    <circle cx="50" cy="50" r="18" fill="none" stroke="rgba(40,20,0,0.5)" strokeWidth="1" />
    {/* inner circle highlight arc */}
    <path d="M36,44 A15,15 0 0,1 64,44" fill="none" stroke="rgba(255,240,140,0.5)" strokeWidth="0.8" />

    {/* ── Brushed-metal texture lines (subtle) ── */}
    <g clipPath={`url(#clip-${id})`} opacity="0.07">
      {Array.from({ length: 18 }, (_, i) => (
        <line key={i} x1="0" y1={i * 6} x2="100" y2={i * 6} stroke="#fff" strokeWidth="1.5" />
      ))}
    </g>

    {/* ── Specular glint ── */}
    <path d={STAR} fill={`url(#glint-${id})`} />

    {/* ── Pin hole at top ── */}
    <circle cx="50" cy="6.5" r="1.8" fill="rgba(30,15,0,0.7)" />
    <circle cx="50" cy="6.5" r="1.0" fill="rgba(0,0,0,0.9)" />
    <circle cx="49.3" cy="6.0" r="0.4" fill="rgba(255,240,180,0.6)" />

    {/* ── Embossed text (shadow + highlight + fill) ── */}
    <text x="50" y="51.5" textAnchor="middle" dominantBaseline="middle"
      fontSize="9.5" fontWeight="800" fontFamily="system-ui, sans-serif"
      fill="rgba(40,20,0,0.6)" dy="0.8">
      {text}
    </text>
    <text x="50" y="51.5" textAnchor="middle" dominantBaseline="middle"
      fontSize="9.5" fontWeight="800" fontFamily="system-ui, sans-serif"
      fill="rgba(255,245,160,0.7)" dy="-0.4">
      {text}
    </text>
    <text x="50" y="51.5" textAnchor="middle" dominantBaseline="middle"
      fontSize="9.5" fontWeight="800" fontFamily="system-ui, sans-serif"
      fill="#3d2000">
      {text}
    </text>
  </svg>
  );
};

export const BadgeStack: FC<BadgeStackProps> = ({ badges, carousel = true }) => {
  const [transforms] = useState(() => generatePositions(badges.length));
  const [active, setActive] = useState(-1);
  const [phase, setPhase] = useState<"stack" | "settling" | "carousel">("stack");

  const showCarousel = carousel && badges.length > 1;
  const cardSize = Math.max(50, 80 - (badges.length - 1) * 15);

  const dragStart = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 30;

  const go = (idx: number) => {
    const next = ((idx % badges.length) + badges.length) % badges.length;
    if (phase === "stack") {
      setPhase("settling");
      setActive(next);
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase("carousel")));
    } else {
      setActive(next);
    }
  };
  const prev = useCallback(() => go((active < 0 ? 0 : active) - 1), [active, phase]);
  const next = useCallback(() => go((active < 0 ? 0 : active) + 1), [active, phase]);

  const onPointerDown = (e: React.PointerEvent) => { dragStart.current = e.clientX; };
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const dx = e.clientX - dragStart.current;
    dragStart.current = null;
    if (Math.abs(dx) >= SWIPE_THRESHOLD) {
      dx < 0 ? next() : prev();
    } else {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      e.clientX < rect.left + rect.width / 2 ? prev() : next();
    }
  };

  const stackRef = useRef<HTMLDivElement>(null);
  const wheelAccum = useRef(0);
  const wheelCooldown = useRef(false);

  useEffect(() => {
    if (!showCarousel || !stackRef.current) return;
    const el = stackRef.current;
    const handler = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (wheelCooldown.current) return;
      wheelAccum.current += e.deltaX;
      if (Math.abs(wheelAccum.current) > 30) {
        wheelAccum.current > 0 ? next() : prev();
        wheelAccum.current = 0;
        wheelCooldown.current = true;
        setTimeout(() => { wheelCooldown.current = false; }, 500);
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [showCarousel, next, prev]);

  return (
    <div className={styles.wrapper}>
      <div
        ref={stackRef}
        className={styles.stack}
        style={{ "--card-size": `${cardSize}%`, ...(showCarousel ? { cursor: "pointer" } : {}) } as React.CSSProperties}
        {...(showCarousel ? { onPointerDown, onPointerUp } : {})}
      >
        {badges.map((badge, i) => {
          const t = transforms[i];
          const isActive = active >= 0 && i === active;
          const carouselActive = showCarousel && phase !== "stack";

          return (
            <div
              key={i}
              className={styles.card}
              style={{
                "--rot": `${t.rot}deg`,
                "--tx": `${t.tx}%`,
                "--ty": `${t.ty}%`,
                "--delay": `${(badges.length - 1 - i) * 120}ms`,
                zIndex: carouselActive
                  ? isActive ? badges.length + 1 : badges.length - i
                  : badges.length - i,
                ...(carouselActive ? {
                  transform: (isActive && phase === "carousel")
                    ? "translate(0,0) rotate(0deg) scale(1)"
                    : `translate(${t.tx}%, ${t.ty}%) rotate(${t.rot}deg) scale(1)`,
                  width: (isActive && phase === "carousel") ? "90%" : `${cardSize}%`,
                  height: (isActive && phase === "carousel") ? "90%" : `${cardSize}%`,
                  opacity: 1,
                  transition: phase === "carousel"
                    ? "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), width 0.4s cubic-bezier(0.22, 1, 0.36, 1), height 0.4s cubic-bezier(0.22, 1, 0.36, 1)"
                    : "none",
                  animation: "none",
                } : {}),
              } as React.CSSProperties}
            >
              <StarBadge text={badge.text} />
            </div>
          );
        })}
      </div>

      {showCarousel && (
        <div className={styles.dots}>
          {badges.map((_, i) => (
            <button
              key={i}
              className={(active < 0 ? 0 : active) === i ? styles.dotActive : styles.dot}
              onClick={() => go(i)}
              aria-label={`Go to badge ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const TEST_BADGES: Badge[] = [
  { text: "React" },
  { text: "TypeScript" },
  { text: "Vite" },
  { text: "CSS" },
  { text: "Node" },
];
