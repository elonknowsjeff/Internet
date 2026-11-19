import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { X, Crosshair, RotateCcw } from "lucide-react";

export default function Shooter3D({ onClose }) {
  const mountRef = useRef(null);
  const apiRef = useRef({});
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(60);
  const [phase, setPhase] = useState("ready"); // ready | playing | over

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0716);
    scene.fog = new THREE.Fog(0x0b0716, 18, 46);

    const camera = new THREE.PerspectiveCamera(72, mount.clientWidth / mount.clientHeight, 0.1, 200);
    camera.position.set(0, 1.7, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xa78bfa, 0x120a24, 1.1));
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(6, 14, 8);
    scene.add(sun);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ color: 0x1a1030, roughness: 0.9 }),
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const grid = new THREE.GridHelper(80, 40, 0x7c3aed, 0x2d1b52);
    grid.position.y = 0.01;
    scene.add(grid);

    // pillars for depth
    for (let i = 0; i < 14; i++) {
      const h = 3 + Math.random() * 7;
      const p = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, h, 1.4),
        new THREE.MeshStandardMaterial({ color: 0x241a45, roughness: 0.7 }),
      );
      const a = (i / 14) * Math.PI * 2;
      p.position.set(Math.cos(a) * 26, h / 2, Math.sin(a) * 26);
      scene.add(p);
    }

    const targets = [];
    const targetGeo = new THREE.SphereGeometry(0.75, 24, 18);
    for (let i = 0; i < 6; i++) {
      const mat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xf43f5e, emissiveIntensity: 0.6 });
      const mesh = new THREE.Mesh(targetGeo, mat);
      mesh.userData.alive = true;
      placeTarget(mesh);
      scene.add(mesh);
      targets.push(mesh);
    }

    function placeTarget(mesh) {
      mesh.position.set((Math.random() - 0.5) * 26, 1.2 + Math.random() * 4, -6 - Math.random() * 18);
      mesh.scale.setScalar(1);
    }

    const state = {
      keys: {},
      yaw: 0,
      pitch: 0,
      onMove: null,
      onShoot: null,
    };

    const canvas = renderer.domElement;
    canvas.style.cursor = "crosshair";
    canvas.style.touchAction = "none";

    const onKey = (e, down) => { state.keys[e.key.toLowerCase()] = down; };
    const kd = (e) => { onKey(e, true); if ([" ", "arrowup", "arrowdown"].includes(e.key.toLowerCase())) e.preventDefault(); };
    const ku = (e) => onKey(e, false);

    const onMouseMove = (e) => {
      if (document.pointerLockElement !== canvas) return;
      state.yaw -= e.movementX * 0.0022;
      state.pitch = Math.max(-0.9, Math.min(0.9, state.pitch - e.movementY * 0.0022));
    };

    const raycaster = new THREE.Raycaster();
    const onShoot = () => {
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      const hit = raycaster.intersectObjects(targets.filter((t) => t.userData.alive), false)[0];
      if (hit) {
        hit.object.userData.alive = false;
        hit.object.scale.setScalar(0.001);
        placeTarget(hit.object);
        hit.object.userData.alive = true;
        state.onShoot?.();
      }
    };
    const onDown = () => { if (document.pointerLockElement === canvas) onShoot(); };

    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    document.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", onDown);

    let raf = 0;
    let last = performance.now();
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const speed = 7 * dt;
      const fwd = new THREE.Vector3(-Math.sin(state.yaw), 0, -Math.cos(state.yaw));
      const right = new THREE.Vector3(Math.cos(state.yaw), 0, -Math.sin(state.yaw));
      if (state.keys.w || state.keys.arrowup) camera.position.addScaledVector(fwd, speed);
      if (state.keys.s || state.keys.arrowdown) camera.position.addScaledVector(fwd, -speed);
      if (state.keys.a || state.keys.arrowleft) camera.position.addScaledVector(right, -speed);
      if (state.keys.d || state.keys.arrowright) camera.position.addScaledVector(right, speed);
      camera.position.x = Math.max(-24, Math.min(24, camera.position.x));
      camera.position.z = Math.max(-24, Math.min(24, camera.position.z));
      camera.rotation.set(state.pitch, state.yaw, 0, "YXZ");
      targets.forEach((t, i) => {
        t.rotation.y += dt * (0.6 + i * 0.1);
        t.position.y += Math.sin(now / 600 + i) * dt * 0.35;
      });
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    apiRef.current = {
      lock: () => canvas.requestPointerLock?.(),
      unlock: () => document.exitPointerLock?.(),
      onShoot: (fn) => { state.onShoot = fn; },
      reset: () => {
        camera.position.set(0, 1.7, 12);
        state.yaw = 0; state.pitch = 0;
        targets.forEach(placeTarget);
      },
    };

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mousedown", onDown);
      if (document.pointerLockElement === canvas) document.exitPointerLock?.();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
      });
      renderer.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const t = setInterval(() => {
      setTime((s) => {
        if (s <= 1) {
          clearInterval(t);
          apiRef.current.unlock?.();
          setPhase("over");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  const start = () => {
    setScore(0); setTime(60);
    apiRef.current.reset?.();
    apiRef.current.onShoot?.(() => setScore((s) => s + 1));
    setPhase("playing");
    apiRef.current.lock?.();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black">
      <div ref={mountRef} className="absolute inset-0" onClick={() => phase === "playing" && apiRef.current.lock?.()} />

      <div className="absolute inset-x-0 top-0 p-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center"><X className="w-4 h-4" /></button>
          <span className="px-3 py-1.5 rounded-full bg-black/60 border border-white/20 text-xs font-semibold">Nebula Strike 3D</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="px-3 py-1.5 rounded-full bg-black/60 border border-white/20">Score {score}</span>
          <span className="px-3 py-1.5 rounded-full bg-black/60 border border-white/20 tabular-nums">{time}s</span>
        </div>
      </div>

      {phase === "playing" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Crosshair className="w-6 h-6 text-fuchsia-300" />
        </div>
      )}

      {phase !== "playing" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#120c22] border border-white/15 p-6 text-center">
            <h2 className="text-2xl font-black">{phase === "over" ? "Time's up!" : "Nebula Strike 3D"}</h2>
            <p className="text-sm text-white/60 mt-2">
              {phase === "over" ? `You hit ${score} targets.` : "Move with WASD, look with the mouse, click to shoot the glowing targets."}
            </p>
            <button onClick={start} className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-white text-black font-bold text-sm">
              <RotateCcw className="w-4 h-4" /> {phase === "over" ? "Play again" : "Start"}
            </button>
            <button onClick={onClose} className="mt-2 w-full py-2 rounded-full border border-white/20 text-sm">Back to arcade</button>
          </div>
        </div>
      )}
    </div>
  );
}