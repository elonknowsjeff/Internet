import React from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Sparkles, BarChart3, Upload, Loader2 } from "lucide-react";

export default function CreatorCard({ user, creator, busy, onEnable }) {
  if (!user) return null;

  if (!creator) {
    return (
      <div className="mx-3 mt-3 overflow-hidden rounded-2xl border border-[var(--brand)]/25 bg-gradient-to-r from-[var(--brand)]/20 via-[var(--brand)]/10 to-transparent p-3.5">
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 rounded-xl bg-white/15 grid place-items-center shrink-0">
            <Sparkles className="w-[18px] h-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-bold leading-tight">Become a creator</p>
            <p className="text-[11.5px] text-white/55 mt-0.5">
              Get a verified creator badge on your posts, plus studio analytics and upload tools.
            </p>
          </div>
          <button
            onClick={onEnable}
            disabled={busy}
            className="shrink-0 px-3 h-8 rounded-full bg-white text-black text-[12px] font-bold flex items-center gap-1.5 disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BadgeCheck className="w-3.5 h-3.5" />}
            {busy ? "Setting up" : "Turn on"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-3 mt-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2">
      <BadgeCheck className="w-4 h-4 text-[var(--brand)] shrink-0" />
      <p className="text-[12px] font-semibold shrink-0">Creator mode</p>
      <span className="text-[11px] text-white/40 truncate">your posts carry the badge</span>
      <div className="ml-auto flex items-center gap-1 shrink-0">
        <Link to="/studio" className="w-7 h-7 rounded-full grid place-items-center text-white/70 hover:bg-white/10" title="Creator Studio">
          <BarChart3 className="w-4 h-4" />
        </Link>
        <Link to="/video" className="w-7 h-7 rounded-full grid place-items-center text-white/70 hover:bg-white/10" title="Upload content">
          <Upload className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}