import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, X, TrendingUp, Heart, Hash } from "lucide-react";

const FALLBACK_TRENDS = [
  { tag: "SuperInternet", posts: 18400 },
  { tag: "NightDrive", posts: 9200 },
  { tag: "AIArt", posts: 7100 },
  { tag: "MatchDay", posts: 5400 },
  { tag: "NewMusicFriday", posts: 3800 },
];

const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : `${n}`);

export default function TrendingBar({ query, setQuery, posts = [], onTag, onOpenUser, onOpenSearch }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const trends = useMemo(() => {
    const map = new Map();
    for (const p of posts) {
      const tags = (p.content || "").match(/#[a-zA-Z0-9_]+/g) || [];
      for (const t of tags) {
        const key = t.slice(1);
        map.set(key, (map.get(key) || 0) + 1);
      }
    }
    const own = [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, posts: count * 140 + 900 }));
    return own.length >= 3 ? own : [...own, ...FALLBACK_TRENDS].slice(0, 5);
  }, [posts]);

  const people = useMemo(() => {
    const term = query.trim().toLowerCase();
    const seen = new Map();
    for (const p of posts) {
      if (!p.author_handle || seen.has(p.author_handle)) continue;
      seen.set(p.author_handle, p);
    }
    const list = [...seen.values()];
    if (!term) return list.slice(0, 3);
    return list.filter((p) =>
      `${p.author_name} ${p.author_handle}`.toLowerCase().includes(term)
    ).slice(0, 4);
  }, [posts, query]);

  const pickTag = (tag) => {
    setOpen(false);
    onTag?.(tag);
  };

  return (
    <div ref={boxRef} className="relative flex-1 min-w-0">
      <div className="flex items-center gap-2.5 bg-white/[0.07] border border-white/10 focus-within:border-[color:var(--brand)]/70 focus-within:bg-white/[0.1] rounded-full px-3.5 py-2 transition-all">
        <Search className="w-4 h-4 text-white/45 shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search trends, people, sounds…"
          className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder-white/40"
        />
        {query ? (
          <button onClick={() => setQuery("")} aria-label="Clear search" className="text-white/45 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={() => onOpenSearch?.()} className="text-[11px] font-semibold text-white/45 hover:text-white hidden sm:block">
            Advanced
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-white/10 bg-[#140e2b]/95 backdrop-blur-2xl shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] overflow-hidden animate-pop-in">
          <p className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-[0.18em] text-white/40 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" style={{ color: "var(--brand)" }} /> Trending now
          </p>
          {trends.map((t) => (
            <button
              key={t.tag}
              onClick={() => pickTag(t.tag)}
              className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-white/[0.07] transition-colors"
            >
              <span className="w-7 h-7 rounded-lg grid place-items-center bg-white/[0.07] text-white/50 shrink-0">
                <Hash className="w-3.5 h-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold truncate">#{t.tag}</span>
                <span className="block text-[11.5px] text-white/45">{fmt(t.posts)} posts</span>
              </span>
            </button>
          ))}

          {people.length > 0 && (
            <>
              <p className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-[0.18em] text-white/40">People</p>
              {people.map((p) => (
                <button
                  key={p.author_handle}
                  onClick={() => { setOpen(false); onOpenUser?.(p.author_handle); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-white/[0.07] transition-colors"
                >
                  <img
                    src={p.author_avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10 shrink-0"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-semibold truncate">{p.author_name}</span>
                    <span className="block text-[11.5px] text-white/45 truncate">@{p.author_handle}</span>
                  </span>
                </button>
              ))}
            </>
          )}

          <Link
            to="/dating"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-3 border-t border-white/[0.08] text-[13px] font-semibold text-rose-200 hover:bg-rose-500/10 transition-colors"
          >
            <Heart className="w-4 h-4" /> Dating — meet people nearby
          </Link>
        </div>
      )}
    </div>
  );
}