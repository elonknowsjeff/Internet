import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Palette, Sparkles } from "lucide-react";
import ZIcon from "@/components/ZIcon";
import UniversalSearch from "@/components/home/UniversalSearch";
import ThemeSheet from "@/components/shell/ThemeSheet";

export default function FeedTopBar() {
  const [themesOpen, setThemesOpen] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 w-full items-center gap-3 border-b border-[#2F3336] bg-black/90 px-4 backdrop-blur-xl xl:hidden">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <ZIcon size={28} />
          <span className="text-xl font-black tracking-tighter text-white">Z</span>
        </Link>
        <div className="mx-1 min-w-0 flex-1">
          <UniversalSearch />
        </div>
        <button
          onClick={() => setThemesOpen(true)}
          aria-label="Themes"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white/60 hover:bg-white/[0.06] hover:text-white"
        >
          <Palette className="h-[18px] w-[18px]" />
        </button>
      </header>
      <ThemeSheet open={themesOpen} onClose={() => setThemesOpen(false)} />
    </>
  );
}