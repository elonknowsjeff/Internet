import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, Search, Loader2, X, Sparkles } from "lucide-react";
import BingResults from "@/components/news/BingResults";
import NewsReader from "@/components/news/NewsReader";
import TopicRail from "@/components/news/TopicRail";
import { storyKey } from "@/lib/newsTopics";

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

  // likes + comments for every story on screen, in two batched queries
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

  return (
    <div className="w-full max-w-[1000px] mx-auto pb-28">
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#0b0818]/82 backdrop-blur-2xl">
        <div className="flex items-center gap-2 px-4 pt-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-[9px] brand-grad text-[13px] font-black text-black">X</span>
            <h1 className="text-[15px] font-bold tracking-[-0.01em]">News</h1>
            <span className="hidden rounded-full border border-white/[0.12] bg-white/[0.05] px-2 py-0.5 text-[10px] font-semibold text-white/50 sm:block">Powered by Bing</span>
          </div>
          <button
            onClick={() => load(cat, query)}
            disabled={loading}
            className="w-9 h-9 rounded-full bg-white/[0.07] border border-white/10 grid place-items-center hover:border-[color:var(--brand)] disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="px-4 pb-2 pt-2.5">
          <form onSubmit={submit} className="flex h-11 items-center gap-2.5 rounded-full border border-white/[0.13] bg-white/[0.06] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_18px_40px_-30px_rgba(0,0,0,0.9)] transition-colors focus-within:border-white/30 focus-within:bg-white/[0.09]">
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
          <p className="mt-1.5 px-1 text-[10.5px] text-white/30">Live web results · {today()}</p>
        </div>

        <TopicRail active={cat} onPick={pick} />

        {query && (
          <p className="px-4 pb-2 text-[11.5px] text-white/50 flex items-center gap-1.5">
            Results for “{query}”
            <button onClick={() => { setQuery(""); setQ(""); load(cat, ""); }} className="text-[color:var(--brand)] font-semibold hover:underline">clear</button>
          </p>
        )}
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-white/45 text-sm">
          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Curating today's stories…
        </div>
      ) : items.length === 0 ? (
        <div className="p-10 text-center text-white/45 text-sm">Couldn't load news right now. Try refresh.</div>
      ) : (
        <>
          <div className="mt-2 flex items-center justify-between px-4 text-[11px] text-white/40">
            <span>{query ? <>Results for <span className="font-semibold text-white/75">“{query}”</span></> : <>Top stories · {cat}</>}</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {items.length} results</span>
          </div>
          <div className="mt-1.5 overflow-hidden rounded-2xl panel">
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
            className="mt-4 mx-4 w-[calc(100%-2rem)] py-3 rounded-full border border-white/12 bg-white/[0.05] hover:bg-white/[0.09] text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {moreLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Finding more stories…</> : <><Sparkles className="w-4 h-4" style={{ color: "var(--brand)" }} /> More stories</>}
          </button>
        </>
      )}

      {reader && <NewsReader item={reader} onClose={() => setReader(null)} />}
    </div>
  );
}