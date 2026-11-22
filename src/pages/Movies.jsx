import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Search, Sparkles, X, Volume2, Info, Film, Play, Upload } from "lucide-react";
import NetflixRow from "@/components/movies/NetflixRow";
import Billboard from "@/components/movies/Billboard";
import AiMovieStudio from "@/components/movies/AiMovieStudio";
import UploadMovieDialog from "@/components/movies/UploadMovieDialog";
import BrandLogo from "@/components/BrandLogo";

const GENRES = [
  { key: "all", label: "All", re: /.*/ },
  { key: "horror", label: "Horror", re: /horror/ },
  { key: "drama", label: "Drama", re: /drama/ },
  { key: "thriller", label: "Thriller", re: /thriller|crime|mystery/ },
  { key: "comedy", label: "Comedy", re: /comedy/ },
  { key: "scifi", label: "Sci-Fi", re: /sci|fantasy|adventure/ },
  { key: "romance", label: "Romance", re: /romance/ },
  { key: "action", label: "Action", re: /action/ },
  { key: "doc", label: "Documentary", re: /documentary|history|biograph/ },
  { key: "ai", label: "AI Movies", re: null },
];

const CATALOG_KEY = "xsi_series_catalog_v1";
const LIST_KEY = "xsi_my_list";

const seedSeries = [
  { title: "Whisperwood", genre: "Horror", poster: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400", release_date: "2026-10-31", synopsis: "The forest remembers everyone who enters — and none who leave.", language: "Hollywood", trailer: "" },
  { title: "The Last Letter", genre: "Drama", poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400", release_date: "2026-11-05", synopsis: "Two strangers exchange letters across decades without ever meeting.", language: "Hollywood", trailer: "" },
  { title: "Protocol Zero", genre: "Thriller", poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400", release_date: "2026-12-25", synopsis: "An analyst uncovers a conspiracy buried in the code she wrote.", language: "Hollywood", trailer: "" },
];

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState("all");
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
        await base44.entities.Movie.bulkCreate(seedSeries);
        setMovies(await base44.entities.Movie.list("-created_date", 300));
      } else setMovies(data);
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => {
    loadMovies();
    try {
      const raw = localStorage.getItem(CATALOG_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (Date.now() - saved.ts < 86400000 && saved.series?.length > 20) { setCatalog(saved.series); return; }
      }
    } catch (e) {}
    (async () => {
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: "Return 70 real web series and shows across every genre: horror, drama, thriller, crime, comedy, sci-fi, fantasy, romance, action, documentary, K-drama, anime. Include a strong mix of genres so every genre has at least 5 titles. Avoid duplicates. For each: title, genre (one primary genre), release_date (YYYY-MM-DD), a one-line synopsis, the language/origin ('Hollywood', 'K-drama', 'Anime', 'Bollywood', etc.), and the official YouTube trailer video id (the 11-character id). Use live web context for real, current data.",
          add_context_from_internet: true, model: "gemini_3_flash",
          response_json_schema: { type: "object", properties: { series: { type: "array", items: { type: "object", properties: { title: { type: "string" }, genre: { type: "string" }, release_date: { type: "string" }, synopsis: { type: "string" }, language: { type: "string" }, trailer: { type: "string" } } } } } },
        });
        const seen = new Set();
        const list = (res?.series || []).filter((m) => {
          const t = (m.title || "").trim().toLowerCase();
          if (!t || seen.has(t)) return false;
          seen.add(t); return true;
        }).map((m) => {
          const id = (m.trailer || "").trim();
          const valid = /^[A-Za-z0-9_-]{11}$/.test(id) && (id.match(/[A-Za-z]/g) || []).length >= 5;
          return {
            ...m,
            trailer: valid ? id : "",
            poster: valid
              ? `https://img.youtube.com/vi/${id}/hqdefault.jpg`
              : `https://placehold.co/400x600/1a1530/d4d4d4?text=${encodeURIComponent(m.title || "Series")}`,
          };
        });
        setCatalog(list);
        try { localStorage.setItem(CATALOG_KEY, JSON.stringify({ ts: Date.now(), series: list })); } catch (e) {}
        try {
          const existing = new Set((await base44.entities.Movie.list("-created_date", 300)).map((x) => (x.title || "").toLowerCase()));
          const today = new Date().toISOString().slice(0, 10);
          const fresh = list.filter((m) => !existing.has((m.title || "").toLowerCase())).map((m) => ({
            title: m.title, genre: m.genre || "Drama", poster: m.poster, synopsis: m.synopsis || "",
            release_date: m.release_date || today, language: m.language || "Hollywood", trailer: m.trailer || "",
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
        prompt: `Find the official YouTube trailer video id (11-character) for "${m.title}" (${m.genre || ""}, ${m.release_date || ""}). Use live web context.`,
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

  const aiFilms = movies.filter((m) => m.ai_generated);
  const community = movies.filter((m) => m.video_uri);
  const results = q.trim() ? catalog.filter((m) => `${m.title} ${m.genre} ${m.language}`.toLowerCase().includes(q.toLowerCase())) : [];

  // Group catalog by genre into sliding rails
  const genreRails = GENRES.filter((g) => g.key !== "all" && g.key !== "ai" && g.re)
    .map((g) => ({ ...g, items: catalog.filter((m) => g.re.test((m.genre || "") + " " + (m.language || ""))) }))
    .filter((g) => g.items.length >= 2);

  const today = new Date();
  const newReleases = catalog.filter((m) => new Date(m.release_date) <= today);
  const featured = (q.trim() ? results[0] : newReleases[0] || catalog[0]) || movies[0];

  const showAi = genre === "ai";
  const singleGenre = genre !== "all" && genre !== "ai" ? GENRES.find((g) => g.key === genre) : null;

  return (
    <div className="bg-[#0a0814] min-h-screen pb-28">
      {/* Nav */}
      <header className={`sticky top-0 z-30 transition-colors duration-300 ${scrolled || q.trim() ? "bg-[#0a0814]/97 backdrop-blur-xl border-b border-white/10" : "bg-gradient-to-b from-black/85 to-transparent"}`}>
        <div className="flex items-center gap-3 px-3 sm:px-10 py-3">
          <span className="flex shrink-0 items-center gap-2">
            <BrandLogo size={26} />
            <span className="text-[13px] sm:text-[15px] font-black tracking-[0.22em]">SERIES</span>
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-2 bg-black/60 border border-white/15 rounded-full px-3 py-1.5 w-32 sm:w-56">
            <Search className="w-4 h-4 text-neutral-400 shrink-0" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search series" className="flex-1 min-w-0 bg-transparent outline-none text-sm" />
            {q && <button onClick={() => setQ("")}><X className="w-3.5 h-3.5 text-neutral-400" /></button>}
          </div>
          <button onClick={() => setUploadOpen(true)} className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-[11px] font-bold hover:bg-white/[0.14]">
            <Upload className="h-3.5 w-3.5" /> <span className="hidden sm:block">Upload</span>
          </button>
          <button onClick={() => setAiOpen(true)} className="flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-3 py-1.5 text-[11px] font-bold text-black">
            <Sparkles className="h-3.5 w-3.5" /> <span className="hidden sm:block">AI Movie</span>
          </button>
        </div>
        {/* Genre chips — sliding bar of every genre */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none px-3 sm:px-10 pb-2.5">
          {GENRES.map((g) => (
            <button
              key={g.key}
              onClick={() => { setGenre(g.key); setQ(""); }}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${genre === g.key ? "bg-white text-black" : "border border-white/15 text-white/65 hover:text-white hover:border-white/35"}`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </header>

      {q.trim() ? (
        <div className="pt-4">
          <NetflixRow title={`Results for "${q}"`} items={results} onPlay={playTrailer} onAddList={toggleList} />
          {!results.length && <p className="px-10 py-16 text-neutral-500 text-sm">No series match that search.</p>}
        </div>
      ) : showAi ? (
        <div className="relative z-10 pt-4">
          <Billboard movie={aiFilms[0] || featured} onPlay={playTrailer} onAddList={toggleList} inList={inList(aiFilms[0] || featured)} />
          <div className="-mt-16 relative z-10">
            <NetflixRow title="AI Movies · made with Internet X" items={aiFilms} onPlay={playTrailer} onAddList={toggleList} />
            <NetflixRow title="Community uploads" items={community} onPlay={playTrailer} onAddList={toggleList} />
            {!aiFilms.length && (
              <button onClick={() => setAiOpen(true)} className="mt-6 mx-4 sm:mx-10 w-[calc(100%-2rem)] sm:w-[calc(100%-5rem)] rounded-xl border border-dashed border-cyan-400/40 bg-cyan-400/5 p-5 text-left hover:bg-cyan-400/10">
                <p className="flex items-center gap-2 font-semibold text-sm"><Sparkles className="w-4 h-4 text-cyan-300" /> No AI movies yet</p>
                <p className="text-xs text-neutral-400 mt-1">Describe a movie and Internet X writes it and paints the poster. Your films show up here.</p>
              </button>
            )}
          </div>
        </div>
      ) : singleGenre ? (
        <div className="relative z-10 pt-4">
          <Billboard movie={(singleGenre.re.test((featured?.genre || "") + " ") ? featured : catalog.find((m) => singleGenre.re.test((m.genre || "") + " "))) || featured} onPlay={playTrailer} onAddList={toggleList} inList={false} />
          <div className="-mt-16 relative z-10">
            <NetflixRow title={`${singleGenre.label} series`} items={catalog.filter((m) => singleGenre.re.test((m.genre || "") + " " + (m.language || "")))} onPlay={playTrailer} onAddList={toggleList} />
            <NetflixRow title={`${singleGenre.label} · community`} items={community.filter((m) => singleGenre.re.test((m.genre || "") + " "))} onPlay={playTrailer} onAddList={toggleList} />
          </div>
        </div>
      ) : (
        <>
          <Billboard movie={featured} onPlay={playTrailer} onAddList={toggleList} inList={inList(featured)} />

          <div className="relative z-10 -mt-16 space-y-1">
            <NetflixRow title="Trending now" items={catalog.slice(0, 14)} onPlay={playTrailer} ranked onAddList={toggleList} />
            {myList.length > 0 && <NetflixRow title="My List" items={myList} onPlay={playTrailer} onAddList={toggleList} />}
            <NetflixRow title="New episodes" items={newReleases} onPlay={playTrailer} onAddList={toggleList} />

            {/* A sliding rail for every genre */}
            {genreRails.map((g) => (
              <NetflixRow key={g.key} title={`${g.label} series`} items={g.items} onPlay={playTrailer} onAddList={toggleList} />
            ))}

            <NetflixRow title="AI Movies · made with Internet X" items={aiFilms} onPlay={playTrailer} onAddList={toggleList} />
            <NetflixRow title="Community uploads · every genre" items={community} onPlay={playTrailer} onAddList={toggleList} />

            {loading && <div className="flex items-center gap-2 text-neutral-400 text-sm px-10 py-6"><Loader2 className="w-4 h-4 animate-spin" /> Loading series…</div>}

            {!loading && !aiFilms.length && (
              <button onClick={() => setAiOpen(true)} className="mt-6 mx-4 sm:mx-10 w-[calc(100%-2rem)] sm:w-[calc(100%-5rem)] rounded-xl border border-dashed border-cyan-400/40 bg-cyan-400/5 p-5 text-left hover:bg-cyan-400/10">
                <p className="flex items-center gap-2 font-semibold text-sm"><Sparkles className="w-4 h-4 text-cyan-300" /> No AI movies yet</p>
                <p className="text-xs text-neutral-400 mt-1">Describe a movie and Internet X writes it and paints the poster. Your films show up in the AI Movies rail.</p>
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