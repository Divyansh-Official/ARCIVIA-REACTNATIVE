// app/hooks/useThemeStyles.ts
// import { useTheme } from "../../context/ThemeContext";

import { useTheme } from "@/app/context/ThemeContext";

const COLOR_TOKENS = new Set([
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
]);

const UTILITY_PREFIXES = new Set([
  "bg",
  "text",
  "border",
  "ring",
  "placeholder",
  "accent",
  "fill",
  "stroke",
]);

export function useThemeStyles() {
  const { themeName } = useTheme();

  return (cls: string): string => {
    return cls
      .split(" ")
      .map((token) => {
        const dashIndex = token.indexOf("-");
        if (dashIndex === -1) return token;

        const utility = token.slice(0, dashIndex);
        const colorToken = token.slice(dashIndex + 1);

        if (UTILITY_PREFIXES.has(utility) && COLOR_TOKENS.has(colorToken)) {
          return `${utility}-${themeName}-${colorToken}`;
        }

        return token;
      })
      .join(" ");
  };
}
