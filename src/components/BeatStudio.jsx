import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, X, Trash2, Download, Loader2, Drum, Sparkles } from "lucide-react";
import {
  ROWS, PRESET_BEATS, PROGRESSIONS, CHORDS, audioCtx, playStepAt, songLength,
  renderSongWav, downloadBlob, emptyGrid, gridFromPreset, drumsFromGrid,
} from "@/lib/songEngine";

export default function BeatStudio({ onClose }) {
  const [presetId, setPresetId] = useState(PRESET_BEATS[0].id);
  const [grid, setGrid] = useState(() => gridFromPreset(PRESET_BEATS[0]));
  const [progression, setProgression] = useState(PRESET_BEATS[0].progression);
  const [bpm, setBpm] = useState(PRESET_BEATS[0].bpm);
  const [swing, setSwing] = useState(PRESET_BEATS[0].swing);
  const [bars, setBars] = useState(4);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const [rendering, setRendering] = useState(false);
  const timer = useRef(null);

  const song = { bpm, swing, bars, progression, drums: drumsFromGrid(grid) };

  const stop = () => {
    clearInterval(timer.current);
    timer.current = null;
    setPlaying(false);
    setStep(-1);
  };

  useEffect(() => () => clearInterval(timer.current), []);

  const start = () => {
    const ctx = audioCtx();
    ctx.resume?.();
    const stepDur = 60 / bpm / 4;
    const total = bars * 16;
    const drums = drumsFromGrid(grid);
    let i = 0;
    const tick = () => {
      const bar = Math.floor(i / 16);
      const s = i % 16;
      setStep(s);
      playStepAt(ctx, ctx.destination, progression[bar % progression.length], drums, s, ctx.currentTime + 0.03);
      i = (i + 1) % total;
    };
    tick();
    timer.current = setInterval(tick, stepDur * 1000);
    setPlaying(true);
  };

  const toggle = () => (playing ? stop() : start());

  const applyPreset = (p) => {
    stop();
    setPresetId(p.id);
    setGrid(gridFromPreset(p));
    setProgression(p.progression);
    setBpm(p.bpm);
    setSwing(p.swing);
  };

  const toggleCell = (rowKey, col) => {
    setGrid((g) => ({ ...g, [rowKey]: g[rowKey].map((on, i) => (i === col ? !on : on)) }));
  };

  const download = async () => {
    setRendering(true);
    try {
      const blob = await renderSongWav(song);
      downloadBlob(blob, `walza-beat-${presetId}-${bpm}bpm.wav`);
    } catch (e) {}
    setRendering(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-full overflow-y-auto bg-[#12121a] border border-white/10 rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 sticky top-0 bg-[#12121a] z-10">
          <h2 className="font-bold font-display flex items-center gap-2"><Drum className="w-4 h-4 text-amber-300" /> Beat Maker</h2>
          <div className="flex items-center gap-2">
            <button onClick={download} disabled={rendering} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold hover:bg-white/20 disabled:opacity-50">
              {rendering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} WAV
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1.5 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Preset beats</p>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_BEATS.map((p) => (
                <button key={p.id} onClick={() => applyPreset(p)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${presetId === p.id ? "bg-amber-400 text-black border-transparent" : "border-white/15 text-white/70 hover:bg-white/10"}`}>{p.name}</button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">BPM <b className="tabular-nums">{bpm}</b>
              <input type="range" min={60} max={180} value={bpm} onChange={(e) => setBpm(+e.target.value)} className="w-28" />
            </span>
            <span className="flex items-center gap-1.5">Swing
              <input type="range" min={0} max={100} value={Math.round(swing * 100)} onChange={(e) => setSwing(+e.target.value / 100)} className="w-20" />
            </span>
            <label className="flex items-center gap-1.5">Bars
              <select value={bars} onChange={(e) => setBars(+e.target.value)} className="bg-white/10 border border-white/15 rounded px-2 py-1 outline-none">
                {[2, 4, 8].map((b) => <option key={b} value={b} className="bg-[#12121a]">{b}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-1.5">Chords
              <select value={progression.join(" ")} onChange={(e) => { const p = e.target.value.split(" "); setProgression(p); }} className="bg-white/10 border border-white/15 rounded px-2 py-1 outline-none">
                {PROGRESSIONS.map((p) => <option key={p.join(" ")} value={p.join(" ")} className="bg-[#12121a]">{p.join(" – ")}</option>)}
                {CHORDS.map((c) => <option key={c} value={[c, c, c, c].join(" ")} className="bg-[#12121a]">{c} (loop)</option>)}
              </select>
            </label>
          </div>

          <div className="space-y-1.5">
            {ROWS.map((r) => (
              <div key={r.key} className="flex items-center gap-2">
                <span className="w-16 shrink-0 text-[11px] text-white/60">{r.label}</span>
                <div className="flex gap-1 flex-1">
                  {grid[r.key].map((on, c) => (
                    <button
                      key={c}
                      onClick={() => toggleCell(r.key, c)}
                      aria-label={`${r.label} step ${c + 1}`}
                      className={`h-7 flex-1 rounded ${on ? r.color : "bg-white/5 hover:bg-white/10"} ${c % 4 === 0 ? "ring-1 ring-white/10" : ""} ${step === c ? "outline outline-2 outline-white/70" : ""}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggle} className="flex items-center gap-2 px-5 py-2 rounded-full bg-white text-black text-sm font-bold">
              {playing ? <><Pause className="w-4 h-4" /> Stop</> : <><Play className="w-4 h-4" /> Play</>}
            </button>
            <button onClick={() => { stop(); setGrid(emptyGrid()); }} className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-white/15 text-sm hover:bg-white/10"><Trash2 className="w-4 h-4" /> Clear</button>
            <span className="ml-auto text-[11px] text-white/40">{Math.round(songLength(song) * 10) / 10}s loop</span>
          </div>
        </div>
      </div>
    </div>
  );
}