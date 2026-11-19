import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function WelcomeOverlay() {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [uid, setUid] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        if (!u) return;
        setUid(u.id);
        const key = `welcomed_${u.id}`;
        if (!localStorage.getItem(key)) {
          setName(u.display_name || u.full_name || (u.email ? u.email.split("@")[0] : "friend"));
          setShow(true);
        }
      } catch {}
    })();
  }, []);

  const dismiss = () => {
    if (uid) { try { localStorage.setItem(`welcomed_${uid}`, "1"); } catch {} }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl border border-white/15 bg-gradient-to-br from-neutral-900 to-black p-7 text-center animate-slide-up shadow-2xl">
        <div className="flex justify-center">
          <BrandLogo size={76} />
        </div>
        <p className="text-[10px] uppercase tracking-[0.35em] text-neutral-400 mt-4">XSI</p>
        <h2 className="text-2xl font-black font-display mt-1 bg-gradient-to-r from-fuchsia-300 via-amber-200 to-cyan-300 bg-clip-text text-transparent">Welcome, {name}!</h2>
        <p className="text-sm text-neutral-300 mt-3">The whole internet in one app — your feed, food, rides, music, movies, games, news, docs and more. Real people only.</p>
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-neutral-400">
          <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" /> Tip: open the Super Internet AI button (bottom-right) anytime to ask anything or generate images.
        </div>
        <button onClick={dismiss} className="mt-6 w-full py-3 rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-400 text-black font-bold text-sm hover:opacity-90 transition-opacity">Get started</button>
      </div>
    </div>
  );
}