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
export type SceneDef = { id: string; chapter: string; dur: number; Scene: (p: SceneProps) => ReactNode };

export const LAND = { W: 1280, H: 720 };
export const PORT = { W: 720, H: 960 };
type Canvas = { W: number; H: number; portrait: boolean };
const CanvasCtx = createContext<Canvas>({ ...LAND, portrait: false });
/** The canvas the current scene is drawn on. */
export const useCanvas = () => useContext(CanvasCtx);

export function Film({ scenes, label, className = "" }: { scenes: SceneDef[]; label: string; className?: string }) {
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
    return scenes.map((s) => { const a = acc; acc += s.dur; return a; });
  }, [scenes]);
  const T = starts[starts.length - 1] + scenes[scenes.length - 1].dur;

  const time = useMotionValue(0);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { amount: 0.4 });
  const [paused, setPaused] = useState(false);
  const [seek, setSeek] = useState(0);

  // ?t=12 freezes the film at 12 s (for reviewing frames).
  const frozen = typeof location !== "undefined" ? new URLSearchParams(location.search).get("t") : null;
  useEffect(() => { if (frozen !== null) time.set(Number(frozen)); }, [frozen, time]);

  useEffect(() => {
    if (reduce || frozen !== null) return;
    if (!inView || paused) return;
    let ctl: ReturnType<typeof animate> | null = null;
    let alive = true;
    const run = () => {
      ctl = animate(time, T, {
        duration: Math.max(0.01, T - time.get()),
        ease: "linear",
        onComplete: () => { if (alive) { time.set(0); run(); } },
      });
    };
    run();
    return () => { alive = false; ctl?.stop(); };
  }, [inView, paused, reduce, time, T, seek, frozen]);

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
      if (last && last.title === s.chapter) last.to = starts[i] + s.dur;
      else out.push({ title: s.chapter, from: starts[i], to: starts[i] + s.dur });
    });
    return out;
  }, [scenes, starts]);

  const go = (t: number) => { time.set(t + 0.01); setSeek((n) => n + 1); };
  const def = scenes[active];

  return (
    <div ref={ref} className={className}>
      <div
        role="img"
        aria-label={label}
        className="relative overflow-hidden rounded-[22px] bg-[var(--surface)]"
        style={{ height: canvas.H * k }}
      >
        <CanvasCtx.Provider value={canvas}>
          <div className="absolute top-0 left-0 origin-top-left" style={{ width: canvas.W, height: canvas.H, transform: `scale(${k})` }}>
            <AnimatePresence initial={false}>
              <motion.div
                key={def.id}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <SceneHost def={def} start={starts[active]} time={time} />
              </motion.div>
            </AnimatePresence>
          </div>
        </CanvasCtx.Provider>
        {!reduce && (
          <button
            type="button"
            onClick={() => setPaused((v) => !v)}
            aria-label={paused ? "Play the film" : "Pause the film"}
            className="absolute right-3 bottom-3 z-10 grid size-9 place-items-center rounded-full border border-[var(--line)] bg-[var(--bg)]/85 text-[var(--ink)] backdrop-blur transition-colors hover:border-[var(--accent)]"
          >
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
        )}
      </div>
      <ol className="m-0 mt-5 grid list-none gap-2 p-0" style={{ gridTemplateColumns: `repeat(${chapters.length}, minmax(0, 1fr))` }} aria-label="Chapters">
        {chapters.map((c) => (
          <Chapter key={c.title} time={time} {...c} active={time.get() >= c.from && time.get() < c.to} onGo={() => go(c.from)} compact={portrait} />
        ))}
      </ol>
    </div>
  );
}

function SceneHost({ def, start, time }: { def: SceneDef; start: number; time: MotionValue<number> }) {
  const t = useTransform(time, (v) => Math.min(def.dur, Math.max(0, v - start)));
  const S = def.Scene;
  return <S t={t} dur={def.dur} />;
}

function Chapter({ time, title, from, to, onGo, compact }: { time: MotionValue<number>; title: string; from: number; to: number; active: boolean; onGo: () => void; compact: boolean }) {
  const width = useTransform(time, (t) => `${Math.min(100, Math.max(0, ((t - from) / (to - from)) * 100))}%`);
  const [on, setOn] = useState(false);
  useMotionValueEvent(time, "change", (t) => setOn(t >= from && t < to));
  return (
    <li>
      <button type="button" onClick={onGo} className="grid w-full gap-2 text-left" aria-current={on ? "step" : undefined}>
        <span className="relative h-[3px] overflow-hidden rounded-full bg-[var(--line)]">
          <motion.span className="absolute inset-y-0 left-0 rounded-full bg-[var(--accent)]" style={{ width }} />
        </span>
        <span className={`truncate text-[13px] transition-colors ${on ? "text-[var(--ink)]" : "text-[var(--muted)]"} ${compact && !on ? "max-sm:opacity-0" : ""}`}>{title}</span>
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
