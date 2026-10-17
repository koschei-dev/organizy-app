import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";
import { DraftOne } from "./one/DraftOne";
import { DraftTwo } from "./DraftTwo";

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

function Page() {
  return (
    <main className="px-[clamp(16px,3vw,40px)] pb-40">
      <header className="mx-auto max-w-[1180px] pt-16 pb-10">
        <h1 className="m-0 font-display text-[clamp(44px,6vw,96px)] leading-[0.95] font-bold tracking-[-0.03em]">Two films, one story.</h1>
        <p className="m-0 mt-4 max-w-[60ch]">Both carry the same content: the messy folder, reading, review, History, the small things, learning and install. Use the chapters under each film to jump around; the pause button sits bottom right.</p>
      </header>
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
