import React from "react";
import { Link } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";
import UniversalSearch from "@/components/home/UniversalSearch";
import { Sparkles } from "lucide-react";

export default function HubHeader() {
  return (
    <header className="flex items-center gap-3 px-4 py-3 sm:px-6">
      <Link to="/" aria-label="Internet X home" className="flex items-center gap-2.5 shrink-0 group">
        <span className="transition-transform duration-200 group-hover:scale-105"><BrandLogo size={42} /></span>
        <span className="hidden sm:block font-display text-[20px] font-extrabold tracking-tight leading-none">
          Internet <span style={{ color: "var(--brand)" }}>X</span>
        </span>
      </Link>
      <div className="flex-1 flex justify-center min-w-0">
        <UniversalSearch />
      </div>
      <Link to="/?cat=aichat" className="shrink-0 flex items-center gap-1.5 rounded-full neon-btn px-3.5 py-2.5 text-[12.5px] font-bold">
        <Sparkles className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Ask AI</span>
      </Link>
    </header>
  );
}