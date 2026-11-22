import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import WhoToFollow from "@/components/WhoToFollow";
import { handleOf, nameOf } from "@/lib/socialNames";

export default function HomeSidebar({ user }) {
  const [me, setMe] = useState(user);

  useEffect(() => {
    if (user) { setMe(user); return; }
    base44.auth.me().then(setMe).catch(() => {});
  }, [user]);

  if (!me) return null;

  const name = nameOf(me);
  const handle = handleOf(me);

  return (
    <aside className="hidden lg:flex flex-col gap-3 w-[300px] shrink-0 sticky top-[64px] self-start pb-6">
      <Link to="/profile" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 hover:bg-white/[0.07] transition-colors">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 to-fuchsia-500 grid place-items-center text-black font-bold shrink-0">
          {me.avatar ? <img src={me.avatar} alt="" className="w-full h-full object-cover" /> : (name[0] || "U").toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-bold truncate leading-tight">{name}</p>
          <p className="text-[12px] text-white/45 truncate leading-tight">@{handle}</p>
        </div>
      </Link>

      <WhoToFollow />
    </aside>
  );
}