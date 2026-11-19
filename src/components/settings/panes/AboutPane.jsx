import React from "react";
import { base44 } from "@/api/base44Client";
import { LogOut } from "lucide-react";
import { useSettings } from "@/components/SettingsContext";
import SettingsRow, { Group } from "@/components/settings/SettingsRow";

export default function AboutPane() {
  const { reset } = useSettings();

  const logout = async () => {
    try { await base44.auth.logout(); } catch { window.location.href = "/"; }
  };

  return (
    <div>
      <Group title="About" desc="XSI · social, services and tools in one place">
        <SettingsRow title="Terms of Service" desc="How the app may be used" to="/terms" />
        <SettingsRow title="App version" desc="Base 1 · build 2026.11" />
      </Group>

      <Group title="Session">
        <SettingsRow title="Log off" desc="Sign out of this device" onClick={logout} danger>
          <LogOut className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
        </SettingsRow>
      </Group>

      <Group title="Reset" desc="Restores theme, background, panels and sound to defaults">
        <SettingsRow title="Reset all settings" desc="Your posts, messages and files are not touched" danger>
          <button
            onClick={() => { if (confirm("Reset all settings to defaults?")) reset(); }}
            className="shrink-0 rounded-full border border-rose-500/40 px-3 py-1.5 text-[11.5px] font-semibold text-rose-300 hover:bg-rose-500/10"
          >
            Reset
          </button>
        </SettingsRow>
      </Group>
    </div>
  );
}