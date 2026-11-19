import React, { useEffect, useRef } from "react";
import { ArrowLeft, Phone, Video, Info } from "lucide-react";
import { handleOf, nameOf } from "@/lib/socialNames";
import MessageBubble from "@/components/messages/MessageBubble";
import MessageComposer from "@/components/messages/MessageComposer";

export default function MessageThread({ me, active, messages, onSend, onBack, onOpenProfile, call }) {
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [messages.length, active?.id]);

  const peer = { id: active?.id, name: nameOf(active), avatar: active?.avatar };

  return (
    <div className="h-full flex flex-col">
      <header className="shrink-0 flex items-center gap-2 px-3 h-[56px] border-b border-white/[0.08] bg-[#0b0619]/80 backdrop-blur-xl">
        <button onClick={onBack} className="sm:hidden w-9 h-9 rounded-full hover:bg-white/[0.07] grid place-items-center shrink-0">
          <ArrowLeft className="w-[18px] h-[18px]" />
        </button>
        <button onClick={() => onOpenProfile?.(active)} className="flex items-center gap-2.5 min-w-0 flex-1 text-left group">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-white/10 grid place-items-center shrink-0">
            {active?.avatar
              ? <img src={active.avatar} alt="" className="w-full h-full object-cover" />
              : <span className="text-[13px] font-bold text-white/70">{(nameOf(active) || "U")[0]?.toUpperCase()}</span>}
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-bold truncate leading-tight group-hover:underline">{nameOf(active)}</p>
            <p className="text-[12px] text-white/40 truncate">@{handleOf(active)}</p>
          </div>
        </button>
        <button onClick={() => call?.start(active, "audio")} title="Voice call" className="w-9 h-9 rounded-full hover:bg-white/[0.07] grid place-items-center text-white/70 hover:text-white shrink-0">
          <Phone className="w-[18px] h-[18px]" />
        </button>
        <button onClick={() => call?.start(active, "video")} title="Video call" className="w-9 h-9 rounded-full hover:bg-white/[0.07] grid place-items-center text-white/70 hover:text-white shrink-0">
          <Video className="w-[18px] h-[18px]" />
        </button>
        <button onClick={() => onOpenProfile?.(active)} title="Conversation info" className="hidden sm:grid w-9 h-9 rounded-full hover:bg-white/[0.07] place-items-center text-white/70 hover:text-white shrink-0">
          <Info className="w-[18px] h-[18px]" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto thin-scrollbar px-4 py-4 space-y-2.5">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-white/10 grid place-items-center mx-auto">
              {active?.avatar
                ? <img src={active.avatar} alt="" className="w-full h-full object-cover" />
                : <span className="text-lg font-bold text-white/60">{(nameOf(active) || "U")[0]?.toUpperCase()}</span>}
            </div>
            <p className="text-[15px] font-bold mt-3">{nameOf(active)}</p>
            <p className="text-[13px] text-white/40 mt-1">No messages yet. Say hi to start the conversation.</p>
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} m={m} mine={m.sender_id === me?.id} peer={peer} />)
        )}
        <div ref={endRef} />
      </div>

      <MessageComposer peerName={nameOf(active)} onSend={onSend} />
    </div>
  );
}