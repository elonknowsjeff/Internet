import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import PageCanvas from "@/components/shell/PageCanvas";
import AppBackground from "@/components/shell/AppBackground";
import FloatingAssistant from "@/components/FloatingAssistant";
import AudioProvider from "@/components/AudioProvider";
import PlayerBar from "@/components/PlayerBar";
import VideoPlayerProvider from "@/components/VideoPlayerProvider";
import { SpotifyProvider } from "@/components/SpotifyProvider";
import FloatingVideo from "@/components/FloatingVideo";
import WelcomeOverlay from "@/components/WelcomeOverlay";
import SideNav from "@/components/SideNav";
import SystemSounds from "@/components/SystemSounds";
import ToastPopups from "@/components/ToastPopups";

export default function AppLayout() {
  const location = useLocation();
  const isDesktop = location.pathname === "/";
  return (
    <AudioProvider>
      <VideoPlayerProvider>
        <SpotifyProvider>
          <div className="relative min-h-[100dvh] w-full max-w-full text-white overflow-x-hidden bg-[#0b0b0d]">
            <AppBackground />
            <main className={`relative z-10 w-full max-w-full min-h-[100dvh] ${isDesktop ? "" : "pb-[calc(88px+env(safe-area-inset-bottom))]"}`}>
              <PageCanvas>
                <Outlet />
              </PageCanvas>
            </main>

            {!isDesktop && <SideNav />}

            <PlayerBar />
            <FloatingVideo />
            {!isDesktop && <FloatingAssistant />}
            <WelcomeOverlay />
            <SystemSounds />
            <ToastPopups />
          </div>
        </SpotifyProvider>
      </VideoPlayerProvider>
    </AudioProvider>
  );
}