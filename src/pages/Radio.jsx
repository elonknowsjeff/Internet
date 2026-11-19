import React, { useState, useEffect, useMemo } from "react";
import { useAudio } from "@/components/AudioProvider";
import { Radio as RadioIcon, Play, Pause, Heart, Search, Loader2, Tag, X, RotateCcw, Volume2, Headphones, Mic, Signal } from "lucide-react";

const API = "https://de1.api.radio-browser.info/json";
const GENRES = ["All", "Pop", "Rock", "Rap", "Hip Hop", "Dance", "Electronic", "News", "Talk", "Podcast", "Jazz", "Classical", "Country", "Latin", "Reggae", "Ambient", "Metal", "Oldies", "World", "R&B"];

const FALLBACK = [
  { stationuuid: "f1", name: "SomaFM Groove Salad", url: "https://ice1.somafm.com/groovesalad-128-mp3", url_resolved: "https://ice1.somafm.com/groovesalad-128-mp3", favicon: "", country: "United States", countrycode: "US", language: "english", tags: "ambient downtempo electronic", codec: "MP3", bitrate: 128 },
  { stationuuid: "f2", name: "SomaFM Lush", url: "https://ice1.somafm.com/lush-128-mp3", url_resolved: "https://ice1.somafm.com/lush-128-mp3", favicon: "", country: "United States", countrycode: "US", language: "english", tags: "vocal ambient", codec: "MP3", bitrate: 128 },
  { stationuuid: "f3", name: "SomaFM Space Station", url: "https://ice1.somafm.com/spacestation-128-mp3", url_resolved: "https://ice1.somafm.com/spacestation-128-mp3", favicon: "", country: "United States", countrycode: "US", language: "english", tags: "ambient space electronic", codec: "MP3", bitrate: 128 },
  { stationuuid: "f4", name: "SomaFM Drone Zone", url: "https://ice1.somafm.com/dronezone-128-mp3", url_resolved: "https://ice1.somafm.com/dronezone-128-mp3", favicon: "", country: "United States", countrycode: "US", language: "english", tags: "ambient drone", codec: "MP3", bitrate: 128 },
  { stationuuid: "f5", name: "SomaFM Secret Agent", url: "https://ice1.somafm.com/secretagent-128-mp3", url_resolved: "https://ice1.somafm.com/secretagent-128-mp3", favicon: "", country: "United States", countrycode: "US", language: "english", tags: "lounge jazz", codec: "MP3", bitrate: 128 },
  { stationuuid: "f6", name: "SomaFM Indie Pop Rocks", url: "https://ice1.somafm.com/indiepoprock-128-mp3", url_resolved: "https://ice1.somafm.com/indiepoprock-128-mp3", favicon: "", country: "United States", countrycode: "US", language: "english", tags: "indie pop rock", codec: "MP3", bitrate: 128 },
  { stationuuid: "f7", name: "SomaFM Deep Space One", url: "https://ice1.somafm.com/deepspaceone-128-mp3", url_resolved: "https://ice1.somafm.com/deepspaceone-128-mp3", favicon: "", country: "United States", countrycode: "US", language: "english", tags: "ambient space", codec: "MP3", bitrate: 128 },
  { stationuuid: "f8", name: "SomaFM Sonic Universe", url: "https://ice1.somafm.com/sonicuniverse-128-mp3", url_resolved: "https://ice1.somafm.com/sonicuniverse-128-mp3", favicon: "", country: "United States", countrycode: "US", language: "english", tags: "jazz", codec: "MP3", bitrate: 128 },
  { stationuuid: "f9", name: "SomaFM Fluid", url: "https://ice1.somafm.com/fluid-128-mp3", url_resolved: "https://ice1.somafm.com/fluid-128-mp3", favicon: "", country: "United States", countrycode: "US", language: "english", tags: "drum and bass electronic", codec: "MP3", bitrate: 128 },
  { stationuuid: "f10", name: "SomaFM Groove Classic", url: "https://ice1.somafm.com/grooveclassics-128-mp3", url_resolved: "https://ice1.somafm.com/grooveclassics-128-mp3", favicon: "", country: "United States", countrycode: "US", language: "english", tags: "ambient", codec: "MP3", bitrate: 128 },
];

const flag = (cc) => cc ? String.fromCodePoint(...cc.toUpperCase().split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)) : "🌐";
const norm = (s) => (s || "").toString().toLowerCase();
const isTalk = (s) => /podcast|talk|news|speech|story/.test(norm(s.tags) + " " + norm(s.name));

const TINTS = [
  ["#6366F1", "#8B5CF6"],
  ["#22D3EE", "#3B82F6"],
  ["#FB7185", "#F472B6"],
  ["#F59E0B", "#F97316"],
  ["#14B8A6", "#22D3EE"],
  ["#A855F7", "#EC4899"],
];
const tintFor = (id) => {
  const sum = String(id || "").split("").reduce((n, c) => n + c.charCodeAt(0), 0);
  return TINTS[sum % TINTS.length];
};

const ROOMS = [
  { id: "all", label: "All stations", icon: RadioIcon },
  { id: "talk", label: "Talk & podcasts", icon: Mic },
  { id: "fav", label: "Favorites", icon: Heart },
];

export default function Radio() {
  const audio = useAudio();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [country, setCountry] = useState("All");
  const [language, setLanguage] = useState("All");
  const [favorites, setFavorites] = useState(() => { try { return JSON.parse(localStorage.getItem("walza_radio_fav") || "[]"); } catch { return []; } });
  const [room, setRoom] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/stations/topvote/800?hidebroken=true`);
        if (!res.ok) throw new Error();
        const j = await res.json();
        const clean = j.filter((s) => (s.url_resolved || s.url)).map((s) => ({ ...s, stream: s.url_resolved || s.url }));
        setStations(clean.length ? clean : FALLBACK);
      } catch (e) { setStations(FALLBACK); setError("Live directory unreachable — showing saved stations."); }
      finally { setLoading(false); }
    })();
  }, []);

  const current = audio?.current;
  const playing = audio?.playing;
  const onRadio = current?.kind === "radio";

  const play = (s) => {
    if (onRadio && current?.id === s.stationuuid) { audio.toggle(); return; }
    audio.play({ kind: "radio", id: s.stationuuid, src: s.stream, title: s.name, subtitle: `${flag(s.countrycode)} ${s.country} · ${s.codec}${s.bitrate ? ` ${s.bitrate}k` : ""}`, art: s.favicon || undefined });
  };

  const toggleFav = (id) => setFavorites((f) => { const next = f.includes(id) ? f.filter((n) => n !== id) : [...f, id]; localStorage.setItem("walza_radio_fav", JSON.stringify(next)); return next; });

  const countries = useMemo(() => ["All", ...new Set(stations.map((s) => s.country).filter(Boolean))].sort(), [stations]);
  const languages = useMemo(() => ["All", ...new Set(stations.flatMap((s) => (s.language || "").split(",").map((l) => l.trim()).filter(Boolean)))].sort(), [stations]);
  const currentStation = onRadio ? stations.find((s) => s.stationuuid === current?.id) : null;

  const filtered = useMemo(() => stations.filter((s) => {
    if (room === "fav" && !favorites.includes(s.stationuuid)) return false;
    if (room === "talk" && !isTalk(s)) return false;
    if (country !== "All" && s.country !== country) return false;
    if (language !== "All" && !(s.language || "").toLowerCase().split(",").map((l) => l.trim()).includes(language.toLowerCase())) return false;
    if (genre !== "All") { const tags = norm(s.tags) + " " + norm(s.name); const g = genre.toLowerCase(); const match = g === "podcast" ? tags.includes("podcast") || tags.includes("talk") : tags.includes(g); if (!match) return false; }
    if (query.trim()) { const q = query.toLowerCase(); if (!norm(s.name).includes(q) && !norm(s.tags).includes(q) && !norm(s.country).includes(q) && !norm(s.language).includes(q)) return false; }
    return true;
  }), [stations, query, genre, country, language, room, favorites]);

  const clearFilters = () => { setQuery(""); setGenre("All"); setCountry("All"); setLanguage("All"); setRoom("all"); };

  const art = current?.art;
  const tint = tintFor(current?.id || "radio");

  return (
    <div className="min-h-screen overflow-x-hidden pb-32 text-white sm:pb-10">
      <div className="mx-auto max-w-6xl px-4 pt-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">Walza Radio</p>
            <h1 className="mt-1 font-display text-[30px] font-extrabold leading-none tracking-[-0.03em] sm:text-[38px]">On air</h1>
            <p className="mt-1.5 text-[13px] text-white/45">{stations.length.toLocaleString()} stations · {filtered.length} in this room · streaming 24/7</p>
          </div>
          <div className="hidden items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.06] px-3 py-1.5 text-[11px] text-white/70 sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" /> Live
          </div>
        </div>

        {/* rooms */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {ROOMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setRoom(id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                room === id
                  ? "brand-grad text-black shadow-[0_10px_24px_-12px_rgba(168,85,247,0.9)]"
                  : "border border-white/[0.12] bg-white/[0.05] text-white/70 hover:bg-white/[0.1] hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-5 lg:grid lg:grid-cols-[340px_minmax(0,1fr)]">
          {/* on-air stage */}
          <aside className="panel h-fit min-w-0 overflow-hidden p-4 lg:sticky lg:top-4">
            <div className="relative -mx-4 -mt-4 mb-3 h-24 overflow-hidden">
              <div className="absolute inset-0 opacity-70" style={{ backgroundImage: `radial-gradient(120% 120% at 20% 0%, ${tint[0]}, transparent 65%), radial-gradient(100% 120% at 90% 10%, ${tint[1]}, transparent 60%)` }} />
              {art && <img src={art} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-xl" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0b0818] to-transparent" />
            </div>

            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
              <span className="flex items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${playing ? "animate-pulse bg-rose-400" : "bg-white/30"}`} /> On air</span>
              <span className="flex items-center gap-1"><Signal className="h-3 w-3" /> {onRadio ? "radio" : current ? "music" : "idle"}</span>
            </div>

            <div className="relative mt-3 aspect-square overflow-hidden rounded-[20px] border border-white/[0.14] bg-white/[0.04]">
              {art ? (
                <img src={art} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              ) : (
                <div className="grid h-full w-full place-items-center" style={{ backgroundImage: `linear-gradient(150deg, ${tint[0]}55, ${tint[1]}22)` }}>
                  <RadioIcon className="h-12 w-12 text-white/45" />
                </div>
              )}
              {playing && (
                <div className="absolute bottom-3 left-3 flex h-5 items-end gap-[3px]">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span key={i} className="w-[3px] animate-pulse rounded-full bg-white/90" style={{ height: `${6 + (i % 3) * 5}px`, animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              )}
            </div>

            <h2 className="mt-3 line-clamp-2 font-display text-[17px] font-bold leading-tight">{current?.title || "Pick a station"}</h2>
            <p className="mt-1 line-clamp-2 text-xs text-white/50">{current?.subtitle || "Choose any station to start listening"}</p>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => (current ? audio.toggle() : null)}
                disabled={!current}
                className="brand-grad flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-bold text-black disabled:opacity-40"
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), 0 14px 28px -16px rgba(168,85,247,0.95)" }}
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {playing ? "Pause" : "Play"}
              </button>
              {currentStation && (
                <button
                  onClick={() => toggleFav(currentStation.stationuuid)}
                  className={`grid h-11 w-11 place-items-center rounded-full border transition ${favorites.includes(currentStation.stationuuid) ? "border-rose-300/60 bg-rose-500/90 text-white" : "border-white/[0.14] bg-white/[0.05] text-white/70 hover:bg-white/[0.1]"}`}
                >
                  <Heart className="h-4 w-4" fill={favorites.includes(currentStation.stationuuid) ? "currentColor" : "none"} />
                </button>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2 text-white/50">
              <Volume2 className="h-4 w-4 shrink-0" />
              <input type="range" min={0} max={1} step={0.05} value={audio?.volume ?? 1} onChange={(e) => audio?.setVolume(+e.target.value)} className="flex-1 accent-[var(--brand)]" />
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-3 text-[11px] text-white/45">
              <span className="flex items-center gap-1.5"><Headphones className="h-3.5 w-3.5" /> {favorites.length} saved</span>
              <button onClick={() => setRoom("fav")} className="font-semibold text-[var(--brand)] hover:brightness-125">Open favorites</button>
            </div>
          </aside>

          {/* browse */}
          <section className="min-w-0 overflow-hidden">
            <div className="flex h-[46px] items-center gap-3 rounded-full border border-white/[0.12] bg-white/[0.05] px-4 backdrop-blur-xl focus-within:border-white/30">
              <Search className="h-4 w-4 text-white/45" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search stations, genres, countries…" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/35" />
              {query && <button onClick={() => setQuery("")} className="text-white/40 hover:text-white"><X className="h-4 w-4" /></button>}
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => setGenre(g)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] transition ${
                    genre === g
                      ? "brand-grad font-semibold text-black"
                      : "border border-white/[0.1] bg-white/[0.04] text-white/60 hover:bg-white/[0.09] hover:text-white"
                  }`}
                >
                  <Tag className="mr-1 inline h-2.5 w-2.5" />{g}
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select value={country} onChange={(e) => setCountry(e.target.value)} className="max-w-[45%] rounded-full border border-white/[0.12] bg-[#150f28] px-3 py-1.5 text-[11px] outline-none">
                {countries.map((c) => <option key={c} value={c}>{c === "All" ? "🌍 All countries" : c}</option>)}
              </select>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="max-w-[45%] rounded-full border border-white/[0.12] bg-[#150f28] px-3 py-1.5 text-[11px] outline-none">
                {languages.map((l) => <option key={l} value={l}>{l === "All" ? "🗣 All languages" : l}</option>)}
              </select>
              <button onClick={clearFilters} className="ml-auto flex items-center gap-1 rounded-full border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 text-[11px] text-white/70 hover:bg-white/[0.09] hover:text-white">
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            </div>

            {error && <p className="mt-3 text-[11px] text-amber-300">{error}</p>}

            {loading ? (
              <div className="p-16 text-center text-white/45"><Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" /> Loading stations…</div>
            ) : filtered.length === 0 ? (
              <div className="p-14 text-center text-sm text-white/45">
                {room === "fav" ? "No favorites yet — tap the heart on any station." : "No stations match. "}
                <button onClick={clearFilters} className="text-[var(--brand)] underline">Reset</button>
              </div>
            ) : (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {filtered.slice(0, 200).map((s) => {
                  const active = onRadio && current?.id === s.stationuuid;
                  const fav = favorites.includes(s.stationuuid);
                  const [a, b] = tintFor(s.stationuuid);
                  return (
                    <article
                      key={s.stationuuid}
                      className={`group flex items-center gap-3 rounded-[18px] border px-3 py-2.5 transition ${
                        active ? "border-[var(--brand)]/60 bg-[var(--brand)]/15" : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07]"
                      }`}
                    >
                      <button
                        onClick={() => play(s)}
                        aria-label={`Play ${s.name}`}
                        className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[12px] border border-white/25 text-white"
                        style={{ backgroundImage: `linear-gradient(160deg, ${a}, ${b})`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), 0 8px 16px -10px rgba(0,0,0,0.9)" }}
                      >
                        <span className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(120% 70% at 30% -10%, rgba(255,255,255,0.6), transparent 60%)" }} />
                        {active && playing ? <Pause className="relative h-4 w-4" /> : <Play className="relative h-4 w-4" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="flex min-w-0 items-center gap-1.5 truncate text-[13.5px] font-semibold">
                          {s.name} {active && playing && <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[var(--brand)]" />}
                        </p>
                        <p className="truncate text-[11px] text-white/45">{s.tags ? s.tags.split(",").slice(0, 3).join(" · ") : s.country}</p>
                      </div>
                      <div className="hidden shrink-0 items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-white/35 sm:flex">
                        <span className="rounded-full border border-white/[0.1] px-1.5 py-0.5">{flag(s.countrycode)} {s.countrycode}</span>
                      </div>
                      <button onClick={() => toggleFav(s.stationuuid)} aria-label="Favorite" className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${fav ? "text-rose-400" : "text-white/35 hover:text-rose-300"}`}>
                        <Heart className="h-4 w-4" fill={fav ? "currentColor" : "none"} />
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
            {!loading && filtered.length > 200 && <p className="pt-2 text-center text-[11px] text-white/40">{filtered.length - 200} more stations — narrow your search to see them.</p>}
          </section>
        </div>
      </div>
    </div>
  );
}