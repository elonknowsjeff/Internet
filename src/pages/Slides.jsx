import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Play } from "lucide-react";
import SlidesHeader from "@/components/slides/SlidesHeader";
import SlidesRibbon from "@/components/slides/SlidesRibbon";
import SlideRail from "@/components/slides/SlideRail";
import SlideStage from "@/components/slides/SlideStage";
import PresentMode from "@/components/slides/PresentMode";
import DeckLibrary from "@/components/slides/DeckLibrary";
import { blankSlide } from "@/components/slides/slideThemes";

export default function Slides() {
  const [decks, setDecks] = useState([]);
  const [name, setName] = useState("Untitled deck");
  const [slides, setSlides] = useState([blankSlide()]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [presenting, setPresenting] = useState(false);
  const [tab, setTab] = useState("Home");
  const [openPanel, setOpenPanel] = useState(false);
  const [zoom, setZoom] = useState(100);

  const load = async () => {
    try { setDecks(await base44.entities.SlideDeck.list("-created_date", 50)); } catch (e) {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const cur = slides[active] || blankSlide();
  const update = (patch) => setSlides((s) => s.map((sl, i) => (i === active ? { ...sl, ...patch } : sl)));
  const addSlide = () => { setSlides((s) => [...s, { ...blankSlide(), color: cur.color }]); setActive(slides.length); };
  const delSlide = (i = active) => {
    if (slides.length <= 1) return;
    setSlides((s) => s.filter((_, x) => x !== i));
    setActive((a) => (i <= a ? Math.max(0, a - 1) : a));
  };
  const duplicate = () => {
    setSlides((s) => [...s.slice(0, active + 1), { ...cur }, ...s.slice(active + 1)]);
    setActive(active + 1);
  };
  const move = (dir, i = active) => {
    const j = i + dir;
    if (j < 0 || j >= slides.length) return;
    setSlides((s) => {
      const next = [...s];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setActive(j);
  };
  const setTheme = (key) => setSlides((s) => s.map((sl) => ({ ...sl, color: key })));
  const go = (d) => setActive((a) => Math.min(slides.length - 1, Math.max(0, a + d)));

  const save = async () => {
    setSaving(true);
    try {
      if (activeId) await base44.entities.SlideDeck.update(activeId, { name: name.trim() || "Untitled", slides });
      else {
        const rec = await base44.entities.SlideDeck.create({ name: name.trim() || "Untitled", slides });
        setActiveId(rec.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
      load();
    } catch (e) {}
    setSaving(false);
  };

  const openDeck = (d) => {
    setActiveId(d.id);
    setName(d.name);
    setSlides(d.slides?.length ? d.slides : [blankSlide()]);
    setActive(0);
    setOpenPanel(false);
  };
  const newDeck = () => {
    setActiveId(null);
    setName("Untitled deck");
    setSlides([blankSlide()]);
    setActive(0);
    setOpenPanel(false);
  };
  const remove = async (d) => {
    if (!confirm("Delete this deck?")) return;
    await base44.entities.SlideDeck.delete(d.id);
    if (activeId === d.id) newDeck();
    load();
  };

  useEffect(() => {
    if (!presenting) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Escape") setPresenting(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [presenting, slides.length]);

  if (presenting) {
    return <PresentMode slides={slides} active={active} go={go} onExit={() => setPresenting(false)} />;
  }

  return (
    <div className="relative flex flex-col h-[100dvh] -mb-24 pb-[62px] bg-[#0b0818] text-white overflow-hidden">
      <SlidesHeader
        name={name}
        setName={setName}
        saved={saved}
        saving={saving}
        onSave={save}
        onPresent={() => setPresenting(true)}
        onOpen={() => setOpenPanel(true)}
        onNew={newDeck}
      />

      <SlidesRibbon
        tab={tab}
        setTab={setTab}
        slide={cur}
        zoom={zoom}
        setZoom={setZoom}
        actions={{
          addSlide, duplicate, delSlide, move, update, setTheme,
          present: () => setPresenting(true),
          active, count: slides.length,
        }}
      />

      <div className="flex-1 flex min-h-0">
        <SlideRail
          slides={slides}
          active={active}
          setActive={setActive}
          addSlide={addSlide}
          move={move}
          delSlide={delSlide}
        />

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-auto grid place-items-center p-3 sm:p-6 bg-[radial-gradient(circle_at_50%_8%,rgba(168,85,247,0.16),transparent_62%)]">
            <SlideStage
              slide={cur}
              index={active}
              total={slides.length}
              deckName={name}
              zoom={zoom}
              onChange={update}
            />
          </div>

          <div className="h-9 shrink-0 flex items-center gap-3 px-3 bg-[#151030] border-t border-white/10 text-[11px] text-white/45">
            <span>Slide {active + 1} of {slides.length}</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline truncate max-w-[240px]">{name || "Untitled deck"}</span>
            <span className="hidden md:inline">· edits save when you press Save</span>
            <button onClick={() => setPresenting(true)} className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-md brand-grad text-black font-bold">
              <Play className="w-3 h-3" /> Present
            </button>
          </div>
        </div>
      </div>

      {openPanel && (
        <DeckLibrary
          decks={decks}
          loading={loading}
          onOpen={openDeck}
          onDelete={remove}
          onNew={newDeck}
          onClose={() => setOpenPanel(false)}
        />
      )}
    </div>
  );
}