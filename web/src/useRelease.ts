import { useEffect, useState } from "react";

export const REPO = "koschei-dev/organizy-app";
export const RELEASES = `https://github.com/${REPO}/releases/latest`;

export type Release =
  | { state: "loading" | "unknown" }
  | { state: "none" }
  | { state: "ready"; tag: string; url: string; mb: string };

/** Latest release from GitHub: links straight to the zip when there is one. */
// One request per page load, shared by every download button.
let pending: Promise<Release> | null = null;
const load = (): Promise<Release> =>
  (pending ??= fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: "application/vnd.github+json" } })
    .then(async (res): Promise<Release> => {
      if (res.status === 404) return { state: "none" };
      if (!res.ok) return { state: "unknown" };
      const rel = await res.json();
      const zip = (rel.assets ?? []).find((a: { name: string }) => /^Organizy-.*\.zip$/i.test(a.name));
      return zip ? { state: "ready", tag: rel.tag_name, url: zip.browser_download_url, mb: (zip.size / 1e6).toFixed(1) } : { state: "unknown" };
    })
    .catch((): Release => ({ state: "unknown" })));

export function useRelease(): Release {
  const [r, setR] = useState<Release>({ state: "loading" });
  useEffect(() => {
    let alive = true;
    load().then((x) => alive && setR(x));
    return () => {
      alive = false;
    };
  }, []);
  return r;
}

export function downloadLink(r: Release) {
  if (r.state === "ready") return { href: r.url, label: `Download ${r.tag}`, note: `${r.mb} MB · macOS 14 or later` };
  if (r.state === "none")
    return { href: `https://github.com/${REPO}`, label: "First release soon", note: "On GitHub, Watch › Custom › Releases to hear when it's out" };
  return { href: RELEASES, label: "Download for macOS", note: "Free · macOS 14 or later" };
}
