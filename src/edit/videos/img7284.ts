import { EditSource } from "../types";
import { WORDS } from "./img7284-words";

export const IMG_7284: EditSource = {
  video: "video.mp4",
  duration: 93.34,
  words: WORDS,
  emphasis: [
    11, 15, 19, 33, 43, 44, 65, 77, 88, 93, 102, 103, 114, 115, 129, 138, 144,
    153, 157, 166, 167, 168, 170, 186, 195, 196, 203, 204, 211, 212,
  ],
  cuts: [
    11.07, 20.4, 30.03, 40.3, 45.63, 51.27, 51.9, 53.77, 60.23, 63.87, 74.17,
    79.9,
  ],
  // The kids.
  cutaway: { start: 51.27, end: 51.9 },
  endCard: { start: 92.75, totalDuration: 96 },
};
