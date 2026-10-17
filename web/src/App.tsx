import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { Backdrop } from "./Backdrop";
import { SiteFilm } from "./film/SiteFilm";
import { Reviews } from "./Reviews";
import ButtonCopy from "./smoothui/button-copy";
import MaskRevealUp from "./smoothui/mask-reveal-up";
import ScrollRevealParagraph from "./smoothui/scroll-reveal-paragraph";
import { downloadLink, REPO, useRelease } from "./useRelease";

const GH = `https://github.com/${REPO}`;
const ease = [0.22, 1, 0.36, 1] as const;

/** Section parts rise in one after another as the section enters (heading, text, picture). */
function Enter({ children, i = 0, className = "" }: { children: ReactNode; i?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease, delay: i * 0.08 }}
    >
      {children}
    </motion.div>
  );
}

function Button({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <motion.a
      href={href}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", bounce: 0, duration: 0.2 }}
      className={`inline-flex h-12 items-center justify-center whitespace-nowrap bg-[var(--accent)] px-6 font-medium text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)] ${className}`}
    >
      {children}
    </motion.a>
  );
}

function Hero() {
  const reduce = useReducedMotion();
  const dl = downloadLink(useRelease());
  return (
    <header id="top" className="relative isolate px-[clamp(16px,2.2vw,32px)] pt-6 pb-[clamp(72px,8vw,120px)]">
      <Backdrop />
      <div className="mx-auto flex max-w-[1180px] items-baseline justify-between gap-6 text-[15px]">
        <a href="#top" className="font-medium no-underline">
          Organizy
        </a>
        <nav className="flex gap-[clamp(16px,3vw,48px)]" aria-label="Main">
          <a className="max-md:hidden no-underline hover:text-[var(--accent)]" href="#read" onClick={openReading}>Read it</a>
          <a className="max-md:hidden no-underline hover:text-[var(--accent)]" href="#install">Install</a>
          <a className="no-underline hover:text-[var(--accent)]" href={GH}>GitHub</a>
        </nav>
      </div>
      <h1 className="sr-only">Organizy</h1>
      <motion.div
        className="mx-auto mt-[clamp(28px,4vw,52px)] grid max-w-[1180px] items-end gap-6 md:grid-cols-12"
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
      >
        <p className="m-0 max-w-[40ch] text-[clamp(20px,1.7vw,24px)] leading-[1.4] md:col-span-7">
          A free Mac app that reads a messy folder, suggests where every file belongs, and moves nothing until you confirm.
        </p>
        <div className="grid justify-items-start gap-2 md:col-span-4 md:col-start-9 md:justify-items-end">
          <Button href={dl.href}>{dl.label}</Button>
          <span className="text-[13px] text-[var(--muted)] md:text-right">{dl.note}</span>
        </div>
      </motion.div>
      <motion.div
        className="mx-auto mt-[clamp(24px,3vw,40px)] max-w-[1180px]"
        initial={reduce ? false : { opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease, delay: 0.15 }}
      >
        <SiteFilm />
      </motion.div>
    </header>
  );
}

/** Opens the "Prefer to read?" section when a link points into it. */
function openReading() {
  const d = document.getElementById("read") as HTMLDetailsElement | null;
  if (d) d.open = true;
}

/** The film's story as text, for people who would rather read, and for screen readers and search. */
function Reading() {
  return (
    <details id="read" className="group border-y border-[var(--line)]">
      <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 px-[clamp(20px,2.2vw,32px)] py-10 [&::-webkit-details-marker]:hidden">
        <span className="mx-auto flex w-full max-w-[1180px] flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <span className="font-display text-[clamp(30px,3.4vw,48px)] leading-tight font-bold tracking-[-0.02em]">Prefer to read?</span>
          <span className="flex items-baseline gap-3 text-[var(--muted)]">
            The same story, in text.
            <span aria-hidden className="inline-block text-[var(--ink)] transition-transform duration-300 group-open:rotate-45">+</span>
          </span>
        </span>
      </summary>
      <How />
      <Details />
    </details>
  );
}

const REASONS = [
  ["factura_luz_sept.pdf", "Invoices & Receipts", "content mentions “total a pagar”"],
  ["Alex_Kim_CV.docx", "Resumes & CVs", "name mentions “CV”"],
  ["tortilla_de_patatas.txt", "Recipes", "similar to 1 file filed here (71%)"],
] as const;

/** A still from the app: every suggestion carries its reason. */
function Reasons() {
  return (
    <div className="mac overflow-hidden rounded-[10px] border border-[var(--mac-line)] bg-[var(--mac-window)]" style={{ boxShadow: "var(--mac-shadow)" }}>
      {REASONS.map(([file, folder, why], i) => (
        <div key={file} className={`grid gap-x-4 gap-y-[2px] px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] ${i ? "border-t border-[var(--mac-line)]" : ""}`}>
          <span className="mono min-w-0 truncate text-[12.5px]">{file}</span>
          <span className="font-semibold text-[var(--mac-tint-ink)] sm:text-right">{folder}</span>
          <span className="text-[12px] text-[var(--mac-text-2)] sm:col-span-2">{why}</span>
        </div>
      ))}
    </div>
  );
}

function How() {
  const P = ({ lead, children }: { lead: string; children: ReactNode }) => (
    <Enter>
      <p className="m-0 text-[var(--muted)]">
        <b className="font-medium text-[var(--ink)]">{lead}</b> {children}
      </p>
    </Enter>
  );
  return (
    <section id="how" className="px-[clamp(20px,2.2vw,32px)] py-[clamp(120px,12vw,200px)]">
      <div className="max-w-[600px] md:ml-[calc(30vw-32px)]">
        <h2 className="mb-12 font-display text-[clamp(28px,2.4vw,36px)] leading-tight font-medium">
          <MaskRevealUp triggerOnView>What happens to a messy folder?</MaskRevealUp>
        </h2>
        <div className="grid gap-8">
          <P lead="To begin,">you choose a folder, or drop it on the window or the Dock icon. Downloads and Desktop are the usual suspects.</P>
          <P lead="Then it reads.">Each file's name, type, size and what's written inside it decide where it should go, in English or Spanish. Every suggestion comes with its reason:</P>
          <Enter>
            <Reasons />
          </Enter>
          <P lead="Before anything moves,">you see the whole list. Change any destination, or untick what should stay where it is.</P>
          <P lead="Afterwards,">every batch waits in History. One click puts each file back where it was.</P>
        </div>
      </div>
    </section>
  );
}

const FOLDERS = ["Invoices & Receipts", "Bank Statements", "Taxes", "Resumes & CVs", "Screenshots", "Images", "Videos", "Audio", "Spreadsheets", "Presentations", "Documents", "Archives", "Installers"];

function Details() {
  const Mod = ({ title, children, panel }: { title: string; children: ReactNode; panel: ReactNode }) => (
    <Enter className="grid items-start gap-7 md:grid-cols-[minmax(0,520px)_300px]">
      <div data-ui className="mac max-h-[260px] overflow-hidden rounded-[10px] bg-[var(--mac-window)]">
        {panel}
      </div>
      <div>
        <h3 className="m-0 mb-2.5 font-display text-[clamp(22px,1.8vw,26px)] leading-tight font-medium">{title}</h3>
        <p className="m-0">{children}</p>
      </div>
    </Enter>
  );
  return (
    <section id="what" className="bg-[var(--field)] px-[clamp(20px,2.2vw,32px)] py-[clamp(120px,12vw,200px)]">
      <div className="grid gap-[110px] md:ml-[calc(22vw-32px)]">
        <h2 className="m-0 font-display text-[clamp(28px,2.4vw,36px)] leading-tight font-medium">
          <MaskRevealUp triggerOnView>Small things it gets right</MaskRevealUp>
        </h2>
        <Mod
          title="Thirteen folders, ready"
          panel={
            <ul className="columns-2 gap-4 p-4">
              {FOLDERS.map((f, i) => (
                <motion.li
                  key={f}
                  className="flex items-center gap-2 py-[3px]"
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.035, duration: 0.3 }}
                >
                  <span className="h-[11px] w-[14px] bg-[var(--mac-tint)] [clip-path:polygon(0_0,40%_0,50%_18%,100%_18%,100%_100%,0_100%)]" />
                  {f}
                </motion.li>
              ))}
            </ul>
          }
        >
          Invoices, statements, taxes, resumes, screenshots and the rest, inside Documents › Organizy. Change any of them in Rules.
        </Mod>
        <Mod
          title="Rules in plain words"
          panel={
            <div className="divide-y divide-[var(--mac-line)]">
              {[
                ["File types", "pdf, doc, docx, pages, rtf, txt"],
                ["Name contains", "Screenshot, Scan"],
                ["Keywords", "receipt, amount due, factura"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 px-4 py-2.5">
                  <span>{k}</span>
                  <span className="mono truncate text-right font-medium">{v}</span>
                </div>
              ))}
            </div>
          }
        >
          File types, name, keywords, size. It already knows what invoices, bank statements, taxes and resumes look like, in English and Spanish, and every rule previews what it catches.
        </Mod>
        <Mod
          title="Never overwrites"
          panel={
            <ul className="mono grid gap-1.5 p-5 text-[14px]">
              {["Report.pdf", "Report (2).pdf", "Report (3).pdf"].map((f, i) => (
                <motion.li key={f} initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 + i * 0.18, type: "spring", bounce: 0.2, duration: 0.5 }}>
                  {f}
                </motion.li>
              ))}
            </ul>
          }
        >
          If a name is taken, the new file gets a number. Nothing is replaced or deleted.
        </Mod>
        <Mod
          title="It learns your folders"
          panel={
            <div className="divide-y divide-[var(--mac-line)]">
              <div className="flex items-center justify-between px-4 py-2.5">
                <span>Learn from approved moves</span>
                <span className="mac-switch" aria-checked="true" role="img" aria-label="On" />
              </div>
              <div className="px-4 py-2.5">
                Always send files like <b className="mono">paella_valenciana.txt</b> to <b>Recipes</b>?
              </div>
              <div className="flex items-center justify-end gap-4 px-4 py-2.5">
                <span className="text-[var(--muted)]">Not Now</span>
                <b>Teach Organizy…</b>
              </div>
            </div>
          }
        >
          Point it at a folder you've already sorted and it learns from it. Fix a destination once and similar files follow. It all stays on your Mac.
        </Mod>
      </div>
    </section>
  );
}

function Copyable({ cmd }: { cmd: string }) {
  return (
    <div className="mt-3 flex min-w-0 max-w-full items-center gap-3 bg-[var(--surface)] py-2 pr-2 pl-4">
      <code className="min-w-0 flex-1 overflow-x-auto font-[var(--font-macmono)] text-[14px] whitespace-nowrap">{cmd}</code>
      <ButtonCopy onCopy={() => navigator.clipboard.writeText(cmd)} loadingDuration={250} />
    </div>
  );
}

function Install() {
  const dl = downloadLink(useRelease());
  const steps: [string, ReactNode][] = [
    ["Download it.", <>Get the latest zip from <a href={dl.href}>GitHub</a>, unzip it, and drag Organizy into Applications.</>],
    [
      "Open it once.",
      <>macOS blocks it the first time because Organizy is free and not notarized by Apple. Click Done, then open System Settings › Privacy &amp; Security and click Open Anyway. On macOS 14, right-click the app and choose Open.</>,
    ],
    ["Check it, if you like.", <>Each release lists a SHA-256 checksum. This should print the same value:<Copyable cmd="shasum -a 256 ~/Downloads/Organizy-*.zip" /></>],
  ];
  return (
    <section id="install" className="px-[clamp(20px,2.2vw,32px)] py-[clamp(120px,12vw,200px)]">
      <div className="max-w-[600px] md:ml-[calc(30vw-32px)]">
        <h2 className="mb-4 font-display text-[clamp(28px,2.4vw,36px)] leading-tight font-medium">
          <MaskRevealUp triggerOnView>Install in a minute</MaskRevealUp>
        </h2>
        <ScrollRevealParagraph className="!text-[clamp(20px,1.6vw,24px)] mb-12" paragraph="Free, for macOS 14 Sonoma or later. No account, no ads, and nothing leaves your Mac." />
        <ol className="m-0 grid list-none gap-8 p-0">
          {steps.map(([lead, body], i) => (
            <Enter key={lead} i={i} className="min-w-0">
              <li className="min-w-0 text-[var(--muted)]">
                <b className="font-medium text-[var(--ink)]">{lead}</b> {body}
              </li>
            </Enter>
          ))}
        </ol>
      </div>
    </section>
  );
}

const QA: [string, string][] = [
  ["Is it really free?", "Yes. No account, no ads, no subscription, and the code is MIT licensed."],
  ["Will it rename my files?", "No. It only moves them. A file gets a number only when the destination already has that name."],
  ["Does it need the internet?", "No. Everything runs on your Mac."],
  ["How does it learn?", "From folders you have already sorted and from the moves you approve. Similar files then count as evidence for that rule. Nothing is downloaded and nothing leaves your Mac."],
  ["What if Undo can't put a file back?", "If something now sits at the original spot, Organizy leaves that file where it is and tells you, instead of overwriting."],
];

function Faq() {
  return (
    <section id="faq" className="px-[clamp(20px,2.2vw,32px)] py-[clamp(120px,12vw,200px)]">
      <div className="grid gap-x-6 gap-y-20 md:grid-cols-12">
        <p className="m-0 font-display text-[clamp(26px,2.6vw,40px)] leading-[1.1] font-medium text-[var(--muted)] md:col-span-6">Questions</p>
        <span className="max-md:hidden md:col-span-6" />
        {QA.map(([q, a], i) => (
          <Enter key={q} i={0} className="contents">
            <h3 className="m-0 font-display text-[clamp(24px,2.6vw,40px)] leading-[1.1] font-medium md:col-span-6">{q}</h3>
            <p className="m-0 max-w-[40ch] max-md:-mt-16 md:col-span-5 md:col-start-8" data-i={i}>
              {a}
            </p>
          </Enter>
        ))}
      </div>
    </section>
  );
}

function Close() {
  const dl = downloadLink(useRelease());
  return (
    <>
      <section className="relative min-h-[90svh] bg-[var(--inv-bg)] px-[clamp(20px,2.2vw,32px)] pt-[12vh] text-[var(--inv-ink)]">
        <h2 className="m-0 font-display text-[clamp(64px,10vw,168px)] leading-[0.9] font-medium tracking-[-0.03em]">
          <MaskRevealUp triggerOnView lines={["Everything", "in its folder."]} />
        </h2>
        <div className="absolute right-[clamp(20px,2.2vw,32px)] bottom-10 left-[clamp(20px,2.2vw,32px)] flex flex-wrap items-end justify-between gap-6">
          <p className="m-0 max-w-[36ch] text-[19px]">Point Organizy at your messiest folder and read what it suggests. Free, for macOS 14 and later.</p>
          <Button href={dl.href} className="max-md:w-full">
            {dl.label}
          </Button>
        </div>
      </section>
      <footer className="grid min-h-svh grid-rows-[auto_1fr_auto_auto] bg-[var(--inv-bg)] px-[clamp(20px,2.2vw,32px)] pt-10 pb-5 text-[var(--inv-ink)]">
        <div className="grid grid-cols-2 gap-6 text-[15px] md:grid-cols-4">
          {[
            ["Organizy", <span key="a">A tidy Mac, one folder at a time</span>],
            ["Pages", <><a href="#top">The film</a><a href="#read" onClick={openReading}>Read it</a><a href="#install">Install</a></>],
            ["Code", <><a href={GH}>GitHub</a><a href={`${GH}/issues/new/choose`}>Report a bug</a><a href={`${GH}/security`}>Security</a></>],
            ["Made in", <span key="b">Santiago, Dominican Republic</span>],
          ].map(([h, body]) => (
            <div key={String(h)} className="grid content-start gap-1 text-[var(--inv-muted)] [&_a]:text-[var(--inv-ink)] [&_a]:no-underline [&_a:hover]:text-[var(--accent)]">
              <b className="font-medium text-[var(--inv-ink)]">{h}</b>
              {body}
            </div>
          ))}
        </div>
        <div />
        <p aria-hidden className="m-0 mb-5 -ml-[0.02em] pb-[0.18em] font-display text-[clamp(72px,21.5vw,340px)] leading-[0.8] font-bold tracking-[-0.045em] whitespace-nowrap">
          Organizy
        </p>
        <small className="text-[13px] text-[var(--inv-muted)]">MIT license · 2026 · Fonts: Bodoni Moda and Jost (SIL OFL) · Motion: SmoothUI (MIT)</small>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <main>
      <Hero />
      <Reading />
      <Install />
      <section className="px-[clamp(20px,2.2vw,32px)] pb-[clamp(120px,12vw,200px)]" id="reviews">
        <Reviews />
      </section>
      <Faq />
      <Close />
    </main>
  );
}
