import { Pause, Play } from "lucide-react";
import { animate, motion, type MotionValue, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DesktopIcons, Scene, type Shot, Stage, useCamera, usePlayer, Wallpaper } from "./Player";
import { CHAPTERS, chapterAt, CONFIRM, K, type Layout } from "./script";

/**
 * The site's demo: a short, scripted screen recording of Organizy. Nothing in it is clickable;
 * a cursor drops files on the window, reviews, teaches one, moves them, and a week later a
 * similar file is filed by what it learned. On narrow screens a camera follows the action.
 */

const L: Layout = {
  W: 1200, H: 700,
  win: { x: 352, y: 60 },
  icons: [
    { x: 92, y: 96 }, { x: 214, y: 88 }, { x: 120, y: 232 }, { x: 252, y: 214 },
    { x: 86, y: 368 }, { x: 214, y: 352 }, { x: 132, y: 500 }, { x: 262, y: 488 },
  ],
  lasso: [{ x: 26, y: 34 }, { x: 322, y: 572 }],
  grab: { x: 252, y: 214 },
  drop: { x: 352 + 494, y: 60 + 300 },
  newIcon: { x: 150, y: 260 },
  rest: { x: 700, y: 650 },
};
const SINK = { x: 110, y: 640 };
export { L as LAYOUT, SINK };

// Window-relative rectangle → stage coordinates.
const w = (x0: number, y0: number, x1: number, y1: number): [number, number, number, number] => [L.win.x + x0, L.win.y + y0, L.win.x + x1, L.win.y + y1];
const ICONS: [number, number, number, number] = [20, 30, 340, 580];
const WIDE: [number, number, number, number] = [40, 110, 980, 620];
const shot = (t: number, r: [number, number, number, number]): Shot => [t, ...r];

/** Phone camera: each shot is "be framing this by then". The viewport is 440 × 500 design units. */
const PHONE_SHOTS: Shot[] = [
  shot(0, ICONS),
  shot(K.grab, ICONS),
  shot(K.drop - 0.05, WIDE),
  shot(K.scan + 0.7, w(168, 40, 610, 450)),
  shot(K.scanEnd + 0.8, w(168, 40, 610, 450)),
  shot(K.menu - 0.1, w(250, 52, 680, 470)),
  shot(K.create + 0.1, w(250, 52, 680, 470)),
  shot(K.teachShow + 0.4, w(168, 290, 610, 520)),
  shot(K.teachClick - 0.1, w(390, 290, 820, 520)),
  shot(K.learn + 0.15, w(380, 290, 820, 520)),
  shot(K.learnedEnd - 0.5, w(168, 290, 610, 520)),
  shot(K.moveClick - 0.1, w(400, 300, 820, 560)),
  shot(K.confirm - 0.1, w(CONFIRM.x - 40, 30, CONFIRM.x + CONFIRM.w + 40, 300)),
  shot(K.moved + 0.4, w(260, 150, 720, 480)),
  shot(K.act2 + 0.5, [20, 110, 480, 580]),
  shot(K.drop2 - 0.05, WIDE),
  shot(K.row2 + 0.4, w(168, 52, 610, 320)),
  shot(K.end, w(168, 52, 610, 320)),
  shot(K.T, ICONS),
];
const PHONE = { VW: 440, VH: 500 };

/** Plays the script on a loop while on screen. Reduced motion shows the finished story, still. */
function useLoop(ref: React.RefObject<HTMLElement | null>, paused: boolean) {
  const time = useMotionValue(0);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { amount: 0.3 });
  useEffect(() => {
    if (reduce) { time.set(K.end - 0.5); return; }
    if (!inView || paused) return;
    let ctl: ReturnType<typeof animate> | null = null;
    let alive = true;
    const run = () => {
      ctl = animate(time, K.T, {
        duration: Math.max(0.01, K.T - time.get()),
        ease: "linear",
        onComplete: () => { if (alive) { time.set(0); run(); } },
      });
    };
    run();
    return () => { alive = false; ctl?.stop(); };
  }, [inView, paused, reduce, time]);
  return { time, reduce };
}

export function DemoReel() {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const { time, reduce } = useLoop(ref, paused);
  const p = usePlayer(time, L);
  const [phone, setPhone] = useState(false);
  const onScale = useCallback((px: number) => setPhone(px < 720), []);
  const camera = useCamera(time, PHONE.VW, PHONE.VH, phone ? PHONE_SHOTS : null);

  return (
    <div ref={ref}>
      <div
        className="relative"
        role="img"
        aria-label="A recording of Organizy: eight files are dropped on the window, each gets a suggested folder with its reason, one recipe is moved to a new Recipes folder and taught, the files are moved after a confirmation, and a week later a new recipe is filed to Recipes automatically."
      >
        <Stage
          W={L.W} H={L.H}
          VW={phone ? PHONE.VW : L.W} VH={phone ? PHONE.VH : L.H}
          camera={phone ? camera : undefined}
          onScale={onScale}
          className="rounded-[18px] bg-[var(--surface)]"
        >
          <Wallpaper rounded={!phone}>
            <DesktopIcons L={L} snap={p.snap} sink={SINK} />
            <DocumentsFolder bump={p.snap.desktopGone} />
          </Wallpaper>
          <Scene L={L} {...p} time={time} />
        </Stage>
        {!reduce && (
          <button
            type="button"
            onClick={() => setPaused((v) => !v)}
            aria-label={paused ? "Play the demo" : "Pause the demo"}
            className="absolute right-3 bottom-3 grid size-9 place-items-center rounded-full border border-[var(--line)] bg-[var(--bg)]/85 text-[var(--ink)] backdrop-blur transition-colors hover:border-[var(--accent)]"
          >
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
        )}
      </div>
      <ChapterBar time={time} />
    </div>
  );
}

export function DocumentsFolder({ bump }: { bump: boolean }) {
  return (
    <motion.div
      className="absolute top-0 left-0 grid w-[104px] justify-items-center gap-1 text-center"
      style={{ x: SINK.x - 52, y: SINK.y - 34 }}
      animate={bump ? { scale: [1, 1.15, 1] } : { scale: 1 }}
      transition={{ duration: 0.5, delay: 0.75 }}
    >
      <svg width="54" height="44" viewBox="0 0 54 44" aria-hidden>
        <path d="M3 6a4 4 0 0 1 4-4h13l5 5h22a4 4 0 0 1 4 4v27a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" fill="#5AB0F7" />
        <path d="M3 13h48v25a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" fill="#7BC2FA" />
      </svg>
      <span className="text-[11.5px] text-[var(--ink)]" style={{ fontFamily: "var(--font-mac)" }}>Documents</span>
    </motion.div>
  );
}

/** Five chapters that fill as the demo plays. It reads as a video without being one. */
function ChapterBar({ time }: { time: MotionValue<number> }) {
  const [i, setI] = useState(() => chapterAt(time.get()));
  useMotionValueEvent(time, "change", (t) => setI(chapterAt(t)));
  return (
    <div className="mt-6 grid gap-4">
      <ol className="m-0 grid list-none grid-cols-5 gap-2 p-0" aria-label="Demo chapters">
        {CHAPTERS.map((c, j) => {
          const end = j + 1 < CHAPTERS.length ? CHAPTERS[j + 1].at : K.end;
          return <Fill key={c.id} time={time} from={c.at} to={end} label={c.title} active={j === i} />;
        })}
      </ol>
      <p className="m-0 min-h-[3.2em] text-[17px] sm:min-h-[1.6em]" aria-live="off">
        <motion.span key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="inline-block">
          {CHAPTERS[i].line}
        </motion.span>
      </p>
    </div>
  );
}

function Fill({ time, from, to, label, active }: { time: MotionValue<number>; from: number; to: number; label: string; active: boolean }) {
  const width = useTransform(time, (t) => `${Math.min(100, Math.max(0, ((t - from) / (to - from)) * 100))}%`);
  return (
    <li className="grid gap-2">
      <span className="relative h-[3px] overflow-hidden rounded-full bg-[var(--line)]">
        <motion.span className="absolute inset-y-0 left-0 rounded-full bg-[var(--accent)]" style={{ width }} />
      </span>
      <span className={`text-[13px] transition-colors ${active ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}>{label}</span>
    </li>
  );
}
