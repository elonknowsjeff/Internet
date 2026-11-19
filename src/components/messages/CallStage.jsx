import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff } from "lucide-react";
import { nameOf } from "@/lib/socialNames";

const clock = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export default function CallStage({ call }) {
  const { state } = call;
  const remoteRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const localRef = useRef(null);
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    if (remoteRef.current) remoteRef.current.srcObject = state.remoteStream || null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = state.remoteStream || null;
  }, [state.remoteStream]);
  useEffect(() => { if (localRef.current) localRef.current.srcObject = state.localStream || null; }, [state.localStream]);

  useEffect(() => {
    if (state.status !== "live" || !state.started) { setSecs(0); return undefined; }
    const tick = () => setSecs(Math.floor((Date.now() - state.started) / 1000));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [state.status, state.started]);

  if (state.status === "idle") return null;

  const peer = state.peer || {};
  const ended = state.status === "ended";
  const video = state.kind === "video";
  const statusLine = ended
    ? state.reason || "Call ended"
    : state.status === "live"
      ? clock(secs)
      : state.status === "calling"
        ? "Connecting…"
        : "Starting…";

  return (
    <div className="fixed inset-0 z-[80] bg-[#07050f]/97 backdrop-blur-xl flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="relative rounded-3xl overflow-hidden border border-white/12 bg-black/50 aspect-video flex items-center justify-center">
          {video && !ended ? (
            <video ref={remoteRef} autoPlay playsInline className="w-full h-full object-cover bg-black" />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center text-black text-3xl font-bold">
                {peer.avatar ? <img src={peer.avatar} alt="" className="w-full h-full object-cover" /> : (nameOf(peer)[0] || "U").toUpperCase()}
              </div>
              {!ended && <span className="flex items-center gap-1.5 text-emerald-300 text-xs"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> on the call</span>}
            </div>
          )}
          {!video && <audio ref={remoteAudioRef} autoPlay className="hidden" />}
          {video && state.localStream && !ended && (
            <video ref={localRef} autoPlay playsInline muted className="absolute bottom-3 right-3 w-28 sm:w-36 rounded-xl border border-white/20 bg-black object-cover aspect-video" />
          )}
        </div>

        <div className="text-center mt-5">
          <p className="text-xl font-bold">{nameOf(peer)}</p>
          <p className="text-sm text-white/50 mt-1 tabular-nums">{statusLine}</p>
        </div>

        <div className="flex items-center justify-center gap-3 mt-6">
          {ended ? (
            <button onClick={call.close} className="px-6 py-2.5 rounded-full brand-grad text-black font-semibold text-sm">Close</button>
          ) : (
            <>
              <button onClick={call.toggleMute} title={state.muted ? "Unmute" : "Mute"} className={`w-12 h-12 rounded-full flex items-center justify-center border ${state.muted ? "bg-rose-500/20 border-rose-400/40 text-rose-300" : "bg-white/10 border-white/15"}`}>
                {state.muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              {video && (
                <button onClick={call.toggleCam} title={state.camOn ? "Turn camera off" : "Turn camera on"} className={`w-12 h-12 rounded-full flex items-center justify-center border ${state.camOn ? "bg-white/10 border-white/15" : "bg-rose-500/20 border-rose-400/40 text-rose-300"}`}>
                  {state.camOn ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
              )}
              <button onClick={call.hangup} title="End call" className="w-14 h-14 rounded-full bg-rose-500 text-white flex items-center justify-center">
                <PhoneOff className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}