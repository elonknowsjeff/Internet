import React from "react";
import { Play } from "lucide-react";
import { useSettings } from "@/components/SettingsContext";
import SettingsRow, { Group, Toggle } from "@/components/settings/SettingsRow";
import { SOUND_KINDS, playSound } from "@/lib/chime";

export default function SoundsPane() {
  const { settings, update } = useSettings();
  const sounds = settings.sounds || {};

  const set = (key, value) => update({ sounds: { ...sounds, [key]: value } });

  return (
    <div>
      <Group title="Sound & alerts" desc="Chimes built into the app — no files to download">
        {SOUND_KINDS.map((s) => (
          <SettingsRow key={s.key} title={s.label} desc={s.desc}>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => playSound(s.key)}
                title="Play a preview"
                className="grid h-7 w-7 place-items-center rounded-full border border-white/12 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Play className="h-3 w-3" />
              </button>
              <Toggle on={sounds[s.key] ?? true} onClick={() => set(s.key, !(sounds[s.key] ?? true))} label={s.label} />
            </div>
          </SettingsRow>
        ))}
      </Group>

      <Group title="How reminders work" desc="Set one from the Today card on your feed">
        <div className="space-y-1.5 px-4 py-3 text-[12.5px] leading-relaxed text-white/55">
          <p>Pick 5 minutes, 15 minutes or an hour — the app chimes and shows a note when the time comes.</p>
          <p>Notifications also chime when a new message or alert lands while you're in the app.</p>
          <p className="text-white/35">Browsers only allow sound after you've tapped once on the page, so the startup chime plays on your first tap of a session.</p>
        </div>
      </Group>
    </div>
  );
}