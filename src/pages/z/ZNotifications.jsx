import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import NotificationCenter from "@/components/notifications/NotificationCenter";

export default function ZNotifications() {
  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);
  return (
    <div className="mx-auto w-full max-w-[640px] border-x border-[#2f3336] px-3 pb-24">
      <h1 className="sticky top-0 z-30 border-b border-[#2f3336] bg-black/85 py-4 text-[19px] font-extrabold backdrop-blur-xl">Notifications</h1>
      <div className="mt-3">
        <NotificationCenter user={user} />
      </div>
    </div>
  );
}