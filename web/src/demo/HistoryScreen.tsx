import { ArrowRight, ChevronRight, FileText, History as HistoryIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type Dispatch, useState } from "react";
import { spring } from "../smoothui/springs";
import type { Action, State } from "./state";

export function HistoryScreen({ s, dispatch }: { s: State; dispatch: Dispatch<Action> }) {
  const [open, setOpen] = useState<number | null>(s.history[0]?.id ?? null);

  if (s.history.length === 0) {
    return (
      <div className="grid flex-1 place-items-center p-8 text-center text-[var(--mac-text-2)]">
        <div className="grid justify-items-center gap-3">
          <HistoryIcon size={40} strokeWidth={1.2} aria-hidden />
          <p>Moves you make will appear here so you can undo them.</p>
          <button className="mac-btn" type="button" onClick={() => dispatch({ type: "screen", screen: "organize" })}>
            Go to Organize
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mac-scroll min-h-0 flex-1 overflow-y-auto p-3">
      <ul className="grid gap-2">
        <AnimatePresence initial={false}>
          {s.history.map((b) => (
            <motion.li
              key={b.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring.slow}
              className="overflow-hidden rounded-[8px] border border-[var(--mac-line)] bg-[var(--mac-control)]"
            >
              <div className="flex items-center gap-2 px-3 py-2">
                <button
                  type="button"
                  aria-expanded={open === b.id}
                  onClick={() => setOpen(open === b.id ? null : b.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <motion.span animate={{ rotate: open === b.id ? 90 : 0 }} transition={spring.moderate}>
                    <ChevronRight size={13} aria-hidden />
                  </motion.span>
                  <span className="min-w-0">
                    <span className="block">
                      {b.records.length} file{b.records.length === 1 ? "" : "s"} from Downloads
                    </span>
                    <span className="block text-[11.5px] text-[var(--mac-text-2)]">
                      {b.date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </span>
                  </span>
                </button>
                {b.undone ? (
                  <span className="text-[var(--mac-text-2)]">Undone</span>
                ) : (
                  <button className="mac-btn" type="button" onClick={() => dispatch({ type: "undo", id: b.id })}>
                    Undo
                  </button>
                )}
              </div>
              <AnimatePresence initial={false}>
                {open === b.id && (
                  <motion.ul
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={spring.slow}
                    className="overflow-hidden border-t border-[var(--mac-line)] bg-[var(--mac-alt)]"
                  >
                    {b.records.map((r) => (
                      <li key={r.name} className="flex items-center gap-2 px-3 py-[5px]">
                        <FileText size={13} className="flex-none text-[var(--mac-text-2)]" aria-hidden />
                        <span className="mono min-w-0 truncate">{r.name}</span>
                        <ArrowRight size={12} className="flex-none text-[var(--mac-text-2)]" aria-hidden />
                        <span className="truncate text-[var(--mac-text-2)]">{r.to}</span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <p className="mt-3 px-1 text-[11.5px] text-[var(--mac-text-2)]">
        Undo also removes destination folders the move created, if nothing else is in them.
      </p>
    </div>
  );
}
