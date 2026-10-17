import { Film, type SceneDef } from "./Film";
import { SceneDrop, SceneReads, SceneReasons, SceneTitle } from "./two/ch1";
import { SceneHistory, SceneNothing, SceneReview } from "./two/ch2";
import { SceneOverwrite, SceneRules, SceneSmall, SceneThirteen } from "./two/ch3";
import { SceneCheck, SceneDownload, SceneInstall, SceneLearn, SceneOpen, SceneSorted, SceneStraight, SceneWordmark } from "./two/ch4";

/** Draft 2, "Kinetic type": big Bodoni words carry the story; small crisp app fragments act between them. */
export const DRAFT_TWO: SceneDef[] = [
  { id: "title", chapter: "Messy folder", dur: 3.4, Scene: SceneTitle },
  { id: "drop", chapter: "Messy folder", dur: 4.2, Scene: SceneDrop },
  { id: "reads", chapter: "It reads", dur: 4.0, Scene: SceneReads },
  { id: "reasons", chapter: "It reads", dur: 6.0, Scene: SceneReasons },
  { id: "review", chapter: "You review", dur: 5.0, Scene: SceneReview },
  { id: "nothing", chapter: "You review", dur: 3.4, Scene: SceneNothing },
  { id: "history", chapter: "History", dur: 4.4, Scene: SceneHistory },
  { id: "small", chapter: "Small things", dur: 2.0, Scene: SceneSmall },
  { id: "thirteen", chapter: "Small things", dur: 4.0, Scene: SceneThirteen },
  { id: "rules", chapter: "Small things", dur: 4.2, Scene: SceneRules },
  { id: "overwrite", chapter: "Small things", dur: 3.2, Scene: SceneOverwrite },
  { id: "learn", chapter: "It learns", dur: 4.8, Scene: SceneLearn },
  { id: "straight", chapter: "It learns", dur: 3.0, Scene: SceneStraight },
  { id: "sorted", chapter: "It learns", dur: 3.4, Scene: SceneSorted },
  { id: "install", chapter: "Install", dur: 3.2, Scene: SceneInstall },
  { id: "download", chapter: "Install", dur: 2.8, Scene: SceneDownload },
  { id: "open", chapter: "Install", dur: 2.8, Scene: SceneOpen },
  { id: "check", chapter: "Install", dur: 3.0, Scene: SceneCheck },
  { id: "wordmark", chapter: "Install", dur: 3.2, Scene: SceneWordmark },
];

export function DraftTwo() {
  return (
    <Film
      scenes={DRAFT_TWO}
      label="A type-led motion film about Organizy, a free Mac app that sorts messy folders: it reads each file and gives a reason for every suggestion, lets you review the whole list before anything moves, keeps an undo history, handles the small things like never overwriting, learns your folders, and installs in a minute."
    />
  );
}
