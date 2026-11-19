import React from "react";
import { Outlet } from "react-router-dom";
import { useSettings } from "@/components/SettingsContext";
import AtmosphereBackground from "@/components/background/AtmosphereBackground";
import PageCanvas from "@/components/shell/PageCanvas";
import FloatingAssistant from "@/components/FloatingAssistant";
import AudioProvider from "@/components/AudioProvider";
import PlayerBar from "@/components/PlayerBar";
import VideoPlayerProvider from "@/components/VideoPlayerProvider";
import { SpotifyProvider } from "@/components/SpotifyProvider";
import FloatingVideo from "@/components/FloatingVideo";
import WelcomeOverlay from "@/components/WelcomeOverlay";
import RayField from "@/components/RayField";
import SideNav from "@/components/SideNav";
import FloatingIcons from "@/components/FloatingIcons";
import SystemSounds from "@/components/SystemSounds";

export default function AppLayout() {
  const { settings } = useSettings();

  return (
    <AudioProvider>
      <VideoPlayerProvider>
        <SpotifyProvider>
          <div className="relative min-h-[100dvh] w-full max-w-full text-white overflow-x-hidden">
            <AtmosphereBackground mode={settings.background} />
            <RayField />

            {/* each route owns its frame — see components/shell/pageLayouts */}
            <main className="relative z-10 w-full max-w-full min-h-[100dvh] lg:pl-[88px] pb-[calc(88px+env(safe-area-inset-bottom))]">
              <PageCanvas>
                <Outlet />
              </PageCanvas>
            </main>

            <SideNav />
            <FloatingIcons />

            <PlayerBar />
            <FloatingVideo />
            <FloatingAssistant />
            <WelcomeOverlay />
            <SystemSounds />
          </div>
        </SpotifyProvider>
      </VideoPlayerProvider>
    </AudioProvider>
  );
}