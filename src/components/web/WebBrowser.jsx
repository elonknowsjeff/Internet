import React, { useState, useRef, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, ArrowRight, RotateCw, Home, Search, Plus, X, Globe, Loader2, Star, Compass } from "lucide-react";

const QUICK = [
  { name: "Wikipedia", url: "https://en.wikipedia.org", tint: "from-neutral-500 to-neutral-700" },
  { name: "DuckDuckGo", url: "https://duckduckgo.com", tint: "from-orange-500 to-red-600" },
  { name: "Hacker News", url: "https://news.ycombinator.com", tint: "from-orange-400 to-amber-600" },
  { name: "Reddit", url: "https://old.reddit.com", tint: "from-orange-500 to-rose-600" },
  { name: "BBC News", url: "https://www.bbc.com/news", tint: "from-red-500 to-rose-700" },
  { name: "GitHub", url: "https://github.com", tint: "from-neutral-600 to-neutral-800" },
  { name: "MDN", url: "https://developer.mozilla.org", tint: "from-blue-500 to-indigo-700" },
  { name: "Lobsters", url: "https://lobste.rs", tint: "from-rose-500 to-red-700" },
];

let seq = 1;
const blank = () => ({ id: seq++, url: "", title: "New tab", html: null, loading: false, error: null, history: [], idx: -1 });

const looksUrl = (q) => /^https?:\/\//i.test(q) || (/^[\w-]+(\.[\w-]+)+(\/.*)?$/i.test(q) && !/\s/.test(q));

export default function WebBrowser() {
  const [tabs, setTabs] = useState([blank()]);
  const [active, setActive] = useState(0);
  const [addr, setAddr] = useState("");
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vazolex_web_bm") || "[]"); } catch { return []; }
  });

  const activeRef = useRef(active); activeRef.current = active;
  const tabsRef = useRef(tabs); tabsRef.current = tabs;
  const tab = tabs[active];

  useEffect(() => { if (bookmarks.length) localStorage.setItem("vazolex_web_bm", JSON.stringify(bookmarks)); }, [bookmarks]);

  const patch = (id, p) => setTabs((ts) => ts.map((t) => (t.id === id ? { ...t, ...p } : t)));

  const load = useCallback(async (id, body) => {
    patch(id, { loading: true, error: null });
    try {
      const res = await base44.functions.invoke("webProxy", body);
      if (res?.error) { patch(id, { loading: false, error: res.error, url: res.url || body.url || "", html: null }); return; }
      patch(id, { loading: false, html: res.html, title: res.title || body.url || "Web", url: res.url || body.url || "" });
    } catch (e) {
      patch(id, { loading: false, error: "Couldn't load that page. Try again." });
    }
  }, []);

  const navigate = useCallback(async (raw) => {
    const q = (raw || "").trim();
    if (!q) return;
    const id = tabsRef.current[activeRef.current]?.id;
    if (id == null) return;
    const body = looksUrl(q) ? { url: q } : { query: q };
    setTabs((ts) => ts.map((t) => {
      if (t.id !== id) return t;
      const hist = t.history.slice(0, t.idx + 1);
      hist.push(body);
      return { ...t, history: hist, idx: hist.length - 1, title: "Loading…", url: body.url || "" };
    }));
    setAddr(q);
    await load(id, body);
  }, [load]);

  const goTo = useCallback(async (id, idx) => {
    const body = tabsRef.current.find((t) => t.id === id)?.history[idx];
    if (!body) return;
    setTabs((ts) => ts.map((t) => (t.id === id ? { ...t, idx, title: "Loading…" } : t)));
    setAddr(body.url || "");
    await load(id, body);
  }, [load]);

  const reload = useCallback(() => {
    const t = tab; if (!t || t.idx < 0) return;
    load(t.id, t.history[t.idx]);
  }, [tab, load]);

  const home = useCallback(() => {
    const id = tab.id;
    patch(id, { url: "", title: "New tab", html: null, error: null });
    setAddr("");
  }, [tab]);

  const newTab = () => { const n = blank(); setTabs((ts) => [...ts, n]); setActive(tabs.length); setAddr(""); };

  const closeTab = (i) => {
    if (tabs.length === 1) { const n = blank(); setTabs([n]); setActive(0); setAddr(""); return; }
    const next = tabs.filter((_, j) => j !== i);
    setTabs(next);
    setActive((a) => (i <= a ? Math.max(0, a - 1) : a));
  };

  useEffect(() => { setAddr(tab?.url || ""); }, [active, tab?.url]);

  useEffect(() => {
    const onMsg = (e) => {
      const d = e.data;
      if (d?.__walzaBrowser && d.url) navigate(d.url);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [navigate]);

  const submit = (e) => { e.preventDefault(); navigate(addr); };
  const canBack = tab && tab.idx > 0;
  const canFwd = tab && tab.idx < tab.history.length - 1;
  const bookmarked = tab?.url && bookmarks.some((b) => b.url === tab.url);

  return (
    <div className="flex flex-col h-full bg-[#0b0b0d]">
      {/* tab strip */}
      <div className="flex items-center gap-1 px-2 pt-2 bg-[#131316] border-b border-white/[0.06]">
        {tabs.map((t, i) => (
          <button key={t.id} onClick={() => setActive(i)} className={`group flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-t-lg max-w-[180px] ${i === active ? "bg-[#0b0b0d] text-white" : "bg-white/[0.04] text-white/55 hover:bg-white/[0.08]"}`}>
            {t.loading ? <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin text-white/50" /> : <Globe className="w-3.5 h-3.5 shrink-0 opacity-60" />}
            <span className="text-[12px] truncate flex-1">{t.title || "New tab"}</span>
            <span onClick={(e) => { e.stopPropagation(); closeTab(i); }} className="w-5 h-5 rounded grid place-items-center hover:bg-white/15"><X className="w-3 h-3" /></span>
          </button>
        ))}
        <button onClick={newTab} className="w-7 h-7 rounded grid place-items-center text-white/55 hover:bg-white/10"><Plus className="w-4 h-4" /></button>
      </div>

      {/* toolbar */}
      <div className="flex items-center gap-1.5 px-2.5 py-2 bg-[#0b0b0d] border-b border-white/[0.06]">
        <button onClick={() => canBack && goTo(tab.id, tab.idx - 1)} disabled={!canBack} className="w-8 h-8 rounded-lg grid place-items-center text-white/70 hover:bg-white/10 disabled:opacity-30"><ArrowLeft className="w-4 h-4" /></button>
        <button onClick={() => canFwd && goTo(tab.id, tab.idx + 1)} disabled={!canFwd} className="w-8 h-8 rounded-lg grid place-items-center text-white/70 hover:bg-white/10 disabled:opacity-30"><ArrowRight className="w-4 h-4" /></button>
        <button onClick={reload} className="w-8 h-8 rounded-lg grid place-items-center text-white/70 hover:bg-white/10"><RotateCw className={`w-4 h-4 ${tab?.loading ? "animate-spin" : ""}`} /></button>
        <button onClick={home} className="w-8 h-8 rounded-lg grid place-items-center text-white/70 hover:bg-white/10"><Home className="w-4 h-4" /></button>
        <form onSubmit={submit} className="flex-1 flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-full px-3.5 py-1.5 focus-within:border-[color:var(--brand)]/60">
          <Compass className="w-3.5 h-3.5 text-white/40 shrink-0" />
          <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Search the web or enter a web address" className="flex-1 min-w-0 bg-transparent outline-none text-[13px] placeholder-white/35" />
          <button type="submit" className="w-7 h-7 rounded-full brand-grad grid place-items-center text-black"><Search className="w-3.5 h-3.5" /></button>
        </form>
        {tab?.url && (
          <button onClick={() => setBookmarks((b) => bookmarked ? b.filter((x) => x.url !== tab.url) : [...b, { url: tab.url, title: tab.title }])} className="w-8 h-8 rounded-lg grid place-items-center hover:bg-white/10">
            <Star className={`w-4 h-4 ${bookmarked ? "fill-yellow-400 text-yellow-400" : "text-white/70"}`} />
          </button>
        )}
      </div>

      {/* content */}
      <div className="flex-1 min-h-0 relative bg-white">
        {!tab || !tab.url ? (
          <div className="h-full overflow-y-auto bg-[#0b0b0d] text-white">
            <div className="max-w-2xl mx-auto px-5 py-10">
              <h1 className="text-2xl font-bold font-display mb-1">Vazolex Web</h1>
              <p className="text-white/45 text-sm mb-6">A clean, private reader browser. Search the web or open a site below.</p>
              <form onSubmit={submit} className="flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-full px-4 py-3 mb-6">
                <Search className="w-4 h-4 text-white/40" />
                <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Search DuckDuckGo or type a URL" className="flex-1 bg-transparent outline-none text-sm placeholder-white/35" autoFocus />
                <button className="px-4 py-1.5 rounded-full brand-grad text-black text-sm font-semibold">Go</button>
              </form>
              {bookmarks.length > 0 && (
                <div className="mb-6">
                  <p className="text-[11px] uppercase tracking-wide text-white/35 mb-2">Bookmarks</p>
                  <div className="flex flex-wrap gap-2">
                    {bookmarks.map((b) => (
                      <button key={b.url} onClick={() => navigate(b.url)} className="px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-[12px] hover:bg-white/[0.12] truncate max-w-[240px]">{b.title}</button>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-[11px] uppercase tracking-wide text-white/35 mb-3">Quick links</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {QUICK.map((q) => (
                  <button key={q.url} onClick={() => navigate(q.url)} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.07] transition-colors text-left">
                    <span className={`block w-9 h-9 rounded-xl bg-gradient-to-br ${q.tint} mb-2`} />
                    <p className="text-[13px] font-medium">{q.name}</p>
                    <p className="text-[10px] text-white/40 truncate">{q.url.replace(/^https?:\/\//, "")}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : tab.error ? (
          <div className="h-full grid place-items-center bg-[#0b0b0d] text-white p-6">
            <div className="text-center max-w-sm">
              <p className="text-4xl mb-3">🔌</p>
              <p className="font-semibold mb-1">Can't open that page</p>
              <p className="text-white/50 text-sm mb-4">{tab.error}</p>
              <div className="flex justify-center gap-2">
                <button onClick={reload} className="px-4 py-2 rounded-full bg-white/10 text-sm">Try again</button>
                <a href={tab.url} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-full brand-grad text-black text-sm font-semibold">Open in new tab</a>
              </div>
            </div>
          </div>
        ) : tab.loading && !tab.html ? (
          <div className="h-full grid place-items-center bg-[#0b0b0d] text-white"><Loader2 className="w-6 h-6 animate-spin text-white/50" /></div>
        ) : (
          <iframe key={tab.id} title="Vazolex Web" srcDoc={tab.html} sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox" className="w-full h-full bg-white" />
        )}
      </div>
    </div>
  );
}