import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Heart, Loader2, Pencil, Sparkles, UserPlus } from "lucide-react";
import SwipeDeck from "@/components/dating/SwipeDeck";
import MatchInbox from "@/components/dating/MatchInbox";
import ProfileForm from "@/components/dating/ProfileForm";
import ProfileCard from "@/components/dating/ProfileCard";

const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);
const TABS = [
  { key: "discover", label: "Discover" },
  { key: "matches", label: "Matches" },
  { key: "profile", label: "Profile" },
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
    } catch { setProfiles([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const mine = useMemo(() => (user ? profiles.find((p) => p.created_by_id === user.id) : null), [profiles, user]);
  const likedIds = useMemo(() => new Set(sent.map((l) => l.to_id)), [sent]);
  const incomingIds = useMemo(() => new Set(incoming.map((l) => l.from_id)), [incoming]);
  const deck = useMemo(
    () => profiles.filter((p) => p.created_by_id !== user?.id && !likedIds.has(p.created_by_id) && !passed.includes(p.id)),
    [profiles, user, likedIds, passed]
  );
  const matches = profiles.filter((p) => p.created_by_id !== user?.id && likedIds.has(p.created_by_id) && incomingIds.has(p.created_by_id));

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
  const likeBack = (l) => like({ created_by_id: l.from_id, display_name: l.from_name, photo: l.from_photo });
  const save = async (data) => {
    if (mine) await base44.entities.DatingProfile.update(mine.id, data);
    else await base44.entities.DatingProfile.create(data);
    await load();
    setFormOpen(false);
  };

  return (
    <div className="mx-auto w-full max-w-[460px] px-4 pb-28">
      <header className="pt-5 pb-3 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-600 text-white shadow-[0_10px_26px_-10px_rose-500]">
          <Heart className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-[22px] font-extrabold tracking-tight leading-none">Dating</h1>
          <p className="text-[12px] text-white/45 mt-1">Swipe right to like, left to pass.</p>
        </div>
      </header>

      <div className="sticky top-3 z-20 mb-4 flex items-center gap-1 rounded-full border border-white/10 bg-[#0b0b0d]/85 backdrop-blur-xl p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[12.5px] font-bold transition ${tab === t.key ? "bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white" : "text-white/55 hover:text-white"}`}
          >
            {t.label}
            {t.key === "matches" && matches.length > 0 && (
              <span className="grid h-4 min-w-4 place-items-center rounded-full bg-white/25 px-1 text-[10px] font-bold text-white">{matches.length}</span>
            )}
          </button>
        ))}
      </div>

      {match && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3.5">
          <Sparkles className="h-5 w-5 shrink-0 text-rose-300" />
          <div className="flex-1">
            <p className="text-[13px] font-bold text-rose-200">It's a match!</p>
            <p className="text-[11.5px] text-white/60">You and {match} liked each other.</p>
          </div>
          <button onClick={() => navigate("/messages")} className="rounded-full bg-rose-500 px-3.5 py-1.5 text-[11.5px] font-bold text-white">Message</button>
          <button onClick={() => setMatch("")} className="text-white/40 hover:text-white text-[11px]">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-[13px] text-white/40"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" /> Loading people…</div>
      ) : tab === "discover" ? (
        <SwipeDeck profiles={deck} onLike={like} onPass={(p) => setPassed((prev) => [...prev, p.id])} />
      ) : tab === "matches" ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
          <p className="px-1 pb-2 text-[12px] text-white/50">{matches.length} mutual · {incoming.length} like you</p>
          <MatchInbox
            matches={matches}
            incoming={incoming}
            onLikeBack={likeBack}
            onMessage={(p) => (p?.created_by_id ? navigate(`/messages?u=${p.created_by_id}`) : navigate("/messages"))}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[14px] font-bold">My profile</h2>
            <button
              onClick={() => setFormOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-600 px-3.5 py-1.5 text-[12px] font-bold text-white"
            >
              {mine ? <Pencil className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />} {mine ? "Edit" : "Create"}
            </button>
          </div>
          {mine ? (
            <div className="max-w-[300px] mx-auto"><ProfileCard profile={mine} onLike={() => {}} onPass={() => {}} /></div>
          ) : (
            <div className="py-8 text-center">
              <UserPlus className="mx-auto mb-2 h-7 w-7" style={{ color: "var(--brand)" }} />
              <p className="text-[12.5px] font-semibold">No dating profile yet</p>
              <p className="mt-1 text-[11px] text-white/40">Add a name, a photo and a few interests to start matching.</p>
            </div>
          )}
        </div>
      )}

      {formOpen && <ProfileForm initial={mine || {}} onClose={() => setFormOpen(false)} onSave={save} />}
    </div>
  );
}