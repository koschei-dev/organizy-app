import { Pause, Play } from "lucide-react";
import {
  animate, AnimatePresence, motion, type MotionValue, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform,
} from "motion/react";
import { createContext, type ReactNode, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

/**
 * A short motion film made of scenes. One clock drives everything; each scene gets its own local
 * time starting at 0. The canvas is a fixed design size (landscape 1280 × 720, or portrait
 * 720 × 960 on narrow screens) scaled to fit, so scenes lay out in design pixels.
 */

export type SceneProps = { t: MotionValue<number>; dur: number };
/**
 * How a scene arrives over the one before it. The old scene stays put underneath while the new one
 * fades, wipes, irises, pushes or zooms in on top. `at` places the iris centre (percent of the canvas).
 */
export type Enter =
  | "fade" | "cut" | "wipe" | "wipeLeft" | "wipeUp" | "wipeDown" | "push" | "pushUp" | "zoom" | "zoomOut"
  | { iris: [number, number] };
export type SceneDef = { id: string; chapter: string; dur: number; Scene: (p: SceneProps) => ReactNode; enter?: Enter };

const EASE = [0.7, 0, 0.2, 1] as const;
function enterAnim(e: Enter = "fade") {
  if (typeof e === "object") {
    const [x, y] = e.iris;
    return { initial: { clipPath: `circle(0% at ${x}% ${y}%)` }, animate: { clipPath: `circle(150% at ${x}% ${y}%)` }, transition: { duration: 0.7, ease: EASE } };
  }
  const T = { duration: 0.6, ease: EASE };
  switch (e) {
    case "cut": return { initial: false as const, animate: {}, transition: { duration: 0 } };
    case "wipe": return { initial: { clipPath: "inset(0 100% 0 0)" }, animate: { clipPath: "inset(0 0% 0 0)" }, transition: T };
    case "wipeLeft": return { initial: { clipPath: "inset(0 0 0 100%)" }, animate: { clipPath: "inset(0 0 0 0%)" }, transition: T };
    case "wipeUp": return { initial: { clipPath: "inset(100% 0 0 0)" }, animate: { clipPath: "inset(0% 0 0 0)" }, transition: T };
    case "wipeDown": return { initial: { clipPath: "inset(0 0 100% 0)" }, animate: { clipPath: "inset(0 0 0% 0)" }, transition: T };
    case "push": return { initial: { x: "100%" }, animate: { x: "0%" }, transition: T };
    case "pushUp": return { initial: { y: "100%" }, animate: { y: "0%" }, transition: T };
    case "zoom": return { initial: { scale: 1.35, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } };
    case "zoomOut": return { initial: { scale: 0.82, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } };
    default: return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.35 } };
  }
}

export const LAND = { W: 1280, H: 720 };
export const PORT = { W: 720, H: 960 };
type Canvas = { W: number; H: number; portrait: boolean };
const CanvasCtx = createContext<Canvas>({ ...LAND, portrait: false });
/** The canvas the current scene is drawn on. */
export const useCanvas = () => useContext(CanvasCtx);

/**
 * `rate` slows the whole film down (0.8 plays every scene 25% longer) without touching scene code.
 * `chapters={false}` hides the chapter bar, for a short clip such as an intro.
 */
export function Film({ scenes, label, className = "", rate = 1, chapters: showChapters = true, loop = true, bare = false }: {
  scenes: SceneDef[]; label: string; className?: string; rate?: number; chapters?: boolean; loop?: boolean;
  /** No corners, controls or chapters: for recording the film to a video file. */
  bare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1100);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  const portrait = width < 720;
  const canvas: Canvas = portrait ? { ...PORT, portrait } : { ...LAND, portrait };
  const k = width / canvas.W;

  const starts = useMemo(() => {
    let acc = 0;
    return scenes.map((s) => { const a = acc; acc += s.dur / rate; return a; });
  }, [scenes, rate]);
  const T = starts[starts.length - 1] + scenes[scenes.length - 1].dur / rate;

  const time = useMotionValue(0);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { amount: 0.4 });
  const [paused, setPaused] = useState(false);
  const [seek, setSeek] = useState(0);

  // ?t=12 freezes the film at 12 s (for reviewing frames).
  const frozen = typeof location !== "undefined" ? new URLSearchParams(location.search).get("t") : null;
  useEffect(() => {
    if (frozen === null) return;
    time.set(Number(frozen));
    // Review pages can step through frames with window.__filmSeek(id, seconds).
    const w = window as unknown as { __filmSeek?: Record<string, (t: number) => void> };
    (w.__filmSeek ??= {})[label] = (t: number) => time.set(t);
  }, [frozen, time, label]);

  useEffect(() => {
    if (reduce || frozen !== null) return;
    if (!inView || paused) return;
    let ctl: ReturnType<typeof animate> | null = null;
    let alive = true;
    const run = () => {
      ctl = animate(time, T, {
        duration: Math.max(0.01, T - time.get()),
        ease: "linear",
        onComplete: () => { if (alive && loop) { time.set(0); run(); } else if (alive) setPaused(true); },
      });
    };
    run();
    return () => { alive = false; ctl?.stop(); };
  }, [inView, paused, reduce, time, T, seek, frozen, loop]);

  // With reduced motion, the film holds still on the first frame of whichever chapter is chosen.
  useEffect(() => { if (reduce) time.set(starts[scenes.length - 1] + 0.01); }, [reduce, starts, scenes.length, time]);

  const sceneAt = (t: number) => {
    let i = 0;
    starts.forEach((s, j) => { if (t >= s) i = j; });
    return i;
  };
  const [active, setActive] = useState(0);
  useMotionValueEvent(time, "change", (t) => setActive(sceneAt(t)));

  const chapters = useMemo(() => {
    const out: { title: string; from: number; to: number }[] = [];
    scenes.forEach((s, i) => {
      const last = out[out.length - 1];
      if (last && last.title === s.chapter) last.to = starts[i] + s.dur / rate;
      else out.push({ title: s.chapter, from: starts[i], to: starts[i] + s.dur / rate });
    });
    return out;
  }, [scenes, starts, rate]);

  const go = (t: number) => { time.set(t + 0.01); setSeek((n) => n + 1); };
  const def = scenes[active];
  const enter = enterAnim(def.enter);

  const togglePlay = () => {
    if (paused && time.get() >= T - 0.05) time.set(0); // finished: play again from the start
    setPaused((v) => !v);
  };

  return (
    <div ref={ref} className={className}>
      <div
        role="img"
        aria-label={label}
        className={`relative overflow-hidden bg-[var(--surface)] ${bare ? "" : "rounded-[22px]"}`}
        style={{ height: canvas.H * k }}
      >
        <CanvasCtx.Provider value={canvas}>
          {/* A sturdier Bodoni optical size: at the default (96) its hairlines vanish and "w" reads as a gap. */}
          <div className="absolute top-0 left-0 origin-top-left" style={{ width: canvas.W, height: canvas.H, transform: `scale(${k})`, fontVariationSettings: '"opsz" 30' }}>
            <AnimatePresence initial={false}>
              <motion.div
                key={def.id}
                className="absolute inset-0 overflow-hidden bg-[var(--surface)]"
                initial={enter.initial}
                animate={enter.animate}
                transition={enter.transition}
                // Keep the old scene on screen under the new one for the whole entrance.
                exit={{ opacity: 0.99, transition: { duration: 0.75 } }}
              >
                <SceneHost def={def} start={starts[active]} time={time} rate={rate} />
              </motion.div>
            </AnimatePresence>
          </div>
        </CanvasCtx.Provider>
        {!reduce && !bare && (
          <div className="absolute right-3 bottom-3 z-10 flex gap-2">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={paused ? "Play the film" : "Pause the film"}
              className="grid size-9 place-items-center rounded-full border border-[var(--line)] bg-[var(--bg)]/85 text-[var(--ink)] backdrop-blur transition-colors hover:border-[var(--accent)]"
            >
              {paused ? <Play size={15} /> : <Pause size={15} />}
            </button>
          </div>
        )}
      </div>
      {showChapters && !bare && portrait && <p className="m-0 mt-4 text-[14px] text-[var(--ink)]" aria-hidden>{chapters.find((c) => c.from <= time.get() && time.get() < c.to)?.title ?? chapters[0].title}</p>}
      {showChapters && !bare && <ol className={`m-0 grid list-none gap-2 p-0 ${portrait ? "mt-2" : "mt-5"}`} style={{ gridTemplateColumns: `repeat(${chapters.length}, minmax(0, 1fr))` }} aria-label="Chapters">
        {chapters.map((c) => (
          <Chapter key={c.title} time={time} {...c} active={time.get() >= c.from && time.get() < c.to} onGo={() => go(c.from)} compact={portrait} />
        ))}
      </ol>}
    </div>
  );
}

function SceneHost({ def, start, time, rate }: { def: SceneDef; start: number; time: MotionValue<number>; rate: number }) {
  const t = useTransform(time, (v) => Math.min(def.dur, Math.max(0, (v - start) * rate)));
  const S = def.Scene;
  return <S t={t} dur={def.dur} />;
}

function Chapter({ time, title, from, to, onGo, compact }: { time: MotionValue<number>; title: string; from: number; to: number; active: boolean; onGo: () => void; compact: boolean }) {
  const width = useTransform(time, (t) => `${Math.min(100, Math.max(0, ((t - from) / (to - from)) * 100))}%`);
  const [on, setOn] = useState(false);
  useMotionValueEvent(time, "change", (t) => setOn(t >= from && t < to));
  return (
    <li>
      <button type="button" onClick={onGo} className={`grid w-full gap-2 text-left ${compact ? "py-2" : ""}`} aria-label={title} aria-current={on ? "step" : undefined}>
        <span className="relative h-[3px] overflow-hidden rounded-full bg-[var(--line)]">
          <motion.span className="absolute inset-y-0 left-0 rounded-full bg-[var(--accent)]" style={{ width }} />
        </span>
        <span className={`truncate text-[13px] transition-colors ${on ? "text-[var(--ink)]" : "text-[var(--muted)]"} ${compact ? "sr-only" : ""}`}>{title}</span>
      </button>
    </li>
  );
}

/** Local-time helpers for scenes. */
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** Re-renders when `t` crosses any of the given marks; returns how many marks have passed. */
export function useBeat(t: MotionValue<number>, marks: number[]) {
  const count = (v: number) => marks.filter((m) => v >= m).length;
  const [n, setN] = useState(() => count(t.get()));
  useMotionValueEvent(t, "change", (v) => { const c = count(v); setN((p) => (p === c ? p : c)); });
  return n;
}
