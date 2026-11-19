let ctx = null;

const SETTINGS_KEY = "zync_settings";
const DEFAULTS = { notification: true, reminder: true, startup: true };

export const SOUND_KINDS = [
  { key: "notification", label: "Notification sound", desc: "Plays when a new message or alert arrives." },
  { key: "reminder", label: "Reminder sound", desc: "Plays when a reminder you set comes due." },
  { key: "startup", label: "Startup sound", desc: "Plays once when you open the app." },
];

export function soundOn(kind) {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}").sounds || {};
    return saved[kind] ?? DEFAULTS[kind];
  } catch {
    return DEFAULTS[kind];
  }
}

function audio() {
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    ctx = ctx || new Ctor();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(c, freq, at, dur, gain = 0.16, type = "sine") {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(g).connect(c.destination);
  osc.start(at);
  osc.stop(at + dur + 0.03);
}

// Two-tone reminder chime, generated in the browser (no audio file needed).
export function playChime() {
  try {
    const c = audio();
    if (!c) return;
    const t = c.currentTime;
    tone(c, 880, t, 0.5, 0.2);
    tone(c, 1174.66, t + 0.17, 0.5, 0.2);
  } catch {
    // audio not available in this browser context
  }
}

export function playNotification() {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  tone(c, 1046.5, t, 0.16, 0.16);
  tone(c, 1318.5, t + 0.11, 0.3, 0.14);
}

export function playMessage() {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  tone(c, 880, t, 0.1, 0.12, "triangle");
  tone(c, 1244.5, t + 0.08, 0.18, 0.1, "triangle");
}

export function playReminder() {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  [659.25, 830.61, 1046.5].forEach((f, i) => tone(c, f, t + i * 0.18, 0.42, 0.17, "triangle"));
  [659.25, 830.61, 1046.5].forEach((f, i) => tone(c, f, t + 0.9 + i * 0.18, 0.42, 0.14, "triangle"));
}

export function playStartup() {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;

  // rising sweep
  const sweep = c.createOscillator();
  const sweepGain = c.createGain();
  sweep.type = "triangle";
  sweep.frequency.setValueAtTime(196, t);
  sweep.frequency.exponentialRampToValueAtTime(784, t + 0.55);
  sweepGain.gain.setValueAtTime(0.0001, t);
  sweepGain.gain.exponentialRampToValueAtTime(0.1, t + 0.1);
  sweepGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
  sweep.connect(sweepGain).connect(c.destination);
  sweep.start(t);
  sweep.stop(t + 0.9);

  // warm chord landing
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, f, t + 0.5 + i * 0.08, 1.1, 0.07));
}

// Apple-style marimba ring, generated in the browser. Used while a call is ringing.
export function playRingtoneBurst() {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  [1318.51, 1174.66, 987.77, 783.99].forEach((f, i) => tone(c, f, t + i * 0.2, 0.6, 0.13, "triangle"));
  [1046.5, 987.77, 783.99].forEach((f, i) => tone(c, f, t + 0.95 + i * 0.2, 0.7, 0.1, "triangle"));
}

// Repeats the ring every few seconds; returns a stop function.
export function startRingtone() {
  if (!soundOn("notification")) return () => {};
  playRingtoneBurst();
  const id = setInterval(playRingtoneBurst, 2600);
  return () => clearInterval(id);
}

export function playSound(kind) {
  try {
    if (kind === "startup") return playStartup();
    if (kind === "reminder") return playReminder();
    if (kind === "message") return playMessage();
    return playNotification();
  } catch {
    // ignore — audio is best effort
  }
}