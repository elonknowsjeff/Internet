import React, { useState } from "react";
import { X, Plus, Trash2, Palette, Search, Grid3x3 } from "lucide-react";

export const THEMES = {
  midnight: { label: "Midnight", chrome: "#0b0d13", start: "linear-gradient(160deg,#0b0d13,#171a2b)", text: "#f5f5f5" },
  graphite: { label: "Graphite", chrome: "#1b1d21", start: "linear-gradient(160deg,#1b1d21,#33373d)", text: "#f5f5f5" },
  ocean: { label: "Ocean", chrome: "#07202b", start: "linear-gradient(160deg,#07202b,#0b4256)", text: "#eaf7ff" },
  forest: { label: "Forest", chrome: "#0d2018", start: "linear-gradient(160deg,#0d2018,#1d4433)", text: "#effff6" },
  plum: { label: "Plum", chrome: "#1c0f2b", start: "linear-gradient(160deg,#1c0f2b,#3b1c52)", text: "#fbf2ff" },
  light: { label: "Daylight", chrome: "#e9edf3", start: "linear-gradient(160deg,#e9edf3,#ffffff)", text: "#111827" },
};

export const ENGINES = {
  "ddg-lite": { label: "DuckDuckGo Lite", q: (s) => `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(s)}` },
  "ddg-html": { label: "DuckDuckGo HTML", q: (s) => `https://html.duckduckgo.com/html/?q=${encodeURIComponent(s)}` },
  wikipedia: { label: "Wikipedia", q: (s) => `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(s)}` },
  bing: { label: "Bing", q: (s) => `https://www.bing.com/search?q=${encodeURIComponent(s)}` },
  google: { label: "Google", q: (s) => `https://www.google.com/search?q=${encodeURIComponent(s)}` },
};

export default function BrowserSettings({ prefs, setPrefs, onClose }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const addLink = () => {
    if (!name.trim() || !url.trim()) return;
    const target = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    setPrefs({ ...prefs, quick: [...prefs.quick, { name: name.trim(), url: target }].slice(0, 12) });
    setName(""); setUrl("");
  };

  return (
    <div className="absolute right-2 top-12 z-30 w-72 rounded-2xl bg-[#12141c] border border-white/15 shadow-2xl p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold flex items-center gap-2"><Palette className="w-4 h-4 text-cyan-400" /> Browser look</p>
        <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="w-3.5 h-3.5" /></button>
      </div>

      <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5">Theme</p>
      <div className="grid grid-cols-3 gap-1.5 mb-4">
        {Object.entries(THEMES).map(([key, t]) => (
          <button key={key} onClick={() => setPrefs({ ...prefs, theme: key })} className={`rounded-lg border p-1.5 text-[10px] ${prefs.theme === key ? "border-cyan-400 text-white" : "border-white/10 text-neutral-400"}`}>
            <span className="block h-6 rounded mb-1" style={{ background: t.start }} />
            {t.label}
          </button>
        ))}
      </div>

      <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5 flex items-center gap-1"><Search className="w-3 h-3" /> Search engine</p>
      <select value={prefs.engine} onChange={(e) => setPrefs({ ...prefs, engine: e.target.value })} className="w-full mb-4 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs outline-none">
        {Object.entries(ENGINES).map(([k, e]) => <option key={k} value={k} className="bg-neutral-900">{e.label}</option>)}
      </select>

      <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5 flex items-center gap-1"><Grid3x3 className="w-3 h-3" /> Start page shortcuts</p>
      <label className="flex items-center justify-between text-xs mb-2">
        <span>Show shortcuts</span>
        <input type="checkbox" checked={prefs.tiles} onChange={(e) => setPrefs({ ...prefs, tiles: e.target.checked })} className="accent-cyan-400 w-4 h-4" />
      </label>
      <div className="space-y-1 mb-2 max-h-32 overflow-y-auto">
        {prefs.quick.map((q) => (
          <div key={q.url} className="flex items-center gap-1.5 text-[11px] bg-white/5 rounded px-2 py-1">
            <span className="truncate flex-1">{q.name}</span>
            <button onClick={() => setPrefs({ ...prefs, quick: prefs.quick.filter((x) => x.url !== q.url) })} className="text-neutral-500 hover:text-rose-400"><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}
      </div>
      <div className="flex gap-1">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] outline-none" />
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="site.com" className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] outline-none" />
        <button onClick={addLink} className="w-6 rounded bg-cyan-400 text-black flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}