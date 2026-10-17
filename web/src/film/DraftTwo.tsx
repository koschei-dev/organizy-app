import { Film, type SceneDef } from "./Film";
import { SceneDrop, SceneReadPunch, SceneReads, SceneReasons, SceneSuspects, SceneTitle } from "./two/ch1";
import { SceneHistory, SceneNothing, SceneReview, SceneReviewPunch } from "./two/ch2";
import { SceneOverwrite, SceneRules, SceneSmall, SceneThirteen } from "./two/ch3";
import { SceneCheck, SceneDownload, SceneInstall, SceneLearn, SceneOpen, SceneSorted, SceneStraight, SceneWordmark } from "./two/ch4";

/**
 * Draft 2, "Kinetic type": big Bodoni words carry the story; small crisp app fragments act between them.
 * Scenes alternate colour blocks (surface, accent, inverted ink) and layouts (centred type, split screen, marquee,
 * giant cropped word, counter with a panning wall), and cut between each other with a mix of entrances.
 */
export const DRAFT_TWO: SceneDef[] = [
  { id: "title", chapter: "Messy folder", dur: 3.4, Scene: SceneTitle },
  { id: "drop", chapter: "Messy folder", dur: 4.2, Scene: SceneDrop, enter: { iris: [50, 50] } },
  { id: "suspects", chapter: "Messy folder", dur: 2.4, Scene: SceneSuspects, enter: "push" },
  { id: "read", chapter: "It reads", dur: 1.2, Scene: SceneReadPunch, enter: "cut" },
  { id: "reads", chapter: "It reads", dur: 3.4, Scene: SceneReads, enter: "wipe" },
  { id: "reasons", chapter: "It reads", dur: 5.1, Scene: SceneReasons, enter: "zoom" },
  { id: "review-punch", chapter: "You review", dur: 1.2, Scene: SceneReviewPunch, enter: "cut" },
  { id: "review", chapter: "You review", dur: 4.6, Scene: SceneReview, enter: "pushUp" },
  { id: "nothing", chapter: "You review", dur: 3.2, Scene: SceneNothing, enter: "zoomOut" },
  { id: "history", chapter: "History", dur: 4.0, Scene: SceneHistory, enter: { iris: [62, 72] } },
  { id: "small", chapter: "Small things", dur: 2.0, Scene: SceneSmall, enter: "wipeUp" },
  { id: "thirteen", chapter: "Small things", dur: 4.8, Scene: SceneThirteen, enter: "push" },
  { id: "rules", chapter: "Small things", dur: 4.0, Scene: SceneRules, enter: "wipeLeft" },
  { id: "overwrite", chapter: "Small things", dur: 3.2, Scene: SceneOverwrite, enter: "pushUp" },
  { id: "learn", chapter: "It learns", dur: 4.4, Scene: SceneLearn, enter: "wipe" },
  { id: "straight", chapter: "It learns", dur: 3.0, Scene: SceneStraight, enter: { iris: [70, 60] } },
  { id: "sorted", chapter: "It learns", dur: 3.2, Scene: SceneSorted, enter: "wipeUp" },
  { id: "install", chapter: "Install", dur: 2.6, Scene: SceneInstall, enter: "zoom" },
  { id: "download", chapter: "Install", dur: 2.8, Scene: SceneDownload, enter: "push" },
  { id: "open", chapter: "Install", dur: 2.8, Scene: SceneOpen, enter: "push" },
  { id: "check", chapter: "Install", dur: 3.0, Scene: SceneCheck, enter: "push" },
  { id: "wordmark", chapter: "Install", dur: 3.2, Scene: SceneWordmark, enter: { iris: [50, 50] } },
];

export function DraftTwo() {
  return (
    <Film
      scenes={DRAFT_TWO}
      label="A type-led motion film about Organizy, a free Mac app that sorts messy folders: it reads each file and gives a reason for every suggestion, lets you review the whole list before anything moves, keeps an undo history, handles the small things like never overwriting, learns your folders, and installs in a minute."
    />
  );
}
