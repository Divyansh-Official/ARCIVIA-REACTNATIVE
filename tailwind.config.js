/** @type {import('tailwindcss').Config} */

const themes = ["light", "dark"];
const tokens = [
  "primary01",
  "primary02",

  "secondary01",
  "secondary02",

  "background",

  "shadow",

  "icons01",
  "icons02",

  "text01",
  "text02",
];
const utilities = ["bg", "text", "border", "ring", "placeholder", "accent"];

const safelist = themes.flatMap((theme) =>
  tokens.flatMap((token) =>
    utilities.map((util) => `${util}-${theme}-${token}`),
  ),
);

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  //   safelist,
  theme: {
    extend: {
      colors: {
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
      },
    },
  },
  plugins: [],
};
