import { type FC, useState, useRef, useEffect, useCallback } from "react";
import styles from "./ImageStack.module.css";

export interface ImageStackImage {
  src: string;
  alt: string;
}

interface ImageStackProps {
  images: ImageStackImage[];
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

export const ImageStack: FC<ImageStackProps> = ({ images, carousel = true }) => {
  const [transforms] = useState(() => generatePositions(images.length));
  const [loaded, setLoaded] = useState<boolean[]>(() => images.map(() => false));
  // active tracks which image is "selected" in carousel; -1 = none selected yet (stack view)
  const [active, setActive] = useState(-1);
  const [phase, setPhase] = useState<"stack" | "settling" | "carousel">("stack");

  const showCarousel = carousel && images.length > 1;
  const cardSize = Math.max(50, 80 - (images.length - 1) * 15);

  const dragStart = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 30;

  const go = (idx: number) => {
    const next = ((idx % images.length) + images.length) % images.length;
    if (phase === "stack") {
      // Phase 1: kill animations, snap to current positions (no transition)
      setPhase("settling");
      setActive(next);
      // Phase 2: one rAF later, enable transitions
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase("carousel")));
    } else {
      setActive(next);
    }
  };
  const prev = useCallback(() => go((active < 0 ? 0 : active) - 1), [active]);
  const next = useCallback(() => go((active < 0 ? 0 : active) + 1), [active]);

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

  const onLoad = (i: number) => setLoaded((prev) => { const next = [...prev]; next[i] = true; return next; });

  return (
    <div className={styles.wrapper}>
      <div
        ref={stackRef}
        className={styles.stack}
        style={{ "--card-size": `${cardSize}%`, ...(showCarousel ? { cursor: "pointer" } : {}) } as React.CSSProperties}
        {...(showCarousel ? { onPointerDown, onPointerUp } : {})}
      >
        {images.map((img, i) => {
          const t = transforms[i];
          const isActive = active >= 0 && i === active;
          const carouselActive = showCarousel && phase !== "stack";

          return (
            <img
              key={img.src}
              src={img.src}
              alt={img.alt}
              className={loaded[i] ? styles.card : styles.cardHidden}
              onLoad={() => onLoad(i)}
              style={{
                "--rot": `${t.rot}deg`,
                "--tx": `${t.tx}%`,
                "--ty": `${t.ty}%`,
                "--delay": `${(images.length - 1 - i) * 120}ms`,
                zIndex: carouselActive
                  ? isActive ? images.length + 1 : images.length - i
                  : images.length - i,
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
            />
          );
        })}
      </div>

      {showCarousel && (
        <div className={styles.dots}>
          {images.map((_, i) => (
            <button
              key={i}
              className={(active < 0 ? 0 : active) === i ? styles.dotActive : styles.dot}
              onClick={() => go(i)}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const TEST_IMAGES: ImageStackImage[] = [
  { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", alt: "Mountain landscape" },
  { src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80", alt: "Aerial forest" },
  { src: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=400&q=80", alt: "Ocean waves" },
  { src: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=400&q=80", alt: "Ocean waves" },
  { src: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=400&q=80", alt: "Ocean waves" },
];
