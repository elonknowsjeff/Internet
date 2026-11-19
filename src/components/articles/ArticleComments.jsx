import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { MessageCircle, Send, Trash2, Loader2 } from "lucide-react";

export default function ArticleComments({ article, user }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const page = await base44.entities.ArticleComment.filter(
        { article_id: article.id },
        { sort: "-created_date", limit: 100 }
      );
      setComments(Array.isArray(page) ? page : page?.items || []);
    } catch (e) {
      setComments([]);
    }
  };

  useEffect(() => { load(); }, [article.id]);

  const name = user?.display_name || user?.full_name || "You";
  const handle = user?.username || (user ? (name.toLowerCase().replace(/\s+/g, "") || user.email?.split("@")[0]) : "you");

  const submit = async () => {
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    try {
      await base44.entities.ArticleComment.create({
        article_id: article.id,
        text: body,
        author_name: name,
        author_handle: handle,
        author_avatar: user?.avatar || "",
      });
      setText("");
      load();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (c) => {
    await base44.entities.ArticleComment.delete(c.id);
    setComments((prev) => prev.filter((x) => x.id !== c.id));
  };

  return (
    <section className="mt-6 border-t border-white/[0.08] pt-5">
      <h3 className="flex items-center gap-2 text-[14px] font-bold">
        <MessageCircle className="h-4 w-4" style={{ color: "var(--brand)" }} />
        Comments <span className="text-white/35">{comments.length}</span>
      </h3>

      <div className="mt-3 flex items-start gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full brand-grad text-[11px] font-bold text-black">
          {user?.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : name[0]?.toUpperCase()}
        </span>
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Add a comment…"
            className="w-full resize-none rounded-xl border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-[13.5px] outline-none placeholder-white/35 focus:border-white/25"
          />
          <div className="mt-1.5 flex justify-end">
            <button
              onClick={submit}
              disabled={!text.trim() || busy}
              className="flex items-center gap-1.5 rounded-full brand-grad px-3.5 py-1.5 text-[12px] font-bold text-black disabled:opacity-40"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Comment
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {comments.length === 0 ? (
          <p className="text-[12.5px] text-white/35">No comments yet — start the conversation.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-white/[0.1] text-[11px] font-bold text-white/70">
                {c.author_avatar ? <img src={c.author_avatar} alt="" className="h-full w-full object-cover" /> : (c.author_name || "L")[0]?.toUpperCase()}
              </span>
              <div className="min-w-0 flex-1 rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2">
                <p className="flex items-center gap-1.5 text-[12px]">
                  <span className="font-semibold">{c.author_name || "Reader"}</span>
                  <span className="text-white/35">@{c.author_handle || "reader"}</span>
                </p>
                <p className="mt-0.5 whitespace-pre-wrap text-[13px] leading-relaxed text-white/80">{c.text}</p>
              </div>
              {user && c.created_by_id === user.id && (
                <button onClick={() => remove(c)} title="Delete" className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/35 hover:bg-rose-500/20 hover:text-rose-300">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}