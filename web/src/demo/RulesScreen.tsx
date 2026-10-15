import { ArrowUpRight, CheckCircle2, Folder } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type Dispatch, useMemo, useRef } from "react";
import { decide, matchRule } from "../engine";
import { FluidHoverHighlight } from "../smoothui/fluid-hover-highlight";
import { spring } from "../smoothui/springs";
import { useFluidHover } from "../smoothui/use-fluid-hover";
import { RollingNumber } from "./RollingNumber";
import { type Action, SAMPLE, type State } from "./state";

type P = { s: State; dispatch: Dispatch<Action>; compact: boolean };

export function RulesScreen({ s, dispatch, compact }: P) {
  const rule = s.rules.find((r) => r.id === s.selectedRule) ?? s.rules[0];
  const listRef = useRef<HTMLUListElement>(null);
  const hover = useFluidHover(listRef, { axis: "y" });

  // Live preview: which sample files this rule catches, and which a higher rule takes first.
  const preview = useMemo(() => {
    const out: { name: string; reason: string; takenBy: string | null }[] = [];
    for (const f of SAMPLE) {
      const reason = matchRule(rule, f.name, f.content);
      if (reason === null) continue;
      const winner = decide(s.rules, f, false);
      const takenBy = winner.ruleId && winner.ruleId !== rule.id ? (s.rules.find((r) => r.id === winner.ruleId)?.name ?? null) : null;
      out.push({ name: f.name, reason, takenBy });
    }
    return out;
  }, [rule, s.rules]);
  const wins = preview.filter((p) => !p.takenBy).length;

  const field = (label: string, key: "extensions" | "nameContains" | "keywords", placeholder: string) => (
    <label className="grid grid-cols-[minmax(0,150px)_minmax(0,1fr)] items-center gap-3 px-3 py-[7px]">
      <span>{label}</span>
      <input
        className="mac-input mono text-[12px]"
        value={rule[key]}
        placeholder={placeholder}
        spellCheck={false}
        onChange={(e) => dispatch({ type: "edit-rule", id: rule.id, patch: { [key]: e.target.value } })}
      />
    </label>
  );

  return (
    <div className={compact ? "flex min-h-0 flex-1 flex-col" : "grid min-h-0 flex-1 grid-cols-[210px_minmax(0,1fr)]"}>
      {/* Rule list */}
      <div className={`mac-scroll border-[var(--mac-line)] ${compact ? "flex gap-1 overflow-x-auto border-b px-2 py-2" : "overflow-y-auto border-r p-2"}`}>
        <ul ref={listRef} className={`relative ${compact ? "flex gap-1" : "grid gap-[1px]"}`} {...(compact ? {} : hover.handlers)}>
          {!compact && <FluidHoverHighlight hover={hover} className="rounded-[6px] bg-[var(--mac-text)]/5" />}
          {s.rules.map((r, i) => (
            <li key={r.id} ref={(el) => hover.registerItem(i, el)} className="flex-none">
              <button
                type="button"
                onClick={() => dispatch({ type: "select-rule", id: r.id })}
                className={`relative flex w-full items-center gap-2 rounded-[6px] px-2 py-[4px] text-left ${r.enabled ? "" : "opacity-45"}`}
              >
                {r.id === rule.id && (
                  <motion.span layoutId="rule-sel" transition={spring.moderate} className="absolute inset-0 rounded-[6px] bg-[var(--mac-select)]" />
                )}
                <Folder size={14} className="relative flex-none fill-[var(--mac-tint)] text-[var(--mac-tint)]" aria-hidden />
                <span className="relative truncate">{r.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Editor */}
      <div className="mac-scroll min-h-0 overflow-y-auto p-4">
        <div className="mx-auto grid max-w-[560px] gap-4">
          <div className="overflow-hidden rounded-[8px] border border-[var(--mac-line)] bg-[var(--mac-control)]">
            <label className="flex items-center justify-between gap-3 px-3 py-[7px]">
              <span>Name</span>
              <input
                className="mac-input max-w-[260px] text-right"
                value={rule.name}
                onChange={(e) => dispatch({ type: "edit-rule", id: rule.id, patch: { name: e.target.value } })}
              />
            </label>
            <div className="flex items-center justify-between border-t border-[var(--mac-line)] px-3 py-[7px]">
              <span>Enabled</span>
              <button
                type="button"
                role="switch"
                aria-checked={rule.enabled}
                aria-label="Enabled"
                className="mac-switch"
                onClick={() => dispatch({ type: "edit-rule", id: rule.id, patch: { enabled: !rule.enabled } })}
              />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-[var(--mac-line)] px-3 py-[7px]">
              <span>Destination folder</span>
              <span className="truncate font-medium">~/Documents/Organizy/{rule.name}</span>
            </div>
          </div>

          <div>
            <p className="mb-1.5 font-semibold">Match files when</p>
            <div className="divide-y divide-[var(--mac-line)] overflow-hidden rounded-[8px] border border-[var(--mac-line)] bg-[var(--mac-control)]">
              {field("File types", "extensions", "pdf, docx, png")}
              {field("Name contains", "nameContains", "Screenshot, Scan")}
              {field("Keywords (name or content)", "keywords", "invoice, receipt, amount due")}
            </div>
            <p className="mt-1.5 text-[11.5px] text-[var(--mac-text-2)]">
              Separate values with commas. Every filled-in condition must match. Prefix a keyword with “name:” to only look for it in the file name. Rules are checked top to bottom and the first match wins.
            </p>
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <p className="font-semibold">Preview</p>
              <p className="text-[11.5px] text-[var(--mac-text-2)]">Sample folder · {SAMPLE.length} files</p>
            </div>
            <div className="overflow-hidden rounded-[8px] border border-[var(--mac-line)] bg-[var(--mac-control)]">
              <p className="border-b border-[var(--mac-line)] px-3 py-2">
                <b>
                  <RollingNumber value={wins} />
                </b>{" "}
                of {SAMPLE.length} files go here.
              </p>
              <ul className="divide-y divide-[var(--mac-line)]">
                <AnimatePresence initial={false}>
                  {preview.length === 0 && (
                    <motion.li key="none" className="px-3 py-3 text-[var(--mac-text-2)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {rule.enabled ? "None of the sample files match these conditions." : "This rule is turned off, so it won't catch any files."}
                    </motion.li>
                  )}
                  {preview.map((p) => (
                    <motion.li
                      layout="position"
                      key={p.name}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={spring.moderate}
                      className="flex items-center gap-3 overflow-hidden px-3 py-[6px]"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="mono block truncate">{p.name}</span>
                        <span className="mono block truncate text-[11px] text-[var(--mac-text-2)]">{p.reason}</span>
                      </span>
                      {p.takenBy ? (
                        <span className="flex flex-none items-center gap-1 text-[11.5px] text-[var(--mac-orange)]">
                          <ArrowUpRight size={13} aria-hidden /> Goes to {p.takenBy}
                        </span>
                      ) : (
                        <span className="flex flex-none items-center gap-1 text-[11.5px] text-[var(--mac-green)]">
                          <CheckCircle2 size={13} aria-hidden /> Goes here
                        </span>
                      )}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
            <p className="mt-1.5 text-[11.5px] text-[var(--mac-text-2)]">Updates as you edit. Try deleting a keyword above.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
