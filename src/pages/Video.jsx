import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Upload, Play, X, Youtube, Menu, Home, Clapperboard, History, ThumbsUp, BarChart3, User, Plus, Loader2, Radio, Bell, Mic } from "lucide-react";
import { useVideoPlayer } from "@/components/VideoPlayerProvider";
import LiveSection from "@/components/video/LiveSection";
import WatchView from "@/components/video/WatchView";
import XsiVideoCard from "@/components/video/XsiVideoCard";
import ShortsShelf from "@/components/video/ShortsShelf";
import ShortsPlayer from "@/components/video/ShortsPlayer";
import SearchFilters from "@/components/video/SearchFilters";
import VideoThumb from "@/components/video/VideoThumb";
import VideoUploadDialog from "@/components/video/VideoUploadDialog";
import CreatorStudioSection from "@/components/video/CreatorStudioSection";

const LIVE_CATEGORIES = ["Just chatting", "Music", "Gaming", "News", "Tech", "Sports", "Education"];

const CATEGORIES = ["All", "Shorts", "Music", "Tech", "Gaming", "News", "Comedy", "Sports", "Education"];

const thumb = (id) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
const fmtViews = (n = 0) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(0)}K` : n);
const parseId = (s) => {
  const v = (s || "").trim();
  const m = v.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : v.length === 11 ? v : "";
};

const RAIL = [
  { key: "home", label: "Home", icon: Home },
  { key: "live", label: "Live", icon: Radio },
  { key: "shorts", label: "Shorts", icon: Clapperboard },
  { key: "history", label: "History", icon: History },
  { key: "liked", label: "Liked videos", icon: ThumbsUp },
  { key: "mine", label: "Your videos", icon: User },
  { key: "studio", label: "Creator studio", icon: BarChart3 },
];

export default function Video() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [rail, setRail] = useState("home");
  const [watch, setWatch] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [liked, setLiked] = useState(() => {
    try { return Object.fromEntries((JSON.parse(localStorage.getItem("si_video_liked") || "[]")).map((id) => [id, true])); } catch (e) { return {}; }
  });
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("si_video_history") || "[]"); } catch (e) { return []; }
  });
  const [streams, setStreams] = useState([]);
  const [liveOpen, setLiveOpen] = useState(false);
  const [liveForm, setLiveForm] = useState({ title: "", url: "", category: "Just chatting", description: "" });
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("new");
  const [channel, setChannel] = useState("");
  const [shortsAt, setShortsAt] = useState(null);
  const videoPlayer = useVideoPlayer();

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const load = async () => {
    try {
      const [vids, live] = await Promise.all([
        base44.entities.Video.list("-created_date", 200),
        base44.entities.LiveStream.list("-created_date", 50),
      ]);
      setVideos(vids);
      setStreams(live);
    } catch (e) { setVideos([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const myHandle = user?.username || (user?.email ? user.email.split("@")[0] : "");
  const channels = Object.values(videos.reduce((acc, v) => {
    const key = v.channel_handle || v.channel_name;
    if (key && !acc[key]) acc[key] = { handle: key, name: v.channel_name, avatar: v.channel_avatar };
    return acc;
  }, {}));

  const popOut = (v) => { videoPlayer.play({ youtube_id: v.youtube_id, file_uri: v.file_uri, title: v.title, channel_name: v.channel_name, start: 0 }); setWatch(null); };
  const openWatch = async (v) => {
    setWatch(v);
    setHistory((prev) => {
      const next = [v.id, ...prev.filter((id) => id !== v.id)].slice(0, 60);
      try { localStorage.setItem("si_video_history", JSON.stringify(next)); } catch (e) {}
      return next;
    });
    await base44.entities.Video.update(v.id, { views: (v.views || 0) + 1 }).catch(() => {});
    load();
  };
  const like = async (v) => {
    if (liked[v.id]) return;
    setLiked((s) => {
      const next = { ...s, [v.id]: true };
      try { localStorage.setItem("si_video_liked", JSON.stringify(Object.keys(next))); } catch (e) {}
      return next;
    });
    await base44.entities.Video.update(v.id, { likes: (v.likes || 0) + 1 }).catch(() => {});
    load();
  };

  const goLive = async () => {
    const id = parseId(liveForm.url);
    if (!liveForm.title.trim()) return;
    const handle = myHandle || "creator";
    await base44.entities.LiveStream.create({
      title: liveForm.title.trim(),
      host_name: user?.display_name || user?.full_name || "New streamer",
      host_handle: handle,
      host_avatar: user?.avatar || `https://i.pravatar.cc/100?u=${handle}`,
      thumbnail: id ? thumb(id) : "",
      stream_id: id,
      category: liveForm.category,
      viewers: 1,
      is_live: true,
      description: liveForm.description.trim(),
    });
    setLiveForm({ title: "", url: "", category: "Just chatting", description: "" });
    setLiveOpen(false);
    load();
  };

  const openStream = (s) => setWatch({ youtube_id: s.stream_id, title: s.title, channel_name: s.host_name, views: s.viewers, likes: 0, description: s.description });

  // ---- filtering + searching ----
  const q = query.trim().toLowerCase();
  const searching = q.length > 0;
  const shortsMode = rail === "shorts" || type === "shorts" || category === "Shorts";

  let list = videos;
  if (rail === "mine") list = myHandle ? videos.filter((v) => v.channel_handle === myHandle) : [];
  if (rail === "history") list = history.map((id) => videos.find((v) => v.id === id)).filter(Boolean);
  if (rail === "liked") list = videos.filter((v) => liked[v.id]);
  if (rail === "shorts" || category === "Shorts") list = list.filter((v) => v.is_short);

  list = list.filter((v) => {
    if (type === "videos" && v.is_short) return false;
    if (type === "shorts" && !v.is_short) return false;
    if (category !== "All" && category !== "Shorts" && v.category !== category) return false;
    if (channel && (v.channel_handle || v.channel_name) !== channel) return false;
    if (q) {
      const hay = `${v.title} ${v.channel_name || ""} ${v.category || ""} ${v.description || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const sorted = rail === "history" ? [...list] : [...list].sort((a, b) => {
    if (sort === "views") return (b.views || 0) - (a.views || 0);
    if (sort === "likes") return (b.likes || 0) - (a.likes || 0);
    return (b.created_date || "").localeCompare(a.created_date || "");
  });

  const shortResults = sorted.filter((v) => v.is_short);
  const longVideos = sorted.filter((v) => !v.is_short);
  const matchedChannels = searching
    ? channels.filter((c) => `${c.name} ${c.handle}`.toLowerCase().includes(q)).slice(0, 6)
    : [];

  const resetFilters = () => { setType("all"); setSort("new"); setCategory("All"); setChannel(""); setQuery(""); };

  const shortsGrid = (items) => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((s, i) => (
        <button key={s.id} onClick={() => setShortsAt(i)} className="group text-left">
          <div className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-white/[0.1] bg-black shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_26px_50px_-34px_rgba(0,0,0,0.95)] transition-all duration-300 group-hover:border-white/30">
            <VideoThumb video={s} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/25" />
            <span className="absolute left-2 top-2 rounded-full border border-white/20 bg-black/45 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] backdrop-blur">Short</span>
            <div className="absolute inset-x-2 bottom-2">
              <p className="line-clamp-2 text-[12px] font-semibold leading-snug">{s.title}</p>
              <p className="mt-1 text-[10px] text-white/55">{fmtViews(s.views)} views</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="relative min-h-screen w-full bg-[#07060f] pb-28 sm:pb-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[440px] bg-[radial-gradient(75%_100%_at_50%_0%,rgba(126,86,255,0.24),transparent_72%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[200px] bg-gradient-to-b from-white/[0.07] to-transparent" />

      <div className="relative">
        {/* top bar */}
        <header className="sticky top-2 z-30 mx-2 mt-2 flex items-center gap-2 rounded-2xl border border-white/[0.1] bg-[#0b0818]/72 px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_24px_60px_-34px_rgba(0,0,0,0.95)] backdrop-blur-2xl sm:mx-4">
          <button onClick={() => { setRail("home"); resetFilters(); }} className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-white/[0.1]"><Menu className="h-5 w-5" /></button>
          <div className="hidden shrink-0 items-center gap-1 sm:flex">
            <span className="grid h-7 w-7 place-items-center rounded-[9px] brand-grad shadow-[0_10px_22px_-10px_rgba(168,85,247,0.95)]"><Play className="h-3 w-3 fill-black text-black" /></span>
            <span className="text-[15.5px] font-bold tracking-[-0.01em]">Valo <span className="font-medium text-white/40">Video</span></span>
          </div>
          <div className="mx-auto flex max-w-[640px] flex-1 items-center gap-2">
            <div className="flex flex-1 items-center rounded-full border border-white/[0.12] bg-white/[0.06] px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors focus-within:border-white/35 focus-within:bg-white/[0.1]">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder-white/40" />
              {query && <button onClick={() => setQuery("")}><X className="h-4 w-4 text-white/45 hover:text-white" /></button>}
            </div>
            <button className="hidden h-9 w-10 shrink-0 place-items-center rounded-full bg-white/[0.08] hover:bg-white/[0.15] sm:grid" title="Search"><Search className="h-4 w-4" /></button>
            <button className="hidden h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.08] text-white/70 hover:bg-white/[0.15] md:grid" title="Voice search"><Mic className="h-4 w-4" /></button>
          </div>
          <button onClick={() => setUploadOpen(true)} className="hidden shrink-0 items-center gap-1.5 rounded-full brand-grad px-3.5 py-2 text-[12.5px] font-bold text-black shadow-[0_10px_24px_-12px_rgba(168,85,247,0.9)] sm:flex"><Upload className="h-4 w-4" /> Create</button>
          <button title="Notifications" className="hidden h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-white/[0.1] sm:grid"><Bell className="h-[18px] w-[18px]" /></button>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-700">
            {user?.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : <User className="h-4 w-4" />}
          </div>
        </header>

        <div className="flex gap-4 px-2 sm:px-4 pt-3">
          {/* left rail */}
          <aside className="sticky top-[86px] hidden h-[calc(100vh-110px)] w-[212px] shrink-0 flex-col gap-0.5 self-start overflow-y-auto rounded-2xl border border-white/[0.08] bg-white/[0.028] p-2 backdrop-blur-xl scrollbar-none lg:flex">
            {RAIL.map((r) => (
              <button key={r.key} onClick={() => { setRail(r.key); setCategory("All"); setType("all"); setChannel(""); }} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] transition-colors ${rail === r.key ? "border border-white/15 bg-white/[0.1] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]" : "font-medium text-white/65 hover:bg-white/[0.05] hover:text-white"}`}>
                <r.icon className="w-4 h-4" /> {r.label}
              </button>
            ))}
            <div className="border-t border-white/10 my-2" />
            <p className="px-3 text-[10px] uppercase tracking-widest text-neutral-500">Categories</p>
            {CATEGORIES.filter((c) => !["All", "Shorts"].includes(c)).map((c) => (
              <button key={c} onClick={() => { setCategory(c); setRail("home"); }} className={`px-3 py-1.5 rounded-xl text-left text-[13px] transition-colors ${category === c ? "bg-white/[0.1] font-semibold text-white" : "text-white/60 hover:bg-white/[0.05]"}`}>{c}</button>
            ))}
            {channels.length > 0 && (
              <>
                <div className="border-t border-white/10 my-2" />
                <p className="px-3 text-[10px] uppercase tracking-widest text-neutral-500">Channels</p>
                {channels.slice(0, 8).map((c) => (
                  <button key={c.handle} onClick={() => { setRail("home"); setChannel(c.handle); }} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm text-neutral-300 hover:bg-white/5 text-left">
                    <img src={c.avatar || `https://i.pravatar.cc/40?u=${c.handle}`} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </>
            )}
          </aside>

          <div className="flex-1 min-w-0">
            {/* chips */}
            {rail !== "live" && rail !== "studio" && (
              <div className="sticky top-[84px] z-20 -mx-1 flex gap-2 overflow-x-auto px-1 pb-3 pt-2 scrollbar-none">
                {CATEGORIES.map((c) => (
                  <button key={c} onClick={() => { setCategory(c); setRail(c === "Shorts" ? "shorts" : "home"); }} className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12.5px] transition-colors ${category === c ? "border border-white/20 bg-white/[0.14] font-semibold text-white" : "border border-white/[0.08] bg-white/[0.04] font-medium text-white/65 hover:bg-white/[0.09] hover:text-white"}`}>{c}</button>
                ))}
              </div>
            )}

            {rail === "studio" ? (
              <CreatorStudioSection
                videos={videos}
                myHandle={myHandle}
                onUpload={() => setUploadOpen(true)}
                onGoLive={() => setLiveOpen(true)}
                onOpen={openWatch}
              />
            ) : rail === "live" ? (
              <LiveSection streams={streams} onOpen={openStream} onGoLive={() => setLiveOpen(true)} />
            ) : loading ? (
              <div className="py-16 text-center text-neutral-500 flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading videos…</div>
            ) : (
              <>
                {searching && (
                  <>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <p className="text-sm font-semibold">Results for <span className="text-fuchsia-300">“{query.trim()}”</span></p>
                      {matchedChannels.length > 0 && (
                        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                          {matchedChannels.map((c) => (
                            <button key={c.handle} onClick={() => setChannel(c.handle)} className="shrink-0 flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 hover:bg-white/10">
                              <img src={c.avatar || `https://i.pravatar.cc/32?u=${c.handle}`} alt="" className="w-5 h-5 rounded-full object-cover" />
                              <span className="text-[11px] font-semibold">{c.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <SearchFilters
                      count={sorted.length}
                      type={type}
                      onType={setType}
                      sort={sort}
                      onSort={setSort}
                      category={category}
                      onCategory={setCategory}
                      categories={CATEGORIES}
                      channel={channel}
                      onChannel={setChannel}
                      channels={channels}
                      onClear={resetFilters}
                    />
                  </>
                )}

                {sorted.length === 0 ? (
                  <div className="py-20 flex flex-col items-center text-center">
                    <span className="mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-white/[0.1] bg-white/[0.04]"><Youtube className="h-8 w-8" style={{ color: "var(--brand)" }} /></span>
                    <h2 className="text-lg font-bold">
                      {searching ? "No matches" : rail === "history" ? "Nothing watched yet" : rail === "liked" ? "No liked videos yet" : rail === "mine" ? "Nothing uploaded yet" : "No videos yet"}
                    </h2>
                    <p className="text-sm text-neutral-400 mt-1 max-w-sm">
                      {searching ? "Try fewer words, another channel, or clear your filters."
                        : rail === "history" ? "Videos you open show up here so you can pick up where you left off."
                        : rail === "liked" ? "Tap the like button on any video and it lands here."
                        : rail === "mine" ? "Upload a video or a short and it appears in your channel."
                        : "Your tube is empty. Publish the first video and it appears right here."}
                    </p>
                    {searching ? (
                      <button onClick={resetFilters} className="mt-4 px-4 py-2 rounded-full bg-white/10 text-sm font-semibold hover:bg-white/15">Clear filters</button>
                    ) : (
                      <button onClick={() => setUploadOpen(true)} className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-sm font-semibold"><Plus className="w-4 h-4" /> Upload a video</button>
                    )}
                  </div>
                ) : shortsMode ? (
                  shortsGrid(shortResults.length ? shortResults : sorted)
                ) : (
                  <>
                    {!searching && rail === "home" && longVideos[0] && (
                      <button
                        onClick={() => openWatch(longVideos[0])}
                        className="group relative mb-6 block w-full overflow-hidden rounded-3xl border border-white/[0.12] text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_50px_100px_-55px_rgba(0,0,0,1)]"
                      >
                        <div className="aspect-[16/7] w-full">
                          <VideoThumb video={longVideos[0]} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                        </div>
                        <span className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/25 to-transparent" />
                        <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.2em] backdrop-blur">Featured</span>
                          <h2 className="mt-2 max-w-xl text-lg font-bold leading-tight tracking-[-0.015em] sm:text-2xl">{longVideos[0].title}</h2>
                          <p className="mt-1 text-[12px] text-white/55">{longVideos[0].channel_name} · {fmtViews(longVideos[0].views)} views</p>
                        </div>
                        <span className="absolute bottom-4 right-4 grid h-12 w-12 place-items-center rounded-full bg-white text-black shadow-xl transition-transform group-hover:scale-105 sm:bottom-6 sm:right-6">
                          <Play className="h-5 w-5 fill-black" />
                        </span>
                      </button>
                    )}

                    {shortResults.length > 0 && (
                      <ShortsShelf
                        shorts={shortResults}
                        title={searching ? `Shorts for “${query.trim()}”` : "Shorts"}
                        onOpen={(i) => setShortsAt(i)}
                      />
                    )}
                    {longVideos.length > 0 && (
                      <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                        {longVideos.map((v) => <XsiVideoCard key={v.id} video={v} onOpen={openWatch} />)}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {watch && (
        <WatchView
          video={watch}
          list={videos}
          onClose={() => setWatch(null)}
          onSelect={openWatch}
          onLike={like}
          liked={!!liked[watch.id]}
          onPopOut={popOut}
        />
      )}

      {shortsAt !== null && (
        <ShortsPlayer
          shorts={shortResults.length ? shortResults : sorted}
          index={shortsAt}
          onIndex={setShortsAt}
          onClose={() => setShortsAt(null)}
          onLike={like}
          liked={!!liked[(shortResults[shortsAt] || sorted[shortsAt])?.id]}
        />
      )}

      <VideoUploadDialog
        open={uploadOpen}
        user={user}
        onClose={() => setUploadOpen(false)}
        onPublished={(created) => {
          setUploadOpen(false);
          setRail("mine");
          setCategory("All");
          setType("all");
          setChannel("");
          setQuery("");
          load();
          if (created) openWatch(created);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* go live */}
      {liveOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4" onClick={() => setLiveOpen(false)}>
          <div className="w-full max-w-md rounded-3xl panel p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><Radio className="w-4 h-4 text-red-500" /> Go live</h2>
              <button onClick={() => setLiveOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <input value={liveForm.title} onChange={(e) => setLiveForm({ ...liveForm, title: e.target.value })} placeholder="Stream title" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 outline-none focus:border-red-500 text-sm" />
              <input value={liveForm.url} onChange={(e) => setLiveForm({ ...liveForm, url: e.target.value })} placeholder="YouTube live link or video ID" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 outline-none focus:border-red-500 text-sm" />
              <select value={liveForm.category} onChange={(e) => setLiveForm({ ...liveForm, category: e.target.value })} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 outline-none text-sm">
                {LIVE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <textarea value={liveForm.description} onChange={(e) => setLiveForm({ ...liveForm, description: e.target.value })} rows={3} placeholder="Tell viewers what you're streaming" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 outline-none focus:border-red-500 text-sm" />
            </div>
            <button onClick={goLive} disabled={!liveForm.title.trim()} className="mt-4 w-full py-2.5 rounded-full bg-red-600 font-semibold text-sm disabled:opacity-40">Start live stream</button>
          </div>
        </div>
      )}
    </div>
  );
}