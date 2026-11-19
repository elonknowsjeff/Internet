import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Check } from "lucide-react";
import SettingsRow, { Group } from "@/components/settings/SettingsRow";
import ProfilePhotoDialog from "@/components/profile/ProfilePhotoDialog";
import MembershipPlans from "@/components/settings/MembershipPlans";

export default function AccountPane() {
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => { setUser(u); setPhone(u?.phone || ""); }).catch(() => {});
  }, []);

  const savePhone = async () => {
    if (!user) return;
    await base44.auth.updateMe({ phone: phone.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const name = user ? user.display_name || user.full_name || "Member" : "Not signed in";

  return (
    <div>
      <Group title="Your account" desc="Profile, photo and how people reach you">
        <SettingsRow title={name} desc={user?.email || "Sign in to personalize your profile"}>
          <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-500 text-[15px] font-bold text-black">
            {user?.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : (name[0] || "U").toUpperCase()}
          </span>
        </SettingsRow>

        <SettingsRow title="Profile photo" desc="Used on your posts, messages and marketplace listings">
          <button
            onClick={() => setPhotoOpen(true)}
            disabled={!user}
            className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-[11.5px] font-semibold hover:bg-white/10 disabled:opacity-40"
          >
            Change
          </button>
        </SettingsRow>

        <SettingsRow title="Messaging number" desc="Only people searching this exact number can find you.">
          <div className="flex w-full flex-col items-end gap-1.5 sm:w-64">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 416 555 0134"
              className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-1.5 text-[12.5px] outline-none placeholder-white/30 focus:border-white/30"
            />
            <button
              onClick={savePhone}
              disabled={!user}
              className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold hover:bg-white/10 disabled:opacity-40"
            >
              {saved ? <><Check className="h-3 w-3" /> Saved</> : "Save number"}
            </button>
          </div>
        </SettingsRow>
      </Group>

      <Group title="Membership" desc="Plans and billing for your account">
        <div className="p-3">
          <MembershipPlans />
        </div>
      </Group>

      <ProfilePhotoDialog
        open={photoOpen}
        user={user}
        onClose={() => setPhotoOpen(false)}
        onSaved={(url) => setUser((u) => Object.assign({}, u, { avatar: url }))}
      />
    </div>
  );
}