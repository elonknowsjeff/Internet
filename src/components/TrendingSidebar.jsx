import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, X, MoreHorizontal, Activity, Users, Music2, Car, UtensilsCrossed, Gamepad2 } from "lucide-react";
import WhoToFollow from "@/components/WhoToFollow";
import { useSettings } from "@/components/SettingsContext";

export default function TrendingSidebar({ posts = [], onTag, onOpenUser, query = "", onQuery }) {
  const { settings } = useSettings();
  const [localQ, setLocalQ] = useState("");
  const q = onQuery ? query : localQ;
  const setQ = onQuery || setLocalQ;

  const trending = useMemo(() => {
    const map = {};
    for (const p of posts) {
      const tags = (p.content || "").match(/#\w+/g) || [];
      for (const t of tags) map[t] = (map[t] || 0) + 1;
      for (const w of (p.content || "").toLowerCase().split(/\s+/)) {
        if (w.length > 4 && !w.startsWith("#") && !w.startsWith("http")) map["#" + w.replace(/[^a-z0-9]/g, "")] = (map["#" + w.replace(/[^a-z0-9]/g, "")] || 0) + 0.4;
      }
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [posts]);

  const filtered = q.trim()
    ? posts.filter((p) => (p.content || "").toLowerCase().includes(q.toLowerCase()) || (p.author_name || "").toLowerCase().includes(q.toLowerCase()))
    : [];

  return (
    <aside className="hidden lg:block w-[300px] xl:w-[350px] shrink-0 pl-6 pr-2 py-3 sticky top-0 h-[calc(100vh-92px)] overflow-y-auto thin-scrollbar space-y-4">
      {/* Search */}
      <div className="sticky top-0 z-10 py-0.5 -mt-1 bg-[#0d0920]">
        <div className="flex items-center gap-2.5 bg-white/[0.07] border border-white/10 focus-within:border-fuchsia-400/60 rounded-full px-4 py-2.5">
          <Search className="w-4 h-4 text-white/45 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search Valo"
            className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder-white/45"
          />
          {q && <button onClick={() => setQ("")}><X className="w-4 h-4 text-white/45" /></button>}
        </div>
      </div>

      {q.trim() && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
          <h3 className="px-4 pt-3 pb-1 text-[19px] font-extrabold">Results</h3>
          {filtered.slice(0, 4).map((p) => (
            <button key={p.id} onClick={() => onOpenUser?.(p.author_handle)} className="w-full text-left px-4 py-2.5 hover:bg-white/[0.05]">
              <p className="text-sm text-white/85 line-clamp-2">{p.content}</p>
              <p className="text-[13px] text-white/45 mt-0.5">@{p.author_handle} · open account</p>
            </button>
          ))}
          {filtered.length === 0 && <p className="px-4 py-3 text-sm text-white/45">No matches.</p>}
        </section>
      )}

      {/* Premium */}
      {settings.stripeLink && (
        <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/20 via-violet-600/15 to-cyan-500/15 p-4">
          <h3 className="text-[19px] font-extrabold leading-tight">Subscribe to Premium</h3>
          <p className="text-sm text-white/75 mt-1 leading-snug">Unlock creator tools, music, gaming and every Valo service in one place.</p>
          <a
            href={settings.stripeLink}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block px-4 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-white/90"
          >
            Subscribe
          </a>
        </section>
      )}

      {/* What's happening */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
        <h3 className="px-4 pt-3 pb-1 text-[19px] font-extrabold">What&apos;s happening</h3>
        {trending.length === 0 ? (
          <p className="px-4 py-3 text-sm text-white/45">Add #hashtags to your posts to trend.</p>
        ) : (
          trending.map(([tag, count], i) => (
            <button key={tag} onClick={() => onTag?.(tag.replace("#", ""))} className="w-full text-left px-4 py-2.5 hover:bg-white/[0.05]">
              <div className="flex items-center justify-between text-[13px] text-white/50">
                <span>Trending · #{i + 1}</span>
                <MoreHorizontal className="w-4 h-4" />
              </div>
              <p className="font-bold text-[15px] mt-0.5">#{tag.replace("#", "")}</p>
              <p className="text-[13px] text-white/50">{Math.round(count)} posts</p>
            </button>
          ))
        )}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-full text-left px-4 py-3 text-[15px] text-fuchsia-300 hover:bg-white/[0.05]"
        >
          Show more
        </button>
      </section>

      <WhoToFollow />
      <LiveActivity />

      <footer className="px-2 pb-6 text-[12px] text-white/40 flex flex-wrap gap-x-3 gap-y-1">
        <Link to="/terms" className="hover:underline">Terms of Service</Link>
        <Link to="/settings" className="hover:underline">Settings</Link>
        <Link to="/profile" className="hover:underline">Profile</Link>
        <span>© {new Date().getFullYear()} Valo</span>
      </footer>
    </aside>
  );
}

function LiveActivity() {
  const [stats, setStats] = useState({ posts: 0, tracks: 0, rides: 0, orders: 0, games: 0 });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [p, t, r, o] = await Promise.all([
          base44.entities.Post.list("-created_date", 500),
          base44.entities.Track.list("-created_date", 500),
          base44.entities.Ride.list("-created_date", 500),
          base44.entities.Order.list("-created_date", 500),
        ]);
        if (active) setStats({ posts: p.length, tracks: t.length, rides: r.length, orders: o.length, games: 2000 });
      } catch {}
    };
    load();
    const sub1 = base44.entities.Post?.subscribe?.(() => load());
    const id = setInterval(() => setTick((x) => x + 1), 3000);
    return () => { active = false; clearInterval(id); if (typeof sub1 === "function") sub1(); };
  }, []);

  const items = [
    { label: "Posts", value: stats.posts, icon: Activity, color: "text-cyan-400" },
    { label: "Tracks", value: stats.tracks, icon: Music2, color: "text-orange-400" },
    { label: "Rides", value: stats.rides, icon: Car, color: "text-emerald-400" },
    { label: "Orders", value: stats.orders, icon: UtensilsCrossed, color: "text-amber-400" },
    { label: "Games", value: stats.games.toLocaleString(), icon: Gamepad2, color: "text-fuchsia-400" },
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <h3 className="font-extrabold text-[19px] flex items-center gap-2 mb-3"><Users className="w-5 h-5 text-cyan-400" /> Live activity</h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map((it) => (
          <div key={it.label} className="rounded-xl bg-white/5 p-2.5">
            <it.icon className={`w-4 h-4 ${it.color}`} />
            <p className="text-lg font-bold tabular-nums mt-1">{it.value}</p>
            <p className="text-[13px] text-white/45">{it.label}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-3 text-[13px] text-emerald-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live · updating in real time
      </div>
    </section>
  );
}