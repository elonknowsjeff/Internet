import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, X, Loader2, AtSign } from "lucide-react";

export default function UniversalSearch() {
  const [q, setQ] = useState("");
  const [people, setPeople] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const ref = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const query = q.trim();
    if (query.length < 2) { setPeople([]); setPosts([]); setLoading(false); return; }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const rx = { $regex: query, $options: "i" };
        const page = await base44.entities.Post.filter(
          { $or: [{ content: rx }, { author_name: rx }, { author_handle: rx }] },
          { sort: "-created_date", limit: 30 }
        );
        const items = page?.items || [];
        const seen = new Map();
        items.forEach((p) => {
          if (p.created_by_id && !seen.has(p.created_by_id)) {
            seen.set(p.created_by_id, { id: p.created_by_id, name: p.author_name, handle: p.author_handle, avatar: p.author_avatar });
          }
        });
        setPeople([...seen.values()].slice(0, 6));
        setPosts(items.slice(0, 5));
      } catch { setPeople([]); setPosts([]); }
      setLoading(false);
    }, 280);
    return () => clearTimeout(timer.current);
  }, [q]);

  const has = people.length || posts.length;

  return (
    <div ref={ref} className="relative w-full max-w-[460px]">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 focus-within:border-[color:var(--brand)]/60 transition-colors">
        <Search className="w-4 h-4 text-white/40 shrink-0" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search people, posts and accounts"
          className="flex-1 min-w-0 bg-transparent text-[13.5px] outline-none placeholder-white/35"
        />
        {loading ? <Loader2 className="w-4 h-4 animate-spin text-white/40 shrink-0" />
          : q ? <button onClick={() => { setQ(""); setPeople([]); setPosts([]); }} className="shrink-0"><X className="w-4 h-4 text-white/40" /></button> : null}
      </div>
      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 mt-2 rounded-2xl border border-white/10 bg-[#131316] shadow-[0_24px_64px_-24px_rgba(0,0,0,0.9)] overflow-hidden z-50 max-h-[60vh] overflow-y-auto thin-scrollbar">
          {!has && !loading ? (
            <p className="px-4 py-7 text-center text-[12.5px] text-white/40">No results for "{q}"</p>
          ) : (
            <>
              {people.length > 0 && (
                <div className="p-1.5">
                  <p className="px-2.5 py-1.5 text-[10px] uppercase tracking-wide text-white/40">People</p>
                  {people.map((p) => (
                    <button key={p.id} onClick={() => { setOpen(false); nav(`/messages?u=${p.id}`); }} className="flex w-full items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-white/[0.06] text-left">
                      <span className="w-9 h-9 rounded-full overflow-hidden bg-white/10 grid place-items-center text-[13px] font-bold shrink-0">
                        {p.avatar ? <img src={p.avatar} alt="" className="w-full h-full object-cover" /> : (p.name || "?")[0]?.toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-semibold truncate">{p.name || "User"}</span>
                        <span className="block text-[11px] text-white/45 truncate">@{p.handle || "user"}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {posts.length > 0 && (
                <div className="p-1.5 border-t border-white/[0.06]">
                  <p className="px-2.5 py-1.5 text-[10px] uppercase tracking-wide text-white/40">Posts</p>
                  {posts.map((p) => (
                    <button key={p.id} onClick={() => { setOpen(false); nav(`/?cat=social`); }} className="block w-full px-2.5 py-2 rounded-xl hover:bg-white/[0.04] text-left">
                      <p className="text-[12px] text-white/70 line-clamp-2">{p.content}</p>
                      <p className="text-[10.5px] text-white/35 mt-0.5 flex items-center gap-1"><AtSign className="w-2.5 h-2.5" />{p.author_handle || "user"}</p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}