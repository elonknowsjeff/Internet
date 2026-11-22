import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PenSquare, Palette } from "lucide-react";
import ZIcon from "@/components/ZIcon";
import UniversalSearch from "@/components/home/UniversalSearch";
import ThemeSheet from "@/components/shell/ThemeSheet";

export default function FeedTopBar() {
  const [themesOpen, setThemesOpen] = useState(false);
  return (
    <>
      <header className="sticky top-2 z-40 mx-auto flex h-14 w-full max-w-[1180px] items-center gap-2 rounded-[18px] border border-white/[0.08] bg-[var(--bg-base)]/72 px-3 shadow-[0_10px_40px_-22px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:top-3">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <ZIcon size={28} />
          <span className="hidden font-display text-[17px] font-extrabold tracking-tight ig-text sm:inline">
            Internet <span style={{ color: "var(--accent)" }}>X</span>
          </span>
        </Link>

        <div className="mx-1 hidden min-w-0 flex-1 sm:block">
          <UniversalSearch />
        </div>

        <button
          onClick={() => setThemesOpen(true)}
          aria-label="Themes"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.1]"
        >
          <Palette className="h-[18px] w-[18px]" />
        </button>

        <Link
          to="/upload"
          className="flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-bold text-black transition-transform active:scale-95"
          style={{ background: "var(--brand)" }}
        >
          <PenSquare className="h-4 w-4" /> <span className="hidden sm:inline">Post</span>
        </Link>
      </header>
      <ThemeSheet open={themesOpen} onClose={() => setThemesOpen(false)} />
    </>
  );
}