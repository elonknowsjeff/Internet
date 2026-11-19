import React from "react";
import { Trophy, Clock, Gamepad2, Star } from "lucide-react";

export default function AccountBar({ user, owned, hours, topGame }) {
  const name = user?.display_name || user?.full_name || "Player";
  const handle = user?.username || (user ? user.email?.split("@")[0] || "you" : "you");
  const level = Math.max(1, Math.floor((hours || 0) / 5) + owned);
  const avatar = user?.avatar;

  return (
    <div className="px-4 pt-4">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-[#1a1330] via-[#120e22] to-[#0c0a18] p-4">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-fuchsia-500/10 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center font-bold text-black text-lg shrink-0">
            {avatar ? <img src={avatar} alt="you" className="w-full h-full object-cover" /> : (name[0]?.toUpperCase() || "P")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate">{name}</p>
            <p className="text-xs text-neutral-400 truncate">@{handle}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 font-bold">LVL {level}</span>
              <span className="text-[10px] text-amber-400 flex items-center gap-0.5"><Star className="w-2.5 h-2.5 fill-amber-400" /> {(owned * 0.4 + (hours || 0) * 0.02).toFixed(1)} XP/match</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] uppercase tracking-widest text-neutral-500">Walza Wallet</p>
            <p className="font-bold text-emerald-400">$0.00</p>
          </div>
        </div>
        <div className="relative grid grid-cols-3 gap-2 mt-3">
          <div className="rounded-xl bg-black/40 border border-white/5 p-2 text-center">
            <Gamepad2 className="w-4 h-4 text-cyan-400 mx-auto" />
            <p className="text-sm font-bold mt-0.5">{owned}</p>
            <p className="text-[10px] text-neutral-500">Owned</p>
          </div>
          <div className="rounded-xl bg-black/40 border border-white/5 p-2 text-center">
            <Clock className="w-4 h-4 text-fuchsia-400 mx-auto" />
            <p className="text-sm font-bold mt-0.5">{(hours || 0).toFixed(1)}h</p>
            <p className="text-[10px] text-neutral-500">Played</p>
          </div>
          <div className="rounded-xl bg-black/40 border border-white/5 p-2 text-center">
            <Trophy className="w-4 h-4 text-amber-400 mx-auto" />
            <p className="text-sm font-bold mt-0.5 truncate">{topGame?.title || "—"}</p>
            <p className="text-[10px] text-neutral-500">Top game</p>
          </div>
        </div>
      </div>
    </div>
  );
}