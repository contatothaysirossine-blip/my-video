import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const COLORS = {
  gold: "#eda737",
  cream: "#fff7d8",
  brown: "#3d2b1f",
  white: "#ffffff",
};

export const SANS = '"Montserrat", sans-serif';
// Times New Roman MT Condensed is a licensed font, so it isn't bundled.
// Drop the .ttf/.otf into public/fonts and set SERIF_FILE to use it;
// until then Instrument Serif (a free condensed serif) stands in.
const SERIF_FILE: string | null = null;
export const SERIF =
  '"Times New Roman MT Condensed", "Instrument Serif", "Times New Roman", serif';

for (const weight of ["500", "600", "700"]) {
  loadFont({
    family: "Montserrat",
    url: staticFile(`fonts/montserrat-latin-${weight}-normal.woff2`),
    weight,
  });
}
loadFont({
  family: "Instrument Serif",
  url: staticFile("fonts/instrument-serif-latin-400-italic.woff2"),
  style: "italic",
});
if (SERIF_FILE) {
  loadFont({
    family: "Times New Roman MT Condensed",
    url: staticFile(SERIF_FILE),
    style: "italic",
  });
}
