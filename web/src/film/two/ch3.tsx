import { ListChecks } from "lucide-react";
import { motion, useTransform } from "motion/react";
import { easeOut, useCanvas, type SceneProps } from "../Film";
import { At, Card, FileChip, FolderGlyph, Pill, tickIcon } from "./bits";
import { Beat, Bg, Fly, Glow, Headline, Odometer, pick, Typed, type T, win } from "./kit";

/* ============================================================ 5. Small things: headline that moves */

function Drift({ t, speed, children }: { t: T; speed: number; children: React.ReactNode }) {
  const X = useTransform(t, (v) => v * speed);
  return <motion.div style={{ x: X }}>{children}</motion.div>;
}

export function SceneSmall({ t }: SceneProps) {
  const { W, H, portrait: P } = useCanvas();
  const size = pick(P, 168, 112);
  const lines = pick(P, ["Small things", "it gets *right*"], ["Small", "things it", "gets *right*"]);
  const items = pick(P,
    [[190, 105, -6], [1100, 130, 5], [1060, 615, -4]],
    [[190, 110, -6], [535, 195, 5], [360, 860, -3]]);
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Bg tone="inv" />
      <Glow t={t} x={W / 2} y={H / 2} size={pick(P, 1000, 800)} at={-1} />
      {lines.map((ln, i) => (
        <At key={ln} x={W / 2} y={pick(P, H / 2 - 82 + i * 164, 570 + (i - 1) * 118)} className="z-10">
          <Drift t={t} speed={(i % 2 ? 1 : -1) * pick(P, 34, 12)}>
            <Headline t={t} still tone="inv" size={size} lines={[ln]} />
          </Drift>
        </At>
      ))}
      <Fly t={t} x={items[0][0]} y={items[0][1]} at={-0.3} dur={0.7} from={{ y: 70, r: items[0][2] * 3 }} float={5} z={3}>
        <Card className="flex items-center gap-3 !rounded-[14px] px-5" style={{ height: 64, transform: `rotate(${items[0][2]}deg)` }}>
          <FolderGlyph size={30} /><span className="text-[24px]">Documents</span>
        </Card>
      </Fly>
      <Fly t={t} x={items[1][0]} y={items[1][1]} at={-0.2} dur={0.7} from={{ y: -60, r: -items[1][2] * 3 }} float={5} phase={2} z={3}>
        <Card className="!rounded-[14px] px-5 py-[14px]" style={{ transform: `rotate(${items[1][2]}deg)` }}><span className="mono text-[22px]">pdf, doc, docx</span></Card>
      </Fly>
      <Fly t={t} x={items[2][0]} y={items[2][1]} at={-0.1} dur={0.7} from={{ y: 70, r: items[2][2] * 3 }} float={5} phase={4} z={3}>
        <Card className="!rounded-[14px] px-5 py-[14px]" style={{ transform: `rotate(${items[2][2]}deg)` }}><FileChip kind="pdf" name="Report (2).pdf" size={24} /></Card>
      </Fly>
    </div>
  );
}

/* ============================================================ 5a. Thirteen folders: a counter and a wall to travel along */

const FOLDERS = [
  "Invoices & Receipts", "Bank Statements", "Taxes", "Resumes & CVs", "Screenshots", "Images", "Videos",
  "Audio", "Spreadsheets", "Presentations", "Documents", "Archives", "Installers",
];

function Flap({ t, at, x, y, w, h, size, name }: { t: T; at: number; x: number; y: number; w: number; h: number; size: number; name: string }) {
  const p = (v: number) => win(v, at, at + 0.42, easeOut);
  const RX = useTransform(t, (v) => (1 - p(v)) * -92);
  const O = useTransform(t, (v) => Math.min(1, p(v) * 3));
  const Y = useTransform(t, (v) => (1 - p(v)) * 14);
  const pulse = useTransform(t, (v) => Math.sin(Math.PI * win(v, at + 0.3, at + 0.9, (q) => q)));
  return (
    <motion.div className="absolute" style={{ left: x - w / 2, top: y - h / 2, width: w, height: h, rotateX: RX, y: Y, opacity: O, transformPerspective: 800, transformOrigin: "50% 0%" }}>
      <Card className="relative flex h-full items-center gap-3 !rounded-[16px] px-5">
        <FolderGlyph size={size * 1.25} />
        <span className="whitespace-nowrap" style={{ fontSize: size }}>{name}</span>
        <motion.span className="pointer-events-none absolute inset-0 rounded-[16px] border-[3px] border-[var(--accent)]" style={{ opacity: pulse }} />
      </Card>
    </motion.div>
  );
}

export function SceneThirteen({ t }: SceneProps) {
  const { portrait: P } = useCanvas();
  const tw = pick(P, 384, 344), th = pick(P, 104, 108), cs = pick(P, 408, 366);
  const size = pick(P, 30, 26);
  const rowY = pick(P, [455, 590], [575, 700]);
  const wallW = 7 * cs;
  const pan = useTransform(t, (v) => -win(v, 0.2, 4.5, (x) => x * x * (3 - 2 * x)) * (wallW - pick(P, 1280, 720) + 70));
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Bg tone="accent" />
      <At x={pick(P, 60, 46)} y={pick(P, 175, 175)} left>
        <Odometer t={t} to={13} a={0.2} b={3.6} size={pick(P, 270, 220)} color="var(--on-accent)" />
      </At>
      <At x={pick(P, 430, 300)} y={pick(P, 175, 175)} left>
        <Headline t={t} tone="accent" align="left" size={pick(P, 112, 84)} lines={["folders,", "*ready.*"]} at={0.0} />
      </At>
      <motion.div className="absolute inset-0" style={{ x: pan }}>
        {FOLDERS.map((n, i) => (
          <Flap key={n} t={t} at={0.2 + i * 0.28} x={46 + Math.floor(i / 2) * cs + tw / 2} y={rowY[i % 2]} w={tw} h={th} size={size} name={n} />
        ))}
      </motion.div>
      <Fly t={t} x={pick(P, 330, 360)} y={pick(P, 668, 842)} at={3.7} dur={0.5} from={{ y: 20 }} z={5}>
        <Pill size={pick(P, 23, 21)} icon={<FolderGlyph size={26} />}>Inside Documents › Organizy</Pill>
      </Fly>
      <Fly t={t} x={pick(P, 960, 360)} y={pick(P, 668, 905)} at={3.95} dur={0.5} from={{ y: 20 }} z={5}>
        <Pill size={pick(P, 23, 21)} icon={<ListChecks size={26} className="text-[var(--accent)]" />}>Change any in Rules</Pill>
      </Fly>
    </div>
  );
}

/* ============================================================ 5b. Rules in plain words: a giant word with the card riding over it */

const FIELDS = [
  { label: "File types", text: "pdf, doc, docx, pages, rtf, txt", at: 0.35 },
  { label: "Name contains", text: "Screenshot, Scan", at: 1.35 },
  { label: "Keywords", text: "receipt, amount due, factura", at: 2.0 },
];
const CPS = 34;

function Chip({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return accent ? (
    <span className="inline-flex h-[46px] items-center rounded-full border border-[var(--accent)] px-5 text-[21px] font-medium whitespace-nowrap text-[var(--accent-ink)]">{children}</span>
  ) : (
    <Pill size={21}>{children}</Pill>
  );
}

export function SceneRules({ t }: SceneProps) {
  const { W, portrait: P } = useCanvas();
  const cw = pick(P, 590, 640), cx = pick(P, 940, 360), cy = pick(P, 315, 632);
  const drift = useTransform(t, (v) => -v * 10);
  const topics = ["Invoices", "Bank statements", "Taxes", "Resumes"];
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="pointer-events-none absolute font-display font-bold"
        style={{
          left: W / 2, top: pick(P, 470, 205), translate: "-50% -50%", x: drift, fontSize: pick(P, 450, 300), lineHeight: 0.9, letterSpacing: "-0.05em",
          color: "color-mix(in oklab, var(--accent) 20%, transparent)", whiteSpace: "nowrap",
        }}
      >
        Rules
      </motion.div>
      <At x={pick(P, 60, W / 2)} y={pick(P, 330, 410)} left={!P} className="z-10">
        <Headline t={t} align={P ? "center" : "left"} size={pick(P, 112, 80)} lines={pick(P, ["in *plain*", "words."], ["in *plain* words."])} at={-0.4} />
      </At>
      <Fly t={t} x={cx} y={cy} at={-0.3} dur={0.7} from={{ y: 50 }} z={4}>
        <Card className="p-6" style={{ width: cw }}>
          <div className="mb-3 flex items-center gap-3 text-[22px] font-semibold text-[var(--mac-text-2)]"><ListChecks size={24} className="text-[var(--mac-tint)]" /> Rule</div>
          {FIELDS.map((f) => (
            <div key={f.label} className="mt-3">
              <div className="mb-[6px] text-[18px] text-[var(--mac-text-2)]">{f.label}</div>
              <div className="mono flex h-[48px] items-center rounded-[10px] border border-[var(--mac-control-line)] bg-[var(--mac-control)] px-4 text-[21px]">
                <span className="whitespace-nowrap"><Typed t={t} text={f.text} at={f.at} cps={CPS} /></span>
              </div>
            </div>
          ))}
        </Card>
      </Fly>
      <Fly t={t} x={cx} y={pick(P, 548, 836)} at={2.7} dur={0.1} z={5}>
        <div className="flex flex-wrap justify-center gap-3" style={{ width: pick(P, 620, 640) }}>
          {topics.map((n, i) => <Beat key={n} t={t} at={2.7 + i * 0.1} y={22} s={0.9}><Chip>{n}</Chip></Beat>)}
        </div>
      </Fly>
      <Fly t={t} x={cx} y={pick(P, 608, 896)} at={3.1} dur={0.1} z={5}>
        <div className="flex gap-3">
          {["English", "Español"].map((n, i) => <Beat key={n} t={t} at={3.1 + i * 0.12} y={22} s={0.9}><Chip accent>{n}</Chip></Beat>)}
        </div>
      </Fly>
    </div>
  );
}

/* ============================================================ 5c. Never overwrites: they all land in Documents */

const REPORTS = ["Report.pdf", "Report (2).pdf", "Report (3).pdf"];

export function SceneOverwrite({ t }: SceneProps) {
  const { W, portrait: P } = useCanvas();
  const pw = pick(P, 540, 620), rowH = 68, head = 78;
  const ph = head + rowH * 3 + 14;
  const px = pick(P, 960, W / 2), py = pick(P, 215, 300);
  const settle = useTransform(t, (v) => 1 + 0.015 * Math.sin(Math.PI * win(v, 1.9, 2.6, (x) => x)));
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Bg tone="inv" />
      <Glow t={t} x={pick(P, 960, W / 2)} y={pick(P, 220, 300)} size={pick(P, 900, 760)} at={-1} />
      <At x={pick(P, 44, W / 2)} y={pick(P, 540, 735)} left={!P} className="z-10">
        <Headline t={t} tone="inv" align={P ? "center" : "left"} size={pick(P, 196, 100)} lines={["Never", "*overwrites.*"]} at={-0.4} lh={0.94} />
      </At>
      <Fly t={t} x={px} y={py} at={-0.3} dur={0.6} from={{ y: -60 }} z={4}>
        <motion.div style={{ scale: settle }}>
          <Card className="relative overflow-hidden" style={{ width: pw, height: ph }}>
            <div className="flex items-center gap-3 border-b border-[var(--mac-line)] px-6" style={{ height: head - 14 }}>
              <FolderGlyph size={36} /><span className="text-[28px] font-semibold">Documents</span>
            </div>
            {REPORTS.map((n, i) => (
              <Row key={n} t={t} at={0.4 + i * 0.7} top={head - 14 + i * rowH} h={rowH} name={n} />
            ))}
          </Card>
        </motion.div>
      </Fly>
      <Fly t={t} x={pick(P, 960, W / 2)} y={pick(P, 410, 545)} at={2.3} dur={0.5} from={{ y: 20 }} z={5}>
        <Pill size={pick(P, 23, 22)} icon={tickIcon(22)}>Nothing replaced or deleted</Pill>
      </Fly>
    </div>
  );
}

function Row({ t, at, top, h, name }: { t: T; at: number; top: number; h: number; name: string }) {
  const I = useTransform(t, (v) => win(v, at, at + 0.45));
  const Y = useTransform(I, (i) => (1 - i) * -46);
  const flash = useTransform(t, (v) => Math.sin(Math.PI * win(v, at + 0.3, at + 0.9, (x) => x)));
  return (
    <motion.div className="absolute right-0 left-0 flex items-center px-6" style={{ top, height: h, opacity: I, y: Y }}>
      <motion.span className="absolute inset-x-3 inset-y-1 rounded-[10px]" style={{ opacity: flash, background: "var(--mac-tint-soft)" }} />
      <span className="relative"><FileChip kind="pdf" name={name} size={26} /></span>
    </motion.div>
  );
}
