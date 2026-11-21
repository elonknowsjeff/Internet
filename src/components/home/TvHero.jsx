import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Play, Volume2, VolumeX, Tv } from "lucide-react";

export default function TvHero() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [idx, setIdx] = useState(0);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const rows = await base44.entities.Video.list("-views", 24);
        const arr = Array.isArray(rows) ? rows : rows?.items || [];
        setVideos(arr.filter((v) => !v.is_short));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (videos.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % videos.length), 12000);
    return () => clearInterval(t);
  }, [videos.length]);

  const featured = videos[idx];
  const yt = featured?.source === "youtube" && featured.youtube_id;
  const embed = yt
    ? `https://www.youtube.com/embed/${featured.youtube_id}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${featured.youtube_id}&controls=0&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3`
    : null;

  return (
    <section className="px-3 sm:px-4 pt-4">
      <div className="mx-auto max-w-[920px]">
        <div
          className="relative overflow-hidden rounded-[26px] border border-white/10 bg-black"
          style={{ boxShadow: "0 0 0 1px color-mix(in srgb, var(--brand) 30%, transparent), 0 30px 80px -40px color-mix(in srgb, var(--brand) 45%, transparent)" }}
        >
          <div className="flex items-center gap-2 border-b border-white/10 bg-black/60 px-4 py-2">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--brand)" }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--brand)" }} /> On Air
            </span>
            <span className="text-[11px] text-white/40">Vazolex TV</span>
            <button onClick={() => setMuted((m) => !m)} className="ml-auto grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white/70 hover:bg-white/20">
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="relative aspect-video w-full bg-black">
            {embed ? (
              <iframe
                key={featured.youtube_id + (muted ? "_m" : "_u")}
                src={embed}
                title={featured.title}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
                frameBorder="0"
              />
            ) : featured ? (
              <>
                {featured.thumbnail && <img src={featured.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />}
                <button onClick={() => navigate("/video")} className="group absolute inset-0 grid place-items-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full brand-grad text-black shadow-xl transition-transform group-hover:scale-105">
                    <Play className="h-7 w-7 fill-black" />
                  </span>
                </button>
              </>
            ) : (
              <div className="absolute inset-0 grid place-items-center text-white/40">
                <div className="text-center">
                  <Tv className="mx-auto mb-2 h-10 w-10" />
                  <p className="text-sm">Loading the channel…</p>
                </div>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0" style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, transparent 2px, transparent 3px)" }} />
            {featured && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4 sm:p-6">
                <h2 className="line-clamp-1 text-lg font-black tracking-tight sm:text-2xl">{featured.title}</h2>
                <p className="mt-0.5 text-[12px] text-white/60">{featured.channel_name} · {featured.views || 0} views</p>
              </div>
            )}
          </div>
        </div>

        {videos.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {videos.map((v, i) => (
              <button
                key={v.id}
                onClick={() => setIdx(i)}
                className={`relative w-[112px] shrink-0 overflow-hidden rounded-xl border transition-all sm:w-[132px] ${i === idx ? "border-[color:var(--brand)] ring-2 ring-[color:var(--brand)]/40" : "border-white/10 opacity-70 hover:opacity-100"}`}
              >
                <div className="aspect-video bg-black">
                  {v.thumbnail ? <img src={v.thumbnail} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center"><Tv className="h-5 w-5 text-white/30" /></div>}
                </div>
                <span className="absolute inset-x-0 bottom-0 truncate bg-black/70 px-1.5 py-1 text-left text-[9px] text-white/80">{v.channel_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}