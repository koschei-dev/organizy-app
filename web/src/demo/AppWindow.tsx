import { Check, ChevronsUpDown, Eye, Folder, GraduationCap, History, Inbox as TrayIcon, ListChecks, PanelLeft, Settings, WandSparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  CHIP_W, CONFIRM, FILES, G, UNTICK_ROW, KEYWORDS, MENU_ITEM_H, MENU_ITEMS, menuTop, NEW_FILE, PICKED, rowCY, SHEET, type Row, type Snap, TEACH_ROW, WIN,
} from "./script";
import { FileGlyph } from "./FileGlyph";

const spring = { type: "spring", bounce: 0.15, duration: 0.45 } as const;

/** Organizy's Organize screen at a fixed design size (820 × 560). The draft scales it as one piece. */
export function AppWindow({ s }: { s: Snap }) {
  const rows: Row[] = s.view === "list2" || s.view === "scan2" ? (s.view === "list2" ? [NEW_FILE] : []) : FILES.slice(0, s.rows);
  const listed = s.view === "scan" || s.view === "list";
  const counts = new Map<string, number>();
  if (s.view === "list") FILES.forEach((f, i) => { const d = i === TEACH_ROW && s.taught ? "Recipes" : f.dest; counts.set(d, (counts.get(d) ?? 0) + 1); });
  if (s.view === "list2") counts.set("Recipes", 1);

  return (
    <div
      className="mac relative overflow-hidden rounded-[12px] border border-[var(--mac-line)] bg-[var(--mac-window)]"
      style={{ width: WIN.w, height: WIN.h, boxShadow: "var(--mac-shadow)" }}
    >
      {/* sidebar */}
      <nav className="absolute inset-y-0 left-0 flex flex-col bg-[var(--mac-sidebar)] px-[10px] pt-3" style={{ width: WIN.side }}>
        <div className="mb-4 flex items-center justify-between pr-2 pl-1">
          <span className="flex gap-[7px]">
            <span className="size-3 rounded-full bg-[#FF5F57]" />
            <span className="size-3 rounded-full bg-[#FEBC2E]" />
            <span className="size-3 rounded-full bg-[#28C840]" />
          </span>
          <PanelLeft size={15} className="text-[var(--mac-text-2)]" />
        </div>
        {[["Organize", WandSparkles], ["Rules", ListChecks], ["History", History], ["Settings", Settings]].map(([label, Icon], i) => {
          const I = Icon as typeof WandSparkles;
          return (
            <div key={label as string} className={`flex items-center gap-2 rounded-[6px] px-2 py-[5px] ${i === 0 ? "bg-[var(--mac-text)]/10" : ""}`}>
              <I size={15} className="text-[var(--mac-tint)]" />
              <span>{label as string}</span>
            </div>
          );
        })}
      </nav>

      {/* content */}
      <section className="absolute inset-y-0 right-0" style={{ left: WIN.side }}>
        <header className="flex h-[52px] items-center border-b border-[var(--mac-line)] bg-[var(--mac-bar)] px-4">
          <span className="text-[15px] font-semibold text-[var(--mac-text-2)]">Organize</span>
        </header>
        <div className="flex h-[44px] items-center gap-3 border-b border-[var(--mac-line)] px-3">
          <span className="mac-btn"><Folder size={13} /> Choose Folder…</span>
          <span className="flex items-center gap-1.5 text-[var(--mac-text-2)]">
            <Folder size={15} className="fill-[#5AB0F7] text-[#5AB0F7]" />
            {s.view === "empty" ? "No folder selected" : s.view === "scan2" || s.view === "list2" ? "1 file dropped" : "8 files dropped"}
          </span>
          <span className="mac-btn ml-auto">Scan</span>
        </div>

        {/* folder chips */}
        <div className="flex h-[40px] items-center gap-1.5 overflow-hidden px-3">
          <AnimatePresence initial={false}>
            {[...counts].map(([d, n]) => (
              <motion.span
                layout
                key={d}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={spring}
                className={`flex flex-none items-center gap-1 rounded-full px-2.5 py-[3px] text-[12px] ${d === "Recipes" ? "bg-[var(--mac-tint)] text-white dark:text-[#111118]" : "bg-[var(--mac-alt)] text-[var(--mac-text-2)]"}`}
              >
                {d} <b className="font-semibold">{n}</b>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {/* table header */}
        <div className="absolute right-0 left-0 grid h-[28px] items-center border-y border-[var(--mac-line)] px-4 text-[11.5px] text-[var(--mac-text-2)]" style={{ top: G.headY }}>
          <span className="absolute" style={{ left: G.colName - WIN.side }}>Name</span>
          <span className="absolute" style={{ left: G.colDest - WIN.side }}>Destination</span>
          <span className="absolute" style={{ left: G.colReason - WIN.side }}>Reason</span>
          <span className="absolute right-4">Why</span>
        </div>

        {/* rows */}
        <div className="absolute right-0 left-0" style={{ top: G.rowsY }}>
          <AnimatePresence>
            {rows.map((f, i) => {
              const isTeach = listed && i === TEACH_ROW;
              const dest = isTeach && s.taught ? "Recipes" : f.dest;
              const why = isTeach && s.taught ? "You" : f.why;
              const isOff = listed && i === UNTICK_ROW && s.unticked;
              const gone = s.view === "list" && i < s.leaving && !isOff;
              const learned = s.view === "list2";
              return (
                <motion.div
                  key={f.name}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: gone ? 0 : 1, y: 0, x: gone ? 40 : 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className={`absolute right-0 left-0 flex items-center ${i % 2 ? "bg-[var(--mac-alt)]" : ""} ${learned ? "bg-[var(--mac-tint-soft)]" : ""}`}
                  style={{ top: G.row * i, height: G.row }}
                >
                  {(listed || learned) && (
                    <span
                      className={`absolute grid size-[14px] place-items-center rounded-[4px] border ${isOff ? "border-[var(--mac-control-line)] bg-[var(--mac-control)]" : "border-[var(--mac-tint)] bg-[var(--mac-tint)]"}`}
                      style={{ left: G.colCheck - WIN.side }}
                    >
                      {!isOff && <Check size={10} strokeWidth={3} className="text-white dark:text-[#111118]" />}
                    </span>
                  )}
                  <span className={`absolute flex items-center gap-2 ${isOff ? "opacity-45" : ""}`} style={{ left: G.colName - WIN.side, width: G.colDest - G.colName - 14 }}>
                    <FileGlyph kind={f.kind} size={16} />
                    <span className="mono truncate text-[12px]">{f.name}</span>
                  </span>
                  <span
                    className="mac-select absolute flex items-center"
                    style={{ left: G.colDest - WIN.side, width: G.destW, background: "var(--mac-control)", paddingRight: 8 }}
                  >
                    <span className="truncate">{dest}</span>
                    <ChevronsUpDown size={11} className="ml-auto flex-none text-[var(--mac-text-2)]" />
                  </span>
                  <span className="absolute truncate text-[11.5px] text-[var(--mac-text-2)]" style={{ left: G.colReason - WIN.side, width: 168 }}>
                    {isTeach && s.taught ? "you chose this folder" : f.reason}
                  </span>
                  <span
                    className={`absolute right-4 rounded-full px-2 py-[1px] text-[11px] font-medium ${
                      why === "You" ? "bg-[#DDF4E7] text-[#1F8A5B] dark:bg-[#1F3A2C] dark:text-[#5FD49A]" : "bg-[var(--mac-tint-soft)] text-[var(--mac-tint-ink)]"
                    }`}
                  >
                    {why}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* empty / drop / moved states */}
        <AnimatePresence>
          {(s.view === "empty" || s.view === "moved") && (
            <motion.div
              key={s.view}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-x-0 grid place-items-center text-center"
              style={{ top: G.rowsY, height: G.footY - G.rowsY }}
            >
              {s.view === "empty" ? (
                <div className="grid justify-items-center gap-2 text-[var(--mac-text-2)]">
                  <TrayIcon size={30} />
                  <p className="m-0 max-w-[300px]">Drop files or a folder here. Organizy reads each file and suggests where it belongs.</p>
                </div>
              ) : (
                <div className="grid justify-items-center gap-1">
                  <span className="grid size-9 place-items-center rounded-full bg-[var(--mac-tint-soft)] text-[var(--mac-tint)]"><Check size={18} /></span>
                  <p className="m-0 text-[15px] font-semibold">Moved 7 files</p>
                  <p className="m-0 text-[var(--mac-text-2)]">Undo anytime from History.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {s.hover && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-2 z-20 grid place-items-center rounded-[10px] border-2 border-dashed border-[var(--mac-tint)] bg-[var(--mac-tint-soft)]/80"
            >
              <span className="flex items-center gap-2 text-[15px] font-semibold text-[var(--mac-tint-ink)]"><TrayIcon size={18} /> Drop to organize</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* teach bar */}
        <AnimatePresence>
          {s.teach !== "none" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={spring}
              className="absolute inset-x-0 flex items-center gap-2 bg-[var(--mac-tint-soft)] px-3"
              style={{ top: G.teachY, height: 40 }}
            >
              <GraduationCap size={15} className="flex-none text-[var(--mac-tint)]" />
              {s.teach === "offer" && (
                <>
                  <span className="truncate">Always send files like <b>paella_valenciana.txt</b> to <b>Recipes</b>?</span>
                  <span className="mac-btn ml-auto">Not Now</span>
                  <span className="mac-btn primary">Teach Organizy…</span>
                </>
              )}
              {s.teach === "keywords" && (
                <>
                  <span className="flex-none">Remember files that mention:</span>
                  {KEYWORDS.map((k, i) => (
                    <span
                      key={k}
                      className={`flex-none rounded-full border px-2 py-[2px] text-[12px] ${
                        i === PICKED && s.picked ? "border-[var(--mac-tint)] bg-[var(--mac-tint)] text-white dark:text-[#111118]" : "border-[var(--mac-control-line)] bg-[var(--mac-control)]"
                      }`}
                      style={{ width: CHIP_W, textAlign: "center" }}
                    >
                      {k}
                    </span>
                  ))}
                  <span className="mac-btn primary ml-auto">Learn</span>
                </>
              )}
              {s.teach === "learned" && <span>Got it. Files that mention <b>receta</b> will go to <b>Recipes</b>.</span>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* footer */}
        <footer className="absolute inset-x-0 bottom-0 flex h-[48px] items-center gap-3 border-t border-[var(--mac-line)] px-3">
          {s.view === "scan" || s.view === "scan2" ? (
            <span className="flex min-w-0 items-center gap-2">
              <span className="relative h-[5px] w-28 flex-none overflow-hidden rounded-full bg-[var(--mac-line)]">
                <span className="absolute inset-y-0 left-0 rounded-full bg-[var(--mac-tint)]" style={{ width: `${Math.round(s.progress * 100)}%` }} />
              </span>
              <span className="mono truncate text-[12px] text-[var(--mac-text-2)]">Analyzing {s.current}</span>
            </span>
          ) : (
            <span className="truncate text-[var(--mac-text-2)]">
              {s.view === "list" ? (s.unticked ? "7 of 8 selected. Nothing moves until you click." : "8 files, 7 folders. Nothing moves until you click.") : s.view === "list2" ? "Learned from what you filed before." : ""}
            </span>
          )}
          <span className="ml-auto flex items-center gap-3">
            <span className="mac-btn" style={{ opacity: s.view === "list" || s.view === "list2" ? 1 : 0.45 }}><Eye size={13} /> Quick Look</span>
            <span className="mac-btn primary" style={{ opacity: s.view === "list" || s.view === "list2" ? 1 : 0.45 }}>Move Files</span>
          </span>
        </footer>
      </section>

      {/* destination menu */}
      <AnimatePresence>
        {s.menu !== "closed" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
            className="absolute z-30 rounded-[8px] border border-[var(--mac-control-line)] bg-[var(--mac-window)] p-[5px] shadow-xl"
            style={{ left: G.colDest - 6, top: menuTop, width: G.destW + 24 }}
          >
            {MENU_ITEMS.map((m) => (
              <div key={m} className="flex items-center gap-1.5 rounded-[5px] px-2" style={{ height: MENU_ITEM_H }}>
                <span className="w-3 text-[11px]">{m === "Documents" ? "✓" : ""}</span>
                {m}
              </div>
            ))}
            <div className="my-[5px] h-px bg-[var(--mac-line)]" />
            <div
              className={`flex items-center gap-1.5 rounded-[5px] px-2 ${s.menu === "newfolder" ? "bg-[var(--mac-tint)] text-white dark:text-[#111118]" : ""}`}
              style={{ height: MENU_ITEM_H }}
            >
              <span className="w-3" />New Folder…
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* new folder sheet */}
      <Sheet show={s.sheet >= 0} box={SHEET}>
        <p className="m-0 mb-3 font-semibold">New folder</p>
        <label className="grid grid-cols-[60px_1fr] items-center gap-2">
          <span className="text-[var(--mac-text-2)]">Name</span>
          <span className="mac-input flex items-center" style={{ borderColor: "var(--mac-tint)", boxShadow: "0 0 0 3px var(--mac-tint-soft)" }}>
            {"Recipes".slice(0, Math.max(0, s.sheet))}
            <span className="ml-[1px] inline-block h-[14px] w-px animate-pulse bg-[var(--mac-text)]" />
          </span>
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <span className="mac-btn">Cancel</span>
          <span className="mac-btn primary">Create</span>
        </div>
      </Sheet>

      {/* move confirmation */}
      <Sheet show={s.confirm} box={CONFIRM}>
        <img src="/organizy-app/icon-96.png" alt="" width={36} height={36} className="mb-2" />
        <p className="m-0 mb-1 font-semibold">Move 7 files?</p>
        <p className="m-0 mb-3 text-[var(--mac-text-2)]">They go into folders inside Documents › Organizy. You can undo this from History.</p>
        <div className="flex justify-end gap-2">
          <span className="mac-btn">Cancel</span>
          <span className="mac-btn primary">Move Files</span>
        </div>
      </Sheet>
    </div>
  );
}

function Sheet({ show, box, children }: { show: boolean; box: { x: number; y: number; w: number; h: number }; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div key="dim" className="absolute inset-0 z-30 bg-black/15" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            key="sheet"
            initial={{ y: -box.h }} animate={{ y: 0 }} exit={{ y: -box.h, opacity: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute z-40 rounded-b-[12px] border border-t-0 border-[var(--mac-line)] bg-[var(--mac-window)] p-4 shadow-2xl"
            style={{ left: box.x, top: box.y, width: box.w, minHeight: box.h }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export { rowCY };
