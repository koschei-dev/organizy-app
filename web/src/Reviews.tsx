import { AnimatePresence, motion } from "motion/react";
import { type FormEvent, useEffect, useState } from "react";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";
import { spring } from "./smoothui/springs";

type Review = { name: string; rating: number; body: string; created_at: string };
const configured = /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(SUPABASE_URL) && SUPABASE_ANON_KEY.length > 20;
const headers = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json" };
const COOLDOWN = "organizy-review-sent";

/** Reviews in Supabase: anyone can submit, only approved ones show (rules in supabase/reviews.sql). */
export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!configured) return;
    fetch(`${SUPABASE_URL}/rest/v1/reviews?select=name,rating,body,created_at&order=created_at.desc&limit=50`, { headers })
      .then((r) => (r.ok ? r.json() : []))
      .then(setReviews)
      .catch(() => {});
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    const body = String(f.get("body") ?? "").trim();
    const problems: string[] = [];
    if (!name) problems.push("add a name");
    if (!rating) problems.push("pick a rating");
    if (body.length < 10) problems.push("write at least 10 characters");
    if (/https?:\/\/|www\./i.test(`${name} ${body}`)) problems.push("remove the link");
    if (problems.length) return setErr(`To submit, ${problems.join(", ")}.`);
    if (f.get("website")) return setSent(true); // bots fill the hidden field
    try {
      if (Date.now() - Number(localStorage.getItem(COOLDOWN) ?? 0) < 600_000) return setErr("You just sent a review. Try again in a few minutes.");
    } catch {}
    setErr("");
    setBusy(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, { method: "POST", headers: { ...headers, Prefer: "return=minimal" }, body: JSON.stringify({ name, rating, body }) });
      if (!res.ok) throw new Error();
      try {
        localStorage.setItem(COOLDOWN, String(Date.now()));
      } catch {}
      setSent(true);
    } catch {
      setErr("Your review didn't send. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const avg = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="grid gap-12 md:grid-cols-12">
      <div className="md:col-span-5">
        <h2 className="font-display text-[clamp(28px,2.4vw,36px)] leading-tight font-medium">Reviews</h2>
        <p className="mt-3 max-w-[40ch]">
          {configured ? (avg ? `${reviews.length} reviews, ${avg} out of 5 on average.` : "No reviews yet. Tried Organizy? Be the first.") : "Reviews open with the first release."}
        </p>
        <ul className="mt-8 grid gap-8">
          {reviews.map((r) => (
            <li key={r.created_at + r.name}>
              <p className="text-[17px]">{r.body}</p>
              <p className="mt-1 text-[15px] text-[var(--muted)]">
                {r.name} · {r.rating} out of 5
              </p>
            </li>
          ))}
        </ul>
      </div>
      <form onSubmit={submit} noValidate className={`grid content-start gap-5 md:col-span-6 md:col-start-7 ${configured ? "" : "opacity-60"}`}>
        <fieldset disabled={!configured || busy || sent} className="contents">
          <label className="grid gap-1.5">
            <span>Your name</span>
            <input name="name" maxLength={40} autoComplete="nickname" className="h-12 rounded-none bg-[var(--surface)] px-4 outline-none focus:bg-[var(--surface-2)]" />
          </label>
          <div className="grid gap-1.5" role="radiogroup" aria-label="Rating">
            <span>Rating</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  onClick={() => setRating(n)}
                  className={`relative size-12 transition-colors ${rating >= n ? "text-[var(--on-accent)]" : "bg-[var(--surface)]"}`}
                >
                  {rating >= n && <motion.span layoutId={`r${n}`} className="absolute inset-0 bg-[var(--accent)]" transition={spring.fast} />}
                  <span className="relative">{n}</span>
                </button>
              ))}
            </div>
          </div>
          <label className="grid gap-1.5">
            <span>What did Organizy clean up for you?</span>
            <textarea name="body" maxLength={600} rows={4} className="resize-y rounded-none bg-[var(--surface)] p-4 outline-none focus:bg-[var(--surface-2)]" />
          </label>
          <label className="absolute -left-[9999px]" aria-hidden="true">
            Website <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className="h-12 bg-[var(--accent)] px-6 font-medium text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)]">
              {busy ? "Sending…" : "Send review"}
            </button>
            <span className="text-[15px] text-[var(--muted)]">Reviews are read before they appear. No links, please.</span>
          </div>
        </fieldset>
        <AnimatePresence>
          {(err || sent) && (
            <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status">
              {sent ? "Thanks. Your review will appear once it's approved." : err}
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
