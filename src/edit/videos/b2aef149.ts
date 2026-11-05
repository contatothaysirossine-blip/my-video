import { EditSource } from "../types";
import { WORDS } from "./b2aef149-words";

// Dor lombar: fortalecer não basta, a coluna precisa de movimento.
export const B2AEF149: EditSource = {
  // The original HEVC file, read directly so no quality is lost to an
  // intermediate transcode.
  video: "sources/b2aef149.mov",
  audio: "sources/b2aef149-voice.wav",
  duration: 91.8,
  words: WORDS,
  emphasis: [
    3, 4, 12, 28, 31, 33, 37, 50, 53, 62, 74, 91, 92, 101, 102, 107, 108, 126,
    127, 135, 156, 157, 163, 172, 173, 178, 180, 187,
  ],
  cuts: [6.5, 14.13, 21.2, 30.23, 38.83, 82.8, 87.03],
};
