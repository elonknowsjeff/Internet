import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Plus, Loader2, ImagePlus } from "lucide-react";

const CATEGORIES = ["Furniture", "Electronics", "Vehicles", "Fashion", "Home", "Sports", "Toys", "Free", "Other"];
const CONDITIONS = ["New", "Like new", "Good", "Fair", "For parts"];

const handleOf = (u) => u?.username || (u?.email ? u.email.split("@")[0] : "member");
const nameOf = (u) => u?.display_name || u?.full_name || handleOf(u);

export default function SellListingDialog({ me, onClose, onSaved }) {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    category: "Furniture",
    condition: "Good",
    location: "",
    delivery: "pickup",
  });

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const upload = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 6 - photos.length);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const res = await base44.integrations.Core.UploadPublicFile({ file });
        if (res?.file_url) urls.push(res.file_url);
      }
      setPhotos((p) => [...p, ...urls].slice(0, 6));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const submit = async () => {
    if (!form.title.trim() || photos.length === 0 || saving) return;
    setSaving(true);
    try {
      await base44.entities.Listing.create({
        title: form.title.trim(),
        price: Number(form.price) || 0,
        description: form.description.trim(),
        category: form.category,
        condition: form.condition,
        images: photos,
        location: form.location.trim(),
        delivery: form.delivery,
        status: "available",
        seller_id: me?.id || "",
        seller_name: nameOf(me),
        seller_handle: handleOf(me),
        seller_avatar: me?.avatar || "",
      });
      onSaved();
    } finally { setSaving(false); }
  };

  const ready = !!form.title.trim() && photos.length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-white/[0.12] gloss-strong sm:rounded-3xl animate-slide-up">
        <div className="flex items-center justify-between border-b border-white/[0.09] px-4 py-3">
          <h2 className="flex items-center gap-2 text-[15px] font-bold"><Plus className="h-4 w-4 text-[var(--brand)]" /> Sell something</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto thin-scrollbar p-4">
          <div>
            <p className="mb-1.5 text-[11px] uppercase tracking-[0.14em] text-white/35">Photos · {photos.length}/6</p>
            <div className="grid grid-cols-3 gap-1.5">
              {photos.map((url, i) => (
                <div key={url + i} className="relative aspect-square overflow-hidden rounded-xl border border-white/10">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                    className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/75 text-white hover:bg-black"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {photos.length < 6 && (
                <label className="grid aspect-square cursor-pointer place-items-center gap-1 rounded-xl border border-dashed border-white/20 bg-white/[0.03] text-white/45 hover:border-white/40 hover:text-white">
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                  <span className="text-[10px]">{uploading ? "Uploading" : "Add photo"}</span>
                  <input type="file" accept="image/*" multiple onChange={upload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <input
            value={form.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="What are you selling?"
            className="w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-sm outline-none placeholder-white/35 focus:border-white/30"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => set({ price: e.target.value })}
              placeholder="Price $ (0 = free)"
              className="rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-sm outline-none placeholder-white/35 focus:border-white/30"
            />
            <input
              value={form.location}
              onChange={(e) => set({ location: e.target.value })}
              placeholder="Location"
              className="rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-sm outline-none placeholder-white/35 focus:border-white/30"
            />
            <select
              value={form.category}
              onChange={(e) => set({ category: e.target.value })}
              className="rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-sm outline-none"
            >
              {CATEGORIES.map((c) => <option key={c} className="bg-neutral-900">{c}</option>)}
            </select>
            <select
              value={form.condition}
              onChange={(e) => set({ condition: e.target.value })}
              className="rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-sm outline-none"
            >
              {CONDITIONS.map((c) => <option key={c} className="bg-neutral-900">{c}</option>)}
            </select>
            <select
              value={form.delivery}
              onChange={(e) => set({ delivery: e.target.value })}
              className="col-span-2 rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-sm outline-none"
            >
              <option value="pickup" className="bg-neutral-900">Pickup only</option>
              <option value="shipping" className="bg-neutral-900">Shipping available</option>
              <option value="both" className="bg-neutral-900">Pickup or shipping</option>
            </select>
          </div>

          <textarea
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
            rows={3}
            placeholder="Describe it — size, condition, anything buyers should know"
            className="w-full resize-none rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-sm outline-none placeholder-white/35 focus:border-white/30"
          />
        </div>

        <div className="border-t border-white/[0.09] bg-black/25 p-3">
          <button
            onClick={submit}
            disabled={!ready || saving || !me}
            className="w-full rounded-full brand-grad py-2.5 text-[13px] font-bold text-black disabled:opacity-40"
          >
            {saving ? "Listing…" : me ? "List for sale" : "Sign in to list"}
          </button>
        </div>
      </div>
    </div>
  );
}