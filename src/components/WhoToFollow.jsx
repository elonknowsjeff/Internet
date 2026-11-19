import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { UserPlus, Check, UserRound } from "lucide-react";

export default function WhoToFollow() {
  const [users, setUsers] = useState([]);
  const [follows, setFollows] = useState({}); // following_id -> follow record id
  const [me, setMe] = useState(null);

  const load = async () => {
    try {
      const u = await base44.auth.me();
      setMe(u);
      const [all, mine] = await Promise.all([
        base44.entities.User.list("-created_date", 30),
        u ? base44.entities.Follow.filter({ follower_id: u.id }) : Promise.resolve([]),
      ]);
      const map = {};
      for (const f of mine) map[f.following_id] = f.id;
      setFollows(map);
      setUsers(all.filter((x) => x.id !== u?.id && !map[x.id]).slice(0, 5));
    } catch (e) {}
  };

  useEffect(() => { load(); }, []);

  const follow = async (u) => {
    try {
      const rec = await base44.entities.Follow.create({
        follower_id: me.id,
        follower_handle: me.username || (me.email ? me.email.split("@")[0] : "you"),
        follower_name: me.display_name || me.full_name || "You",
        following_id: u.id,
        following_handle: u.username || (u.email ? u.email.split("@")[0] : "user"),
        following_name: u.display_name || u.full_name || u.email || "User",
        following_avatar: u.avatar || "",
      });
      setFollows((s) => ({ ...s, [u.id]: rec.id }));
      setUsers((list) => list.filter((x) => x.id !== u.id));
    } catch (e) {}
  };

  const unfollow = async (uid) => {
    try { await base44.entities.Follow.delete(follows[uid]); } catch (e) {}
    setFollows((s) => { const n = { ...s }; delete n[uid]; return n; });
  };

  if (users.length === 0) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
      <h3 className="px-4 pt-3 pb-1 text-[19px] font-extrabold flex items-center gap-2"><UserRound className="w-5 h-5 text-white/60" /> Who to follow</h3>
      {users.map((u) => {
        const name = u.display_name || u.full_name || (u.email ? u.email.split("@")[0] : "User");
        const handle = u.username || (u.email ? u.email.split("@")[0] : "user");
        return (
          <div key={u.id} className="flex items-center gap-2.5 px-4 py-3 hover:bg-white/[0.05]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-500 flex items-center justify-center text-black font-bold text-sm overflow-hidden shrink-0">
              {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : name[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold truncate leading-tight">{name}</p>
              <p className="text-[13px] text-white/45 truncate leading-tight">@{handle}</p>
            </div>
            {follows[u.id] ? (
              <button onClick={() => unfollow(u.id)} className="px-3.5 py-1.5 rounded-full text-[13px] font-bold border border-white/25 text-white hover:border-rose-400/60 hover:text-rose-300 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Following</button>
            ) : (
              <button onClick={() => follow(u)} className="px-3.5 py-1.5 rounded-full text-[13px] font-bold bg-white text-black hover:bg-white/90 flex items-center gap-1"><UserPlus className="w-3.5 h-3.5" /> Follow</button>
            )}
          </div>
        );
      })}
    </section>
  );
}