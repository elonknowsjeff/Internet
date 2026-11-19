import React, { useEffect, useRef, useState } from "react";
import { Upload, Play, Square, Download, Loader2, Film, Type, Palette, Scissors } from "lucide-react";

const FILTERS = [
  { id: "none", label: "Original", css: "none" },
  { id: "vivid", label: "Vivid", css: "saturate(1.6) contrast(1.1)" },
  { id: "warm", label: "Warm", css: "sepia(0.35) saturate(1.3) hue-rotate(-12deg)" },
  { id: "cool", label: "Cool", css: "saturate(1.2) hue-rotate(18deg) brightness(1.05)" },
  { id: "noir", label: "Noir", css: "grayscale(1) contrast(1.25)" },
  { id: "fade", label: "Faded", css: "contrast(0.85) brightness(1.1) saturate(0.8)" },
];

const POSITIONS = [
  { id: "top", label: "Top", y: 0.14 },
  { id: "middle", label: "Center", y: 0.5 },
  { id: "bottom", label: "Bottom", y: 0.86 },
];

export default function VideoEditor() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const recRef = useRef(null);

  const [src, setSrc] = useState("");
  const [ready, setReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [filter, setFilter] = useState("none");
  const [text, setText] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textPos, setTextPos] = useState("bottom");
  const [textSize, setTextSize] = useState(44);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const pickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSrc(url);
    setReady(false);
    setStart(0);
    setEnd(0);
  };

  const filterCss = FILTERS.find((f) => f.id === filter)?.css || "none";

  // Draw the live preview onto the canvas (video + text + filter).
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      const w = canvas.width;
      const h = canvas.height;
      ctx.save();
      ctx.filter = filterCss;
      ctx.drawImage(video, 0, 0, w, h);
      ctx.restore();

      const caption = text.trim();
      if (caption) {
        const pos = POSITIONS.find((p) => p.id === textPos) || POSITIONS[2];
        const size = Math.round((textSize / 100) * h);
        ctx.font = `800 ${size}px Inter, Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const lines = caption.split("\n").slice(0, 3);
        lines.forEach((line, i) => {
          const y = pos.y * h + (i - (lines.length - 1) / 2) * size * 1.2;
          ctx.lineWidth = Math.max(3, size * 0.09);
          ctx.strokeStyle = "rgba(0,0,0,0.6)";
          ctx.strokeText(line, w / 2, y, w * 0.9);
          ctx.fillStyle = textColor;
          ctx.fillText(line, w / 2, y, w * 0.9);
        });
      }
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [filterCss, text, textColor, textPos, textSize, src]);

  const onLoaded = () => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration || 0);
    setEnd(v.duration || 0);
    setReady(true);
    if (canvasRef.current) {
      canvasRef.current.width = Math.min(1280, v.videoWidth || 1280);
      canvasRef.current.height = Math.round((canvasRef.current.width * (v.videoHeight || 720)) / (v.videoWidth || 1280));
    }
  };

  const exportClip = async () => {
    const v = videoRef.current;
    const canvas = canvasRef.current;
    if (!v || !canvas || exporting) return;
    setExporting(true);
    setProgress(0);
    try {
      const stream = canvas.captureStream(30);
      try {
        const vs = v.captureStream ? v.captureStream() : null;
        vs?.getAudioTracks().forEach((t) => stream.addTrack(t));
      } catch (e) {}
      const chunks = [];
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4000000 });
      recRef.current = rec;
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "walza-clip.webm";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        setExporting(false);
        setProgress(100);
      };

      v.currentTime = start;
      v.muted = false;
      v.volume = 1;
      await v.play();
      rec.start(250);
      const clipLen = Math.max(0.5, end - start);
      const startedAt = performance.now();
      const tick = () => {
        const elapsed = (performance.now() - startedAt) / 1000;
        setProgress(Math.min(99, Math.round((elapsed / clipLen) * 100)));
        if (elapsed >= clipLen || v.ended) {
          v.pause();
          rec.state !== "inactive" && rec.stop();
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    } catch (e) {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-5 pb-28">
      <header className="mb-4">
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2"><Film className="w-5 h-5 text-fuchsia-300" /> Video Editor</h1>
        <p className="text-sm text-white/50">Cut a clip, add a caption and a colour grade, then export it as a video file.</p>
      </header>

      <div className="grid lg:grid-cols-[1fr_300px] gap-4">
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black relative">
          {src ? (
            <>
              <video ref={videoRef} src={src} onLoadedMetadata={onLoaded} className="hidden" playsInline crossOrigin="anonymous" />
              <canvas ref={canvasRef} className="w-full h-auto block" width={1280} height={720} />
            </>
          ) : (
            <label className="aspect-video flex flex-col items-center justify-center gap-2 cursor-pointer text-white/50 hover:text-white/80">
              <Upload className="w-8 h-8" />
              <span className="text-sm font-semibold">Choose a video from your device</span>
              <span className="text-xs">MP4, MOV or WebM</span>
              <input type="file" accept="video/*" onChange={pickFile} className="hidden" />
            </label>
          )}
        </div>

        <div className="space-y-4">
          {ready && (
            <section className="rounded-2xl bg-white/5 border border-white/10 p-3">
              <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2 flex items-center gap-1"><Scissors className="w-3 h-3" /> Trim</p>
              <label className="text-xs text-white/60">Start · {start.toFixed(1)}s
                <input type="range" min={0} max={Math.max(0.1, duration)} step={0.1} value={start} onChange={(e) => setStart(Math.min(+e.target.value, end - 0.2))} className="w-full" />
              </label>
              <label className="text-xs text-white/60">End · {end.toFixed(1)}s
                <input type="range" min={0} max={Math.max(0.1, duration)} step={0.1} value={end} onChange={(e) => setEnd(Math.max(+e.target.value, start + 0.2))} className="w-full" />
              </label>
              <button onClick={() => { const v = videoRef.current; if (v) { v.currentTime = start; v.play(); } }} className="mt-1 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/15 hover:bg-white/20"><Play className="w-3 h-3" /> Preview clip</button>
            </section>
          )}

          <section className="rounded-2xl bg-white/5 border border-white/10 p-3">
            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2 flex items-center gap-1"><Type className="w-3 h-3" /> Caption</p>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="Type your caption…" className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-sm outline-none resize-none" />
            <div className="flex items-center gap-2 mt-2">
              {POSITIONS.map((p) => (
                <button key={p.id} onClick={() => setTextPos(p.id)} className={`flex-1 py-1.5 rounded-full text-xs ${textPos === p.id ? "bg-white text-black font-bold" : "bg-white/10 border border-white/15"}`}>{p.label}</button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <label className="flex items-center gap-1.5">Size
                <input type="range" min={18} max={90} value={textSize} onChange={(e) => setTextSize(+e.target.value)} className="w-20" />
              </label>
              <label className="flex items-center gap-1.5 ml-auto"><Palette className="w-3.5 h-3.5" /> Colour
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-7 h-7 rounded bg-transparent border border-white/20" />
              </label>
            </div>
          </section>

          <section className="rounded-2xl bg-white/5 border border-white/10 p-3">
            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Colour grade</p>
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((f) => (
                <button key={f.id} onClick={() => setFilter(f.id)} className={`px-2.5 py-1 rounded-full text-[11px] ${filter === f.id ? "bg-fuchsia-500 text-black font-bold" : "bg-white/10 border border-white/15"}`}>{f.label}</button>
              ))}
            </div>
          </section>

          <button
            onClick={exportClip}
            disabled={!ready || exporting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-white text-black font-bold text-sm disabled:opacity-40"
          >
            {exporting ? <><Loader2 className="w-4 h-4 animate-spin" /> Exporting {progress}%</> : <><Download className="w-4 h-4" /> Export clip</>}
          </button>
          {exporting && (
            <button onClick={() => { videoRef.current?.pause(); recRef.current?.stop(); }} className="w-full flex items-center justify-center gap-2 py-2 rounded-full border border-white/20 text-xs">
              <Square className="w-3 h-3" /> Stop export
            </button>
          )}
        </div>
      </div>
    </div>
  );
}