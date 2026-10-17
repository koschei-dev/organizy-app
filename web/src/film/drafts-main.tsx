import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";
import { Film } from "./Film";
import { FULL, SHORT } from "./SiteFilm";

/** A review page for the film: each cut on its own, with ?t=SECONDS to freeze a frame. */
function Page() {
  return (
    <main className="mx-auto grid max-w-[1180px] gap-24 px-[clamp(16px,3vw,40px)] py-16">
      <section id="short">
        <h2 className="m-0 mb-6 font-display text-[40px] font-bold">Short cut</h2>
        <Film scenes={SHORT} label="Short cut" loop={false} />
      </section>
      <section id="full">
        <h2 className="m-0 mb-6 font-display text-[40px] font-bold">Full film</h2>
        <Film scenes={FULL} label="Full film" loop={false} />
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><Page /></StrictMode>);
