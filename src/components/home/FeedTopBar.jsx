import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PenSquare, Palette } from "lucide-react";
import ZIcon from "@/components/ZIcon";
import UniversalSearch from "@/components/home/UniversalSearch";
import ThemeSheet from "@/components/shell/ThemeSheet";

// Z social layer — pure pitch-black, #2F3336 borders, electric-blue accents.
export default function FeedTopBar() {
  const [themesOpen, setThemesOpen] = useState(false);
  return (
    <>
      <header
        className="sticky top-2 z-40 mx-auto flex h-14 w-full max-w-[640px] items-center gap-2 rounded-2xl px-3 sm:top-3"
        style={{ background: "#000000", border: "1px solid #2F3336", boxShadow: "0 10px 40px -22px rgba(0,0,0,0.9)" }}
      >
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <ZIcon size={28} />
          <span className="hidden font-display text-[18px] font-extrabold tracking-tight text-white sm:inline">Z</span>
        </Link>

        <div className="mx-1 hidden min-w-0 flex-1 sm:block">
          <UniversalSearch />
        </div>

        <button
          onClick={() => setThemesOpen(true)}
          aria-label="Themes"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors hover:bg-white/[0.06]"
          style={{ border: "1px solid #2F3336" }}
        >
          <Palette className="h-[18px] w-[18px] text-white" />
        </button>

        <Link
          to="/upload"
          className="flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold text-white transition-transform active:scale-95"
          style={{ background: "#1d9bf0" }}
        >
          <PenSquare className="h-4 w-4" /> <span className="hidden sm:inline">Post</span>
        </Link>
      </header>
      <ThemeSheet open={themesOpen} onClose={() => setThemesOpen(false)} />
    </>
  );
}