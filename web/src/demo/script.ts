/**
 * One scripted session, shared by every draft: drop files, review, correct one and teach it,
 * move, then (a week later) a similar file is filed by what Organizy learned.
 * Times are in seconds. Everything is derived from `t`, so autoplay and scroll-scrubbing both work.
 */

export type Why = "Rule" | "You";
export type Row = { name: string; dest: string; reason: string; why: Why; kind: "pdf" | "img" | "doc" | "sheet" | "txt" };

export const FILES: Row[] = [
  { name: "factura_luz_sept.pdf", dest: "Invoices & Receipts", reason: "content mentions “total a pagar”", why: "Rule", kind: "pdf" },
  { name: "IMG_4478.HEIC", dest: "Images", reason: ".heic file", why: "Rule", kind: "img" },
  { name: "Screenshot 2026-10-14 at 9.41.png", dest: "Screenshots", reason: "name contains “Screenshot”", why: "Rule", kind: "img" },
  { name: "estado_cuenta_oct.pdf", dest: "Bank Statements", reason: "content mentions “saldo anterior”", why: "Rule", kind: "pdf" },
  { name: "W-2_2025.pdf", dest: "Taxes", reason: "name mentions “W-2”", why: "Rule", kind: "pdf" },
  { name: "Alex_Kim_CV.docx", dest: "Resumes & CVs", reason: "name mentions “CV”", why: "Rule", kind: "doc" },
  { name: "paella_valenciana.txt", dest: "Documents", reason: ".txt file", why: "Rule", kind: "txt" },
  { name: "budget_2026.xlsx", dest: "Spreadsheets", reason: ".xlsx file", why: "Rule", kind: "sheet" },
];
export const TEACH_ROW = 6;
export const UNTICK_ROW = 7; // budget_2026.xlsx stays where it is
export const NEW_FILE: Row = { name: "tortilla_de_patatas.txt", dest: "Recipes", reason: "similar to 1 file filed here (71%)", why: "Rule", kind: "txt" };
export const KEYWORDS = ["paella", "arroz", "receta", "ingredientes"];
export const PICKED = 2; // "receta"

export const K = {
  lassoStart: 1.0, lassoEnd: 1.9,
  grab: 2.3, hover: 3.0, drop: 3.5,
  scan: 3.65, rowStep: 0.24, scanEnd: 5.75,
  untick: 6.45,
  menu: 7.0, newFolder: 7.9, typeStart: 8.15, typeEnd: 9.0, create: 9.4,
  teachShow: 9.55, teachClick: 10.6, chip: 11.3, learn: 11.9, learnedEnd: 12.9,
  moveClick: 13.3, sheet: 13.45, confirm: 14.2, moving: 14.35, moved: 15.3,
  act2: 16.5, appear: 16.9, grab2: 17.7, hover2: 18.2, drop2: 18.6, scan2: 18.75, row2: 19.35,
  end: 23.0, T: 24.0,
};

export const CHAPTERS = [
  { id: "drop", title: "Drop", at: 0, line: "Drop a few files, or a whole folder, on the window." },
  { id: "review", title: "Review", at: K.scan, line: "Organizy reads each one and suggests a folder, with the reason. Untick what should stay." },
  { id: "teach", title: "Teach", at: K.menu - 0.6, line: "Change one, and it offers to remember." },
  { id: "move", title: "Move", at: K.moveClick - 0.3, line: "Nothing moves until you confirm. Undo is one click away." },
  { id: "learn", title: "It learns", at: K.act2, line: "Next week, a new recipe goes straight to Recipes." },
] as const;

export const chapterAt = (t: number) => {
  let i = 0;
  CHAPTERS.forEach((c, j) => { if (t >= c.at) i = j; });
  return i;
};

// ---------------------------------------------------------------- window geometry (px inside the window)
export const WIN = { w: 820, h: 560, side: 168, title: 52 };
const C0 = WIN.side; // content x
export const G = {
  toolbarY: 52, chipsY: 96, headY: 136, rowsY: 164, row: 34,
  teachY: 460, footY: 512,
  colCheck: C0 + 16, colName: C0 + 40, colDest: C0 + 236, destW: 172, colReason: C0 + 420, colWhy: WIN.w - 16,
};
export const rowCY = (i: number) => G.rowsY + G.row * i + G.row / 2;
export const MENU_ITEMS = ["Invoices & Receipts", "Bank Statements", "Taxes", "Resumes & CVs", "Documents", "Spreadsheets"];
export const MENU_ITEM_H = 24;
/** The menu opens with the current choice ("Documents") over the popup, like a macOS pop-up button. */
export const menuTop = rowCY(TEACH_ROW) - MENU_ITEM_H / 2 - 4 * MENU_ITEM_H - 5;
export const menuNewFolderCY = menuTop + 5 + MENU_ITEM_H * 6 + 11 + MENU_ITEM_H / 2;
export const SHEET = { x: (WIN.w - 320) / 2 + 40, y: WIN.title, w: 320, h: 150 };
export const createBtn = { x: SHEET.x + SHEET.w - 50, y: SHEET.y + 122 };
export const fieldPt = { x: SHEET.x + 150, y: SHEET.y + 78 };
export const teachBtn = { x: WIN.w - 82, y: G.teachY + 20 };
export const learnBtn = { x: WIN.w - 46, y: G.teachY + 20 };
export const CHIP_W = 68;
export const chipX = (i: number) => C0 + 224 + i * (CHIP_W + 8) + CHIP_W / 2; // centre of keyword chip i
export const moveBtn = { x: WIN.w - 62, y: G.footY + 24 };
export const CONFIRM = { x: (WIN.w - 340) / 2 + 40, y: WIN.title, w: 340, h: 156 };
export const confirmBtn = { x: CONFIRM.x + CONFIRM.w - 58, y: CONFIRM.y + 128 };

// ---------------------------------------------------------------- discrete state
export type Snap = {
  chapter: number;
  view: "empty" | "scan" | "list" | "moved" | "scan2" | "list2";
  hover: boolean;
  rows: number;
  progress: number; // 0..1 while scanning
  current: string;
  menu: "closed" | "open" | "newfolder";
  sheet: number; // -1 hidden, else typed characters of "Recipes"
  taught: boolean; // paella now goes to Recipes (You)
  teach: "none" | "offer" | "keywords" | "learned";
  picked: boolean;
  confirm: boolean;
  unticked: boolean; // the last row was unticked, so it stays put
  leaving: number; // rows that have flown out
  drag: "none" | "stack" | "one";
  selected: number; // desktop icons selected so far
  desktopGone: boolean; // the 8 files have moved off the desktop
  newFile: "hidden" | "shown" | "gone";
  windowOpen: boolean; // only Draft C starts with the window closed
};

const NAME = "Recipes";

export function snapAt(t: number, opts: { windowStartsClosed?: boolean } = {}): Snap {
  const view: Snap["view"] =
    t < K.scan ? "empty" : t < K.scanEnd ? "scan" : t < K.moved ? "list" : t < K.scan2 ? "moved" : t < K.row2 ? "scan2" : "list2";
  const scanP = Math.min(1, Math.max(0, (t - K.scan) / (K.scanEnd - K.scan)));
  const rows = view === "scan" ? Math.min(8, Math.floor((t - K.scan) / K.rowStep)) : view === "list" ? 8 : 0;
  const teach: Snap["teach"] =
    t < K.teachShow || t >= K.moveClick ? "none" : t < K.teachClick ? "offer" : t < K.learn ? "keywords" : t < K.learnedEnd ? "learned" : "none";
  const lassoP = Math.min(1, Math.max(0, (t - K.lassoStart) / (K.lassoEnd - K.lassoStart)));
  return {
    chapter: chapterAt(t),
    view: t >= K.end ? "list2" : view,
    hover: (t >= K.hover && t < K.drop) || (t >= K.hover2 && t < K.drop2),
    rows,
    progress: view === "scan" ? scanP : view === "scan2" ? Math.min(1, (t - K.scan2) / (K.row2 - K.scan2)) : 0,
    current: view === "scan" ? FILES[Math.min(7, Math.floor(scanP * 8))].name : view === "scan2" ? NEW_FILE.name : "",
    menu: t >= K.menu && t < K.newFolder + 0.05 ? (t >= K.newFolder - 0.45 ? "newfolder" : "open") : "closed",
    sheet: t >= K.newFolder + 0.1 && t < K.create + 0.12 ? Math.min(NAME.length, Math.max(0, Math.floor(((t - K.typeStart) / (K.typeEnd - K.typeStart)) * NAME.length))) : -1,
    taught: t >= K.create + 0.1,
    teach,
    picked: t >= K.chip,
    confirm: t >= K.sheet && t < K.confirm + 0.1,
    unticked: t >= K.untick && t < K.T - 0.3,
    leaving: t < K.moving ? 0 : Math.min(8, Math.floor((t - K.moving) / 0.1) + 1),
    drag: t >= K.grab && t < K.drop ? "stack" : t >= K.grab2 && t < K.drop2 ? "one" : "none",
    selected: Math.floor(lassoP * 8 + (t >= K.lassoEnd ? 1 : 0)),
    desktopGone: t >= K.moving + 0.2 && t < K.T - 0.3,
    newFile: t < K.appear || t >= K.T - 0.3 ? "hidden" : t < K.grab2 ? "shown" : "gone",
    windowOpen: !opts.windowStartsClosed || (t >= K.drop && t < K.moved + 0.6) || (t >= K.drop2 && t < K.T - 0.3),
  };
}

export const sameSnap = (a: Snap, b: Snap) => {
  for (const k in a) if (a[k as keyof Snap] !== b[k as keyof Snap]) return false;
  return true;
};

// ---------------------------------------------------------------- cursor
export type Pt = { x: number; y: number };
export type Layout = {
  W: number; H: number;
  win: Pt; // window origin in stage coordinates
  icons: Pt[]; // the 8 files on the desktop (centres)
  lasso: [Pt, Pt];
  grab: Pt;
  drop: Pt;
  newIcon: Pt;
  drop2?: Pt;
  rest: Pt;
};

type KF = [number, Pt];
const easeIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export function cursorPath(L: Layout): KF[] {
  const w = (p: Pt): Pt => ({ x: L.win.x + p.x, y: L.win.y + p.y });
  const at = (t: number, p: Pt, lead = 0.35): KF[] => [[t - lead, p], [t, p]];
  return [
    [0, L.rest],
    [0.5, L.rest],
    ...at(K.lassoStart, L.lasso[0], 0.15),
    [K.lassoEnd, L.lasso[1]],
    ...at(K.grab, L.grab, 0.15),
    [K.hover + 0.1, L.drop],
    [K.drop, L.drop],
    [K.scan + 0.9, w({ x: 640, y: 110 })],
    [K.scanEnd + 0.4, w({ x: 650, y: 120 })],
    ...at(K.untick, w({ x: G.colCheck + 7, y: rowCY(UNTICK_ROW) }), 0.3),
    ...at(K.menu, w({ x: G.colDest + G.destW / 2 - 20, y: rowCY(TEACH_ROW) }), 0.3),
    ...at(K.newFolder, w({ x: G.colDest + 60, y: menuNewFolderCY }), 0.35),
    [K.typeStart, w(fieldPt)],
    [K.typeEnd, w(fieldPt)],
    ...at(K.create, w(createBtn), 0.3),
    ...at(K.teachClick, w(teachBtn), 0.35),
    ...at(K.chip, w({ x: chipX(PICKED), y: G.teachY + 20 }), 0.3),
    ...at(K.learn, w(learnBtn), 0.3),
    ...at(K.moveClick, w(moveBtn), 0.35),
    ...at(K.confirm, w(confirmBtn), 0.35),
    [K.moved + 0.4, w({ x: 560, y: 300 })],
    [K.appear + 0.3, w({ x: 560, y: 300 })],
    ...at(K.grab2, L.newIcon, 0.35),
    [K.hover2 + 0.1, L.drop2 ?? L.drop],
    [K.drop2, L.drop2 ?? L.drop],
    [K.row2 + 0.6, w({ x: 600, y: 250 })],
    [K.end, w({ x: 600, y: 250 })],
    [K.T, L.rest],
  ];
}

export function along(kfs: KF[], t: number): Pt {
  if (t <= kfs[0][0]) return kfs[0][1];
  for (let i = 1; i < kfs.length; i++) {
    const [t1, p1] = kfs[i];
    if (t <= t1) {
      const [t0, p0] = kfs[i - 1];
      const e = t1 === t0 ? 1 : easeIO((t - t0) / (t1 - t0));
      return { x: p0.x + (p1.x - p0.x) * e, y: p0.y + (p1.y - p0.y) * e };
    }
  }
  return kfs[kfs.length - 1][1];
}

export const CLICKS = [K.lassoStart, K.grab, K.drop, K.untick, K.menu, K.newFolder, K.create, K.teachClick, K.chip, K.learn, K.moveClick, K.confirm, K.grab2, K.drop2];
/** 0..1 while a click ring is expanding, else -1. */
export function clickAt(t: number) {
  for (const c of CLICKS) if (t >= c && t < c + 0.35) return (t - c) / 0.35;
  return -1;
}
/** Is the mouse button held (lasso and drags)? */
export const pressed = (t: number) => (t >= K.lassoStart && t < K.lassoEnd) || (t >= K.grab && t < K.drop) || (t >= K.grab2 && t < K.drop2);
