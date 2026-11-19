import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, ExternalLink, Loader2, Clock, Sparkles } from "lucide-react";
import { imageFor, CATEGORY_TINT, readingTime } from "@/lib/newsImages";

export default function NewsReader({ item, onClose }) {
  const [body, setBody] = useState(null);
  const [loading, setLoading] = useState(true);
  const cat = (item.category || "world").toLowerCase();
  const tint = CATEGORY_TINT[cat] || "text-white/60";

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setBody(null);
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a senior news editor writing for a reader inside XSI. Write a complete, balanced, factual article expanding this report. Today is November 16, 2026.\n\nHeadline: ${item.headline}\nSummary: ${item.summary || ""}\nSource: ${item.source || ""}\nCategory: ${item.category || "news"}\n\nUse live web context when it helps add accurate, current detail. Never invent quotes attributed to real people; describe positions instead. Return a short one-sentence standfirst (dek), six body paragraphs of three to four sentences each, and three key points.`,
          add_context_from_internet: true,
          model: "gemini_3_flash",
          response_json_schema: {
            type: "object",
            properties: {
              dek: { type: "string" },
              body: { type: "array", items: { type: "string" } },
              key_points: { type: "array", items: { type: "string" } },
            },
          },
        });
        if (alive) setBody(res || null);
      } catch (e) {
        if (alive) setBody({ dek: item.summary || "", body: [], key_points: [] });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [item]);

  const paragraphs = body?.body || [];
  const mins = readingTime(paragraphs.join(" ") || item.summary);

  return (
    <div className="fixed inset-0 z-[95] bg-[#080512]/97 backdrop-blur-2xl overflow-y-auto animate-fade-in">
      <div className="sticky top-0 z-10 bg-[#080512]/90 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-[760px] mx-auto flex items-center gap-3 px-4 h-14">
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/[0.07] border border-white/10 grid place-items-center hover:bg-white/15">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <p className="text-[12.5px] text-white/50 truncate flex-1">{item.source || "Article"}</p>
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.07] border border-white/10 text-[12px] font-semibold hover:bg-white/15"
            >
              Original <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      <article className="max-w-[760px] mx-auto px-5 sm:px-8 pt-6 pb-24">
        <span className={`text-[11px] font-bold uppercase tracking-[0.2em] ${tint}`}>{item.category || "news"}</span>
        <h1 className="mt-2 text-[28px] sm:text-[38px] font-black leading-[1.1] tracking-tight">{item.headline}</h1>
        {body?.dek && <p className="mt-3 text-[16px] sm:text-[18px] text-white/65 leading-snug">{body.dek}</p>}

        <div className="mt-4 flex items-center gap-3 text-[12px] text-white/40 border-b border-white/[0.08] pb-4">
          <span className="font-semibold text-white/60">{item.source}</span>
          <span className="w-1 h-1 rounded-full bg-white/25" />
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {mins} min read</span>
          <span className="ml-auto flex items-center gap-1 text-[11px] text-white/30"><Sparkles className="w-3 h-3" /> Expanded by XSI AI</span>
        </div>

        <div className="mt-5 rounded-2xl overflow-hidden">
          <img src={imageFor(cat)} alt="" className="w-full aspect-[16/9] object-cover" />
        </div>

        {loading ? (
          <div className="py-12 flex items-center gap-2 text-white/50 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Writing the full story…
          </div>
        ) : paragraphs.length === 0 ? (
          <p className="py-8 text-white/60 text-[16px] leading-relaxed">
            {item.summary || "No additional detail is available for this story yet."}
          </p>
        ) : (
          <>
            <div className="mt-6 space-y-4">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-[16.5px] leading-[1.78] text-white/80">
                  {p}
                </p>
              ))}
            </div>

            {body?.key_points?.length > 0 && (
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-2">Key points</p>
                <ul className="space-y-2">
                  {body.key_points.map((k, i) => (
                    <li key={i} className="flex gap-2 text-[14px] text-white/75 leading-snug">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--brand)" }} />
                      {k}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </article>
    </div>
  );
}