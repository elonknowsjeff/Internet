import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

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

  if (!scrolled) return null;

  return (
    <div className="pointer-events-none fixed right-3 bottom-[96px] z-[51] hidden lg:flex">
      <button
        onClick={toTop}
        title="Back to top"
        className="pointer-events-auto grid h-10 w-10 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] text-white/70 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:text-white hover:border-white/25"
      >
        <ArrowUp className="w-[18px] h-[18px]" />
      </button>
    </div>
  );
}