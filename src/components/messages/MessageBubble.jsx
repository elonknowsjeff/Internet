import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ImageIcon, Phone, PhoneMissed, Video } from "lucide-react";
import VoiceNote from "@/components/messages/VoiceNote";

function useSignedUrl(uri) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!uri) { setUrl(""); return undefined; }
    if (/^https?:\/\//i.test(uri) || uri.startsWith("data:")) { setUrl(uri); return undefined; }
    let live = true;
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 3600 })
      .then((r) => { if (live) setUrl(r?.signed_url || ""); })
      .catch(() => {});
    return () => { live = false; };
  }, [uri]);
  return url;
}

const timeOf = (ts) => (ts ? new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "");

export default function MessageBubble({ m, mine, peer }) {
  const url = useSignedUrl(m.kind === "image" ? m.media_url : "");

  if (m.kind === "call") {
    const Icon = m.call_kind === "video" ? Video : m.call_state === "declined" ? PhoneMissed : Phone;
    return (
      <div className="flex justify-center my-1">
        <span className="flex items-center gap-1.5 text-[11.5px] px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/55">
          <Icon className="w-3.5 h-3.5" />
          {m.call_kind === "video" ? "Video" : "Voice"} call · {m.call_state || "ended"}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
      {!mine && peer && (
        <div className="w-7 h-7 rounded-full overflow-hidden bg-white/10 shrink-0 mb-4">
          {peer.avatar ? <img src={peer.avatar} alt="" className="w-full h-full object-cover" /> : <span className="w-full h-full grid place-items-center text-[11px] font-bold text-white/70">{(peer.name || "U")[0]?.toUpperCase()}</span>}
        </div>
      )}
      <div className={`max-w-[76%] ${mine ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`px-4 py-2.5 text-[15px] leading-relaxed ${
            mine
              ? "bg-[var(--brand)] text-white rounded-[20px] rounded-br-[6px]"
              : "bg-white/[0.08] text-white/95 rounded-[20px] rounded-bl-[6px]"
          }`}
        >
          {m.kind === "voice" ? (
            <VoiceNote uri={m.media_url} duration={m.duration} mine={mine} />
          ) : m.kind === "image" ? (
            <div className="space-y-1.5">
              {url ? (
                <a href={url} target="_blank" rel="noreferrer" className="block">
                  <img src={url} alt={m.content || "Image"} className="rounded-xl max-h-64 w-full object-cover" />
                </a>
              ) : (
                <span className="flex items-center gap-1.5 text-xs opacity-70"><ImageIcon className="w-3.5 h-3.5" /> Loading image…</span>
              )}
              {m.content && <p className="text-[12px] opacity-70">{m.content}</p>}
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words">{m.content}</p>
          )}
        </div>
        <span className="text-[10.5px] text-white/35 px-1">{timeOf(m.created_date)}</span>
      </div>
    </div>
  );
}