import { ListChecks } from "lucide-react";
import { motion, useTransform } from "motion/react";
import { easeInOut, easeOut, useCanvas, type SceneProps } from "../Film";
import { At, Card, FileChip, FolderGlyph, Pill, tickIcon } from "./bits";
import { Fly, Glow, Headline, pick, Typed, type T, win } from "./kit";

/* ============================================================ 5. Small things: headline */

export function SceneSmall({ t, dur }: SceneProps) {
  const { W, H, portrait: P } = useCanvas();
  const out = dur - 0.4;
  const items = pick(P,
    [[190, 125, -6], [1100, 165, 5], [1060, 600, -4]],
    [[190, 120, -6], [535, 205, 5], [360, 850, -3]]);
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Glow t={t} x={W / 2} y={pick(P, H / 2, 560)} size={pick(P, 980, 800)} out={out} />
      <At x={W / 2} y={pick(P, H / 2, 560)} className="z-10">
        <Headline t={t} still size={pick(P, 134, 112)} lines={pick(P, ["Small things", "it gets *right*"], ["Small", "things it", "gets *right*"])} out={out} />
      </At>
      <Fly t={t} x={items[0][0]} y={items[0][1]} at={-0.3} dur={0.7} out={out} from={{ y: 70, r: items[0][2] * 3 }} float={5} z={3}>
        <Card className="flex items-center gap-3 !rounded-[14px] px-5" style={{ height: 64, transform: `rotate(${items[0][2]}deg)` }}>
          <FolderGlyph size={30} /><span className="text-[24px]">Invoices &amp; Receipts</span>
        </Card>
      </Fly>
      <Fly t={t} x={items[1][0]} y={items[1][1]} at={-0.2} dur={0.7} out={out} from={{ y: -60, r: -items[1][2] * 3 }} float={5} phase={2} z={3}>
        <Card className="!rounded-[14px] px-5 py-[14px]" style={{ transform: `rotate(${items[1][2]}deg)` }}><span className="mono text-[22px]">pdf, doc, docx</span></Card>
      </Fly>
      <Fly t={t} x={items[2][0]} y={items[2][1]} at={-0.1} dur={0.7} out={out} from={{ y: 70, r: items[2][2] * 3 }} float={5} phase={4} z={3}>
        <Card className="!rounded-[14px] px-5 py-[14px]" style={{ transform: `rotate(${items[2][2]}deg)` }}><FileChip kind="pdf" name="Report (2).pdf" size={24} /></Card>
      </Fly>
    </div>
  );
}

/* ============================================================ 5a. Thirteen folders, ready */

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
    <motion.div className="absolute" style={{ left: x - w / 2, top: y - h / 2, width: w, height: h, rotateX: RX, y: Y, opacity: O, transformPerspective: 700, transformOrigin: "50% 0%" }}>
      <Card className="relative flex h-full items-center gap-3 !rounded-[12px] px-4">
        <FolderGlyph size={size * 1.15} />
        <span className="truncate" style={{ fontSize: size }}>{name}</span>
        <motion.span className="pointer-events-none absolute inset-0 rounded-[12px] border-2 border-[var(--accent)]" style={{ opacity: pulse }} />
      </Card>
    </motion.div>
  );
}

export function SceneThirteen({ t, dur }: SceneProps) {
  const { W, portrait: P } = useCanvas();
  const out = dur - 0.45;
  const cw = pick(P, 320, 322), rh = pick(P, 56, 52), g = pick(P, 62, 60);
  const colX = pick(P, [740, 1080], [196, 524]);
  const top = pick(P, 150, 395);
  const size = pick(P, 23, 21);
  const grid = useTransform(t, (v) => 1 - win(v, out, out + 0.4, easeInOut));
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Glow t={t} x={pick(P, 330, W / 2)} y={pick(P, 360, 170)} size={pick(P, 820, 720)} out={out} />
      <At x={pick(P, 60, W / 2)} y={pick(P, 330, 165)} left={!P} className="z-10">
        <Headline t={t} align={P ? "center" : "left"} size={pick(P, 112, 96)} lines={["Thirteen", "folders,", "*ready.*"]} out={out} at={-0.4} />
      </At>
      <motion.div className="absolute inset-0" style={{ opacity: grid }}>
        {FOLDERS.map((n, i) => (
          <Flap key={n} t={t} at={0.05 + i * 0.16} x={colX[i % 2]} y={top + Math.floor(i / 2) * g} w={cw} h={rh} size={size} name={n} />
        ))}
      </motion.div>
      <Fly t={t} x={pick(P, 760, 360)} y={pick(P, 640, 830)} at={2.3} dur={0.5} out={out} from={{ y: 20 }} z={5}>
        <Pill size={pick(P, 21, 20)} icon={<FolderGlyph size={24} />}>Inside Documents › Organizy</Pill>
      </Fly>
      <Fly t={t} x={pick(P, 1100, 360)} y={pick(P, 640, 900)} at={2.55} dur={0.5} out={out} from={{ y: 20 }} z={5}>
        <Pill size={pick(P, 21, 20)} icon={<ListChecks size={24} className="text-[var(--accent)]" />}>Change any in Rules</Pill>
      </Fly>
    </div>
  );
}

/* ============================================================ 5b. Rules in plain words */

const FIELDS = [
  { label: "File types", text: "pdf, doc, docx, pages, rtf, txt", at: 0.35 },
  { label: "Name contains", text: "Screenshot, Scan", at: 1.35 },
  { label: "Keywords", text: "receipt, amount due, factura", at: 2.0 },
];
const CPS = 34;

export function SceneRules({ t, dur }: SceneProps) {
  const { W, portrait: P } = useCanvas();
  const out = dur - 0.45;
  const cw = pick(P, 590, 640), cx = pick(P, 940, 360), cy = pick(P, 310, 470);
  const chipsY = pick(P, [540, 600], [700, 770]);
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Glow t={t} x={pick(P, 330, W / 2)} y={pick(P, 330, 170)} size={pick(P, 820, 720)} out={out} />
      <At x={pick(P, 60, W / 2)} y={pick(P, 330, 135)} left={!P} className="z-10">
        <Headline t={t} align={P ? "center" : "left"} size={pick(P, 112, 90)} lines={pick(P, ["Rules", "in *plain*", "words."], ["Rules in", "*plain* words."])} out={out} at={-0.4} />
      </At>
      <Fly t={t} x={cx} y={cy} at={-0.3} dur={0.7} out={out} from={{ y: 50 }} to={{ y: -30 }} z={4}>
        <Card className="p-6" style={{ width: cw }}>
          <div className="mb-3 flex items-center gap-3 text-[22px] font-semibold text-[var(--mac-text-2)]"><ListChecks size={24} className="text-[var(--mac-tint)]" /> Rule</div>
          {FIELDS.map((f) => (
            <div key={f.label} className="mt-4">
              <div className="mb-[6px] text-[18px] text-[var(--mac-text-2)]">{f.label}</div>
              <div className="mono flex h-[50px] items-center rounded-[10px] border border-[var(--mac-control-line)] bg-[var(--mac-control)] px-4 text-[21px]">
                <span><Typed t={t} text={f.text} at={f.at} cps={CPS} /></span>
              </div>
            </div>
          ))}
        </Card>
      </Fly>
      <Chips t={t} P={P} cx={cx} y1={chipsY[0]} y2={chipsY[1]} out={out} />
    </div>
  );
}

function Chips({ t, P, cx, y1, y2, out }: { t: T; P: boolean; cx: number; y1: number; y2: number; out: number }) {
  const row1 = ["Invoices", "Bank statements", "Taxes", "Resumes"];
  const wd = [128, 222, 104, 128];
  const gap = 12;
  const total = wd.reduce((a, b) => a + b, 0) + gap * 3;
  let acc = cx - total / 2;
  return (
    <>
      {row1.map((n, i) => {
        const x = acc + wd[i] / 2;
        acc += wd[i] + gap;
        return (
          <Fly key={n} t={t} x={x} y={y1} at={2.7 + i * 0.1} dur={0.45} out={out} from={{ y: 24, s: 0.9 }} z={5}>
            <Pill size={21} className="justify-center" >{n}</Pill>
          </Fly>
        );
      })}
      {["English", "Español"].map((n, i) => (
        <Fly key={n} t={t} x={cx + (i - 0.5) * 150} y={y2} at={3.15 + i * 0.12} dur={0.45} out={out} from={{ y: 24, s: 0.9 }} z={5}>
          <span className="inline-flex h-[46px] items-center rounded-full border border-[var(--accent)] px-5 text-[21px] font-medium text-[var(--accent-ink)]">{n}</span>
        </Fly>
      ))}
    </>
  );
}

/* ============================================================ 5c. Never overwrites */

export function SceneOverwrite({ t, dur }: SceneProps) {
  const { W, portrait: P } = useCanvas();
  const out = dur - 0.4;
  const names = ["Report.pdf", "Report (2).pdf", "Report (3).pdf"];
  const pos = (i: number): [number, number] => pick(P, [W / 2 + (i - 1) * 350, 500] as [number, number], [W / 2, 530 + i * 104] as [number, number]);
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Glow t={t} x={W / 2} y={pick(P, 210, 250)} size={pick(P, 900, 760)} out={out} />
      <At x={W / 2} y={pick(P, 205, 235)} className="z-10">
        <Headline t={t} size={pick(P, 128, 100)} lines={["Never", "*overwrites.*"]} out={out} at={-0.3} />
      </At>
      {names.map((n, i) => (
        <Fly key={n} t={t} x={pos(i)[0]} y={pos(i)[1]} at={0.35 + i * 0.6} dur={0.6} out={out} from={{ y: -140, r: (i - 1) * 8 }} ease={easeOut} z={4}>
          <Card className="flex items-center !rounded-[16px] px-6" style={{ height: 88, width: pick(P, 330, 520) }}>
            <FileChip kind="pdf" name={n} size={pick(P, 25, 27)} />
          </Card>
        </Fly>
      ))}
      <Fly t={t} x={W / 2} y={pick(P, 640, 880)} at={2.2} dur={0.5} out={out} from={{ y: 20 }} z={5}>
        <Pill size={pick(P, 24, 22)} icon={tickIcon(22)}>Nothing replaced or deleted</Pill>
      </Fly>
    </div>
  );
}
