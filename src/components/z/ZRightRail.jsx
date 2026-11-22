import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp } from "lucide-react";
import WhoToFollow from "@/components/WhoToFollow";

export default function ZRightRail() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  return (
    <aside className="hidden xl:flex w-[330px] shrink-0 flex-col gap-3 sticky top-3 self-start pb-6">
      <form
        onSubmit={(e) => { e.preventDefault(); navigate(`/z/explore?q=${encodeURIComponent(q)}`); }}
        className="flex items-center gap-2 rounded-full border border-[#2f3336] bg-white/[0.04] px-4 py-2.5 focus-within:border-white/40"
      >
        <Search className="h-4 w-4 text-white/45" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search Z"
          className="flex-1 bg-transparent text-sm outline-none placeholder-white/40"
        />
      </form>

      <section className="rounded-2xl border border-[#2f3336] bg-white/[0.03] p-4">
        <h3 className="flex items-center gap-2 text-[17px] font-extrabold">
          <TrendingUp className="h-5 w-5 text-white/70" /> Trending now
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-white/55">
          Open <button onClick={() => navigate("/z/explore")} className="font-semibold text-white hover:underline">Explore</button> for live trending topics, news and the media grid.
        </p>
      </section>

      <WhoToFollow />
    </aside>
  );
}