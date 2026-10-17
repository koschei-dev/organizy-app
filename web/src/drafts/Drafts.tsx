import { animate, motion, type MotionValue, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { FileGlyph } from "./FileGlyph";
import { DesktopIcons, Scene, type Shot, Stage, useCamera, usePlayer, Wallpaper } from "./Player";
import { CHAPTERS, chapterAt, FILES, K, type Layout } from "./script";

/** Plays the script on a loop while the element is on screen; reduced motion shows the finished state. */
function useLoop(ref: React.RefObject<HTMLElement | null>) {
  const time = useMotionValue(0);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { amount: 0.35 });
  useEffect(() => {
    const frozen = new URLSearchParams(location.search).get("t");
    if (frozen !== null) { time.set(Number(frozen)); return; } // ?t=12 freezes every draft at 12 s, for review
    if (reduce) { time.set(K.end - 0.5); return; }
    if (!inView) return;
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
  }, [inView, reduce, time]);
  return time;
}

function useChapter(time: MotionValue<number>) {
  const [i, setI] = useState(() => chapterAt(time.get()));
  useMotionValueEvent(time, "change", (t) => setI(chapterAt(t)));
  return i;
}

/** A thin chapter bar that fills as the demo plays: it reads as a video, without being one. */
function ChapterBar({ time }: { time: MotionValue<number> }) {
  const i = useChapter(time);
  return (
    <div className="mt-6 grid gap-4">
      <div className="grid grid-cols-5 gap-2">
        {CHAPTERS.map((c, j) => {
          const end = j + 1 < CHAPTERS.length ? CHAPTERS[j + 1].at : K.end;
          return <Fill key={c.id} time={time} from={c.at} to={end} label={c.title} active={j === i} />;
        })}
      </div>
      <p className="m-0 min-h-[1.6em] text-[17px]">
        <motion.span key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="inline-block">
          {CHAPTERS[i].line}
        </motion.span>
      </p>
    </div>
  );
}
function Fill({ time, from, to, label, active }: { time: MotionValue<number>; from: number; to: number; label: string; active: boolean }) {
  const w = useTransform(time, (t) => `${Math.min(100, Math.max(0, ((t - from) / (to - from)) * 100))}%`);
  return (
    <div className="grid gap-2">
      <span className="relative h-[3px] overflow-hidden rounded-full bg-[var(--line)]">
        <motion.span className="absolute inset-y-0 left-0 rounded-full bg-[var(--accent)]" style={{ width: w }} />
      </span>
      <span className={`text-[13px] transition-colors ${active ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}>{label}</span>
    </div>
  );
}

// ================================================================ A · Screen recording
const LA: Layout = {
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
const SINK_A = { x: 110, y: 640 };

export function DraftA() {
  const ref = useRef<HTMLDivElement>(null);
  const time = useLoop(ref);
  const p = usePlayer(time, LA);
  return (
    <div ref={ref}>
      <Stage W={LA.W} H={LA.H}>
        <Wallpaper>
          <DesktopIcons L={LA} snap={p.snap} sink={SINK_A} />
          <DocumentsFolder at={SINK_A} bump={p.snap.desktopGone} />
        </Wallpaper>
        <Scene L={LA} {...p} time={time} />
      </Stage>
      <ChapterBar time={time} />
    </div>
  );
}

function DocumentsFolder({ at, bump }: { at: { x: number; y: number }; bump: boolean }) {
  return (
    <motion.div
      className="absolute top-0 left-0 grid w-[104px] justify-items-center gap-1 text-center"
      style={{ x: at.x - 52, y: at.y - 34 }}
      animate={bump ? { scale: [1, 1.15, 1] } : { scale: 1 }}
      transition={{ duration: 0.5, delay: 0.75 }}
    >
      <svg width="54" height="44" viewBox="0 0 54 44" aria-hidden>
        <path d="M3 6a4 4 0 0 1 4-4h13l5 5h22a4 4 0 0 1 4 4v27a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" fill="#5AB0F7" />
        <path d="M3 13h48v25a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" fill="#7BC2FA" />
      </svg>
      <span className="text-[11.5px]" style={{ fontFamily: "var(--font-mac)" }}>Documents</span>
    </motion.div>
  );
}

// ================================================================ B · Scroll story
const LB: Layout = {
  W: 1000, H: 640,
  win: { x: 156, y: 48 },
  icons: Array.from({ length: 8 }, (_, i) => ({ x: 70 + (i % 2) * 8, y: 150 + i * 46 })),
  lasso: [{ x: 14, y: 100 }, { x: 132, y: 520 }],
  grab: { x: 74, y: 290 },
  drop: { x: 156 + 494, y: 48 + 300 },
  newIcon: { x: 74, y: 300 },
  rest: { x: 560, y: 620 },
};
const W0 = LB.win;
const SHOTS_B: Shot[] = [
  [0, 0, 0, 1000, 640],
  [K.drop, 0, 0, 1000, 640],
  [K.scan + 0.2, W0.x, W0.y, W0.x + 820, W0.y + 560],
  [K.scanEnd + 0.6, W0.x, W0.y, W0.x + 820, W0.y + 560],
  [K.menu - 0.3, W0.x + 168, W0.y + 40, W0.x + 820, W0.y + 520],
  [K.create + 0.15, W0.x + 168, W0.y + 40, W0.x + 820, W0.y + 520],
  [K.teachShow + 0.5, W0.x + 168, W0.y + 200, W0.x + 820, W0.y + 560],
  [K.learnedEnd, W0.x + 168, W0.y + 200, W0.x + 820, W0.y + 560],
  [K.moveClick - 0.2, W0.x + 120, W0.y, W0.x + 820, W0.y + 560],
  [K.moved + 0.2, W0.x + 120, W0.y, W0.x + 820, W0.y + 560],
  [K.act2 - 0.2, 0, 0, 1000, 640],
  [K.drop2 + 0.2, 0, 0, 1000, 640],
  [K.row2, W0.x + 168, W0.y + 60, W0.x + 820, W0.y + 300],
  [K.T, W0.x + 168, W0.y + 60, W0.x + 820, W0.y + 300],
];
const STORY = [
  { at: 0, title: "Drop.", line: "Drag the mess onto the window. A folder works too, or the Dock icon." },
  { at: K.scan, title: "Read.", line: "It opens each file, reads names and contents, and suggests a folder with the reason." },
  { at: K.menu - 0.6, title: "Correct once.", line: "Pick another folder, even a new one, and Organizy asks whether to remember it." },
  { at: K.moveClick - 0.3, title: "Then move.", line: "Nothing moves until you click. Every batch can be undone from History." },
  { at: K.act2, title: "It learns.", line: "The next recipe you download goes straight to Recipes. No downloads, no account, all on your Mac." },
];

export function DraftB() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const frozen = typeof location !== "undefined" ? new URLSearchParams(location.search).get("t") : null;
  const time = useTransform(scrollYProgress, (v) => (frozen !== null ? Number(frozen) : reduce ? K.end - 0.5 : v * (K.T - 0.4)));
  const p = usePlayer(time, LB);
  const camera = useCamera(time, LB.W, LB.H, SHOTS_B);
  const storyAt = (t: number) => STORY.reduce((j, s, k) => (t >= s.at ? k : j), 0);
  const [i, setI] = useState(() => storyAt(time.get()));
  useMotionValueEvent(time, "change", (t) => setI(storyAt(t)));
  const bar = useTransform(scrollYProgress, (v) => `${v * 100}%`);
  return (
    <div ref={ref} style={{ height: "520vh" }} className="relative">
      <div className="sticky top-0 grid h-svh content-center gap-8 py-8 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-4">
          <div className="relative min-h-[11em] lg:min-h-[14em]">
            {STORY.map((s, k) => (
              <motion.div
                key={s.title}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: k === i ? 1 : 0, y: k === i ? 0 : k < i ? -24 : 24 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden={k !== i}
              >
                <p className="m-0 mb-2 text-[14px] text-[var(--muted)]">{String(k + 1).padStart(2, "0")} / 05</p>
                <h3 className="m-0 font-display text-[clamp(44px,5.6vw,88px)] leading-[0.98] font-bold tracking-[-0.03em]">{s.title}</h3>
                <p className="m-0 mt-4 max-w-[30ch] text-[18px]">{s.line}</p>
              </motion.div>
            ))}
          </div>
          <span className="mt-6 block h-[2px] w-40 overflow-hidden rounded-full bg-[var(--line)]">
            <motion.span className="block h-full bg-[var(--accent)]" style={{ width: bar }} />
          </span>
        </div>
        <div className="lg:col-span-8">
          <Stage W={LB.W} H={LB.H} camera={camera} className="rounded-[18px]">
            <Pile L={LB} gone={p.snap.drag !== "none" || p.snap.view !== "empty"} showNew={p.snap.newFile === "shown"} />
            <Scene L={LB} {...p} time={time} />
          </Stage>
        </div>
      </div>
    </div>
  );
}

/** Draft B has no desktop: the files arrive as a loose pile beside the window. */
function Pile({ L, gone, showNew }: { L: Layout; gone: boolean; showNew: boolean }) {
  return (
    <>
      {L.icons.map((pt, i) => (
        <motion.div
          key={i}
          className="absolute top-0 left-0"
          initial={false}
          animate={{ x: pt.x - 22, y: pt.y - 28, rotate: ((i * 29) % 15) - 7, opacity: gone ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <FileStack i={i} />
        </motion.div>
      ))}
      {showNew && (
        <motion.div className="absolute top-0 left-0" initial={{ x: L.newIcon.x - 22, y: L.newIcon.y - 50, opacity: 0 }} animate={{ y: L.newIcon.y - 28, opacity: 1 }}>
          <FileStack i={6} />
        </motion.div>
      )}
    </>
  );
}
const FileStack = ({ i }: { i: number }) => <FileGlyph kind={FILES[i].kind} size={44} />;

// ================================================================ C · Dock to a tidy desktop
const DOCK_Y = 668;
const DOCK = { x0: 380, gap: 62 };
const DOCK_ORGANIZY = { x: DOCK.x0 + DOCK.gap * 4, y: DOCK_Y };
const LC: Layout = {
  W: 1200, H: 720,
  win: { x: 190, y: 44 },
  icons: [
    { x: 150, y: 120 }, { x: 420, y: 90 }, { x: 760, y: 140 }, { x: 1040, y: 110 },
    { x: 260, y: 330 }, { x: 610, y: 300 }, { x: 930, y: 360 }, { x: 470, y: 500 },
  ],
  lasso: [{ x: 60, y: 40 }, { x: 1120, y: 580 }],
  grab: { x: 610, y: 300 },
  drop: DOCK_ORGANIZY,
  newIcon: { x: 1090, y: 520 },
  rest: { x: 1000, y: 600 },
};

export function DraftC() {
  const ref = useRef<HTMLDivElement>(null);
  const time = useLoop(ref);
  const p0 = usePlayer(time, LC, { windowStartsClosed: true });
  const [finder, setFinder] = useState(false);
  useMotionValueEvent(time, "change", (t) => setFinder(t >= K.moved + 0.9 && t < K.drop2 - 0.1));
  const p = { ...p0, finder };
  const i = useChapter(time);
  return (
    <div ref={ref} className="grid gap-6">
      <Stage W={LC.W} H={LC.H}>
        <Wallpaper>
          <DesktopIcons L={LC} snap={p.snap} sink={{ x: DOCK.x0 + DOCK.gap * 6, y: DOCK_Y }} tilt />
          <Dock hover={p.snap.drag !== "none" && p.snap.hover} bounce={p.snap.desktopGone} />
          <TidyFolders show={p.finder} />
        </Wallpaper>
        <Scene L={LC} snap={p.snap} cx={p.cx} cy={p.cy} click={p.click} down={p.down} time={time} windowStyle="fromDock" />
      </Stage>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <p className="m-0 font-display text-[clamp(28px,3vw,44px)] leading-[1.05] font-bold tracking-[-0.02em]">
          <motion.span key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="inline-block">
            {["A desktop like everyone’s.", "Read, not guessed.", "Fix it once.", "Then, and only then, it moves.", "Next week, it already knows."][i]}
          </motion.span>
        </p>
        <span className="text-[15px] text-[var(--muted)]">{CHAPTERS[i].line}</span>
      </div>
    </div>
  );
}

function Dock({ hover, bounce }: { hover: boolean; bounce: boolean }) {
  const apps = ["#9AA4B2", "#7FB3F5", "#F2C14E", "#E07A5F", "organizy", "#81B29A", "folder", "#C9CED6"];
  return (
    <div
      className="absolute flex items-end gap-[10px] rounded-[22px] border border-white/40 bg-white/45 px-3 py-[9px] backdrop-blur-md dark:border-white/10 dark:bg-black/30"
      style={{ left: DOCK.x0 - 37, top: DOCK_Y - 40 }}
    >
      {apps.map((a, i) => {
        const isOrg = a === "organizy";
        return (
          <motion.div
            key={i}
            className="grid size-[52px] place-items-center"
            animate={isOrg && hover ? { scale: 1.35, y: -10 } : a === "folder" && bounce ? { y: [0, -18, 0, -8, 0] } : { scale: 1, y: 0 }}
            transition={{ duration: a === "folder" ? 0.9 : 0.25, delay: a === "folder" ? 0.6 : 0 }}
            style={{ transformOrigin: "50% 100%" }}
          >
            {isOrg ? (
              <img src="/organizy-app/icon-96.png" alt="" className="size-full" />
            ) : a === "folder" ? (
              <svg width="48" height="40" viewBox="0 0 54 44" aria-hidden>
                <path d="M3 6a4 4 0 0 1 4-4h13l5 5h22a4 4 0 0 1 4 4v27a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" fill="#5AB0F7" />
                <path d="M3 13h48v25a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" fill="#7BC2FA" />
              </svg>
            ) : (
              <span className="size-[46px] rounded-[12px]" style={{ background: `linear-gradient(160deg, ${a}, color-mix(in oklab, ${a} 70%, #000))` }} />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/** After the move the desktop is clear, and Documents › Organizy holds the new folders. */
function TidyFolders({ show }: { show: boolean }) {
  const names = ["Invoices & Receipts", "Images", "Screenshots", "Bank Statements", "Taxes", "Resumes & CVs", "Recipes", "Spreadsheets"];
  return (
    <motion.div
      className="mac absolute overflow-hidden rounded-[12px] border border-[var(--mac-line)] bg-[var(--mac-window)]"
      style={{ left: 330, top: 120, width: 540, boxShadow: "var(--mac-shadow)", transformOrigin: "50% 100%" }}
      initial={false}
      animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.92, y: show ? 0 : 20 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex h-[44px] items-center gap-3 border-b border-[var(--mac-line)] bg-[var(--mac-bar)] px-3">
        <span className="flex gap-[7px]">
          <span className="size-3 rounded-full bg-[#FF5F57]" /><span className="size-3 rounded-full bg-[#FEBC2E]" /><span className="size-3 rounded-full bg-[#28C840]" />
        </span>
        <span className="font-semibold text-[var(--mac-text-2)]">Documents › Organizy</span>
      </div>
      <div className="grid grid-cols-4 gap-y-4 p-5">
        {names.map((n, i) => (
          <motion.div key={n} className="grid justify-items-center gap-1 text-center" initial={false} animate={{ opacity: show ? 1 : 0, y: show ? 0 : 6 }} transition={{ delay: show ? 0.2 + i * 0.05 : 0 }}>
            <svg width="50" height="40" viewBox="0 0 54 44" aria-hidden>
              <path d="M3 6a4 4 0 0 1 4-4h13l5 5h22a4 4 0 0 1 4 4v27a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" fill={n === "Recipes" ? "var(--mac-tint)" : "#5AB0F7"} />
              <path d="M3 13h48v25a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" fill={n === "Recipes" ? "color-mix(in oklab, var(--mac-tint) 70%, #fff)" : "#7BC2FA"} />
            </svg>
            <span className="text-[11.5px] leading-[1.2]">{n}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
