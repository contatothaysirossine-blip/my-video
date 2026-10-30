import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// "Chá pra Restaurar" palette: warm, earthy, wine — no neon, no harsh contrast.
export const colors = {
  wine: "#5B1F3F",
  plum: "#3A1229",
  plumDeep: "#2A0C1D",
  terracotta: "#B5694A",
  roseGold: "#D9A48E",
  gold: "#E8C9A0",
  sand: "#DCC3A8",
  cream: "#F6EEE4",
  paper: "#F3E8DB",
};

export const fonts = {
  sans: "Montserrat",
  serif: "Cormorant Garamond",
};

const faces: [string, string, "normal" | "italic", string][] = [
  [fonts.sans, "300", "normal", "montserrat-latin-300-normal.woff2"],
  [fonts.sans, "500", "normal", "montserrat-latin-500-normal.woff2"],
  [fonts.sans, "600", "normal", "montserrat-latin-600-normal.woff2"],
  [fonts.serif, "500", "normal", "cormorant-garamond-latin-500-normal.woff2"],
  [fonts.serif, "600", "normal", "cormorant-garamond-latin-600-normal.woff2"],
  [fonts.serif, "500", "italic", "cormorant-garamond-latin-500-italic.woff2"],
  [fonts.serif, "600", "italic", "cormorant-garamond-latin-600-italic.woff2"],
];

export const loadBrandFonts = () =>
  Promise.all(
    faces.map(([family, weight, style, file]) =>
      loadFont({
        family,
        weight,
        style,
        url: staticFile(`fonts/${file}`),
      }),
    ),
  );
