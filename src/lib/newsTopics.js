import {
  Sparkles, Globe2, Cpu, Bot, Briefcase, FlaskConical, Trophy, Music2, HeartPulse, Landmark,
} from "lucide-react";

// One tile per topic: bright icon on top, label underneath, own glow colour.
export const TOPICS = [
  { key: "Top", icon: Sparkles, color: "#a855f7" },
  { key: "World", icon: Globe2, color: "#22d3ee" },
  { key: "Tech", icon: Cpu, color: "#38bdf8" },
  { key: "AI", icon: Bot, color: "#c084fc" },
  { key: "Business", icon: Briefcase, color: "#34d399" },
  { key: "Science", icon: FlaskConical, color: "#60a5fa" },
  { key: "Sports", icon: Trophy, color: "#fb923c" },
  { key: "Entertainment", icon: Music2, color: "#f472b6" },
  { key: "Health", icon: HeartPulse, color: "#fb7185" },
  { key: "Politics", icon: Landmark, color: "#fbbf24" },
];

export const colorFor = (category = "") => {
  const c = String(category).toLowerCase();
  const hit = TOPICS.find((t) => t.key.toLowerCase() === c);
  return hit ? hit.color : "#a855f7";
};

export const storyKey = (item) =>
  (item?.headline || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "story";