export type FileKind = "pdf" | "img" | "doc" | "sheet" | "txt";

const TINT: Record<FileKind, { band: string; label: string }> = {
  pdf: { band: "#E5484D", label: "PDF" },
  img: { band: "#3E9BF0", label: "IMG" },
  doc: { band: "#2F6FEB", label: "DOC" },
  sheet: { band: "#1F9D55", label: "XLS" },
  txt: { band: "#8E8CA3", label: "TXT" },
};

/** A small document icon with a coloured type band, like Finder's generic file icons. */
export function FileGlyph({ kind, size = 48 }: { kind: FileKind; size?: number }) {
  const t = TINT[kind];
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 40 50" aria-hidden className="flex-none">
      <path d="M4 2h22l10 10v34a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="var(--mac-window)" stroke="var(--mac-control-line)" strokeWidth="1.5" />
      <path d="M26 2v8a2 2 0 0 0 2 2h8" fill="none" stroke="var(--mac-control-line)" strokeWidth="1.5" />
      {size >= 28 ? (
        <>
          <rect x="2" y="30" width="34" height="11" fill={t.band} />
          <text x="19" y="38.6" textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff" fontFamily="-apple-system,system-ui,sans-serif">{t.label}</text>
        </>
      ) : (
        <rect x="2" y="32" width="34" height="8" fill={t.band} />
      )}
    </svg>
  );
}
