// Super Internet song engine — used by the Beat Maker and the AI Song Studio.
// Renders drums, bass, keys, pads, lead melodies and arps through a small
// reverb + delay bus so generated songs sound produced rather than bare.

export const ROWS = [
  { key: "kick", label: "Kick", color: "bg-fuchsia-500" },
  { key: "snare", label: "Snare", color: "bg-cyan-500" },
  { key: "clap", label: "Clap", color: "bg-violet-400" },
  { key: "hatC", label: "Closed hat", color: "bg-amber-400" },
  { key: "hatO", label: "Open hat", color: "bg-amber-300" },
  { key: "tom", label: "Tom", color: "bg-orange-400" },
  { key: "bass", label: "Bass", color: "bg-emerald-500" },
  { key: "keys", label: "Keys", color: "bg-sky-400" },
];

export const PRESET_BEATS = [
  {
    id: "boombap", name: "Boom Bap", bpm: 90, swing: 0.35, progression: ["Am", "F", "C", "G"],
    drums: { kick: [0, 7, 10], snare: [4, 12], clap: [], hatC: [0, 2, 4, 6, 8, 10, 12, 14], hatO: [], tom: [], bass: [0, 7, 10], keys: [0, 8] },
    style: { bass: "saw", keys: "rhodes", pad: true, lead: "pluck", arp: false, reverb: 0.2 },
  },
  {
    id: "trap", name: "Trap", bpm: 142, swing: 0, progression: ["Cm", "Ab", "Eb", "Bb"],
    drums: { kick: [0, 6, 8, 11], snare: [8], clap: [4, 12], hatC: [0, 1, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15], hatO: [14], tom: [], bass: [0, 6, 8], keys: [0] },
    style: { bass: "sub", keys: "bell", pad: true, lead: "bell", arp: false, reverb: 0.24 },
  },
  {
    id: "house", name: "House", bpm: 124, swing: 0, progression: ["Fm", "Ab", "Eb", "Db"],
    drums: { kick: [0, 4, 8, 12], snare: [], clap: [4, 12], hatC: [2, 6, 10, 14], hatO: [2, 6, 10, 14], tom: [], bass: [2, 6, 10, 14], keys: [0, 8] },
    style: { bass: "square", keys: "organ", pad: true, lead: "pluck", arp: true, reverb: 0.3 },
  },
  {
    id: "drill", name: "Drill", bpm: 140, swing: 0, progression: ["Gm", "Eb", "Bb", "F"],
    drums: { kick: [0, 3, 8, 11], snare: [8], clap: [4, 12], hatC: [0, 2, 4, 6, 8, 10, 12, 14], hatO: [7], tom: [15], bass: [0, 3, 8, 11], keys: [0] },
    style: { bass: "sub", keys: "bell", pad: true, lead: "bell", arp: false, reverb: 0.22 },
  },
  {
    id: "afro", name: "Afrobeats", bpm: 104, swing: 0.18, progression: ["Dm", "Gm", "Bb", "C"],
    drums: { kick: [0, 6, 10], snare: [3, 11], clap: [4, 12], hatC: [0, 2, 5, 7, 8, 10, 13, 15], hatO: [], tom: [14, 15], bass: [0, 3, 6, 10], keys: [0, 8] },
    style: { bass: "saw", keys: "marimba", pad: false, lead: "guitar", arp: false, reverb: 0.26 },
  },
  {
    id: "rock", name: "Rock", bpm: 122, swing: 0, progression: ["Em", "C", "G", "D"],
    drums: { kick: [0, 8], snare: [4, 12], clap: [], hatC: [0, 2, 4, 6, 8, 10, 12, 14], hatO: [], tom: [14, 15], bass: [0, 8], keys: [0] },
    style: { bass: "saw", keys: "organ", pad: false, lead: "lead", arp: false, reverb: 0.14 },
  },
  {
    id: "lofi", name: "Lo-Fi", bpm: 78, swing: 0.3, progression: ["Am", "F", "C", "G"],
    drums: { kick: [0, 7, 10], snare: [4, 12], clap: [], hatC: [0, 2, 4, 6, 8, 10, 12, 14], hatO: [], tom: [], bass: [0, 7, 10], keys: [0, 8] },
    style: { bass: "round", keys: "rhodes", pad: true, lead: "pluck", arp: false, reverb: 0.36 },
  },
  {
    id: "rnb", name: "R&B", bpm: 86, swing: 0.22, progression: ["Dm", "Bb", "F", "C"],
    drums: { kick: [0, 6, 10], snare: [4, 12], clap: [12], hatC: [0, 2, 4, 6, 8, 10, 11, 12, 14], hatO: [6], tom: [], bass: [0, 6, 10], keys: [0, 8] },
    style: { bass: "round", keys: "rhodes", pad: true, lead: "bell", arp: false, reverb: 0.28 },
  },
  {
    id: "pop", name: "Pop", bpm: 112, swing: 0, progression: ["C", "G", "Am", "F"],
    drums: { kick: [0, 4, 8, 12], snare: [4, 12], clap: [4, 12], hatC: [2, 6, 10, 14], hatO: [], tom: [], bass: [0, 4, 8, 12], keys: [0, 8] },
    style: { bass: "saw", keys: "piano", pad: true, lead: "lead", arp: false, reverb: 0.24 },
  },
  {
    id: "amapiano", name: "Amapiano", bpm: 112, swing: 0.12, progression: ["Bm", "G", "D", "A"],
    drums: { kick: [0, 7, 10], snare: [4, 12], clap: [], hatC: [2, 5, 7, 10, 13, 15], hatO: [], tom: [14, 15], bass: [0, 3, 6, 10], keys: [0, 8] },
    style: { bass: "sub", keys: "marimba", pad: true, lead: "marimba", arp: true, reverb: 0.3 },
  },
  {
    id: "cinematic", name: "Cinematic", bpm: 72, swing: 0, progression: ["Dm", "Bb", "F", "C"],
    drums: { kick: [0, 8], snare: [], clap: [], hatC: [], hatO: [], tom: [14], bass: [0, 8], keys: [0, 8] },
    style: { bass: "round", keys: "strings", pad: true, lead: "strings", arp: false, reverb: 0.46 },
  },
  {
    id: "edm", name: "EDM", bpm: 128, swing: 0, progression: ["Am", "F", "C", "G"],
    drums: { kick: [0, 4, 8, 12], snare: [], clap: [4, 12], hatC: [2, 6, 10, 14], hatO: [2, 6, 10, 14], tom: [], bass: [2, 6, 10, 14], keys: [0, 8] },
    style: { bass: "square", keys: "organ", pad: true, lead: "saw", arp: true, reverb: 0.32 },
  },
];

export const PROGRESSIONS = [
  ["Am", "F", "C", "G"],
  ["C", "G", "Am", "F"],
  ["Dm", "Bb", "F", "C"],
  ["Em", "C", "G", "D"],
  ["Am", "Dm", "E7", "Am"],
  ["Fm", "Ab", "Eb", "Db"],
];

const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const CHORDS = ["Am", "A", "Bb", "Bm", "C", "Cm", "Dm", "D", "Eb", "Em", "E", "F", "Fm", "G", "Gm"];

const DEFAULT_STYLE = { bass: "saw", keys: "rhodes", pad: true, lead: "pluck", arp: false, reverb: 0.24 };
const KEYS_WAVE = { rhodes: "triangle", piano: "triangle", bell: "sine", organ: "square", marimba: "sine", strings: "sawtooth" };

export function chordMidi(chord) {
  const m = /^([A-G])([#b]?)/.exec(chord || "C") || ["C", "C", ""];
  let root = 48 + SEMI[m[1]];
  if (m[2] === "#") root += 1;
  if (m[2] === "b") root -= 1;
  const q = (chord || "C").slice(1).replace(/[#b]/, "");
  const minor = /^m(?!aj)/.test(q);
  const seventh = /7/.test(q);
  const notes = [root, root + (minor ? 3 : 4), root + 7];
  if (seventh) notes.push(root + (minor ? 10 : 11));
  return notes;
}

export const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);

const NOTE_SEMI = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };

export function noteToMidi(note) {
  const m = /^([A-Ga-g])([#b]?)(-?\d)?$/.exec(String(note || "").trim());
  if (!m) return null;
  const semi = NOTE_SEMI[m[1].toUpperCase() + (m[2] || "")];
  if (semi == null) return null;
  const oct = m[3] != null ? Number(m[3]) : 4;
  return (oct + 1) * 12 + semi;
}

export function audioCtx() {
  if (!window.__wa_song_ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    window.__wa_song_ctx = new AC();
  }
  return window.__wa_song_ctx;
}

function noiseBuffer(ctx, seconds) {
  const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * seconds)), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

const VERB = new WeakMap();
function impulse(ctx) {
  if (!VERB.has(ctx)) {
    const len = Math.floor(ctx.sampleRate * 2.2);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    VERB.set(ctx, buf);
  }
  return VERB.get(ctx);
}

// master -> compressor -> dest, with shared reverb + delay buses
function createMix(ctx, dest, opts = {}) {
  const master = ctx.createGain();
  master.gain.value = 0.82;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.ratio.value = 3;
  comp.attack.value = 0.004;
  comp.release.value = 0.18;
  master.connect(comp);
  comp.connect(dest);

  const conv = ctx.createConvolver();
  conv.buffer = impulse(ctx);
  const wet = ctx.createGain();
  wet.gain.value = opts.reverb == null ? 0.3 : opts.reverb;
  conv.connect(wet);
  wet.connect(master);

  const delay = ctx.createDelay(1.5);
  delay.delayTime.value = 0.3;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.26;
  const dWet = ctx.createGain();
  dWet.gain.value = 0.16;
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(dWet);
  dWet.connect(master);

  const dry = ctx.createGain();
  dry.gain.value = 1;
  dry.connect(master);

  return { master, dry, reverb: conv, delay };
}

const MIXES = new WeakMap();
function mixFor(ctx, dest) {
  if (!MIXES.has(ctx)) MIXES.set(ctx, new WeakMap());
  const byDest = MIXES.get(ctx);
  if (!byDest.has(dest)) byDest.set(dest, createMix(ctx, dest));
  return byDest.get(dest);
}

function bus(ctx, mix, gain = 1, sendReverb = 0, sendDelay = 0) {
  const g = ctx.createGain();
  g.gain.value = gain;
  g.connect(mix.dry);
  if (sendReverb > 0) {
    const s = ctx.createGain();
    s.gain.value = sendReverb;
    g.connect(s);
    s.connect(mix.reverb);
  }
  if (sendDelay > 0) {
    const s = ctx.createGain();
    s.gain.value = sendDelay;
    g.connect(s);
    s.connect(mix.delay);
  }
  return g;
}

// ---------------------------------------------------------------- drum voices
export function drumHit(ctx, dest, kind, t) {
  const mix = { dry: dest, reverb: null, delay: null };
  voice(ctx, mix, kind, t, 1);
}

function voice(ctx, mix, kind, t, vel = 1) {
  if (kind === "kick") {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(54, t + 0.09);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.34);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.95 * vel, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.36);
    o.connect(g);
    g.connect(mix.dry);
    o.start(t);
    o.stop(t + 0.38);
    const n = ctx.createBufferSource();
    n.buffer = noiseBuffer(ctx, 0.03);
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1900;
    const cg = ctx.createGain();
    cg.gain.setValueAtTime(0.2 * vel, t);
    cg.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    n.connect(hp);
    hp.connect(cg);
    cg.connect(mix.dry);
    n.start(t);
    n.stop(t + 0.04);
    return;
  }
  if (kind === "tom") {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(230, t);
    o.frequency.exponentialRampToValueAtTime(110, t + 0.18);
    g.gain.setValueAtTime(0.5 * vel, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
    o.connect(g);
    g.connect(mix.dry);
    o.start(t);
    o.stop(t + 0.26);
    return;
  }
  if (kind === "clap") {
    [0, 0.012, 0.026].forEach((off, i) => {
      const n = ctx.createBufferSource();
      n.buffer = noiseBuffer(ctx, 0.16);
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 1750;
      bp.Q.value = 1.4;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.34 * vel * (i === 2 ? 1.1 : 0.8), t + off);
      g.gain.exponentialRampToValueAtTime(0.001, t + off + 0.14);
      n.connect(bp);
      bp.connect(g);
      g.connect(mix.dry);
      n.start(t + off);
      n.stop(t + off + 0.17);
    });
    return;
  }
  if (kind === "snare") {
    const n = ctx.createBufferSource();
    n.buffer = noiseBuffer(ctx, 0.24);
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1300;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.46 * vel, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    n.connect(hp);
    hp.connect(g);
    g.connect(mix.dry);
    n.start(t);
    n.stop(t + 0.25);
    const body = ctx.createOscillator();
    const bg = ctx.createGain();
    body.type = "triangle";
    body.frequency.setValueAtTime(186, t);
    bg.gain.setValueAtTime(0.16 * vel, t);
    bg.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    body.connect(bg);
    bg.connect(mix.dry);
    body.start(t);
    body.stop(t + 0.12);
    return;
  }
  const open = kind === "hatO";
  const n = ctx.createBufferSource();
  const dur = open ? 0.26 : 0.045;
  n.buffer = noiseBuffer(ctx, dur);
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = open ? 6800 : 8200;
  const g = ctx.createGain();
  g.gain.setValueAtTime((open ? 0.18 : 0.2) * vel, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  n.connect(hp);
  hp.connect(g);
  g.connect(mix.dry);
  n.start(t);
  n.stop(t + dur + 0.02);
}

// ------------------------------------------------------------- pitched voices
export function toneHit(ctx, dest, freq, t, dur = 0.28, type = "sine", gain = 0.16) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(dest);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function bassNote(ctx, mix, midi, t, dur, style) {
  const freq = midiToFreq(midi);
  const kind = style.bass || "saw";
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.Q.value = 5;
  lp.frequency.setValueAtTime(kind === "sub" ? 320 : 1500, t);
  lp.frequency.exponentialRampToValueAtTime(kind === "sub" ? 140 : 260, t + dur);
  o.type = kind === "square" ? "square" : kind === "saw" ? "sawtooth" : kind === "sub" ? "sine" : "triangle";
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(kind === "sub" ? 0.6 : 0.42, t + 0.014);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(lp);
  lp.connect(g);
  g.connect(mix.dry);
  o.start(t);
  o.stop(t + dur + 0.03);

  if (freq > 78) {
    const sub = ctx.createOscillator();
    const sg = ctx.createGain();
    sub.type = "sine";
    sub.frequency.setValueAtTime(freq / 2, t);
    sg.gain.setValueAtTime(0.0001, t);
    sg.gain.exponentialRampToValueAtTime(0.28, t + 0.02);
    sg.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    sub.connect(sg);
    sg.connect(mix.dry);
    sub.start(t);
    sub.stop(t + dur + 0.03);
  }
}

function keysChord(ctx, mix, notes, t, dur, style) {
  const wave = KEYS_WAVE[style.keys] || "triangle";
  const out = bus(ctx, mix, 1, 0.18, 0);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = style.keys === "organ" ? 3200 : 2400;
  lp.connect(out);
  const voicing = [...notes, notes[2] + 12];
  voicing.forEach((n, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = wave;
    o.frequency.setValueAtTime(midiToFreq(n), t);
    o.detune.value = i % 2 ? 4 : -4;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.11 / (i + 1), t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(lp);
    o.start(t);
    o.stop(t + dur + 0.02);
  });
}

function padChord(ctx, mix, notes, t, dur) {
  const out = bus(ctx, mix, 1, 0.55, 0);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1300;
  lp.connect(out);
  notes.forEach((n) => {
    [-6, 6].forEach((detune) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sawtooth";
      o.detune.value = detune;
      o.frequency.setValueAtTime(midiToFreq(n), t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.03, t + Math.min(0.5, dur * 0.4));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(lp);
      o.start(t);
      o.stop(t + dur + 0.02);
    });
  });
}

function leadNote(ctx, mix, midi, t, dur, style) {
  const freq = midiToFreq(midi);
  const kind = style.lead || "pluck";
  const out = bus(ctx, mix, 1, 0.3, kind === "bell" ? 0.3 : 0.16);
  const o = ctx.createOscillator();
  const o2 = ctx.createOscillator();
  const g = ctx.createGain();
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = kind === "strings" ? 1800 : 4200;
  o.type = kind === "bell" ? "sine" : kind === "guitar" ? "triangle" : kind === "strings" ? "sawtooth" : kind === "lead" || kind === "saw" ? "sawtooth" : "triangle";
  o2.type = "sine";
  o.frequency.setValueAtTime(freq, t);
  o2.frequency.setValueAtTime(freq * 2, t);
  const attack = kind === "strings" ? 0.24 : 0.012;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(kind === "strings" ? 0.075 : 0.13, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(lp);
  o2.connect(lp);
  lp.connect(g);
  g.connect(out);
  o.start(t);
  o2.start(t);
  o.stop(t + dur + 0.02);
  o2.stop(t + dur + 0.02);
}

function arpNote(ctx, mix, midi, t, style) {
  const out = bus(ctx, mix, 1, 0.2, 0.32);
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = style.keys === "marimba" ? "sine" : "triangle";
  o.frequency.setValueAtTime(midiToFreq(midi), t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.055, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  o.connect(g);
  g.connect(out);
  o.start(t);
  o.stop(t + 0.18);
}

// ---------------------------------------------------------------- arrangement
const SHAPE = ["intro", "groove", "build", "full", "full", "full", "break", "outro"];
const SECTION_LAYERS = {
  intro: { drums: false, bass: false, keys: true, pad: true, lead: false, arp: false },
  groove: { drums: "light", bass: true, keys: true, pad: true, lead: false, arp: false },
  build: { drums: true, bass: true, keys: true, pad: true, lead: false, arp: false },
  full: { drums: true, bass: true, keys: true, pad: true, lead: true, arp: true },
  break: { drums: "light", bass: false, keys: true, pad: true, lead: true, arp: false },
  outro: { drums: false, bass: false, keys: true, pad: true, lead: false, arp: false },
};

const sectionAt = (bar, bars) => {
  if (bars <= 4) return bar === 0 ? "groove" : "full";
  return SHAPE[Math.min(SHAPE.length - 1, Math.floor((bar / bars) * SHAPE.length))];
};

function styleFor(id) {
  const p = PRESET_BEATS.find((b) => b.id === id) || PRESET_BEATS[0];
  return p.style || DEFAULT_STYLE;
}

function melodyFor(song, prog) {
  const given = Array.isArray(song.melody) ? song.melody.map(noteToMidi).filter((n) => n != null) : [];
  if (given.length >= 4) return given.slice(0, 16);
  const out = [];
  for (let bar = 0; bar < 4; bar++) {
    const n = chordMidi(prog[bar % prog.length]);
    out.push(n[0] + 12, n[1] + 12, n[2] + 12, n[0] + 24);
  }
  return out;
}

const LEAD_STEPS = [0, 3, 6, 8, 11, 14];

// Plays one step of the pattern at absolute time t.
export function playStepAt(ctx, dest, chord, drums, step, t, extras = {}) {
  const mix = mixFor(ctx, dest);
  const style = { ...DEFAULT_STYLE, ...(extras.style || {}) };
  if (extras.pad) padChord(ctx, mix, chordMidi(chord), t, extras.padDur || 0.9);
  ROWS.forEach((r) => {
    if (!(drums[r.key] || []).includes(step)) return;
    if (r.key === "bass") bassNote(ctx, mix, chordMidi(chord)[0] - 12, t, 0.3, style);
    else if (r.key === "keys") keysChord(ctx, mix, chordMidi(chord), t, 0.5, style);
    else voice(ctx, mix, r.key, t, 1);
  });
}

// Schedules a whole song. Returns the song length in seconds.
export function scheduleSong(ctx, dest, song, startAt = 0) {
  const bpm = Math.max(60, Math.min(180, song.bpm || 100));
  const stepDur = 60 / bpm / 4;
  const bars = Math.max(1, Math.min(32, song.bars || 8));
  const kit = song.drums || PRESET_BEATS[0].drums;
  const prog = Array.isArray(song.progression) && song.progression.length ? song.progression : PRESET_BEATS[0].progression;
  const style = { ...DEFAULT_STYLE, ...styleFor(song.drumStyle), ...(song.style || {}) };
  const swingAmt = (song.swing || 0) * stepDur * 0.4;
  const mix = createMix(ctx, dest, { reverb: style.reverb });
  const melody = melodyFor(song, prog);
  const energy = Math.max(1, Math.min(10, song.energy || 6));

  for (let bar = 0; bar < bars; bar++) {
    const chord = prog[bar % prog.length];
    const notes = chordMidi(chord);
    const L = SECTION_LAYERS[sectionAt(bar, bars)] || SECTION_LAYERS.full;
    const barStart = startAt + bar * 16 * stepDur;
    const lastBar = bar === bars - 1;

    if (style.pad && L.pad) padChord(ctx, mix, notes, barStart, 16 * stepDur * 0.98);

    for (let s = 0; s < 16; s++) {
      const t = barStart + s * stepDur + (s % 2 ? swingAmt : 0);

      if (L.keys && (s === 0 || s === 8)) keysChord(ctx, mix, notes, t, 8 * stepDur * 0.92, style);

      if (L.bass && (kit.bass || []).includes(s)) bassNote(ctx, mix, notes[0] - 12, t, stepDur * 2.4, style);

      if (L.drums) {
        const light = L.drums === "light";
        if ((kit.kick || []).includes(s)) voice(ctx, mix, "kick", t, 1);
        if (!light && (kit.snare || []).includes(s)) voice(ctx, mix, "snare", t, 1);
        if (!light && (kit.clap || []).includes(s)) voice(ctx, mix, "clap", t, 0.9);
        if ((kit.hatC || []).includes(s)) voice(ctx, mix, "hatC", t, light ? 0.55 : 0.8);
        if (!light && (kit.hatO || []).includes(s)) voice(ctx, mix, "hatO", t, 0.55);
        if (!light && (kit.tom || []).includes(s)) voice(ctx, mix, "tom", t, 0.7);
      }

      if (L.lead && LEAD_STEPS.includes(s)) {
        const note = melody[(bar * LEAD_STEPS.length + LEAD_STEPS.indexOf(s)) % melody.length];
        leadNote(ctx, mix, note, t, stepDur * (energy > 7 ? 1.6 : 2.6), style);
      }

      if (style.arp && L.arp && s % 2 === 0) {
        const pool = [notes[0], notes[1], notes[2], notes[2] + 12];
        arpNote(ctx, mix, pool[(s / 2 + bar) % pool.length], t, style);
      }

      if (lastBar && s === 0) voice(ctx, mix, "hatO", t, 0.9);
    }

    // transition fill before a new section
    const next = SECTION_LAYERS[sectionAt(bar + 1, bars)];
    if (!lastBar && next && next.lead && !L.lead) {
      voice(ctx, mix, "tom", barStart + 14 * stepDur, 0.9);
      voice(ctx, mix, "tom", barStart + 15 * stepDur, 1);
    }
  }

  return bars * 16 * stepDur;
}

export const songLength = (song) => (song.bars || 8) * 16 * (60 / (song.bpm || 100) / 4);

function encodeWav(buffer) {
  const channels = buffer.numberOfChannels;
  const frames = buffer.length;
  const bytes = frames * channels * 2;
  const view = new DataView(new ArrayBuffer(44 + bytes));
  const str = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
  str(0, "RIFF"); view.setUint32(4, 36 + bytes, true); str(8, "WAVE");
  str(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, channels, true); view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true); view.setUint16(34, 16, true);
  str(36, "data"); view.setUint32(40, bytes, true);
  const data = [];
  for (let c = 0; c < channels; c++) data.push(buffer.getChannelData(c));
  let off = 44;
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < channels; c++) {
      const v = Math.max(-1, Math.min(1, data[c][i]));
      view.setInt16(off, v < 0 ? v * 0x8000 : v * 0x7fff, true);
      off += 2;
    }
  }
  return view.buffer;
}

export async function renderSongWav(song) {
  const sr = 44100;
  const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const ctx = new OfflineCtx(2, Math.ceil(sr * (songLength(song) + 2.5)), sr);
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);
  scheduleSong(ctx, master, song, 0);
  const buffer = await ctx.startRendering();
  return new Blob([encodeWav(buffer)], { type: "audio/wav" });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function emptyGrid() {
  const g = {};
  ROWS.forEach((r) => { g[r.key] = Array(16).fill(false); });
  return g;
}

export function gridFromPreset(preset) {
  const g = emptyGrid();
  ROWS.forEach((r) => {
    (preset.drums[r.key] || []).forEach((s) => { g[r.key][s] = true; });
  });
  return g;
}

export function drumsFromGrid(grid) {
  const drums = {};
  ROWS.forEach((r) => {
    drums[r.key] = grid[r.key].map((on, i) => (on ? i : -1)).filter((i) => i >= 0);
  });
  return drums;
}

export { CHORDS };