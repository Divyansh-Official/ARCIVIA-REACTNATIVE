import { ThemeName } from "./theme";

export const getExploreGradient = (theme: ThemeName) => {
  switch (theme) {
    case "light":
      return {
        colors: ["#fff8f5", "#ffe4da", "#ffb19e", "#ff8a69"] as const,
        start: { x: 0, y: 0 },
        end: { x: 0.8, y: 1 },
      };
    case "eclipse":
      return {
        colors: ["#e8e6ff", "#d1cfff", "#b3afff", "#9e98e0"] as const,
        start: { x: 0, y: 0 },
        end: { x: 0.8, y: 1 },
      };
    case "dark":
    default:
      return {
        colors: ["#1c202b", "#12151f", "#0d0f18", "#0a0c14"] as const,
        start: { x: 0, y: 0 },
        end: { x: 0.8, y: 1 },
      };
  }
};

export const getCardGradient = (theme: ThemeName) => {
  switch (theme) {
    case "light":
      return ["rgba(255,138,105,0.15)", "rgba(255,248,245,0.95)"] as const;
    case "eclipse":
      return ["rgba(158,152,224,0.15)", "rgba(232,230,255,0.95)"] as const;
    case "dark":
    default:
      return ["rgba(116,105,221,0.2)", "rgba(28,32,43,0.97)"] as const;
  }
};

export const getOverlayGradient = (theme: ThemeName) => {
  switch (theme) {
    case "light":
      return ["transparent", "rgba(255,138,105,0.85)"] as const;
    case "eclipse":
      return ["transparent", "rgba(116,111,210,0.85)"] as const;
    case "dark":
    default:
      return ["transparent", "rgba(10,12,20,0.92)"] as const;
  }
};

export const getAccentColor = (theme: ThemeName) => {
  switch (theme) {
    case "light":
      return "#ff8a69";
    case "eclipse":
      return "#9e98e0";
    case "dark":
    default:
      return "#7469dd";
  }
};

export const getGlowColor = (theme: ThemeName) => {
  switch (theme) {
    case "light":
      return "rgba(255,138,105,0.4)";
    case "eclipse":
      return "rgba(158,152,224,0.4)";
    case "dark":
    default:
      return "rgba(116,105,221,0.5)";
  }
};
