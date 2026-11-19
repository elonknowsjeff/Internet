export const STORE_KEY = "walza_mail_v2";
const day = 86400000;

// Mail is only ever stored once something actually arrives or is sent —
// a brand new inbox starts completely empty.
export const readMail = () => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveMail = (list) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch {}
};

export const fmtWhen = (ts) => {
  const d = new Date(ts);
  const diff = Date.now() - ts;
  if (diff < day) return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (diff < 6 * day) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

export const initials = (name = "") => name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";