import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";

export default function LikeAnimation() {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    let id = 0;
    const spawn = () => {
      const h = { id: id++, left: Math.random() * 24, size: 14 + Math.random() * 16, dur: 3 + Math.random() * 2, drift: (Math.random() - 0.5) * 40 };
      setHearts((prev) => [...prev, h]);
      setTimeout(() => setHearts((prev) => prev.filter((x) => x.id !== h.id)), h.dur * 1000 + 300);
    };
    const interval = setInterval(spawn, 850);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none fixed left-1 bottom-24 z-40 hidden sm:block">
      {hearts.map((h) => (
        <div key={h.id} className="absolute bottom-0" style={{ left: h.left, "--drift": `${h.drift}px`, animation: `floatUp ${h.dur}s ease-out forwards` }}>
          <Heart className="text-fuchsia-500 fill-fuchsia-500/40" style={{ width: h.size, height: h.size, filter: "drop-shadow(0 0 6px rgba(217,70,239,0.7))" }} />
        </div>
      ))}
      <style>{`@keyframes floatUp { 0%{transform:translateY(0) scale(.6);opacity:0} 15%{opacity:1} 100%{transform:translateY(-70vh) translateX(var(--drift,0)) scale(1.1);opacity:0} }`}</style>
    </div>
  );
}