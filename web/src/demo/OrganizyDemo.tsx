import { History as HistoryIcon, ListChecks, PanelLeft, Settings as SettingsIcon, WandSparkles } from "lucide-react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { FluidHoverHighlight } from "../smoothui/fluid-hover-highlight";
import { spring } from "../smoothui/springs";
import { useFluidHover } from "../smoothui/use-fluid-hover";
import { HistoryScreen } from "./HistoryScreen";
import { OrganizeScreen } from "./OrganizeScreen";
import { RulesScreen } from "./RulesScreen";
import { SettingsScreen } from "./SettingsScreen";
import { initialState, reducer, type Screen } from "./state";

const SCREENS: { id: Screen; label: string; Icon: typeof WandSparkles }[] = [
  { id: "organize", label: "Organize", Icon: WandSparkles },
  { id: "rules", label: "Rules", Icon: ListChecks },
  { id: "history", label: "History", Icon: HistoryIcon },
  { id: "settings", label: "Settings", Icon: SettingsIcon },
];

/** Width of the window itself decides the layout, so the demo works in any column. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(1100);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

export function OrganizyDemo() {
  const [s, dispatch] = useReducer(reducer, undefined, initialState);
  const [ref, width] = useWidth<HTMLDivElement>();
  const compact = width < 760;
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduce = useReducedMotion();
  const navRef = useRef<HTMLUListElement>(null);
  const hover = useFluidHover(navRef, { axis: "y" });

  // The window "opens" on the sample folder and scans it once, like dropping Downloads on the Dock icon.
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => dispatch({ type: "scan-start" }), reduce ? 0 : 700);
    return () => clearTimeout(t);
  }, [inView, reduce]);

  const title = SCREENS.find((x) => x.id === s.screen)?.label;

  return (
    <div
      ref={ref}
      data-ui
      className="mac relative overflow-hidden rounded-[12px] border border-[var(--mac-line)] bg-[var(--mac-window)]"
      style={{ boxShadow: "var(--mac-shadow)" }}
      role="application"
      aria-label="Interactive Organizy demo"
    >
      <div className={compact ? "flex flex-col" : "grid grid-cols-[184px_minmax(0,1fr)]"} style={{ height: compact ? 640 : 640 }}>
        {/* Sidebar (or a segmented control on narrow screens) */}
        {compact ? (
          <div className="flex items-center gap-2 border-b border-[var(--mac-line)] bg-[var(--mac-bar)] px-3 py-2">
            <Lights />
            <div className="ml-1 flex flex-1 rounded-[7px] bg-[var(--mac-sidebar)] p-[2px]" role="tablist">
              {SCREENS.map(({ id, label }) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={s.screen === id}
                  onClick={() => dispatch({ type: "screen", screen: id })}
                  className="relative flex-1 rounded-[5px] py-[3px] text-[12px]"
                >
                  {s.screen === id && (
                    <motion.span layoutId="seg" transition={spring.moderate} className="absolute inset-0 rounded-[5px] bg-[var(--mac-control)] shadow-sm" />
                  )}
                  <span className="relative">{label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <nav className="flex flex-col bg-[var(--mac-sidebar)] px-[10px] pt-3" aria-label="Organizy screens">
            <div className="mb-4 flex items-center justify-between pl-1 pr-2">
              <Lights />
              <PanelLeft size={15} className="text-[var(--mac-text-2)]" aria-hidden />
            </div>
            <ul ref={navRef} className="relative flex flex-col gap-[2px]" {...hover.handlers}>
              <FluidHoverHighlight hover={hover} className="rounded-[6px] bg-[var(--mac-text)]/5" />
              {SCREENS.map(({ id, label, Icon }, i) => (
                <li key={id} ref={(el) => hover.registerItem(i, el)}>
                  <button
                    onClick={() => dispatch({ type: "screen", screen: id })}
                    aria-current={s.screen === id ? "page" : undefined}
                    className="relative flex w-full items-center gap-2 rounded-[6px] px-2 py-[5px] text-left"
                  >
                    {s.screen === id && (
                      <motion.span layoutId="side-sel" transition={spring.moderate} className="absolute inset-0 rounded-[6px] bg-[var(--mac-text)]/10" />
                    )}
                    <Icon size={15} className="relative text-[var(--mac-tint)]" aria-hidden />
                    <span className="relative">{label}</span>
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => dispatch({ type: "reset" })}
              className="mt-auto mb-3 self-start rounded-[6px] px-2 py-1 text-[12px] text-[var(--mac-text-2)] hover:bg-[var(--mac-text)]/5"
            >
              Reset demo
            </button>
          </nav>
        )}

        {/* Detail */}
        <section className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          {!compact && (
            <header className="flex h-[52px] items-center border-b border-[var(--mac-line)] bg-[var(--mac-bar)] px-4">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.h3
                  key={title}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={spring.moderate}
                  className="text-[15px] font-semibold text-[var(--mac-text-2)]"
                >
                  {title}
                </motion.h3>
              </AnimatePresence>
            </header>
          )}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={s.screen}
              className="flex min-h-0 flex-1 flex-col"
              initial={reduce ? false : { opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -8 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            >
              {s.screen === "organize" && <OrganizeScreen s={s} dispatch={dispatch} compact={compact} />}
              {s.screen === "rules" && <RulesScreen s={s} dispatch={dispatch} compact={compact} />}
              {s.screen === "history" && <HistoryScreen s={s} dispatch={dispatch} />}
              {s.screen === "settings" && <SettingsScreen s={s} dispatch={dispatch} />}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}

function Lights() {
  return (
    <span className="flex gap-[7px]" aria-hidden>
      <span className="size-3 rounded-full bg-[#FF5F57]" />
      <span className="size-3 rounded-full bg-[#FEBC2E]" />
      <span className="size-3 rounded-full bg-[#28C840]" />
    </span>
  );
}
