import { AnimatePresence, motion, type MotionValue, useTransform } from "motion/react";
import type { ReactNode } from "react";
import { useBeat, useCanvas } from "../Film";

/** The desktop the film is shot on: 1200 × 700 world units, same as the site's demo. */
export const WORLD = { W: 1200, H: 700 };
export const WIN_AT = { x: 352, y: 60 };
export type Rect = [number, number, number, number];
/** A rectangle given in window coordinates, returned in world coordinates. */
export const w = (x0: number, y0: number, x1: number, y1: number): Rect => [WIN_AT.x + x0, WIN_AT.y + y0, WIN_AT.x + x1, WIN_AT.y + y1];
export const FULL: Rect = [0, 0, WORLD.W, WORLD.H];
export type Shot = [number, ...Rect];
export const shot = (t: number, r: Rect): Shot => [t, ...r];

const io = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

/** Where the action is framed on the canvas: above the captions in landscape, below them in portrait. */
export function useRegion() {
  const { W, H, portrait } = useCanvas();
  return portrait ? { x: 0, y: 290, w: W, h: H - 290 } : { x: 0, y: 0, w: W, h: H - 150 };
}

/**
 * The camera: shots are [arrive-by time, rect]. It holds a shot, then eases to the next one, so it
 * is settled on each action before the cursor gets there.
 */
export function useShots(t: MotionValue<number>, shots: Shot[], maxZoom = 2.2) {
  const region = useRegion();
  // On a phone, wide shots would make the app unreadably small: keep their left part instead.
  const cap = useCanvas().portrait ? 470 : Infinity;
  return useTransform(t, (v) => {
    let a = shots[0], b = shots[0];
    for (let i = 0; i < shots.length; i++) if (shots[i][0] <= v) { a = shots[i]; b = shots[Math.min(i + 1, shots.length - 1)]; }
    const span = b[0] - a[0];
    const raw = span > 0 ? Math.min(1, Math.max(0, (v - a[0]) / span)) : 0;
    const p = raw < 0.35 ? 0 : (raw - 0.35) / 0.65;
    const e = io(p);
    const r = [1, 2, 3, 4].map((j) => a[j] + (b[j] - a[j]) * e);
    if (r[2] - r[0] > cap && r[2] - r[0] < WORLD.W - 1) r[2] = r[0] + cap;
    const s = Math.min(maxZoom, region.w / (r[2] - r[0]), region.h / (r[3] - r[1]));
    const cx = (r[0] + r[2]) / 2, cy = (r[1] + r[3]) / 2;
    return `translate(${region.x + region.w / 2 - cx * s}px, ${region.y + region.h / 2 - cy * s}px) scale(${s})`;
  });
}

/** The world layer, moved by the camera. */
export function World({ camera, children }: { camera: MotionValue<string>; children: ReactNode }) {
  return (
    <motion.div className="absolute top-0 left-0 origin-top-left" style={{ width: WORLD.W, height: WORLD.H, transform: camera }}>
      {children}
    </motion.div>
  );
}

/** The site's lavender desktop, bleeding past the world edges so zooming out never shows a seam. */
export function Backdrop() {
  return (
    <div
      className="absolute"
      style={{
        inset: -600,
        background:
          "radial-gradient(40% 40% at 65% 45%, color-mix(in oklab, var(--accent) 26%, transparent), transparent 70%), radial-gradient(30% 35% at 35% 70%, color-mix(in oklab, var(--accent) 12%, transparent), transparent 70%), var(--surface)",
      }}
    />
  );
}

/** A highlighter ring around something in the world, drawn while `on`. */
export function Mark({ r, on, label }: { r: Rect; on: boolean; label?: string }) {
  return (
    <AnimatePresence>
      {on && (
        <motion.div
          className="pointer-events-none absolute z-40 rounded-[8px] border-2 border-[var(--accent)]"
          style={{ left: r[0], top: r[1], width: r[2] - r[0], height: r[3] - r[1], boxShadow: "0 0 0 6px color-mix(in oklab, var(--accent) 18%, transparent)" }}
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.45 }}
        >
          {label && (
            <span className="absolute -top-[22px] left-0 rounded-full bg-[var(--accent)] px-2 py-[1px] text-[11px] font-medium whitespace-nowrap text-[var(--on-accent)]">
              {label}
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export type Cue = { at: number; title: string; sub?: string; accent?: string };

/**
 * Kinetic captions: the latest cue whose time has come. Words rise out of a mask one after another;
 * the `accent` word is set in the accent colour.
 */
export function Captions({ t, cues, size = "md" }: { t: MotionValue<number>; cues: Cue[]; size?: "md" | "xl" }) {
  const { portrait } = useCanvas();
  const n = useBeat(t, cues.map((c) => c.at));
  const cue = cues[Math.max(0, n - 1)];
  const titlePx = portrait ? (size === "xl" ? 76 : 56) : size === "xl" ? 96 : 64;
  return (
    <>
      {!portrait && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[300px]"
          style={{ background: "linear-gradient(to top, var(--surface) 38%, color-mix(in oklab, var(--surface) 70%, transparent) 62%, transparent)" }}
        />
      )}
      {portrait && <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[300px] bg-[var(--surface)]" />}
      <div className={`pointer-events-none absolute z-40 ${portrait ? "inset-x-[44px] top-[54px]" : "bottom-[46px] left-[56px] max-w-[880px]"}`}>
        <AnimatePresence mode="wait">
          <motion.div key={cue.title} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <p className="m-0 font-display leading-[1.02] font-bold tracking-[-0.03em] text-[var(--ink)] [text-wrap:balance]" style={{ fontSize: titlePx }}>
              {cue.title.split(" ").map((word, i) => (
                <span key={i} className="mr-[0.22em] inline-block overflow-hidden pb-[0.12em] align-bottom">
                  <motion.span
                    className="inline-block"
                    style={{ color: cue.accent && word.replace(/[.,?]/g, "") === cue.accent ? "var(--accent)" : undefined }}
                    initial={{ y: "105%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </p>
            {cue.sub && (
              <motion.p
                className="m-0 mt-3 max-w-[34ch] text-[var(--muted)]"
                style={{ fontSize: portrait ? 26 : 22, lineHeight: 1.4 }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.25 }}
              >
                {cue.sub}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
