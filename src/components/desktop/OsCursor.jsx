import React, { useEffect, useState } from "react";

// A custom OS-style arrow pointer that replaces the native cursor on the desktop shell.
export default function OsCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [down, setDown] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const move = (e) => { setPos({ x: e.clientX, y: e.clientY }); setVisible(true); };
    const dn = () => setDown(true);
    const up = () => setDown(false);
    const leave = () => setVisible(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", dn);
    window.addEventListener("mouseup", up);
    document.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", dn);
      window.removeEventListener("mouseup", up);
      document.removeEventListener("mouseleave", leave);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed z-[9999]"
      style={{ left: pos.x, top: pos.y, transform: `translate(${down ? 1.5 : 0}px, ${down ? 1.5 : 0}px)` }}
    >
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
        <defs>
          <filter id="os-cursor-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M6 4 L6 25 L11.4 20.2 L14.8 27.6 L18.6 25.9 L15.2 18.6 L22.4 18.4 Z"
          fill="#0b0b14"
          stroke="var(--brand)"
          strokeWidth="1.6"
          strokeLinejoin="round"
          filter="url(#os-cursor-glow)"
        />
        <path d="M6 4 L6 25 L11.4 20.2 L15.2 18.6 L22.4 18.4 Z" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.7" strokeLinejoin="round" />
      </svg>
      {down && (
        <span
          className="absolute left-1 top-1 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping"
          style={{ background: "color-mix(in srgb, var(--brand) 70%, transparent)" }}
        />
      )}
    </div>
  );
}