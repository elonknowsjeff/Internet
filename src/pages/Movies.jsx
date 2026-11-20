import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Search, Sparkles, X, Volume2, Info, Film, Play, Upload } from "lucide-react";
import NetflixRow from "@/components/movies/NetflixRow";
import Billboard from "@/components/movies/Billboard";
import AiMovieStudio from "@/components/movies/AiMovieStudio";
import UploadMovieDialog from "@/components/movies/UploadMovieDialog";

const TABS = ["Home", "Movies", "TV shows", "Bollywood", "Kids"];
const CATALOG_KEY = "walza_movie_catalog_v3";
const LIST_KEY = "walza_my_list";

const seedMovies = [
  { title: "Nebula Drift", genre: "Sci-Fi", poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400", release_date: "2026-12-18", synopsis: "A lone navigator charts the edge of a dying galaxy in search of a second Earth." },
  { title: "The Last Letter", genre: "Drama", poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400", release_date: "2026-11-05", synopsis: "Two strangers exchange letters across decades without ever meeting." },
  { title: "Iron Coast", genre: "Action", poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400", release_date: "2027-01-22", synopsis: "A retired diver is pulled back for one last heist beneath the city." },
  { title: "Whisperwood", genre: "Horror", poster: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400", release_date: "2026-10-31", synopsis: "The forest remembers everyone who enters — and none who leave." },
  { title: "Golden Hour", genre: "Romance", poster: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400", release_date: "2027-02-14", synopsis: "A photographer and a baker share one perfect summer in Lisbon." },
  { title: "Protocol Zero", genre: "Thriller", poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400", release_date: "2026-12-25", synopsis: "An analyst uncovers a conspiracy buried in the code she wrote." },
];

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Home");
  const [q, setQ] = useState("");
  const [trailer, setTrailer] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [cache, setCache] = useState({});
  const [aiOpen, setAiOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [player, setPlayer] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [myList, setMyList] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LIST_KEY) || "[]"); } catch { return []; }
  });

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const loadMovies = async () => {
    try {
      const data = await base44.entities.Movie.list("-created_date", 300);
      if (data.length === 0) {
        await base44.entities.Movie.bulkCreate(seedMovies);
        setMovies(await base44.entities.Movie.list("-created_date", 300));
      } else setMovies(data);
    } catch (e) {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadMovies();
    try {
      const raw = localStorage.getItem(CATALOG_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (Date.now() - saved.ts < 86400000 && saved.movies?.length > 20) { setCatalog(saved.movies); return; }
      }
    } catch (e) {}
    (async () => {
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: "Return 60 real movies: the biggest Hollywood, Bollywood and international releases from 2024 through 2027, plus the most popular classics of all time. Include at least 12 Bollywood titles and at least 8 international titles (Korean, Spanish, Japanese, French). Avoid duplicates. For each: title, genre, release_date (YYYY-MM-DD), a one-line synopsis, the language label ('Hollywood', 'Bollywood' or the country), and the official YouTube trailer video id (the 11-character id). Use live web context for real, current data.",
          add_context_from_internet: true, model: "gemini_3_flash",
          response_json_schema: { type: "object", properties: { movies: { type: "array", items: { type: "object", properties: { title: { type: "string" }, genre: { type: "string" }, release_date: { type: "string" }, synopsis: { type: "string" }, language: { type: "string" }, trailer: { type: "string" } } } } } },
        });
        const seen = new Set();
        const list = (res?.movies || []).filter((m) => {
          const t = (m.title || "").trim().toLowerCase();
          if (!t || seen.has(t)) return false;
          seen.add(t);
          return true;
        }).map((m) => {
          const id = (m.trailer || "").trim();
          const letters = (id.match(/[A-Za-z]/g) || []).length;
          const valid = /^[A-Za-z0-9_-]{11}$/.test(id) && letters >= 5;
          return {
            ...m,
            trailer: valid ? id : "",
            poster: valid
              ? `https://img.youtube.com/vi/${id}/hqdefault.jpg`
              : `https://placehold.co/400x600/241d45/d4d4d4?text=${encodeURIComponent(m.title || "Movie")}`,
          };
        });
        setCatalog(list);
        try { localStorage.setItem(CATALOG_KEY, JSON.stringify({ ts: Date.now(), movies: list })); } catch (e) {}
        try {
          const existing = new Set((await base44.entities.Movie.list("-created_date", 300)).map((x) => (x.title || "").toLowerCase()));
          const today = new Date().toISOString().slice(0, 10);
          const fresh = list.filter((m) => !existing.has((m.title || "").toLowerCase())).map((m) => ({
            title: m.title,
            genre: m.genre || "Drama",
            poster: m.poster,
            synopsis: m.synopsis || "",
            release_date: m.release_date || today,
            language: m.language || "Hollywood",
            trailer: m.trailer || "",
            status: (m.release_date || today) <= today ? "now_showing" : "coming_soon",
          }));
          if (fresh.length) await base44.entities.Movie.bulkCreate(fresh);
        } catch (e) {}
      } catch (e) {}
    })();
  }, []);

  const playTrailer = async (m) => {
    if (m.video_uri) { setPlayer(m); return; }
    const key = m.id || m.title;
    if (cache[key]) { setTrailer({ movie: m, youtubeId: cache[key] }); return; }
    if (m.trailer) { setCache((s) => ({ ...s, [key]: m.trailer })); setTrailer({ movie: m, youtubeId: m.trailer }); return; }
    setFetching(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Find the official YouTube trailer video id (11-character) for the movie "${m.title}" (${m.genre || ""}, releasing ${m.release_date || ""}). Use live web context.`,
        add_context_from_internet: true, model: "gemini_3_flash",
        response_json_schema: { type: "object", properties: { youtube_id: { type: "string" } } },
      });
      const id = res?.youtube_id || "";
      if (id) { setCache((s) => ({ ...s, [key]: id })); setTrailer({ movie: m, youtubeId: id }); }
    } catch (e) {}
    setFetching(false);
  };

  const toggleList = (m) => {
    setMyList((prev) => {
      const has = prev.some((x) => x.title === m.title);
      const next = has ? prev.filter((x) => x.title !== m.title) : [...prev, { title: m.title, genre: m.genre, poster: m.poster, trailer: m.trailer, release_date: m.release_date, language: m.language, synopsis: m.synopsis }];
      try { localStorage.setItem(LIST_KEY, JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const inList = (m) => myList.some((x) => x.title === (m?.title || ""));

  const results = q.trim() ? catalog.filter((m) => `${m.title} ${m.genre} ${m.language}`.toLowerCase().includes(q.toLowerCase())) : [];
  const aiFilms = movies.filter((m) => m.ai_generated);
  const community = movies.filter((m) => m.video_uri);

  let view = catalog;
  if (tab === "Bollywood") view = catalog.filter((m) => /bolly|hindi|india/i.test(m.language || ""));
  if (tab === "Kids") view = catalog.filter((m) => /animation|family|comedy|fantasy|kids|adventure/i.test(m.genre || ""));
  if (tab === "TV shows") view = catalog.filter((m) => /drama|thriller|crime|mystery|series/i.test(m.genre || ""));

  const today = new Date();
  const inTheatres = view.filter((m) => new Date(m.release_date) <= today);
  const upcoming = view.filter((m) => new Date(m.release_date) > today);
  const bollywood = view.filter((m) => /bolly|hindi|india/i.test(m.language || ""));
  const rest = view.filter((m) => !/bolly|hindi|india/i.test(m.language || ""));
  const featured = (q.trim() ? results[0] : inTheatres[0] || upcoming[0] || view[0]) || movies[0];

  return (
    <div className="bg-[#0a0814] min-h-screen pb-28">
      {/* netflix-style nav */}
      <header className={`sticky top-0 z-30 transition-colors duration-300 ${scrolled || q.trim() ? "bg-[#0a0814]/97 backdrop-blur-xl border-b border-white/10" : "bg-gradient-to-b from-black/85 to-transparent"}`}>
        <div className="flex items-center gap-3 px-3 sm:px-10 py-3">
          <span className="shrink-0 text-[14px] sm:text-[16px] font-black tracking-[0.3em] text-[#e50914]">Valo</span>
          <nav className="hidden md:flex items-center gap-4">
            {TABS.map((t) => (
              <button key={t} onClick={() => { setTab(t); setQ(""); }} className={`text-[13px] transition-colors ${tab === t ? "font-semibold text-white" : "text-neutral-400 hover:text-white"}`}>{t}</button>
            ))}
          </nav>
          <div className="flex-1" />
          <div className="flex items-center gap-2 bg-black/60 border border-white/15 rounded-full px-3 py-1.5 w-32 sm:w-56">
            <Search className="w-4 h-4 text-neutral-400 shrink-0" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles" className="flex-1 min-w-0 bg-transparent outline-none text-sm" />
            {q && <button onClick={() => setQ("")}><X className="w-3.5 h-3.5 text-neutral-400" /></button>}
          </div>
          <button onClick={() => setUploadOpen(true)} className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-[11px] font-bold hover:bg-white/[0.14]">
            <Upload className="h-3.5 w-3.5" /> <span className="hidden sm:block">Upload</span>
          </button>
          <button onClick={() => setAiOpen(true)} className="flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-3 py-1.5 text-[11px] font-bold text-black">
            <Sparkles className="h-3.5 w-3.5" /> <span className="hidden sm:block">AI Studio</span>
          </button>
        </div>
        <div className="md:hidden flex gap-3 overflow-x-auto scrollbar-none px-3 pb-2">
          {TABS.map((t) => (
            <button key={t} onClick={() => { setTab(t); setQ(""); }} className={`shrink-0 text-xs ${tab === t ? "font-semibold text-white" : "text-neutral-400"}`}>{t}</button>
          ))}
        </div>
      </header>

      {q.trim() ? (
        <div className="pt-4">
          <NetflixRow title={`Results for "${q}"`} items={results} onPlay={playTrailer} onAddList={toggleList} />
          {!results.length && <p className="px-10 py-16 text-neutral-500 text-sm">No titles match that search.</p>}
        </div>
      ) : (
        <>
          <Billboard movie={featured} onPlay={playTrailer} onAddList={toggleList} inList={inList(featured)} />

          <div className="relative z-10 -mt-16">
            <NetflixRow title={tab === "TV shows" ? "Trending series" : "Top 10 today"} items={view.slice(0, 10)} onPlay={playTrailer} ranked onAddList={toggleList} />
            {myList.length > 0 && <NetflixRow title="My List" items={myList} onPlay={playTrailer} onAddList={toggleList} />}
            <NetflixRow title="New releases" items={inTheatres} onPlay={playTrailer} onAddList={toggleList} />
            <NetflixRow title="Because you watched Nebula Drift" items={rest.filter((m) => /sci|action|thriller/i.test(m.genre || "")).slice(0, 14)} onPlay={playTrailer} onAddList={toggleList} />
            {bollywood.length > 0 && <NetflixRow title="Bollywood spotlight" items={bollywood} onPlay={playTrailer} onAddList={toggleList} />}
            <NetflixRow title="Coming soon" items={upcoming} onPlay={playTrailer} onAddList={toggleList} />
            <NetflixRow title="Award-winning dramas" items={rest.filter((m) => /drama|romance/i.test(m.genre || ""))} onPlay={playTrailer} onAddList={toggleList} />
            <NetflixRow title="AI movies · made with Valo" items={aiFilms} onPlay={playTrailer} onAddList={toggleList} />
            <NetflixRow title="Community uploads · every genre" items={community} onPlay={playTrailer} onAddList={toggleList} />

            {loading && <div className="flex items-center gap-2 text-neutral-400 text-sm px-10 py-6"><Loader2 className="w-4 h-4 animate-spin" /> Loading your library…</div>}

            <section className="mt-8 px-4 sm:px-10">
              <div className="flex items-baseline gap-2 mb-3">
                <h3 className="text-[15px] sm:text-xl font-bold tracking-tight">Web movies · all titles</h3>
                <span className="text-[11px] text-neutral-500">{view.length} movies</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2">
                {view.map((m, i) => (
                  <button key={`${m.title}-${i}`} onClick={() => playTrailer(m)} className="group text-left">
                    <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-neutral-900 ring-1 ring-white/5 group-hover:ring-white/40 transition-all">
                      {m.poster ? (
                        <img src={m.poster} alt={m.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Film className="w-6 h-6 text-neutral-600" /></div>
                      )}
                      <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-7 h-7 fill-white" />
                      </span>
                    </div>
                    <p className="text-[11px] font-medium mt-1 line-clamp-2 leading-tight text-neutral-300">{m.title}</p>
                  </button>
                ))}
              </div>
            </section>

            {!loading && !aiFilms.length && (
              <button onClick={() => setAiOpen(true)} className="mt-6 mx-4 sm:mx-10 w-[calc(100%-2rem)] sm:w-[calc(100%-5rem)] rounded-xl border border-dashed border-cyan-400/40 bg-cyan-400/5 p-5 text-left hover:bg-cyan-400/10">
                <p className="flex items-center gap-2 font-semibold text-sm"><Film className="w-4 h-4 text-cyan-300" /> No AI films yet</p>
                <p className="text-xs text-neutral-400 mt-1">Describe a movie and Valo writes it and paints the poster. Your films show up in the AI movies row.</p>
              </button>
            )}
          </div>
        </>
      )}

      {fetching && <div className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-cyan-400 text-black text-sm font-semibold flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Finding trailer…</div>}

      {trailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setTrailer(null)} />
          <div className="relative w-full max-w-3xl">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="font-semibold flex items-center gap-2"><Volume2 className="w-4 h-4 text-cyan-300" /> {trailer.movie.title} — Official Trailer</p>
              <button onClick={() => setTrailer(null)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/15 bg-black aspect-video">
              <iframe src={`https://www.youtube.com/embed/${trailer.youtubeId}?autoplay=1`} title={trailer.movie.title} className="w-full h-full" allow="autoplay; encrypted-media; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
            </div>
            <p className="text-xs text-neutral-400 mt-2 flex items-start gap-1.5"><Info className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {trailer.movie.synopsis}</p>
          </div>
        </div>
      )}

      {player && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/92 backdrop-blur-sm" onClick={() => setPlayer(null)} />
          <div className="relative w-full max-w-4xl">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="flex items-center gap-2 font-semibold"><Film className="h-4 w-4" style={{ color: "var(--brand)" }} /> {player.title}</p>
              <button onClick={() => setPlayer(null)} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20"><X className="h-4 w-4" /></button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-black">
              <video src={player.video_uri} controls autoPlay className="max-h-[78vh] w-full" />
            </div>
            <p className="mt-2 text-[11.5px] text-white/45">{player.genre}{player.uploader_name ? ` · uploaded by ${player.uploader_name}` : ""} — {player.synopsis}</p>
          </div>
        </div>
      )}

      <UploadMovieDialog open={uploadOpen} user={user} onClose={() => setUploadOpen(false)} onPublished={() => { setUploadOpen(false); loadMovies(); }} />

      {aiOpen && <AiMovieStudio onClose={() => setAiOpen(false)} onCreated={loadMovies} />}
    </div>
  );
}