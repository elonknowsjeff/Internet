import React from "react";
import { Outlet } from "react-router-dom";
import PageCanvas from "@/components/shell/PageCanvas";
import AppBackground from "@/components/shell/AppBackground";
import FloatingAssistant from "@/components/FloatingAssistant";
import AudioProvider from "@/components/AudioProvider";
import PlayerBar from "@/components/PlayerBar";
import VideoPlayerProvider from "@/components/VideoPlayerProvider";
import { SpotifyProvider } from "@/components/SpotifyProvider";
import FloatingVideo from "@/components/FloatingVideo";
import WelcomeOverlay from "@/components/WelcomeOverlay";
import ZNav from "@/components/shell/ZNav";
import SystemSounds from "@/components/SystemSounds";
import ToastPopups from "@/components/ToastPopups";

export default function AppLayout() {
  return (
    <AudioProvider>
      <VideoPlayerProvider>
        <SpotifyProvider>
          <div className="relative min-h-[100dvh] w-full max-w-full text-[var(--text)] overflow-x-hidden bg-[var(--bg-base)]">
            <AppBackground />
            <main className="relative z-10 min-h-[100dvh] w-full pb-[calc(64px+env(safe-area-inset-bottom))] lg:ml-[260px] lg:pb-6">
              <PageCanvas>
                <Outlet />
              </PageCanvas>
            </main>

            <ZNav />

            <PlayerBar />
            <FloatingVideo />
            <FloatingAssistant />
            <WelcomeOverlay />
            <SystemSounds />
            <ToastPopups />
          </div>
        </SpotifyProvider>
      </VideoPlayerProvider>
    </AudioProvider>
  );
}