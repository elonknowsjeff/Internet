import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, Eye, Clock, MoreHorizontal, Link2, Trash2, BookOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const handleOfArticle = (a) =>
  a.author_handle || (a.author_name || "member").toLowerCase().replace(/\s+/g, "");

const ago = (date) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: false });
  } catch {
    return "";
  }
};

export default function ArticleRow({ article, liked, count, isOwn, onOpen, onLike, onDelete }) {
  const copyLink = () =>
    navigator.clipboard?.writeText(`${window.location.origin}/articles`).catch(() => {});

  return (
    <div
      onClick={onOpen}
      className="group flex gap-3 px-4 py-3.5 border-b border-white/[0.06] hover:bg-white/[0.03] cursor-pointer transition-colors"
    >
      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-fuchsia-500 to-violet-600 grid place-items-center text-[13px] font-bold text-black">
        {article.author_avatar ? (
          <img src={article.author_avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          (article.author_name || "L")[0]?.toUpperCase()
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-[13px] min-w-0">
          <span className="font-semibold text-white/90 truncate">{article.author_name || "Laxin Plus"}</span>
          <span className="text-white/40 truncate">@{handleOfArticle(article)}</span>
          <span className="text-white/30">·</span>
          <span className="text-white/40 shrink-0">{ago(article.created_date)}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="ml-auto w-7 h-7 -mr-1 rounded-full grid place-items-center text-white/35 hover:text-white hover:bg-white/10 shrink-0"
                aria-label="Article options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={onOpen}>Read article</DropdownMenuItem>
              {article.cover && (
                <DropdownMenuItem onClick={() => navigator.clipboard?.writeText(article.cover)}>
                  Copy cover image link
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onLike(article)}>
                {liked ? "Remove from favourites" : "Add to favourites"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyLink}>
                <Link2 className="w-3.5 h-3.5 mr-2" /> Copy link
              </DropdownMenuItem>
              {isOwn && (
                <DropdownMenuItem onClick={onDelete} className="text-rose-400 focus:text-rose-400">
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="mt-0.5 font-bold text-[15px] leading-snug line-clamp-2">{article.title}</h3>
        {article.subtitle && (
          <p className="text-[13.5px] leading-relaxed text-white/50 mt-0.5 line-clamp-2">{article.subtitle}</p>
        )}

        <div className="mt-2 flex items-center gap-4 text-[12.5px] text-white/40">
          <button
            onClick={(e) => { e.stopPropagation(); onLike(article); }}
            className={`flex items-center gap-1.5 transition-colors ${liked ? "text-rose-400" : "hover:text-rose-400"}`}
            aria-label="Like article"
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-rose-400" : ""}`} />
            {count}
          </button>
          <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{article.views || 0}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{article.read_minutes || 3}m</span>
          <span className="hidden sm:flex items-center gap-1.5 truncate">
            <BookOpen className="w-4 h-4" />{article.category || "General"}
          </span>
        </div>
      </div>

      {article.cover && (
        <div className="w-[92px] h-[68px] rounded-xl overflow-hidden shrink-0 bg-white/10 border border-white/10">
          <img src={article.cover} alt="" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}