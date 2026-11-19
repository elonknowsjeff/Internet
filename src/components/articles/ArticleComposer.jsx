import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Send } from "lucide-react";
import { ArticleCoverPicker } from "@/components/articles/ArticleReader";
import { handleOf, nameOf } from "@/lib/socialNames";

const CATEGORIES = ["Business", "Tech", "Culture", "Money", "How-to", "Story"];

export default function ArticleComposer({ user, onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", subtitle: "", body: "", category: "Business", cover: "" });
  const [saving, setSaving] = useState(false);
  const words = form.body.trim().split(/\s+/).filter(Boolean).length;

  const publish = async () => {
    if (!form.title.trim() || !form.body.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Article.create({
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        body: form.body.trim(),
        category: form.category,
        cover: form.cover,
        read_minutes: Math.max(1, Math.round(words / 200)),
        author_name: user ? nameOf(user) : "Guest writer",
        author_handle: user ? handleOf(user) : "guest",
        author_avatar: user?.avatar || "",
      });
      onCreated();
    } catch (e) {}
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-[#1a1430] border border-white/15 shadow-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">New article</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-2.5">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Headline" className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 outline-none focus:border-fuchsia-400 text-sm font-semibold" />
          <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="One-line summary" className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 outline-none focus:border-fuchsia-400 text-sm" />
          <div className="flex items-center gap-3">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-white/5 border border-white/15 rounded-xl px-3 py-2 outline-none text-sm">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <ArticleCoverPicker value={form.cover} onChange={(url) => setForm((f) => ({ ...f, cover: url }))} />
            <span className="ml-auto text-[11px] text-white/40">{words} words · {Math.max(1, Math.round(words / 200))} min</span>
          </div>
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={12} placeholder="Write your article. Leave a blank line between paragraphs." className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 outline-none focus:border-fuchsia-400 text-sm leading-relaxed" />
        </div>
        <button onClick={publish} disabled={saving || !form.title.trim() || !form.body.trim()} className="mt-3 w-full py-2.5 rounded-full bg-fuchsia-500 text-black font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40">
          <Send className="w-4 h-4" /> {saving ? "Publishing…" : "Publish article"}
        </button>
      </div>
    </div>
  );
}