import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const COLORS = {
  gold: "#eda737",
  cream: "#fff7d8",
  brown: "#3d2b1f",
  white: "#ffffff",
};

export const SANS = '"Montserrat", sans-serif';
export const SERIF = '"Times New Roman MT Condensed", "Times New Roman", serif';

for (const weight of ["500", "600", "700"]) {
  loadFont({
    family: "Montserrat",
    url: staticFile(`fonts/montserrat-latin-${weight}-normal.woff2`),
    weight,
  });
}
loadFont({
  family: "Times New Roman MT Condensed",
  url: staticFile("fonts/times-new-roman-mt-condensed.otf"),
});
