// Organizy's default rules and matching logic, ported from the Swift sources
// (OrganizyCore/Storage.swift DefaultRules and RuleEngine.swift). The demo runs the same rules
// on the same sample folder the app's screenshots are rendered from.

export type Rule = {
  id: string;
  name: string;
  enabled: boolean;
  extensions: string;
  nameContains: string;
  keywords: string;
  ai: string;
};

export type DecisionSource = "rule" | "ai" | "user" | "none";
export type Decision = { ruleId: string | null; reason: string; source: DecisionSource };

export type SampleFile = { name: string; content: string; size: number; answer: string };

const docs = "pdf, doc, docx, pages, rtf, txt, odt, png, jpg, jpeg, heic";

const r = (name: string, o: Partial<Rule> & { ai: string }): Rule => ({
  id: name.toLowerCase().replace(/[^a-z]+/g, "-"),
  name,
  enabled: true,
  extensions: "",
  nameContains: "",
  keywords: "",
  ...o,
});

export const defaultRules = (): Rule[] => [
  r("Invoices & Receipts", {
    extensions: docs,
    keywords:
      "invoice, receipt, amount due, total due, balance due, order total, bill to, order confirmation, payment received, factura, recibo, total a pagar",
    ai: "Bills, invoices and receipts for something bought or a service used: purchases, orders, rides, hotel stays, utility bills. Not contracts, leases or agreements",
  }),
  r("Bank Statements", {
    extensions: docs,
    keywords:
      "bank statement, account statement, statement period, opening balance, closing balance, beginning balance, ending balance, extracto bancario, saldo inicial, saldo final",
    ai: "Periodic statements from a bank, credit card or brokerage account listing balances and transactions",
  }),
  r("Taxes", {
    extensions: docs,
    keywords:
      "tax return, W-2, W-9, 1099, 1040, IRS, Internal Revenue Service, tax year, taxpayer identification, declaración de la renta",
    ai: "Tax forms and tax paperwork: returns, W-2, W-9, 1099, tax summaries, letters from tax authorities",
  }),
  r("Resumes & CVs", {
    extensions: "pdf, doc, docx, pages, rtf, odt, txt, md",
    keywords:
      "name:resume, name:cv, résumé, curriculum vitae, work experience, cover letter, dear hiring manager, experiencia profesional, experiencia laboral, formación académica",
    ai: "A person's resume or CV (work history, education, skills) or a job cover letter",
  }),
  r("Screenshots", { extensions: "png, jpg, jpeg, heic", nameContains: "Screenshot, Screen Shot", ai: "Screenshots of the screen" }),
  r("Images", { extensions: "jpg, jpeg, png, gif, heic, webp, tiff, tif, bmp, svg, raw, cr2, nef, arw", ai: "Photos and images" }),
  r("Videos", { extensions: "mp4, mov, m4v, avi, mkv, webm, wmv", ai: "Video files" }),
  r("Audio", { extensions: "mp3, wav, m4a, aac, flac, aiff, ogg", ai: "Music, podcasts and audio recordings" }),
  r("Spreadsheets", { extensions: "xls, xlsx, csv, numbers, ods", ai: "Spreadsheets and tabular data" }),
  r("Presentations", { extensions: "ppt, pptx, key, odp", ai: "Slide decks and presentations" }),
  r("Documents", {
    extensions: "pdf, doc, docx, pages, rtf, txt, md, odt",
    ai: "Everything else written: notes, letters, agendas, reports, contracts, leases and agreements, medical and personal records",
  }),
  r("Archives", { extensions: "zip, rar, 7z, tar, gz, tgz, bz2, xz", ai: "Compressed archives" }),
  r("Installers", { extensions: "dmg, pkg, mpkg", ai: "App installers and disk images" }),
];

export const list = (s: string) =>
  s.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);

const extList = (rule: Rule) =>
  list(rule.extensions).map((e) => e.toLowerCase().replace(/^[.* ]+|[.* ]+$/g, ""));

export const hasConditions = (rule: Rule) =>
  extList(rule).length > 0 || list(rule.nameContains).length > 0 || list(rule.keywords).length > 0;

export const isTypeOnly = (rule: Rule) =>
  extList(rule).length > 0 && list(rule.nameContains).length === 0 && list(rule.keywords).length === 0;

/** Case-insensitive, not inside a longer word; 4+ letter keywords also match plurals. */
export function containsWord(keyword: string, text: string): boolean {
  if (!keyword || !text) return false;
  const esc = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const plural = [...keyword].length >= 4 ? "(?:s|es)?" : "";
  return new RegExp(`(?<!\\p{L})${esc}${plural}(?!\\p{L})`, "iu").test(text);
}

const extOf = (name: string) => {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
};
const stemOf = (name: string) => {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
};

/** RuleEngine.match: a reason string if the rule matches, otherwise null. */
export function matchRule(rule: Rule, name: string, content: string): string | null {
  if (!rule.enabled || !hasConditions(rule)) return null;
  const reasons: string[] = [];
  const exts = extList(rule);
  const ext = extOf(name);
  if (exts.length) {
    if (!exts.includes(ext)) return null;
    reasons.push(`.${ext} file`);
  }
  const frags = list(rule.nameContains);
  if (frags.length) {
    const hit = frags.find((f) => name.toLowerCase().includes(f.toLowerCase()));
    if (!hit) return null;
    reasons.push(`name contains “${hit}”`);
  }
  const keywords = list(rule.keywords).map((raw) =>
    raw.toLowerCase().startsWith("name:")
      ? { word: raw.slice(5).trim(), nameOnly: true }
      : { word: raw, nameOnly: false },
  );
  if (keywords.length) {
    const stem = stemOf(name);
    const inName = keywords.find((k) => containsWord(k.word, stem));
    if (inName) reasons.push(`name mentions “${inName.word}”`);
    else {
      const inBody = keywords.filter((k) => !k.nameOnly).find((k) => containsWord(k.word, content));
      if (!inBody) return null;
      reasons.push(`content mentions “${inBody.word}”`);
    }
  }
  return reasons.join(", ");
}

/** First matching rule wins. With local AI on ("when rules aren't sure"), the AI decides files
 *  no rule matched or that only a file-type rule matched. The demo's AI answers come from the
 *  sample folder's answer key, which is what the real model returned in the app's comparison. */
export function decide(rules: Rule[], file: SampleFile, useAI: boolean): Decision {
  let typeOnlyHit: Decision | null = null;
  for (const rule of rules) {
    const reason = matchRule(rule, file.name, file.content);
    if (reason === null) continue;
    const d: Decision = { ruleId: rule.id, reason, source: "rule" };
    if (useAI && isTypeOnly(rule)) {
      typeOnlyHit = d;
      break;
    }
    return d;
  }
  if (useAI) {
    const target = rules.find((x) => x.name === file.answer && x.enabled);
    if (target) return { ruleId: target.id, reason: `AI: ${target.ai.split(/[.:]/)[0].toLowerCase()}`, source: "ai" };
    if (typeOnlyHit) return typeOnlyHit;
  }
  return { ruleId: null, reason: "No rule matched", source: "none" };
}

export function formatSize(bytes: number): string {
  if (bytes < 1000) return `${bytes} bytes`;
  if (bytes < 1_000_000) return `${Math.round(bytes / 1000)} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}
