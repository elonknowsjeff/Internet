import React, { useMemo, useState } from "react";
import { Tv, ExternalLink, Globe, List, Radio, Settings2 } from "lucide-react";

const CHANNELS = [
  { num: 101, id: "bloomberg", name: "Bloomberg TV", cat: "Business", flag: "💼", embed: "https://www.youtube.com/embed/iEpJwprxDdk?autoplay=1", link: "https://www.youtube.com/watch?v=iEpJwprxDdk", now: "Bloomberg Surveillance", next: "Markets: Live" },
  { num: 102, id: "abc", name: "ABC News Live", cat: "News", flag: "🇺🇸", embed: "https://www.youtube.com/embed/iipR5yUp36o?autoplay=1", link: "https://www.youtube.com/watch?v=iipR5yUp36o", now: "ABC News Live", next: "Top Stories" },
  { num: 103, id: "france24", name: "FRANCE 24 English", cat: "News", flag: "🇫🇷", embed: "https://www.youtube.com/embed/HvZt-nh9sGg?autoplay=1", link: "https://www.youtube.com/watch?v=HvZt-nh9sGg", now: "World News", next: "Business Daily" },
  { num: 104, id: "dw", name: "DW News", cat: "News", flag: "🇩🇪", embed: "https://www.youtube.com/embed/LuKwFajn37U?autoplay=1", link: "https://www.youtube.com/watch?v=LuKwFajn37U", now: "The Week in Reports", next: "Focus on Europe" },
  { num: 105, id: "aljazeera", name: "Al Jazeera English", cat: "News", flag: "🇶🇦", embed: "https://www.youtube.com/embed/live_stream?channel=UCNye-wNBqNL5ZzHSJj3l8Bg&autoplay=1", link: "https://www.youtube.com/channel/UCNye-wNBqNL5ZzHSJj3l8Bg/live", now: "Newshour", next: "Inside Story" },
  { num: 106, id: "skynews", name: "Sky News", cat: "News", flag: "🇬🇧", embed: "https://www.youtube.com/embed/YDvsBbKfLPA?autoplay=1", link: "https://www.youtube.com/watch?v=YDvsBbKfLPA", now: "Sky News Live", next: "The News Hour" },
  { num: 107, id: "cna", name: "Channel News Asia", cat: "News", flag: "🇸🇬", embed: "https://www.youtube.com/embed/live_stream?channel=UCONS4mGSkbayggEX8juZfQxw&autoplay=1", link: "https://www.youtube.com/@channelnewsasia/live", now: "CNA Live", next: "Asia First" },
  { num: 108, id: "nasa", name: "NASA TV", cat: "Science", flag: "🚀", embed: "https://www.youtube.com/embed/live_stream?channel=UCLA_DiR1FfKNvjuUpBHmylQ&autoplay=1", link: "https://www.youtube.com/@NASA/live", now: "NASA Live", next: "ISS Views" },
  { num: 109, id: "redbull", name: "Red Bull TV", cat: "Sports", flag: "🐂", embed: "https://www.youtube.com/embed/live_stream?channel=UCblfuW_8-rJkxQHMaRnJcDQ&autoplay=1", link: "https://www.youtube.com/@redbull/live", now: "Red Bull Live", next: "Action Sports" },
  { num: 110, id: "lofi", name: "Lofi Girl Radio", cat: "Music", flag: "🎧", embed: "https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1", link: "https://www.youtube.com/watch?v=jfKfPfyJRdk", now: "Lofi Beats to Relax/Study", next: "Keep going…" },
  { num: 111, id: "chillhop", name: "Chillhop Music", cat: "Music", flag: "🎵", embed: "https://www.youtube.com/embed/7yx6QlhHb3w?autoplay=1", link: "https://www.youtube.com/watch?v=7yx6QlhHb3w", now: "Chillhop Yearmix", next: "Summer Chill" },
];

const CATS = ["All", "Cable", "News", "Business", "Music", "Science", "Sports"];

const slotLabel = (offsetMinutes) => {
  const d = new Date();
  const rounded = Math.floor(d.getMinutes() / 30) * 30 + offsetMinutes;
  d.setMinutes(rounded, 0, 0);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

export default function LiveTV() {
  const [active, setActive] = useState(CHANNELS[0]);
  const [cat, setCat] = useState("Cable");
  const [showGuide, setShowGuide] = useState(true);

  const list = useMemo(() => (cat === "All" ? CHANNELS : cat === "Cable" ? CHANNELS : CHANNELS.filter((c) => c.cat === cat)), [cat]);
  const slots = useMemo(() => [slotLabel(0), slotLabel(30), slotLabel(60), slotLabel(90)], []);

  return (
    <div className="max-w-5xl mx-auto pb-28 sm:pb-8">
      <header className="sticky top-0 z-30 bg-white/10 backdrop-blur-2xl border-b border-white/15 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold font-display flex items-center gap-2"><Tv className="w-5 h-5 text-rose-400" /> Cable TV & Live</h1>
            <p className="text-xs text-neutral-400">Channel guide, 24/7 streams, free to watch</p>
          </div>
          <button onClick={() => setShowGuide((v) => !v)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold hover:bg-white/15">
            <List className="w-3.5 h-3.5" /> {showGuide ? "Hide guide" : "Show guide"}
          </button>
        </div>
        <div className="flex gap-1.5 mt-2 overflow-x-auto scrollbar-none">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`shrink-0 px-3 py-1 rounded-full text-xs ${cat === c ? "bg-rose-500 text-black font-semibold" : "bg-white/5 border border-white/10 text-neutral-300"}`}>{c}</button>
          ))}
        </div>
      </header>

      <div className="px-4 pt-4 grid lg:grid-cols-[1.6fr_1fr] gap-4">
        <div>
          <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black aspect-video">
            <iframe src={active.embed} title={active.name} className="w-full h-full" allow="autoplay; encrypted-media; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE</span>
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-amber-300 text-[10px] font-bold">CH {active.num}</span>
          </div>
          <div className="flex items-start justify-between mt-3 gap-2">
            <div className="min-w-0">
              <p className="font-semibold flex items-center gap-2 truncate"><span className="text-sm text-neutral-500 font-mono">CH {active.num}</span> {active.flag} {active.name}</p>
              <p className="text-xs text-neutral-400 truncate">Now: {active.now} · Next: {active.next}</p>
            </div>
            <a href={active.link} target="_blank" rel="noreferrer" className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 shrink-0"><ExternalLink className="w-3.5 h-3.5" /> YouTube</a>
          </div>
        </div>

        {/* channel strip */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-2 max-h-[420px] overflow-y-auto">
          <p className="px-2 py-1 text-[10px] uppercase tracking-widest text-neutral-500 flex items-center gap-1"><Radio className="w-3 h-3" /> Channels</p>
          {list.map((c) => (
            <button key={c.id} onClick={() => setActive(c)} className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left ${active.id === c.id ? "bg-rose-500/20" : "hover:bg-white/5"}`}>
              <span className="w-8 text-center font-mono text-xs font-bold text-neutral-400">{c.num}</span>
              <span className="text-lg">{c.flag}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold truncate">{c.name}</span>
                <span className="block text-[10px] text-neutral-400 truncate">{c.now}</span>
              </span>
              {active.id === c.id && <span className="text-[9px] text-rose-300 font-bold">TUNED</span>}
            </button>
          ))}
        </div>
      </div>

      {/* cable program guide */}
      {showGuide && (
        <div className="px-4 py-4">
          <h3 className="text-xs uppercase tracking-widest text-neutral-500 mb-2 flex items-center gap-1.5"><Settings2 className="w-3.5 h-3.5" /> Cable guide</h3>
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <div className="grid grid-cols-[64px_1fr_1fr_1fr] bg-white/10 text-[10px] uppercase tracking-widest text-neutral-400">
              <span className="p-2">Ch</span>
              {slots.slice(0, 3).map((s) => <span key={s} className="p-2 border-l border-white/10">{s}</span>)}
            </div>
            <div className="divide-y divide-white/5">
              {list.map((c) => (
                <button key={c.id} onClick={() => setActive(c)} className={`grid grid-cols-[64px_1fr_1fr_1fr] w-full text-left hover:bg-white/5 ${active.id === c.id ? "bg-rose-500/10" : ""}`}>
                  <span className="p-2 font-mono text-xs text-neutral-400">{c.num}</span>
                  <span className="p-2 border-l border-white/10 min-w-0">
                    <span className="block text-[11px] font-semibold truncate">{c.now}</span>
                    <span className="block text-[9px] text-rose-300">LIVE NOW</span>
                  </span>
                  <span className="p-2 border-l border-white/10 text-[11px] text-neutral-300 truncate">{c.next}</span>
                  <span className="p-2 border-l border-white/10 text-[11px] text-neutral-500 truncate">{c.cat} block</span>
                </button>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-neutral-500 mt-2 flex items-center gap-1"><Globe className="w-3 h-3" /> Free public live broadcasts. If a channel is between streams, use “YouTube”.</p>
        </div>
      )}
    </div>
  );
}