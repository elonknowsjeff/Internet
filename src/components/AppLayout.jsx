import React from "react";
import { Outlet } from "react-router-dom";
import PageCanvas from "@/components/shell/PageCanvas";
import FloatingAssistant from "@/components/FloatingAssistant";
import AudioProvider from "@/components/AudioProvider";
import PlayerBar from "@/components/PlayerBar";
import VideoPlayerProvider from "@/components/VideoPlayerProvider";
import { SpotifyProvider } from "@/components/SpotifyProvider";
import FloatingVideo from "@/components/FloatingVideo";
import WelcomeOverlay from "@/components/WelcomeOverlay";
import SideNav from "@/components/SideNav";
import SystemSounds from "@/components/SystemSounds";

export default function AppLayout() {
  return (
    <AudioProvider>
      <VideoPlayerProvider>
        <SpotifyProvider>
          <div className="relative min-h-[100dvh] w-full max-w-full text-white overflow-x-hidden bg-[#0b0b0d]">
            <main className="relative z-10 w-full max-w-full min-h-[100dvh] lg:pl-[76px] pb-[calc(72px+env(safe-area-inset-bottom))]">
              <PageCanvas>
                <Outlet />
              </PageCanvas>
            </main>

            <SideNav />

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