import { motion, type MotionValue, useTransform } from "motion/react";

/** The macOS arrow, with a click ring. `x`/`y` are stage coordinates of the hot spot. */
export function Cursor({ x, y, click, down, children }: { x: MotionValue<number>; y: MotionValue<number>; click: number; down: boolean; children?: React.ReactNode }) {
  const tx = useTransform(x, (v) => v - 3);
  const ty = useTransform(y, (v) => v - 2);
  return (
    <motion.div className="pointer-events-none absolute top-0 left-0 z-50" style={{ x: tx, y: ty }}>
      {children}
      {click >= 0 && (
        <span
          className="absolute rounded-full border-2 border-[var(--accent)]"
          style={{ left: 3 - 6 - click * 14, top: 2 - 6 - click * 14, width: 12 + click * 28, height: 12 + click * 28, opacity: 1 - click }}
        />
      )}
      <svg width="24" height="30" viewBox="0 0 24 30" style={{ transform: `scale(${down ? 0.9 : 1})`, transformOrigin: "3px 2px", filter: "drop-shadow(0 2px 3px rgba(0,0,0,.35))" }}>
        <path d="M3 2v21.5l5.4-5.2 3.6 8.4 3.6-1.5-3.5-8.3H20L3 2z" fill="#111" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </motion.div>
  );
}
