import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Camera, Loader2, Sparkles, Trash2 } from "lucide-react";

const USERNAME_RE = /^[a-z0-9_]{3,15}$/;
const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);

export default function EditProfileDialog({ open, user, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [link, setLink] = useState("");
  const [avatar, setAvatar] = useState("");
  const [banner, setBanner] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setName(user.display_name || user.full_name || "");
    setUsername(user.username || (user.email ? user.email.split("@")[0] : ""));
    setBio(user.bio || "");
    setLink(user.bio_link || "");
    setAvatar(user.avatar || "");
    setBanner(user.banner || "");
    setPhone(user.phone || "");
    setStatus("");
  }, [open, user]);

  // live username availability — same behaviour as X
  useEffect(() => {
    if (!open) return;
    const candidate = username.trim().toLowerCase();
    if (!candidate || candidate === (user?.username || "")) { setStatus(""); return; }
    if (!USERNAME_RE.test(candidate)) { setStatus("invalid"); return; }
    let alive = true;
    setStatus("checking");
    const t = setTimeout(async () => {
      try {
        const rows = asItems(await base44.entities.User.filter({ username: candidate }));
        if (!alive) return;
        setStatus(rows.some((u) => u.id !== user?.id) ? "taken" : "ok");
      } catch {
        if (alive) setStatus("ok");
      }
    }, 420);
    return () => { alive = false; clearTimeout(t); };
  }, [username, open, user]);

  if (!open) return null;

  const upload = async (kind, file) => {
    if (!file) return;
    setBusy(kind);
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      if (res?.file_url) {
        if (kind === "avatar") setAvatar(res.file_url);
        else setBanner(res.file_url);
      }
    } catch {}
    setBusy("");
  };

  const generateAvatar = async () => {
    if (busy) return;
    setBusy("avatar");
    try {
      const res = await base44.integrations.Core.GenerateImage({
        prompt: `Profile picture avatar for ${name || "a person"}, ${bio ? `who describes themselves as: ${bio}.` : ""} Modern editorial portrait, stylized digital illustration, glossy purple and magenta lighting, soft gradient background, centered head and shoulders, confident expression, high detail, no text.`,
      });
      if (res?.url) setAvatar(res.url);
    } catch {}
    setBusy("");
  };

  const blocked = !username.trim() || status === "taken" || status === "invalid" || status === "checking";

  const save = async () => {
    if (blocked || saving) return;
    setSaving(true);
    const patch = {
      display_name: name.trim(),
      username: username.trim().toLowerCase(),
      bio: bio.trim(),
      bio_link: link.trim(),
      avatar,
      banner,
      phone: phone.trim(),
    };
    try {
      await base44.auth.updateMe(patch);
      onSaved?.(patch);
      onClose?.();
    } catch {}
    setSaving(false);
  };

  const msg = {
    taken: "That username is taken. Try another.",
    invalid: "Usernames are 3–15 characters: letters, numbers, underscores.",
    checking: "Checking availability…",
    ok: "Username is available",
  }[status];

  const field = "rounded-lg border border-white/15 focus-within:border-fuchsia-400/70 px-3 pt-1 pb-1.5";

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-start sm:items-center justify-center" onClick={onClose}>
      <div
        className="w-full sm:max-w-lg h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto bg-[#0c0619] sm:rounded-2xl sm:border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center gap-4 px-3 py-2.5 bg-[#0c0619]/95 backdrop-blur border-b border-white/10">
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-white/10 grid place-items-center"><X className="w-5 h-5" /></button>
          <h2 className="flex-1 text-lg font-bold">Edit profile</h2>
          <button
            onClick={save}
            disabled={blocked || saving}
            className="px-4 py-1.5 rounded-full bg-white text-black text-sm font-bold disabled:opacity-40 flex items-center gap-1.5"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save
          </button>
        </div>

        <div className="relative h-32 bg-gradient-to-r from-fuchsia-700/50 via-violet-700/40 to-cyan-700/40">
          {banner && <img src={banner} alt="" className="w-full h-full object-cover" />}
          <label className="absolute inset-0 grid place-items-center cursor-pointer bg-black/25 hover:bg-black/40 transition-colors">
            {busy === "banner" ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { upload("banner", e.target.files?.[0]); e.target.value = ""; }} />
          </label>
        </div>

        <div className="relative -mt-11 px-4 flex items-end gap-2">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-[#0c0619] bg-neutral-800 shrink-0">
            {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : <span className="w-full h-full grid place-items-center text-neutral-500 text-xs">No photo</span>}
            <label className="absolute inset-0 grid place-items-center bg-black/35 hover:bg-black/55 cursor-pointer transition-colors">
              {busy === "avatar" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { upload("avatar", e.target.files?.[0]); e.target.value = ""; }} />
            </label>
          </div>
          <div className="flex flex-wrap gap-1.5 pb-1">
            <button
              type="button"
              onClick={generateAvatar}
              disabled={busy === "avatar"}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-fuchsia-400/50 bg-fuchsia-500/15 text-[11px] font-semibold text-fuchsia-200 hover:bg-fuchsia-500/25 disabled:opacity-50"
            >
              {busy === "avatar" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI photo
            </button>
            {avatar && (
              <button
                type="button"
                onClick={() => setAvatar("")}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/15 text-[11px] font-semibold text-white/60 hover:bg-white/10"
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            )}
          </div>
        </div>

        <div className="p-4 space-y-3">
          <label className={`block ${field}`}>
            <span className="block text-[11px] text-white/45">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={50} placeholder="Your name" className="w-full bg-transparent outline-none text-sm" />
          </label>

          <label className={`block ${field}`}>
            <span className="block text-[11px] text-white/45">Username</span>
            <div className="flex items-center">
              <span className="text-sm text-white/45">@</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 15))}
                placeholder="username"
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
          </label>
          {msg && (
            <p className={`text-[11px] ${status === "taken" || status === "invalid" ? "text-rose-400" : status === "ok" ? "text-emerald-400" : "text-white/45"}`}>{msg}</p>
          )}

          <label className={`block ${field}`}>
            <span className="block text-[11px] text-white/45">Bio</span>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={160} placeholder="Describe yourself" className="w-full bg-transparent outline-none text-sm resize-none" />
          </label>
          <p className="text-[11px] text-white/35 text-right">{bio.length}/160</p>

          <label className={`block ${field}`}>
            <span className="block text-[11px] text-white/45">Link in bio</span>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              maxLength={120}
              placeholder="https://your-site.com"
              className="w-full bg-transparent outline-none text-sm"
            />
          </label>

          <label className={`block ${field}`}>
            <span className="block text-[11px] text-white/45">Phone number</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={32}
              placeholder="+1 555 123 4567"
              className="w-full bg-transparent outline-none text-sm"
            />
          </label>
        </div>
      </div>
    </div>
  );
}