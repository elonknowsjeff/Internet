import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Sparkles, Loader2 } from "lucide-react";

export default function AIAdventure({ onClose }) {
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState(null);
  const [cur, setCur] = useState("start");

  const generate = async (e) => {
    e?.preventDefault();
    if (!theme.trim()) return;
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a short branching text-adventure game about "${theme.trim()}". Return JSON: {title, scenes} where scenes maps scene id (string) to {text, choices:[{label,next}]}. Scene id "start" is the beginning. Keep 5-8 scenes, concise text, meaningful choices, and at least one ending (empty choices). Use live web context if helpful. Current date October 2026.`,
        add_context_from_internet: true, model: "gemini_3_flash",
        response_json_schema: { type: "object", properties: { title: { type: "string" }, scenes: { type: "object" } } },
      });
      setStory({ title: res?.title || "Adventure", scenes: res?.scenes || {} });
      setCur("start");
    } catch { alert("Couldn't generate the adventure."); }
    setLoading(false);
  };

  const scene = story?.scenes?.[cur];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-neutral-950 border border-white/10 rounded-2xl p-5 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold font-display flex items-center gap-2"><Sparkles className="w-4 h-4 text-cyan-400" /> AI Adventure</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        {!story ? (
          <form onSubmit={generate} className="space-y-3">
            <p className="text-sm text-neutral-400">Describe your game world and the AI will build a playable story.</p>
            <input value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="A heist on a space station…" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 outline-none focus:border-cyan-400 text-sm" />
            <button type="submit" disabled={loading || !theme.trim()} className="w-full py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : "Generate adventure"}
            </button>
          </form>
        ) : scene ? (
          <div>
            <p className="text-xs text-cyan-400 mb-1">{story.title}</p>
            <p className="text-sm text-neutral-200 whitespace-pre-wrap leading-relaxed">{scene.text}</p>
            <div className="mt-4 space-y-2">
              {(scene.choices || []).map((c, i) => (
                <button key={i} onClick={() => setCur(c.next)} className="w-full text-left px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400 text-sm">{c.label}</button>
              ))}
              {(scene.choices || []).length === 0 && <p className="text-emerald-400 text-sm mt-2">— The End —</p>}
            </div>
            <button onClick={() => { setStory(null); setTheme(""); }} className="mt-4 text-xs text-neutral-400 hover:text-white">← New adventure</button>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">Couldn't load that scene. <button onClick={() => { setStory(null); }} className="text-cyan-400">Start over</button></p>
        )}
      </div>
    </div>
  );
}