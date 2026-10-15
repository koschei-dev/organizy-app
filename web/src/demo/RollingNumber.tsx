import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/** A number that rolls when it changes. Motion pattern from SmoothUI's Number Flow / Button Copy:
 *  the old value leaves with a short blur, the new one arrives on a zero-bounce spring. */
export function RollingNumber({ value, className = "" }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className={`relative inline-flex overflow-hidden tabular-nums ${className}`} aria-live="polite">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          initial={reduce ? { opacity: 1 } : { y: "-70%", opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { y: "70%", opacity: 0, filter: "blur(4px)" }}
          transition={reduce ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.3 }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
