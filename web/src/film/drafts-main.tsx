import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";
import { DraftOne } from "./one/DraftOne";
import { DraftTwo } from "./DraftTwo";
import { IntroA, IntroB } from "./intros";

const DRAFTS = [
  {
    id: "one", name: "1 · Director’s cut", Comp: DraftOne,
    pitch: "One desktop and one window, shot like a product film. The camera moves in on every click, drag and keystroke, and large captions carry the story from the messy folder to installing it.",
  },
  {
    id: "two", name: "2 · Kinetic type", Comp: DraftTwo,
    pitch: "Type-led motion graphics. Big words do the talking, and small pieces of the app (a row, a reason, the teach bar, a button) float in, get clicked, and fly out. Faster cuts, more like a launch teaser.",
  },
];

const INTROS = [
  { id: "intro-a", name: "Intro A · Gather", Comp: IntroA, pitch: "Scattered files fly into a folder, the folder turns into the app icon and takes its place as the O, and the name rises beside it. Calm, and it shows what the app does before you read a word." },
  { id: "intro-b", name: "Intro B · Snap", Comp: IntroB, pitch: "“Messy” wobbles, snaps into line and flips to “Sorted.”, then a purple wipe brings in the wordmark with Read. Review. Move. Faster and louder; it matches the kinetic film." },
];

function Page() {
  return (
    <main className="px-[clamp(16px,3vw,40px)] pb-40">
      <header className="mx-auto max-w-[1180px] pt-16 pb-10">
        <h1 className="m-0 font-display text-[clamp(44px,6vw,96px)] leading-[0.95] font-bold tracking-[-0.03em]">Two films, two intros.</h1>
        <p className="m-0 mt-4 max-w-[60ch]">Both carry the same content: the messy folder, reading, review, History, the small things, learning and install. Use the chapters under each film to jump around; the pause button sits bottom right.</p>
      </header>
      <section className="mx-auto max-w-[1180px] border-t border-[var(--line)] pt-10 pb-24">
        <h2 className="m-0 mb-8 font-display text-[clamp(30px,3.4vw,48px)] leading-[1.02] font-bold tracking-[-0.02em]">Two logo intros</h2>
        <div className="grid gap-16">
          {INTROS.map(({ id, name, Comp, pitch }) => (
            <div key={id} id={id} className="grid content-start gap-4">
              <Comp />
              <h3 className="m-0 font-display text-[28px] font-bold tracking-[-0.02em]">{name}</h3>
              <p className="m-0 text-[var(--muted)]">{pitch}</p>
            </div>
          ))}
        </div>
      </section>
      {DRAFTS.map(({ id, name, Comp, pitch }) => (
        <section key={id} id={id} className="mx-auto max-w-[1180px] border-t border-[var(--line)] pt-10 pb-24">
          <div className="mb-8 grid gap-4 md:grid-cols-12">
            <h2 className="m-0 font-display text-[clamp(30px,3.4vw,48px)] leading-[1.02] font-bold tracking-[-0.02em] md:col-span-5">{name}</h2>
            <p className="m-0 md:col-span-7">{pitch}</p>
          </div>
          <Comp />
        </section>
      ))}
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><Page /></StrictMode>);
