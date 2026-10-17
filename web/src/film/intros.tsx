import { motion, type MotionValue, useTransform } from "motion/react";
import { FileGlyph } from "../demo/FileGlyph";
import { easeInOut, easeOut, Film, ramp, type SceneDef, type SceneProps, useCanvas } from "./Film";

/**
 * Two logo intros, to compare on their own before one is put in front of the film.
 * A, "Gather": scattered files fly into a folder, the folder becomes the app icon, the name rises.
 * B, "Snap": a jumbled "Messy" snaps into order, an accent wipe, then the wordmark on purple.
 */

const KINDS = ["pdf", "img", "doc", "sheet", "txt", "pdf", "img", "txt", "doc", "pdf", "sheet", "img"] as const;
// Deterministic scatter, so every play is the same.
const SCATTER = KINDS.map((_, i) => {
  const a = (i / KINDS.length) * Math.PI * 2 + (i % 3) * 0.4;
  const r = 0.62 + ((i * 37) % 23) / 60;
  return { a, r, rot: ((i * 53) % 50) - 25 };
});

/** The wordmark, laid out the way the site's hero does it: the icon is the O. */
function Wordmark({ size, t, from, color = "var(--ink)", iconFrom }: { size: number; t: MotionValue<number>; from: number; color?: string; iconFrom?: number }) {
  const letters = "rganizy".split("");
  const iconClip = useTransform(t, (v) => `inset(${(1 - easeInOut(ramp(v, iconFrom ?? from, (iconFrom ?? from) + 0.6))) * 100}% 0 0 0)`);
  const iconOn = useTransform(t, (v) => (v >= from ? 1 : 0));
  return (
    <div className="inline-flex items-baseline font-display leading-none font-bold tracking-[-0.04em]" style={{ fontSize: size, color }} aria-label="Organizy">
      <motion.img
        src="/organizy-app/icon-512.png"
        alt=""
        className="mr-[0.02em] size-[0.72em] translate-y-[0.02em]"
        style={iconFrom === undefined ? { opacity: iconOn } : { clipPath: iconClip }}
      />
      <span aria-hidden className="-mb-[0.28em] inline-flex overflow-hidden pb-[0.28em]">
        {letters.map((ch, i) => <Rise key={i} t={t} at={from + 0.1 + i * 0.06} ch={ch} />)}
      </span>
    </div>
  );
}
function Rise({ t, at, ch }: { t: MotionValue<number>; at: number; ch: string }) {
  const y = useTransform(t, (v) => `${(1 - easeOut(ramp(v, at, at + 0.55))) * 160}%`);
  const opacity = useTransform(t, (v) => ramp(v, at + 0.05, at + 0.3));
  return <motion.span className="inline-block" style={{ y, opacity }}>{ch}</motion.span>;
}

// ---------------------------------------------------------------- A · Gather
const A = { pop: 0.1, fly: 0.75, flyDur: 0.9, folder: 1.2, morph: 2.05, name: 2.45, tag: 3.4 };

function GatherScene({ t }: SceneProps) {
  const { W, H, portrait } = useCanvas();
  const cx = W / 2, cy = H / 2 - (portrait ? 40 : 30);
  const S = portrait ? 132 : 176;
  const icon = 0.72 * S;
  // The icon's final centre in the wordmark row (the whole row is about 4.21 em wide).
  const homeX = cx - 2.105 * S + 0.37 * S;
  const homeY = cy - 0.36 * S + 0.36 * S * 0.05;
  const fx = useTransform(t, (v) => { const p = easeInOut(ramp(v, A.morph, A.morph + 0.5)); return cx + (homeX - cx) * p; });
  const fy = useTransform(t, (v) => { const p = easeInOut(ramp(v, A.morph, A.morph + 0.5)); return cy + (homeY - cy) * p; });
  const fs = useTransform(t, (v) => {
    const pop = easeOut(ramp(v, A.folder, A.folder + 0.35));
    const gulp = Math.sin(ramp(v, A.fly + 0.5, A.fly + A.flyDur + 0.3) * Math.PI) * 0.08;
    const shrink = easeInOut(ramp(v, A.morph, A.morph + 0.5));
    return pop * (1 + gulp) * (1 - shrink * (1 - icon / 170));
  });
  const folderO = useTransform(t, (v) => 1 - ramp(v, A.morph - 0.05, A.morph + 0.25));
  const iconO = useTransform(t, (v) => (v >= A.morph + 0.5 ? 0 : ramp(v, A.morph - 0.05, A.morph + 0.25)));
  const glow = useTransform(t, (v) => 0.35 + 0.65 * Math.sin(ramp(v, A.morph, A.tag + 1) * Math.PI));
  const tagO = useTransform(t, (v) => ramp(v, A.tag, A.tag + 0.5));
  const tagY = useTransform(t, (v) => (1 - easeOut(ramp(v, A.tag, A.tag + 0.5))) * 12);
  return (
    <div className="absolute inset-0">
      <motion.div
        className="absolute inset-0"
        style={{ opacity: glow, background: "radial-gradient(40% 45% at 50% 46%, color-mix(in oklab, var(--accent) 30%, transparent), transparent 70%)" }}
      />
      {KINDS.map((k, i) => <Flyer key={i} t={t} i={i} kind={k} cx={cx} cy={cy} />)}
      <motion.div className="absolute top-0 left-0" style={{ x: fx, y: fy, scale: fs }}>
        <div className="relative -translate-x-1/2 -translate-y-1/2" style={{ width: 170, height: 170 }}>
          <motion.svg className="absolute inset-0" viewBox="0 0 54 44" style={{ opacity: folderO }} aria-hidden>
            <path d="M3 6a4 4 0 0 1 4-4h13l5 5h22a4 4 0 0 1 4 4v27a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" fill="var(--accent)" />
            <path d="M3 13h48v25a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" fill="color-mix(in oklab, var(--accent) 70%, #fff)" />
          </motion.svg>
          <motion.img src="/organizy-app/icon-512.png" alt="" className="absolute inset-0 size-full" style={{ opacity: iconO }} />
        </div>
      </motion.div>
      <div className="absolute inset-x-0 grid justify-items-center" style={{ top: cy - 0.62 * S }}>
        <Wordmark size={S} t={t} from={A.morph + 0.5} />
        <motion.p className="m-0 mt-10 text-center text-[var(--muted)]" style={{ fontSize: portrait ? 28 : 26, opacity: tagO, y: tagY }}>
          A tidy Mac, one folder at a time.
        </motion.p>
      </div>
    </div>
  );
}

function Flyer({ t, i, kind, cx, cy }: { t: MotionValue<number>; i: number; kind: (typeof KINDS)[number]; cx: number; cy: number }) {
  const { W, H } = useCanvas();
  const s = SCATTER[i];
  const sx = cx + Math.cos(s.a) * s.r * W * 0.42;
  const sy = cy + Math.sin(s.a) * s.r * H * 0.4;
  const at = A.fly + i * 0.04;
  const p = useTransform(t, (v) => easeInOut(ramp(v, at, at + A.flyDur)));
  const x = useTransform(p, (q) => sx + (cx - sx) * q - 22);
  const y = useTransform(p, (q) => sy + (cy - sy) * q - 28 - Math.sin(q * Math.PI) * 60);
  const rotate = useTransform(p, (q) => s.rot * (1 - q) + q * 180 * (i % 2 ? 1 : -1));
  const scale = useTransform(t, (v) => easeOut(ramp(v, A.pop + i * 0.035, A.pop + i * 0.035 + 0.3)) * (1 - 0.7 * easeInOut(ramp(v, at, at + A.flyDur))));
  const opacity = useTransform(t, (v) => (v > at + A.flyDur - 0.05 ? 0 : 1));
  return (
    <motion.div className="absolute top-0 left-0" style={{ x, y, rotate, scale, opacity }}>
      <FileGlyph kind={kind} size={44} />
    </motion.div>
  );
}

// ---------------------------------------------------------------- B · Snap
const B = { snap: 1.15, swap: 1.75, wipe: 2.35, mark: 2.75, tick: 3.55 };
const MESSY = "Messy".split("");
const JUMBLE = [
  { x: -60, y: -90, r: -24 }, { x: 40, y: 70, r: 18 }, { x: -30, y: -40, r: 32 }, { x: 70, y: 110, r: -14 }, { x: 20, y: -120, r: 26 },
];

function SnapScene({ t }: SceneProps) {
  const { portrait } = useCanvas();
  const big = portrait ? 210 : 300;
  const S = portrait ? 120 : 170;
  const wipe = useTransform(t, (v) => `inset(0 ${(1 - easeInOut(ramp(v, B.wipe, B.wipe + 0.5))) * 100}% 0 0)`);
  const messyY = useTransform(t, (v) => `${-easeInOut(ramp(v, B.swap, B.swap + 0.4)) * 45}%`);
  const messyO = useTransform(t, (v) => 1 - ramp(v, B.swap, B.swap + 0.18));
  const sortedY = useTransform(t, (v) => `${(1 - easeOut(ramp(v, B.swap + 0.2, B.swap + 0.6))) * 45}%`);
  const sortedO = useTransform(t, (v) => ramp(v, B.swap + 0.2, B.swap + 0.4));
  const words = ["Read.", "Review.", "Move."];
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative pb-[0.1em] font-display leading-none font-bold tracking-[-0.04em] text-[var(--ink)]" style={{ fontSize: big }}>
          <motion.div className="flex" style={{ y: messyY, opacity: messyO }}>
            {MESSY.map((ch, i) => <Jumble key={i} t={t} i={i} ch={ch} />)}
          </motion.div>
          <motion.div className="absolute inset-0 flex justify-center" style={{ y: sortedY, opacity: sortedO }}>
            Sorted<span className="text-[var(--accent)]">.</span>
          </motion.div>
        </div>
      </div>
      <motion.div className="absolute inset-0 bg-[var(--accent)]" style={{ clipPath: wipe }}>
        <div className="absolute inset-0 grid content-center justify-items-center gap-6">
          <Wordmark size={S} t={t} from={B.mark} color="var(--on-accent)" iconFrom={B.mark - 0.15} />
          <div className="flex gap-6 font-display font-bold tracking-[-0.02em] text-[var(--on-accent)]" style={{ fontSize: portrait ? 44 : 40 }}>
            {words.map((w, i) => <Tick key={w} t={t} at={B.tick + i * 0.22} word={w} />)}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Jumble({ t, i, ch }: { t: MotionValue<number>; i: number; ch: string }) {
  const j = JUMBLE[i];
  // A restless wobble while messy, then a snap into place with a small overshoot.
  const p = useTransform(t, (v) => {
    const q = ramp(v, B.snap + i * 0.05, B.snap + i * 0.05 + 0.35);
    return q === 0 ? 0 : 1 - Math.pow(1 - q, 3) * Math.cos(q * 6);
  });
  const x = useTransform([t, p] as const, ([v, q]: number[]) => (j.x + Math.sin(v * 5 + i) * 6) * (1 - q));
  const y = useTransform([t, p] as const, ([v, q]: number[]) => (j.y + Math.cos(v * 4 + i * 2) * 6) * (1 - q));
  const rotate = useTransform([t, p] as const, ([v, q]: number[]) => (j.r + Math.sin(v * 3 + i) * 4) * (1 - q));
  const appear = useTransform(t, (v) => easeOut(ramp(v, i * 0.07, i * 0.07 + 0.3)));
  return <motion.span className="inline-block" style={{ x, y, rotate, scale: appear }}>{ch}</motion.span>;
}

function Tick({ t, at, word }: { t: MotionValue<number>; at: number; word: string }) {
  const y = useTransform(t, (v) => `${(1 - easeOut(ramp(v, at, at + 0.4))) * 110}%`);
  return (
    <span className="inline-block overflow-hidden pb-[0.08em]">
      <motion.span className="inline-block" style={{ y }}>{word}</motion.span>
    </span>
  );
}

export const INTRO_A: SceneDef[] = [{ id: "intro-a", chapter: "Intro", dur: 5.4, Scene: GatherScene }];
export const INTRO_B: SceneDef[] = [{ id: "intro-b", chapter: "Intro", dur: 5.0, Scene: SnapScene }];

export const IntroA = () => <Film scenes={INTRO_A} chapters={false} label="Organizy intro: scattered files fly into a folder, the folder becomes the Organizy icon, and the name appears beside it with the line: a tidy Mac, one folder at a time." />;
export const IntroB = () => <Film scenes={INTRO_B} chapters={false} label="Organizy intro: the word Messy wobbles, snaps into order and becomes Sorted, a purple wipe crosses the screen, and the Organizy name appears with the words Read, Review, Move." />;
