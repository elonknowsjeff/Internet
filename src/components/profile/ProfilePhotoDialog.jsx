import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Camera, Loader2, Trash2, Check } from "lucide-react";

export default function ProfilePhotoDialog({ open, user, onClose, onSaved }) {
  const [preview, setPreview] = useState(user?.avatar || "");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const pick = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      if (res?.file_url) setPreview(res.file_url);
    } catch {}
    setBusy(false);
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await base44.auth.updateMe({ avatar: preview });
      onSaved?.(preview);
      onClose?.();
    } catch {}
    setSaving(false);
  };

  const name = user?.display_name || user?.full_name || "You";

  return (
    <div className="fixed inset-0 z-[75] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#140e2b] p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[15px]">Profile photo</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full grid place-items-center hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex justify-center">
          <label className="relative w-28 h-28 rounded-full overflow-hidden border border-white/15 bg-white/10 cursor-pointer group">
            {preview ? (
              <img src={preview} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="w-full h-full grid place-items-center text-2xl font-bold text-white/60">{name[0]?.toUpperCase()}</span>
            )}
            <span className="absolute inset-0 grid place-items-center bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity">
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
        </div>

        <div className="flex items-center justify-center gap-2">
          <label className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[12px] font-semibold cursor-pointer hover:bg-white/15 flex items-center gap-1.5">
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />} Upload photo
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
          {preview && (
            <button onClick={() => setPreview("")} className="px-3 py-1.5 rounded-full border border-white/15 text-[12px] font-semibold text-white/60 hover:bg-white/10 flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          )}
        </div>

        <button
          onClick={save}
          disabled={saving || busy}
          className="w-full py-2.5 rounded-full bg-white text-black font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save photo
        </button>
        <p className="text-[10px] text-white/35 text-center">Photo is stored publicly — anyone with the link can open it.</p>
      </div>
    </div>
  );
}