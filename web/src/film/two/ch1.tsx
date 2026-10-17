import { ArrowRight, Calendar, Compass, Folder, Mail, Music } from "lucide-react";
import { motion, useTransform } from "motion/react";
import { easeInOut, ramp, useBeat, useCanvas, type SceneProps } from "../Film";
import { AppIcon, At, Card, Dest, FileGlyph, FolderGlyph, FOLDER } from "./bits";
import { Bg, easeIn, Fly, Glow, Headline, lerp, Marquee, pick, Pointer, Punch, Swap, type T, win } from "./kit";

/* ============================================================ 1. Messy folder: title */

const KINDS = ["pdf", "img", "doc", "sheet", "txt"] as const;
const SWIRL = Array.from({ length: 18 }, (_, i) => ({
  th0: (i / 18) * Math.PI * 2 + (i % 3) * 0.35,
  rf: 0.7 + (((i * 7) % 11) / 11) * 0.4,
  w: (i % 2 ? 1 : -1) * (0.16 + (i % 5) * 0.05),
  kind: KINDS[(i * 3) % 5],
  size: 38 + ((i * 5) % 4) * 9,
  spin: ((i % 4) - 1.5) * 14,
}));

function Swirler({ t, i, end }: { t: T; i: number; end: number }) {
  const { W, H } = useCanvas();
  const g = SWIRL[i];
  const cx = W / 2, cy = H / 2, rx = W * 0.5, ry = H * 0.5;
  const calc = (v: number) => {
    const s = ramp(v, end - 1.3, end - 0.25);
    const e = easeInOut(s);
    const th = g.th0 + g.w * v + 3.6 * easeIn(s) * (g.w > 0 ? 1 : -1);
    const r = g.rf * (1 - e * 0.98);
    return { x: cx + Math.cos(th) * rx * r, y: cy + Math.sin(th) * ry * r, s, e };
  };
  const X = useTransform(t, (v) => calc(v).x);
  const Y = useTransform(t, (v) => calc(v).y);
  const R = useTransform(t, (v) => g.spin * v + calc(v).e * 200);
  const S = useTransform(t, (v) => 1 - 0.55 * calc(v).e);
  const O = useTransform(t, (v) => 1 - win(calc(v).s, 0.8, 1, (x) => x));
  return (
    <motion.div className="absolute" style={{ left: 0, top: 0, x: X, y: Y, rotate: R, scale: S, opacity: O, translate: "-50% -50%", filter: "drop-shadow(0 8px 14px rgba(0,0,0,.16))" }}>
      <FileGlyph kind={g.kind} size={g.size} />
    </motion.div>
  );
}

export function SceneTitle({ t, dur }: SceneProps) {
  const { W, H, portrait: P } = useCanvas();
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Glow t={t} x={W / 2} y={H / 2} size={pick(P, 980, 800)} />
      {SWIRL.map((_, i) => <Swirler key={i} t={t} i={i} end={dur} />)}
      <At x={W / 2} y={H / 2} className="z-10">
        <Headline
          t={t}
          still
          size={pick(P, 136, 104)}
          lines={pick(P, ["What happens", "to a *messy*", "folder?"], ["What", "happens to", "a *messy*", "folder?"])}
        />
      </At>
    </div>
  );
}

/* ============================================================ 1. Messy folder: choose or drop */

function BigFolder({ label, size = 130 }: { label: string; size?: number }) {
  return (
    <div className="grid justify-items-center gap-2">
      <Folder size={size} strokeWidth={1.1} style={{ color: FOLDER, fill: FOLDER, filter: "drop-shadow(0 12px 18px rgba(30,60,140,.28))" }} />
      <span className="rounded-md bg-[var(--mac-select)] px-3 py-[2px] text-[24px] text-[var(--mac-text)]" style={{ fontFamily: "var(--font-mac)" }}>{label}</span>
    </div>
  );
}

const DOCK_ICONS = [Compass, Mail, null, Music, Calendar] as const;

export function SceneDrop({ t, dur }: SceneProps) {
  const { W, portrait: P } = useCanvas();
  const cx = W / 2;
  const dockY = pick(P, 640, 850);
  const folderY = pick(P, 372, 480);
  const btnY = pick(P, 520, 640);
  const hy = pick(P, 165, 175);
  const grabT = 1.95, dropT = 3.0;
  void dur;

  // Downloads: sits above the button, is picked up by the pointer, and sinks into the Dock icon.
  const fp = (v: number) => {
    const g = easeInOut(ramp(v, grabT, dropT));
    return { y: lerp(folderY, dockY - 10, g), s: lerp(1, 0.32, win(v, dropT - 0.35, dropT + 0.05, easeIn)), o: 1 - win(v, dropT, dropT + 0.12, (x) => x), g };
  };
  const FY = useTransform(t, (v) => fp(v).y);
  const FS = useTransform(t, (v) => fp(v).s * (1 + 0.05 * Math.sin(Math.PI * win(v, grabT - 0.1, grabT + 0.2, (x) => x))));
  const FO = useTransform(t, (v) => fp(v).o * win(v, 1.12, 1.4));
  const FR = useTransform(t, (v) => -6 * Math.sin(Math.PI * fp(v).g));

  // Desktop: slides in from the side and is pulled in too.
  const dsk = (v: number) => {
    const a = win(v, 2.5, 3.0);
    const p = win(v, 3.35, 3.85, easeInOut);
    return { x: lerp(cx + pick(P, 330, 230), cx, p), y: lerp(folderY + 20, dockY - 10, p), a, p };
  };
  const DX = useTransform(t, (v) => dsk(v).x);
  const DY = useTransform(t, (v) => dsk(v).y + (1 - dsk(v).a) * 40);
  const DS = useTransform(t, (v) => lerp(1, 0.32, win(v, 3.55, 3.9, easeIn)));
  const DO = useTransform(t, (v) => dsk(v).a * (1 - win(v, 3.8, 3.92, (x) => x)));

  // Dock icon bounces twice, once per folder.
  const bounce = (v: number) => -34 * Math.sin(Math.PI * win(v, dropT - 0.05, dropT + 0.5, (x) => x)) - 26 * Math.sin(Math.PI * win(v, 3.85, 4.3, (x) => x));
  const IY = useTransform(t, (v) => bounce(v));
  const IS = useTransform(t, (v) => 1 + 0.12 * Math.sin(Math.PI * win(v, dropT, dropT + 0.3, (x) => x)));

  // The Choose Folder button gets pressed at 1.1.
  const BS = useTransform(t, (v) => 1 - 0.06 * Math.sin(Math.PI * win(v, 1.08, 1.3, (x) => x)));

  const path: [number, number, number][] = [
    [0.15, cx + pick(P, 420, 250), btnY + 150],
    [1.05, cx + 40, btnY + 14],
    [1.5, cx + 90, folderY + 70],
    [grabT, cx + 8, folderY + 8],
    [dropT, cx + 8, dockY - 6],
    [3.5, cx + pick(P, 190, 120), dockY - 150],
    [dur, cx + pick(P, 260, 160), dockY - 210],
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      <Glow t={t} x={cx} y={pick(P, 300, 300)} size={pick(P, 900, 760)} />
      <At x={cx} y={hy} className="z-10">
        <Headline t={t} lines={pick(P, ["{0} a folder."], ["{0}", "a folder."])} size={pick(P, 124, 124)} slots={[<Swap key="s" t={t} words={["Choose", "Drop"]} marks={[1.9]} />]} at={-0.4} />
      </At>

      {/* Choose Folder… */}
      <Fly t={t} x={cx} y={btnY} at={0.1} dur={0.55} out={1.55} from={{ y: 40 }} to={{ y: 60 }} z={5}>
        <motion.div style={{ scale: BS }}>
          <Card className="flex items-center gap-4 !rounded-[18px] px-8" style={{ height: 78 }}>
            <FolderGlyph size={34} />
            <span className="whitespace-nowrap text-[30px] font-medium">Choose Folder…</span>
          </Card>
        </motion.div>
      </Fly>

      {/* Downloads */}
      <motion.div className="absolute z-20" style={{ left: cx, top: 0, y: FY, scale: FS, opacity: FO, rotate: FR, translate: "-50% -50%" }}>
        <BigFolder label="Downloads" />
      </motion.div>
      {/* Desktop */}
      <motion.div className="absolute z-20" style={{ left: 0, top: 0, x: DX, y: DY, scale: DS, opacity: DO, translate: "-50% -50%" }}>
        <BigFolder label="Desktop" />
      </motion.div>

      {/* Dock */}
      <Fly t={t} x={cx} y={dockY} at={1.5} dur={0.7} from={{ y: 150 }} z={8}>
        <div className="flex items-end gap-4 rounded-[30px] border border-[var(--line)] bg-[var(--bg)] p-4" style={{ boxShadow: "var(--mac-shadow)" }}>
          {DOCK_ICONS.map((Ic, i) =>
            Ic ? (
              <span key={i} className="grid size-[80px] place-items-center rounded-[19px] bg-[var(--surface-2)] text-[var(--muted)]"><Ic size={36} strokeWidth={1.6} /></span>
            ) : (
              <motion.span key={i} className="relative block size-[80px]" style={{ y: IY, scale: IS, transformOrigin: "50% 100%" }}>
                <AppIcon size={80} />
              </motion.span>
            ),
          )}
        </div>
      </Fly>

      <Pointer t={t} path={path} clicks={[1.1]} />
    </div>
  );
}

/* ============================================================ 2. It reads: the signals */

function Tag({ label, active }: { label: string; active: boolean }) {
  return (
    <span className="relative inline-grid h-[54px] place-items-center rounded-full border border-[var(--line)] bg-[var(--bg)] px-6 text-[24px] font-medium text-[var(--ink)]">
      {label}
      <motion.span
        className="absolute inset-0 grid place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)]"
        animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.92 }}
        transition={{ duration: 0.25 }}
      >
        {label}
      </motion.span>
    </span>
  );
}

/* ============================================================ 1. Messy folder: the usual suspects (marquee) */

export function SceneSuspects({ t }: SceneProps) {
  const { W, portrait: P } = useCanvas();
  const size = pick(P, 300, 236);
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Bg tone="inv" />
      <Marquee t={t} tone="inv" y={pick(P, 195, 330)} size={size} speed={pick(P, 300, 240)} text="Downloads  Downloads  Downloads" x0={0} />
      <Marquee t={t} tone="inv" outline y={pick(P, 520, 570)} size={size} speed={pick(P, 300, 240)} dir={-1} x0={pick(P, -1500, -1250)} text="Desktop  Desktop  Desktop  Desktop" />
      <Fly t={t} x={W / 2} y={pick(P, 360, 450)} at={0.3} dur={0.55} from={{ s: 0.6, r: -10 }} to={{}} z={5}>
        <span
          className="inline-flex items-center gap-3 rounded-full px-8 font-medium whitespace-nowrap"
          style={{ height: 76, fontSize: 34, background: "var(--bg)", color: "var(--ink)", boxShadow: "0 18px 40px -12px rgba(0,0,0,.45)", transform: "rotate(-3deg)" }}
        >
          <FolderGlyph size={36} /> The usual suspects
        </span>
      </Fly>
    </div>
  );
}

/* ============================================================ 2. It reads: punch word */

export function SceneReadPunch({ t }: SceneProps) {
  const { W, H, portrait: P } = useCanvas();
  const kinds = ["pdf", "doc", "txt"] as const;
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Bg tone="accent" />
      <Punch t={t} word="Read." size={pick(P, 470, 250)} tone="accent" x={W / 2} y={H / 2} />
      {kinds.map((k, i) => (
        <Fly key={k} t={t} x={pick(P, [250, 640, 1030][i], [150, 360, 570][i])} y={pick(P, [150, 600, 200][i], [200, 760, 300][i])} at={0.05 + i * 0.12} dur={0.5} from={{ y: -120, r: (i - 1) * 25 }} float={4} phase={i * 2} z={4}>
          <div style={{ filter: "drop-shadow(0 14px 18px rgba(0,0,0,.3))" }}><FileGlyph kind={k} size={pick(P, 84, 70)} /></div>
        </Fly>
      ))}
    </div>
  );
}

/* ============================================================ 2. It reads: split screen */

export function SceneReads({ t }: SceneProps) {
  const { W, portrait: P } = useCanvas();
  const n = useBeat(t, [0.8, 1.6, 2.4]);
  const panelH = pick(P, 720, 470), panelW = pick(P, 640, W);
  const cardX = pick(P, 960, W / 2);
  const cardY = pick(P, 290, 655);
  const scan = useTransform(t, (v) => `${((((v + 0.02) % 0.8) / 0.8) * 100).toFixed(1)}%`);
  const tagsY = pick(P, 505, 835);
  const labels = ["Name", "Type", "Size", "Inside"];
  const tagX = (i: number) => cardX + (i - 1.5) * pick(P, 124, 150);
  const slide = useTransform(t, (v) => `${-(1 - win(v, -0.9, 0.2, easeInOut)) * 100}%`);
  const slideX = useTransform(t, (v) => `${-(1 - win(v, -0.9, 0.2, easeInOut)) * 100}%`);
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div className="absolute top-0 left-0 overflow-hidden" style={{ width: panelW, height: panelH, background: "var(--inv-bg)", x: P ? 0 : slideX, y: P ? slide : 0 }}>
        <At x={pick(P, 56, W / 2)} y={pick(P, 360, 235)} left={!P}>
          <Headline
            t={t} still tone="inv" align={P ? "center" : "left"} size={pick(P, 124, 120)} lines={["It reads", "{0}"]}
            slots={[<Swap key="s" t={t} tone="inv" words={["names.", "types.", "sizes.", "contents."]} marks={[0.8, 1.6, 2.4]} />]}
          />
        </At>
      </motion.div>

      <Fly t={t} x={cardX} y={cardY} at={-0.2} dur={0.8} from={{ x: pick(P, 120, 0), y: pick(P, 0, 80), r: 3 }} z={5}>
        <Card className="relative overflow-hidden" style={{ width: pick(P, 420, 460), height: pick(P, 270, 280) }}>
          <div className="grid h-full place-items-center content-center gap-5">
            <FileGlyph kind="pdf" size={104} />
            <span className="mono text-[24px]">factura_luz_sept.pdf</span>
          </div>
          <motion.div
            className="pointer-events-none absolute inset-x-0 h-[3px] bg-[var(--accent)]"
            style={{ top: scan, boxShadow: "0 0 24px 6px color-mix(in oklab, var(--accent) 40%, transparent)" }}
          />
        </Card>
      </Fly>
      {labels.map((l, i) => (
        <Fly key={l} t={t} x={tagX(i)} y={tagsY} at={-0.1 + i * 0.07} dur={0.5} from={{ y: 30, s: 0.9 }} z={6}>
          <Tag label={l} active={n === i} />
        </Fly>
      ))}
      {["English", "Español"].map((l, i) => (
        <Fly key={l} t={t} x={cardX + (i - 0.5) * pick(P, 150, 170)} y={pick(P, 590, 910)} at={1.9 + i * 0.18} dur={0.5} from={{ y: 24, s: 0.9 }} z={6}>
          <span className="inline-flex h-[48px] items-center rounded-full border border-[var(--accent)] px-5 text-[22px] font-medium text-[var(--accent-ink)]">{l}</span>
        </Fly>
      ))}
    </div>
  );
}

/* ============================================================ 2. It reads: reasons */

const ROWS = [
  { name: "factura_luz_sept.pdf", kind: "pdf", dest: "Invoices & Receipts", reason: "content mentions “total a pagar”" },
  { name: "Alex_Kim_CV.docx", kind: "doc", dest: "Resumes & CVs", reason: "name mentions “CV”" },
  { name: "tortilla_de_patatas.txt", kind: "txt", dest: "Recipes", reason: "similar to 1 file filed here (71%)" },
] as const;

function Reason({ text, size }: { text: string; size: number }) {
  const parts = text.split(/(“[^”]+”|\(71%\))/);
  return (
    <span style={{ fontSize: size }} className="text-[var(--mac-text-2)]">
      {parts.map((p, i) => (i % 2 ? <b key={i} className="font-semibold text-[var(--mac-tint-ink)]">{p}</b> : <span key={i}>{p}</span>))}
    </span>
  );
}

function ReasonCard({ t, i, s, x, y }: { t: T; i: number; s: number; x: number; y: number }) {
  const { portrait: P } = useCanvas();
  const row = ROWS[i];
  const w = pick(P, 960, 660), h = pick(P, 124, 196);
  const band = useTransform(t, (v) => `${-40 + 160 * win(v, s + 0.4, s + 1.1, easeInOut)}%`);
  const bandO = useTransform(t, (v) => Math.sin(Math.PI * win(v, s + 0.4, s + 1.1, (x) => x)));
  const skel = useTransform(t, (v) => 1 - win(v, s + 1.05, s + 1.2, (x) => x));
  const ring = useTransform(t, (v) => Math.sin(Math.PI * win(v, s + 1.1, s + 1.7, (x) => x)));
  const bump = useTransform(t, (v) => 1 + 0.08 * Math.sin(Math.PI * win(v, s + 1.1, s + 1.5, (x) => x)));
  const dest = (
    <div className="relative" style={{ width: pick(P, 400, 440) }}>
      <motion.div className="absolute inset-0 grid items-center rounded-[10px] border border-dashed border-[var(--mac-control-line)] px-4 text-[var(--mac-text-2)]" style={{ opacity: skel, fontSize: 24 }}>
        <span className="flex gap-2"><i className="size-2 rounded-full bg-current opacity-60" /><i className="size-2 rounded-full bg-current opacity-60" /><i className="size-2 rounded-full bg-current opacity-60" /></span>
      </motion.div>
      <motion.div className="relative" style={{ scale: bump, transformOrigin: "0% 50%" }}>
        <Beatish t={t} at={s + 1.05}>
          <Dest size={24} width={pick(P, 400, 440)}>{row.dest}</Dest>
        </Beatish>
        <motion.span className="pointer-events-none absolute -inset-[3px] rounded-[13px] border-2 border-[var(--accent)]" style={{ opacity: ring }} />
      </motion.div>
    </div>
  );
  return (
    <Fly t={t} x={x} y={y} at={s} dur={0.65} from={{ x: (i % 2 ? 1 : -1) * pick(P, 420, 260), y: 20, s: 0.96 }} z={5}>
      <Card className="relative overflow-hidden" style={{ width: w, height: h }}>
        <motion.div className="pointer-events-none absolute inset-y-0 w-[34%] -skew-x-12" style={{ left: band, opacity: bandO, background: "color-mix(in oklab, var(--accent) 16%, transparent)" }} />
        {P ? (
          <div className="absolute inset-0 grid content-center gap-3 px-6">
            <div className="flex items-center gap-3"><FileGlyph kind={row.kind} size={30} /><span className="mono text-[26px]">{row.name}</span></div>
            <div className="flex items-center gap-3">
              <ArrowRight size={28} className="flex-none text-[var(--mac-text-2)]" />
              {dest}
            </div>
            <Beatish t={t} at={s + 1.35}><Reason text={row.reason} size={24} /></Beatish>
          </div>
        ) : (
          <div className="absolute inset-0 grid content-center gap-3 px-8">
            <div className="flex items-center gap-4">
              <FileGlyph kind={row.kind} size={32} />
              <span className="mono w-[380px] text-[27px]">{row.name}</span>
              <ArrowRight size={30} className="flex-none text-[var(--mac-text-2)]" />
              {dest}
            </div>
            <div className="pl-[56px]"><Beatish t={t} at={s + 1.35}><Reason text={row.reason} size={24} /></Beatish></div>
          </div>
        )}
      </Card>
    </Fly>
  );
}

function Beatish({ t, at, children }: { t: T; at: number; children: React.ReactNode }) {
  const I = useTransform(t, (v) => win(v, at, at + 0.4));
  const Y = useTransform(I, (i) => (1 - i) * 14);
  return <motion.div style={{ opacity: I, y: Y }}>{children}</motion.div>;
}

export function SceneReasons({ t }: SceneProps) {
  const { W, portrait: P } = useCanvas();
  const gap = pick(P, 138, 206);
  const y0 = pick(P, 275, 392);
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Glow t={t} x={W / 2} y={pick(P, 110, 150)} size={pick(P, 760, 700)} />
      <At x={W / 2} y={pick(P, 105, 122)} className="z-10">
        <Headline t={t} mode="left" size={pick(P, 88, 100)} lines={pick(P, ["A *reason* for each."], ["A *reason*", "for each."])} />
      </At>
      {ROWS.map((_, i) => <ReasonCard key={i} t={t} i={i} s={0.15 + i * 1.5} x={W / 2} y={y0 + i * gap} />)}
    </div>
  );
}
