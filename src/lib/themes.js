// Full color themes for the home shell + background.
// Each theme drives CSS variables in index.css via [data-theme="<id>"].
export const THEMES = [
  { id: "daylight", label: "Daylight", dark: false, base: "#F7F6FB", aurora: ["#FFD1E8", "#CFE3FF", "#E4D4FF"], accent: "#6D5EF5", accent2: "#F058A8" },
  { id: "peach", label: "Peach Fizz", dark: false, base: "#FFF6F1", aurora: ["#FFC9B0", "#FFE3A8", "#FFB8D4"], accent: "#FF6A3D", accent2: "#FF3D8B" },
  { id: "mint", label: "Mint Cloud", dark: false, base: "#F2FBF8", aurora: ["#B8F0DC", "#C6E6FF", "#D9F5B8"], accent: "#00B890", accent2: "#2E8BFF" },
  { id: "sky", label: "Sky Glass", dark: false, base: "#F2F8FF", aurora: ["#BFDDFF", "#D6CCFF", "#BFF0FF"], accent: "#2E7BFF", accent2: "#00C2FF" },
  { id: "lavender", label: "Lavender Haze", dark: false, base: "#F7F3FF", aurora: ["#DCC8FF", "#FFC8EA", "#C9D6FF"], accent: "#8A4DFF", accent2: "#E04DFF" },
  { id: "citrus", label: "Citrus Pop", dark: false, base: "#FFFBEF", aurora: ["#FFE680", "#FFC48A", "#D2F59A"], accent: "#FF8A00", accent2: "#FF3D5A" },
  { id: "midnight", label: "Midnight Neon", dark: true, base: "#0B0B14", aurora: ["#3B1FA8", "#0A6FD6", "#A8148F"], accent: "#7C5CFF", accent2: "#00E1FF" },
  { id: "cyber", label: "Cyber Grid", dark: true, base: "#070A12", aurora: ["#00A3A3", "#1C3BFF", "#7A00FF"], accent: "#00F0FF", accent2: "#7A5CFF" },
  { id: "borealis", label: "Aurora Borealis", dark: true, base: "#08121A", aurora: ["#00B38A", "#2A5BFF", "#8A3DFF"], accent: "#34F5C5", accent2: "#6C8CFF" },
  { id: "sunset", label: "Sunset Drive", dark: true, base: "#140A12", aurora: ["#FF4D6D", "#FF9A3D", "#7A2DFF"], accent: "#FF5C7A", accent2: "#FFB23D" },
  { id: "ultraviolet", label: "Ultraviolet", dark: true, base: "#0E0718", aurora: ["#7A1FFF", "#FF2DAA", "#2B3BFF"], accent: "#B46CFF", accent2: "#FF4DC4" },
  { id: "graphite", label: "Graphite Mono", dark: true, base: "#0F1013", aurora: ["#2A2D38", "#3A3F52", "#22252E"], accent: "#E8E9F2", accent2: "#9AA0B8" },
];

export const DEFAULT_THEME = "midnight";
export const getTheme = (id) => THEMES.find((t) => t.id === id) || THEMES.find((t) => t.id === DEFAULT_THEME);