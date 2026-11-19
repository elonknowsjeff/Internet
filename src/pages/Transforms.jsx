import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Upload, Loader2, Download, Wand2, X, ImagePlus } from "lucide-react";

const STYLES = [
  { id: "anime", label: "Anime", prompt: "anime key visual, cel shaded, vibrant colours, studio quality" },
  { id: "cyberpunk", label: "Cyberpunk", prompt: "cyberpunk neon city lighting, chrome reflections, moody" },
  { id: "oil", label: "Oil paint", prompt: "thick oil painting, visible brush strokes, gallery fine art" },
  { id: "3d", label: "3D render", prompt: "glossy 3D render, soft studio lighting, octane quality" },
  { id: "clay", label: "Claymation", prompt: "claymation model, handmade texture, playful studio light" },
  { id: "comic", label: "Comic", prompt: "bold comic book ink, halftone shading, dynamic panels" },
  { id: "vintage", label: "Vintage film", prompt: "1970s film photograph, warm grain, soft focus, kodachrome" },
  { id: "gold", label: "Gold statue", prompt: "polished gold sculpture, dramatic museum lighting, luxury" },
];

export default function Transforms() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [style, setStyle] = useState(STYLES[0]);
  const [extra, setExtra] = useState("");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const pick = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError("");
    setPreview(URL.createObjectURL(f));
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file: f });
      setFile(res?.file_url || "");
    } catch (err) { setError("That upload failed — try another image."); }
    e.target.value = "";
  };

  const run = async () => {
    if (busy || !file) return;
    setBusy(true); setError(""); setStage("Transforming…");
    try {
      const res = await base44.integrations.Core.GenerateImage({
        prompt: `Transform this image into ${style.label.toLowerCase()} style: ${style.prompt}. ${extra.trim() ? extra.trim() + "." : ""} Keep the subject recognisable, high detail.`,
        existing_image_urls: [file],
      });
      if (res?.url) setResults((r) => [{ url: res.url, style: style.label }, ...r].slice(0, 12));
      else setError("No image came back — try again.");
    } catch (e) { setError("That transform didn't work. Try again."); }
    setBusy(false); setStage("");
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-28 sm:pb-8">
      <header className="py-5">
        <h1 className="text-2xl font-black font-display flex items-center gap-2"><Sparkles className="w-6 h-6 text-fuchsia-400" /> Transforms</h1>
        <p className="text-sm text-neutral-400">Turn any photo into a new style with Walza AI.</p>
      </header>

      <div className="grid sm:grid-cols-[240px_1fr] gap-4">
        <div className="glass-card p-4">
          <label className="block aspect-square rounded-xl border-2 border-dashed border-white/25 overflow-hidden cursor-pointer hover:border-fuchsia-400 relative">
            {preview ? <img src={preview} alt="source" className="w-full h-full object-cover" /> : (
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-xs text-neutral-400"><ImagePlus className="w-6 h-6" /> Choose a photo</span>
            )}
            <input type="file" accept="image/*" onChange={pick} className="hidden" />
          </label>
          <p className="text-[10px] text-neutral-500 mt-2">Photos are stored publicly — anyone with the link can open them.</p>
          <div className="flex items-center gap-2 mt-3">
            <Upload className="w-4 h-4 text-neutral-500" />
            <input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Optional: extra direction" className="flex-1 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs outline-none" />
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Pick a style</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {STYLES.map((s) => (
              <button key={s.id} onClick={() => setStyle(s)} className={`rounded-xl px-3 py-2 text-sm border transition-colors ${style.id === s.id ? "bg-fuchsia-500 text-black border-fuchsia-400 font-semibold" : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10"}`}>{s.label}</button>
            ))}
          </div>
          <button onClick={run} disabled={busy || !file} className="mt-3 w-full py-2.5 rounded-full bg-gradient-to-r from-amber-300 to-fuchsia-400 text-black font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40">
            {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> {stage}</> : <><Wand2 className="w-4 h-4" /> Transform photo</>}
          </button>
          {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}

          <div className="mt-4">
            <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Results</p>
            {results.length === 0 ? (
              <p className="text-sm text-neutral-500 py-8 text-center rounded-xl bg-white/5 border border-white/10">Your transforms appear here.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {results.map((r, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-white/10">
                    <img src={r.url} alt={r.style} className="w-full aspect-square object-cover" />
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-semibold">{r.style}</span>
                    <a href={r.url} target="_blank" rel="noreferrer" className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100"><Download className="w-3.5 h-3.5" /></a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}