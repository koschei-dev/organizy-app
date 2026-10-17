import { createRoot } from "react-dom/client";
import "../styles.css";
import { Film } from "./Film";
import { FULL, SHORT } from "./SiteFilm";

/** Renders one cut full-bleed with no controls, for recording: ?cut=short or ?cut=full. */
const cut = new URLSearchParams(location.search).get("cut") === "full" ? FULL : SHORT;
createRoot(document.getElementById("root")!).render(<Film scenes={cut} label="Organizy" loop={false} bare />);
