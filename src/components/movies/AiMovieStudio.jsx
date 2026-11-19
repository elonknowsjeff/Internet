import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Sparkles, Loader2, Wand2, Check } from "lucide-react";

const GENRES = ["Sci-Fi", "Action", "Drama", "Comedy", "Thriller", "Horror", "Romance", "Animation", "Fantasy"];

export default function AiMovieStudio({ onClose, onCreated }) {
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("Sci-Fi");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");
  const [result, setResult] = useState(null);

  const make = async () => {
    if (!prompt.trim() || busy) return;
    setBusy(true); setResult(null);
    try {
      setStep("Writing the story…");
      const idea = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a film studio. Invent one original ${genre} movie about: "${prompt.trim()}". Return a title, a two sentence synopsis, a tagline, and a poster art prompt (cinematic, highly detailed, no text).`,
        response_json_schema: {
          type: "object",
          properties: { title: { type: "string" }, synopsis: { type: "string" }, tagline: { type: "string" }, poster_prompt: { type: "string" } },
        },
      });
      setStep("Rendering the poster…");
      const img = await base44.integrations.Core.GenerateImage({
        prompt: `Movie poster artwork, no text: ${idea?.poster_prompt || prompt}. Cinematic lighting, dramatic composition, ultra detailed, ${genre} film key art.`,
      });
      const movie = await base44.entities.Movie.create({
        title: idea?.title || prompt.slice(0, 40),
        synopsis: idea?.synopsis || "",
        genre,
        poster: img?.url || "",
        release_date: new Date().toISOString().slice(0, 10),
        language: "Hollywood",
        ai_generated: true,
        status: "now_showing",
      });
      setResult(movie);
      onCreated?.(movie);
    } catch (e) {
      setStep("That didn't render — try again.");
    }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0f1420] border border-white/10 p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-cyan-400" /> Walza AI Film Studio</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-xs text-neutral-400 mb-4">Describe a movie and Walza writes it and paints the poster.</p>

        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} placeholder="A deep-sea archaeologist finds a city that answers back…" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-cyan-400 resize-none" />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {GENRES.map((g) => (
            <button key={g} onClick={() => setGenre(g)} className={`px-2.5 py-1 rounded-full text-xs ${genre === g ? "bg-cyan-400 text-black font-semibold" : "bg-white/5 border border-white/10 text-neutral-300"}`}>{g}</button>
          ))}
        </div>

        <button onClick={make} disabled={busy || !prompt.trim()} className="mt-4 w-full py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 text-black font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40">
          {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> {step}</> : <><Wand2 className="w-4 h-4" /> Generate movie</>}
        </button>

        {result && (
          <div className="mt-4 flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
            {result.poster && <img src={result.poster} alt={result.title} className="w-20 aspect-[2/3] rounded-lg object-cover" />}
            <div className="min-w-0">
              <p className="text-xs text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Added to your library</p>
              <p className="font-semibold mt-0.5">{result.title}</p>
              <p className="text-xs text-neutral-400 line-clamp-3">{result.synopsis}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}