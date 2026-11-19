import { useCallback } from "react";
import { base44 } from "@/api/base44Client";
import useDirectCall from "@/lib/useDirectCall";

const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);

// Call anyone from anywhere in the social app by their handle.
export default function useSocialCall(me) {
  const call = useDirectCall(me);

  const startTo = useCallback(async (handle, kind = "audio") => {
    if (!handle || !me) return;
    try {
      const rows = asItems(await base44.entities.User.filter({ username: handle }));
      const peer = rows[0];
      if (peer) await call.start(peer, kind);
    } catch {}
  }, [me, call]);

  return { call, startTo };
}