import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { type ReactNode, useRef, useState } from "react";
import { Backdrop } from "./Backdrop";
import { Flow } from "./Flow";
import { decide } from "./engine";
import { OrganizyDemo } from "./demo/OrganizyDemo";
import { SAMPLE } from "./demo/state";
import { defaultRules } from "./engine";
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
  const ref = useRef<HTMLElement>(null);
  // As the page scrolls away, the monument settles back: a little smaller, a little lighter.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const lift = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0.25]);
  return (
    <header ref={ref} className="relative isolate grid min-h-svh grid-rows-[auto_1fr_auto] px-[clamp(20px,2.2vw,32px)] py-6">
      <Backdrop />
      <div className="flex items-baseline justify-between gap-6 text-[15px]">
        <a href="#top" className="font-medium no-underline">
          Organizy
        </a>
        <nav className="flex gap-[clamp(16px,3vw,48px)]" aria-label="Main">
          <a className="max-md:hidden no-underline hover:text-[var(--accent)]" href="#demo">Try it</a>
          <a className="max-md:hidden no-underline hover:text-[var(--accent)]" href="#how">How it works</a>
          <a className="max-md:hidden no-underline hover:text-[var(--accent)]" href="#install">Install</a>
          <a className="no-underline hover:text-[var(--accent)]" href={GH}>GitHub</a>
        </nav>
      </div>
      <motion.div className="self-center justify-self-center" style={reduce ? undefined : { scale, y: lift, opacity: fade }}>
      <h1
        id="top"
        aria-label="Organizy"
        className="m-0 inline-flex items-baseline font-display text-[clamp(64px,20.5vw,380px)] leading-none font-bold tracking-[-0.04em]"
      >
        <motion.span
          className="mr-[0.02em] inline-block size-[0.72em] translate-y-[0.02em] overflow-hidden"
          initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 1.1, ease: [0.7, 0, 0.2, 1] }}
        >
          <motion.img
            src="/organizy-app/icon-512.png"
            alt=""
            width={512}
            height={512}
            className="size-full object-cover"
            initial={reduce ? false : { scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.1, ease: [0.7, 0, 0.2, 1] }}
          />
        </motion.span>
        <span aria-hidden className="-mb-[0.28em] overflow-hidden pb-[0.28em]">
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: "100%", opacity: 0, filter: "blur(8px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease, delay: 0.25 }}
          >
            rganizy
          </motion.span>
        </span>
      </h1>
      </motion.div>
      <motion.div
        className="grid items-end gap-6 md:grid-cols-12"
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.6 }}
      >
        <p className="m-0 max-w-[48ch] md:col-span-5 md:col-start-6">
          A free Mac app that reads a messy folder, suggests where every file belongs, and moves nothing until you confirm.
        </p>
        <div className="grid justify-items-start gap-2 md:col-span-2 md:col-start-11 md:justify-items-end">
          <Button href={dl.href}>{dl.label}</Button>
          <span className="text-[13px] text-[var(--muted)] md:text-right">{dl.note}</span>
        </div>
      </motion.div>
    </header>
  );
}

function FlowSection() {
  return (
    <section id="flow" className="px-[clamp(16px,2.2vw,32px)] pt-[clamp(32px,5vw,72px)] pb-[clamp(48px,6vw,96px)]">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-14 grid gap-6 md:grid-cols-12 md:items-end">
          <h2 className="m-0 font-display text-[clamp(36px,4.4vw,64px)] leading-[1.02] font-medium tracking-[-0.02em] md:col-span-7">
            <MaskRevealUp triggerOnView lines={["Files in.", "Folders out."]} />
          </h2>
          <Enter i={1} className="md:col-span-5">
            <p className="m-0">
              Organizy reads what’s inside each file, shows you the plan, and moves files only after you confirm. Then they go where they belong.
            </p>
          </Enter>
        </div>
        <Enter i={2}>
          <Flow />
        </Enter>
      </div>
    </section>
  );
}

function Demo() {
  const rules = defaultRules();
  const correct = (ai: boolean) => SAMPLE.filter((f) => rules.find((r) => r.id === decide(rules, f, ai).ruleId)?.name === f.answer).length;
  return (
    <section id="demo" className="px-[clamp(16px,2.2vw,32px)] py-[clamp(96px,10vw,160px)]">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 grid gap-6 md:grid-cols-12 md:items-end">
          <h2 className="m-0 font-display text-[clamp(36px,4.4vw,64px)] leading-[1.02] font-medium tracking-[-0.02em] md:col-span-7">
            <MaskRevealUp triggerOnView lines={["The real app,", "right here."]} />
          </h2>
          <Enter i={1} className="md:col-span-5">
            <p className="m-0">
              This is Organizy, rebuilt to run in your browser on a folder of 21 messy files. Scan it, change a destination, move the files, then undo. Nothing leaves this page.
            </p>
          </Enter>
        </div>
        <Enter i={2}>
          <OrganizyDemo />
        </Enter>
        <Enter i={3} className="mt-6 flex flex-wrap gap-x-10 gap-y-2 text-[15px] text-[var(--muted)]">
          <span>
            Rules alone sort <b className="text-[var(--ink)]">{correct(false)} of 21</b> correctly. Tick Local AI: <b className="text-[var(--ink)]">{correct(true)} of 21</b>.
          </span>
          <span>Double-click a file to read it. Change a destination and Organizy offers to learn from it.</span>
        </Enter>
      </div>
    </section>
  );
}

function Tester() {
  const [name, setName] = useState("recibo_supermercado.pdf");
  const rules = defaultRules();
  const d = decide(rules, { name, content: "", size: 0, answer: "" }, false);
  const folder = rules.find((r) => r.id === d.ruleId)?.name;
  return (
    <div data-ui className="mac rounded-[10px] bg-[var(--mac-window)] p-5" style={{ boxShadow: "var(--mac-shadow)" }}>
      <label className="grid gap-2">
        <span className="text-[12.5px] text-[var(--mac-text-2)]">A file name from your Downloads folder</span>
        <input className="mac-input h-10 text-[15px]" value={name} onChange={(e) => setName(e.target.value)} spellCheck={false} />
      </label>
      <motion.div key={folder ?? "none"} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1" aria-live="polite">
        <span className={`text-[16px] font-semibold ${folder ? "text-[var(--mac-tint-ink)]" : "text-[var(--mac-text-2)]"}`}>{folder ?? "Left where it is"}</span>
        <span className="mono text-[12px] text-[var(--mac-text-2)]">{folder ? d.reason : "no rule matched the name; the app would read inside the file"}</span>
      </motion.div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {["W-2_2025.pdf", "IMG_4478 (2).HEIC", "my_cv_english.docx", "Screenshot 2026-10-14 at 9.41.02.png", "untitled.bin"].map((t) => (
          <button key={t} type="button" className="mac-btn" onClick={() => setName(t)}>
            {t.length > 22 ? `${t.slice(0, 18)}….png` : t}
          </button>
        ))}
      </div>
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
          <P lead="Then it reads.">Each file's name, type, size and what's written inside it decide where it should go. Type a name and see:</P>
          <Enter>
            <Tester />
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
                ["Keywords", "invoice, receipt, factura, recibo"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 px-4 py-2.5">
                  <span>{k}</span>
                  <span className="mono truncate text-right font-medium">{v}</span>
                </div>
              ))}
            </div>
          }
        >
          File types, name, keywords, size. Spanish keywords like factura and recibo are built in, and every rule previews what it catches.
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
            ["Pages", <><a href="#demo">Try it</a><a href="#how">How it works</a><a href="#install">Install</a></>],
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
      <FlowSection />
      <Demo />
      <How />
      <Details />
      <Install />
      <section className="px-[clamp(20px,2.2vw,32px)] pb-[clamp(120px,12vw,200px)]" id="reviews">
        <Reviews />
      </section>
      <Faq />
      <Close />
    </main>
  );
}
