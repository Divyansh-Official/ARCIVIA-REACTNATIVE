// themeRegistery.ts
// ─────────────────────────────────────────────────────────────────────
// This file lives at:   app/theme/themeRegistery.ts
// Assets live at:       assets/theme/
// So requires go:       ../../assets/theme/
// ─────────────────────────────────────────────────────────────────────
import { ThemeName } from "./theme";

export type ThemeRegistryEntry = {
  name: ThemeName;
  label: string;
  icon: any;
  gradients: [string, string];
  glow: string;
};

// ── Icons ─────────────────────────────────────────────────────────────
const Icons = {
  light: require("../assets/theme_icons/theme01_icon.png"),
  eclipse: require("../assets/theme_icons/theme02_icon.png"),
  dark: require("../assets/theme_icons/theme03_icon.png"),

};

// ── Registry ──────────────────────────────────────────────────────────
export const THEME_REGISTRY: ThemeRegistryEntry[] = [
  {
    name: "light",
    label: "Light",
    icon: Icons.dark,
    gradients: ["rgba(243,219,206,0.95)", "rgba(255,240,230,0.85)"],
    glow: "rgba(255,140,105,0.6)",
  },
  {
    name: "eclipse",
    label: "Eclipse",
    icon: Icons.eclipse,
    gradients: ["rgba(200,190,255,0.95)", "rgba(220,215,255,0.85)"],
    glow: "rgba(158,152,224,0.6)",
  },
  {
    name: "dark",
    label: "Dark",
    icon: Icons.dark,
    gradients: ["rgba(20,20,20,0.95)", "rgba(40,40,40,0.85)"],
    glow: "rgba(116,105,221,0.6)",
  },
];