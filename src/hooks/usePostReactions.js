import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { handleOf, nameOf } from "@/lib/socialNames";

const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);

// Counter bumps are cosmetic: never let a blocked/failed write break the interaction.
const bump = (id, patch) => base44.entities.Post.update(id, patch).catch(() => {});

// Like + repost state for the current user, shared by the feed and profile.
export default function usePostReactions(me, posts, reload) {
  const [liked, setLiked] = useState({});
  const [reposted, setReposted] = useState({});

  useEffect(() => {
    if (!me) return;
    base44.entities.Like.filter({ user_id: me.id })
      .then((rows) => {
        const map = {};
        asItems(rows).forEach((l) => { map[l.post_id] = l.id; });
        setLiked(map);
      })
      .catch(() => {});
  }, [me]);

  useEffect(() => {
    if (!me) return;
    const mine = handleOf(me);
    const map = {};
    (posts || []).forEach((p) => { if (p.repost_of && p.author_handle === mine) map[p.repost_of] = p.id; });
    if (!Object.keys(map).length) return;
    setReposted((s) => ({ ...s, ...map }));
  }, [posts, me]);

  const toggleLike = async (p) => {
    if (liked[p.id]) {
      try { await base44.entities.Like.delete(liked[p.id]); } catch {}
      setLiked((s) => { const n = { ...s }; delete n[p.id]; return n; });
      await bump(p.id, { likes: Math.max(0, (p.likes || 0) - 1) });
    } else {
      try {
        const rec = await base44.entities.Like.create({ post_id: p.id, user_id: me?.id || "", user_handle: handleOf(me) });
        setLiked((s) => ({ ...s, [p.id]: rec.id }));
      } catch {}
      await bump(p.id, { likes: (p.likes || 0) + 1 });
    }
    reload?.();
  };

  const toggleRepost = async (p) => {
    const existing = reposted[p.id];
    if (existing) {
      try { await base44.entities.Post.delete(existing); } catch {}
      setReposted((s) => { const n = { ...s }; delete n[p.id]; return n; });
      await bump(p.id, { rebuzzs: Math.max(0, (p.rebuzzs || 0) - 1) });
    } else {
      const rec = await base44.entities.Post.create({
        content: p.content,
        author_name: nameOf(me),
        author_handle: handleOf(me),
        author_avatar: me?.avatar || "",
        category: p.category || "general",
        repost_of: p.id,
        original_author_name: p.author_name,
        original_author_handle: p.author_handle,
      });
      setReposted((s) => ({ ...s, [p.id]: rec.id }));
      await bump(p.id, { rebuzzs: (p.rebuzzs || 0) + 1 });
    }
    reload?.();
  };

  return { liked, reposted, toggleLike, toggleRepost };
}