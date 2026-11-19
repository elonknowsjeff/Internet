import React, { useEffect, useRef, useState } from "react";

const KEY = "si_desktop_icon_pos";

export default function DesktopIcons({ items = [], onOpen, topOffset = 16 }) {
  const [pos, setPos] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
  });
  const drag = useRef(null);
  const moved = useRef(false);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(pos)); } catch {}
  }, [pos]);

  const fallback = (i) => ({ x: 16 + Math.floor(i / 6) * 96, y: topOffset + (i % 6) * 92 });

  const down = (e, key, i) => {
    if (e.button) return;
    const p = pos[key] || fallback(i);
    drag.current = { key, ox: e.clientX - p.x, oy: e.clientY - p.y, x: p.x, y: p.y };
    moved.current = false;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const move = (e) => {
    const d = drag.current;
    if (!d) return;
    const x = Math.max(6, Math.min(e.clientX - d.ox, window.innerWidth - 96));
    const y = Math.max(6, Math.min(e.clientY - d.oy, window.innerHeight - 150));
    if (!moved.current && (Math.abs(x - d.x) > 3 || Math.abs(y - d.y) > 3)) moved.current = true;
    d.x = x;
    d.y = y;
    setPos((p) => ({ ...p, [d.key]: { x, y } }));
  };

  const up = (e) => {
    if (drag.current) e.currentTarget.releasePointerCapture?.(e.pointerId);
    drag.current = null;
  };

  return (
    <div className="absolute inset-0 z-10 overflow-hidden">
      {items.map((item, i) => {
        const p = pos[item.key] || fallback(i);
        const Icon = item.Icon;
        return (
          <button
            key={item.key}
            onPointerDown={(e) => down(e, item.key, i)}
            onPointerMove={move}
            onPointerUp={up}
            onClick={() => { if (!moved.current) onOpen?.(item); }}
            className="absolute w-[84px] flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 touch-none cursor-grab active:cursor-grabbing"
            style={{ left: p.x, top: p.y }}
          >
            <span className={`relative overflow-hidden w-12 h-12 rounded-2xl bg-gradient-to-br ${item.tone} flex items-center justify-center text-black/80 ring-1 ring-fuchsia-200/45 shadow-[0_12px_26px_-14px_rgba(168,85,247,.95)]`}>
              <span className="absolute inset-0 bg-gradient-to-b from-white/45 via-white/5 to-transparent" />
              <Icon className="relative w-6 h-6" />
            </span>
            <span className="text-[10px] text-center text-white/90 leading-tight truncate w-full">{item.name}</span>
          </button>
        );
      })}
    </div>
  );
}