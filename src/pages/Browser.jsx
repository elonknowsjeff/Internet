import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, RotateCw, X, Plus, Lock, Search, Globe, Home, Star,
} from "lucide-react";

const QUICK_LINKS = [
  { name: "Google", url: "https://www.google.com", emoji: "🔎" },
  { name: "YouTube", url: "https://www.youtube.com", emoji: "▶️" },
  { name: "Wikipedia", url: "https://www.wikipedia.org", emoji: "📚" },
  { name: "GitHub", url: "https://github.com", emoji: "🐙" },
  { name: "Reddit", url: "https://www.reddit.com", emoji: "👽" },
  { name: "X", url: "https://x.com", emoji: "✖️" },
  { name: "Instagram", url: "https://instagram.com", emoji: "📸" },
  { name: "News", url: "https://news.ycombinator.com", emoji: "📰" },
];

const normalizeUrl = (raw) => {
  const v = (raw || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (/^[\w-]+(\.[\w-]+)+/.test(v)) return `https://${v}`;
  return `https://www.google.com/search?q=${encodeURIComponent(v)}`;
};
const hostOf = (url) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } };

let tabSeq = 1;

export default function Browser() {
  const [tabs, setTabs] = useState([{ id: 1, url: "", input: "", title: "New tab", history: [], at: -1, failed: false }]);
  const [activeId, setActiveId] = useState(1);
  const iframeRefs = useRef({});

  const active = tabs.find((t) => t.id === activeId) || tabs[0];

  useEffect(() => {
    if (!active) return;
    const id = active.id;
    // load url into iframe when navigating
    const el = iframeRefs.current[id];
    if (el && active.url && el.src !== active.url) el.src = active.url;
  }, [activeId, active?.url]);

  const updateTab = (id, patch) => setTabs((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const navigate = (raw, id = activeId) => {
    const url = normalizeUrl(raw);
    if (!url) return;
    setTabs((ts) => ts.map((t) => {
      if (t.id !== id) return t;
      const hist = [...t.history.slice(0, t.at + 1), url];
      return { ...t, url, input: url, history: hist, at: hist.length - 1, title: hostOf(url), failed: false };
    }));
  };

  const goBack = () => {
    if (!active || active.at <= 0) return;
    const at = active.at - 1;
    const url = active.history[at];
    updateTab(active.id, { at, url, input: url, title: hostOf(url) });
  };
  const goForward = () => {
    if (!active || active.at >= active.history.length - 1) return;
    const at = active.at + 1;
    const url = active.history[at];
    updateTab(active.id, { at, url, input: url, title: hostOf(url) });
  };
  const reload = () => {
    if (!active?.url) return;
    const el = iframeRefs.current[active.id];
    if (el) el.src = active.url;
  };

  const newTab = () => {
    const id = ++tabSeq;
    setTabs((ts) => [...ts, { id, url: "", input: "", title: "New tab", history: [], at: -1, failed: false }]);
    setActiveId(id);
  };
  const closeTab = (id) => {
    setTabs((ts) => {
      const next = ts.filter((t) => t.id !== id);
      if (!next.length) { tabSeq++; const fresh = { id: tabSeq, url: "", input: "", title: "New tab", history: [], at: -1, failed: false }; setActiveId(fresh.id); return [fresh]; }
      if (id === activeId) setActiveId(next[next.length - 1].id);
      return next;
    });
  };

  const onInputKey = (e) => { if (e.key === "Enter") navigate(e.target.value); };

  return (
    <div className="mx-auto w-full max-w-[1280px] px-2 sm:px-4 pb-28 pt-3">
      <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#0c0c0f] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
        {/* tab strip */}
        <div className="flex items-center gap-1 border-b border-white/10 bg-black/30 px-2 py-1.5">
          {tabs.map((t) => (
            <div key={t.id} className={`group flex max-w-[180px] items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] transition-colors ${t.id === activeId ? "bg-white/[0.1] text-white" : "text-white/55 hover:bg-white/[0.05]"}`} onClick={() => setActiveId(t.id)}>
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-sm bg-white/10 text-[9px]">{t.url ? hostOf(t.url)[0]?.toUpperCase() : "+"}</span>
              <span className="truncate">{t.title}</span>
              <button onClick={(e) => { e.stopPropagation(); closeTab(t.id); }} className="opacity-0 group-hover:opacity-100 hover:text-rose-400"><X className="w-3 h-3" /></button>
            </div>
          ))}
          <button onClick={newTab} className="ml-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg hover:bg-white/10"><Plus className="w-4 h-4 text-white/60" /></button>
        </div>

        {/* toolbar */}
        <div className="flex items-center gap-1.5 border-b border-white/10 px-2.5 py-2">
          <button onClick={goBack} disabled={active?.at <= 0} className="grid h-9 w-9 place-items-center rounded-full text-white/70 hover:bg-white/10 disabled:opacity-30"><ArrowLeft className="w-4.5 h-4.5" /></button>
          <button onClick={goForward} disabled={!active || active.at >= active.history.length - 1} className="grid h-9 w-9 place-items-center rounded-full text-white/70 hover:bg-white/10 disabled:opacity-30"><ArrowRight className="w-4.5 h-4.5" /></button>
          <button onClick={reload} disabled={!active?.url} className="grid h-9 w-9 place-items-center rounded-full text-white/70 hover:bg-white/10 disabled:opacity-30"><RotateCw className="w-4 h-4" /></button>
          <div className="flex flex-1 items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3 py-2 focus-within:border-white/30">
            {active?.url ? <Lock className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" /> : <Search className="w-3.5 h-3.5 text-white/40 shrink-0" />}
            <input
              value={active?.input ?? ""}
              onChange={(e) => updateTab(activeId, { input: e.target.value })}
              onKeyDown={onInputKey}
              placeholder="Search or type a URL"
              className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder-white/35"
            />
            {active?.url && <a href={active.url} target="_blank" rel="noreferrer" className="text-[11px] text-white/40 hover:text-white shrink-0">Open ↗</a>}
          </div>
          <button onClick={() => navigate("")} className="grid h-9 w-9 place-items-center rounded-full text-white/70 hover:bg-white/10" title="Home"><Home className="w-4 h-4" /></button>
        </div>

        {/* viewport */}
        <div className="relative h-[calc(100dvh-220px)] min-h-[420px] bg-white">
          {active && !active.url ? (
            <div className="grid h-full place-items-center bg-[#0c0c0f] p-6">
              <div className="w-full max-w-lg text-center">
                <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl" style={{ background: "var(--brand)" }}><Globe className="w-7 h-7 text-black" /></div>
                <h1 className="text-[22px] font-extrabold tracking-tight">Valo Browser</h1>
                <p className="mt-1 text-[13px] text-white/45">Open any website inside the app, or search the web.</p>
                <div className="mt-5 flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-3">
                  <Search className="w-4 h-4 text-white/40" />
                  <input
                    value={active.input}
                    onChange={(e) => updateTab(activeId, { input: e.target.value })}
                    onKeyDown={onInputKey}
                    placeholder="Search Google or type a URL"
                    className="min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder-white/35"
                    autoFocus
                  />
                </div>
                <div className="mt-6 grid grid-cols-4 gap-2.5">
                  {QUICK_LINKS.map((l) => (
                    <button key={l.name} onClick={() => navigate(l.url)} className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] p-3 hover:border-white/25 hover:bg-white/[0.07]">
                      <span className="text-2xl">{l.emoji}</span>
                      <span className="text-[11px] font-medium text-white/70">{l.name}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-6 text-[10.5px] text-white/30">Some sites block embedding for security. Use “Open ↗” to open them in a new tab.</p>
              </div>
            </div>
          ) : (
            <>
              <iframe
                key={active?.id}
                ref={(el) => { if (active) iframeRefs.current[active.id] = el; }}
                title="browser"
                className="h-full w-full bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                referrerPolicy="no-referrer"
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#0c0c0f]/95 opacity-0 transition-opacity" style={{ opacity: 0 }}>
                <div className="text-center text-white/50 text-sm">Loading…</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}