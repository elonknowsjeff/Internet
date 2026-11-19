import React, { useState } from "react";
import { Minus, Square, X, Copy } from "lucide-react";

export default function WindowFrame({
  title,
  Icon,
  initial = { x: 48, y: 32 },
  width = 760,
  height = 480,
  zIndex = 30,
  active,
  variant = "windows",
  maximized = false,
  onMaximize,
  onFocus,
  onClose,
  onMinimize,
  children,
}) {
  const [pos, setPos] = useState(initial);
  const [dragging, setDragging] = useState(false);
  const isMac = variant === "macos";

  const startDrag = (e) => {
    if (maximized) return;
    if (e.target.closest("button")) return;
    setDragging(true);
    const off = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    const move = (ev) => {
      const maxX = window.innerWidth - 200;
      const maxY = window.innerHeight - 240;
      setPos({
        x: Math.min(maxX, Math.max(-40, ev.clientX - off.x)),
        y: Math.min(maxY, Math.max(0, ev.clientY - off.y)),
      });
    };
    const stop = () => {
      setDragging(false);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
  };

  const shadow = active
    ? "0 40px 90px -30px rgba(0,0,0,0.95), 0 0 0 1px rgba(168,85,247,0.55), 0 0 70px -18px rgba(168,85,247,0.6)"
    : "0 24px 60px -30px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.09)";

  const geometry = maximized
    ? { left: 8, right: 8, top: isMac ? 34 : 8, bottom: isMac ? 84 : 74 }
    : {
        left: pos.x,
        top: pos.y,
        width: `min(${width}px, calc(100vw - 28px))`,
        height: `min(${height}px, calc(100% - 96px))`,
      };

  return (
    <div
      onMouseDown={onFocus}
      className={`absolute flex flex-col overflow-hidden border backdrop-blur-2xl ${isMac ? "rounded-xl border-fuchsia-300/25 bg-[#180e30]/95" : "rounded-[10px] border-white/[0.14] bg-[#171029]/95"} ${dragging ? "" : "transition-[left,top,width,height] duration-200"}`}
      style={{ ...geometry, zIndex, boxShadow: shadow }}
    >
      {isMac ? (
        <div
          onMouseDown={startDrag}
          onDoubleClick={onMaximize}
          className="relative flex items-center px-3 h-9 border-b border-fuchsia-300/20 bg-gradient-to-r from-violet-500/25 via-fuchsia-500/12 to-transparent select-none shrink-0"
          style={{ cursor: dragging ? "grabbing" : "default" }}
        >
          <div className="flex items-center gap-2">
            <button onClick={onClose} title="Close" className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-125" />
            <button onClick={onMinimize} title="Minimize" className="w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-125" />
            <button onClick={onMaximize} title={maximized ? "Restore" : "Zoom"} className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-125" />
          </div>
          <span className="absolute left-1/2 -translate-x-1/2 text-[11px] font-semibold text-white/70 truncate max-w-[55%] flex items-center gap-1.5">
            {Icon ? <Icon className="w-3 h-3" /> : null} {title}
          </span>
        </div>
      ) : (
        <div
          onMouseDown={startDrag}
          onDoubleClick={onMaximize}
          className="flex items-center gap-2 pl-2.5 pr-1 h-10 border-b border-white/[0.08] bg-white/[0.035] select-none shrink-0"
          style={{ cursor: dragging ? "grabbing" : "grab" }}
        >
          {Icon ? (
            <span className="w-5 h-5 rounded grid place-items-center bg-[color:var(--brand)]/15 shrink-0">
              <Icon className="w-3 h-3" style={{ color: "var(--brand)" }} />
            </span>
          ) : null}
          <span className="text-[12.5px] font-semibold truncate flex-1 text-white/85">{title}</span>
          <div className="flex items-center gap-0.5">
            <button onClick={onMinimize} title="Minimize" className="w-9 h-8 rounded-md hover:bg-white/10 grid place-items-center text-white/70">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button onClick={onMaximize} title={maximized ? "Restore" : "Maximize"} className="w-9 h-8 rounded-md hover:bg-white/10 grid place-items-center text-white/70">
              {maximized ? <Copy className="w-3 h-3" /> : <Square className="w-2.5 h-2.5" />}
            </button>
            <button onClick={onClose} title="Close" className="w-9 h-8 rounded-md hover:bg-[#c42b1c] grid place-items-center text-white/70 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-auto bg-[#100823]/60">{children}</div>
    </div>
  );
}