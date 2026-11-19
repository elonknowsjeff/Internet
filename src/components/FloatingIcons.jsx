import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Sparkles, ArrowUp } from "lucide-react";

// Floating glossy action icons that hover over the desktop canvas.
export default function FloatingIcons() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="pointer-events-none fixed right-3 top-1/2 z-[51] hidden -translate-y-1/2 flex-col items-center gap-2.5 lg:flex">
      <Link
        to="/"
        title="Create a post"
        className="pointer-events-auto group relative grid h-11 w-11 place-items-center overflow-hidden rounded-[15px] gloss-strong transition-transform duration-200 hover:-translate-y-0.5"
      >
        <span className="absolute inset-0 brand-grad opacity-30" />
        <Plus className="relative w-[19px] h-[19px] text-white" />
      </Link>

      <Link
        to="/assistant"
        title="AI assistant"
        className="pointer-events-auto grid h-11 w-11 place-items-center overflow-hidden rounded-[15px] gloss-strong transition-transform duration-200 hover:-translate-y-0.5"
      >
        <Sparkles className="w-[19px] h-[19px]" style={{ color: "var(--brand)" }} />
      </Link>

      {scrolled && (
        <button
          onClick={toTop}
          title="Back to top"
          className="pointer-events-auto grid h-11 w-11 place-items-center overflow-hidden rounded-[15px] gloss-strong text-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:text-white animate-pop-in"
        >
          <ArrowUp className="w-[19px] h-[19px]" />
        </button>
      )}
    </div>
  );
}