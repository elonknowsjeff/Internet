import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { handleOf } from "@/lib/socialNames";

const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);

// Favourites for articles: which ones the current user liked, plus real counts
// read from the like records so a like works on anyone's article.
export default function useArticleLikes(me) {
  const [liked, setLiked] = useState({});
  const [counts, setCounts] = useState({});

  useEffect(() => {
    base44.entities.ArticleLike.aggregate({ groupBy: "article_id" })
      .then((res) => {
        const map = {};
        asItems(res?.rows || res).forEach((r) => { map[r.article_id] = r.count; });
        setCounts(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!me) return;
    base44.entities.ArticleLike.filter({ user_id: me.id })
      .then((rows) => {
        const map = {};
        asItems(rows).forEach((l) => { map[l.article_id] = l.id; });
        setLiked(map);
      })
      .catch(() => {});
  }, [me]);

  const toggleLike = async (article) => {
    if (!me) return;
    const adjust = (delta) =>
      setCounts((c) => ({ ...c, [article.id]: Math.max(0, (c[article.id] || 0) + delta) }));

    if (liked[article.id]) {
      const id = liked[article.id];
      setLiked((s) => { const n = { ...s }; delete n[article.id]; return n; });
      adjust(-1);
      try { await base44.entities.ArticleLike.delete(id); } catch { adjust(1); }
    } else {
      adjust(1);
      try {
        const rec = await base44.entities.ArticleLike.create({
          article_id: article.id,
          user_id: me.id,
          user_handle: handleOf(me),
        });
        setLiked((s) => ({ ...s, [article.id]: rec.id }));
      } catch { adjust(-1); }
    }
  };

  const countOf = (article) => counts[article.id] ?? article.likes ?? 0;

  return { liked, counts, countOf, toggleLike };
}