import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, Wand2, RefreshCw } from "lucide-react";
import { PRESET_BEATS, audioCtx, scheduleSong, songLength, renderSongWav, downloadBlob } from "@/lib/songEngine";
import AiSongCard from "./AiSongCard";
import SavedSongsList from "./SavedSongsList";

const STORE_KEY = "superinternet_ai_songs";
const LEGACY_KEY = "walza_ai_songs";

const VIBES = ["Auto", "Chill", "Hype", "Dark", "Uplifting", "Romantic", "Cinematic", "Club"];

const IDEAS = [
  "Late night Toronto trap anthem",
  "Warm afrobeats summer groove",
  "Cinematic lo-fi study beat",
  "90s boom bap with vinyl swing",
  "Euphoric house for a sunrise set",
  "Smooth R&B slow jam with a hook you can hum",
];

const readSaved = () => {
  try {
    const raw = localStorage.getItem(STORE_KEY) || localStorage.getItem(LEGACY_KEY);
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
};

const persist = (list) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch {}
};

export default function AiSongStudio() {
  const [prompt, setPrompt] = useState("");
  const [vibe, setVibe] = useState("Auto");
  const [bars, setBars] = useState(8);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [song, setSong] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [saved, setSaved] = useState(readSaved);
  const [rendering, setRendering] = useState(false);
  const timers = useRef([]);

  useEffect(() => () => { timers.current.forEach(clearTimeout); timers.current = []; }, []);

  const stop = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPlaying(false);
  };

  const playSong = (s) => {
    stop();
    const ctx = audioCtx();
    ctx.resume?.();
    scheduleSong(ctx, ctx.destination, s, 0);
    setPlaying(true);
    timers.current.push(setTimeout(() => setPlaying(false), songLength(s) * 1000 + 600));
  };

  const generate = async () => {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setErr("");
    stop();
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an elite music producer and songwriter. Compose an original, radio-ready song from this brief: "${prompt.trim()}".
Vibe: ${vibe === "Auto" ? "pick what fits the brief" : vibe}. Target length: ${bars} bars.

Rules:
- title: 2 to 4 words, no quotes, catchy.
- genre and mood: one short phrase each.
- bpm: integer between 70 and 160 that fits the genre.
- key: musical key, e.g. "A minor".
- drum_style: exactly one of: boombap, trap, house, drill, afro, rock, lofi, rnb, pop, amapiano, cinematic, edm.
- progression: exactly 4 chord symbols. Use only plain symbols like Am, A, Bb, Bm, C, Cm, Dm, D, Eb, Em, E, F, Fm, G, Gm, E7, A7, Dm7.
- energy: integer 1 to 10.
- melody: exactly 8 note names WITH octave numbers (e.g. "A4", "C5", "E5", "D4") forming a memorable singable hook that fits the progression.
- hook: 2 lines. verse: 4 lines. bridge: 2 lines. Plain text, real words, newlines between lines, no labels.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            genre: { type: "string" },
            mood: { type: "string" },
            bpm: { type: "number" },
            key: { type: "string" },
            drum_style: { type: "string" },
            progression: { type: "array", items: { type: "string" } },
            energy: { type: "number" },
            melody: { type: "array", items: { type: "string" } },
            hook: { type: "string" },
            verse: { type: "string" },
            bridge: { type: "string" },
          },
          required: ["title", "genre", "progression", "drum_style"],
        },
      });

      const style = (res?.drum_style || "boombap").toLowerCase().replace(/[^a-z]/g, "");
      const preset = PRESET_BEATS.find((p) => style.includes(p.id)) || PRESET_BEATS[0];
      const progression = (res?.progression || preset.progression).slice(0, 4);
      while (progression.length < 4) progression.push(preset.progression[progression.length] || "Am");

      const next = {
        id: `ai-${Date.now()}`,
        title: res?.title || "Untitled",
        genre: res?.genre || preset.name,
        mood: res?.mood || vibe,
        key: res?.key || "",
        bpm: Math.max(60, Math.min(180, Math.round(res?.bpm || preset.bpm))),
        swing: preset.swing,
        bars,
        drumStyle: preset.id,
        style: preset.style,
        progression,
        energy: Math.max(1, Math.min(10, Math.round(res?.energy || 6))),
        melody: Array.isArray(res?.melody) ? res.melody.slice(0, 16) : [],
        drums: preset.drums,
        hook: res?.hook || "",
        verse: res?.verse || "",
        bridge: res?.bridge || "",
        createdAt: Date.now(),
      };
      setSong(next);
      playSong(next);
    } catch (e) {
      setErr("Couldn't build that song — try another idea.");
    }
    setBusy(false);
  };

  const save = () => {
    if (!song) return;
    const next = [{ ...song }, ...saved.filter((s) => s.id !== song.id)].slice(0, 40);
    setSaved(next);
    persist(next);
  };

  const remove = (id) => {
    const next = saved.filter((s) => s.id !== id);
    setSaved(next);
    persist(next);
  };

  const applyCover = (url) => {
    setSong((s) => (s ? { ...s, cover: url } : s));
    const next = saved.map((s) => (s.id === song?.id ? { ...s, cover: url } : s));
    setSaved(next);
    persist(next);
  };

  const download = async (s) => {
    setRendering(true);
    try {
      const blob = await renderSongWav(s);
      downloadBlob(blob, `${(s.title || "super-internet-song").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.wav`);
    } catch {}
    setRendering(false);
  };

  const isSaved = !!song && saved.some((s) => s.id === song.id);

  return (
    <div className="p-4 space-y-5">
      <div className="rounded-2xl bg-gradient-to-br from-fuchsia-600/30 via-violet-600/20 to-transparent border border-white/10 p-5">
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2"><Sparkles className="w-5 h-5 text-fuchsia-300" /> AI Song Studio</h2>
        <p className="text-sm text-white/60 mt-1">Describe a sound — the studio writes lyrics, an arrangement and a hook, then produces it with real drums, bass, pads and lead lines. Keep it as a WAV.</p>

        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder="e.g. moody Toronto rap beat with a warm bassline"
            className="flex-1 bg-black/40 border border-white/15 rounded-full px-4 py-2.5 text-sm outline-none placeholder-white/35 focus:border-fuchsia-400/60"
          />
          <button onClick={generate} disabled={busy || !prompt.trim()} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-bold disabled:opacity-40">
            {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Composing…</> : <><Wand2 className="w-4 h-4" /> Generate</>}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <span className="text-[11px] uppercase tracking-widest text-white/35 mr-1">Vibe</span>
          {VIBES.map((v) => (
            <button
              key={v}
              onClick={() => setVibe(v)}
              className={`text-[11px] px-2.5 py-1 rounded-full border ${vibe === v ? "bg-white text-black border-white" : "border-white/15 text-white/60 hover:bg-white/10"}`}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className="text-[11px] uppercase tracking-widest text-white/35 mr-1">Length</span>
          {[4, 8, 12, 16].map((b) => (
            <button
              key={b}
              onClick={() => setBars(b)}
              className={`text-[11px] px-2.5 py-1 rounded-full border ${bars === b ? "bg-white text-black border-white" : "border-white/15 text-white/60 hover:bg-white/10"}`}
            >
              {b} bars
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {IDEAS.map((i) => (
            <button key={i} onClick={() => setPrompt(i)} className="text-[11px] px-2.5 py-1 rounded-full border border-white/15 text-white/60 hover:bg-white/10">{i}</button>
          ))}
        </div>
        {err && <p className="text-xs text-rose-300 mt-2">{err}</p>}
      </div>

      {song && (
        <>
          <AiSongCard
            song={song}
            playing={playing}
            saved={isSaved}
            rendering={rendering}
            onPlay={() => (playing ? stop() : playSong(song))}
            onSave={save}
            onDownload={() => download(song)}
            onCover={applyCover}
          />
          <button
            onClick={generate}
            disabled={busy}
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-full border border-white/15 text-xs font-semibold text-white/70 hover:bg-white/10 disabled:opacity-40"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Another take on this idea
          </button>
        </>
      )}

      <div>
        <h3 className="text-sm font-semibold text-white/60 mb-2">My AI songs ({saved.length})</h3>
        <SavedSongsList songs={saved} onPlay={playSong} onDownload={download} onRemove={remove} />
      </div>
    </div>
  );
}