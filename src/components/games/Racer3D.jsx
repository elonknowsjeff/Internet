import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RotateCcw, Gauge } from "lucide-react";

const LANES = [-2.4, 0, 2.4];
const BEST_KEY = "walza_racer_best";

export default function Racer3D() {
  const mountRef = useRef(null);
  const apiRef = useRef({ reset: () => {}, left: () => {}, right: () => {} });
  const phaseRef = useRef("ready");
  const [phase, setPhase] = useState("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem(BEST_KEY) || 0));

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0618);
    scene.fog = new THREE.Fog(0x0a0618, 34, 100);

    const camera = new THREE.PerspectiveCamera(62, mount.clientWidth / mount.clientHeight, 0.1, 220);
    camera.position.set(0, 4.2, 8);
    camera.lookAt(0, 1, -18);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const sun = new THREE.DirectionalLight(0xf0a6ff, 1.5);
    sun.position.set(6, 14, 6);
    scene.add(sun);

    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1b1533, roughness: 0.9 });
    const lineMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, emissive: 0xf472b6, emissiveIntensity: 0.7 });
    const strips = [];
    for (let i = 0; i < 14; i++) {
      const road = new THREE.Mesh(new THREE.PlaneGeometry(9.4, 12), roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(0, 0, -i * 12);
      scene.add(road);
      const line = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 6), lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.02, -i * 12);
      scene.add(line);
      strips.push(road, line);
    }

    const railMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.6 });
    [-4.9, 4.9].forEach((x) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 180), railMat);
      rail.position.set(x, 0.35, -80);
      scene.add(rail);
    });

    const car = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.55, 2.6),
      new THREE.MeshStandardMaterial({ color: 0xa855f7, metalness: 0.55, roughness: 0.28 })
    );
    body.position.y = 0.52;
    car.add(body);
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.45, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.6, roughness: 0.22 })
    );
    roof.position.set(0, 0.98, -0.1);
    car.add(roof);
    car.position.set(LANES[1], 0, 0);
    scene.add(car);

    const OB_COLORS = [0xf472b6, 0x22d3ee, 0xfbbf24];
    const obstacles = [];
    const place = (o, zStart) => {
      o.position.set(LANES[Math.floor(Math.random() * 3)], 0, zStart - Math.random() * 26);
    };
    for (let i = 0; i < 7; i++) {
      const g = new THREE.Group();
      const color = OB_COLORS[i % OB_COLORS.length];
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 1.3, 1.5),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3, roughness: 0.5 })
      );
      box.position.y = 0.65;
      g.add(box);
      scene.add(g);
      place(g, -32 - i * 22);
      obstacles.push(g);
    }

    const state = { speed: 0, distance: 0, over: false, lane: 1 };
    let lastScore = -1;

    const reset = () => {
      state.speed = 0;
      state.distance = 0;
      state.over = false;
      state.lane = 1;
      lastScore = -1;
      car.position.x = LANES[1];
      obstacles.forEach((o, i) => place(o, -40 - i * 22));
      setScore(0);
      phaseRef.current = "playing";
      setPhase("playing");
    };
    const move = (dir) => {
      state.lane = Math.min(2, Math.max(0, state.lane + dir));
    };
    apiRef.current = { reset, left: () => move(-1), right: () => move(1) };

    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") move(-1);
      else if (k === "arrowright" || k === "d") move(1);
      else if (k === " " && phaseRef.current === "over") reset();
    };
    window.addEventListener("keydown", onKey);

    const onResize = () => {
      if (!mount.clientWidth) return;
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    let last = performance.now();
    const step = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (phaseRef.current === "playing") {
        state.speed = Math.min(48, state.speed + dt * 10);
        state.distance += state.speed * dt;

        const targetX = LANES[state.lane];
        car.position.x += (targetX - car.position.x) * Math.min(1, dt * 10);
        car.rotation.z = -(targetX - car.position.x) * 0.14;

        strips.forEach((m) => {
          m.position.z += state.speed * dt;
          if (m.position.z > 26) m.position.z -= 168;
        });

        for (const o of obstacles) {
          o.position.z += state.speed * dt;
          if (o.position.z > 12) place(o, -110);
          if (o.position.z > -1.7 && o.position.z < 1.7 && Math.abs(o.position.x - car.position.x) < 1.35) {
            state.over = true;
          }
          o.rotation.y += dt * 1.6;
        }

        const nextScore = Math.floor(state.distance);
        if (nextScore !== lastScore) {
          lastScore = nextScore;
          setScore(nextScore);
        }

        if (state.over) {
          phaseRef.current = "over";
          setPhase("over");
          setBest((b) => {
            const nb = Math.max(b, nextScore);
            localStorage.setItem(BEST_KEY, String(nb));
            return nb;
          });
        }
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative w-full aspect-[16/9] bg-[#0a0618] overflow-hidden">
      <div ref={mountRef} className="absolute inset-0" />

      <div className="absolute top-3 left-3 flex items-center gap-3 pointer-events-none">
        <span className="px-3 py-1.5 rounded-full bg-black/60 border border-white/15 text-xs font-bold flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-fuchsia-300" /> {score}m
        </span>
        <span className="px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-[11px] text-white/60">Best {best}m</span>
      </div>

      {phase !== "playing" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-center p-4">
          <p className="text-2xl font-black text-fuchsia-300">{phase === "over" ? "Crashed!" : "Nebula Racer"}</p>
          <p className="text-sm text-white/70 mt-1">
            {phase === "over" ? `You travelled ${score}m.` : "Dodge the blocks. Arrow keys or A / D to change lane."}
          </p>
          <button onClick={() => apiRef.current.reset()} className="mt-4 px-5 py-2.5 rounded-full bg-fuchsia-500 text-black font-bold text-sm flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> {phase === "over" ? "Race again" : "Start race"}
          </button>
        </div>
      )}

      <div className="sm:hidden absolute bottom-3 inset-x-0 flex justify-center gap-3">
        <button onClick={() => apiRef.current.left()} className="w-14 h-14 rounded-full bg-white/15 border border-white/25 text-xl font-bold">←</button>
        <button onClick={() => apiRef.current.right()} className="w-14 h-14 rounded-full bg-white/15 border border-white/25 text-xl font-bold">→</button>
      </div>
    </div>
  );
}