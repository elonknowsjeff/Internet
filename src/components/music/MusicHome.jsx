import React from "react";
import { Play, Sparkles, ListMusic, TrendingUp, Disc3, Heart, Music2, Link2 } from "lucide-react";
import MusicCardShelf from "@/components/music/MusicCardShelf";

const ART = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

export default function MusicHome({ tracks, playlists, billboard = [], onPlay, onPlayBillboard, onTab, playing, currentKey }) {
  const recent = tracks.slice(0, 10);
  const trending = [...tracks].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 10);
  const charts = billboard.slice(0, 10);
  const liked = tracks.slice(0, 6);
  const topPlaylists = playlists.slice(0, 10);

  const shortcuts = [
    { label: "Liked songs", sub: `${liked.length} songs`, icon: Heart, tone: "from-violet-600 to-indigo-500", on: () => onTab("charts") },
    ...topPlaylists.slice(0, 5).map((p) => ({ label: p.name, sub: `${(p.track_ids || []).length} songs`, icon: ListMusic, tone: "from-fuchsia-600 to-violet-700", on: () => onTab("playlists") })),
    { label: "Made with AI", sub: "Prompt a song", icon: Sparkles, tone: "from-cyan-500 to-violet-600", on: () => onTab("create") },
    { label: "From Spotify", sub: "Import saves", icon: Link2, tone: "from-emerald-500 to-teal-700", on: () => onTab("spotify") },
  ];

  return (
    <div className="space-y-7 pb-2">
      <section>
        <div className="flex items-end justify-between mb-3 px-1">
          <h1 className="text-2xl sm:text-[28px] font-black tracking-tight">{greeting()}</h1>
          <span className="text-[11px] text-white/45">{tracks.length} songs · {playlists.length} playlists</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
          {shortcuts.map((s, i) => (
            <button key={`${s.label}-${i}`} onClick={s.on} className="group flex items-center gap-3 rounded-md overflow-hidden bg-white/[0.07] hover:bg-white/[0.14] transition-colors text-left pr-3">
              <span className={`w-[58px] h-[58px] shrink-0 bg-gradient-to-br ${s.tone} flex items-center justify-center`}>
                <s.icon className="w-5 h-5 text-white/90" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold truncate">{s.label}</span>
                <span className="block text-[11px] text-white/50 truncate">{s.sub}</span>
              </span>
              <span className="w-8 h-8 rounded-full bg-[#FA2D48] text-black flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-3.5 h-3.5 fill-black" />
              </span>
            </button>
          ))}
        </div>
      </section>

      <MusicCardShelf
        title="Recently added"
        onSeeAll={() => onTab("charts")}
        items={recent.map((t) => ({
          id: t.id,
          art: t.artwork,
          title: t.title,
          subtitle: t.artist_name,
          onClick: () => onPlay(t),
        }))}
      />

      {charts.length > 0 && (
        <MusicCardShelf
          title="Today's top hits"
          onSeeAll={() => onTab("charts")}
          items={charts.map((c) => ({
            id: `bb-${c.rank}-${c.title}`,
            art: `https://placehold.co/400x400/1a1533/e9d5ff?text=${encodeURIComponent(String(c.rank))}`,
            title: c.title,
            subtitle: `${c.artist} · 30s preview`,
            onClick: () => onPlayBillboard(c),
          }))}
        />
      )}

      <MusicCardShelf
        title="Made for you"
        items={[
          { id: "mix-1", art: trending[0]?.artwork || ART, title: "Your Daily Mix 1", subtitle: "Based on your library", onClick: () => trending[0] && onPlay(trending[0]) },
          { id: "mix-2", art: trending[1]?.artwork || ART, title: "Discover Weekly", subtitle: "Fresh finds, every Monday", onClick: () => onPlayBillboard(charts[0] || { title: "Blinding Lights", artist: "The Weeknd" }) },
          ...topPlaylists.map((p) => ({ id: p.id, art: p.cover || ART, title: p.name, subtitle: "Playlist", onClick: () => onTab("playlists") })),
        ]}
      />

      <section>
        <div className="flex items-baseline justify-between mb-1 px-1">
          <h3 className="text-[17px] font-bold tracking-tight">Trending in your library</h3>
          <button onClick={() => onTab("charts")} className="text-[11px] font-semibold text-white/50 hover:text-white">Charts</button>
        </div>
        <div className="divide-y divide-white/5">
          {trending.slice(0, 5).map((t, i) => {
            const active = currentKey === `cat:${t.id}`;
            return (
              <button key={t.id} onClick={() => onPlay(t)} className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/10 text-left group">
                <span className="w-4 text-xs text-white/35 tabular-nums">{i + 1}</span>
                <span className="relative w-10 h-10 rounded overflow-hidden bg-white/10 shrink-0">
                  {t.artwork && <img src={t.artwork} alt="" className="w-full h-full object-cover" />}
                  <span className={`absolute inset-0 bg-black/50 items-center justify-center ${active ? "flex" : "hidden group-hover:flex"}`}>
                    {active && playing ? <span className="flex gap-0.5 items-end h-3">{[0, 1, 2].map((b) => <span key={b} className="w-0.5 bg-[#FA2D48] animate-wave" style={{ height: "100%", animationDelay: `${b * 0.15}s` }} />)}</span> : <Play className="w-3.5 h-3.5 fill-white" />}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium truncate">{t.title}</span>
                  <span className="block text-[11px] text-white/50 truncate">{t.artist_name}</span>
                </span>
                <span className="text-[11px] text-white/40 tabular-nums shrink-0">{t.plays || 0} plays</span>
              </button>
            );
          })}
        </div>
        {!trending.length && (
          <div className="rounded-xl border border-dashed border-white/15 p-6 text-center">
            <Music2 className="w-7 h-7 mx-auto text-white/35 mb-1.5" />
            <p className="text-sm text-white/70">Nothing in your library yet</p>
            <button onClick={() => onTab("create")} className="mt-2 text-xs font-semibold text-[#FA2D48]">Create your first song →</button>
          </div>
        )}
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Browse charts", icon: TrendingUp, on: () => onTab("charts") },
          { label: "Your playlists", icon: ListMusic, on: () => onTab("playlists") },
          { label: "Beat maker", icon: Disc3, on: () => onTab("create") },
          { label: "Marketplace", icon: Sparkles, on: () => onTab("marketplace") },
        ].map((q) => (
          <button key={q.label} onClick={q.on} className="flex flex-col items-start gap-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 p-3 transition-colors">
            <q.icon className="w-4 h-4 text-[#FA2D48]" />
            <span className="text-[12px] font-semibold">{q.label}</span>
          </button>
        ))}
      </section>
    </div>
  );
}