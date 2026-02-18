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
        // light: {
        //   primary01: "#7469dd",
        //   primary02: "#9e98e0",

        //   secondary01: "#333645",
        //   secondary02: "#8b6d89",

        //   background: "#1c202b",
        //   shadow: "#000000",
        //   text01: "#ffffff",
        //   text02: "#bababa",
        // },
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
