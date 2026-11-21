import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PenSquare, Palette } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import UniversalSearch from "@/components/home/UniversalSearch";
import ThemeSheet from "@/components/shell/ThemeSheet";

export default function FeedTopBar() {
  const [themesOpen, setThemesOpen] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-white/[0.06] bg-[var(--bg-base)]/80 px-3 backdrop-blur-xl">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <BrandLogo size={30} />
          <span className="hidden font-display text-[18px] font-extrabold tracking-tight ig-text sm:inline">
            Internet <span style={{ color: "var(--accent)" }}>X</span>
          </span>
        </Link>

        <div className="mx-1 hidden min-w-0 flex-1 sm:block">
          <UniversalSearch />
        </div>

        <button
          onClick={() => setThemesOpen(true)}
          aria-label="Themes"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-white/10 sm:ml-0"
        >
          <Palette className="h-5 w-5" />
        </button>

        <Link
          to="/upload"
          className="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-bold text-black"
          style={{ background: "var(--brand)" }}
        >
          <PenSquare className="h-4 w-4" /> <span className="hidden sm:inline">Post</span>
        </Link>
      </header>
      <ThemeSheet open={themesOpen} onClose={() => setThemesOpen(false)} />
    </>
  );
}