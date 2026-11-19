import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send } from "lucide-react";

export default function GameComments({ game, onCommented }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    (async () => {
      try {
        const c = await base44.entities.Comment.filter(
          { post_id: game.id, target_type: "game" },
          "-created_date",
          100
        );
        setComments(c);
      } catch (e) {}
      setLoading(false);
    })();
  }, [game.id]);

  const submit = async () => {
    if (!text.trim()) return;
    const name = user?.display_name || user?.full_name || "You";
    const handle = user?.username || (user ? user.email?.split("@")[0] || "you" : "you");
    await base44.entities.Comment.create({
      post_id: game.id,
      target_type: "game",
      content: text.trim(),
      author_name: name,
      author_handle: handle,
      author_avatar: user?.avatar || "",
    });
    await base44.entities.Game.update(game.id, { comments: (game.comments || 0) + 1 });
    setText("");
    const c = await base44.entities.Comment.filter(
      { post_id: game.id, target_type: "game" },
      "-created_date",
      100
    );
    setComments(c);
    onCommented?.();
  };

  return (
    <div className="space-y-2 mt-2">
      {loading ? (
        <p className="text-xs text-neutral-500">Loading…</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-neutral-600">No comments yet — start the conversation.</p>
      ) : (
        comments.map((c) => (
          <div key={c.id} className="flex gap-2">
            {c.author_avatar ? (
              <img src={c.author_avatar} alt={c.author_name} className="w-7 h-7 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-fuchsia-400 to-cyan-500 flex items-center justify-center text-xs font-bold text-black shrink-0">
                {(c.author_name || "?")[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs">
                <span className="font-semibold">{c.author_name}</span> <span className="text-neutral-500">@{c.author_handle}</span>
              </p>
              <p className="text-sm text-neutral-200">{c.content}</p>
            </div>
          </div>
        ))
      )}
      <div className="flex gap-2 pt-1">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Comment…"
          className="flex-1 bg-black/40 border border-white/10 rounded-full px-3 py-1.5 text-sm outline-none focus:border-fuchsia-500"
        />
        <button onClick={submit} disabled={!text.trim()} className="w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-400 to-cyan-500 text-black flex items-center justify-center disabled:opacity-40">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}