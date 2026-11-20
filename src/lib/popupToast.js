import { playSound, soundOn } from "@/lib/chime";

// Tiny global toast/popup store. Any part of the app can call pushToast to show
// a transient popup notification in the corner, optionally with a sound.
let listeners = [];
let toasts = [];
let seq = 1;

function emit() {
  listeners.forEach((l) => l(toasts));
}

export function pushToast({ title, body = "", to, tone = "default", sound, duration = 5200 }) {
  const id = seq++;
  const t = { id, title, body, to, tone };
  toasts = [...toasts, t];
  emit();
  if (sound && soundOn(sound)) {
    try { playSound(sound); } catch { /* best effort */ }
  }
  if (duration > 0) setTimeout(() => dismissToast(id), duration);
  return id;
}

export function dismissToast(id) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function subscribe(listener) {
  listeners.push(listener);
  listener(toasts);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}