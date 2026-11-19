import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Heart, ImagePlus, Loader2, Eye } from "lucide-react";
import ArticleComments from "@/components/articles/ArticleComments";

export default function ArticleReader({ article, onBack, liked, likeCount, onLike, user }) {
  const paragraphs = (article.body || "").split(/\n{2,}/).filter(Boolean);

  return (
    <article className="flex justify-center">
      <div className="flex-1 min-w-0 max-w-[680px] min-h-screen border-x border-white/[0.08] pb-28">
        <div className="sticky top-0 z-30 bg-[#0d0920]/80 backdrop-blur-2xl border-b border-white/[0.06] h-[54px] flex items-center gap-2 px-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full grid place-items-center text-white/75 hover:bg-white/10"
            aria-label="Back to articles"
          >
            <ArrowLeft className="w-[19px] h-[19px]" />
          </button>
          <h2 className="text-[17px] font-extrabold tracking-tight">Article</h2>
          <button
            onClick={onLike}
            className={`ml-auto flex items-center gap-1.5 px-3 h-9 rounded-full border transition-colors ${
              liked
                ? "border-rose-400/40 text-rose-400 bg-rose-400/10"
                : "border-white/15 text-white/75 hover:bg-white/10"
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-rose-400" : ""}`} />
            <span className="text-[13px] font-bold">{likeCount ?? article.likes ?? 0}</span>
          </button>
        </div>

        <div className="px-5 sm:px-7 pt-5">
          {article.cover && (
            <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 mb-5">
              <img src={article.cover} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          <span className="text-[10px] uppercase tracking-widest text-fuchsia-300">{article.category || "General"}</span>
          <h1 className="text-2xl sm:text-[32px] font-extrabold font-display leading-tight mt-2">{article.title}</h1>
          {article.subtitle && <p className="text-base sm:text-lg text-white/55 mt-2 leading-relaxed">{article.subtitle}</p>}

          <div className="flex items-center gap-2.5 mt-4 pb-4 border-b border-white/[0.08]">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 grid place-items-center text-black text-xs font-bold overflow-hidden shrink-0">
              {article.author_avatar ? (
                <img src={article.author_avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                (article.author_name || "L")[0]?.toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[13.5px] font-semibold truncate">{article.author_name || "Laxin Plus"}</p>
              <p className="text-[11.5px] text-white/45 flex items-center gap-2">
                <span>{article.read_minutes || 3} min read</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views || 0}</span>
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-[16px] leading-[1.75] text-white/85">
            {paragraphs.length ? (
              paragraphs.map((p, i) => (
                <p key={i} className="whitespace-pre-wrap">{p}</p>
              ))
            ) : (
              <p className="text-white/40">This article is still empty.</p>
            )}
          </div>

          <button
            onClick={onLike}
            className={`mt-8 mb-4 w-full py-2.5 rounded-full border font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
              liked
                ? "border-rose-400/40 text-rose-400 bg-rose-400/10"
                : "border-white/15 text-white/80 hover:bg-white/10"
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-rose-400" : ""}`} />
            {liked ? "Saved to favourites" : "Add to favourites"} · {likeCount ?? article.likes ?? 0}
          </button>

          <ArticleComments article={article} user={user} />
        </div>
      </div>
    </article>
  );
}

export function ArticleCoverPicker({ value, onChange }) {
  const [busy, setBusy] = useState(false);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      if (res?.file_url) onChange(res.file_url);
    } catch (err) {}
    setBusy(false);
    e.target.value = "";
  };

  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm text-white/70 hover:text-white">
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
      {value ? "Cover added" : "Add cover image"}
      <input type="file" accept="image/*" onChange={upload} className="hidden" />
    </label>
  );
}