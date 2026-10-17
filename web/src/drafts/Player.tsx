import { motion, type MotionValue, useMotionValueEvent, useTransform } from "motion/react";
import { type ReactNode, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AppWindow } from "./AppWindow";
import { Cursor } from "./Cursor";
import { FileGlyph } from "./FileGlyph";
import { along, clickAt, cursorPath, FILES, K, type Layout, NEW_FILE, pressed, type Pt, type Snap, sameSnap, snapAt } from "./script";

/** Turns a time value into the scene: discrete state for React, cursor position as motion values. */
export function usePlayer(time: MotionValue<number>, L: Layout, opts: { windowStartsClosed?: boolean } = {}) {
  const path = useMemo(() => cursorPath(L), [L]);
  const [snap, setSnap] = useState<Snap>(() => snapAt(time.get(), opts));
  const [click, setClick] = useState(-1);
  const [down, setDown] = useState(false);
  const cx = useTransform(time, (t) => along(path, t).x);
  const cy = useTransform(time, (t) => along(path, t).y);
  const last = useRef(snap);
  useMotionValueEvent(time, "change", (t) => {
    const s = snapAt(t, opts);
    if (!sameSnap(s, last.current)) { last.current = s; setSnap(s); }
    const c = clickAt(t);
    setClick(c < 0 ? -1 : Math.round(c * 12) / 12);
    setDown(pressed(t));
  });
  return { snap, cx, cy, click, down };
}

/** A fixed-size design canvas scaled to the width it is given. */
export function Stage({ W, H, children, className = "", camera }: { W: number; H: number; children: ReactNode; className?: string; camera?: MotionValue<string> }) {
  const ref = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setK(e.contentRect.width / W));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [W]);
  return (
    <div ref={ref} className={`relative w-full overflow-hidden ${className}`} style={{ height: H * k }}>
      <div className="absolute top-0 left-0 origin-top-left" style={{ width: W, height: H, transform: `scale(${k})` }}>
        <motion.div className="absolute inset-0 origin-top-left" style={camera ? { transform: camera } : undefined}>
          {children}
        </motion.div>
      </div>
    </div>
  );
}

/** Camera keyframes: [time, x0, y0, x1, y1] rectangles to fit, eased between. */
export type Shot = [number, number, number, number, number];
export function useCamera(time: MotionValue<number>, W: number, H: number, shots: Shot[], maxZoom = 1.9) {
  return useTransform(time, (t) => {
    let a = shots[0], b = shots[0];
    for (let i = 0; i < shots.length; i++) {
      if (shots[i][0] <= t) { a = shots[i]; b = shots[Math.min(i + 1, shots.length - 1)]; }
    }
    const span = b[0] - a[0];
    const raw = span > 0 ? Math.min(1, Math.max(0, (t - a[0]) / span)) : 0;
    // hold most of the segment, then move: cameras that drift constantly feel seasick
    const p = raw < 0.55 ? 0 : (raw - 0.55) / 0.45;
    const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    const r = [1, 2, 3, 4].map((j) => a[j] + (b[j] - a[j]) * e);
    const s = Math.min(maxZoom, W / (r[2] - r[0]), H / (r[3] - r[1]));
    const cx = (r[0] + r[2]) / 2, cy = (r[1] + r[3]) / 2;
    return `translate(${W / 2 - cx * s}px, ${H / 2 - cy * s}px) scale(${s})`;
  });
}

/** Everything that happens on top of the stage: the window, the cursor, the drag ghost, the lasso. */
export function Scene({
  L, snap, cx, cy, click, down, time, windowStyle, children,
}: {
  L: Layout; snap: Snap; cx: MotionValue<number>; cy: MotionValue<number>; click: number; down: boolean; time: MotionValue<number>;
  windowStyle?: "plain" | "fromDock"; children?: ReactNode;
}) {
  const lx = useTransform(cx, (v) => Math.min(v, L.lasso[0].x));
  const ly = useTransform(cy, (v) => Math.min(v, L.lasso[0].y));
  const lw = useTransform(cx, (v) => Math.abs(v - L.lasso[0].x));
  const lh = useTransform(cy, (v) => Math.abs(v - L.lasso[0].y));
  const [lasso, setLasso] = useState(false);
  useMotionValueEvent(time, "change", (t) => setLasso(t >= K.lassoStart && t < K.lassoEnd));
  return (
    <>
      {children}
      <motion.div
        className="absolute top-0 left-0"
        style={{ x: L.win.x, y: L.win.y, transformOrigin: windowStyle === "fromDock" ? `${L.drop.x - L.win.x}px ${L.drop.y - L.win.y}px` : "50% 50%" }}
        initial={false}
        animate={snap.windowOpen ? { scale: 1, opacity: 1 } : { scale: 0.08, opacity: 0 }}
        transition={{ duration: windowStyle === "fromDock" ? 0.55 : 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <AppWindow s={snap} />
      </motion.div>
      {lasso && (
        <motion.div
          className="absolute top-0 left-0 z-40 rounded-[3px] border border-[#3E9BF0] bg-[#3E9BF0]/15"
          style={{ x: lx, y: ly, width: lw, height: lh }}
        />
      )}
      <Cursor x={cx} y={cy} click={click} down={down}>
        {snap.drag !== "none" && (
          <div className="absolute" style={{ left: 10, top: 12 }}>
            {(snap.drag === "stack" ? [0, 1, 2] : [0]).map((i) => (
              <div key={i} className="absolute opacity-80" style={{ left: i * 4, top: i * 3, transform: `rotate(${(i - 1) * 6}deg)` }}>
                <FileGlyph kind={snap.drag === "stack" ? FILES[i * 2].kind : NEW_FILE.kind} size={34} />
              </div>
            ))}
            {snap.drag === "stack" && (
              <span className="absolute grid size-5 place-items-center rounded-full bg-[#E5484D] text-[11px] font-semibold text-white" style={{ left: 30, top: -6 }}>8</span>
            )}
          </div>
        )}
      </Cursor>
    </>
  );
}

/** Desktop files with Finder-style labels. They stay put until the move, then fly to `sink`. */
export function DesktopIcons({ L, snap, sink, tilt = false }: { L: Layout; snap: Snap; sink: Pt; tilt?: boolean }) {
  return (
    <>
      {FILES.map((f, i) => {
        const p = L.icons[i];
        const sel = i < snap.selected && snap.view !== "moved" && snap.view !== "scan2" && snap.view !== "list2" && !snap.desktopGone;
        const gone = snap.desktopGone;
        const rot = tilt ? ((i * 37) % 17) - 8 : 0;
        return (
          <motion.div
            key={f.name}
            className="absolute top-0 left-0 grid w-[104px] justify-items-center gap-1 text-center"
            initial={false}
            animate={gone ? { x: sink.x - 52, y: sink.y - 30, scale: 0.2, opacity: 0, rotate: 0 } : { x: p.x - 52, y: p.y - 30, scale: 1, opacity: 1, rotate: rot }}
            transition={{ duration: gone ? 0.7 : 0.4, delay: gone ? i * 0.06 : 0, ease: [0.5, 0, 0.2, 1] }}
          >
            <span className={`rounded-[6px] p-1 ${sel ? "bg-black/10 dark:bg-white/15" : ""}`}>
              <FileGlyph kind={f.kind} size={42} />
            </span>
            <span
              className={`line-clamp-2 max-w-[100px] rounded-[4px] px-1 text-[11.5px] leading-[1.25] break-all ${sel ? "bg-[#3E9BF0] text-white" : "text-[var(--ink)]"}`}
              style={{ fontFamily: "var(--font-mac)" }}
            >
              {f.name}
            </span>
          </motion.div>
        );
      })}
      {snap.newFile === "shown" && (
        <motion.div
          className="absolute top-0 left-0 grid w-[104px] justify-items-center gap-1 text-center"
          initial={{ x: L.newIcon.x - 52, y: L.newIcon.y - 30 - 20, opacity: 0 }}
          animate={{ x: L.newIcon.x - 52, y: L.newIcon.y - 30, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
        >
          <FileGlyph kind="txt" size={42} />
          <span className="max-w-[100px] text-[11.5px] leading-[1.25] break-all" style={{ fontFamily: "var(--font-mac)" }}>{NEW_FILE.name}</span>
        </motion.div>
      )}
    </>
  );
}

/** The flat colour field the desktop sits on: the site's background with its accent glow. */
export function Wallpaper({ children, rounded = true }: { children?: ReactNode; rounded?: boolean }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden ${rounded ? "rounded-[18px]" : ""}`}
      style={{
        background:
          "radial-gradient(60% 70% at 70% 10%, color-mix(in oklab, var(--accent) 30%, transparent), transparent 70%), radial-gradient(50% 60% at 0% 100%, color-mix(in oklab, var(--accent) 14%, transparent), transparent 70%), var(--surface)",
      }}
    >
      {children}
    </div>
  );
}

/** Drives `time` from 0 → T on a loop while visible. */
export { K };
