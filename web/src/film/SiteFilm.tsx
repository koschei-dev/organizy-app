import { useState } from "react";
import { DRAFT_TWO } from "./DraftTwo";
import { Film, type SceneDef } from "./Film";
import { INTRO_B } from "./intros";

/**
 * The site's film: the "Snap" logo intro, then the kinetic film. A short cut plays by default;
 * "Watch the full film" swaps in every scene. Both play once and stop on the wordmark.
 */
const pick = (id: string) => DRAFT_TWO.find((s) => s.id === id)!;
const INTRO: SceneDef = { ...INTRO_B[0], chapter: "Intro" };

export const SHORT: SceneDef[] = [
  INTRO,
  { ...pick("drop"), chapter: "Drop" },
  { ...pick("reasons"), chapter: "It reads" },
  { ...pick("review"), chapter: "You review" },
  { ...pick("nothing"), chapter: "You review" },
  { ...pick("straight"), chapter: "It learns" },
  { ...pick("wordmark"), chapter: "Get it" },
];
export const FULL: SceneDef[] = [INTRO, ...DRAFT_TWO];

const secs = (s: SceneDef[]) => Math.round(s.reduce((a, b) => a + b.dur, 0));
const clock = (n: number) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;

const LABEL =
  "A short film about Organizy. A messy folder is dropped on the app; it reads each file and suggests a folder with the reason; you untick one and change another; nothing moves until you click Move Files; and a week later a similar file goes straight to the folder it learned.";

export function SiteFilm() {
  const [full, setFull] = useState(false);
  const scenes = full ? FULL : SHORT;
  return (
    <div>
      <Film key={full ? "full" : "short"} scenes={scenes} label={LABEL} loop={false} />
      <p className="m-0 mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-[15px] text-[var(--muted)]">
        <span>{full ? "The full film: every chapter, from the messy folder to installing it." : "The short cut. The full film also covers History, the small things, and installing it."}</span>
        <button type="button" onClick={() => setFull((v) => !v)} className="font-medium text-[var(--ink)] underline decoration-[var(--accent)] underline-offset-4 hover:text-[var(--accent)]">
          {full ? `Back to the short cut (${clock(secs(SHORT))})` : `Watch the full film (${clock(secs(FULL))})`}
        </button>
      </p>
    </div>
  );
}
