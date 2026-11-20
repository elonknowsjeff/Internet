import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus } from "lucide-react";
import StoryViewer from "@/components/StoryViewer";
import StoryComposer from "@/components/stories/StoryComposer";

const RING = "neon-ring";
const initials = (name) => (name || "U")[0]?.toUpperCase();

export default function StoriesBar({ user }) {
  const [stories, setStories] = useState([]);
  const [composer, setComposer] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);

  const load = async () => {
    try { setStories(await base44.entities.Story.list("-created_date", 60)); } catch { setStories([]); }
  };
  useEffect(() => { load(); }, []);

  const myHandle = user?.username || (user?.email ? user.email.split("@")[0] : null);
  const authorName = user?.display_name || user?.full_name || "You";
  const authorAvatar = user?.avatar || "";

  const groups = [];
  const seen = new Map();
  for (const s of [...stories].reverse()) {
    const key = s.author_handle || "user";
    if (!seen.has(key)) {
      const g = { handle: key, name: s.author_name || key, avatar: s.author_avatar || "", items: [] };
      seen.set(key, g);
      groups.push(g);
    }
    seen.get(key).items.push({
      id: s.id,
      handle: key,
      name: s.author_name || key,
      avatar: s.author_avatar || "",
      image: s.image_url,
      text: s.caption,
      music_url: s.music_url,
      music_title: s.music_title,
      music_artist: s.music_artist,
    });
  }

  const mine = groups.find((g) => g.handle === myHandle) || null;
  const others = groups.filter((g) => g.handle !== myHandle);

  return (
    <>
      <div className="flex gap-4 px-4 py-3 overflow-x-auto scrollbar-none border-b border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent">
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <div className="relative">
            <button
              onClick={() => (mine ? setOpenGroup(mine) : setComposer(true))}
              className="block w-[62px] h-[62px] transition-transform duration-200 hover:scale-[1.04]"
            >
              <div className={`w-[62px] h-[62px] rounded-full p-[2px] ${mine ? RING : "bg-white/15 neon-edge-soft"}`}>
                <div className="w-full h-full rounded-full bg-[#2a2152] p-[2px]">
                  <div className="w-full h-full rounded-full bg-[#2a2152] overflow-hidden flex items-center justify-center">
                    {authorAvatar ? (
                      <img src={authorAvatar} alt="you" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-base font-bold text-amber-200">{initials(authorName)}</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
            <button
              onClick={() => setComposer(true)}
              title="Add to your story"
              className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-fuchsia-400 border-2 border-[#241d45] flex items-center justify-center hover:bg-fuchsia-300"
            >
              <Plus className="w-3 h-3 text-black" />
            </button>
          </div>
          <span className="text-[11px] text-white/75 max-w-[66px] truncate">{mine ? "Your story" : "Add story"}</span>
        </div>

        {others.map((g) => (
          <button key={g.handle} onClick={() => setOpenGroup(g)} className="flex flex-col items-center gap-1.5 shrink-0 group">
            <div className={`w-[62px] h-[62px] rounded-full p-[2px] ${RING} transition-transform duration-200 group-hover:scale-[1.04]`}>
              <div className="w-full h-full rounded-full bg-[#2a2152] p-[2px]">
                <div className="w-full h-full rounded-full bg-[#2a2152] overflow-hidden flex items-center justify-center">
                  {g.avatar ? (
                    <img src={g.avatar} alt={g.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-base font-bold text-fuchsia-200">{initials(g.name)}</span>
                  )}
                </div>
              </div>
            </div>
            <span className="text-[11px] text-white/75 max-w-[66px] truncate">@{g.handle}</span>
          </button>
        ))}
      </div>

      {openGroup && (
        <StoryViewer items={openGroup.items} startIdx={0} onClose={() => setOpenGroup(null)} />
      )}

      {composer && (
        <StoryComposer
          user={user}
          authorName={authorName}
          authorHandle={myHandle || "you"}
          authorAvatar={authorAvatar}
          onClose={() => setComposer(false)}
          onCreated={load}
        />
      )}
    </>
  );
}