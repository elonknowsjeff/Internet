import React, { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { playSound, soundOn } from "@/lib/chime";
import { useToast } from "@/components/ui/use-toast";

const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);

// Startup sound, reminder alarms and new-message notifications for the whole app.
export default function SystemSounds() {
  const { toast } = useToast();
  const booted = useRef(false);

  useEffect(() => {
    if (sessionStorage.getItem("laxin_booted") === "1") return;
    const fire = () => {
      if (booted.current) return;
      booted.current = true;
      sessionStorage.setItem("laxin_booted", "1");
      window.removeEventListener("pointerdown", fire);
      window.removeEventListener("keydown", fire);
      if (soundOn("startup")) playSound("startup");
    };
    window.addEventListener("pointerdown", fire);
    window.addEventListener("keydown", fire);
    return () => {
      window.removeEventListener("pointerdown", fire);
      window.removeEventListener("keydown", fire);
    };
  }, []);

  useEffect(() => {
    const tick = async () => {
      try {
        const res = await base44.entities.TodoTask.filter({ done: false, reminded: false }, { sort: "remind_at", limit: 20 });
        const due = asItems(res).filter((t) => t.remind_at && new Date(t.remind_at).getTime() <= Date.now());
        for (const task of due) {
          if (soundOn("reminder")) playSound("reminder");
          toast({ title: "Reminder", description: task.title });
          await base44.entities.TodoTask.update(task.id, { reminded: true }).catch(() => {});
        }
      } catch {
        // not signed in yet
      }
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [toast]);

  useEffect(() => {
    let me = null;
    let unsub = null;
    base44.auth
      .me()
      .then((u) => {
        me = u;
        unsub = base44.entities.DirectMessage?.subscribe?.((event) => {
          const m = event?.data;
          if (event?.type !== "create" || !m || m.sender_id === me.id || m.receiver_id !== me.id) return;
          if (soundOn("notification")) playSound("notification");
          toast({ title: m.sender_name || `@${m.sender_handle || "member"}`, description: (m.content || "").slice(0, 90) });
        });
      })
      .catch(() => {});
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [toast]);

  return null;
}