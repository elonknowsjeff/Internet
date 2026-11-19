import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Mic, Sparkles, Loader2, X, ImagePlus } from "lucide-react";

export default function MessageComposer({ peerName, onSend }) {
  const [draft, setDraft] = useState("");
  const [rec, setRec] = useState(null);
  const [secs, setSecs] = useState(0);
  const [busy, setBusy] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const recRef = useRef(null);
  const startRef = useRef(0);
  const chunks = useRef([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!rec) { setSecs(0); return undefined; }
    const t = setInterval(() => setSecs(Math.floor((Date.now() - rec.start) / 1000)), 500);
    return () => clearInterval(t);
  }, [rec]);

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onSend({ content: text, kind: "text" });
    setDraft("");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => { if (e.data.size) chunks.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const seconds = Math.max(1, Math.round((Date.now() - startRef.current) / 1000));
        const blob = new Blob(chunks.current, { type: mr.mimeType || "audio/webm" });
        if (!blob.size) return;
        setBusy("voice");
        try {
          const file = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type || "audio/webm" });
          const res = await base44.integrations.Core.UploadPrivateFile({ file });
          if (res?.file_uri) onSend({ content: "Voice message", kind: "voice", media_url: res.file_uri, duration: seconds });
        } finally { setBusy(""); }
      };
      recRef.current = mr;
      startRef.current = Date.now();
      mr.start();
      setRec({ start: startRef.current });
    } catch {
      setBusy("");
    }
  };

  const stopRecording = (cancel = false) => {
    const mr = recRef.current;
    setRec(null);
    if (!mr) return;
    if (cancel) mr.onstop = () => mr.stream.getTracks().forEach((t) => t.stop());
    mr.stop();
    recRef.current = null;
  };

  const generateImage = async () => {
    const text = prompt.trim();
    if (!text || busy) return;
    setBusy("image");
    try {
      const res = await base44.integrations.Core.GenerateImage({ prompt: `${text}. High quality, vivid, social-media ready image.` });
      if (res?.url) onSend({ content: text, kind: "image", media_url: res.url });
      setPrompt("");
      setAiOpen(false);
    } finally { setBusy(""); }
  };

  const attach = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy("upload");
    try {
      const res = await base44.integrations.Core.UploadPrivateFile({ file });
      if (res?.file_uri) onSend({ content: file.name, kind: "image", media_url: res.file_uri });
    } finally { setBusy(""); }
  };

  return (
    <div className="border-t border-white/[0.08] bg-[#0b0619]/60 backdrop-blur-xl shrink-0">
      {aiOpen && (
        <div className="px-3 pt-3">
          <div className="rounded-2xl border border-white/[0.1] bg-white/[0.04] p-2.5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-white/60 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[var(--brand)]" /> Make an AI image to send</p>
              <button onClick={() => setAiOpen(false)} className="text-white/40 hover:text-white"><X className="w-3.5 h-3.5" /></button>
            </div>
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generateImage()}
                placeholder="Describe the picture…"
                className="flex-1 min-w-0 bg-black/30 border border-white/10 rounded-full px-3.5 py-2 text-sm outline-none focus:border-[var(--brand)]"
              />
              <button onClick={generateImage} disabled={!prompt.trim() || !!busy} className="px-3.5 py-2 rounded-full bg-white text-black text-xs font-bold flex items-center gap-1.5 disabled:opacity-40">
                {busy === "image" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {busy === "image" ? "Drawing" : "Generate"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-3 py-2.5">
        {rec ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-200 text-sm">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              Recording {String(Math.floor(secs / 60)).padStart(2, "0")}:{String(secs % 60).padStart(2, "0")}
            </span>
            <button onClick={() => stopRecording(true)} title="Cancel" className="w-9 h-9 rounded-full bg-white/[0.07] border border-white/10 grid place-items-center"><X className="w-4 h-4" /></button>
            <button onClick={() => stopRecording(false)} title="Send voice message" className="ml-auto w-9 h-9 rounded-full bg-[var(--brand)] text-white grid place-items-center">
              {busy === "voice" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-1.5">
            <label title="Send a photo" className="w-9 h-9 rounded-full grid place-items-center text-white/60 hover:text-white hover:bg-white/[0.07] cursor-pointer shrink-0">
              {busy === "upload" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-[18px] h-[18px]" />}
              <input type="file" accept="image/*" onChange={attach} className="hidden" />
            </label>
            <button onClick={() => setAiOpen((v) => !v)} title="AI image" className={`w-9 h-9 rounded-full grid place-items-center shrink-0 ${aiOpen ? "text-[var(--brand)] bg-white/[0.07]" : "text-white/60 hover:text-white hover:bg-white/[0.07]"}`}>
              <Sparkles className="w-[18px] h-[18px]" />
            </button>
            <div className="flex-1 min-w-0 bg-white/[0.06] border border-white/[0.08] rounded-[22px] px-4 py-2.5 focus-within:border-[var(--brand)]/60 transition-colors">
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
                rows={1}
                placeholder={`Message ${peerName || ""}…`}
                className="w-full bg-transparent outline-none text-[15px] resize-none max-h-28 placeholder-white/40"
              />
            </div>
            {draft.trim() ? (
              <button onClick={submit} title="Send" className="w-9 h-9 rounded-full bg-[var(--brand)] text-white grid place-items-center shrink-0 hover:brightness-110">
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={startRecording} title="Record a voice message" className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] grid place-items-center shrink-0 text-white/70 hover:text-white">
                <Mic className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}