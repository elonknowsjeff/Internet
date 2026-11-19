import { useCallback, useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { handleOf, nameOf } from "@/lib/socialNames";

const ICE = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
const RING_MS = 45000;

const waitIce = (pc) =>
  new Promise((resolve) => {
    if (pc.iceGatheringState === "complete") return resolve();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      pc.removeEventListener("icegatheringstatechange", onChange);
      resolve();
    };
    const onChange = () => {
      if (pc.iceGatheringState === "complete") finish();
    };
    pc.addEventListener("icegatheringstatechange", onChange);
    setTimeout(finish, 3000);
  });

export default function useDirectCall(me) {
  const [state, setState] = useState({ status: "idle" });
  const [incoming, setIncoming] = useState(null);
  const pcRef = useRef(null);
  const localRef = useRef(null);
  const stateRef = useRef(state);
  const meRef = useRef(me);
  const seen = useRef(new Set());
  const ringTimer = useRef(null);
  stateRef.current = state;
  meRef.current = me;

  const teardown = useCallback(() => {
    clearTimeout(ringTimer.current);
    localRef.current?.getTracks?.().forEach((t) => t.stop());
    localRef.current = null;
    if (pcRef.current) {
      try { pcRef.current.close(); } catch { /* ignore */ }
    }
    pcRef.current = null;
  }, []);

  const logCall = useCallback(async (peer, data) => {
    const u = meRef.current;
    if (!u || !peer) return;
    try {
      await base44.entities.DirectMessage.create({
        sender_id: u.id,
        sender_name: nameOf(u),
        sender_handle: handleOf(u),
        sender_avatar: u.avatar || "",
        receiver_id: peer.id,
        receiver_name: nameOf(peer),
        receiver_handle: handleOf(peer),
        receiver_avatar: peer.avatar || "",
        content: data.content,
        kind: "call",
        call_id: data.call_id,
        call_kind: data.call_kind,
        call_state: data.call_state,
        call_payload: data.payload || "",
      });
    } catch { /* signal failed silently */ }
  }, []);

  const buildPeer = async (peer, kind) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: kind === "video" });
    localRef.current = stream;
    const pc = new RTCPeerConnection(ICE);
    pcRef.current = pc;
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    pc.ontrack = (e) => setState((s) => ({ ...s, remoteStream: e.streams[0] }));
    return { stream, pc };
  };

  const start = useCallback(async (peer, kind = "audio") => {
    if (!meRef.current || !peer || stateRef.current.status !== "idle") return;
    try {
      setState({ status: "calling", peer, kind });
      const { stream, pc } = await buildPeer(peer, kind);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await waitIce(pc);
      const id = `call_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setState({
        status: "calling", id, kind, peer, localStream: stream,
        muted: false, camOn: kind === "video", started: 0,
      });
      await logCall(peer, {
        call_id: id, call_kind: kind, call_state: "ringing",
        payload: JSON.stringify(pc.localDescription),
        content: `Outgoing ${kind === "video" ? "video" : "voice"} call`,
      });
      ringTimer.current = setTimeout(() => {
        logCall(peer, { call_id: id, call_kind: kind, call_state: "ended", content: "Missed call" });
        teardown();
        setState({ status: "ended", reason: "No answer", peer, kind });
      }, RING_MS);
    } catch (e) {
      teardown();
      setState({ status: "ended", reason: e?.message || "Camera or microphone is blocked.", peer, kind });
    }
  }, [logCall, teardown]);

  const accept = useCallback(async () => {
    const inc = incoming;
    if (!inc) return;
    setIncoming(null);
    try {
      setState({ status: "calling", peer: inc.peer, kind: inc.kind });
      const { stream, pc } = await buildPeer(inc.peer, inc.kind);
      await pc.setRemoteDescription(JSON.parse(inc.payload));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await waitIce(pc);
      setState({
        status: "live", id: inc.id, kind: inc.kind, peer: inc.peer,
        localStream: stream, muted: false, camOn: inc.kind === "video", started: Date.now(),
      });
      await logCall(inc.peer, {
        call_id: inc.id, call_kind: inc.kind, call_state: "accepted",
        payload: JSON.stringify(pc.localDescription), content: "Call accepted",
      });
    } catch (e) {
      teardown();
      setState({ status: "ended", reason: e?.message || "Could not join the call.", peer: inc.peer, kind: inc.kind });
    }
  }, [incoming, logCall, teardown]);

  const decline = useCallback(async () => {
    const inc = incoming;
    setIncoming(null);
    if (!inc) return;
    await logCall(inc.peer, { call_id: inc.id, call_kind: inc.kind, call_state: "declined", content: "Call declined" });
  }, [incoming, logCall]);

  const hangup = useCallback(async () => {
    const s = stateRef.current;
    clearTimeout(ringTimer.current);
    teardown();
    setState({ status: "ended", reason: "Call ended", peer: s.peer, kind: s.kind });
    if (s.id && s.peer) {
      await logCall(s.peer, { call_id: s.id, call_kind: s.kind, call_state: "ended", content: "Call ended" });
    }
  }, [logCall, teardown]);

  const close = useCallback(() => { teardown(); setState({ status: "idle" }); }, [teardown]);

  const toggleMute = useCallback(() => {
    const stream = localRef.current;
    if (!stream) return;
    const next = !stateRef.current.muted;
    stream.getAudioTracks().forEach((t) => { t.enabled = !next; });
    setState((s) => ({ ...s, muted: next }));
  }, []);

  const toggleCam = useCallback(() => {
    const stream = localRef.current;
    if (!stream) return;
    const next = !stateRef.current.camOn;
    stream.getVideoTracks().forEach((t) => { t.enabled = next; });
    setState((s) => ({ ...s, camOn: next }));
  }, []);

  const handleSignal = useCallback(async (m) => {
    const u = meRef.current;
    if (!u || !m || m.kind !== "call" || m.receiver_id !== u.id || m.sender_id === u.id) return;
    if (seen.current.has(m.id)) return;
    seen.current.add(m.id);

    const peer = {
      id: m.sender_id,
      full_name: m.sender_name,
      username: m.sender_handle,
      avatar: m.sender_avatar,
    };
    const s = stateRef.current;

    if (m.call_state === "ringing") {
      if (s.status !== "idle") {
        logCall(peer, { call_id: m.call_id, call_kind: m.call_kind, call_state: "declined", content: "Missed call" });
        return;
      }
      setIncoming({ id: m.call_id, kind: m.call_kind || "audio", payload: m.call_payload, peer });
      return;
    }

    if (m.call_state === "accepted" && s.id === m.call_id && pcRef.current) {
      try {
        await pcRef.current.setRemoteDescription(JSON.parse(m.call_payload));
        clearTimeout(ringTimer.current);
        setState((prev) => ({ ...prev, status: "live", started: Date.now() }));
      } catch { /* ignore bad payload */ }
      return;
    }

    if ((m.call_state === "ended" || m.call_state === "declined") && s.id === m.call_id) {
      teardown();
      setState({
        status: "ended",
        reason: m.call_state === "declined" ? "Call declined" : "Call ended",
        peer: s.peer, kind: s.kind,
      });
    }
  }, [logCall, teardown]);

  useEffect(() => {
    if (!me?.id) return undefined;
    const unsub = base44.entities.DirectMessage?.subscribe?.((event) => {
      if (event?.type === "create") handleSignal(event.data);
    });
    return () => { if (typeof unsub === "function") unsub(); };
  }, [me?.id, handleSignal]);

  useEffect(() => teardown, [teardown]);

  return { state, incoming, start, accept, decline, hangup, close, toggleMute, toggleCam };
}