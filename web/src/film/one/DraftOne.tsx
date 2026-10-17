import { Check, Download, Folder, History as HistoryIcon, ListChecks, PanelLeft, Settings, ShieldCheck, WandSparkles } from "lucide-react";
import { motion, type MotionValue, useTransform } from "motion/react";
import type { ReactNode } from "react";
import { AppWindow } from "../../demo/AppWindow";
import { Cursor } from "../../demo/Cursor";
import { FileGlyph } from "../../demo/FileGlyph";
import { DesktopIcons, Scene as Overlay, usePlayer } from "../../demo/Player";
import { DocumentsFolder, LAYOUT, SINK } from "../../demo/Reel";
import { along, CONFIRM, FILES, G, K, type Pt, SHEET, snapAt, UNTICK_ROW, WIN } from "../../demo/script";
import { Film, ramp, type SceneDef, type SceneProps, useBeat, useCanvas } from "../Film";
import { Backdrop, Captions, type Cue, FULL, Mark, type Rect, shot, type Shot, useShots, w, WIN_AT, World } from "./World";

/**
 * Draft 1, "Director's cut": one desktop, one window, and a camera that moves in on every
 * action, with large captions carrying the story. The app scenes replay the site demo's script.
 */

const ICONS: Rect = [20, 30, 340, 590];
const reasonCell = (row: number): Rect => w(G.colReason - 8, G.rowsY + G.row * row + 4, G.colReason + 176, G.rowsY + G.row * row + G.row - 4);

// Camera for the scripted session, keyed by script time.
const SHOTS: Shot[] = [
  shot(0.3, ICONS),
  shot(K.lassoEnd, ICONS),
  shot(K.grab, [150, 130, 370, 310]),
  shot(K.drop - 0.05, [200, 60, 1180, 640]),
  shot(K.scan + 0.5, w(0, 0, 820, 560)),
  shot(K.scanEnd - 0.4, w(168, 130, 820, 450)),
  shot(K.scanEnd + 0.3, w(410, 150, 820, 390)),
  shot(K.untick - 0.05, w(168, 330, 560, 450)),
  shot(K.menu - 0.05, w(370, 250, 640, 470)),
  shot(K.newFolder + 0.15, w(SHEET.x - 30, 40, SHEET.x + SHEET.w + 30, 230)),
  shot(K.create + 0.05, w(SHEET.x - 30, 40, SHEET.x + SHEET.w + 30, 230)),
  shot(K.teachShow + 0.35, w(168, 430, 620, 530)),
  shot(K.teachClick - 0.05, w(540, 430, 820, 530)),
  shot(K.chip - 0.05, w(380, 430, 700, 530)),
  shot(K.learn - 0.05, w(600, 430, 820, 530)),
  shot(K.learnedEnd - 0.4, w(168, 430, 620, 530)),
  shot(K.moveClick - 0.05, w(540, 490, 820, 560)),
  shot(K.confirm - 0.05, w(CONFIRM.x - 20, 40, CONFIRM.x + CONFIRM.w + 20, 220)),
  shot(K.moving + 0.3, FULL),
  shot(K.moved + 0.6, FULL),
  shot(K.appear + 0.3, [20, 110, 480, 560]),
  shot(K.grab2, [60, 170, 260, 360]),
  shot(K.drop2 - 0.05, [200, 60, 1180, 640]),
  shot(K.row2 + 0.3, w(168, 120, 820, 260)),
  shot(K.row2 + 1.6, w(400, 150, 820, 230)),
  shot(K.T, w(400, 150, 820, 230)),
];

type MarkDef = { at: number; until: number; r: Rect; label?: string };

/** A stretch of the scripted session, from script time `from`, with captions and highlights. */
function AppShot({ t, from, cues, marks = [] }: { t: MotionValue<number>; from: number; cues: Cue[]; marks?: MarkDef[] }) {
  const st = useTransform(t, (v) => from + v);
  const p = usePlayer(st, LAYOUT);
  const camera = useShots(st, SHOTS);
  useBeat(st, marks.flatMap((m) => [m.at, m.until]));
  const now = st.get();
  return (
    <>
      <World camera={camera}>
        <Backdrop />
        <DesktopIcons L={LAYOUT} snap={p.snap} sink={SINK} />
        <DocumentsFolder bump={p.snap.desktopGone} />
        <Overlay L={LAYOUT} {...p} time={st} />
        {marks.map((m, i) => <Mark key={i} r={m.r} on={now >= m.at && now < m.until} label={m.label} />)}
      </World>
      <Captions t={st} cues={cues} />
    </>
  );
}

// ---------------------------------------------------------------- 1 · Messy folder
function TitleScene({ t }: SceneProps) {
  const camera = useShots(t, [shot(0, FULL), shot(1.2, FULL), shot(4.8, [0, 20, 760, 640])], 1.6);
  return (
    <>
      <World camera={camera}>
        <Backdrop />
        {FILES.map((f, i) => <PopIcon key={f.name} t={t} at={0.15 + i * 0.12} p={LAYOUT.icons[i]} name={f.name} kind={f.kind} rot={((i * 37) % 13) - 6} />)}
        <PopIcon t={t} at={1.3} p={{ x: 520, y: 150 }} name="Untitled 3.rtf" kind="txt" rot={5} />
        <PopIcon t={t} at={1.45} p={{ x: 760, y: 420 }} name="IMG_4479.HEIC" kind="img" rot={-7} />
        <PopIcon t={t} at={1.6} p={{ x: 980, y: 210 }} name="Scan 12.pdf" kind="pdf" rot={8} />
        <DocumentsFolder bump={false} />
      </World>
      <Captions t={t} size="xl" cues={[{ at: 0, title: "What happens to a messy folder?", accent: "messy", sub: "Downloads and Desktop are the usual suspects." }]} />
    </>
  );
}

function PopIcon({ t, at, p, name, kind, rot }: { t: MotionValue<number>; at: number; p: Pt; name: string; kind: (typeof FILES)[number]["kind"]; rot: number }) {
  const s = useTransform(t, (v) => { const x = ramp(v, at, at + 0.35); return x === 0 ? 0 : 1 + Math.sin(x * Math.PI) * 0.18 * (1 - x) + (x < 1 ? -0.0 : 0); });
  const o = useTransform(t, (v) => ramp(v, at, at + 0.12));
  return (
    <motion.div className="absolute grid w-[104px] justify-items-center gap-1 text-center" style={{ left: p.x - 52, top: p.y - 30, scale: s, opacity: o, rotate: rot }}>
      <FileGlyph kind={kind} size={42} />
      <span className="max-w-[100px] text-[11.5px] leading-[1.25] break-all text-[var(--ink)]" style={{ fontFamily: "var(--font-mac)" }}>{name}</span>
    </motion.div>
  );
}

// ---------------------------------------------------------------- 2–3 · It reads, You review
function ReadScene({ t }: SceneProps) {
  return (
    <AppShot
      t={t}
      from={0.45}
      cues={[
        { at: 0, title: "Drop a folder, or just the files.", accent: "Drop", sub: "On the window or on the Dock icon." },
        { at: K.scan, title: "It reads every file.", accent: "reads", sub: "Name, type, size and what’s written inside. In English or Spanish." },
        { at: K.scanEnd + 0.15, title: "Every suggestion has a reason.", accent: "reason" },
      ]}
      marks={[
        { at: K.scanEnd + 0.45, until: 99, r: reasonCell(0) },
        { at: K.scanEnd + 0.75, until: 99, r: reasonCell(5) },
      ]}
    />
  );
}

function ReviewScene({ t }: SceneProps) {
  return (
    <AppShot
      t={t}
      from={6.2}
      cues={[
        { at: 0, title: "Untick what should stay.", accent: "Untick", sub: "Before anything moves, you see the whole list." },
        { at: K.menu - 0.3, title: "Change any destination.", accent: "Change", sub: "Even to a folder that doesn’t exist yet." },
        { at: K.teachShow, title: "It offers to remember.", accent: "remember" },
        { at: K.moveClick - 0.4, title: "Nothing moves until you click.", accent: "click" },
        { at: K.moving + 0.15, title: "Then everything moves at once.", sub: "Into folders inside Documents › Organizy." },
      ]}
      marks={[{ at: K.untick + 0.05, until: K.menu - 0.3, r: w(G.colCheck - 6, G.rowsY + G.row * UNTICK_ROW + 3, G.colDest - 12, G.rowsY + G.row * UNTICK_ROW + G.row - 3), label: "stays put" }]}
    />
  );
}

// ---------------------------------------------------------------- 4 · History
const SIDE_ITEMS = [["Organize", WandSparkles], ["Rules", ListChecks], ["History", HistoryIcon], ["Settings", Settings]] as const;
const sideItemY = (i: number) => 46 + i * 30;

/** A plain app window frame with the sidebar, for screens the scripted session doesn't visit. */
function WindowFrame({ sel, title, children }: { sel: number; title: string; children: ReactNode }) {
  return (
    <div className="mac absolute overflow-hidden rounded-[12px] border border-[var(--mac-line)] bg-[var(--mac-window)]" style={{ left: WIN_AT.x, top: WIN_AT.y, width: WIN.w, height: WIN.h, boxShadow: "var(--mac-shadow)" }}>
      <nav className="absolute inset-y-0 left-0 bg-[var(--mac-sidebar)]" style={{ width: WIN.side }}>
        <div className="flex items-center justify-between px-[11px] pt-3">
          <span className="flex gap-[7px]">
            <span className="size-3 rounded-full bg-[#FF5F57]" /><span className="size-3 rounded-full bg-[#FEBC2E]" /><span className="size-3 rounded-full bg-[#28C840]" />
          </span>
          <PanelLeft size={15} className="mr-2 text-[var(--mac-text-2)]" />
        </div>
        {SIDE_ITEMS.map(([label, I], i) => (
          <div
            key={label}
            className={`absolute flex items-center gap-2 rounded-[6px] px-2 transition-colors duration-200 ${i === sel ? "bg-[var(--mac-text)]/10" : ""}`}
            style={{ left: 10, right: 10, top: sideItemY(i) - 13, height: 26 }}
          >
            <I size={15} className="text-[var(--mac-tint)]" />
            {label}
          </div>
        ))}
      </nav>
      <section className="absolute inset-y-0 right-0" style={{ left: WIN.side }}>
        <header className="flex h-[52px] items-center border-b border-[var(--mac-line)] bg-[var(--mac-bar)] px-4">
          <span className="text-[15px] font-semibold text-[var(--mac-text-2)]">{title}</span>
        </header>
        {children}
      </section>
    </div>
  );
}

function useCursor(t: MotionValue<number>, kfs: [number, Pt][], clicks: number[]) {
  const x = useTransform(t, (v) => along(kfs, v).x);
  const y = useTransform(t, (v) => along(kfs, v).y);
  const ring = useTransform(t, (v) => { for (const c of clicks) if (v >= c && v < c + 0.35) return (v - c) / 0.35; return -1; });
  return { x, y, ring };
}
const wp = (x: number, y: number): Pt => ({ x: WIN_AT.x + x, y: WIN_AT.y + y });

function Clicker({ t, kfs, clicks }: { t: MotionValue<number>; kfs: [number, Pt][]; clicks: number[] }) {
  const c = useCursor(t, kfs, clicks);
  useBeat(t, clicks.flatMap((k) => [k, k + 0.12, k + 0.24, k + 0.35]));
  const v = t.get();
  const active = clicks.find((k) => v >= k && v < k + 0.35);
  return <Cursor x={c.x} y={c.y} click={active === undefined ? -1 : (v - active) / 0.35} down={false} />;
}

const MOVED = FILES.filter((_, i) => i !== UNTICK_ROW);
const HIST = { clickHistory: 1.0, clickUndo: 2.7 };
const undoBtn = wp(WIN.w - 58, 52 + 18 + 30);

function HistoryScene({ t }: SceneProps) {
  const n = useBeat(t, [HIST.clickHistory + 0.05, HIST.clickUndo + 0.05]);
  const camera = useShots(t, [
    shot(0, w(0, 0, 820, 560)),
    shot(HIST.clickHistory - 0.05, w(0, 20, 330, 190)),
    shot(HIST.clickUndo - 0.6, w(168, 40, 820, 250)),
    shot(HIST.clickUndo - 0.05, w(540, 70, 820, 200)),
    shot(HIST.clickUndo + 0.9, FULL),
    shot(6, FULL),
  ]);
  const kfs: [number, Pt][] = [
    [0, wp(600, 330)], [HIST.clickHistory - 0.35, wp(70, sideItemY(2))], [HIST.clickHistory, wp(70, sideItemY(2))],
    [HIST.clickUndo - 0.4, undoBtn], [HIST.clickUndo, undoBtn], [HIST.clickUndo + 1.2, wp(560, 330)], [6, wp(560, 330)],
  ];
  return (
    <>
      <World camera={camera}>
        <Backdrop />
        <DesktopIcons L={LAYOUT} snap={{ ...snapAt(K.moved + 1), unticked: true }} sink={SINK} />
        <DocumentsFolder bump={false} />
        {MOVED.map((f) => {
          const i = FILES.indexOf(f);
          return <FlyBack key={f.name} t={t} at={HIST.clickUndo + 0.15 + i * 0.06} from={SINK} to={LAYOUT.icons[i]} name={f.name} kind={f.kind} />;
        })}
        <WindowFrame sel={n >= 1 ? 2 : 0} title={n >= 1 ? "History" : "Organize"}>
          {n >= 1 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
              <div className={`rounded-[10px] border border-[var(--mac-line)] p-4 transition-opacity ${n >= 2 ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="m-0 text-[15px] font-semibold">Moved 7 files</p>
                    <p className="m-0 text-[var(--mac-text-2)]">Today at 9:41 · from Desktop</p>
                  </div>
                  {n >= 2 ? (
                    <span className="flex items-center gap-1 text-[var(--mac-green)]"><Check size={14} /> Undone</span>
                  ) : (
                    <span className="mac-btn">Undo</span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {MOVED.map((f) => <span key={f.name} className="mono rounded-[5px] bg-[var(--mac-alt)] px-1.5 py-[1px] text-[11px]">{f.name}</span>)}
                </div>
              </div>
              <p className="mt-3 text-[12px] text-[var(--mac-text-2)]">Undo puts every file back and removes folders the move created, if they’re empty.</p>
            </motion.div>
          ) : (
            <div className="grid h-[400px] place-items-center text-[var(--mac-text-2)]">Moved 7 files. Undo anytime from History.</div>
          )}
        </WindowFrame>
        <Clicker t={t} kfs={kfs} clicks={[HIST.clickHistory, HIST.clickUndo]} />
      </World>
      <Captions
        t={t}
        cues={[
          { at: 0, title: "Every batch waits in History.", accent: "History" },
          { at: HIST.clickUndo + 0.1, title: "One click puts it all back.", accent: "back", sub: "Each file returns to where it was." },
        ]}
      />
    </>
  );
}

function FlyBack({ t, at, from, to, name, kind }: { t: MotionValue<number>; at: number; from: Pt; to: Pt; name: string; kind: (typeof FILES)[number]["kind"] }) {
  const p = useTransform(t, (v) => { const x = ramp(v, at, at + 0.7); return 1 - Math.pow(1 - x, 3); });
  const x = useTransform(p, (q) => from.x + (to.x - from.x) * q - 52);
  const y = useTransform(p, (q) => from.y + (to.y - from.y) * q - 30);
  const s = useTransform(p, (q) => 0.2 + 0.8 * q);
  const o = useTransform(p, (q) => (q === 0 ? 0 : Math.min(1, q * 3)));
  return (
    <motion.div className="absolute top-0 left-0 grid w-[104px] justify-items-center gap-1 text-center" style={{ x, y, scale: s, opacity: o }}>
      <FileGlyph kind={kind} size={42} />
      <span className="max-w-[100px] text-[11.5px] leading-[1.25] break-all text-[var(--ink)]" style={{ fontFamily: "var(--font-mac)" }}>{name}</span>
    </motion.div>
  );
}

// ---------------------------------------------------------------- 5 · Small things
const FOLDERS = ["Invoices & Receipts", "Bank Statements", "Taxes", "Resumes & CVs", "Screenshots", "Images", "Videos", "Audio", "Spreadsheets", "Presentations", "Documents", "Archives", "Installers"];

function FinderWindow({ title, r, children }: { title: string; r: Rect; children: ReactNode }) {
  return (
    <div className="mac absolute overflow-hidden rounded-[12px] border border-[var(--mac-line)] bg-[var(--mac-window)]" style={{ left: r[0], top: r[1], width: r[2] - r[0], height: r[3] - r[1], boxShadow: "var(--mac-shadow)" }}>
      <div className="flex h-[44px] items-center gap-3 border-b border-[var(--mac-line)] bg-[var(--mac-bar)] px-3">
        <span className="flex gap-[7px]"><span className="size-3 rounded-full bg-[#FF5F57]" /><span className="size-3 rounded-full bg-[#FEBC2E]" /><span className="size-3 rounded-full bg-[#28C840]" /></span>
        <span className="font-semibold text-[var(--mac-text-2)]">{title}</span>
      </div>
      {children}
    </div>
  );
}

function FolderIcon({ size = 50, tint = false }: { size?: number; tint?: boolean }) {
  return (
    <svg width={size} height={size * 0.82} viewBox="0 0 54 44" aria-hidden>
      <path d="M3 6a4 4 0 0 1 4-4h13l5 5h22a4 4 0 0 1 4 4v27a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" fill={tint ? "var(--mac-tint)" : "#5AB0F7"} />
      <path d="M3 13h48v25a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" fill={tint ? "color-mix(in oklab, var(--mac-tint) 70%, #fff)" : "#7BC2FA"} />
    </svg>
  );
}

const FOLDER_WIN: Rect = [230, 110, 970, 590];
const FOLDER_WIN_TALL: Rect = [390, 40, 810, 660];
function FoldersScene({ t }: SceneProps) {
  const { portrait } = useCanvas();
  const r = portrait ? FOLDER_WIN_TALL : FOLDER_WIN;
  const camera = useShots(t, [shot(0, FULL), shot(1.4, FULL), shot(2.4, [r[0] - 20, r[1] - 20, r[2] + 20, r[3] + 20]), shot(4.6, [r[0] + 10, r[1] + 10, r[2] - 10, r[3] - 10])], 1.8);
  const n = useBeat(t, FOLDERS.map((_, i) => 1.3 + i * 0.1));
  return (
    <>
      <World camera={camera}>
        <Backdrop />
        <FinderWindow title="Documents › Organizy" r={r}>
          <div className={`grid gap-x-2 gap-y-5 p-6 ${portrait ? "grid-cols-3" : "grid-cols-5"}`}>
            {FOLDERS.map((f, i) => (
              <motion.div
                key={f}
                className="grid justify-items-center gap-1.5 text-center"
                initial={false}
                animate={i < n ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 14, scale: 0.85 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <FolderIcon />
                <span className="text-[12px] leading-[1.2]">{f}</span>
              </motion.div>
            ))}
          </div>
        </FinderWindow>
      </World>
      <Captions
        t={t}
        cues={[
          { at: 0, title: "Small things it gets right.", accent: "right" },
          { at: 1.5, title: "Thirteen folders, ready.", accent: "Thirteen", sub: "Inside Documents › Organizy. Change any of them in Rules." },
        ]}
      />
    </>
  );
}

const RULES_KEYWORDS = "receipt, amount due, factura";
const PREVIEW = ["factura_luz_sept.pdf", "recibo_supermercado.pdf", "amazon_order_4471.pdf"];
const RULES = { click: 0.8, typeFrom: 1.0, typeTo: 2.6 };
const kwField = wp(WIN.side + 420, 52 + 152);

function RulesScene({ t }: SceneProps) {
  const camera = useShots(t, [shot(0, w(0, 0, 820, 560)), shot(RULES.click - 0.05, w(370, 60, 820, 270)), shot(RULES.typeTo, w(370, 60, 820, 270)), shot(3.4, w(370, 220, 820, 500)), shot(5.2, w(370, 220, 820, 500))]);
  const typed = useBeat(t, Array.from(RULES_KEYWORDS, (_, i) => RULES.typeFrom + ((RULES.typeTo - RULES.typeFrom) * (i + 1)) / RULES_KEYWORDS.length));
  const shown = useBeat(t, PREVIEW.map((_, i) => RULES.typeTo + 0.2 + i * 0.25));
  const kfs: [number, Pt][] = [[0, wp(500, 420)], [RULES.click - 0.3, kwField], [RULES.click, kwField], [RULES.typeTo + 0.6, wp(600, 300)], [5.2, wp(600, 300)]];
  return (
    <>
      <World camera={camera}>
        <Backdrop />
        <WindowFrame sel={1} title="Rules">
          <div className="absolute inset-0 top-[52px] grid grid-cols-[200px_1fr]">
            <ul className="m-0 list-none border-r border-[var(--mac-line)] p-2">
              {FOLDERS.slice(0, 12).map((f, i) => (
                <li key={f} className={`flex items-center gap-2 rounded-[6px] px-2 py-[3px] ${i === 0 ? "bg-[var(--mac-select)]" : ""}`}>
                  <Folder size={13} className="fill-[var(--mac-tint)] text-[var(--mac-tint)]" />{f}
                </li>
              ))}
            </ul>
            <div className="grid content-start gap-3 p-4">
              <div className="flex items-center justify-between rounded-[8px] border border-[var(--mac-line)] px-3 py-[7px]"><span>Name</span><b className="font-medium">Invoices & Receipts</b></div>
              <div>
                <p className="m-0 mb-1.5 font-semibold">Match files when</p>
                <div className="divide-y divide-[var(--mac-line)] overflow-hidden rounded-[8px] border border-[var(--mac-line)]">
                  <Field label="File types" value="pdf, doc, docx, pages, rtf, txt" />
                  <Field label="Name contains" value="" placeholder="Screenshot, Scan" />
                  <Field label="Keywords" value={RULES_KEYWORDS.slice(0, typed)} focus={t.get() >= RULES.click && t.get() < RULES.typeTo + 0.4} />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-[8px] border border-[var(--mac-line)] px-3 py-[7px]">
                <span>Built-in knowledge: invoices · English and Spanish</span>
                <span className="mac-switch" role="presentation" aria-checked="true" />
              </div>
              <div>
                <p className="m-0 mb-1.5 font-semibold">Preview</p>
                <div className="overflow-hidden rounded-[8px] border border-[var(--mac-line)]">
                  <p className="m-0 border-b border-[var(--mac-line)] px-3 py-2"><b>{shown}</b> of 8 files go here.</p>
                  {PREVIEW.map((f, i) => (
                    <motion.div key={f} className="mono flex items-center justify-between px-3 py-[5px] text-[12px]" initial={false} animate={{ opacity: i < shown ? 1 : 0, x: i < shown ? 0 : -8 }}>
                      {f}<span className="flex items-center gap-1 text-[11.5px] text-[var(--mac-green)]" style={{ fontFamily: "var(--font-mac)" }}><Check size={12} /> Goes here</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </WindowFrame>
        <Clicker t={t} kfs={kfs} clicks={[RULES.click]} />
      </World>
      <Captions t={t} cues={[{ at: 0, title: "Rules in plain words.", accent: "plain", sub: "It already knows what invoices, statements, taxes and resumes look like. In English and Spanish." }]} />
    </>
  );
}

function Field({ label, value, placeholder, focus }: { label: string; value: string; placeholder?: string; focus?: boolean }) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-center gap-3 px-3 py-[6px]">
      <span>{label}</span>
      <span className="mac-input mono flex items-center text-[12px]" style={focus ? { borderColor: "var(--mac-tint)", boxShadow: "0 0 0 3px var(--mac-tint-soft)" } : undefined}>
        {value || <span className="text-[var(--mac-text-2)]">{placeholder}</span>}
        {focus && <span className="ml-[1px] inline-block h-[13px] w-px animate-pulse bg-[var(--mac-text)]" />}
      </span>
    </div>
  );
}

const REPORTS = ["Report.pdf", "Report (2).pdf", "Report (3).pdf"];
const LIST_WIN: Rect = [330, 170, 870, 470];
function OverwriteScene({ t }: SceneProps) {
  const camera = useShots(t, [shot(0, [280, 80, 920, 540]), shot(4.4, [320, 120, 880, 500])], 1.9);
  const n = useBeat(t, [1.05, 2.25]);
  return (
    <>
      <World camera={camera}>
        <Backdrop />
        <FinderWindow title="Documents" r={LIST_WIN}>
          <div className="grid grid-cols-[1fr_auto] border-b border-[var(--mac-line)] px-4 py-1.5 text-[11.5px] text-[var(--mac-text-2)]"><span>Name</span><span>Kind</span></div>
          {REPORTS.map((r, i) => (
            <motion.div
              key={r}
              className="relative flex items-center gap-3 px-4 py-[7px]"
              initial={false}
              animate={i <= n ? { opacity: 1, y: 0, backgroundColor: i === n && i > 0 ? "color-mix(in oklab, var(--accent) 16%, transparent)" : "rgba(0,0,0,0)" } : { opacity: 0, y: -16 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
            >
              <FileGlyph kind="pdf" size={16} />
              <span className="mono text-[13px]">{r}</span>
              {i > 0 && i <= n && <span className="ml-2 rounded-full bg-[var(--accent)] px-2 py-[1px] text-[11px] font-medium text-[var(--on-accent)]">name was taken</span>}
              <span className="ml-auto text-[12px] text-[var(--mac-text-2)]">PDF document</span>
            </motion.div>
          ))}
        </FinderWindow>
        {[0.55, 1.75].map((at, i) => <Drop key={at} t={t} at={at} i={i} />)}
      </World>
      <Captions t={t} cues={[{ at: 0, title: "Never overwrites.", accent: "Never", sub: "If a name is taken, the new file gets a number. Nothing is replaced or deleted." }]} />
    </>
  );
}

/** Another "Report.pdf" falling into the window. */
function Drop({ t, at, i }: { t: MotionValue<number>; at: number; i: number }) {
  const y = useTransform(t, (v) => 40 + 180 * Math.pow(ramp(v, at, at + 0.5), 2));
  const o = useTransform(t, (v) => (v < at || v > at + 0.55 ? 0 : 1));
  return (
    <motion.div className="absolute grid justify-items-center gap-1" style={{ left: 560 + i * 60, top: 0, y, opacity: o }}>
      <FileGlyph kind="pdf" size={40} />
      <span className="rounded-[4px] bg-[#3E9BF0] px-1 text-[11px] text-white" style={{ fontFamily: "var(--font-mac)" }}>Report.pdf</span>
    </motion.div>
  );
}

// ---------------------------------------------------------------- 6 · It learns
function LearnScene({ t }: SceneProps) {
  return (
    <AppShot
      t={t}
      from={16.3}
      cues={[
        { at: 16.3, title: "A week later.", sub: "Another recipe lands on the desktop." },
        { at: K.row2, title: "It learned your folders.", accent: "learned", sub: "Fix a destination once and similar files follow. It all stays on your Mac." },
      ]}
      marks={[{ at: K.row2 + 0.5, until: 99, r: reasonCell(0), label: "learned from paella_valenciana.txt" }]}
    />
  );
}

// ---------------------------------------------------------------- 7 · Install
const STEPS = [
  { n: "1", title: "Download it.", line: "The zip from GitHub. Drag Organizy into Applications.", Visual: VisualDownload },
  { n: "2", title: "Open it once.", line: "Privacy & Security › Open Anyway. It’s free, so Apple doesn’t notarize it.", Visual: VisualOpen },
  { n: "3", title: "Check it, if you like.", line: "Each release lists a SHA-256.", Visual: VisualCheck },
];

function InstallScene({ t }: SceneProps) {
  const { portrait } = useCanvas();
  const n = useBeat(t, [0.2, 1.3, 2.2, 3.1]);
  const size = portrait ? 118 : 150;
  return (
    <div className="absolute inset-0">
      <Backdrop />
      <div className={`absolute inset-0 grid content-center justify-items-center ${portrait ? "gap-8 px-12" : "gap-10 px-16"}`}>
        <motion.h3
          className="m-0 inline-flex items-baseline font-display leading-none font-bold tracking-[-0.04em] text-[var(--ink)]"
          style={{ fontSize: size }}
          initial={false}
          animate={{ opacity: n >= 1 ? 1 : 0, y: n >= 1 ? 0 : 20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Organizy"
        >
          <img src="/organizy-app/icon-512.png" alt="" className="mr-[0.02em] size-[0.72em] translate-y-[0.02em]" />
          <span aria-hidden>rganizy</span>
        </motion.h3>
        <motion.p
          className="m-0 text-center text-[var(--muted)]"
          style={{ fontSize: portrait ? 26 : 22 }}
          initial={false}
          animate={{ opacity: n >= 1 ? 1 : 0 }}
          transition={{ delay: 0.25 }}
        >
          Free, for macOS 14 Sonoma or later. No account, no ads, and nothing leaves your Mac.
        </motion.p>
        <div className={`grid w-full ${portrait ? "gap-6" : "grid-cols-3 gap-8"}`}>
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              className={`grid gap-3 ${portrait ? "grid-cols-[96px_1fr] items-center" : ""}`}
              initial={false}
              animate={i + 2 <= n ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {portrait ? (
                <span className="grid size-[84px] place-items-center rounded-full border border-[var(--line)] font-display text-[44px] font-bold text-[var(--accent)]">{s.n}</span>
              ) : (
                <s.Visual on={i + 2 <= n} />
              )}
              <div>
                <p className="m-0 font-display font-bold tracking-[-0.02em] text-[var(--ink)]" style={{ fontSize: portrait ? 40 : 36, lineHeight: 1.05 }}>
                  {!portrait && <span className="text-[var(--accent)]">{s.n} </span>}{s.title}
                </p>
                <p className="m-0 mt-1 text-[var(--muted)]" style={{ fontSize: portrait ? 22 : 18, lineHeight: 1.4 }}>{s.line}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VisualCard({ children }: { children: ReactNode }) {
  return <div className="mac grid h-[96px] place-items-center overflow-hidden rounded-[14px] border border-[var(--mac-line)] bg-[var(--mac-window)]">{children}</div>;
}
function VisualDownload({ on }: { on: boolean }) {
  return (
    <VisualCard>
      <div className="flex items-center gap-4">
        <motion.img src="/organizy-app/icon-96.png" alt="" width={44} height={44} initial={false} animate={on ? { x: [0, 0, 64], opacity: [1, 1, 0] } : { x: 0, opacity: 1 }} transition={{ duration: 1.2, times: [0, 0.4, 1], delay: 0.3 }} />
        <Download size={20} className="text-[var(--mac-text-2)]" />
        <span className="grid justify-items-center gap-0.5"><FolderIcon size={44} /><span className="text-[10.5px]">Applications</span></span>
      </div>
    </VisualCard>
  );
}
function VisualOpen({ on }: { on: boolean }) {
  return (
    <VisualCard>
      <div className="flex items-center gap-3 px-4">
        <ShieldCheck size={22} className="text-[var(--mac-text-2)]" />
        <span className="text-[12px]">“Organizy” was blocked.</span>
        <motion.span className="mac-btn primary" initial={false} animate={on ? { scale: [1, 1, 0.92, 1] } : { scale: 1 }} transition={{ duration: 0.9, times: [0, 0.6, 0.75, 1], delay: 0.3 }}>
          Open Anyway
        </motion.span>
      </div>
    </VisualCard>
  );
}
function VisualCheck({ on }: { on: boolean }) {
  const cmd = "shasum -a 256 ~/Downloads/Organizy-*.zip";
  return (
    <VisualCard>
      <div className="mono w-full overflow-hidden px-4 text-[12px] whitespace-nowrap">
        <span className="text-[var(--mac-text-2)]">$ </span>
        <motion.span className="inline-block overflow-hidden align-bottom" initial={false} animate={{ width: on ? "auto" : 0 }} transition={{ duration: 1.1, ease: "linear", delay: 0.2 }}>
          {cmd}
        </motion.span>
      </div>
    </VisualCard>
  );
}

// ---------------------------------------------------------------- the film
export const DRAFT_ONE: SceneDef[] = [
  { id: "title", chapter: "Messy folder", dur: 4.8, Scene: TitleScene },
  { id: "read", chapter: "It reads", dur: 6.0, Scene: ReadScene },
  { id: "review", chapter: "You review", dur: 9.6, Scene: ReviewScene },
  { id: "history", chapter: "History", dur: 6.0, Scene: HistoryScene },
  { id: "folders", chapter: "Small things", dur: 4.6, Scene: FoldersScene },
  { id: "rules", chapter: "Small things", dur: 5.2, Scene: RulesScene },
  { id: "overwrite", chapter: "Small things", dur: 4.4, Scene: OverwriteScene },
  { id: "learn", chapter: "It learns", dur: 6.6, Scene: LearnScene },
  { id: "install", chapter: "Install", dur: 7.5, Scene: InstallScene },
];

export function DraftOne() {
  return (
    <Film
      scenes={DRAFT_ONE}
      rate={0.78}
      label="A short film of Organizy: files are dropped on the window, each gets a folder with a reason, you untick one, change one to a new Recipes folder and teach it, then confirm the move. History undoes it in one click. Thirteen ready folders, rules in plain words, and numbered names instead of overwrites. A week later a new recipe is filed by what it learned. Then how to install it."
    />
  );
}

