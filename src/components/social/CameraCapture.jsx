import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Camera, X, Loader2, SwitchCamera, Check } from "lucide-react";

export default function CameraCapture({ onClose, onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [shot, setShot] = useState("");
  const [saving, setSaving] = useState(false);
  const [facing, setFacing] = useState("user");

  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => {}); }
        setReady(true);
      } catch (e) {
        setError("Camera unavailable — check the browser's camera permission.");
      }
    };
    start();
    return () => { cancelled = true; streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, [facing]);

  const snap = () => {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth || 720;
    canvas.height = v.videoHeight || 720;
    canvas.getContext("2d").drawImage(v, 0, 0, canvas.width, canvas.height);
    setShot(canvas.toDataURL("image/jpeg", 0.9));
  };

  const useShot = async () => {
    if (!shot) return;
    setSaving(true);
    try {
      const blob = await (await fetch(shot)).blob();
      const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      if (res?.file_url) { onCapture({ url: res.file_url, type: "image" }); onClose(); }
      else setError("Upload failed — try again.");
    } catch (e) { setError("Upload failed — try again."); }
    setSaving(false);
  };

  const retake = () => setShot("");

  return (
    <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden bg-neutral-950 border border-white/15">
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
          <p className="text-sm font-semibold flex items-center gap-2"><Camera className="w-4 h-4 text-amber-300" /> Camera</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))} title="Flip camera" className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center"><SwitchCamera className="w-3.5 h-3.5" /></button>
            <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="relative aspect-square bg-black">
          {shot ? <img src={shot} alt="capture" className="w-full h-full object-cover" /> : <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />}
          {!ready && !shot && !error && <div className="absolute inset-0 flex items-center justify-center text-sm text-neutral-400"><Loader2 className="w-4 h-4 animate-spin mr-2" /> Starting camera…</div>}
          {error && <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-rose-300">{error}</div>}
        </div>

        <div className="p-3 flex items-center justify-center gap-3">
          {shot ? (
            <>
              <button onClick={retake} className="px-4 py-2 rounded-full border border-white/20 text-sm">Retake</button>
              <button onClick={useShot} disabled={saving} className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-300 to-fuchsia-400 text-black text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Use photo
              </button>
            </>
          ) : (
            <button onClick={snap} disabled={!ready} className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-40"><Camera className="w-6 h-6" /></button>
          )}
        </div>
        <p className="text-[10px] text-neutral-500 text-center pb-3">Photos are stored publicly — anyone with the link can open them.</p>
      </div>
    </div>
  );
}