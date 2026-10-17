/**
 * The film's sound effects, synthesized with Web Audio so there are no audio files to load.
 * Off until the viewer turns sound on (browsers only allow audio after a click anyway).
 */
let ctx: AudioContext | null = null;
let on = false;
const listeners = new Set<(v: boolean) => void>();

export const sfxOn = () => on;
export function setSfx(v: boolean) {
  on = v;
  if (v && !ctx) ctx = new AudioContext();
  if (v && ctx?.state === "suspended") void ctx.resume();
  listeners.forEach((f) => f(v));
}
export function onSfx(f: (v: boolean) => void) {
  listeners.add(f);
  return () => { listeners.delete(f); };
}

function out(gain: number) {
  const g = ctx!.createGain();
  g.gain.value = gain;
  g.connect(ctx!.destination);
  return g;
}

function noise(seconds: number) {
  const buf = ctx!.createBuffer(1, Math.ceil(ctx!.sampleRate * seconds), ctx!.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx!.createBufferSource();
  src.buffer = buf;
  return src;
}

/** A soft mouse click: a short bright tick with a little body. */
export function click() {
  if (!on || !ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = "triangle";
  o.frequency.setValueAtTime(2200, t);
  o.frequency.exponentialRampToValueAtTime(700, t + 0.04);
  const g = out(0);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.09, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  o.connect(g);
  o.start(t);
  o.stop(t + 0.07);
}

/** An airy sweep for wipes, pushes and irises. */
export function whoosh(up = true) {
  if (!on || !ctx) return;
  const t = ctx.currentTime;
  const n = noise(0.42);
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = 1.4;
  f.frequency.setValueAtTime(up ? 500 : 2600, t);
  f.frequency.exponentialRampToValueAtTime(up ? 2600 : 500, t + 0.38);
  const g = out(0);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.05, t + 0.12);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
  n.connect(f).connect(g);
  n.start(t);
  n.stop(t + 0.42);
}

/** A low, short thump for hard cuts and punch words. */
export function thump() {
  if (!on || !ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(140, t);
  o.frequency.exponentialRampToValueAtTime(48, t + 0.18);
  const g = out(0);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.22, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
  o.connect(g);
  o.start(t);
  o.stop(t + 0.25);
}
