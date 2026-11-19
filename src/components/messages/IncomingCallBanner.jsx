import React, { useEffect } from "react";
import { Phone, PhoneOff, Video } from "lucide-react";
import { nameOf, handleOf } from "@/lib/socialNames";
import { startRingtone } from "@/lib/chime";

export default function IncomingCallBanner({ incoming, onAccept, onDecline }) {
  // Apple-style ring while the call is waiting for an answer.
  useEffect(() => {
    if (!incoming) return;
    const stop = startRingtone();
    return stop;
  }, [incoming?.callId || incoming?.peer?.id || incoming]);

  if (!incoming) return null;
  const peer = incoming.peer || {};
  const video = incoming.kind === "video";

  return (
    <div className="fixed top-4 right-4 z-[85] w-[300px] rounded-2xl bg-[#140f26]/95 backdrop-blur-xl border border-white/15 p-3 shadow-2xl animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center text-black font-bold shrink-0">
          {peer.avatar ? <img src={peer.avatar} alt="" className="w-full h-full object-cover" /> : (nameOf(peer)[0] || "U").toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{nameOf(peer)}</p>
          <p className="text-[11px] text-white/50 truncate">
            @{handleOf(peer)} · incoming {video ? "video" : "voice"} call
          </p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={onAccept} className="flex-1 py-2 rounded-full bg-emerald-500 text-black text-xs font-bold flex items-center justify-center gap-1.5">
          {video ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />} Answer
        </button>
        <button onClick={onDecline} className="flex-1 py-2 rounded-full bg-rose-500/90 text-white text-xs font-bold flex items-center justify-center gap-1.5">
          <PhoneOff className="w-3.5 h-3.5" /> Decline
        </button>
      </div>
    </div>
  );
}