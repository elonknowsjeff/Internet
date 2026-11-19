import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, Hash, Users } from "lucide-react";
import WhoToFollow from "@/components/WhoToFollow";

export default function MessagesRail({ onTag }) {
  const [posts, setPosts] = useState([]);
  const [counts, setCounts] = useState({ posts: 0, people: 0 });

  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const [p, people] = await Promise.all([
          base44.entities.Post.list("-created_date", 100),
          base44.entities.User.list("-created_date", 100),
        ]);
        if (!live) return;
        setPosts(p || []);
        setCounts({ posts: (p || []).length, people: (people || []).length });
      } catch { /* ignore */ }
    };
    load();
    const unsub = base44.entities.Post?.subscribe?.(() => load());
    return () => { live = false; if (typeof unsub === "function") unsub(); };
  }, []);

  const trending = useMemo(() => {
    const map = {};
    for (const p of posts) {
      const tags = (p.content || "").match(/#[\w]+/g) || [];
      for (const t of tags) map[t.toLowerCase()] = (map[t.toLowerCase()] || 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [posts]);

  return (
    <aside className="hidden xl:block w-[320px] shrink-0 px-3 py-3 space-y-3 sticky top-0 h-[calc(100vh-3.5rem)] overflow-y-auto thin-scrollbar border-l border-white/10">
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
        <h3 className="font-bold text-base px-4 pt-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-fuchsia-400" /> Trending now</h3>
        {trending.length === 0 ? (
          <p className="px-4 py-3 text-sm text-white/45">No trends yet — posts with #hashtags show up here.</p>
        ) : (
          trending.map(([tag, n], i) => (
            <button key={tag} onClick={() => onTag?.(tag.replace("#", ""))} className="w-full text-left px-4 py-2.5 hover:bg-white/5">
              <p className="text-[11px] text-white/40">#{i + 1} · Trending</p>
              <p className="font-semibold text-sm flex items-center gap-1"><Hash className="w-3.5 h-3.5 text-fuchsia-400" />{tag.replace("#", "")}</p>
              <p className="text-[11px] text-white/40">{n} {n === 1 ? "post" : "posts"} · tap to open the feed</p>
            </button>
          ))
        )}
      </div>

      <WhoToFollow />

      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4">
        <h3 className="font-bold flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-cyan-400" /> Real accounts only</h3>
        <p className="text-xs text-white/50">Every message, call and notification here comes from a real person with an account — nothing is simulated.</p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="rounded-xl bg-white/5 p-2.5">
            <p className="text-lg font-bold tabular-nums">{counts.people}</p>
            <p className="text-[11px] text-white/45">people</p>
          </div>
          <div className="rounded-xl bg-white/5 p-2.5">
            <p className="text-lg font-bold tabular-nums">{counts.posts}</p>
            <p className="text-[11px] text-white/45">posts</p>
          </div>
        </div>
      </div>
    </aside>
  );
}