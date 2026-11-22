import React from "react";
import { Outlet } from "react-router-dom";
import AudioProvider from "@/components/AudioProvider";
import VideoPlayerProvider from "@/components/VideoPlayerProvider";
import { SpotifyProvider } from "@/components/SpotifyProvider";
import FloatingVideo from "@/components/FloatingVideo";
import PlayerBar from "@/components/PlayerBar";
import ToastPopups from "@/components/ToastPopups";
import ZSidebar from "@/components/z/ZSidebar";
import ZBottomNav from "@/components/z/ZBottomNav";
import ZRightRail from "@/components/z/ZRightRail";

export default function ZLayout() {
  return (
    <AudioProvider>
      <VideoPlayerProvider>
        <SpotifyProvider>
          <div data-theme="z" className="relative min-h-[100dvh] w-full bg-black text-white">
            <ZSidebar />
            <div className="mx-auto flex w-full max-w-[1100px] gap-6 px-3 pb-24 md:pl-[92px] md:pr-4">
              <main className="min-w-0 flex-1">
                <Outlet />
              </main>
              <ZRightRail />
            </div>
            <ZBottomNav />
            <PlayerBar />
            <FloatingVideo />
            <ToastPopups />
          </div>
        </SpotifyProvider>
      </VideoPlayerProvider>
    </AudioProvider>
  );
}