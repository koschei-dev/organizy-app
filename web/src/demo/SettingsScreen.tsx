import { AnimatePresence, motion } from "motion/react";
import type { Dispatch, ReactNode } from "react";
import { spring } from "../smoothui/springs";
import type { Action, Settings, State } from "./state";

export function SettingsScreen({ s, dispatch }: { s: State; dispatch: Dispatch<Action> }) {
  const sw = (key: keyof Settings, label: string) => (
    <div className="flex items-center justify-between gap-4 px-3 py-[8px]">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={s.settings[key]}
        aria-label={label}
        className="mac-switch"
        onClick={() => dispatch({ type: "setting", key, value: !s.settings[key] })}
      />
    </div>
  );
  return (
    <div className="mac-scroll min-h-0 flex-1 overflow-y-auto p-4">
      <div className="mx-auto grid max-w-[520px] gap-5">
        <Group title="Moving files" note="After moving, deletes folders inside the scanned folder that have nothing left in them. The scanned folder itself is never removed, and Undo brings the folders back.">
          {sw("removeEmpty", "Remove folders left empty")}
        </Group>
        <Group title="Reading files" note="Lets rules and the AI recognize scanned receipts, screenshots of documents, and similar images. Slower for large photo folders.">
          {sw("useOCR", "Read text in images (OCR)")}
        </Group>
        <Group
          title="Local AI"
          note="Needs the Ollama app running and a model installed (for example “ollama pull llama3.2” in Terminal). Files never leave your Mac."
        >
          {sw("useAI", "Use local AI (Ollama)")}
          <Row label="When">
            <span className={s.settings.useAI ? "" : "opacity-45"}>When rules aren't sure</span>
          </Row>
          <Row label="Model">
            <span className="font-medium">llama3.2</span>
          </Row>
          <Row label="Server">
            <span className="mono font-medium">http://localhost:11434</span>
          </Row>
          <div className="flex items-center gap-2 border-t border-[var(--mac-line)] px-3 py-[8px]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={String(s.settings.useAI)}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={spring.moderate}
                className={`size-2 rounded-full ${s.settings.useAI ? "bg-[var(--mac-green)]" : "bg-[var(--mac-text-2)]"}`}
              />
            </AnimatePresence>
            <span className="text-[var(--mac-text-2)]">
              {s.settings.useAI ? "llama3.2 is ready. In this demo, its answers are the ones it gave on the sample folder." : "Local AI is off. Rules decide everything."}
            </span>
          </div>
        </Group>
      </div>
    </div>
  );
}

function Group({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <section>
      <p className="mb-1.5 font-semibold">{title}</p>
      <div className="divide-y divide-[var(--mac-line)] overflow-hidden rounded-[8px] border border-[var(--mac-line)] bg-[var(--mac-control)]">{children}</div>
      <p className="mt-1.5 text-[11.5px] text-[var(--mac-text-2)]">{note}</p>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-3 py-[8px]">
      <span>{label}</span>
      {children}
    </div>
  );
}
