import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

export default function DatingPanel() {
  const navigate = useNavigate();
  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 py-4">
      <div className="relative overflow-hidden rounded-3xl border border-rose-400/20 bg-gradient-to-br from-rose-500/15 via-fuchsia-500/10 to-purple-500/10 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-rose-500/30 blur-3xl" />
        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-600 text-white shadow-[0_12px_30px_-12px_rose-500]">
            <Heart className="w-6 h-6" />
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-[18px] font-extrabold tracking-tight">Dating</h3>
            <p className="mt-0.5 text-[13px] text-white/55">Discover people nearby, match, and start a conversation.</p>
          </div>
          <button onClick={() => navigate("/dating")} className="rounded-full bg-rose-500 px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-rose-400">
            Open Dating
          </button>
        </div>
      </div>
    </section>
  );
}