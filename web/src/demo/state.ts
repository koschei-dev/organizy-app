import samples from "../sample-files.json";
import { type Decision, decide, defaultRules, list, type Rule, type SampleFile } from "../engine";

export type Screen = "organize" | "rules" | "history" | "settings";
export type Planned = { file: SampleFile; decision: Decision; included: boolean };
export type Batch = { id: number; date: Date; records: { name: string; to: string }[]; undone: boolean };
export type Settings = { useAI: boolean; useOCR: boolean; removeEmpty: boolean; includeSub: boolean };

export type State = {
  screen: Screen;
  rules: Rule[];
  selectedRule: string;
  settings: Settings;
  folder: SampleFile[];
  plan: Planned[] | null;
  scanning: { done: number; current: string } | null;
  filter: string | null;
  sortByFolder: boolean;
  message: string | null;
  teach: { file: string; ruleId: string } | null;
  confirming: boolean;
  history: Batch[];
  nextBatch: number;
};

export const SAMPLE = samples as SampleFile[];

export const initialState = (): State => ({
  screen: "organize",
  rules: defaultRules(),
  selectedRule: "invoices-receipts",
  settings: { useAI: false, useOCR: true, removeEmpty: true, includeSub: false },
  folder: SAMPLE,
  plan: null,
  scanning: null,
  filter: null,
  sortByFolder: true,
  message: null,
  teach: null,
  confirming: false,
  history: [],
  nextBatch: 1,
});

export type Action =
  | { type: "screen"; screen: Screen }
  | { type: "scan-start" }
  | { type: "scan-progress"; done: number; current: string }
  | { type: "scan-done" }
  | { type: "toggle-include"; name: string }
  | { type: "set-destination"; name: string; ruleId: string | null }
  | { type: "filter"; filter: string | null }
  | { type: "sort"; on: boolean }
  | { type: "setting"; key: keyof Settings; value: boolean }
  | { type: "confirm"; open: boolean }
  | { type: "move" }
  | { type: "undo"; id: number }
  | { type: "teach-dismiss" }
  | { type: "teach-learn"; keyword: string }
  | { type: "select-rule"; id: string }
  | { type: "edit-rule"; id: string; patch: Partial<Rule> }
  | { type: "reset" };

const plan = (rules: Rule[], files: SampleFile[], useAI: boolean): Planned[] =>
  files.map((file) => {
    const decision = decide(rules, file, useAI);
    return { file, decision, included: decision.ruleId !== null };
  });

/** Replan but keep the user's own choices, like the app does when a setting changes. */
const replan = (s: State, rules = s.rules, useAI = s.settings.useAI): Planned[] | null => {
  if (!s.plan) return null;
  const fresh = plan(rules, s.plan.map((p) => p.file), useAI);
  return fresh.map((p) => {
    const old = s.plan?.find((o) => o.file.name === p.file.name);
    return old && old.decision.source === "user" ? old : p;
  });
};

export const ruleName = (s: State, id: string | null) => s.rules.find((r) => r.id === id)?.name;

export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "screen":
      return { ...s, screen: a.screen };
    case "scan-start":
      return { ...s, scanning: { done: 0, current: "" }, plan: null, message: null, teach: null, filter: null };
    case "scan-progress":
      return { ...s, scanning: { done: a.done, current: a.current } };
    case "scan-done": {
      const p = plan(s.rules, s.folder, s.settings.useAI);
      const n = p.filter((x) => x.included).length;
      return {
        ...s,
        scanning: null,
        plan: p,
        message: p.length === 0 ? "Nothing to organize here." : `Found ${p.length} files. ${n} have a suggested folder.`,
      };
    }
    case "toggle-include":
      return { ...s, plan: s.plan?.map((p) => (p.file.name === a.name ? { ...p, included: !p.included } : p)) ?? null };
    case "set-destination": {
      const before = s.plan?.find((p) => p.file.name === a.name);
      const nextPlan =
        s.plan?.map((p) =>
          p.file.name === a.name
            ? {
                ...p,
                included: a.ruleId !== null,
                decision: {
                  ruleId: a.ruleId,
                  source: "user" as const,
                  reason: a.ruleId ? `You chose ${ruleName(s, a.ruleId)}` : "You chose to leave it in place",
                },
              }
            : p,
        ) ?? null;
      const offer = a.ruleId && before?.decision.ruleId !== a.ruleId ? { file: a.name, ruleId: a.ruleId } : null;
      return { ...s, plan: nextPlan, teach: offer };
    }
    case "filter":
      return { ...s, filter: a.filter };
    case "sort":
      return { ...s, sortByFolder: a.on };
    case "setting": {
      const settings = { ...s.settings, [a.key]: a.value };
      return { ...s, settings, plan: a.key === "useAI" ? replan(s, s.rules, a.value) : s.plan };
    }
    case "confirm":
      return { ...s, confirming: a.open };
    case "move": {
      if (!s.plan) return s;
      const moving = s.plan.filter((p) => p.included && p.decision.ruleId);
      const names = new Set(moving.map((p) => p.file.name));
      const batch: Batch = {
        id: s.nextBatch,
        date: new Date(),
        records: moving.map((p) => ({ name: p.file.name, to: ruleName(s, p.decision.ruleId) ?? "" })),
        undone: false,
      };
      return {
        ...s,
        confirming: false,
        folder: s.folder.filter((f) => !names.has(f.name)),
        plan: s.plan.filter((p) => !names.has(p.file.name)),
        history: moving.length ? [batch, ...s.history] : s.history,
        nextBatch: s.nextBatch + 1,
        teach: null,
        filter: null,
        message: `Moved ${moving.length} file${moving.length === 1 ? "" : "s"}.`,
      };
    }
    case "undo": {
      const batch = s.history.find((b) => b.id === a.id);
      if (!batch || batch.undone) return s;
      const back = SAMPLE.filter((f) => batch.records.some((r) => r.name === f.name));
      const folder = [...s.folder, ...back].sort((x, y) => SAMPLE.indexOf(x) - SAMPLE.indexOf(y));
      return {
        ...s,
        folder,
        plan: null,
        history: s.history.map((b) => (b.id === a.id ? { ...b, undone: true } : b)),
        message: `Restored ${back.length} file${back.length === 1 ? "" : "s"} to Downloads.`,
      };
    }
    case "teach-dismiss":
      return { ...s, teach: null };
    case "teach-learn": {
      if (!s.teach) return s;
      const { ruleId } = s.teach;
      const target = s.rules.find((r) => r.id === ruleId);
      if (!target) return s;
      const learned = { ...target, keywords: [...list(target.keywords), `name:${a.keyword}`].join(", ") };
      // Move the taught rule above any rule that would otherwise win, as the app does.
      const others = s.rules.filter((r) => r.id !== ruleId);
      const rules = [learned, ...others];
      return {
        ...s,
        rules,
        plan: replan(s, rules),
        teach: null,
        message: `Learned: files named like “${a.keyword}” go to ${target.name}.`,
      };
    }
    case "select-rule":
      return { ...s, selectedRule: a.id };
    case "edit-rule": {
      const rules = s.rules.map((r) => (r.id === a.id ? { ...r, ...a.patch } : r));
      return { ...s, rules, plan: replan(s, rules) };
    }
    case "reset":
      return initialState();
  }
}

/** Keyword suggestions for Teach: the distinctive words of the file name. */
export function suggestKeywords(name: string): string[] {
  const stem = name.replace(/\.[^.]+$/, "");
  return stem
    .split(/[^\p{L}]+/u)
    .map((w) => w.toLowerCase())
    .filter((w) => w.length >= 4 && !["final", "copy", "notes", "file", "untitled"].includes(w))
    .slice(0, 3);
}
