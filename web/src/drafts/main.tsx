import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";
import { DraftA, DraftB, DraftC } from "./Drafts";

const DRAFTS = [
  {
    id: "a", name: "A · Screen recording", Comp: DraftA,
    pitch: "The demo reads like a short screen recording: a desktop, the Organizy window, a cursor doing the work. A chapter bar underneath tells you where you are.",
    trade: "Safest and most honest. It looks like the app because it is laid out like the app. Least surprising of the three.",
  },
  {
    id: "b", name: "B · Scroll story", Comp: DraftB,
    pitch: "Your scroll drives the cursor. Big Bodoni captions change beside the window, and the camera leans in on whatever is happening, so small UI stays readable.",
    trade: "The most editorial and the best fit for the monument look. It costs a tall scroll section, and people who scroll fast see it fast.",
  },
  {
    id: "c", name: "C · Dock to a tidy desktop", Comp: DraftC,
    pitch: "A cluttered desktop. The cursor sweeps up the mess and drops it on Organizy in the Dock; the window opens from the icon, sorts, closes, and Documents › Organizy shows where everything went.",
    trade: "The clearest before and after, and it shows the Dock drop, which most people won’t discover alone. Busiest of the three; it would replace the hero, not sit under it.",
  },
];

function Page() {
  return (
    <main className="px-[clamp(16px,3vw,40px)] pb-40">
      <header className="mx-auto grid max-w-[1180px] gap-6 pt-16 pb-10 md:grid-cols-12 md:items-end">
        <h1 className="m-0 font-display text-[clamp(44px,6vw,96px)] leading-[0.95] font-bold tracking-[-0.03em] md:col-span-7">Three demos, one story.</h1>
        <div className="md:col-span-5">
          <p className="m-0">Each draft plays the same scripted session: drop eight files, review, correct one and teach it, move, then a week later a new recipe files itself. Nothing is clickable; the cursor does it.</p>
          <nav className="mt-4 flex gap-5 text-[15px]">
            {DRAFTS.map((d) => <a key={d.id} href={`#${d.id}`}>{d.name.split(" · ")[0]}</a>)}
          </nav>
        </div>
      </header>
      {DRAFTS.map(({ id, name, Comp, pitch, trade }) => (
        <section key={id} id={id} className="mx-auto max-w-[1180px] border-t border-[var(--line)] pt-10 pb-24">
          <div className="mb-8 grid gap-4 md:grid-cols-12">
            <h2 className="m-0 font-display text-[clamp(30px,3.4vw,48px)] leading-[1.02] font-bold tracking-[-0.02em] md:col-span-5">{name}</h2>
            <div className="grid gap-2 md:col-span-7">
              <p className="m-0">{pitch}</p>
              <p className="m-0 text-[15px] text-[var(--muted)]">{trade}</p>
            </div>
          </div>
          <Comp />
        </section>
      ))}
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><Page /></StrictMode>);
