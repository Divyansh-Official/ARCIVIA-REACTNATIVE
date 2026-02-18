export type ThemeName = "light" | "eclipse" | "dark";

export const themes = {
  light: {
    primary01: "#ff8a69",
    primary02: "#ffb19e",

    secondary01: "#f0e1dd",
    secondary02: "#cfaea7",

    background: "#fff8f5",

    shadow: "#d3d3d3",

    icons01: "#333645",
    icons02: "#8b6d89",

    text01: "#333645",
    text02: "#8b6d89",
  },
  eclipse: {
    primary01: "#9e98e0",
    primary02: "#b3afff",

    secondary01: "#d1cfff",
    secondary02: "#a89ff5",

    background: "#e8e6ff",

    shadow: "#b3afff",

    icons01: "#333645",
    icons02: "#8b6d89",

    text01: "#333645",
    text02: "#8b6d89",
  },
  dark: {
    primary01: "#7469dd",
    primary02: "#9e98e0",

    secondary01: "#333645",
    secondary02: "#8b6d89",

    background: "#1c202b",

    shadow: "#000000",

    icons01: "#ffffff",
    icons02: "#bababa",

    text01: "#ffffff",
    text02: "#bababa",
  },
} as const;
