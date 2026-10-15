// Organizy website: demo window, copy buttons, reviews.
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------
     Demo: a random messy Downloads folder that goes through the same
     steps as the app: scan -> review -> move -> undo.
     Destinations and reasons mirror the app's default rules.
  ---------------------------------------------------------------- */
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pad = n => String(n).padStart(2, "0");
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  const month = () => pick(MONTHS);
  const day = () => `2026-${pad(rint(1, 10))}-${pad(rint(1, 28))}`;

  // [make name, destination, reason, kind label, size range [min,max,unit]]
  const GENS = [
    [() => `invoice-${month().toLowerCase()}.pdf`, "Invoices & Receipts", 'keyword "invoice"', "PDF", [40, 400, "KB"]],
    [() => `scan_${rint(1000, 9999)}.pdf`, "Invoices & Receipts", 'content "amount due"', "PDF", [150, 900, "KB"]],
    [() => `order-confirmation (${rint(1, 4)}).pdf`, "Invoices & Receipts", 'content "order total"', "PDF", [30, 200, "KB"]],
    [() => `statement_${month().toLowerCase()}.pdf`, "Bank Statements", 'content "closing balance"', "PDF", [60, 500, "KB"]],
    [() => `W-2_2025.pdf`, "Taxes", 'keyword "W-2"', "PDF", [80, 300, "KB"]],
    [() => `1099-INT.pdf`, "Taxes", 'keyword "1099"', "PDF", [50, 200, "KB"]],
    [() => `resume_${pick(["new", "final", "2026", "v2"])}.pdf`, "Resumes & CVs", 'name "resume"', "PDF", [60, 300, "KB"]],
    [() => `CV_${pick(["english", "es", "2026"])}.docx`, "Resumes & CVs", 'name "cv"', "Word", [20, 120, "KB"]],
    [() => `Screenshot ${day()} at ${rint(8, 23)}.${pad(rint(0, 59))}.${pad(rint(0, 59))}.png`, "Screenshots", 'name "Screenshot"', "PNG image", [300, 2400, "KB"]],
    [() => `IMG_${rint(1000, 9999)}.HEIC`, "Images", "type heic", "HEIC image", [1200, 4800, "KB"]],
    [() => `IMG_${rint(1000, 9999)} (2).HEIC`, "Images", "type heic", "HEIC image", [1200, 4800, "KB"]],
    [() => `DSC_${rint(1000, 9999)}.JPG`, "Images", "type jpg", "JPEG image", [900, 5200, "KB"]],
    [() => `clip_${rint(1000, 9999)}.mov`, "Videos", "type mov", "Movie", [12, 420, "MB"]],
    [() => `Screen Recording ${day()}.mov`, "Videos", "type mov", "Movie", [8, 180, "MB"]],
    [() => `track${pad(rint(1, 14))}.mp3`, "Audio", "type mp3", "MP3 audio", [2, 9, "MB"]],
    [() => `New Recording ${rint(2, 40)}.m4a`, "Audio", "type m4a", "Audio", [1, 6, "MB"]],
    [() => `${pick(["budget", "trip", "expenses", "grades"])}-2026.xlsx`, "Spreadsheets", "type xlsx", "Excel", [8, 600, "KB"]],
    [() => `data_export_${rint(1, 9)}.csv`, "Spreadsheets", "type csv", "CSV", [3, 900, "KB"]],
    [() => `${pick(["class", "pitch", "final"])} presentation.pptx`, "Presentations", "type pptx", "PowerPoint", [2, 40, "MB"]],
    [() => `final_FINAL_v${rint(2, 7)}.docx`, "Documents", "type docx", "Word", [20, 300, "KB"]],
    [() => `Untitled document (${rint(1, 12)}).docx`, "Documents", "type docx", "Word", [8, 90, "KB"]],
    [() => `notes ${rint(1, 20)}.txt`, "Documents", "type txt", "Text", [1, 12, "KB"]],
    [() => `${pick(["project", "homework", "photos"])} (${rint(1, 4)}).zip`, "Archives", "type zip", "ZIP archive", [1, 60, "MB"]],
    [() => `backup-old-${rint(1, 5)}.zip`, "Archives", "type zip", "ZIP archive", [5, 90, "MB"]],
    [() => `Installer-${rint(1, 4)}.${rint(0, 9)}.dmg`, "Installers", "type dmg", "Disk image", [40, 320, "MB"]],
    [() => `Update-${rint(10, 30)}.pkg`, "Installers", "type pkg", "Installer", [20, 200, "MB"]],
  ];
  // A file no rule matches: the app leaves these unticked.
  const ODD = [() => `untitled.${pick(["bin", "dat", "tmp"])}`, null, "No rule matched", "Document", [1, 300, "KB"]];

  const fmtSize = ([a, b, u]) => {
    const v = rint(a, b);
    return u === "KB" && v >= 1000 ? (v / 1000).toFixed(1) + " MB" : v + " " + u;
  };

  function makeMess(n = 12) {
    const seen = new Set(), out = [];
    const gens = [...GENS];
    let guard = 0;
    while (out.length < n - 1 && guard++ < 400) {
      const g = pick(gens), name = g[0]();
      if (seen.has(name)) continue;
      seen.add(name);
      out.push({ name, dest: g[1], why: g[2], kind: g[3], size: fmtSize(g[4]), date: `${month()} ${rint(1, 28)}` });
    }
    out.splice(rint(0, out.length), 0, { name: ODD[0](), dest: null, why: ODD[2], kind: ODD[3], size: fmtSize(ODD[4]), date: `${month()} ${rint(1, 28)}` });
    return out.map((f, i) => ({ ...f, id: "f" + i + Math.random().toString(36).slice(2, 6), on: f.dest !== null }));
  }

  const body = $("ls-body"), head = $("ls-head"), status = $("win-status"), path = $("win-path");
  const btnMain = $("btn-main"), btnUndo = $("btn-undo"), btnNew = $("btn-new"), chips = $("dest-chips"), scan = $("scan");
  if (body) initDemo();

  function initDemo() {
    let files = makeMess();
    let phase = "messy"; // messy | review | done
    let busy = false;

    const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
    const headRow = cols => { const tr = el("tr"); cols.forEach(([t, c]) => tr.append(el("th", c || "", t))); head.replaceChildren(tr); };
    const nameCell = (text, folder) => { const td = el("td"); td.append(el("span", "ico" + (folder ? " f" : "")), document.createTextNode(text)); return td; };

    function fileRow(f, cols, cls = "") {
      const tr = el("tr", cls); tr.dataset.key = f.id;
      const td = nameCell(f.name);
      if (cols === "review") {
        const cb = el("input"); cb.type = "checkbox"; cb.checked = f.on; cb.disabled = !f.dest;
        cb.setAttribute("aria-label", `Move ${f.name}`);
        cb.addEventListener("change", () => { f.on = cb.checked; tr.classList.toggle("off", !f.on); updateReview(); });
        td.prepend(cb);
        if (!f.on) tr.classList.add("off");
        tr.append(td, el("td", "dest", f.dest ? "→ " + f.dest : "— Leave in place —"), el("td", "why", f.why));
      } else {
        tr.append(td, el("td", "k", f.kind), el("td", "num", f.size), el("td", "", f.date));
      }
      return tr;
    }
    const folderRow = (name, count) => {
      const tr = el("tr", "dir");
      tr.append(nameCell(name, true), el("td", "k", "Folder"), el("td", "num", `${count} item${count === 1 ? "" : "s"}`), el("td", "", "Today"));
      return tr;
    };

    function buildMessy() {
      headRow([["Name"], ["Kind"], ["Size", "num"], ["Modified"]]);
      return files.map(f => fileRow(f));
    }
    function buildReview() {
      headRow([["Name"], ["Goes to"], ["Why"]]);
      return files.map(f => fileRow(f, "review"));
    }
    function buildDone() {
      headRow([["Name"], ["Kind"], ["Size", "num"], ["Modified"]]);
      const groups = {};
      files.filter(f => f.on).forEach(f => (groups[f.dest] ||= []).push(f));
      const rows = [];
      Object.keys(groups).sort().forEach(g => {
        rows.push(folderRow(g + "/", groups[g].length));
        groups[g].sort((a, b) => a.name.localeCompare(b.name)).forEach(f => rows.push(fileRow(f, null, "child")));
      });
      files.filter(f => !f.on).forEach(f => rows.push(fileRow(f, null, "stay")));
      return { rows, folders: Object.keys(groups).length };
    }

    function updateReview() {
      const moving = files.filter(f => f.on);
      const counts = {};
      moving.forEach(f => counts[f.dest] = (counts[f.dest] || 0) + 1);
      chips.replaceChildren(...Object.keys(counts).sort().map(d => { const c = el("span", "dchip", d); c.append(el("b", "", counts[d])); return c; }));
      chips.hidden = false;
      btnMain.textContent = `Move Files (${moving.length})`;
      btnMain.disabled = moving.length === 0;
      const stay = files.length - moving.length;
      status.textContent = `${files.length} files · ${moving.length} will move · ${stay} stay${stay === 1 ? "s" : ""}`;
    }

    // FLIP: record where each file row is, swap the rows, animate each file from old spot to new.
    function flipTo(rows) {
      const before = {};
      body.querySelectorAll("tr[data-key]").forEach(r => before[r.dataset.key] = r.getBoundingClientRect().top);
      body.replaceChildren(...rows);
      if (reduce || !Element.prototype.animate) return;
      [...body.children].forEach((r, i) => {
        const k = r.dataset.key;
        if (k && before[k] !== undefined) {
          const dy = before[k] - r.getBoundingClientRect().top;
          if (Math.abs(dy) > 1) r.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], { duration: 650, easing: "cubic-bezier(.2,.8,.2,1)", delay: i * 14, fill: "backwards" });
        } else {
          r.animate([{ opacity: 0, transform: "translateX(-10px)" }, { opacity: 1, transform: "none" }], { duration: 420, easing: "ease-out", delay: 120 + i * 14, fill: "backwards" });
        }
      });
    }
    function entrance() {
      body.replaceChildren(...buildMessy());
      if (reduce || !Element.prototype.animate) return;
      [...body.children].forEach((r, i) => r.animate(
        [{ opacity: 0, transform: `translate(${rint(-14, 14)}px, 6px) rotate(${(Math.random() - .5) * 1.6}deg)` }, { opacity: 1, transform: "none" }],
        { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)", delay: i * 35, fill: "backwards" }));
    }
    const sweep = () => new Promise(res => {
      if (reduce) return res();
      scan.style.setProperty("--scan-h", (body.parentElement.offsetHeight - 2) + "px");
      scan.classList.remove("run"); void scan.offsetWidth; scan.classList.add("run");
      setTimeout(res, 520);
    });

    function toMessy(animate) {
      phase = "messy";
      path.textContent = "~/Downloads";
      chips.hidden = true;
      btnMain.hidden = false; btnMain.disabled = false; btnMain.textContent = "Scan";
      btnUndo.hidden = true;
      status.textContent = `${files.length} items in Downloads`;
      animate ? flipTo(buildMessy()) : entrance();
    }

    btnMain.addEventListener("click", async () => {
      if (busy) return;
      btnMain.classList.remove("idle");
      if (phase === "messy") {
        busy = true; btnMain.disabled = true; btnNew.disabled = true;
        status.textContent = "Reading files…";
        await sweep();
        phase = "review";
        body.replaceChildren(...buildReview());
        if (!reduce && Element.prototype.animate) [...body.children].forEach((r, i) => r.animate([{ opacity: .3 }, { opacity: 1 }], { duration: 300, delay: i * 25, fill: "backwards" }));
        updateReview();
        busy = false; btnNew.disabled = false;
      } else if (phase === "review") {
        phase = "done";
        const { rows, folders } = buildDone();
        const moved = files.filter(f => f.on).length, stay = files.length - moved;
        chips.hidden = true;
        path.textContent = "~/Documents/Organizy";
        flipTo(rows);
        status.textContent = `${moved} moved into ${folders} folder${folders === 1 ? "" : "s"}` + (stay ? ` · ${stay} left in Downloads` : "");
        btnMain.hidden = true; btnUndo.hidden = false; btnUndo.focus();
      }
    });
    btnUndo.addEventListener("click", () => { files.forEach(f => f.on = f.dest !== null); toMessy(true); btnMain.focus(); });
    btnNew.addEventListener("click", () => { if (busy) return; files = makeMess(); toMessy(false); });
    toMessy(false);
  }

  /* ---------------------------------------------------------------
     Copy buttons
  ---------------------------------------------------------------- */
  document.querySelectorAll(".copy").forEach(btn => btn.addEventListener("click", async () => {
    const target = $(btn.dataset.copy);
    if (!target) return;
    try {
      await navigator.clipboard.writeText(target.textContent);
      btn.textContent = "Copied";
    } catch {
      const r = document.createRange(); r.selectNodeContents(target);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
      btn.textContent = "Press ⌘C";
    }
    setTimeout(() => btn.textContent = "Copy", 1800);
  }));

  /* ---------------------------------------------------------------
     Reviews (Supabase). Anyone can submit; only approved reviews are
     readable. Database rules live in supabase/reviews.sql.
  ---------------------------------------------------------------- */
  const cfg = window.ORGANIZY_CONFIG || {};
  const form = $("rev-form");
  if (!form) return;
  const list = $("rev-list"), empty = $("rev-empty"), err = $("rev-err"), hint = $("rev-hint"), count = $("rev-count"), submit = $("rev-submit");
  const configured = /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(cfg.supabaseUrl || "") && (cfg.supabaseAnonKey || "").length > 20;
  const api = path => `${cfg.supabaseUrl}/rest/v1/${path}`;
  const headers = { apikey: cfg.supabaseAnonKey, Authorization: `Bearer ${cfg.supabaseAnonKey}`, "Content-Type": "application/json" };
  const COOLDOWN_KEY = "organizy-review-sent";
  const COOLDOWN_MS = 10 * 60 * 1000;

  function render(reviews, fresh) {
    list.querySelectorAll(".review").forEach(n => n.remove());
    empty.hidden = reviews.length > 0;
    reviews.forEach(r => {
      // textContent only: review text is never rendered as HTML.
      const art = document.createElement("article"); art.className = "review" + (r === fresh ? " new" : "");
      const top = document.createElement("div"); top.className = "top";
      const who = document.createElement("b"); who.textContent = r.name;
      const meta = document.createElement("span");
      const stars = document.createElement("span"); stars.className = "rating"; stars.textContent = `${r.rating}/5`;
      meta.append(stars, document.createTextNode(" · " + new Date(r.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })));
      top.append(who, meta);
      const p = document.createElement("p"); p.textContent = r.body;
      art.append(top, p); list.append(art);
    });
    if (reviews.length) {
      const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
      count.textContent = `${reviews.length} review${reviews.length === 1 ? "" : "s"} · ${avg.toFixed(1)}/5 average`;
    } else count.textContent = "0 reviews";
  }

  if (!configured) {
    form.classList.add("closed");
    form.querySelectorAll("input, textarea, button").forEach(n => n.disabled = true);
    render([]);
    hint.textContent = "Reviews open with the first release.";
    count.textContent = "opening soon";
    return;
  }

  fetch(api("reviews?select=name,rating,body,created_at&order=created_at.desc&limit=50"), { headers })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(rows => render(rows))
    .catch(() => { count.textContent = "couldn't load reviews"; render([]); });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const name = $("rev-name").value.trim();
    const body = $("rev-text").value.trim();
    const rating = Number((form.querySelector('input[name="rating"]:checked') || {}).value || 0);
    const problems = [];
    if (!name) problems.push("add a name");
    if (!rating) problems.push("pick a rating");
    if (body.length < 10) problems.push("write at least 10 characters");
    if (/https?:\/\/|www\./i.test(name + " " + body)) problems.push("remove the link");
    if (problems.length) { err.textContent = "To submit, " + problems.join(", ") + "."; err.hidden = false; return; }
    err.hidden = true;

    // Honeypot: bots fill hidden fields. Pretend it worked and send nothing.
    if ($("rev-website").value) { done(); return; }
    let last = 0;
    try { last = Number(localStorage.getItem(COOLDOWN_KEY) || 0); } catch {}
    if (Date.now() - last < COOLDOWN_MS) { err.textContent = "You just sent a review. Try again in a few minutes."; err.hidden = false; return; }

    submit.disabled = true; submit.textContent = "Sending…";
    try {
      const res = await fetch(api("reviews"), { method: "POST", headers: { ...headers, Prefer: "return=minimal" }, body: JSON.stringify({ name, rating, body }) });
      if (!res.ok) throw new Error(String(res.status));
      try { localStorage.setItem(COOLDOWN_KEY, String(Date.now())); } catch {}
      done();
    } catch {
      err.textContent = "Your review didn't send. Check your connection and try again.";
      err.hidden = false;
    } finally {
      submit.disabled = false; submit.textContent = "Submit review";
    }
  });
  function done() {
    form.reset();
    hint.textContent = "Thanks. Your review will appear once it's approved.";
  }
})();
