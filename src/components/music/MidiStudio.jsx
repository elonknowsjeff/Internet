import React, { useCallback, useEffect, useRef, useState } from "react";
import { Play, Square, Save, RotateCcw, Trash2, Sliders, Music2, Zap, Volume2, VolumeX } from "lucide-react";

const STEPS = 16;
const STORE_KEY = "si_midi_pattern";

const CHANNELS = [
  { id: "kick", name: "Kick", type: "kick", note: 36, color: "#FF5500", row: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0] },
  { id: "snare", name: "Snare", type: "snare", note: 38, color: "#FF9F45", row: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0] },
  { id: "hat", name: "Hi-hat", type: "hat", note: 42, color: "#F5D547", row: [0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1] },
  { id: "clap", name: "Clap", type: "clap", note: 39, color: "#A855F7", row: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0] },
  { id: "bass", name: "808 Bass", type: "bass", note: 33, color: "#22D3EE", row: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0] },
  { id: "lead", name: "Lead", type: "lead", note: 69, color: "#EC4899", row: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] },
  { id: "pad", name: "Pad", type: "pad", note: 60, color: "#34D399", row: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
];

const buildPattern = () =>
  CHANNELS.reduce((acc, c) => ({ ...acc, [c.id]: [...c.row] }), {});

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C"];
const BASE_NOTE = 60;
const KEY_MAP = { a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7, y: 8, h: 9, u: 10, j: 11, k: 12 };

const freq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

function getNoise(ctx) {
  if (ctx.__noise) return ctx.__noise;
  const len = Math.floor(ctx.sampleRate * 0.6);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
  ctx.__noise = buf;
  return buf;
}

function playVoice(ctx, type, midi, time, level = 0.9) {
  const out = ctx.createGain();
  out.gain.value = level;
  out.connect(ctx.destination);

  if (type === "kick") {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.13);
    g.gain.setValueAtTime(1, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.34);
    osc.connect(g).connect(out);
    osc.start(time);
    osc.stop(time + 0.36);
    return;
  }

  if (type === "snare" || type === "clap" || type === "hat") {
    const src = ctx.createBufferSource();
    src.buffer = getNoise(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = type === "hat" ? "highpass" : "bandpass";
    filter.frequency.value = type === "hat" ? 8200 : type === "clap" ? 1400 : 1900;
    filter.Q.value = type === "clap" ? 1.6 : 0.9;
    const g = ctx.createGain();
    const decay = type === "hat" ? 0.05 : type === "clap" ? 0.16 : 0.22;
    g.gain.setValueAtTime(0.85, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + decay);
    src.connect(filter).connect(g).connect(out);
    src.start(time);
    src.stop(time + decay + 0.02);
    return;
  }

  if (type === "bass") {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq(midi), time);
    g.gain.setValueAtTime(0.9, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.42);
    osc.connect(g).connect(out);
    osc.start(time);
    osc.stop(time + 0.44);
    return;
  }

  if (type === "pad") {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(0.5, time + 0.25);
    g.gain.exponentialRampToValueAtTime(0.001, time + 1.5);
    [-8, 8].forEach((detune) => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = freq(midi);
      osc.detune.value = detune;
      osc.connect(filter);
      osc.start(time);
      osc.stop(time + 1.6);
    });
    filter.connect(g).connect(out);
    return;
  }

  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq(midi);
  g.gain.setValueAtTime(0.6, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
  osc.connect(g).connect(out);
  osc.start(time);
  osc.stop(time + 0.32);
}

export default function MidiStudio() {
  const [pattern, setPattern] = useState(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return { ...buildPattern(), ...JSON.parse(raw).pattern };
    } catch (e) {}
    return buildPattern();
  });
  const [bpm, setBpm] = useState(96);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const [muted, setMuted] = useState({});
  const [active, setActive] = useState("lead");
  const [midiReady, setMidiReady] = useState(false);
  const [midiDevices, setMidiDevices] = useState([]);
  const [midiError, setMidiError] = useState("");
  const [lastNote, setLastNote] = useState(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const ctxRef = useRef(null);
  const patternRef = useRef(pattern);
  const mutedRef = useRef(muted);
  const activeRef = useRef(active);
  const stepRef = useRef(0);
  const nextTimeRef = useRef(0);
  const timersRef = useRef([]);

  useEffect(() => { patternRef.current = pattern; }, [pattern]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);
  useEffect(() => { activeRef.current = active; }, [active]);

  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      ctxRef.current = new Ctx();
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const trigger = useCallback((midi) => {
    const ctx = ensureCtx();
    const ch = CHANNELS.find((c) => c.id === activeRef.current) || CHANNELS[5];
    playVoice(ctx, ch.type, midi, ctx.currentTime, 0.9);
    setLastNote(midi);
    setTimeout(() => setLastNote(null), 220);
  }, [ensureCtx]);

  const handleMidiMessage = useCallback((event) => {
    const [status, note, velocity] = event.data;
    const command = status & 0xf0;
    if (command === 0x90 && velocity > 0) {
      const ctx = ensureCtx();
      const ch = CHANNELS.find((c) => c.id === activeRef.current) || CHANNELS[5];
      playVoice(ctx, ch.type, note, ctx.currentTime, Math.max(0.25, velocity / 127));
      setLastNote(note);
      setTimeout(() => setLastNote(null), 220);
    }
  }, [ensureCtx]);

  const connectMidi = async () => {
    setMidiError("");
    if (!navigator.requestMIDIAccess) {
      setMidiError("This browser has no MIDI support. Try Chrome or Edge.");
      return;
    }
    try {
      const access = await navigator.requestMIDIAccess();
      const bind = () => {
        const inputs = Array.from(access.inputs.values());
        inputs.forEach((input) => { input.onmidimessage = handleMidiMessage; });
        setMidiDevices(inputs.map((i) => i.name || "MIDI input"));
        setMidiReady(true);
      };
      bind();
      access.onstatechange = bind;
    } catch (e) {
      setMidiError("MIDI access was blocked. Allow it in the browser prompt.");
    }
  };

  // transport
  useEffect(() => {
    if (!playing) {
      setStep(-1);
      return;
    }
    const ctx = ensureCtx();
    nextTimeRef.current = ctx.currentTime + 0.08;
    stepRef.current = 0;

    const schedule = () => {
      const stepDur = 60 / bpm / 4;
      while (nextTimeRef.current < ctx.currentTime + 0.2) {
        const s = stepRef.current;
        const t = nextTimeRef.current;
        CHANNELS.forEach((ch) => {
          if (patternRef.current[ch.id]?.[s] && !mutedRef.current[ch.id]) {
            playVoice(ctx, ch.type, ch.note, t, 0.8);
          }
        });
        const delay = Math.max(0, (t - ctx.currentTime) * 1000);
        timersRef.current.push(setTimeout(() => setStep(s), delay));
        nextTimeRef.current += stepDur;
        stepRef.current = (s + 1) % STEPS;
      }
    };

    const timer = setInterval(schedule, 25);
    schedule();
    return () => {
      clearInterval(timer);
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [playing, bpm, ensureCtx]);

  // computer keyboard
  useEffect(() => {
    const down = (e) => {
      if (e.target.tagName === "INPUT") return;
      const key = e.key.toLowerCase();
      if (key in KEY_MAP) { e.preventDefault(); trigger(BASE_NOTE + KEY_MAP[key]); }
      if (e.code === "Space") { e.preventDefault(); setPlaying((p) => !p); }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [trigger]);

  const toggle = (id, i) => {
    setPattern((p) => ({ ...p, [id]: p[id].map((v, x) => (x === i ? !v : v)) }));
  };
  const clearAll = () => setPattern(buildPattern());
  const savePattern = () => {
    localStorage.setItem(STORE_KEY, JSON.stringify({ pattern, bpm }));
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1400);
  };

  return (
    <div className="rounded-2xl bg-[#0d0d12] border border-white/[0.07] overflow-hidden text-white">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 bg-[#15151b] border-b border-white/[0.07]">
        <span className="flex items-center gap-1.5 text-[13px] font-bold">
          <Sliders className="w-4 h-4 text-cyan-300" /> Studio
          <span className="text-white/30 font-normal hidden sm:inline">step sequencer</span>
        </span>

        <button
          onClick={() => setPlaying((p) => !p)}
          className="ml-1 w-9 h-9 rounded-full grid place-items-center bg-[#FF5500] text-black hover:brightness-110"
          title={playing ? "Stop" : "Play"}
        >
          {playing ? <Square className="w-3.5 h-3.5 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
        </button>

        <label className="flex items-center gap-1.5 text-[11px] text-white/60">
          BPM
          <input
            type="number"
            min={50}
            max={200}
            value={bpm}
            onChange={(e) => setBpm(Math.min(200, Math.max(50, Number(e.target.value) || 96)))}
            className="w-14 bg-black/50 border border-white/10 rounded-md px-1.5 py-1 text-[12px] text-white outline-none focus:border-white/35 tabular-nums"
          />
        </label>

        <div className="flex items-center gap-0.5 ml-1">
          {[0, 1, 2, 3].map((bar) => (
            <span key={bar} className={`w-2 h-2 rounded-full ${step >= 0 && Math.floor(step / 4) === bar ? "bg-[#FF5500]" : "bg-white/15"}`} />
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={savePattern} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white/10 border border-white/15 text-[11px] font-semibold hover:bg-white/20">
            <Save className="w-3.5 h-3.5" /> {savedFlash ? "Saved" : "Save"}
          </button>
          <button onClick={clearAll} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white/10 border border-white/15 text-[11px] font-semibold hover:bg-white/20">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={connectMidi}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold border ${midiReady ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-300" : "bg-white/10 border-white/15 hover:bg-white/20"}`}
          >
            <Zap className="w-3.5 h-3.5" /> {midiReady ? `${midiDevices.length} MIDI` : "Connect MIDI"}
          </button>
        </div>
      </div>

      {midiError && <p className="px-3 py-1.5 text-[11px] text-amber-300 bg-amber-500/10">{midiError}</p>}

      <div className="p-3 overflow-x-auto">
        <div className="min-w-[620px]">
          <div className="flex items-center gap-1 mb-1 pl-[132px]">
            {Array.from({ length: STEPS }).map((_, i) => (
              <span key={i} className={`flex-1 text-center text-[10px] tabular-nums ${i % 4 === 0 ? "text-white/55" : "text-white/25"}`}>
                {i + 1}
              </span>
            ))}
          </div>

          <div className="space-y-1">
            {CHANNELS.map((ch) => (
              <div key={ch.id} className="flex items-center gap-1">
                <div className="w-[128px] shrink-0 flex items-center gap-1">
                  <button
                    onClick={() => setActive(ch.id)}
                    className={`flex-1 min-w-0 flex items-center gap-1.5 px-1.5 py-1 rounded-md text-[11.5px] font-semibold ${active === ch.id ? "bg-white text-black" : "bg-white/[0.06] text-white/70 hover:bg-white/[0.12]"}`}
                    title={`Play ${ch.name} live`}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ch.color }} />
                    <span className="truncate">{ch.name}</span>
                  </button>
                  <button
                    onClick={() => setMuted((m) => ({ ...m, [ch.id]: !m[ch.id] }))}
                    className={`w-6 h-6 rounded-md grid place-items-center shrink-0 ${muted[ch.id] ? "bg-rose-500/25 text-rose-300" : "bg-white/[0.06] text-white/45 hover:bg-white/[0.12]"}`}
                    title={muted[ch.id] ? "Unmute" : "Mute"}
                  >
                    {muted[ch.id] ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </button>
                </div>

                <div className="flex-1 flex gap-1">
                  {pattern[ch.id].map((on, i) => (
                    <button
                      key={i}
                      onClick={() => toggle(ch.id, i)}
                      className={`flex-1 h-7 rounded transition-all ${on ? "" : "bg-white/[0.055] hover:bg-white/[0.13]"} ${step === i ? "ring-1 ring-white/60" : ""}`}
                      style={on ? { backgroundColor: ch.color } : undefined}
                      aria-label={`${ch.name} step ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-3 pb-3">
        <div className="flex items-center gap-1.5 mb-1.5 text-[11px] text-white/45">
          <Music2 className="w-3.5 h-3.5" />
          Live keys · {CHANNELS.find((c) => c.id === active)?.name}
          <span className="hidden sm:inline">· play with your keyboard (A–K) or a MIDI controller</span>
        </div>
        <div className="flex gap-1">
          {NOTES.map((n, i) => {
            const midi = BASE_NOTE + i;
            const black = n.includes("#");
            const hit = lastNote === midi;
            return (
              <button
                key={`${n}-${i}`}
                onMouseDown={() => trigger(midi)}
                className={`flex-1 rounded-md text-[10px] font-semibold pb-1 pt-6 transition-colors ${black ? "bg-neutral-900 text-white/60 border border-white/10" : "bg-neutral-200 text-black"} ${hit ? "brightness-125 ring-2 ring-[#FF5500]" : ""}`}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 px-3 py-2 border-t border-white/[0.07] text-[10.5px] text-white/35">
        <span className="flex items-center gap-1"><Trash2 className="w-3 h-3" /> Click a step to program it</span>
        <span className="hidden sm:inline">Space = play / stop</span>
        <span className="ml-auto flex items-center gap-1"><Zap className="w-3 h-3" /> Web MIDI ready</span>
      </div>
    </div>
  );
}