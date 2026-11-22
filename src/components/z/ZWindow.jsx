import React from "react";
import { X, Minus, Square } from "lucide-react";

// A single Windows 11-style window: draggable by the title bar, resizable from
// the bottom-right corner, with minimize / maximize / close controls.
export default function ZWindow({ win, onFocus, onClose, onMinimize, onToggleMax, onUpdate, children }) {
  if (win.minimized) return null;

  const startDrag = (e) => {
    if (win.maximized) return;
    onFocus(win.id);
    const sx = e.clientX, sy = e.clientY, ox = win.x, oy = win.y;
    const move = (ev) => {
      onUpdate(win.id, {
        x: Math.max(0, Math.min(window.innerWidth - 120, ox + (ev.clientX - sx))),
        y: Math.max(0, Math.min(window.innerHeight - 120, oy + (ev.clientY - sy))),
      });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const startResize = (e) => {
    e.stopPropagation();
    if (win.maximized) return;
    onFocus(win.id);
    const sx = e.clientX, sy = e.clientY, ow = win.w, oh = win.h;
    const move = (ev) => {
      onUpdate(win.id, {
        w: Math.max(360, ow + (ev.clientX - sx)),
        h: Math.max(260, oh + (ev.clientY - sy)),
      });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const style = win.maximized
    ? { left: 0, top: 0, width: "100%", height: "calc(100% - 52px)", zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };

  const Icon = win.icon;

  return (
    <div
      className="absolute flex flex-col overflow-hidden rounded-lg border border-[#2f3336] bg-[#0a0a0a]/95 shadow-[0_24px_70px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl"
      style={style}
      onPointerDown={() => onFocus(win.id)}
    >
      <div
        className="flex h-9 shrink-0 items-center gap-2 border-b border-[#2f3336] bg-white/[0.05] px-3 select-none"
        onPointerDown={startDrag}
        onDoubleClick={() => onToggleMax(win.id)}
      >
        <Icon className="h-4 w-4 text-white/70" />
        <span className="text-[13px] font-semibold text-white/85 truncate">{win.label}</span>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); onMinimize(win.id); }} className="grid h-6 w-6 place-items-center rounded text-white/70 hover:bg-white/10"><Minus className="h-3.5 w-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); onToggleMax(win.id); }} className="grid h-6 w-6 place-items-center rounded text-white/70 hover:bg-white/10"><Square className="h-3 w-3" /></button>
          <button onClick={(e) => { e.stopPropagation(); onClose(win.id); }} className="grid h-6 w-6 place-items-center rounded text-white/70 hover:bg-red-500/80 hover:text-white"><X className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      <div className="relative flex-1 overflow-auto bg-black thin-scrollbar">
        {children}
      </div>
      {!win.maximized && (
        <div
          onPointerDown={startResize}
          className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize"
          style={{ background: "linear-gradient(135deg, transparent 52%, rgba(255,255,255,0.28) 52%)" }}
        />
      )}
    </div>
  );
}