import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Loader2, User, UserMinus } from "lucide-react";

export default function Follows() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("following");
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [out, back] = await Promise.all([
          base44.entities.Follow.filter({ follower_id: u.id }),
          base44.entities.Follow.filter({ following_id: u.id }),
        ]);
        setFollowing(out);
        setFollowers(back);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const unfollow = async (f) => {
    setBusyId(f.id);
    try { await base44.entities.Follow.delete(f.id); setFollowing((arr) => arr.filter((x) => x.id !== f.id)); } catch {}
    setBusyId(null);
  };

  if (loading) return <div className="py-24 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-white/50" /></div>;
  if (!user) return <div className="py-24 text-center text-white/50">Sign in to see your follows.</div>;

  const list = tab === "following" ? following : followers;

  const Row = ({ f }) => {
    const isFollowing = tab === "following";
    const name = isFollowing ? f.following_name : f.follower_name;
    const handle = isFollowing ? f.following_handle : f.follower_handle;
    const avatar = isFollowing ? f.following_avatar : undefined;
    return (
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
        <div className="w-11 h-11 rounded-full overflow-hidden bg-white/10 grid place-items-center shrink-0">
          {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-white/50" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{name || "User"}</p>
          {handle && <p className="text-[12px] ig-muted truncate">@{handle}</p>}
        </div>
        {isFollowing && (
          <button
            onClick={() => unfollow(f)}
            disabled={busyId === f.id}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border border-white/15 text-white/70 hover:bg-white/10 disabled:opacity-40"
          >
            <UserMinus className="w-3.5 h-3.5" /> Unfollow
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-lg mx-auto pb-28">
      <header className="sticky top-0 z-20 flex items-center gap-3 px-3 py-2 ig-panel border-b border-white/10">
        <Link to="/profile" className="w-9 h-9 rounded-full hover:bg-white/10 grid place-items-center"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-base font-bold">Follows</h1>
      </header>
      <div className="flex border-b border-white/10">
        {[["following", `Following ${following.length}`], ["followers", `Followers ${followers.length}`]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex-1 py-3 text-sm relative ${tab === k ? "font-bold" : "ig-muted"}`}>
            {l}
            {tab === k && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full" style={{ background: "var(--brand)" }} />}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="text-sm ig-muted py-16 text-center">{tab === "following" ? "You're not following anyone yet." : "No followers yet."}</p>
      ) : list.map((f) => <Row key={f.id} f={f} />)}
    </div>
  );
}