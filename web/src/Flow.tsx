import { Check, FileText, Folder } from "lucide-react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

/**
 * "Files in, folders out": files flow along dotted paths into the app, the plan appears,
 * and after a confirm they flow out into their folders. Everything is drawn from one geometry
 * so the same picture runs left to right on desktop and top to bottom on a phone.
 */

const ITEMS = [
  { ext: "PDF", file: "scan_4412.pdf", folder: "Invoices", why: "Rule" },
  { ext: "HEIC", file: "IMG_2291.HEIC", folder: "Images", why: "Rule" },
  { ext: "PNG", file: "Screenshot 10.14.png", folder: "Screenshots", why: "Rule" },
  { ext: "DOCX", file: "jsmith_experience.docx", folder: "Resumes", why: "AI" },
  { ext: "CSV", file: "budget_2026.csv", folder: "Sheets", why: "AI" },
] as const;

const LOOP = 9.4; // seconds
const IN_AT = 0.2, IN_DUR = 1.5, STAGGER = 0.16;
const ROWS_AT = 2.1, ROW_STEP = 0.3;
const CONFIRM_AT = 4.1, PRESS_AT = 4.5;
const OUT_AT = 4.7, OUT_DUR = 1.5;
const RESET_AT = 8.6;

type Geo = {
  vert: boolean; U: number; V: number; tile: number; hub: number; r: number;
  cross: number[]; vc: number; uSrc: number; uBus1: number; uHub1: number;
  uP0: number; uP1: number; uHub2: number; uBus2: number; uDst: number;
  pv0: number; pv1: number; panelW: number; panelH: number;
};

const spread = (n: number, first: number, step: number) => Array.from({ length: n }, (_, i) => first + i * step);

const WIDE: Geo = {
  vert: false, U: 1100, V: 500, tile: 56, hub: 52, r: 16, cross: spread(5, 58, 96), vc: 250,
  uSrc: 70, uBus1: 215, uHub1: 300, uP0: 370, uP1: 730, uHub2: 800, uBus2: 885, uDst: 1030,
  pv0: 46, pv1: 454, panelW: 360, panelH: 408,
};
const TALL: Geo = {
  vert: true, U: 840, V: 360, tile: 52, hub: 44, r: 14, cross: spread(5, 36, 72), vc: 180,
  uSrc: 34, uBus1: 108, uHub1: 150, uP0: 190, uP1: 538, uHub2: 578, uBus2: 650, uDst: 752,
  pv0: 4, pv1: 356, panelW: 352, panelH: 348,
};

const pt = (g: Geo, u: number, v: number) => (g.vert ? `${v} ${u}` : `${u} ${v}`);

/** Orthogonal path with rounded corners: along the flow, across to the target lane, along again. */
function lane(g: Geo, u0: number, v0: number, u1: number, v1: number, uMid: number) {
  if (v0 === v1) return `M${pt(g, u0, v0)} L${pt(g, u1, v1)}`;
  const d = Math.sign(v1 - v0), r = g.r;
  return (
    `M${pt(g, u0, v0)} L${pt(g, uMid - r, v0)} Q${pt(g, uMid, v0)} ${pt(g, uMid, v0 + d * r)} ` +
    `L${pt(g, uMid, v1 - d * r)} Q${pt(g, uMid, v1)} ${pt(g, uMid + r, v1)} L${pt(g, u1, v1)}`
  );
}

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const prog = (t: number, at: number, dur: number) => Math.min(1, Math.max(0, (t - at) / dur));

type Snap = { rows: number; phase: 0 | 1 | 2 | 3; departed: number; arrived: number; pressed: boolean };
const START: Snap = { rows: 0, phase: 0, departed: 0, arrived: 0, pressed: false };
const END: Snap = { rows: 5, phase: 3, departed: 31, arrived: 31, pressed: false };

function snapAt(t: number): Snap {
  let departed = 0, arrived = 0;
  for (let i = 0; i < 5; i++) {
    const p = prog(t, OUT_AT + i * STAGGER, OUT_DUR);
    if (p > 0) departed |= 1 << i;
    if (p >= 1) arrived |= 1 << i;
  }
  const afterReset = t >= RESET_AT;
  return {
    rows: afterReset ? 0 : Math.min(5, Math.max(0, Math.floor((t - ROWS_AT) / ROW_STEP) + 1)),
    phase: afterReset ? 0 : t >= OUT_AT ? 3 : t >= CONFIRM_AT ? 2 : t >= ROWS_AT - 0.3 ? 1 : 0,
    departed: afterReset ? 0 : departed,
    arrived: afterReset ? 0 : arrived,
    pressed: t >= PRESS_AT - 0.08 && t < PRESS_AT + 0.25,
  };
}
const same = (a: Snap, b: Snap) => a.rows === b.rows && a.phase === b.phase && a.departed === b.departed && a.arrived === b.arrived && a.pressed === b.pressed;

const STATUS = [
  "5 files in Downloads",
  "Reading names and contents…",
  "Nothing moves until you click.",
  "Moved 5 files. Undo anytime from History.",
];

export function Flow() {
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { amount: 0.3 });
  const [wrapW, setWrapW] = useState(1100);
  const [snap, setSnap] = useState<Snap>(reduce ? END : START);

  useLayoutEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(([e]) => setWrapW(e.contentRect.width));
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const g = wrapW >= 940 ? WIDE : TALL;
  const W = g.vert ? g.V : g.U, H = g.vert ? g.U : g.V;
  const stageW = g.vert ? Math.min(wrapW, 440) : Math.min(wrapW, 1180);
  const k = stageW / W;

  const paths = useMemo(() => {
    const inD = g.cross.map((v) => lane(g, g.uSrc + g.tile / 2, v, g.uP0, g.vc, g.uBus1));
    const outD = g.cross.map((v) => lane(g, g.uP1, g.vc, g.uDst - g.tile / 2, v, g.uBus2));
    return { inD, outD };
  }, [g]);

  // The dots ride the same paths that are drawn, so they can never drift off them.
  const inEls = useRef<(SVGPathElement | null)[]>([]);
  const outEls = useRef<(SVGPathElement | null)[]>([]);
  const inDots = useRef<(SVGCircleElement | null)[]>([]);
  const outDots = useRef<(SVGCircleElement | null)[]>([]);
  const lens = useRef<{ i: number[]; o: number[] }>({ i: [], o: [] });
  const snapRef = useRef<Snap>(reduce ? END : START);

  useEffect(() => {
    lens.current = {
      i: inEls.current.map((p) => p?.getTotalLength() ?? 0),
      o: outEls.current.map((p) => p?.getTotalLength() ?? 0),
    };
  }, [paths]);

  useEffect(() => {
    const place = (el: SVGCircleElement | null, path: SVGPathElement | null, len: number, p: number) => {
      if (!el || !path) return;
      if (p <= 0 || p >= 1) { el.style.opacity = "0"; return; }
      const q = path.getPointAtLength(len * ease(p));
      el.setAttribute("cx", String(q.x));
      el.setAttribute("cy", String(q.y));
      el.style.opacity = String(Math.min(1, p * 8, (1 - p) * 8));
    };
    const frame = (t: number) => {
      for (let i = 0; i < 5; i++) {
        place(inDots.current[i], inEls.current[i], lens.current.i[i], prog(t, IN_AT + i * STAGGER, IN_DUR));
        place(outDots.current[i], outEls.current[i], lens.current.o[i], prog(t, OUT_AT + i * STAGGER, OUT_DUR));
      }
      const s = snapAt(t);
      if (!same(s, snapRef.current)) { snapRef.current = s; setSnap(s); }
    };
    if (reduce) {
      frame(RESET_AT - 0.2);
      return;
    }
    if (!inView) return;
    const controls = animate(0, LOOP, { duration: LOOP, ease: "linear", repeat: Infinity, onUpdate: frame });
    return () => controls.stop();
  }, [inView, reduce, paths]);

  const panelStyle = g.vert
    ? { left: `${(g.pv0 / W) * 100}%`, top: `${(g.uP0 / H) * 100}%` }
    : { left: `${(g.uP0 / W) * 100}%`, top: `${(g.pv0 / H) * 100}%` };
  const at = (u: number, v: number) => {
    const [x, y] = g.vert ? [v, u] : [u, v];
    return { left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` };
  };
  const px = (n: number) => `${n * k}px`;

  return (
    <div ref={wrapRef} className="mx-auto w-full max-w-[1180px]">
      <div
        ref={stageRef}
        className="relative mx-auto select-none"
        style={{ width: stageW, height: H * k }}
        role="img"
        aria-label="Five files from a Downloads folder flow into Organizy, which reads them and shows where each should go. After you confirm, they flow into folders: Invoices, Images, Screenshots, Resumes and Sheets."
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full overflow-visible" aria-hidden>
          <g fill="none" stroke="var(--muted)" strokeWidth={2} strokeLinecap="round" strokeDasharray="0.1 7" opacity={0.55}>
            {paths.inD.map((d, i) => (
              <path key={`i${i}`} ref={(el) => { inEls.current[i] = el; }} d={d} />
            ))}
            {paths.outD.map((d, i) => (
              <path key={`o${i}`} ref={(el) => { outEls.current[i] = el; }} d={d} />
            ))}
          </g>
          <g fill="var(--accent)" style={{ filter: "drop-shadow(0 0 6px var(--accent))" }}>
            {ITEMS.map((_, i) => (
              <circle key={`di${i}`} ref={(el) => { inDots.current[i] = el; }} r={4.5} style={{ opacity: 0 }} />
            ))}
            {ITEMS.map((_, i) => (
              <circle key={`do${i}`} ref={(el) => { outDots.current[i] = el; }} r={4.5} style={{ opacity: 0 }} />
            ))}
          </g>
        </svg>

        {/* Source files */}
        {ITEMS.map((it, i) => {
          const gone = (snap.departed >> i) & 1;
          return (
            <div key={it.ext} className="absolute -translate-x-1/2 -translate-y-1/2" style={at(g.uSrc, g.cross[i])}>
              <motion.div
                animate={{ opacity: gone ? 0.3 : 1, scale: gone ? 0.92 : 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="grid place-items-center rounded-[16px] border border-[var(--line)] bg-[var(--surface)]"
                style={{ width: px(g.tile), height: px(g.tile), boxShadow: "0 10px 30px -18px rgba(40,30,120,.45)" }}
              >
                <span className="grid justify-items-center gap-[2px]">
                  <FileText style={{ width: px(20), height: px(20) }} className="text-[var(--muted)]" aria-hidden />
                  <span className="font-medium tracking-[0.04em]" style={{ fontSize: px(11) }}>{it.ext}</span>
                </span>
              </motion.div>
            </div>
          );
        })}

        {/* Hubs: the app on the way in, the confirmation on the way out */}
        <Hub style={at(g.uHub1, g.vc)} size={px(g.hub)} pulse={snap.phase === 1}>
          <img src="/organizy-app/icon-96.png" alt="" className="size-[72%] rounded-[22%]" />
        </Hub>
        <Hub style={at(g.uHub2, g.vc)} size={px(g.hub)} pulse={snap.phase === 2} done={snap.phase === 3}>
          <Check style={{ width: px(22), height: px(22) }} className="text-[var(--accent)]" strokeWidth={2.4} aria-hidden />
        </Hub>

        {/* The app window */}
        <div className="absolute" style={panelStyle}>
          <div
            className="origin-top-left overflow-hidden rounded-[18px] border border-[var(--line)] bg-[var(--surface)]"
            style={{ width: g.panelW, height: g.panelH, transform: `scale(${k})`, boxShadow: "0 40px 80px -40px rgba(40,30,120,.5)" }}
          >
            <Panel snap={snap} />
          </div>
        </div>

        {/* Destination folders */}
        {ITEMS.map((it, i) => {
          const done = (snap.arrived >> i) & 1;
          return (
            <div key={it.folder} className="absolute -translate-x-1/2 -translate-y-1/2" style={at(g.uDst, g.cross[i])}>
              <motion.div
                animate={{ scale: done ? [1, 1.12, 1] : 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative grid place-items-center rounded-[16px] border"
                style={{
                  width: px(g.tile), height: px(g.tile),
                  background: done ? "var(--soft)" : "var(--surface)",
                  borderColor: done ? "var(--accent)" : "var(--line)",
                  transition: "background-color .4s, border-color .4s",
                }}
              >
                <Folder style={{ width: px(24), height: px(24) }} className="fill-[var(--accent)]/25 text-[var(--accent)]" aria-hidden />
                {done ? (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.4, duration: 0.4 }}
                    className="absolute grid place-items-center rounded-full bg-[var(--accent)] font-semibold text-[var(--on-accent)]"
                    style={{ top: px(-6), right: px(-6), width: px(18), height: px(18), fontSize: px(11) }}
                  >
                    1
                  </motion.span>
                ) : null}
              </motion.div>
              <span
                className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[var(--muted)]"
                style={{ top: `calc(100% + ${px(8)})`, fontSize: Math.max(11.5, 13 * k) }}
              >
                {it.folder}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Hub({ children, size, style, pulse, done }: { children: React.ReactNode; size: string; style: React.CSSProperties; pulse?: boolean; done?: boolean }) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={style}>
      {pulse ? (
        <>
          <motion.span className="absolute inset-0 rounded-full border border-[var(--accent)]" initial={{ scale: 1, opacity: 0.7 }} animate={{ scale: 2.1, opacity: 0 }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }} />
          <motion.span className="absolute inset-0 rounded-full border border-[var(--accent)]" initial={{ scale: 1, opacity: 0.7 }} animate={{ scale: 2.1, opacity: 0 }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut", delay: 0.7 }} />
        </>
      ) : null}
      <div
        className="relative grid place-items-center rounded-full border bg-[var(--bg)]"
        style={{ width: size, height: size, borderColor: pulse || done ? "var(--accent)" : "var(--line)", transition: "border-color .3s" }}
      >
        {children}
      </div>
    </div>
  );
}

/** The window's contents, drawn at a fixed design size and scaled as one piece. */
function Panel({ snap }: { snap: Snap }) {
  return (
    <div className="flex h-full flex-col p-4 text-[13px] leading-[1.35]">
      <div className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--bg)] py-[7px] pr-4 pl-[7px]">
        <span className="grid size-6 flex-none place-items-center rounded-full bg-[var(--field)] text-[var(--muted)]">+</span>
        <span className="truncate">
          Sort <span className="text-[var(--accent-ink)]">~/Downloads</span> by <span className="text-[var(--accent-ink)]">what’s inside</span>
        </span>
      </div>

      <ul className="mt-3 grid flex-1 content-start gap-[6px]">
        {ITEMS.map((it, i) => {
          const shown = i < snap.rows;
          const moved = (snap.departed >> i) & 1;
          return (
            <motion.li
              key={it.file}
              initial={false}
              animate={{ opacity: shown ? (moved ? 0.4 : 1) : 0, y: shown ? 0 : 8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 rounded-[12px] border border-[var(--line)] bg-[var(--bg)] px-3 py-[6px]"
            >
              <span className="min-w-0">
                <span className="block truncate font-[var(--font-macmono)] text-[12px]">{it.file}</span>
                <span className="block truncate text-[12px] text-[var(--accent-ink)]">→ {it.folder}</span>
              </span>
              <span
                className="rounded-full px-2 py-[1px] text-[11px] font-medium"
                style={
                  it.why === "AI"
                    ? { background: "var(--accent)", color: "var(--on-accent)" }
                    : { background: "var(--soft)", color: "var(--accent-ink)" }
                }
              >
                {it.why}
              </span>
            </motion.li>
          );
        })}
      </ul>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--line)] pt-3">
        <span className="min-w-0 text-[12px] leading-[1.3] text-[var(--muted)]">{STATUS[snap.phase]}</span>
        <motion.span
          animate={{ scale: snap.pressed ? 0.93 : 1, opacity: snap.phase === 2 ? 1 : 0.45 }}
          transition={{ duration: 0.15 }}
          className="flex-none rounded-[8px] bg-[var(--accent)] px-3 py-[5px] text-[12px] font-medium whitespace-nowrap text-[var(--on-accent)]"
        >
          Move Files
        </motion.span>
      </div>
    </div>
  );
}
