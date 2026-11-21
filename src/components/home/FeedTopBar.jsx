import React from "react";
import { Link } from "react-router-dom";
import { Menu, PenSquare } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import UniversalSearch from "@/components/home/UniversalSearch";

export default function FeedTopBar({ onMenu }) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-white/[0.06] bg-[var(--bg-base)]/80 px-3 backdrop-blur-xl">
      <button
        onClick={onMenu}
        aria-label="Menu"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-white/10"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Link to="/" className="flex shrink-0 items-center gap-2">
        <BrandLogo size={30} />
        <span className="hidden font-display text-[18px] font-extrabold tracking-tight ig-text sm:inline">
          Internet <span style={{ color: "var(--accent)" }}>X</span>
        </span>
      </Link>

      <div className="mx-1 hidden min-w-0 flex-1 sm:block">
        <UniversalSearch />
      </div>

      <Link
        to="/?cat=social"
        className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full brand-grad px-3.5 py-2 text-[13px] font-bold text-black sm:ml-0"
      >
        <PenSquare className="h-4 w-4" /> <span className="hidden sm:inline">Post</span>
      </Link>
    </header>
  );
}