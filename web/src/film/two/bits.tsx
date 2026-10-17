import { Check, ChevronsUpDown, Folder } from "lucide-react";
import { motion, useTransform } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { FileGlyph } from "../../demo/FileGlyph";
import { easeOut } from "../Film";
import { type T, win } from "./kit";

export { FileGlyph };
export const FOLDER = "#5AB0F7";

/** Crisp app-fragment card on the stage. */
export function Card({ className = "", style, children }: { className?: string; style?: CSSProperties; children?: ReactNode }) {
  return (
    <div className={`mac rounded-[16px] border border-[var(--mac-line)] bg-[var(--mac-window)] ${className}`} style={{ boxShadow: "var(--mac-shadow)", ...style }}>
      {children}
    </div>
  );
}

export function FolderGlyph({ size = 28 }: { size?: number }) {
  return <Folder size={size} strokeWidth={1.4} className="flex-none" style={{ color: FOLDER, fill: FOLDER }} />;
}

export function AppIcon({ size, className = "" }: { size: number; className?: string }) {
  return <img src="/organizy-app/icon-512.png" alt="" width={size} height={size} className={`flex-none ${className}`} style={{ width: size, height: size }} draggable={false} />;
}

/** Same look as FileGlyph, for zip archives. */
export function ZipGlyph({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 40 50" aria-hidden className="flex-none">
      <path d="M4 2h22l10 10v34a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="var(--mac-window)" stroke="var(--mac-control-line)" strokeWidth="1.5" />
      <path d="M26 2v8a2 2 0 0 0 2 2h8" fill="none" stroke="var(--mac-control-line)" strokeWidth="1.5" />
      <rect x="2" y="30" width="34" height="11" fill="#D9962B" />
      <text x="19" y="38.6" textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff" fontFamily="-apple-system,system-ui,sans-serif">ZIP</text>
    </svg>
  );
}

/** Destination pop-up button, as in the app's table. */
export function Dest({ children, size = 22, width, className = "", style }: { children: ReactNode; size?: number; width?: number; className?: string; style?: CSSProperties }) {
  return (
    <span
      className={`mac inline-flex items-center gap-2 rounded-[10px] border border-[var(--mac-control-line)] bg-[var(--mac-control)] px-3 ${className}`}
      style={{ height: size * 2.1, fontSize: size, width, ...style }}
    >
      <FolderGlyph size={size * 1.05} />
      <span className="truncate">{children}</span>
      <ChevronsUpDown size={size * 0.7} className="ml-auto flex-none text-[var(--mac-text-2)]" />
    </span>
  );
}

/** A checkbox that unticks (or ticks) at a time. */
export function Tick({ t, size = 24, off, on }: { t: T; size?: number; off?: number; on?: number }) {
  const O = useTransform(t, (v) => (off !== undefined ? 1 - win(v, off, off + 0.12, (x) => x) : on !== undefined ? win(v, on, on + 0.12, (x) => x) : 1));
  const S = useTransform(t, (v) => (off !== undefined ? 1 - 0.15 * Math.sin(Math.PI * win(v, off, off + 0.25, (x) => x)) : 1));
  return (
    <motion.span className="relative inline-block flex-none" style={{ width: size, height: size, scale: S }}>
      <span className="absolute inset-0 rounded-[7px] border border-[var(--mac-control-line)] bg-[var(--mac-control)]" />
      <motion.span className="absolute inset-0 grid place-items-center rounded-[7px] bg-[var(--mac-tint)] text-white dark:text-[#111118]" style={{ opacity: O }}>
        <Check size={size * 0.72} strokeWidth={3.2} />
      </motion.span>
    </motion.span>
  );
}

/** Design-language pill (not app UI): used for facts. */
export function Pill({ children, icon, className = "", size = 22 }: { children: ReactNode; icon?: ReactNode; className?: string; size?: number }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--bg)] px-4 font-medium whitespace-nowrap text-[var(--ink)] ${className}`}
      style={{ height: size * 2, fontSize: size }}
    >
      {icon}
      {children}
    </span>
  );
}

export const tickIcon = (size = 20) => (
  <span className="grid flex-none place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)]" style={{ width: size * 1.1, height: size * 1.1 }}>
    <Check size={size * 0.75} strokeWidth={3.4} />
  </span>
);

/** A file chip: glyph + mono name. */
export function FileChip({ kind, name, size = 22, className = "" }: { kind: "pdf" | "img" | "doc" | "sheet" | "txt"; name: string; size?: number; className?: string }) {
  return (
    <span className={`mac inline-flex items-center gap-3 ${className}`} style={{ fontSize: size }}>
      <FileGlyph kind={kind} size={size * 1.25} />
      <span className="mono whitespace-nowrap">{name}</span>
    </span>
  );
}

/** A progress value for staggered lists. */
export function useWin(t: T, a: number, b: number, e: (x: number) => number = easeOut) {
  return useTransform(t, (v) => win(v, a, b, e));
}

/** Places something by its centre (or left-middle) on the canvas. */
export function At({ x, y, left = false, className = "", children }: { x: number; y: number; left?: boolean; className?: string; children: ReactNode }) {
  return (
    <div className={`absolute ${className}`} style={{ left: x, top: y, translate: left ? "0 -50%" : "-50% -50%", width: "max-content" }}>
      {children}
    </div>
  );
}
