/*
  Every route gets its own layout frame instead of one shared page template.
  - immersive : edge-to-edge media canvas, no sheet, no side padding
  - workspace : full-height tool surface, tight gutters
  - wide      : broad multi-column sheet for catalogs, maps and dashboards
  - column    : centred editorial column for feeds, readers and chat
*/
export const LAYOUTS = {
  "/": "column",
  "/news": "column",
  "/articles": "column",
  "/assistant": "column",
  "/messages": "workspace",

  "/music": "immersive",
  "/movies": "immersive",
  "/video": "immersive",
  "/radio": "immersive",
  "/gaming": "immersive",
  "/dating": "immersive",

  "/docs": "workspace",
  "/sheets": "workspace",
  "/slides": "workspace",
  "/notes": "workspace",
  "/calendar": "workspace",
  "/cloud": "workspace",
  "/desktop": "workspace",
  "/studio": "workspace",
  "/browser": "workspace",
  "/videoeditor": "workspace",
  "/gps": "workspace",
  "/transforms": "workspace",

  "/eats": "wide",
  "/rides": "wide",
  "/market": "wide",
  "/finance": "wide",
  "/hotels": "wide",
  "/flights": "wide",
  "/logistics": "wide",
  "/settings": "wide",
  "/profile": "wide",
  "/calculator": "wide",
};

const FRAMES = {
  immersive: "w-full",
  workspace: "w-full",
  wide: "mx-auto w-full max-w-[1580px] px-2 sm:px-4",
  column: "mx-auto w-full max-w-[1440px]",
};

export function frameFor(pathname) {
  const layout = LAYOUTS[pathname] || "column";
  return { layout, className: FRAMES[layout] || FRAMES.column };
}