import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, Search, Loader2, X, Sparkles, TrendingUp, Hash, Newspaper } from "lucide-react";
import BingResults from "@/components/news/BingResults";
import NewsReader from "@/components/news/NewsReader";
import TopicRail from "@/components/news/TopicRail";
import { TOPICS, storyKey } from "@/lib/newsTopics";

const today = () => new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);

const buildPrompt = (category, query, count, variant) => {
  const focus = category === "Top"
    ? "the biggest headlines right now across world, technology, AI, business, science, sports, entertainment, health and politics"
    : `${category.toLowerCase()} news`;
  const extra = query ? ` Focus specifically on: ${query}.` : "";
  return `Return ${count} real, current news articles about ${focus} for today, ${today()}. Include a broad mix of publishers.${extra} ${variant ? `This is round ${variant} of the page, so pick different, less obvious stories than a front page would lead with.` : ""}

For each article return: a specific headline, a 1-2 sentence summary, the source/publisher name, the single best-fitting category (one of: world, tech, ai, business, science, sports, entertainment, health, politics), and the real article url. Use live web context so every story is genuinely current. Never repeat a headline.`;
};

const SCHEMA = {
  type: "object",
  properties: {
    articles: {
      type: "array",
      items: {
        type: "object",
        properties: {
          headline: { type: "string" },
          summary: { type: "string" },
          source: { type: "string" },
          category: { type: "string" },
          url: { type: "string" },
        },
      },
    },
  },
};

export default function News() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [cat, setCat] = useState("Top");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [reader, setReader] = useState(null);
  const [round, setRound] = useState(0);
  const [me, setMe] = useState(null);
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [openKey, setOpenKey] = useState(null);

  useEffect(() => { base44.auth.me().then(setMe).catch(() => {}); }, []);

  const load = async (category, term, append = false) => {
    if (append) setMoreLoading(true); else setLoading(true);
    try {
      const nextRound = append ? round + 1 : 0;
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: buildPrompt(category, term, append ? 8 : 20, append ? nextRound : 0),
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: SCHEMA,
      });
      const fresh = res?.articles || [];
      if (append) {
        setItems((prev) => {
          const seen = new Set(prev.map((a) => (a.headline || "").toLowerCase()));
          return [...prev, ...fresh.filter((a) => !seen.has((a.headline || "").toLowerCase()))];
        });
        setRound(nextRound);
      } else {
        setItems(fresh);
        setRound(0);
        setOpenKey(null);
      }
    } catch (e) {
      if (!append) setItems([]);
    } finally {
      setLoading(false);
      setMoreLoading(false);
    }
  };

  useEffect(() => { load("Top", ""); }, []);

  useEffect(() => {
    const keys = items.map(storyKey);
    if (!keys.length) { setLikes({}); setComments({}); return; }
    let alive = true;
    Promise.all([
      base44.entities.NewsLike.filter({ story_key: { $in: keys } }, { limit: 500 }).catch(() => []),
      base44.entities.NewsComment.filter({ story_key: { $in: keys } }, { sort: "-created_date", limit: 500 }).catch(() => []),
    ]).then(([likeRows, commentRows]) => {
      if (!alive) return;
      const nextLikes = {};
      asItems(likeRows).forEach((l) => {
        const entry = nextLikes[l.story_key] || { count: 0, id: null };
        entry.count += 1;
        if (me && l.created_by_id === me.id) entry.id = l.id;
        nextLikes[l.story_key] = entry;
      });
      const nextComments = {};
      asItems(commentRows).forEach((c) => {
        nextComments[c.story_key] = [...(nextComments[c.story_key] || []), c];
      });
      setLikes(nextLikes);
      setComments(nextComments);
    });
    return () => { alive = false; };
  }, [items, me]);

  const pick = (c) => {
    setCat(c);
    setQ("");
    setQuery("");
    setItems([]);
    load(c, "");
  };

  const submit = (e) => {
    e.preventDefault();
    setQuery(q.trim());
    setItems([]);
    load(cat, q.trim());
  };

  const toggleLike = async (item) => {
    const key = storyKey(item);
    if (!me) return;
    const current = likes[key] || { count: 0, id: null };
    if (current.id) {
      setLikes((prev) => ({ ...prev, [key]: { id: null, count: Math.max(0, current.count - 1) } }));
      await base44.entities.NewsLike.delete(current.id).catch(() => {});
    } else {
      setLikes((prev) => ({ ...prev, [key]: { id: "pending", count: current.count + 1 } }));
      const rec = await base44.entities.NewsLike.create({ story_key: key, story_title: item.headline, category: item.category || "" });
      setLikes((prev) => ({ ...prev, [key]: { id: rec.id, count: current.count + 1 } }));
    }
  };

  const addComment = async (item, text) => {
    const key = storyKey(item);
    const rec = await base44.entities.NewsComment.create({
      story_key: key,
      story_title: item.headline,
      category: item.category || "",
      text,
      author_name: me?.display_name || me?.full_name || "Member",
      author_handle: me?.username || (me?.email || "").split("@")[0] || "user",
      author_avatar: me?.avatar || "",
    });
    setComments((prev) => ({ ...prev, [key]: [rec, ...(prev[key] || [])] }));
  };

  // Right rail: trending headlines + top sources, derived from the current feed.
  const trending = items.slice(0, 6);
  const sourceMap = {};
  items.forEach((a) => { if (a.source) sourceMap[a.source] = (sourceMap[a.source] || 0) + 1; });
  const topSources = Object.entries(sourceMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const SearchForm = ({ big }) => (
    <form onSubmit={submit} className={`flex items-center gap-2.5 rounded-full border border-white/[0.13] bg-white/[0.06] px-4 transition-colors focus-within:border-white/30 focus-within:bg-white/[0.09] ${big ? "h-12" : "h-10"}`}>
      <Search className="h-4 w-4 shrink-0 text-white/45" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={`Search ${cat === "Top" ? "the web for news" : cat.toLowerCase() + " news"}…`}
        className="min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder-white/35"
      />
      {q && (
        <button type="button" onClick={() => setQ("")} aria-label="Clear">
          <X className="h-4 w-4 text-white/40" />
        </button>
      )}
      <button type="submit" className="shrink-0 rounded-full brand-grad px-3 py-1.5 text-[11px] font-bold text-black">Search</button>
    </form>
  );

  return (
    <div className="mx-auto w-full max-w-[1100px] px-3 sm:px-4 pb-28">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_320px]">

        {/* ---------- left sidebar: search + topics (X style) ---------- */}
        <aside className="hidden lg:block">
          <div className="sticky top-3 space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="grid h-8 w-8 place-items-center rounded-xl brand-grad text-black"><Newspaper className="h-4 w-4" /></span>
              <h1 className="text-[20px] font-extrabold tracking-[-0.02em]">News</h1>
            </div>
            <SearchForm />

            <nav className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
              {TOPICS.map((t) => {
                const Icon = t.icon;
                const on = cat === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => pick(t.key)}
                    className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors ${on ? "bg-white/[0.08]" : "hover:bg-white/[0.05]"}`}
                  >
                    <span
                      className="grid h-8 w-8 place-items-center rounded-xl"
                      style={{ background: `${t.color}22`, boxShadow: `inset 0 0 0 1px ${t.color}40` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: t.color }} />
                    </span>
                    <span className={`text-[13px] font-semibold ${on ? "text-white" : "text-white/65"}`}>{t.key}</span>
                    {on && <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: t.color }} />}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* ---------- center: the commentable feed ---------- */}
        <div className="min-w-0">
          <header className="sticky top-0 z-30 mb-2 border-b border-white/[0.08] bg-[#06060a]/85 backdrop-blur-2xl">
            <div className="flex items-center gap-2 px-4 pt-3 pb-2">
              <span className="grid h-7 w-7 place-items-center rounded-[9px] brand-grad text-[13px] font-black text-black lg:hidden">N</span>
              <h1 className="text-[16px] font-bold tracking-[-0.01em] lg:hidden">News</h1>
              <span className="hidden text-[15px] font-bold tracking-[-0.01em] lg:block">
                {query ? `“${query}”` : cat === "Top" ? "Top stories" : cat}
              </span>
              <span className="hidden rounded-full border border-white/[0.12] bg-white/[0.05] px-2 py-0.5 text-[10px] font-semibold text-white/50 sm:block">Live · {today()}</span>
              <button
                onClick={() => load(cat, query)}
                disabled={loading}
                className="ml-auto grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.07] hover:border-[color:var(--brand)] disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* mobile search + topics */}
            <div className="px-3 pb-2 lg:hidden">
              <SearchForm />
            </div>
            <div className="lg:hidden">
              <TopicRail active={cat} onPick={pick} />
            </div>
          </header>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-white/45 text-sm">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Curating today's stories…
            </div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center text-white/45 text-sm">Couldn't load news right now. Try refresh.</div>
          ) : (
            <>
              <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                <BingResults
                  items={items}
                  likes={likes}
                  comments={comments}
                  openKey={openKey}
                  onLike={toggleLike}
                  onToggleComments={(key) => setOpenKey(openKey === key ? null : key)}
                  onOpen={setReader}
                  me={me}
                  onSend={addComment}
                />
              </div>

              <button
                onClick={() => load(cat, query, true)}
                disabled={moreLoading}
                className="mt-4 w-full py-3 rounded-full border border-white/12 bg-white/[0.05] hover:bg-white/[0.09] text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {moreLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Finding more stories…</> : <><Sparkles className="h-4 w-4" style={{ color: "var(--brand)" }} /> More stories</>}
              </button>
            </>
          )}
        </div>

        {/* ---------- right sidebar: What's happening ---------- */}
        <aside className="hidden xl:block">
          <div className="sticky top-3 space-y-3">
            <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
              <h3 className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-3 text-[15px] font-extrabold">
                <TrendingUp className="h-4 w-4" style={{ color: "var(--brand)" }} /> What's happening
              </h3>
              {trending.length === 0 ? (
                <p className="px-4 py-3 text-[12px] text-white/40">Loading trends…</p>
              ) : (
                <ul>
                  {trending.map((a, i) => (
                    <li key={i}>
                      <button onClick={() => setReader(a)} className="block w-full px-4 py-2.5 text-left hover:bg-white/[0.05]">
                        <p className="text-[10px] uppercase tracking-wide text-white/40">News · {a.category || "top"}</p>
                        <p className="mt-0.5 line-clamp-2 text-[13px] font-semibold leading-snug">{a.headline}</p>
                        <p className="mt-0.5 text-[11px] text-white/40">{a.source}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {topSources.length > 0 && (
              <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
                <h3 className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-3 text-[15px] font-extrabold">
                  <Hash className="h-4 w-4" style={{ color: "var(--brand)" }} /> Top sources
                </h3>
                <ul>
                  {topSources.map(([src, n]) => (
                    <li key={src} className="flex items-center justify-between px-4 py-2 text-[12.5px] hover:bg-white/[0.04]">
                      <span className="truncate font-medium text-white/80">{src}</span>
                      <span className="ml-2 shrink-0 rounded-full bg-white/[0.07] px-1.5 py-0.5 text-[10px] text-white/50">{n}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </aside>
      </div>

      {reader && <NewsReader item={reader} onClose={() => setReader(null)} />}
    </div>
  );
}