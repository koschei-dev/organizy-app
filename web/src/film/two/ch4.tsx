import { ChevronDown, ChevronRight, Folder, GraduationCap, Lock, ShieldAlert } from "lucide-react";
import { motion, useTransform } from "motion/react";
import { easeInOut, easeOut, ramp, useBeat, useCanvas, type SceneProps } from "../Film";
import { AppIcon, At, Card, Dest, FileChip, FileGlyph, FolderGlyph, FOLDER, Pill, tickIcon, ZipGlyph } from "./bits";
import { Fly, Glow, Headline, lerp, pick, Pointer, pointerAt, Typed, type T, win } from "./kit";

/* ============================================================ 6. It learns: teach bar + switch */

function Switch({ t, on, scale = 1.7 }: { t: T; on: number; scale?: number }) {
  const p = useTransform(t, (v) => win(v, on, on + 0.22, easeOut));
  const X = useTransform(p, (q) => q * 11);
  const O = p;
  return (
    <span className="relative inline-block flex-none" style={{ width: 26 * scale, height: 15 * scale }}>
      <span className="absolute inset-0 rounded-full bg-[var(--mac-control-line)]" />
      <motion.span className="absolute inset-0 rounded-full bg-[var(--mac-tint)]" style={{ opacity: O }} />
      <motion.span className="absolute rounded-full bg-white" style={{ top: 1.5 * scale, left: 1.5 * scale, width: 12 * scale, height: 12 * scale, x: useTransform(X, (v) => v * scale), boxShadow: "0 1px 3px rgba(0,0,0,.3)" }} />
    </span>
  );
}

export function SceneLearn({ t, dur }: SceneProps) {
  const { W, portrait: P } = useCanvas();
  const out = dur - 0.45;
  const barW = pick(P, 1170, 664), barH = pick(P, 100, 218);
  const cx = W / 2, cy = pick(P, 440, 540);
  const barL = cx - barW / 2;
  const teachX = barL + barW - 28 - 116, teachY = pick(P, cy, cy + 66);
  const switchX = cx + 320 - 28 - 22 * 1.0, switchY = cy;
  const teachClick = 1.85, swClick = 3.5;
  const path: [number, number, number][] = [
    [0.4, teachX + 160, teachY + 190],
    [teachClick - 0.15, teachX, teachY + 4],
    [2.45, switchX - 100, switchY + 130],
    [swClick - 0.1, switchX - 6, switchY + 2],
    [dur - 0.3, switchX + 80, switchY + 120],
  ];
  const glow = useTransform(t, (v) => win(v, swClick, swClick + 0.5));
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Glow t={t} x={W / 2} y={pick(P, 190, 170)} size={pick(P, 900, 760)} out={out} />
      <At x={W / 2} y={pick(P, 155, 160)} className="z-10">
        <Headline t={t} still size={pick(P, 112, 90)} lines={["It *learns*", "your folders."]} out={out} />
      </At>

      <Fly t={t} x={cx} y={cy} at={-0.2} dur={0.7} out={teachClick + 0.25} outDur={0.45} from={{ y: 50 }} to={{ y: -60, s: 0.96 }} z={5}>
        <Card className="relative bg-[var(--mac-tint-soft)]" style={{ width: barW, height: barH }}>
          <div className={P ? "grid h-full content-center gap-4 px-7" : "flex h-full items-center gap-4 px-7"}>
            <div className="flex items-center gap-3">
              <GraduationCap size={32} className="flex-none text-[var(--mac-tint)]" />
              <span className="text-[24px] leading-[1.3]">Always send files like <b>paella_valenciana.txt</b> to <b>Recipes</b>?</span>
            </div>
            <div className={`flex gap-3 ${P ? "justify-end" : "ml-auto"}`}>
              <span className="mac-btn !h-[50px] !rounded-[10px] justify-center text-[22px]" style={{ width: 120 }}>Not Now</span>
              <span className="mac-btn primary !h-[50px] !rounded-[10px] justify-center text-[22px] font-medium" style={{ width: 232 }}>Teach Organizy…</span>
            </div>
          </div>
        </Card>
      </Fly>

      <Fly t={t} x={cx} y={cy} at={2.1} dur={0.55} out={out} from={{ y: 40, s: 0.94 }} z={5}>
        <Card className="relative flex items-center gap-4 px-7" style={{ width: 640, height: 112 }}>
          <motion.span className="pointer-events-none absolute -inset-1 rounded-[20px]" style={{ opacity: glow, boxShadow: "0 0 0 3px var(--accent), 0 0 40px color-mix(in oklab, var(--accent) 45%, transparent)" }} />
          <span className="text-[30px] font-medium">Learn from approved moves</span>
          <span className="ml-auto"><Switch t={t} on={swClick} /></span>
        </Card>
      </Fly>
      <Pointer t={t} path={path} clicks={[teachClick, swClick]} off={out} />
    </div>
  );
}

/* ============================================================ 6. Straight to Recipes */

export function SceneStraight({ t, dur }: SceneProps) {
  const { W, portrait: P } = useCanvas();
  const out = dur - 0.4;
  const cw = pick(P, 900, 664), cy = pick(P, 470, 560), L = W / 2 - cw / 2;
  const chipX = L + pick(P, 44, 38), destW = pick(P, 380, 200);
  const destX = L + cw - 30 - destW / 2;
  const fly = (v: number) => win(v, 0.85, 1.55, easeInOut);
  const GX = useTransform(t, (v) => lerp(chipX + 14, destX - destW / 2 + 40, fly(v)));
  const GY = useTransform(t, (v) => cy - Math.sin(Math.PI * fly(v)) * 50);
  const GS = useTransform(t, (v) => lerp(1, 0.55, fly(v)));
  const GO = useTransform(t, (v) => (v < 0.82 ? 0 : 1 - win(v, 1.45, 1.6, (x) => x)));
  const flash = useTransform(t, (v) => Math.sin(Math.PI * win(v, 1.5, 2.1, (x) => x)));
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Glow t={t} x={W / 2} y={pick(P, 180, 190)} size={pick(P, 900, 760)} out={out} />
      <At x={W / 2} y={pick(P, 160, 190)} className="z-10">
        <Headline t={t} size={pick(P, 118, 106)} lines={["Straight to", "*Recipes.*"]} out={out} at={-0.35} />
      </At>
      <Fly t={t} x={W / 2} y={cy} at={0.0} dur={0.6} out={out} from={{ y: 50 }} z={4}>
        <Card className={`relative flex items-center ${P ? "px-6" : "px-8"}`} style={{ width: cw, height: 128 }}>
          <FileChip kind="txt" name="tortilla_de_patatas.txt" size={pick(P, 26, 20)} />
          <span className="ml-auto flex items-center gap-3">
            <span className="text-[28px] text-[var(--mac-text-2)]">→</span>
            <span className="relative">
              <Dest size={pick(P, 26, 22)} width={destW}><b className="font-semibold text-[var(--mac-tint-ink)]">Recipes</b></Dest>
              <motion.span className="pointer-events-none absolute -inset-[4px] rounded-[14px] border-[3px] border-[var(--accent)]" style={{ opacity: flash }} />
            </span>
          </span>
        </Card>
      </Fly>
      <motion.div className="absolute z-10" style={{ left: 0, top: 0, x: GX, y: GY, scale: GS, opacity: GO, translate: "-50% -50%", filter: "drop-shadow(0 8px 14px rgba(0,0,0,.2))" }}>
        <FileGlyph kind="txt" size={44} />
      </motion.div>
      <Fly t={t} x={W / 2} y={cy + 105} at={1.6} dur={0.5} out={out} from={{ y: 16 }} z={5}>
        <Pill size={pick(P, 25, 22)} icon={<GraduationCap size={26} className="text-[var(--accent)]" />}>similar to 1 file filed here (71%)</Pill>
      </Fly>
    </div>
  );
}

/* ============================================================ 6. Learn from a sorted folder */

export function SceneSorted({ t, dur }: SceneProps) {
  const { W, portrait: P } = useCanvas();
  const out = dur - 0.45;
  const treeX = pick(P, 380, W / 2), treeY = pick(P, 440, 480);
  const icoX = pick(P, 900, W / 2), icoY = pick(P, 440, 720);
  const sub = ["Invoices", "Recipes", "Taxes"];
  const pulse = useTransform(t, (v) => 1 + 0.1 * Math.sin(Math.PI * win(v, 1.7, 2.1, (x) => x)) + 0.08 * Math.sin(Math.PI * win(v, 2.3, 2.7, (x) => x)));
  const ring = useTransform(t, (v) => win(v, 1.7, 2.6, (x) => x));
  const ringS = useTransform(ring, (r) => 1 + r * 0.5);
  const ringO = useTransform(ring, (r) => (r > 0 && r < 1 ? 1 - r : 0));
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Glow t={t} x={W / 2} y={pick(P, 170, 170)} size={pick(P, 900, 760)} out={out} />
      <At x={W / 2} y={pick(P, 160, 175)} className="z-10">
        <Headline t={t} size={pick(P, 104, 92)} lines={["Point it at a", "*sorted* folder."]} out={out} at={-0.35} />
      </At>
      <Fly t={t} x={treeX} y={treeY} at={0.0} dur={0.6} out={out} from={{ x: pick(P, -60, 0), y: pick(P, 0, 50) }} z={4}>
        <Card className="!rounded-[18px] p-5" style={{ width: pick(P, 420, 480) }}>
          <div className="flex items-center gap-3 text-[26px] font-semibold"><FolderGlyph size={32} /> Sorted</div>
          {sub.map((s, i) => (
            <Row key={s} t={t} i={i} name={s} />
          ))}
        </Card>
      </Fly>
      {[0, 1, 2].map((i) => <Dot key={i} t={t} i={i} x0={treeX + pick(P, 210, 0)} y0={treeY + pick(P, 0, 120)} x1={icoX} y1={icoY} />)}
      <Fly t={t} x={icoX} y={icoY} at={0.3} dur={0.6} out={out} from={{ s: 0.6 }} z={4}>
        <motion.div className="relative" style={{ scale: pulse }}>
          <motion.span className="absolute inset-0 rounded-[26px] border-[3px] border-[var(--accent)]" style={{ scale: ringS, opacity: ringO }} />
          <AppIcon size={pick(P, 130, 120)} />
        </motion.div>
      </Fly>
      <Fly t={t} x={W / 2} y={pick(P, 620, 860)} at={2.2} dur={0.5} out={out} from={{ y: 20 }} z={5}>
        <Pill size={pick(P, 26, 24)} icon={<Lock size={26} className="text-[var(--accent)]" />}>It all stays on your Mac</Pill>
      </Fly>
    </div>
  );
}

function Row({ t, i, name }: { t: T; i: number; name: string }) {
  const hi = useTransform(t, (v) => Math.sin(Math.PI * win(v, 0.8 + i * 0.35, 1.35 + i * 0.35, (x) => x)));
  return (
    <div className="relative mt-3 flex items-center gap-3 rounded-[10px] py-2 pl-9 text-[24px]">
      <motion.span className="absolute inset-0 rounded-[10px]" style={{ opacity: hi, background: "color-mix(in oklab, var(--accent) 16%, transparent)" }} />
      <FolderGlyph size={26} /><span className="relative">{name}</span>
    </div>
  );
}

function Dot({ t, i, x0, y0, x1, y1 }: { t: T; i: number; x0: number; y0: number; x1: number; y1: number }) {
  const a = 0.95 + i * 0.35;
  const p = (v: number) => win(v, a, a + 0.7, easeInOut);
  const X = useTransform(t, (v) => lerp(x0, x1, p(v)));
  const Y = useTransform(t, (v) => lerp(y0, y1, p(v)) - Math.sin(Math.PI * p(v)) * 40);
  const O = useTransform(t, (v) => (v < a ? 0 : 1 - win(v, a + 0.55, a + 0.7, (x) => x)));
  return <motion.span className="absolute z-10 size-[16px] rounded-full bg-[var(--accent)]" style={{ left: 0, top: 0, x: X, y: Y, opacity: O, translate: "-50% -50%" }} />;
}

/* ============================================================ 7. Install */

export function SceneInstall({ t, dur }: SceneProps) {
  const { W, portrait: P } = useCanvas();
  const out = dur - 0.4;
  const facts: [string, number, number][] = pick(P,
    [["Free", 450, 470], ["macOS 14 Sonoma or later", 790, 470], ["No account", 330, 550], ["No ads", 560, 550], ["Nothing leaves your Mac", 880, 550]],
    [["Free", 360, 530], ["macOS 14 Sonoma or later", 360, 612], ["No account", 360, 694], ["No ads", 360, 776], ["Nothing leaves your Mac", 360, 858]]);
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Glow t={t} x={W / 2} y={pick(P, 250, 260)} size={pick(P, 980, 800)} out={out} />
      <At x={W / 2} y={pick(P, 245, 260)} className="z-10">
        <Headline t={t} still size={pick(P, 140, 120)} lines={["Install in", "a *minute.*"]} out={out} />
      </At>
      {facts.map(([n, x, y], i) => (
        <Fly key={n} t={t} x={x} y={y} at={-0.1 + i * 0.1} dur={0.5} out={out + i * 0.03} from={{ y: 26, s: 0.92 }} z={5}>
          <Pill size={pick(P, 24, 24)} icon={tickIcon(22)}>{n}</Pill>
        </Fly>
      ))}
    </div>
  );
}

function Dots({ t, n, out }: { t: T; n: number; out: number }) {
  const { W } = useCanvas();
  return (
    <Fly t={t} x={W / 2} y={56} at={-0.3} dur={0.4} out={out} z={5}>
      <div className="flex items-center gap-3">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`h-[10px] rounded-full ${i === n ? "w-[44px] bg-[var(--accent)]" : "w-[10px] bg-[color-mix(in_oklab,var(--muted)_40%,transparent)]"}`} />
        ))}
      </div>
    </Fly>
  );
}

export function SceneDownload({ t, dur }: SceneProps) {
  const { W, portrait: P } = useCanvas();
  const out = dur - 0.4;
  const zx = pick(P, 330, 170), fx = pick(P, 920, 550), y = pick(P, 480, 620);
  const rest: [number, number] = [zx, y - 40];
  const path: [number, number, number][] = [
    [0.4, zx + 220, y + 190],
    [1.15, rest[0], rest[1]],
    [1.2, rest[0], rest[1]],
    [1.95, fx, y],
    [dur - 0.2, fx + 90, y + 150],
  ];
  const IX = useTransform(t, (v) => (v < 1.2 ? rest[0] : pointerAt(v, path)[0]));
  const IY = useTransform(t, (v) => (v < 1.2 ? rest[1] : pointerAt(v, path)[1]));
  const IS = useTransform(t, (v) => win(v, 0.6, 1.0, easeOut) * (1 - 0.7 * win(v, 1.95, 2.25, (x) => x)) * (1 + 0.08 * win(v, 1.2, 1.4)));
  const IO = useTransform(t, (v) => Math.min(1, win(v, 0.6, 0.8, (x) => x)) * (1 - win(v, 2.15, 2.3, (x) => x)));
  const bounce = useTransform(t, (v) => 1 + 0.12 * Math.sin(Math.PI * win(v, 2.1, 2.5, (x) => x)));
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Glow t={t} x={W / 2} y={pick(P, 220, 260)} size={pick(P, 900, 760)} out={out} />
      <Dots t={t} n={0} out={out} />
      <At x={W / 2} y={pick(P, 190, 215)} className="z-10">
        <Headline t={t} size={pick(P, 130, 118)} lines={pick(P, ["*Download* it."], ["*Download*", "it."])} out={out} at={-0.35} />
      </At>
      <Fly t={t} x={zx} y={y - 110} at={0.0} dur={0.5} out={out} from={{ y: 20 }} z={5}>
        <Pill size={22}>GitHub</Pill>
      </Fly>
      <Fly t={t} x={zx} y={y + 20} at={0.05} dur={0.6} out={out} from={{ y: 50 }} z={3}>
        <div style={{ filter: "drop-shadow(0 12px 18px rgba(0,0,0,.18))" }}><ZipGlyph size={84} /></div>
      </Fly>
      <Fly t={t} x={fx} y={y} at={0.2} dur={0.6} out={out} from={{ y: 50 }} z={3}>
        <motion.div className="grid justify-items-center gap-2" style={{ scale: bounce }}>
          <Folder size={140} strokeWidth={1.1} style={{ color: FOLDER, fill: FOLDER, filter: "drop-shadow(0 12px 18px rgba(30,60,140,.28))" }} />
          <span className="rounded-md bg-[var(--mac-select)] px-3 py-[2px] text-[24px] text-[var(--mac-text)]" style={{ fontFamily: "var(--font-mac)" }}>Applications</span>
        </motion.div>
      </Fly>
      <motion.div className="absolute z-30" style={{ left: 0, top: 0, x: IX, y: IY, scale: IS, opacity: IO, translate: "-50% -50%", filter: "drop-shadow(0 10px 16px rgba(0,0,0,.25))" }}>
        <AppIcon size={96} />
      </motion.div>
      <Pointer t={t} path={path} clicks={[1.2]} off={out} />
    </div>
  );
}



export function SceneOpen({ t, dur }: SceneProps) {
  const { W, portrait: P } = useCanvas();
  const out = dur - 0.4;
  const crumbs = ["System Settings", "Privacy & Security", "Open Anyway"];
  const pos = (i: number): [number, number] => pick(P, [[W / 2 - 310, 440], [W / 2 + 0, 440], [W / 2 + 290, 440]][i] as [number, number], [W / 2, 420 + i * 92] as [number, number]);
  const clickT = 2.0;
  const n = useBeat(t, [clickT + 0.05]);
  const path: [number, number, number][] = [
    [0.8, pos(2)[0] + 160, pos(2)[1] + 160],
    [clickT - 0.1, pos(2)[0] + 14, pos(2)[1] + 6],
    [dur - 0.2, pos(2)[0] + 60, pos(2)[1] + 90],
  ];
  const press = useTransform(t, (v) => 1 - 0.06 * Math.sin(Math.PI * win(v, clickT, clickT + 0.2, (x) => x)));
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Glow t={t} x={W / 2} y={pick(P, 220, 260)} size={pick(P, 900, 760)} out={out} />
      <Dots t={t} n={1} out={out} />
      <At x={W / 2} y={pick(P, 190, 215)} className="z-10">
        <Headline t={t} size={pick(P, 130, 118)} lines={pick(P, ["*Open* it once."], ["*Open*", "it once."])} out={out} at={-0.35} />
      </At>
      {crumbs.map((c, i) => (
        <Fly key={c} t={t} x={pos(i)[0]} y={pos(i)[1]} at={0.05 + i * 0.35} dur={0.5} out={out} from={{ y: 26, s: 0.92 }} z={5}>
          {i < 2 ? (
            <span className="relative">
              <Pill size={pick(P, 24, 24)} className="justify-center" >{c}</Pill>
              {i < 2 && (P ? <ChevronDown size={30} className="absolute top-full left-1/2 -translate-x-1/2 translate-y-[6px] text-[var(--muted)]" /> : <ChevronRight size={30} className="absolute top-1/2 left-full -translate-y-1/2 translate-x-[6px] text-[var(--muted)]" />)}
            </span>
          ) : (
            <motion.span
              className="inline-flex items-center gap-3 rounded-full bg-[var(--accent)] px-7 font-medium whitespace-nowrap text-[var(--on-accent)]"
              style={{ height: 50 * 1.0 + 4, fontSize: 24, scale: press }}
            >
              {n > 0 && <span className="grid size-[26px] place-items-center rounded-full bg-[var(--on-accent)] text-[var(--accent)]"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M5 12l5 5 9-10" /></svg></span>}
              {c}
            </motion.span>
          )}
        </Fly>
      ))}
      <Fly t={t} x={W / 2} y={pick(P, 560, 760)} at={0.6} dur={0.55} out={out} from={{ y: 24 }} z={4}>
        <Card className="flex items-center gap-4 !rounded-[18px] px-6 py-4" style={{ width: pick(P, 760, 620) }}>
          <ShieldAlert size={36} className="flex-none text-[var(--mac-orange)]" />
          <span className="text-[24px] leading-[1.3]">macOS blocks it the first time, because it isn’t notarized.</span>
        </Card>
      </Fly>
      <Pointer t={t} path={path} clicks={[clickT]} off={out} />
    </div>
  );
}

export function SceneCheck({ t, dur }: SceneProps) {
  const { W, portrait: P } = useCanvas();
  const out = dur - 0.4;
  const cmd = "shasum -a 256 ~/Downloads/Organizy-*.zip";
  const bar = useTransform(t, (v) => win(v, 1.85, 2.2));
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Glow t={t} x={W / 2} y={pick(P, 220, 240)} size={pick(P, 900, 760)} out={out} />
      <Dots t={t} n={2} out={out} />
      <At x={W / 2} y={pick(P, 195, 225)} className="z-10">
        <Headline t={t} size={pick(P, 116, 96)} lines={["*Check* it", "if you like."]} out={out} at={-0.35} />
      </At>
      <Fly t={t} x={W / 2} y={pick(P, 510, 590)} at={0.05} dur={0.6} out={out} from={{ y: 50 }} z={4}>
        <div className="rounded-[18px] p-6" style={{ width: pick(P, 900, 664), background: "var(--inv-bg)", color: "var(--inv-ink)", boxShadow: "var(--mac-shadow)" }}>
          <div className="mb-4 flex gap-2"><i className="size-3 rounded-full bg-[#FF5F57]" /><i className="size-3 rounded-full bg-[#FEBC2E]" /><i className="size-3 rounded-full bg-[#28C840]" /></div>
          <div className="mono whitespace-nowrap" style={{ fontFamily: "var(--font-macmono)", fontSize: pick(P, 24, 21) }}>
            <span style={{ opacity: 0.6 }}>$ </span><Typed t={t} text={cmd} at={0.4} cps={30} />
          </div>
          <motion.div className="mt-5 grid gap-2" style={{ opacity: bar }}>
            <span className="h-[12px] rounded-full" style={{ background: "var(--inv-ink)", opacity: 0.28, width: "92%" }} />
            <span className="h-[12px] rounded-full" style={{ background: "var(--inv-ink)", opacity: 0.28, width: "38%" }} />
          </motion.div>
        </div>
      </Fly>
      <Fly t={t} x={W / 2} y={pick(P, 660, 790)} at={2.1} dur={0.5} out={out} from={{ y: 20 }} z={5}>
        <Pill size={pick(P, 25, 23)} icon={tickIcon(22)}>Each release lists a SHA-256</Pill>
      </Fly>
    </div>
  );
}

export function SceneWordmark({ t }: SceneProps) {
  const { W, H, portrait: P } = useCanvas();
  const fs = pick(P, 224, 132);
  const clip = useTransform(t, (v) => `inset(0 0 ${(1 - win(v, -1.0, 0.1, easeInOut)) * 100}% 0)`);
  const imgS = useTransform(t, (v) => 1.12 - 0.12 * win(v, -1.0, 0.1, easeInOut) + 0.02 * ramp(v, 0, 3.2));
  const ry = useTransform(t, (v) => `${(1 - win(v, -0.8, 0.3)) * 110}%`);
  const ro = useTransform(t, (v) => win(v, -0.8, 0.0, (x) => x));
  const drift = useTransform(t, (v) => 1 + 0.025 * ramp(v, 0, 3.2));
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Glow t={t} x={W / 2} y={pick(P, H / 2 - 20, H / 2 - 20)} size={pick(P, 1100, 820)} at={-1.2} />
      <At x={W / 2} y={pick(P, H / 2 - 20, H / 2 - 20)} className="z-10">
        <motion.h2 aria-hidden className="m-0 inline-flex items-baseline font-display font-bold tracking-[-0.04em] leading-none text-[var(--ink)]" style={{ fontSize: fs, scale: drift }}>
          <motion.span className="mr-[0.02em] inline-block size-[0.72em] translate-y-[0.02em] overflow-hidden" style={{ clipPath: clip }}>
            <motion.img src="/organizy-app/icon-512.png" alt="" width={512} height={512} className="size-full object-cover" style={{ scale: imgS }} />
          </motion.span>
          <span className="-mb-[0.28em] overflow-hidden pb-[0.28em]">
            <motion.span className="inline-block" style={{ y: ry, opacity: ro }}>rganizy</motion.span>
          </span>
        </motion.h2>
      </At>
      <Fly t={t} x={W / 2} y={pick(P, H / 2 + 190, H / 2 + 150)} at={-0.2} dur={0.6} from={{ y: 16 }} z={5}>
        <span className="text-[var(--muted)]" style={{ fontSize: pick(P, 30, 26) }}>Free for macOS 14 Sonoma or later.</span>
      </Fly>
    </div>
  );
}
