import { loadFont as loadRaleway } from "@remotion/google-fonts/Raleway";
import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";

export const FONT_SANS = loadRaleway("normal", {
  weights: ["500", "700"],
  subsets: ["latin"],
}).fontFamily;

export const FONT_SERIF = loadCormorant("italic", {
  weights: ["500"],
  subsets: ["latin"],
}).fontFamily;

// Paleta tirada do post: bege, creme e bronze
export const COLORS = {
  cream: "#F6EFE6",
  beige: "#E7DDD1",
  bronze: "#8A5428",
  bronzeLight: "#C08A55",
  bronzeDark: "#5E3517",
  ink: "#4A2A12",
  inkSoft: "#5E4535",
  muted: "#9C8673",
  glass: "rgba(250, 244, 236, 0.62)",
};
