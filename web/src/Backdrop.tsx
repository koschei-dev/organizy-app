import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect } from "react";

/**
 * The hero's stage: a soft accent glow that drifts and leans toward the pointer, over a faint
 * grid of rounded tiles that fades out toward the edges. Purely decorative.
 */
export function Backdrop() {
  const reduce = useReducedMotion();
  const px = useMotionValue(50);
  const py = useMotionValue(0);
  const x = useSpring(px, { stiffness: 40, damping: 20, mass: 1 });
  const y = useSpring(py, { stiffness: 40, damping: 20, mass: 1 });
  const glow = useMotionTemplate`radial-gradient(48% 46% at ${x}% ${y}%, color-mix(in oklab, var(--accent) 38%, transparent), transparent 72%)`;

  useEffect(() => {
    if (reduce) return;
    const move = (e: PointerEvent) => {
      px.set(30 + (e.clientX / window.innerWidth) * 40);
      py.set(Math.min(30, (e.clientY / window.innerHeight) * 30));
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reduce, px, py]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div className="absolute inset-0" style={{ background: glow }} />
      {!reduce && (
        <motion.div
          className="absolute top-[-20%] left-1/2 h-[70%] w-[60%] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
          style={{ background: "color-mix(in oklab, var(--accent) 26%, transparent)" }}
          animate={{ scale: [1, 1.12, 1], x: ["-52%", "-46%", "-52%"] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <svg
        className="absolute inset-0 size-full"
        style={{ maskImage: "radial-gradient(70% 60% at 50% 38%, #000 0%, transparent 100%)", WebkitMaskImage: "radial-gradient(70% 60% at 50% 38%, #000 0%, transparent 100%)" }}
      >
        <defs>
          <pattern id="tiles" width="168" height="168" patternUnits="userSpaceOnUse">
            <rect x="1" y="1" width="166" height="166" rx="26" fill="none" stroke="var(--ink)" strokeOpacity="0.09" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tiles)" />
      </svg>
    </div>
  );
}
