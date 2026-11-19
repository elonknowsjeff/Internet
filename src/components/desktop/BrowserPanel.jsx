import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, ArrowRight, RotateCw, Globe, Lock, Search, Home, ExternalLink, Loader2, Plus, X, ShieldAlert, Pin, PinOff, Palette, Terminal } from "lucide-react";
import BrowserSettings, { THEMES, ENGINES } from "@/components/browser/BrowserSettings";
import BrowserConsole from "@/components/browser/BrowserConsole";

const DEFAULT_QUICK = [
  { name: "Wikipedia", url: "https://en.wikipedia.org/wiki/Main_Page" },
  { name: "Bing", url: "https://www.bing.com/search?q=news" },
  { name: "BBC News", url: "https://www.bbc.com/news" },
  { name: "CBC News", url: "https://www.cbc.ca/news" },
  { name: "GitHub", url: "https://github.com/explore" },
  { name: "Weather", url: "https://wttr.in/Toronto" },
  { name: "DuckDuckGo", url: "https://html.duckduckgo.com/html/?q=news" },
];

const SOCIAL = [
  { name: "X", url: "https://x.com/home" },
  { name: "Instagram", url: "https://www.instagram.com/" },
  { name: "TikTok", url: "https://www.tiktok.com/" },
  { name: "Facebook", url: "https://www.facebook.com/" },
  { name: "Reddit", url: "https://www.reddit.com/" },
  { name: "YouTube", url: "https://www.youtube.com/" },
];

const PREFS_KEY = "si_browser_prefs";
const readPrefs = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(PREFS_KEY) || "");
    const prefs = {
      theme: raw?.theme || "midnight",
      engine: raw?.engine || "ddg-lite",
      tiles: raw?.tiles !== false,
      quick: Array.isArray(raw?.quick) && raw.quick.length ? raw.quick : DEFAULT_QUICK,
    };
    if (!ENGINES[prefs.engine]) prefs.engine = "ddg-lite";
    return prefs;
  } catch { return { theme: "midnight", engine: "ddg-lite", tiles: true, quick: DEFAULT_QUICK }; }
};

const PIN_KEY = "si_browser_pins";
const readPins = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(PIN_KEY));
    return Array.isArray(raw) ? raw.filter((p) => p && typeof p.url === "string") : [];
  } catch { return []; }
};

const hostOf = (u) => {
  try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; }
};

const tint = (url) => {
  let h = 0;
  for (const ch of hostOf(url)) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h} 70% 55%)`;
};

let seq = 1;
const makeTab = () => ({ id: `t${seq++}`, input: "", url: "", title: "New tab", html: "", loading: false, error: "", history: [], idx: -1 });

const looksLikeUrl = (v) => /^https?:\/\//i.test(v) || (/^[\w-]+(\.[\w-]+)+([/?#].*)?$/.test(v.trim()) && !/\s/.test(v.trim()));

function Favicon({ url, loading, size = 15 }) {
  if (loading) return <Loader2 className="animate-spin shrink-0" style={{ width: size, height: size }} />;
  if (!url) return <Globe className="shrink-0 text-neutral-400" style={{ width: size, height: size }} />;
  return (
    <span
      className="shrink-0 rounded-full flex items-center justify-center font-bold text-black"
      style={{ width: size, height: size, background: tint(url), fontSize: size * 0.6 }}
    >
      {hostOf(url).charAt(0).toUpperCase()}
    </span>
  );
}

export default function BrowserPanel() {
  const [tabs, setTabs] = useState(() => [makeTab()]);
  const [activeId, setActiveId] = useState(tabs[0].id);
  const [pins, setPins] = useState(readPins);
  const [prefs, setPrefs] = useState(readPrefs);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [homeQuery, setHomeQuery] = useState("");
  const [dragTab, setDragTab] = useState(null);
  const dragFromTab = useRef(null);
  const iframeRef = useRef(null);
  const MAX_TABS = 20;
  const theme = THEMES[prefs.theme] || THEMES.midnight;
  const light = theme.chrome === "#e9edf3";
  const barBg = light ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.07)";
  const hoverBg = light ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.07)";
  const borderCol = light ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.10)";
  const tabsRef = useRef(tabs);
  const activeRef = useRef(activeId);
  tabsRef.current = tabs;
  activeRef.current = activeId;

  useEffect(() => { localStorage.setItem(PIN_KEY, JSON.stringify(pins.slice(0, 8))); }, [pins]);
  useEffect(() => { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); }, [prefs]);

  const tab = tabs.find((t) => t.id === activeId) || tabs[0];
  const patch = (id, p) => setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...p } : t)));

  const navigate = async (raw, id = activeRef.current) => {
    const target = tabsRef.current.find((t) => t.id === id) || {};
    const value = String(raw ?? target.input ?? "").trim();
    if (!value) return;
    const engine = ENGINES[prefs.engine] || ENGINES["ddg-lite"];
    const payload = looksLikeUrl(value) ? { url: /^https?:\/\//i.test(value) ? value : `https://${value}` } : { url: engine.q(value) };

    patch(id, { loading: true, error: "" });
    try {
      const res = await base44.functions.invoke("webProxy", payload);
      const d = res.data || {};
      const shownUrl = d.url || payload.url || value;
      const hist = [...(target.history || [])].slice(0, (target.idx ?? -1) + 1);
      hist.push({ url: shownUrl, title: d.title || shownUrl, html: d.html || "" });
      const trimmed = hist.slice(-20);
      patch(id, {
        loading: false,
        url: shownUrl,
        title: d.title || shownUrl,
        html: d.html || "",
        input: shownUrl,
        error: d.error || "",
        history: trimmed,
        idx: trimmed.length - 1,
      });
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || "Could not reach that site.";
      patch(id, { loading: false, error: msg, input: value, title: "Not available" });
    }
  };

  useEffect(() => {
    const onMsg = (e) => {
      const d = e.data;
      if (!d) return;
      if (d.__walzaEvalResult === true) {
        setLogs((prev) => prev.map((l) => (l.id === d.id ? { ...l, done: true, ok: !!d.ok, value: String(d.value ?? "") } : l)));
        return;
      }
      if (d.__walzaBrowser !== true || typeof d.url !== "string") return;
      if (d.url.startsWith("http")) navigate(d.url);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const runCode = (code) => {
    if (code === "clear") {
      setLogs([]);
      try { iframeRef.current?.contentWindow?.postMessage({ __walzaEval: true, id: "clear", code: "location.reload()" }, "*"); } catch (e) {}
      return;
    }
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setLogs((prev) => [...prev.slice(-40), { id, code, done: false }]);
    try {
      iframeRef.current?.contentWindow?.postMessage({ __walzaEval: true, id, code }, "*");
    } catch (e) {
      setLogs((prev) => prev.map((l) => (l.id === id ? { ...l, done: true, ok: false, value: "No page is loaded." } : l)));
    }
  };

  const goHistory = (delta) => {
    const t = tabsRef.current.find((x) => x.id === activeRef.current);
    if (!t) return;
    const ni = (t.idx ?? -1) + delta;
    const entry = (t.history || [])[ni];
    if (!entry) return;
    patch(t.id, { idx: ni, url: entry.url, title: entry.title, html: entry.html, input: entry.url, error: entry.html ? "" : "This page could not be opened." });
  };

  const goHome = () => patch(activeId, { url: "", html: "", title: "New tab", input: "", error: "", history: [], idx: -1 });

  const newTab = () => {
    const t = makeTab();
    setTabs((prev) => [...prev, t].slice(-MAX_TABS));
    setActiveId(t.id);
  };

  const moveTab = (from, to) => {
    if (!from || !to || from === to) return;
    setTabs((prev) => {
      const moved = prev.find((t) => t.id === from);
      if (!moved) return prev;
      const next = prev.filter((t) => t.id !== from);
      const i = next.findIndex((t) => t.id === to);
      next.splice(i < 0 ? next.length : i, 0, moved);
      return next;
    });
  };

  const closeTab = (id) => {
    setTabs((prev) => {
      const rest = prev.filter((t) => t.id !== id);
      if (rest.length === 0) {
        const fresh = makeTab();
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeRef.current) setActiveId(rest[rest.length - 1].id);
      return rest;
    });
  };

  const pinnedNow = !!tab.url && pins.some((p) => p.url === tab.url);
  const togglePin = () => {
    if (!tab.url) return;
    if (pinnedNow) setPins((prev) => prev.filter((p) => p.url !== tab.url));
    else setPins((prev) => [...prev, { url: tab.url, title: tab.title || hostOf(tab.url) }].slice(0, 8));
  };

  const openPin = (pin) => {
    const existing = tabsRef.current.find((t) => t.url === pin.url);
    if (existing) { setActiveId(existing.id); return; }
    const empty = tabsRef.current.find((t) => !t.url && !t.loading);
    if (empty) { setActiveId(empty.id); navigate(pin.url, empty.id); return; }
    const t = makeTab();
    setTabs((prev) => [...prev, t].slice(-MAX_TABS));
    setActiveId(t.id);
    navigate(pin.url, t.id);
  };

  const canBack = (tab.idx ?? -1) > 0;
  const canForward = (tab.idx ?? -1) < (tab.history?.length ?? 0) - 1;
  const navBtn = "w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-30";

  return (
    <div className="h-full flex flex-col relative" style={{ backgroundColor: theme.chrome, color: theme.text }}>
      {/* Chrome-style tab strip */}
      <div className="flex items-end gap-1 pl-2 pr-2 pt-1.5 shrink-0 overflow-x-auto scrollbar-none">
        {pins.map((pin) => (
          <div key={pin.url} className="relative group shrink-0">
            <button
              onClick={() => openPin(pin)}
              title={pin.title}
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[12px] text-black transition ${tab.url === pin.url ? "ring-2 ring-white/70" : "opacity-85 hover:opacity-100"}`}
              style={{ background: tint(pin.url) }}
            >
              {hostOf(pin.url).charAt(0).toUpperCase()}
            </button>
            <button
              onClick={() => setPins((prev) => prev.filter((p) => p.url !== pin.url))}
              title="Unpin"
              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-neutral-700 text-white items-center justify-center hidden group-hover:flex"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
        {pins.length > 0 && <span className="w-px h-5 shrink-0 self-center" style={{ background: borderCol }} />}

        {tabs.map((t) => {
          const isActive = t.id === activeId;
          return (
            <div
              key={t.id}
              data-tab-id={t.id}
              onClick={() => setActiveId(t.id)}
              draggable
              onDragStart={() => { dragFromTab.current = t.id; setDragTab(t.id); }}
              onDragEnd={() => { dragFromTab.current = null; setDragTab(null); }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); moveTab(dragFromTab.current, t.id); dragFromTab.current = null; setDragTab(null); }}
              title={`${t.title || "New tab"} — drag to move`}
              className={`group relative flex items-center gap-2 pl-2.5 pr-1.5 h-[32px] min-w-[120px] max-w-[220px] shrink-0 cursor-pointer rounded-t-[9px] text-[11.5px] transition-colors ${dragTab === t.id ? "opacity-40" : ""} ${isActive ? "font-medium" : "opacity-80 hover:opacity-100"}`}
              style={isActive ? { backgroundColor: barBg } : undefined}
            >
              <Favicon url={t.url} loading={t.loading} />
              <span className="truncate flex-1">{t.title || "New tab"}</span>
              <button
                onClick={(e) => { e.stopPropagation(); closeTab(t.id); }}
                className={`w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/15 ${isActive ? "opacity-70 hover:opacity-100" : "opacity-0 group-hover:opacity-70"}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        <button onClick={newTab} title="New tab" className="mb-0.5 ml-0.5 w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 shrink-0"><Plus className="w-4 h-4" /></button>
      </div>

      {/* Chrome-style toolbar with omnibox */}
      <div
        className="flex items-center gap-0.5 px-2 h-11 shrink-0 border-b"
        style={{ backgroundColor: barBg, borderColor: borderCol }}
      >
        <button onClick={() => goHistory(-1)} disabled={!canBack} className={navBtn} style={{ color: theme.text }}><ArrowLeft className="w-[17px] h-[17px]" /></button>
        <button onClick={() => goHistory(1)} disabled={!canForward} className={navBtn} style={{ color: theme.text }}><ArrowRight className="w-[17px] h-[17px]" /></button>
        <button onClick={() => (tab.url ? navigate(tab.url) : goHome())} title="Reload" className={navBtn} style={{ color: theme.text }}><RotateCw className="w-[16px] h-[16px]" /></button>
        <button onClick={goHome} title="Home" className={`${navBtn} hidden sm:flex`} style={{ color: theme.text }}><Home className="w-[16px] h-[16px]" /></button>

        <div
          className="flex-1 min-w-0 flex items-center gap-2 h-[32px] mx-1.5 px-3 rounded-full border"
          style={{ backgroundColor: light ? "#ffffff" : "rgba(0,0,0,0.42)", borderColor: borderCol }}
        >
          {tab.url?.startsWith("https") ? <Lock className="w-3 h-3 text-emerald-400 shrink-0" /> : <Globe className="w-3 h-3 text-cyan-400 shrink-0" />}
          <input
            value={tab.input}
            onChange={(e) => patch(activeId, { input: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && navigate(e.currentTarget.value)}
            placeholder="Search the web or type a URL"
            className="flex-1 min-w-0 bg-transparent outline-none text-[12.5px]"
            style={{ color: theme.text }}
          />
          <button onClick={togglePin} disabled={!tab.url} title={pinnedNow ? "Unpin tab" : "Pin tab"} className="text-neutral-400 hover:text-amber-300 shrink-0 disabled:opacity-30">
            {pinnedNow ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
          </button>
          {tab.url && (
            <a href={tab.url} target="_blank" rel="noreferrer" title="Open in new tab" className="text-neutral-400 hover:text-white shrink-0">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <button
          onClick={() => setConsoleOpen((v) => !v)}
          title="JavaScript console"
          className={`${navBtn} ${consoleOpen ? "bg-cyan-400/25 text-cyan-300" : "hover:bg-white/10"}`}
        >
          <Terminal className="w-[16px] h-[16px]" />
        </button>
        <button onClick={() => setSettingsOpen((v) => !v)} title="Customize browser" className={`${navBtn} ${settingsOpen ? "bg-white/20" : "hover:bg-white/10"}`}>
          <Palette className="w-[16px] h-[16px]" />
        </button>
        <button onClick={() => navigate()} title="Go" className="w-8 h-8 rounded-full brand-grad text-black flex items-center justify-center shrink-0 ml-0.5">
          <Search className="w-3.5 h-3.5" />
        </button>
      </div>

      {settingsOpen && <BrowserSettings prefs={prefs} setPrefs={setPrefs} onClose={() => setSettingsOpen(false)} />}

      <div className="flex-1 min-h-0 relative bg-white">
        {!tab.url && !tab.loading ? (
          <div className="h-full overflow-y-auto flex flex-col items-center justify-center px-5 py-8" style={{ background: theme.start, color: theme.text }}>
            <div className="w-full max-w-xl">
              <h2 className="text-3xl font-black font-display text-center tracking-tight">
                <span className="bg-gradient-to-r from-fuchsia-300 via-amber-200 to-cyan-300 bg-clip-text text-transparent">Super Internet</span> Browser
              </h2>
              <form onSubmit={(e) => { e.preventDefault(); if (homeQuery.trim()) navigate(homeQuery.trim()); }} className="mt-4 flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full pl-4 pr-1.5 py-1.5 focus-within:border-white/45">
                <Search className="w-4 h-4 opacity-60 shrink-0" />
                <input autoFocus value={homeQuery} onChange={(e) => setHomeQuery(e.target.value)} placeholder={`Search ${ENGINES[prefs.engine]?.label || "the web"} or type a URL`} className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder-current placeholder-opacity-50" />
                <button type="submit" className="w-8 h-8 rounded-full brand-grad text-black flex items-center justify-center shrink-0"><ArrowRight className="w-4 h-4" /></button>
              </form>
              <div className="flex items-center justify-center gap-1.5 mt-2.5 flex-wrap">
                {Object.entries(ENGINES).map(([k, e]) => (
                  <button key={k} onClick={() => setPrefs({ ...prefs, engine: k })} className={`text-[10px] px-2.5 py-1 rounded-full border ${prefs.engine === k ? "border-white/60 bg-white/15 font-semibold" : "border-white/15 opacity-70 hover:opacity-100"}`}>{e.label}</button>
                ))}
              </div>

              <div className="mt-5">
                <p className="text-[9px] uppercase tracking-[0.22em] opacity-50 text-center mb-2">Social</p>
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  {SOCIAL.map((s) => (
                    <button key={s.name} onClick={() => navigate(s.url)} className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border border-white/20 bg-white/5 hover:bg-white/15">
                      <span className="w-2 h-2 rounded-full" style={{ background: tint(s.url) }} />
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {prefs.tiles && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-6">
                  {prefs.quick.map((q) => (
                    <button key={q.url} onClick={() => navigate(q.url)} className="rounded-xl bg-white/10 border border-white/15 hover:border-white/40 p-2 text-center">
                      <span className="mx-auto w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] text-black" style={{ background: tint(q.url) }}>{hostOf(q.url).charAt(0).toUpperCase()}</span>
                      <span className="block text-[10px] mt-1 truncate">{q.name}</span>
                    </button>
                  ))}
                  <button onClick={() => setSettingsOpen(true)} className="rounded-xl border border-dashed border-white/25 hover:border-white/50 p-2 text-center text-[10px] opacity-70">
                    <Plus className="w-4 h-4 mx-auto mb-0.5" /> Add
                  </button>
                </div>
              )}

              <p className="text-[10px] text-center opacity-50 mt-6">Pages run their own JavaScript here · Drag tabs to reorder · Open the console to run your own code</p>
            </div>
          </div>
        ) : null}

        {tab.loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0b0d13] z-10 text-neutral-300 text-xs">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--brand)" }} /> Opening {tab.input || "page"}…
          </div>
        )}

        {!tab.loading && tab.error && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0b0d13] p-6 text-center text-neutral-300">
            <ShieldAlert className="w-8 h-8 text-amber-400 mb-2" />
            <p className="text-sm font-semibold">{tab.error}</p>
            <p className="text-[10px] text-neutral-500 mt-1 max-w-xs truncate">{tab.url || tab.input}</p>
            <div className="flex gap-2 mt-3">
              {tab.url && <a href={tab.url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-full brand-grad text-black text-[11px] font-bold flex items-center gap-1">Open in new tab <ExternalLink className="w-3 h-3" /></a>}
              <button onClick={() => navigate(tab.url || tab.input)} className="px-3 py-1.5 rounded-full border border-white/15 text-[11px]">Try again</button>
              <button onClick={goHome} className="px-3 py-1.5 rounded-full border border-white/15 text-[11px]">Home</button>
            </div>
          </div>
        )}

        {tab.html && !tab.loading && (
          <iframe
            ref={iframeRef}
            key={`${tab.id}-${tab.idx}-${tab.url}`}
            srcDoc={tab.html}
            title="browser page"
            className="w-full h-full"
            sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      {consoleOpen && (
        <BrowserConsole
          logs={logs}
          onRun={runCode}
          onClose={() => setConsoleOpen(false)}
          enabled={!!tab.html && !tab.loading}
        />
      )}
    </div>
  );
}