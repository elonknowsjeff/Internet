import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Languages, ArrowRightLeft, Loader2, Copy, X, Volume2 } from "lucide-react";

const LANGS = ["English", "Spanish", "French", "Arabic", "Hindi", "Punjabi", "Portuguese", "German", "Italian", "Mandarin Chinese", "Japanese", "Korean", "Russian", "Turkish", "Urdu", "Tagalog", "Vietnamese", "Swahili", "Dutch", "Polish"];

export default function TranslatorPanel({ onClose }) {
  const [text, setText] = useState("");
  const [target, setTarget] = useState("Spanish");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const run = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate the text below into ${target}. Detect the source language automatically. Reply with the translation only — no notes, no quotes.\n\nText:\n${text}`,
      });
      setOut(typeof res === "string" ? res : res?.output || "");
    } catch (e) {
      setOut("");
    }
    setBusy(false);
  };

  const copy = async () => {
    if (!out) return;
    try { await navigator.clipboard.writeText(out); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch (e) {}
  };

  const speak = () => {
    if (!out || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(out);
    window.speechSynthesis.speak(u);
  };

  const swap = () => { setText(out); setOut(""); };

  return (
    <div className="fixed bottom-16 right-2 z-[60] w-[95vw] max-w-md rounded-xl overflow-hidden bg-[#221c42]/95 backdrop-blur-2xl border border-white/20 shadow-2xl animate-slide-up">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/15 bg-white/5">
        <p className="text-sm font-semibold flex items-center gap-2"><Languages className="w-4 h-4 text-cyan-300" /> Translator</p>
        <button onClick={onClose} className="w-7 h-7 rounded hover:bg-white/15 flex items-center justify-center"><X className="w-4 h-4" /></button>
      </div>

      <div className="p-3 space-y-2">
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Type or paste text in any language…" className="w-full rounded-lg bg-white/10 border border-white/15 px-3 py-2 text-sm outline-none resize-none placeholder-white/40" />
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/50 flex items-center gap-1"><Languages className="w-3 h-3" /> Into</span>
          <select value={target} onChange={(e) => setTarget(e.target.value)} className="flex-1 bg-white/10 border border-white/15 rounded-lg px-2 py-1.5 text-xs outline-none">
            {LANGS.map((l) => <option key={l} value={l} className="bg-[#221c42]">{l}</option>)}
          </select>
          <button onClick={run} disabled={!text.trim() || busy} className="px-3 py-1.5 rounded-lg brand-grad text-black text-xs font-bold disabled:opacity-40 flex items-center gap-1">
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Translate"}
          </button>
        </div>

        {out && (
          <div className="rounded-lg bg-white/10 border border-white/15 p-3">
            <p className="text-sm whitespace-pre-wrap">{out}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <button onClick={copy} className="px-2 py-1 rounded bg-white/10 text-[11px] flex items-center gap-1 hover:bg-white/20"><Copy className="w-3 h-3" /> {copied ? "Copied" : "Copy"}</button>
              <button onClick={speak} className="px-2 py-1 rounded bg-white/10 text-[11px] flex items-center gap-1 hover:bg-white/20"><Volume2 className="w-3 h-3" /> Speak</button>
              <button onClick={swap} className="px-2 py-1 rounded bg-white/10 text-[11px] flex items-center gap-1 hover:bg-white/20"><ArrowRightLeft className="w-3 h-3" /> Use as source</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}