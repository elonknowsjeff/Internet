import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Heart, Loader2, Pencil, Sparkles, UserPlus, Search, X, SlidersHorizontal, MapPin, ArrowRight, Flame, MessagesSquare, Users, Compass, UserCircle } from "lucide-react";
import ProfileCard from "@/components/dating/ProfileCard";
import ProfileForm from "@/components/dating/ProfileForm";
import DatingFilters from "@/components/dating/DatingFilters";
import SwipeDeck from "@/components/dating/SwipeDeck";
import MatchInbox from "@/components/dating/MatchInbox";
import StoriesBar from "@/components/StoriesBar";

const DEFAULT_FILTERS = { minAge: 18, maxAge: 70, maxDistance: 0, interests: [] };
const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);

const TABS = [
  { key: "discover", label: "Discover", icon: Compass },
  { key: "matches", label: "Matches", icon: Heart },
  { key: "people", label: "People", icon: Users },
  { key: "profile", label: "Profile", icon: UserCircle },
];

export default function Dating() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [sent, setSent] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [passed, setPassed] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [match, setMatch] = useState("");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [tab, setTab] = useState("discover");

  const load = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const [all, myLikes, theirLikes] = await Promise.all([
        base44.entities.DatingProfile.list("-created_date", 100),
        base44.entities.DatingLike.filter({ from_id: u.id }, { limit: 200 }),
        base44.entities.DatingLike.filter({ to_id: u.id }, { limit: 200 }),
      ]);
      setProfiles(asItems(all));
      setSent(asItems(myLikes));
      setIncoming(asItems(theirLikes));
    } catch (e) {
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const mine = useMemo(() => (user ? profiles.find((p) => p.created_by_id === user.id) : null), [profiles, user]);
  const likedIds = useMemo(() => new Set(sent.map((l) => l.to_id)), [sent]);
  const incomingIds = useMemo(() => new Set(incoming.map((l) => l.from_id)), [incoming]);

  const photosOf = (p) => [p?.photo, ...(p?.photos || [])].filter(Boolean);

  const matchesFilters = (p) => {
    const age = Number(p.age) || 0;
    if (age && (age < filters.minAge || age > filters.maxAge)) return false;
    if (filters.maxDistance && (Number(p.distance_km) || 0) > filters.maxDistance) return false;
    if (filters.interests.length) {
      const text = `${p.interests || ""} ${p.bio || ""}`.toLowerCase();
      if (!filters.interests.some((i) => text.includes(i.toLowerCase()))) return false;
    }
    return true;
  };

  const likedRef = useRef(likedIds);
  likedRef.current = likedIds;

  const deckList = useMemo(() => {
    const q = query.trim().toLowerCase();
    return profiles
      .filter((p) => p.created_by_id !== user?.id && !likedRef.current.has(p.created_by_id) && !passed.includes(p.id))
      .filter(matchesFilters)
      .filter((p) => !q || [p.display_name, p.location, p.bio, p.interests, p.looking_for].filter(Boolean).join(" ").toLowerCase().includes(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles, user, filters, query]);

  const matches = profiles.filter((p) => p.created_by_id !== user?.id && likedIds.has(p.created_by_id) && incomingIds.has(p.created_by_id));

  const trending = [...profiles]
    .filter((p) => p.created_by_id !== user?.id && photosOf(p).length > 0)
    .sort((a, b) => (photosOf(b).length - photosOf(a).length) || (b.created_date || "").localeCompare(a.created_date || ""))
    .slice(0, 10);

  const people = useMemo(() => {
    const q = query.trim().toLowerCase();
    return profiles
      .filter((p) => p.created_by_id !== user?.id)
      .filter(matchesFilters)
      .filter((p) => !q || [p.display_name, p.location, p.bio, p.interests, p.looking_for].filter(Boolean).join(" ").toLowerCase().includes(q))
      .slice(0, 12);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles, user, filters, query]);

  const like = async (p) => {
    if (!user) return;
    const rec = await base44.entities.DatingLike.create({
      from_id: user.id,
      from_name: mine?.display_name || user.full_name || "You",
      from_photo: mine?.photo || "",
      to_id: p.created_by_id,
      to_name: p.display_name,
    });
    setSent((prev) => [...prev, rec]);
    if (incomingIds.has(p.created_by_id)) setMatch(p.display_name);
  };

  const likeBack = (l) => like({ id: l.from_id, created_by_id: l.from_id, display_name: l.from_name, photo: l.from_photo });

  const save = async (data) => {
    if (mine) await base44.entities.DatingProfile.update(mine.id, data);
    else await base44.entities.DatingProfile.create(data);
    await load();
    setFormOpen(false);
  };

  const SearchBar = () => (
    <div className="flex flex-1 items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.05] px-3.5 py-2 transition-colors focus-within:border-white/25">
      <Search className="h-4 w-4 shrink-0 text-white/40" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search people, city or interests"
        className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder-white/35"
      />
      {query && <button onClick={() => setQuery("")} aria-label="Clear search"><X className="h-4 w-4 text-white/40" /></button>}
    </div>
  );

  const PeopleGrid = () => (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {people.map((p) => {
        const liked = likedIds.has(p.created_by_id);
        const pics = photosOf(p);
        return (
          <article key={p.id} className="group overflow-hidden rounded-[20px] border border-white/[0.09] bg-white/[0.035] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 18px 40px -30px rgba(0,0,0,1)" }}>
            <div className="relative aspect-[4/5] overflow-hidden bg-white/[0.05]">
              {pics[0] ? (
                <img src={pics[0]} alt={p.display_name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
              ) : (
                <div className="grid h-full w-full place-items-center text-4xl font-black text-white/20">{(p.display_name || "?")[0]?.toUpperCase()}</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
              <button onClick={() => !liked && like(p)} aria-label={liked ? "Liked" : `Like ${p.display_name}`} className={`absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full border backdrop-blur transition ${liked ? "border-rose-300/60 bg-rose-500/90 text-white" : "border-white/25 bg-black/35 text-white/85 hover:bg-rose-500/80"}`}>
                <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} />
              </button>
              <div className="absolute inset-x-2.5 bottom-2.5">
                <p className="truncate text-[13.5px] font-bold leading-tight">{p.display_name}{p.age ? <span className="font-normal text-white/70">, {p.age}</span> : null}</p>
                {p.location && <p className="flex items-center gap-1 truncate text-[10.5px] text-white/60"><MapPin className="h-2.5 w-2.5" /> {p.location}{p.distance_km ? ` · ${p.distance_km} km` : ""}</p>}
              </div>
            </div>
            <div className="p-2.5">
              {p.bio && <p className="line-clamp-2 text-[11px] leading-snug text-white/50">{p.bio}</p>}
              {(p.interests || "").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 2).length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {(p.interests || "").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 2).map((t) => (
                    <span key={t} className="rounded-full border border-white/[0.1] bg-white/[0.05] px-1.5 py-0.5 text-[9.5px] text-white/55">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-[1100px] px-3 sm:px-4 pb-28">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_320px]">

        {/* ---------- left sidebar ---------- */}
        <aside className="hidden lg:block">
          <div className="sticky top-3 space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ background: "var(--brand)" }}><Heart className="h-4 w-4 text-black" /></span>
              <h1 className="text-[20px] font-extrabold tracking-[-0.02em]">Dating</h1>
            </div>

            <nav className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
              {TABS.map((t) => {
                const Icon = t.icon;
                const on = tab === t.key;
                return (
                  <button key={t.key} onClick={() => setTab(t.key)} className={`flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors ${on ? "bg-white/[0.08]" : "hover:bg-white/[0.05]"}`}>
                    <Icon className={`h-4 w-4 ${on ? "text-[color:var(--brand)]" : "text-white/55"}`} />
                    <span className={`text-[13px] font-semibold ${on ? "text-white" : "text-white/65"}`}>{t.label}</span>
                    {t.key === "matches" && matches.length > 0 && <span className="ml-auto rounded-full bg-rose-500/90 px-1.5 text-[10px] font-bold text-white">{matches.length}</span>}
                    {on && t.key !== "matches" && <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: "var(--brand)" }} />}
                  </button>
                );
              })}
            </nav>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
              <button onClick={() => setFiltersOpen((v) => !v)} className={`flex w-full items-center gap-2 rounded-full px-3 py-2 text-[12px] font-semibold transition-colors ${filtersOpen ? "border border-white/30 bg-white/[0.14] text-white" : "border border-white/10 bg-white/[0.05] text-white/65 hover:bg-white/[0.1]"}`}>
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
              </button>
              {filtersOpen && <div className="mt-2"><DatingFilters filters={filters} setFilters={setFilters} onClose={() => setFiltersOpen(false)} /></div>}
              <Link to="/stories" className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-[12px] font-semibold text-white/65 hover:bg-white/[0.06]">
                <Sparkles className="h-3.5 w-3.5" /> Stories
              </Link>
            </div>
          </div>
        </aside>

        {/* ---------- center ---------- */}
        <div className="min-w-0">
          <header className="sticky top-0 z-30 mb-2 border-b border-white/[0.08] bg-[#06060a]/85 backdrop-blur-2xl">
            <div className="flex items-center gap-2 px-4 py-3">
              <span className="grid h-7 w-7 place-items-center rounded-[9px] lg:hidden" style={{ background: "var(--brand)" }}><Heart className="h-4 w-4 text-black" /></span>
              <h1 className="text-[16px] font-bold tracking-[-0.01em]">{TABS.find((t) => t.key === tab).label}</h1>
              <span className="ml-1 hidden rounded-full border border-white/[0.12] bg-white/[0.05] px-2 py-0.5 text-[10px] font-semibold text-white/50 sm:block">Real accounts only</span>
            </div>
            {/* mobile tab switcher + search */}
            <div className="flex gap-1 overflow-x-auto scrollbar-none px-3 pb-2 lg:hidden">
              {TABS.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)} className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold ${tab === t.key ? "brand-grad text-black" : "border border-white/10 text-white/55"}`}>
                  <t.icon className="h-3.5 w-3.5" /> {t.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 px-3 pb-2 lg:hidden"><SearchBar /></div>
          </header>

          {/* desktop search for people/discover */}
          {(tab === "discover" || tab === "people") && (
            <div className="mb-3 hidden items-center gap-2 lg:flex"><SearchBar /></div>
          )}

          {match && (
            <div className="mb-3 flex items-center gap-2 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-[12.5px]">
              <Sparkles className="h-4 w-4 text-rose-300" />
              <span><b className="text-rose-200">It's a match!</b> You and {match} liked each other.</span>
              <button onClick={() => setMatch("")} className="ml-auto text-[11px] text-white/50 hover:text-white">Dismiss</button>
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center text-[13px] text-white/40"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" /> Loading people…</div>
          ) : (
            <>
              {tab === "discover" && (
                <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                  {deckList.length === 0 ? (
                    <div className="py-10 text-center text-[12.5px] text-white/45">
                      <p className="font-semibold">No new profiles nearby</p>
                      <p className="mt-1">Widen your filters or check back later for new people.</p>
                    </div>
                  ) : (
                    <SwipeDeck key={`${JSON.stringify(filters)}|${query}`} profiles={deckList} onLike={like} onPass={(p) => setPassed((prev) => [...prev, p.id])} />
                  )}
                </div>
              )}

              {tab === "matches" && (
                <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                  <div className="border-b border-white/[0.06] px-4 py-2.5 text-[12px] font-semibold text-white/55">{matches.length} mutual · {incoming.length} likes you</div>
                  <MatchInbox matches={matches} incoming={incoming} onLikeBack={likeBack} onMessage={() => navigate("/messages")} />
                </div>
              )}

              {tab === "people" && (
                <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3">
                  {people.length === 0 ? (
                    <p className="py-10 text-center text-[12.5px] text-white/45">No profiles match your filters yet.</p>
                  ) : <PeopleGrid />}
                </div>
              )}

              {tab === "profile" && (
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-[14px] font-bold">My profile</h2>
                    <button onClick={() => setFormOpen(true)} className="flex items-center gap-1.5 rounded-full brand-grad px-3.5 py-1.5 text-[12px] font-bold text-black">
                      {mine ? <Pencil className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />} {mine ? "Edit" : "Create"}
                    </button>
                  </div>
                  {mine ? (
                    <div className="mx-auto max-w-[300px]"><ProfileCard profile={mine} onLike={() => {}} onPass={() => {}} /></div>
                  ) : (
                    <div className="py-8 text-center">
                      <UserPlus className="mx-auto mb-2 h-7 w-7" style={{ color: "var(--brand)" }} />
                      <p className="text-[12.5px] font-semibold">No dating profile yet</p>
                      <p className="mt-1 text-[11px] text-white/40">Add a name, a photo and a few interests to start matching.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ---------- right rail ---------- */}
        <aside className="hidden xl:block">
          <div className="sticky top-3 space-y-3">
            <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
              <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5">
                <Sparkles className="h-3.5 w-3.5 text-white/50" />
                <h3 className="text-[13px] font-bold">Stories</h3>
                <Link to="/stories" className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-white/45 hover:text-white">All <ArrowRight className="h-3 w-3" /></Link>
              </div>
              <StoriesBar user={user} />
            </section>

            {trending.length > 0 && (
              <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
                <h3 className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5 text-[13px] font-bold"><Flame className="h-3.5 w-3.5" style={{ color: "var(--brand)" }} /> Trending</h3>
                <div className="flex gap-2 overflow-x-auto p-3 scrollbar-none">
                  {trending.map((p) => (
                    <button key={p.id} onClick={() => like(p)} className="w-[88px] shrink-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] text-left hover:border-white/25">
                      <div className="aspect-[4/5] bg-white/[0.05]">{photosOf(p)[0] ? <img src={photosOf(p)[0]} alt={p.display_name} className="h-full w-full object-cover" /> : null}</div>
                      <div className="p-1.5">
                        <p className="truncate text-[11px] font-semibold">{p.display_name}{p.age ? `, ${p.age}` : ""}</p>
                        <p className="flex items-center gap-1 text-[9.5px] text-white/40"><Heart className="h-2.5 w-2.5" style={{ color: "var(--brand)" }} /> like</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
              <h3 className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5 text-[13px] font-bold"><MessagesSquare className="h-3.5 w-3.5 text-white/50" /> Matches</h3>
              <div className="p-2">
                <MatchInbox matches={matches} incoming={incoming} onLikeBack={likeBack} onMessage={() => navigate("/messages")} />
              </div>
            </section>
          </div>
        </aside>
      </div>

      {formOpen && <ProfileForm initial={mine || {}} onClose={() => setFormOpen(false)} onSave={save} />}
    </div>
  );
}