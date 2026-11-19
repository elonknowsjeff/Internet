import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, Loader2, PenLine, Search, X, Heart } from "lucide-react";
import ArticleRow from "@/components/articles/ArticleRow";
import ArticleReader from "@/components/articles/ArticleReader";
import ArticleComposer from "@/components/articles/ArticleComposer";
import useArticleLikes from "@/hooks/useArticleLikes";

const TABS = [
  { key: "latest", label: "Latest" },
  { key: "new", label: "New" },
  { key: "liked", label: "Favourites" },
];

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("latest");

  const load = async () => {
    try {
      const res = await base44.entities.Article.list("-created_date", 80);
      setArticles(Array.isArray(res) ? res : res?.items || []);
    } catch (e) {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { liked, countOf, toggleLike } = useArticleLikes(user);

  const categories = useMemo(
    () => ["All", ...new Set(articles.map((a) => a.category).filter(Boolean))],
    [articles]
  );

  const filtered = articles.filter((a) => {
    if (category !== "All" && a.category !== category) return false;
    if (!q.trim()) return true;
    return `${a.title} ${a.subtitle || ""} ${a.author_name || ""}`
      .toLowerCase()
      .includes(q.toLowerCase());
  });

  const isFresh = (a) => new Date(a.created_date || 0).getTime() >= Date.now() - WEEK_MS;

  const shown =
    tab === "new"
      ? filtered.filter(isFresh)
      : tab === "liked"
      ? filtered.filter((a) => liked[a.id])
      : filtered;

  const isOwn = (a) => !!user && (a.created_by_id === user.id || a.author_handle === (user.username || ""));

  const open = (a) => {
    setSelected(a);
    base44.entities.Article.update(a.id, { views: (a.views || 0) + 1 }).catch(() => {});
  };

  const remove = async (a) => {
    if (!confirm("Delete this article?")) return;
    await base44.entities.Article.delete(a.id);
    load();
  };

  if (selected) {
    return (
      <ArticleReader
        article={selected}
        liked={!!liked[selected.id]}
        likeCount={countOf(selected)}
        onLike={() => toggleLike(selected)}
        user={user}
        onBack={() => { setSelected(null); load(); }}
      />
    );
  }

  return (
    <div className="flex justify-center">
      <div className="flex-1 min-w-0 max-w-[640px] min-h-screen border-x border-white/[0.08] pb-28">
        <header className="sticky top-0 z-30 bg-[#0d0920]/80 backdrop-blur-2xl border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5 h-[54px] px-4">
            <BookOpen className="w-[19px] h-[19px] text-fuchsia-400 shrink-0" />
            <h1 className="text-[19px] font-extrabold tracking-tight">Articles</h1>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-full px-3 h-9 w-36 sm:w-56">
                <Search className="w-4 h-4 text-white/40 shrink-0" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search"
                  className="flex-1 min-w-0 bg-transparent outline-none text-[13.5px] placeholder-white/40"
                />
                {q && <button onClick={() => setQ("")}><X className="w-3.5 h-3.5 text-white/45" /></button>}
              </div>
              <button
                onClick={() => setComposerOpen(true)}
                className="flex items-center gap-1.5 px-3.5 h-9 rounded-full bg-white text-black text-[14px] font-bold hover:bg-white/90 transition-colors"
              >
                <PenLine className="w-4 h-4" /> Write
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 border-t border-white/[0.06]">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className="relative py-3 hover:bg-white/[0.04]">
                <span className={`text-[14.5px] ${tab === t.key ? "font-extrabold text-white" : "font-medium text-white/55"}`}>
                  {t.label}
                </span>
                {tab === t.key && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[3px] rounded-full bg-[color:var(--brand)]" />
                )}
              </button>
            ))}
          </div>
        </header>

        <div className="flex gap-2 overflow-x-auto scrollbar-none px-4 py-2.5 border-b border-white/[0.06]">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 px-3 py-1 rounded-full text-[12.5px] font-semibold border transition-colors ${
                category === c
                  ? "bg-white text-black border-white"
                  : "bg-white/[0.06] border-white/10 text-white/65 hover:text-white hover:bg-white/10"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 flex items-center justify-center gap-2 text-white/50">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading articles…
          </div>
        ) : shown.length === 0 ? (
          <div className="py-20 px-6 flex flex-col items-center text-center">
            {tab === "liked" ? (
              <>
                <Heart className="w-9 h-9 text-rose-400 mb-3" />
                <h2 className="font-bold">No favourites yet</h2>
                <p className="text-sm text-white/45 mt-1 max-w-sm">
                  Tap the heart on any article to save it here.
                </p>
              </>
            ) : (
              <>
                <BookOpen className="w-9 h-9 text-fuchsia-400 mb-3" />
                <h2 className="font-bold">{tab === "new" ? "Nothing new this week" : "No articles here yet"}</h2>
                <p className="text-sm text-white/45 mt-1 max-w-sm">
                  Publish the first one — a how-to, a business teardown, a story.
                </p>
                <button
                  onClick={() => setComposerOpen(true)}
                  className="mt-4 px-4 py-2 rounded-full bg-white text-black text-sm font-bold"
                >
                  Write an article
                </button>
              </>
            )}
          </div>
        ) : (
          shown.map((a) => (
            <ArticleRow
              key={a.id}
              article={a}
              liked={!!liked[a.id]}
              count={countOf(a)}
              isOwn={isOwn(a)}
              onOpen={() => open(a)}
              onLike={toggleLike}
              onDelete={() => remove(a)}
            />
          ))
        )}

        {!loading && shown.length > 0 && (
          <p className="text-center text-[11px] text-white/30 py-6">
            {shown.length} {shown.length === 1 ? "article" : "articles"}
          </p>
        )}
      </div>

      {composerOpen && (
        <ArticleComposer
          user={user}
          onClose={() => setComposerOpen(false)}
          onCreated={() => { setComposerOpen(false); setTab("latest"); load(); }}
        />
      )}
    </div>
  );
}