import { Eye, FileText, Folder, GraduationCap, Inbox, Search, X } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { type Dispatch, useEffect, useMemo, useState } from "react";
import { formatSize } from "../engine";
import { spring } from "../smoothui/springs";
import { RollingNumber } from "./RollingNumber";
import { type Action, type Planned, ruleName, type State, suggestKeywords } from "./state";

type P = { s: State; dispatch: Dispatch<Action>; compact: boolean };

const BADGE: Record<string, { text: string; cls: string }> = {
  rule: { text: "Rule", cls: "bg-[var(--mac-tint-soft)] text-[var(--mac-tint-ink)]" },
  ai: { text: "AI", cls: "bg-[#F3E8FF] text-[#7E22CE] dark:bg-[#3B2A55] dark:text-[#D8B4FE]" },
  user: { text: "You", cls: "bg-[#DCFCE7] text-[#15803D] dark:bg-[#1E3A2B] dark:text-[#86EFAC]" },
  none: { text: "—", cls: "bg-[var(--mac-alt)] text-[var(--mac-text-2)]" },
};

export function OrganizeScreen({ s, dispatch, compact }: P) {
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<string | null>(null);
  const [look, setLook] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  // Scanning: read each file in turn, as the app's progress bar does.
  useEffect(() => {
    if (!s.scanning) return;
    const i = s.scanning.done;
    if (i >= s.folder.length) {
      const t = setTimeout(() => dispatch({ type: "scan-done" }), 120);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => dispatch({ type: "scan-progress", done: i + 1, current: s.folder[i].name }), reduce ? 0 : 55);
    return () => clearTimeout(t);
  }, [s.scanning, s.folder, dispatch, reduce]);

  // Space toggles Quick Look on the selected row, like the app.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLook(null);
      if (e.key === " " && selected && (e.target as HTMLElement)?.closest?.("[data-row]")) {
        e.preventDefault();
        setLook((v) => (v ? null : selected));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const groups = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of s.plan ?? []) {
      const n = ruleName(s, p.decision.ruleId) ?? "Leave in place";
      m.set(n, (m.get(n) ?? 0) + 1);
    }
    return [...m.entries()];
  }, [s]);

  const rows = useMemo(() => {
    let r = s.plan ?? [];
    if (s.filter) r = r.filter((p) => (ruleName(s, p.decision.ruleId) ?? "Leave in place") === s.filter);
    if (s.sortByFolder) {
      const order = (p: Planned) => {
        const i = s.rules.findIndex((x) => x.id === p.decision.ruleId);
        return i < 0 ? 999 : i;
      };
      r = [...r].sort((a, b) => order(a) - order(b) || a.file.name.localeCompare(b.file.name));
    }
    return r;
  }, [s]);

  const moving = (s.plan ?? []).filter((p) => p.included && p.decision.ruleId).length;
  const lookFile = s.plan?.find((p) => p.file.name === look)?.file ?? null;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-[var(--mac-line)] px-3 py-2">
        <button className="mac-btn" type="button" onClick={() => dispatch({ type: "scan-start" })}>
          <Folder size={13} aria-hidden /> Choose Folder…
        </button>
        <span className="flex min-w-0 items-center gap-1.5 text-[var(--mac-text-2)]">
          <Folder size={15} className="fill-[#5AB0F7] text-[#5AB0F7]" aria-hidden />
          <span className="truncate">~/Downloads</span>
        </span>
        <span className="ml-auto flex items-center gap-3">
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              className="mac-check"
              checked={s.settings.useAI}
              onChange={(e) => dispatch({ type: "setting", key: "useAI", value: e.target.checked })}
            />
            Local AI
            <AnimatePresence>
              {s.settings.useAI && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={spring.fast}
                  className="size-2 rounded-full bg-[var(--mac-green)]"
                  title="llama3.2 is ready"
                />
              )}
            </AnimatePresence>
          </label>
          {!compact && (
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                className="mac-check"
                checked={s.settings.includeSub}
                onChange={(e) => dispatch({ type: "setting", key: "includeSub", value: e.target.checked })}
              />
              Include subfolders
            </label>
          )}
          <button className="mac-btn" type="button" onClick={() => dispatch({ type: "scan-start" })} disabled={!!s.scanning}>
            <Search size={13} aria-hidden /> Scan
          </button>
        </span>
      </div>

      {/* Chips */}
      <AnimatePresence initial={false}>
        {s.plan && s.plan.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring.slow}
            className="overflow-hidden border-b border-[var(--mac-line)]"
          >
            <div className="mac-scroll flex gap-1.5 overflow-x-auto px-3 py-2">
              <Chip label="All" count={s.plan.length} on={!s.filter} onClick={() => dispatch({ type: "filter", filter: null })} />
              <LayoutGroup>
                {groups.map(([name, n]) => (
                  <Chip key={name} label={name} count={n} on={s.filter === name} onClick={() => dispatch({ type: "filter", filter: name })} />
                ))}
              </LayoutGroup>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Body */}
      <div className="mac-scroll relative min-h-0 flex-1 overflow-y-auto">
        {s.scanning || !s.plan || s.plan.length === 0 ? (
          <Empty s={s} onScan={() => dispatch({ type: "scan-start" })} />
        ) : (
          <div role="table" aria-label="Files and where they will go" className="min-w-0">
            {!compact && (
              <div
                role="row"
                className="sticky top-0 z-10 grid grid-cols-[28px_minmax(0,1.55fr)_80px_minmax(150px,1fr)_minmax(0,1.25fr)] gap-2 border-b border-[var(--mac-line)] bg-[var(--mac-window)] px-3 py-[5px] text-[11.5px] text-[var(--mac-text-2)]"
              >
                <span />
                <span role="columnheader">File</span>
                <span role="columnheader">Size</span>
                <span role="columnheader">Move to</span>
                <span role="columnheader">Why</span>
              </div>
            )}
            <AnimatePresence initial={true}>
              {rows.map((p, i) => (
                <Row
                  key={p.file.name}
                  p={p}
                  i={i}
                  s={s}
                  compact={compact}
                  selected={selected === p.file.name}
                  onSelect={() => setSelected(p.file.name)}
                  onLook={() => {
                    setSelected(p.file.name);
                    setLook(p.file.name);
                  }}
                  dispatch={dispatch}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Teach bar */}
      <AnimatePresence>
        {s.teach && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring.slow}
            className="overflow-hidden bg-[var(--mac-tint-soft)]"
          >
            <div className="flex flex-wrap items-center gap-2 px-3 py-2">
              <GraduationCap size={15} className="text-[var(--mac-tint)]" aria-hidden />
              {!picking ? (
                <>
                  <span className="min-w-0 flex-1 truncate">
                    Always send files like <b className="mono font-semibold">{s.teach.file}</b> to <b>{ruleName(s, s.teach.ruleId)}</b>?
                  </span>
                  <button className="mac-btn" type="button" onClick={() => dispatch({ type: "teach-dismiss" })}>Not Now</button>
                  <button className="mac-btn primary" type="button" onClick={() => setPicking(true)}>Teach Organizy…</button>
                </>
              ) : (
                <>
                  <span className="mr-1">Remember files whose name mentions:</span>
                  {suggestKeywords(s.teach.file).map((k) => (
                    <button
                      key={k}
                      type="button"
                      className="mac-btn"
                      onClick={() => {
                        setPicking(false);
                        dispatch({ type: "teach-learn", keyword: k });
                      }}
                    >
                      {k}
                    </button>
                  ))}
                  <button className="mac-btn ml-auto" type="button" onClick={() => setPicking(false)}>Cancel</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[var(--mac-line)] px-3 py-2">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={s.scanning ? `scan-${s.scanning.current}` : (s.message ?? "")}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={spring.fast}
            className="min-w-0 flex-1 truncate text-[var(--mac-text-2)]"
          >
            {s.scanning ? (
              <span className="flex items-center gap-2">
                <span className="relative h-[5px] w-28 overflow-hidden rounded-full bg-[var(--mac-line)]">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-[var(--mac-tint)] transition-[width] duration-75"
                    style={{ width: `${(s.scanning.done / Math.max(1, s.folder.length)) * 100}%` }}
                  />
                </span>
                <span className="mono truncate text-[12px]">Analyzing {s.scanning.current}</span>
              </span>
            ) : (
              s.message
            )}
          </motion.span>
        </AnimatePresence>
        {s.plan && s.plan.length > 0 && (
          <span className="flex items-center gap-3">
            {!compact && (
              <button className="mac-btn" type="button" disabled={!selected} onClick={() => setLook(look ? null : selected)}>
                <Eye size={13} aria-hidden /> Quick Look
              </button>
            )}
            {!compact && (
              <label className="flex items-center gap-1.5">
                <input type="checkbox" className="mac-check" checked={s.sortByFolder} onChange={(e) => dispatch({ type: "sort", on: e.target.checked })} />
                Sort by folder
              </label>
            )}
            <span className="text-[var(--mac-text-2)]">
              <RollingNumber value={moving} /> of {s.plan.length} selected
            </span>
            <button className="mac-btn primary" type="button" disabled={moving === 0} onClick={() => dispatch({ type: "confirm", open: true })}>
              Move Files
            </button>
          </span>
        )}
      </div>

      {/* Quick Look */}
      <AnimatePresence>
        {lookFile && (
          <motion.div
            className="absolute inset-0 z-30 grid place-items-center bg-black/25 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLook(null)}
          >
            <motion.div
              role="dialog"
              aria-label={`Quick Look: ${lookFile.name}`}
              initial={{ scale: 0.92, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={spring.slow}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[460px] overflow-hidden rounded-[10px] border border-[var(--mac-line)] bg-[var(--mac-window)] shadow-2xl"
            >
              <div className="flex items-center gap-2 border-b border-[var(--mac-line)] bg-[var(--mac-bar)] px-3 py-2">
                <FileText size={14} className="text-[var(--mac-text-2)]" aria-hidden />
                <span className="mono flex-1 truncate">{lookFile.name}</span>
                <button type="button" aria-label="Close Quick Look" onClick={() => setLook(null)} className="rounded p-0.5 hover:bg-[var(--mac-alt)]">
                  <X size={14} />
                </button>
              </div>
              <pre className="mono max-h-[300px] overflow-auto whitespace-pre-wrap p-4 text-[12.5px] leading-relaxed">{lookFile.content}</pre>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation sheet */}
      <AnimatePresence>
        {s.confirming && (
          <motion.div className="absolute inset-0 z-40 bg-black/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              role="alertdialog"
              aria-label="Move files?"
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={spring.slow}
              className="mx-auto w-[min(380px,92%)] rounded-b-[12px] border border-t-0 border-[var(--mac-line)] bg-[var(--mac-window)] p-5 shadow-2xl"
            >
              <img src="/organizy-app/icon-96.png" alt="" width={44} height={44} className="mb-3" />
              <p className="mb-1 text-[13.5px] font-semibold">Move {moving} files?</p>
              <p className="mb-4 text-[var(--mac-text-2)]">They go into folders inside Documents › Organizy. You can undo this from History.</p>
              <div className="flex justify-end gap-2">
                <button className="mac-btn" type="button" onClick={() => dispatch({ type: "confirm", open: false })}>Cancel</button>
                <button className="mac-btn primary" type="button" autoFocus onClick={() => dispatch({ type: "move" })}>Move Files</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Chip({ label, count, on, onClick }: { label: string; count: number; on: boolean; onClick: () => void }) {
  return (
    <motion.button
      layout
      type="button"
      onClick={onClick}
      transition={spring.moderate}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`mono relative flex flex-none items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[12px] ${
        on ? "text-white dark:text-[#111118]" : "bg-[var(--mac-tint-soft)] text-[var(--mac-tint-ink)]"
      }`}
    >
      {on && <motion.span layoutId="chip-on" transition={spring.moderate} className="absolute inset-0 rounded-full bg-[var(--mac-tint)]" />}
      <span className="relative">{label}</span>
      <span className={`relative font-semibold ${on ? "" : "text-[var(--mac-text)]"}`}>
        <RollingNumber value={count} />
      </span>
    </motion.button>
  );
}

function Row({
  p,
  i,
  s,
  compact,
  selected,
  onSelect,
  onLook,
  dispatch,
}: {
  p: Planned;
  i: number;
  s: State;
  compact: boolean;
  selected: boolean;
  onSelect: () => void;
  onLook: () => void;
  dispatch: Dispatch<Action>;
}) {
  const reduce = useReducedMotion();
  const badge = BADGE[p.decision.source];
  const bg = selected ? "bg-[var(--mac-select)]" : i % 2 ? "bg-[var(--mac-alt)]" : "";
  const select = (
    <select
      className="mac-select"
      aria-label={`Move ${p.file.name} to`}
      value={p.decision.ruleId ?? ""}
      onChange={(e) => dispatch({ type: "set-destination", name: p.file.name, ruleId: e.target.value || null })}
      onClick={(e) => e.stopPropagation()}
    >
      <option value="">— Leave in place —</option>
      {s.rules.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name}
        </option>
      ))}
    </select>
  );
  const check = (
    <input
      type="checkbox"
      className="mac-check"
      aria-label={`Move ${p.file.name}`}
      checked={p.included}
      disabled={!p.decision.ruleId}
      onChange={() => dispatch({ type: "toggle-include", name: p.file.name })}
      onClick={(e) => e.stopPropagation()}
    />
  );
  const why = (
    <span className="flex min-w-0 items-center gap-1.5">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={badge.text}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={spring.moderate}
          className={`flex-none rounded-full px-1.5 py-[1px] text-[10.5px] font-semibold ${badge.cls}`}
        >
          {badge.text}
        </motion.span>
      </AnimatePresence>
      <span className="mono truncate text-[11.5px] text-[var(--mac-text-2)]" title={p.decision.reason}>
        {p.decision.reason}
      </span>
    </span>
  );

  return (
    <motion.div
      layout={reduce ? false : "position"}
      data-row
      role="row"
      tabIndex={0}
      aria-selected={selected}
      onClick={onSelect}
      onDoubleClick={onLook}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: p.included || !p.decision.ruleId ? 1 : 0.55, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, x: 40, transition: { duration: 0.22, delay: Math.min(i, 14) * 0.02 } }}
      transition={{ ...spring.moderate, delay: reduce ? 0 : Math.min(i, 20) * 0.018 }}
      className={`${bg} cursor-default px-3 outline-none focus-visible:bg-[var(--mac-select)]`}
    >
      {compact ? (
        <div className="grid grid-cols-[22px_minmax(0,1fr)] gap-x-2 gap-y-1 py-2">
          <span className="pt-[2px]">{check}</span>
          <span className="mono truncate font-medium">{p.file.name}</span>
          <span />
          <span className="grid grid-cols-[minmax(0,1fr)] gap-1">
            {select}
            {why}
          </span>
        </div>
      ) : (
        <div className="grid h-[30px] grid-cols-[28px_minmax(0,1.55fr)_80px_minmax(150px,1fr)_minmax(0,1.25fr)] items-center gap-2">
          {check}
          <span className="flex min-w-0 items-center gap-1.5" role="cell">
            <FileText size={14} className="flex-none text-[var(--mac-text-2)]" aria-hidden />
            <span className="mono truncate">{p.file.name}</span>
          </span>
          <span className="mono text-[var(--mac-text-2)]" role="cell">
            {formatSize(p.file.size)}
          </span>
          <span role="cell">{select}</span>
          <span role="cell" className="min-w-0">
            {why}
          </span>
        </div>
      )}
    </motion.div>
  );
}

function Empty({ s, onScan }: { s: State; onScan: () => void }) {
  return (
    <div className="grid h-full place-items-center p-8 text-center">
      <div className="grid max-w-[380px] justify-items-center gap-3">
        <motion.span
          animate={s.scanning ? { y: [0, -4, 0] } : { y: 0 }}
          transition={s.scanning ? { repeat: Infinity, duration: 0.9 } : {}}
        >
          <Inbox size={44} strokeWidth={1.2} className="text-[var(--mac-text-2)]" aria-hidden />
        </motion.span>
        <p className="text-[16px]">
          {s.scanning
            ? `Reading ${s.scanning.done} of ${s.folder.length} files…`
            : s.folder.length === 0
              ? "Downloads is tidy."
              : s.message ?? "Choose a folder and press Scan, or drop files and folders here."}
        </p>
        <p className="text-[var(--mac-text-2)]">
          {s.folder.length === 0
            ? "Every file has a home. Open History to undo the move."
            : "Organizy reads each file's name, size and contents, then suggests where it belongs. Nothing moves until you confirm."}
        </p>
        {!s.scanning && s.folder.length > 0 && (
          <button className="mac-btn primary mt-1" type="button" onClick={onScan}>
            <Search size={13} aria-hidden /> Scan Downloads
          </button>
        )}
      </div>
    </div>
  );
}
