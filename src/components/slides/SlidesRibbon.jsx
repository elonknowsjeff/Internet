import React from "react";
import {
  FilePlus, Copy, Trash2, ChevronUp, ChevronDown, Type, List, Palette,
  MonitorPlay, ZoomIn, ZoomOut, Play,
} from "lucide-react";
import { THEMES } from "./slideThemes";

const TABS = ["Home", "Insert", "Design", "Slide Show"];

const Btn = ({ onClick, disabled, title, children, primary }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] whitespace-nowrap transition-colors disabled:opacity-30 ${
      primary ? "brand-grad text-black font-bold" : "text-white/80 hover:bg-white/10"
    }`}
  >
    {children}
  </button>
);

const Group = ({ label, children }) => (
  <div className="flex flex-col items-center gap-1 px-2.5 border-r border-white/10 last:border-r-0 shrink-0">
    <div className="flex items-center gap-1">{children}</div>
    <span className="text-[9px] uppercase tracking-[0.12em] text-white/30">{label}</span>
  </div>
);

export default function SlidesRibbon({ tab, setTab, slide, actions, zoom, setZoom }) {
  return (
    <div className="shrink-0 bg-[#120e28] border-b border-white/10">
      <div className="flex items-end gap-0.5 px-2 pt-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3.5 py-1.5 text-[11px] rounded-t-md border-b-2 transition-colors ${
              tab === t ? "bg-white/[0.07] border-[var(--brand)] font-semibold text-white" : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex items-stretch px-1.5 py-1.5 bg-white/[0.04] border-t border-white/10 overflow-x-auto scrollbar-none">
        {tab === "Home" && (
          <>
            <Group label="Slide">
              <Btn onClick={actions.addSlide} title="New slide"><FilePlus className="w-4 h-4" /> New</Btn>
              <Btn onClick={actions.duplicate} title="Duplicate"><Copy className="w-4 h-4" /> Duplicate</Btn>
              <Btn onClick={actions.delSlide} disabled={actions.count <= 1} title="Delete"><Trash2 className="w-4 h-4" /> Delete</Btn>
            </Group>
            <Group label="Arrange">
              <Btn onClick={() => actions.move(-1)} disabled={actions.active === 0} title="Move slide up"><ChevronUp className="w-4 h-4" /></Btn>
              <Btn onClick={() => actions.move(1)} disabled={actions.active === actions.count - 1} title="Move slide down"><ChevronDown className="w-4 h-4" /></Btn>
            </Group>
            <Group label="Text">
              <Btn onClick={() => actions.update({ title: slide.title || "New title" })}><Type className="w-4 h-4" /> Title</Btn>
              <Btn onClick={() => actions.update({ body: slide.body || "• First point\n• Second point" })}><List className="w-4 h-4" /> Bullets</Btn>
            </Group>
            <Group label="Zoom">
              <Btn onClick={() => setZoom((z) => Math.max(60, z - 10))} title="Zoom out"><ZoomOut className="w-4 h-4" /></Btn>
              <span className="text-[11px] text-white/50 tabular-nums w-8 text-center">{zoom}%</span>
              <Btn onClick={() => setZoom((z) => Math.min(130, z + 10))} title="Zoom in"><ZoomIn className="w-4 h-4" /></Btn>
            </Group>
          </>
        )}

        {tab === "Insert" && (
          <>
            <Group label="Content">
              <Btn onClick={() => actions.update({ title: slide.title || "Slide title" })}><Type className="w-4 h-4" /> Title box</Btn>
              <Btn onClick={() => actions.update({ body: slide.body || "• First point\n• Second point" })}><List className="w-4 h-4" /> Bullet box</Btn>
            </Group>
            <Group label="Slides">
              <Btn onClick={actions.addSlide}><FilePlus className="w-4 h-4" /> New slide</Btn>
              <Btn onClick={actions.duplicate}><Copy className="w-4 h-4" /> Duplicate</Btn>
            </Group>
          </>
        )}

        {tab === "Design" && (
          <Group label="Deck theme">
            {Object.entries(THEMES)
              .filter(([k]) => ["violet", "ocean", "forest", "ember", "graphite", "paper"].includes(k))
              .map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => actions.setTheme(k)}
                  title={v.label}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition-colors ${
                    slide.color === k ? "border-white/60 bg-white/10" : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-gradient-to-br ${v.grad}`} />
                  <span className="text-[11px] text-white/70">{v.label}</span>
                </button>
              ))}
            <span className="flex items-center gap-1 text-[10px] text-white/30 pl-2"><Palette className="w-3 h-3" /> applies to whole deck</span>
          </Group>
        )}

        {tab === "Slide Show" && (
          <>
            <Group label="Present">
              <Btn onClick={actions.present} primary><MonitorPlay className="w-4 h-4" /> From beginning</Btn>
              <Btn onClick={actions.present}><Play className="w-4 h-4" /> From current</Btn>
            </Group>
            <Group label="Format">
              <span className="text-[11px] text-white/40 px-2">16:9 widescreen</span>
            </Group>
          </>
        )}
      </div>
    </div>
  );
}