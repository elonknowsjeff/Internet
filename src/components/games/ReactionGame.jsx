import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function ReactionGame({ onClose }) {
  const [state, setState] = useState("idle");
  const [ms, setMs] = useState(0);
  const startRef = useRef(0);
  const timer = useRef(null);

  const go = () => {
    setState("waiting"); setMs(0);
    timer.current = setTimeout(() => { setState("ready"); startRef.current = Date.now(); }, 1500 + Math.random() * 2500);
  };
  const click = () => {
    if (state === "waiting") { clearTimeout(timer.current); setState("idle"); setMs(-1); return; }
    if (state === "ready") { setMs(Date.now() - startRef.current); setState("done"); return; }
    go();
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  const bg = state === "ready" ? "bg-emerald-500" : state === "waiting" ? "bg-rose-500" : "bg-neutral-900";

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-neutral-950 border border-white/10 rounded-2xl p-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold font-display">Reaction Test</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <button onClick={click} className={`w-full h-48 rounded-2xl ${bg} flex flex-col items-center justify-center text-center transition-colors`}>
          {state === "idle" && <span className="text-white">{ms === -1 ? "Too early! Tap to retry" : "Tap to start"}</span>}
          {state === "waiting" && <span className="text-white">Wait for green…</span>}
          {state === "ready" && <span className="text-black font-bold text-lg">TAP!</span>}
          {state === "done" && <span className="text-white text-2xl font-bold">{ms} ms</span>}
          {state === "done" && <span className="text-white text-sm mt-1">tap to retry</span>}
        </button>
      </div>
    </div>
  );
}