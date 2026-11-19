import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, Wand2 } from "lucide-react";

const GENRES = ["Action", "RPG", "Shooter", "Racing", "Puzzle", "Strategy", "Adventure", "Sports", "Horror"];
const DIMENSIONS = ["3D", "2D"];
const PERSPECTIVES = ["First Person", "Third Person", "Top-Down", "Side-View", "Other"];

export default function AiGameStudio({ user, onCreated }) {
  const [idea, setIdea] = useState("");
  const [genre, setGenre] = useState("Action");
  const [dimension, setDimension] = useState("3D");
  const [perspective, setPerspective] = useState("Third Person");
  const [price, setPrice] = useState("9.99");
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  const generate = async () => {
    const prompt = idea.trim();
    if (!prompt || busy) return;
    setErr(""); setBusy("Writing your game…");
    try {
      const meta = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a game director at an AI game studio. Build a sellable video game concept from this idea: "${prompt}". Genre: ${genre}. ${dimension} graphics, ${perspective} perspective. Return: title (max 4 words, punchy), description (2 sentences, sells the game), tags (comma separated, 3 tags), rating_seed (number 4.0-4.9).`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            tags: { type: "string" },
            rating_seed: { type: "number" },
          },
        },
      });
      setBusy("Rendering cover art…");
      const art = await base44.integrations.Core.GenerateImage({
        prompt: `Video game cover art, vertical key art for a ${dimension} ${genre} game called "${meta?.title || prompt}". ${prompt}. ${perspective} perspective hero shot, dramatic lighting, highly detailed, polished AAA store art, no text, no logos.`,
      });
      setBusy("Publishing to the store…");
      const dev = (user?.display_name || user?.full_name || "Walza creator") + " · AI Studio";
      await base44.entities.Game.create({
        title: meta?.title || prompt.slice(0, 40),
        genre,
        dimension,
        perspective,
        developer: dev,
        cover: art?.url || "",
        rating: Math.min(4.9, Math.max(4, meta?.rating_seed || 4.5)),
        description: meta?.description || prompt,
        tags: `AI generated,${meta?.tags || genre}`,
        ai_generated: true,
        price: Math.max(0, Number(price) || 0),
        discount: 0,
      });
      setIdea("");
      setBusy("");
      onCreated?.();
    } catch (e) {
      setErr("Couldn't finish that game — try again in a moment.");
      setBusy("");
    }
  };

  return (
    <div className="p-3 sm:p-4 max-w-3xl">
      <div className="rounded-xl border border-fuchsia-400/30 bg-gradient-to-br from-fuchsia-500/10 to-cyan-400/5 p-4">
        <h2 className="text-xl font-black flex items-center gap-2"><Sparkles className="w-5 h-5 text-fuchsia-300" /> AI Game Studio</h2>
        <p className="text-xs text-[#8f98a0] mt-1">Describe a game. Walza writes it, paints the cover and lists it for sale in the store.</p>

        <textarea value={idea} onChange={(e) => setIdea(e.target.value)} rows={3} placeholder="A neon cyberpunk hoverboard racing game with weather and rival AI riders…" className="mt-3 w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2.5 outline-none text-sm focus:border-fuchsia-400" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          <select value={genre} onChange={(e) => setGenre(e.target.value)} className="bg-black/40 border border-white/15 rounded px-2 py-2 text-sm outline-none">
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select value={dimension} onChange={(e) => setDimension(e.target.value)} className="bg-black/40 border border-white/15 rounded px-2 py-2 text-sm outline-none">
            {DIMENSIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={perspective} onChange={(e) => setPerspective(e.target.value)} className="bg-black/40 border border-white/15 rounded px-2 py-2 text-sm outline-none">
            {PERSPECTIVES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <div className="flex items-center gap-1 bg-black/40 border border-white/15 rounded px-2">
            <span className="text-xs text-[#8f98a0]">$</span>
            <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" className="flex-1 min-w-0 bg-transparent outline-none text-sm py-2" />
          </div>
        </div>

        <button onClick={generate} disabled={!idea.trim() || !!busy} className="mt-3 w-full py-2.5 rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40">
          {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> {busy}</> : <><Wand2 className="w-4 h-4" /> Generate game</>}
        </button>
        {err && <p className="text-xs text-rose-300 mt-2">{err}</p>}
      </div>
      <p className="text-[11px] text-[#8f98a0] mt-3">Every game you generate is instantly playable, gets its own store page, and can be sold with skins in the Community Market.</p>
    </div>
  );
}