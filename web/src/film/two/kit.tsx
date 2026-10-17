import { AnimatePresence, motion, type MotionValue, useMotionValueEvent, useTransform } from "motion/react";
import { Fragment, type CSSProperties, type ReactNode, useRef } from "react";
import { click } from "../sfx";
import { clamp01, easeInOut, easeOut, ramp, useBeat } from "../Film";

/** Small building blocks for the "Kinetic type" film. Everything is a pure function of the scene clock `t`. */

export type T = MotionValue<number>;
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const easeIn = (x: number) => x * x * x;
export const win = (v: number, a: number, b: number, e: (x: number) => number = easeOut) => e(ramp(v, a, b));
export const pick = <A,>(portrait: boolean, land: A, port: A) => (portrait ? port : land);

/* ------------------------------------------------------------------ tones */

export type Tone = "ink" | "accent" | "inv";
/** Scene colour blocks. "ink" is the default stage, "accent" a full-bleed accent, "inv" the inverted ink. */
export const TONE: Record<Tone, { bg: string; fg: string; muted: string; key: CSSProperties; ring: string }> = {
  ink: { bg: "var(--surface)", fg: "var(--ink)", muted: "var(--muted)", key: { color: "var(--accent)" }, ring: "var(--accent)" },
  accent: {
    bg: "var(--accent)", fg: "var(--on-accent)", muted: "color-mix(in oklab, var(--on-accent) 72%, transparent)",
    key: { color: "transparent", WebkitTextStroke: "0.028em var(--on-accent)" }, ring: "var(--on-accent)",
  },
  inv: {
    bg: "var(--inv-bg)", fg: "var(--inv-ink)", muted: "var(--inv-muted)",
    key: { color: "color-mix(in oklab, var(--accent) 70%, var(--inv-ink))" }, ring: "color-mix(in oklab, var(--accent) 70%, var(--inv-ink))",
  },
};

/** Paints the scene's own background colour. */
export function Bg({ tone }: { tone: Tone }) {
  return <div className="absolute inset-0" style={{ background: TONE[tone].bg }} />;
}

/* ------------------------------------------------------------------ type */

type Mode = "rise" | "fall" | "left" | "right";
type WordProps = {
  t: T; at: number; dur: number; out?: number; outDur: number; mode: Mode; accent?: boolean; keyStyle?: CSSProperties; children: ReactNode;
};

function Word({ t, at, dur, out, outDur, mode, accent, keyStyle, children }: WordProps) {
  const state = (v: number) => ({ i: win(v, at, at + dur), o: out === undefined ? 0 : win(v, out, out + outDur, easeInOut) });
  const Y = useTransform(t, (v) => {
    const { i, o } = state(v);
    const k = mode === "rise" ? 1 : mode === "fall" ? -1 : 0;
    return `${k * ((1 - i) * 118 - o * 118)}%`;
  });
  const X = useTransform(t, (v) => {
    const { i, o } = state(v);
    const k = mode === "left" ? -1 : mode === "right" ? 1 : 0;
    return `${k * ((1 - i) * 108 - o * 108)}%`;
  });
  const R = useTransform(t, (v) => (mode === "rise" ? (1 - state(v).i) * 5 : 0));
  return (
    <span className="inline-block overflow-hidden align-top" style={{ padding: "0.1em 0.07em", margin: "-0.1em -0.07em" }}>
      <motion.span
        className="inline-block"
        style={{ x: X, y: Y, rotate: R, transformOrigin: "0% 100%", ...(accent ? keyStyle : null) }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/**
 * Big Bodoni type, revealed word by word through a mask. Mark the accent word as `*word*`.
 * `still` makes the words arrive already in place at t = 0 (for chapter-opening scenes) and settles the whole block instead.
 */
export function Headline({
  t, lines, size, at = -0.2, step = 0.09, dur = 0.7, out, align = "center", mode = "rise", lineModes, tone = "ink", still = false, lh = 0.98, className = "", style, slots = [],
}: {
  t: T; lines: string[]; size: number; slots?: ReactNode[]; at?: number; step?: number; dur?: number; out?: number; align?: "left" | "center";
  mode?: Mode; lineModes?: Mode[]; tone?: Tone; still?: boolean; lh?: number; className?: string; style?: CSSProperties;
}) {
  const a0 = still ? -1.0 : at;
  const st = still ? 0.03 : step;
  const d = still ? 1.1 : dur;
  const scale = useTransform(t, (v) => (still ? 1 + 0.07 * (1 - easeOut(ramp(v, 0, 1.0))) : 1));
  let k = 0;
  return (
    <motion.div
      className={`font-display font-bold tracking-[-0.03em] ${className}`}
      style={{ fontSize: size, lineHeight: lh, textAlign: align, scale, color: TONE[tone].fg, transformOrigin: align === "left" ? "0% 50%" : "50% 50%", ...style }}
    >
      {lines.map((ln, li) => (
        <div key={li} className="whitespace-nowrap">
          {ln.split(" ").map((w, wi) => {
            const idx = k++;
            const m = /^\*(.+)\*(.*)$/.exec(w);
            const sl = /^\{(\d+)\}(.*)$/.exec(w);
            return (
              <Fragment key={wi}>
                {wi > 0 ? " " : null}
                <Word t={t} at={a0 + idx * st} dur={d} out={out === undefined ? undefined : out + idx * 0.035} outDur={0.4} mode={lineModes?.[li] ?? mode} accent={!!m} keyStyle={TONE[tone].key}>
                  {sl ? <>{slots[Number(sl[1])]}{sl[2]}</> : m ? m[1] + m[2] : w}
                </Word>
              </Fragment>
            );
          })}
        </div>
      ))}
    </motion.div>
  );
}

/** A word that swaps for another at the given marks (slides up through a mask). */
export function Swap({ t, words, marks, accent = true, tone = "ink" }: { t: T; words: string[]; marks: number[]; accent?: boolean; tone?: Tone }) {
  const n = useBeat(t, marks);
  return (
    <span className="relative inline-block overflow-hidden align-top" style={{ padding: "0.1em 0.07em", margin: "-0.1em -0.07em" }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={n}
          className="inline-block"
          initial={{ y: "118%", rotate: 4 }}
          animate={{ y: "0%", rotate: 0 }}
          exit={{ y: "-118%", rotate: -3 }}
          style={{ transformOrigin: "0% 100%", ...(accent ? TONE[tone].key : null) }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {words[n]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Typing, one character at a time, with an optional caret. */
export function Typed({ t, text, at, cps = 26, caret = true }: { t: T; text: string; at: number; cps?: number; caret?: boolean }) {
  const s = useTransform(t, (v) => text.slice(0, Math.max(0, Math.min(text.length, Math.floor((v - at) * cps)))));
  const end = at + text.length / cps;
  const o = useTransform(t, (v) => (v < at - 0.05 || v > end + 0.9 ? 0 : v > end ? (Math.floor((v - end) * 2.5) % 2 === 0 ? 1 : 0) : 1));
  return (
    <>
      <motion.span>{s}</motion.span>
      {caret && <motion.i className="ml-[2px] inline-block h-[1.05em] w-[2px] translate-y-[0.18em] bg-[var(--accent)] align-baseline" style={{ opacity: o }} />}
    </>
  );
}

/* ------------------------------------------------------------------ placement */

type Off = { x?: number; y?: number; s?: number; r?: number };

/** Anything that flies in at `at` (and optionally out at `out`). x, y are the centre in canvas px. */
export function Fly({
  t, x, y, at, dur = 0.6, out, outDur = 0.4, from = {}, to = {}, ease = easeOut, float = 0, phase = 0, z, className = "", style, children,
}: {
  t: T; x: number; y: number; at: number; dur?: number; out?: number; outDur?: number; from?: Off; to?: Off; ease?: (x: number) => number;
  float?: number; phase?: number; z?: number; className?: string; style?: CSSProperties; children?: ReactNode;
}) {
  const st = (v: number) => ({ i: win(v, at, at + dur, ease), o: out === undefined ? 0 : win(v, out, out + outDur, easeInOut) });
  const X = useTransform(t, (v) => { const { i, o } = st(v); return lerp(from.x ?? 0, 0, i) + (to.x ?? 0) * o; });
  const Y = useTransform(t, (v) => { const { i, o } = st(v); return lerp(from.y ?? 0, 0, i) + (to.y ?? 0) * o + (float ? Math.sin(v * 1.4 + phase) * float : 0); });
  const S = useTransform(t, (v) => { const { i, o } = st(v); return lerp(from.s ?? 1, 1, i) * lerp(1, to.s ?? 1, o); });
  const R = useTransform(t, (v) => { const { i, o } = st(v); return lerp(from.r ?? 0, 0, i) + (to.r ?? 0) * o + (float ? Math.sin(v * 1.1 + phase) * float * 0.12 : 0); });
  const O = useTransform(t, (v) => { const { i, o } = st(v); return Math.min(1, i * 2.2) * (1 - o); });
  return (
    <motion.div
      className={className}
      style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", width: "max-content", zIndex: z, x: X, y: Y, scale: S, rotate: R, opacity: O, ...style }}
    >
      {children}
    </motion.div>
  );
}

/** Soft accent glow behind type. */
export function Glow({ t, x, y, size, at = -0.5, out, o = 1 }: { t: T; x: number; y: number; size: number; at?: number; out?: number; o?: number }) {
  const O = useTransform(t, (v) => o * win(v, at, at + 1.2) * (out === undefined ? 1 : 1 - win(v, out, out + 0.4, easeInOut)));
  const S = useTransform(t, (v) => 0.9 + 0.1 * win(v, at, at + 1.6) + Math.sin(v * 0.9) * 0.03);
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full"
      style={{
        left: x - size / 2, top: y - size / 2, width: size, height: size, opacity: O, scale: S,
        background: "radial-gradient(circle, color-mix(in oklab, var(--accent) 25%, transparent) 0%, transparent 68%)",
      }}
    />
  );
}

/* ------------------------------------------------------------------ pointer */

const pos = (v: number, path: [number, number, number][]): [number, number] => {
  if (v <= path[0][0]) return [path[0][1], path[0][2]];
  for (let i = 0; i < path.length - 1; i++) {
    if (v < path[i + 1][0]) {
      const p = easeInOut(ramp(v, path[i][0], path[i + 1][0]));
      return [lerp(path[i][1], path[i + 1][1], p), lerp(path[i][2], path[i + 1][2], p)];
    }
  }
  const l = path[path.length - 1];
  return [l[1], l[2]];
};

/** Position of the pointer at time v (for things that ride along with it). */
export const pointerAt = pos;

function Ring({ t, c, color }: { t: T; c: number; color: string }) {
  // A click sound when playback crosses the click (not when jumping across chapters).
  const prev = useRef(t.get());
  useMotionValueEvent(t, "change", (v) => {
    if (prev.current < c && v >= c && v - prev.current < 0.25) click();
    prev.current = v;
  });
  const S = useTransform(t, (v) => 0.4 + 2.2 * easeOut(ramp(v, c, c + 0.5)));
  const O = useTransform(t, (v) => (v < c ? 0 : 0.9 * (1 - ramp(v, c, c + 0.5))));
  return <motion.span className="absolute rounded-full border-[3px]" style={{ left: -17, top: -17, width: 34, height: 34, scale: S, opacity: O, borderColor: color }} />;
}

/** The macOS arrow, following `path` = [time, x, y] waypoints and clicking at `clicks`. */
export function Pointer({ t, path, clicks = [], off, scale = 1.25, tone = "ink" }: { t: T; path: [number, number, number][]; clicks?: number[]; off?: number; scale?: number; tone?: Tone }) {
  const X = useTransform(t, (v) => pos(v, path)[0]);
  const Y = useTransform(t, (v) => pos(v, path)[1]);
  const O = useTransform(t, (v) => win(v, path[0][0], path[0][0] + 0.25, (x) => x) * (off === undefined ? 1 : 1 - win(v, off, off + 0.3, (x) => x)));
  const D = useTransform(t, (v) => (clicks.some((c) => v >= c && v < c + 0.16) ? 0.88 : 1));
  return (
    <motion.div className="pointer-events-none absolute top-0 left-0" style={{ x: X, y: Y, opacity: O, zIndex: 80 }}>
      {clicks.map((c) => <Ring key={c} t={t} c={c} color={TONE[tone].ring} />)}
      <motion.svg
        width={24 * scale} height={30 * scale} viewBox="0 0 24 30"
        style={{ position: "absolute", left: -3 * scale, top: -2 * scale, scale: D, transformOrigin: `${3 * scale}px ${2 * scale}px`, filter: "drop-shadow(0 2px 3px rgba(0,0,0,.35))" }}
      >
        <path d="M3 2v21.5l5.4-5.2 3.6 8.4 3.6-1.5-3.5-8.3H20L3 2z" fill="#111" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </motion.svg>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ misc */

/** Opacity / y / scale that follow a time window; for pieces inside a card. */
export function Beat({ t, at, dur = 0.4, out, y = 10, s = 1, className = "", style, children }: {
  t: T; at: number; dur?: number; out?: number; y?: number; s?: number; className?: string; style?: CSSProperties; children?: ReactNode;
}) {
  const I = useTransform(t, (v) => win(v, at, at + dur));
  const O = useTransform(t, (v) => (out === undefined ? 1 : 1 - win(v, out, out + 0.3, easeInOut)));
  const op = useTransform([I, O], ([i, o]: number[]) => clamp01(i * 1.6) * o);
  const Y = useTransform(I, (i) => (1 - i) * y);
  const S = useTransform(I, (i) => lerp(s, 1, i));
  return <motion.div className={className} style={{ opacity: op, y: Y, scale: S, ...style }}>{children}</motion.div>;
}


/* ------------------------------------------------------------------ big type */

/**
 * One giant word, letters slamming up through a mask while the whole word settles from a push-in.
 * Sized to bleed off the canvas on purpose. `still` puts every letter in place at t = 0.
 */
export function Punch({ t, word, size, tone = "ink", x, y, still = true, scaleFrom = 1.28, style }: {
  t: T; word: string; size: number; tone?: Tone; x: number; y: number; still?: boolean; scaleFrom?: number; style?: CSSProperties;
}) {
  const S = useTransform(t, (v) => lerp(still ? 1.1 : scaleFrom, 1, easeOut(ramp(v, 0, 0.7))) + 0.02 * ramp(v, 0.7, 2.4));
  const L = [...word];
  return (
    <motion.div
      className="font-display font-bold"
      style={{
        position: "absolute", left: x, top: y, translate: "-50% -50%", width: "max-content", fontSize: size, lineHeight: 0.9, letterSpacing: "-0.045em",
        whiteSpace: "nowrap", color: TONE[tone].fg, scale: S, ...style,
      }}
    >
      {L.map((c, i) => (
        <Word key={i} t={t} at={still ? -0.9 + i * 0.03 : 0 + i * 0.06} dur={still ? 1.0 : 0.55} outDur={0.3} mode="rise">{c}</Word>
      ))}
    </motion.div>
  );
}

/** A long line of type sliding sideways with the clock. */
export function Marquee({ t, y, size, text, speed, dir = 1, x0 = 0, tone = "ink", outline = false, style }: {
  t: T; y: number; size: number; text: string; speed: number; dir?: 1 | -1; x0?: number; tone?: Tone; outline?: boolean; style?: CSSProperties;
}) {
  const X = useTransform(t, (v) => x0 - dir * speed * v);
  return (
    <motion.div
      className="font-display font-bold"
      style={{
        position: "absolute", left: 0, top: y, translate: "0 -50%", x: X, fontSize: size, lineHeight: 1, letterSpacing: "-0.04em", whiteSpace: "nowrap",
        color: outline ? "transparent" : TONE[tone].fg, WebkitTextStroke: outline ? `0.02em ${TONE[tone].fg}` : undefined, ...style,
      }}
    >
      {text}
    </motion.div>
  );
}

/** A rolling digit counter that goes from 0 to `to` between a and b. */
export function Odometer({ t, to, a, b, size, color }: { t: T; to: number; a: number; b: number; size: number; color?: string }) {
  const n = (v: number) => to * ramp(v, a, b);
  const ones = useTransform(t, (v) => -n(v) * size);
  const tens = useTransform(t, (v) => -clamp01(n(v) - 9) * size);
  const col = (m: MotionValue<number>, digits: number[]) => (
    <span className="relative inline-block overflow-hidden" style={{ height: size, width: "0.54em" }}>
      <motion.span className="absolute inset-x-0 top-0 grid" style={{ y: m }}>
        {digits.map((d, i) => <span key={i} style={{ height: size, lineHeight: `${size}px`, textAlign: "center" }}>{d}</span>)}
      </motion.span>
    </span>
  );
  return (
    <span className="inline-flex font-display font-bold tabular-nums" style={{ fontSize: size, color, letterSpacing: "-0.04em" }}>
      {col(tens, [0, 1])}
      {col(ones, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4])}
    </span>
  );
}
