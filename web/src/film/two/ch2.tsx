import { Check, CheckCircle2, Eye, History } from "lucide-react";
import { motion, useTransform } from "motion/react";
import { easeInOut, easeOut, useBeat, useCanvas, type SceneProps } from "../Film";
import { At, Card, Dest, FileChip, FileGlyph, Tick } from "./bits";
import { Bg, Fly, Glow, Headline, lerp, pick, Pointer, Punch, TONE, type T, win } from "./kit";

/* ============================================================ 3. You review: punch word */

export function SceneReviewPunch({ t }: SceneProps) {
  const { W, H, portrait: P } = useCanvas();
  const ticks = [0, 1, 2, 3];
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Bg tone="inv" />
      <Punch t={t} word="Review." size={pick(P, 350, 176)} tone="inv" x={W / 2} y={pick(P, H / 2 - 30, H / 2 - 40)} />
      <Fly t={t} x={W / 2} y={pick(P, 610, 790)} at={0.05} dur={0.5} from={{ y: 60 }} z={5}>
        <Card className="flex items-center gap-6 !rounded-[18px] px-8" style={{ height: 96 }}>
          {ticks.map((i) => <Tick key={i} t={t} size={48} off={i === 3 ? 0.75 : undefined} />)}
        </Card>
      </Fly>
    </div>
  );
}

/* ============================================================ 3. You review: the list */

const LIST = [
  { name: "factura_luz_sept.pdf", kind: "pdf", dest: "Invoices & Receipts" },
  { name: "IMG_4478.HEIC", kind: "img", dest: "Images" },
  { name: "Alex_Kim_CV.docx", kind: "doc", dest: "Resumes & CVs" },
  { name: "paella_valenciana.txt", kind: "txt", dest: "Documents" },
  { name: "budget_2026.xlsx", kind: "sheet", dest: "Spreadsheets" },
] as const;

export function SceneReview({ t, dur }: SceneProps) {
  const { W, portrait: P } = useCanvas();
  const cw = pick(P, 700, 660), rowH = pick(P, 64, 70), pad = 16, foot = 84;
  const ch = pad + rowH * 5 + foot;
  const cx = pick(P, 885, 360), cy = pick(P, 372, 655);
  const L = cx - cw / 2, Tp = cy - ch / 2;
  const sw = pick(P, 280, 290), selL = cw - 28 - sw;
  const rowY = (i: number) => Tp + pad + rowH * i + rowH / 2;
  const selX = L + selL + sw / 2;
  const chkX = L + 42;
  const out = dur + 9;
  const n = useBeat(t, [3.8]);
  const menuTop = rowY(3) + 25 + 6;
  const menuO = useTransform(t, (v) => win(v, 2.62, 2.78, (x) => x) * (1 - win(v, 3.82, 3.98, (x) => x)));
  const menuS = useTransform(t, (v) => lerp(0.96, 1, win(v, 2.62, 2.78)));
  const hiO = useTransform(t, (v) => win(v, 3.3, 3.45, (x) => x));
  const dim = useTransform(t, (v) => 1 - 0.58 * win(v, 1.5, 1.75, (x) => x));
  const flash = useTransform(t, (v) => Math.sin(Math.PI * win(v, 3.8, 4.4, (x) => x)));
  const path: [number, number, number][] = [
    [0.4, L + cw + 40, Tp + ch + 30],
    [1.4, chkX + 2, rowY(4) + 2],
    [2.5, selX - 40, rowY(3)],
    [3.35, selX - 20, menuTop + 125],
    [3.8, selX - 20, menuTop + 125],
    [dur - 0.1, selX + 60, menuTop + 190],
  ];
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Glow t={t} x={pick(P, 300, W / 2)} y={pick(P, 360, 220)} size={pick(P, 800, 760)} />
      <At x={pick(P, 70, W / 2)} y={pick(P, 360, 190)} left={!P} className="z-10">
        <Headline t={t} still align={P ? "center" : "left"} size={pick(P, 116, 94)} lines={pick(P, ["See the", "*whole*", "list."], ["See the", "*whole* list."])} />
      </At>

      <Fly t={t} x={cx} y={cy} at={-0.3} dur={0.8} out={out} from={{ y: 60, r: 1.5 }} to={{ y: -40 }} z={4}>
        <Card className="relative" style={{ width: cw, height: ch }}>
          {LIST.map((r, i) => (
            <motion.div key={r.name} className="absolute right-0 left-0 flex items-center" style={{ top: pad + rowH * i, height: rowH, opacity: i === 4 ? dim : 1 }}>
              <span className="absolute" style={{ left: 28 }}>
                {i === 4 ? <Tick t={t} size={28} off={1.5} /> : <Tick t={t} size={28} />}
              </span>
              <span className="absolute flex items-center gap-3" style={{ left: 76 }}>
                <FileGlyph kind={r.kind} size={22} />
                <span className="mono" style={{ fontSize: pick(P, 19, 17) }}>{r.name}</span>
              </span>
              <span className="absolute" style={{ left: selL }}>
                <Dest size={20} width={sw}>{i === 3 && n > 0 ? <b className="font-semibold text-[var(--mac-tint-ink)]">Recipes</b> : r.dest}</Dest>
                {i === 3 && <motion.span className="pointer-events-none absolute -inset-[3px] rounded-[13px] border-2 border-[var(--accent)]" style={{ opacity: flash }} />}
              </span>
              {i < 4 && <span className="absolute right-6 bottom-0 left-6 h-px bg-[var(--mac-line)]" />}
            </motion.div>
          ))}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-3 border-t border-[var(--mac-line)] px-7" style={{ height: foot }}>
            <span className="mac-btn !h-[44px] !rounded-[10px] !px-5 text-[20px]"><Eye size={20} /> Quick Look</span>
            <span className="mac-btn primary !h-[44px] !rounded-[10px] !px-5 text-[20px] font-medium">Move Files</span>
          </div>
        </Card>
      </Fly>

      {/* destination menu */}
      <motion.div className="absolute z-30 rounded-[12px] border border-[var(--mac-control-line)] bg-[var(--mac-window)] p-[6px]" style={{ left: selX - sw / 2, top: menuTop, width: sw + 20, opacity: menuO, scale: menuS, transformOrigin: "50% 0%", boxShadow: "0 18px 40px -12px rgba(0,0,0,.35)" }}>
        {["Invoices & Receipts", "✓  Documents"].map((m) => (
          <div key={m} className="font-mac flex h-[44px] items-center rounded-[8px] px-3 text-[20px]">{m}</div>
        ))}
        <div className="my-[4px] h-px bg-[var(--mac-line)]" />
        <div className="font-mac relative flex h-[44px] items-center rounded-[8px] px-3 text-[20px]">
          New Folder…
          <motion.span className="absolute inset-0 flex items-center rounded-[8px] bg-[var(--mac-tint)] px-3 text-white dark:text-[#111118]" style={{ opacity: hiO }}>New Folder…</motion.span>
        </div>
      </motion.div>

      <Pointer t={t} path={path} clicks={[1.5, 2.62, 3.72]} off={out} />
    </div>
  );
}

/* ============================================================ 3. You review: nothing moves */

export function SceneNothing({ t, dur }: SceneProps) {
  const { W, portrait: P } = useCanvas();
  const bx = pick(P, 880, 360), by = pick(P, 505, 820);
  const chipX = pick(P, 400, 360);
  const chipY = (i: number) => pick(P, 430 + i * 72, 540 + i * 74);
  const clickT = 2.15;
  const n = useBeat(t, [clickT + 0.1]);
  const press = useTransform(t, (v) => 1 - 0.06 * Math.sin(Math.PI * win(v, clickT, clickT + 0.2, (x) => x)));
  const pulse = useTransform(t, (v) => (v > clickT ? 0 : ((v * 0.9) % 1)));
  const pulseS = useTransform(pulse, (p) => 1 + p * 0.35);
  const pulseO = useTransform(pulse, (p) => (1 - p) * 0.7);
  const path: [number, number, number][] = [
    [0.2, bx + pick(P, 280, 200), by + 170],
    [1.5, bx + 20, by + 10],
    [1.8, bx + 32, by + 16],
    [clickT - 0.05, bx + 20, by + 10],
    [dur - 0.2, bx + 120, by + 120],
  ];
  void dur;
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Bg tone="accent" />
      <At x={W / 2} y={pick(P, 175, 215)} className="z-10">
        <Headline t={t} tone="accent" size={pick(P, 112, 100)} lines={pick(P, ["Nothing moves", "until you *click.*"], ["Nothing", "moves until", "you *click.*"])} />
      </At>

      {["factura_luz_sept.pdf", "Alex_Kim_CV.docx", "paella_valenciana.txt"].map((nm, i) => (
        <Fly key={nm} t={t} x={chipX} y={chipY(i)} at={0.2 + i * 0.12} dur={0.5} from={{ y: 30 }} float={3} phase={i * 1.7} out={clickT + 0.2 + i * 0.12} outDur={0.6} to={{ x: pick(P, 700, 620), y: -40 - i * 20, s: 0.7, r: 6 }} ease={easeOut} z={4}>
          <Card className="flex items-center !rounded-[14px] px-5" style={{ height: 68 }}>
            <FileChip kind={(["pdf", "doc", "txt"] as const)[i]} name={nm} size={26} />
          </Card>
        </Fly>
      ))}

      <Fly t={t} x={bx} y={by} at={0.1} dur={0.6} from={{ y: 40 }} z={6}>
        <motion.div className="relative" style={{ scale: press }}>
          <motion.span className="absolute inset-0 rounded-[18px] border-[3px]" style={{ scale: pulseS, opacity: pulseO, borderColor: TONE.accent.ring }} />
          <span className="font-mac relative flex h-[84px] items-center gap-3 rounded-[18px] px-12 text-[32px] font-medium" style={{ background: "var(--inv-bg)", color: "var(--inv-ink)", boxShadow: "0 18px 36px -14px rgba(0,0,0,.45)" }}>
            {n > 0 ? <><Check size={34} strokeWidth={3} /> Moved</> : "Move Files"}
          </span>
        </motion.div>
      </Fly>
      <Pointer t={t} path={path} clicks={[clickT]} tone="accent" />
    </div>
  );
}

/* ============================================================ 4. History */

export function SceneHistory({ t, dur }: SceneProps) {
  const { W, portrait: P } = useCanvas();
  const out = dur + 9;
  const cw = pick(P, 560, 640), chh = 280;
  const cx = pick(P, 955, 360), cy = pick(P, 360, 700);
  const L = cx - cw / 2, Tp = cy - chh / 2;
  const clickT = 2.3;
  const n = useBeat(t, [clickT + 0.05]);
  const gs = pick(P, 42, 48), gap = (cw - 56) / 7;
  const home = (i: number) => ({ x: L + 28 + gap * i + gap / 2, y: Tp + 205 });
  const targets: [number, number][] = pick(P,
    [[130, 110], [400, 85], [610, 150], [95, 610], [340, 640], [590, 610], [1190, 105]],
    [[70, 70], [360, 55], [650, 80], [60, 430], [660, 430], [90, 900], [640, 900]]);
  const rot = [-18, 12, 22, -10, 16, -24, 9];
  const btnX = L + cw - 28 - 56, btnY = Tp + 100;
  const note = useTransform(t, (v) => win(v, clickT + 0.9, clickT + 1.3));
  const noteY = useTransform(note, (p) => (1 - p) * 10);
  const path: [number, number, number][] = [
    [0.7, L + cw + pick(P, 20, -20), Tp + chh + 90],
    [clickT - 0.1, btnX + 6, btnY + 6],
    [dur - 0.2, btnX + 60, btnY + 100],
  ];
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Glow t={t} x={pick(P, 330, W / 2)} y={pick(P, 360, 250)} size={pick(P, 800, 760)} />
      <At x={pick(P, 70, W / 2)} y={pick(P, 360, 230)} left={!P} className="z-10">
        <Headline t={t} still align={P ? "center" : "left"} size={pick(P, 118, 120)} lines={["One click", "*back.*"]} />
      </At>

      <Fly t={t} x={cx} y={cy} at={-0.3} dur={0.8} out={out} from={{ y: 60 }} to={{ y: -30 }} z={4}>
        <Card className="relative" style={{ width: cw, height: chh }}>
          <div className="flex h-[64px] items-center gap-3 border-b border-[var(--mac-line)] px-7 text-[22px] font-semibold text-[var(--mac-text-2)]">
            <History size={24} className="text-[var(--mac-tint)]" /> History
          </div>
          <div className="flex h-[72px] items-center gap-3 px-7">
            <CheckCircle2 size={30} className="text-[var(--mac-green)]" />
            <span className="text-[28px] font-semibold">Moved 7 files</span>
            <span className="relative ml-auto">
              <span className="mac-btn !h-[44px] !rounded-[10px] !px-5 text-[22px] font-medium">{n > 0 ? <><Check size={22} strokeWidth={3} /> Undone</> : "Undo"}</span>
            </span>
          </div>
          <motion.div className="absolute right-0 left-0 text-center text-[22px] text-[var(--mac-text-2)]" style={{ top: 178, opacity: note, y: noteY }}>
            Each file, back where it was.
          </motion.div>
        </Card>
      </Fly>

      {Array.from({ length: 7 }, (_, i) => (
        <Flyer key={i} t={t} i={i} from={home(i)} to={targets[i]} start={clickT + 0.05 + i * 0.05} r={rot[i]} size={gs} out={out} />
      ))}
      <Pointer t={t} path={path} clicks={[clickT]} off={out} />
    </div>
  );
}

const KINDS = ["pdf", "img", "doc", "txt", "pdf", "img", "doc"] as const;
function Flyer({ t, i, from, to, start, r, size, out }: { t: T; i: number; from: { x: number; y: number }; to: [number, number]; start: number; r: number; size: number; out: number }) {
  const calc = (v: number) => {
    const p = win(v, start, start + 0.85, easeOut);
    return { p, x: lerp(from.x, to[0], p), y: lerp(from.y, to[1], p) - Math.sin(Math.PI * p) * 70 };
  };
  const X = useTransform(t, (v) => calc(v).x);
  const Y = useTransform(t, (v) => calc(v).y + (v > start + 0.85 ? Math.sin(v * 1.3 + i) * 5 : 0));
  const R = useTransform(t, (v) => lerp(0, r, calc(v).p));
  const S = useTransform(t, (v) => lerp(1, 1.35, calc(v).p));
  const O = useTransform(t, (v) => win(v, -0.7, -0.15, (x) => x) * (1 - win(v, out + 0.05, out + 0.4, easeInOut)));
  return (
    <motion.div className="absolute z-10" style={{ left: 0, top: 0, x: X, y: Y, rotate: R, scale: S, opacity: O, translate: "-50% -50%", filter: "drop-shadow(0 8px 14px rgba(0,0,0,.18))" }}>
      <FileGlyph kind={KINDS[i]} size={size} />
    </motion.div>
  );
}
