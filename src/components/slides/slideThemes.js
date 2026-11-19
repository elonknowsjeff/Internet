export const THEMES = {
  violet: { label: "Violet", grad: "from-[#241b52] via-[#3b1d72] to-[#6d28d9]", accent: "bg-violet-300", text: "text-white", sub: "text-white/75", ph: "placeholder-white/35" },
  ocean: { label: "Ocean", grad: "from-[#07253b] via-[#0b3f5c] to-[#0ea5e9]", accent: "bg-sky-300", text: "text-white", sub: "text-white/75", ph: "placeholder-white/35" },
  forest: { label: "Forest", grad: "from-[#04241d] via-[#0a4534] to-[#10b981]", accent: "bg-emerald-300", text: "text-white", sub: "text-white/75", ph: "placeholder-white/35" },
  ember: { label: "Ember", grad: "from-[#2b0a0a] via-[#7c2d12] to-[#f59e0b]", accent: "bg-amber-300", text: "text-white", sub: "text-white/80", ph: "placeholder-white/35" },
  graphite: { label: "Graphite", grad: "from-[#0d0f12] via-[#1b1f26] to-[#3b424d]", accent: "bg-slate-300", text: "text-white", sub: "text-white/70", ph: "placeholder-white/30" },
  paper: { label: "Paper", grad: "from-[#f8fafc] via-[#eef2ff] to-[#dbe4ff]", accent: "bg-indigo-500", text: "text-slate-900", sub: "text-slate-600", ph: "placeholder-slate-400" },
};

// decks saved before the redesign still carry the old theme keys
THEMES.cyan = { ...THEMES.ocean, label: "Ocean" };
THEMES.emerald = { ...THEMES.forest, label: "Forest" };
THEMES.amber = { ...THEMES.ember, label: "Ember" };
THEMES.rose = { ...THEMES.ember, label: "Ember" };

export const themeOf = (key) => THEMES[key] || THEMES.violet;

export const blankSlide = () => ({ title: "", body: "", color: "violet" });

export const bullets = (body = "") =>
  body.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => l.replace(/^([-•*])\s*/, ""));