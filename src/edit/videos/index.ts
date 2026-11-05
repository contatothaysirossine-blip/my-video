import { EditSource } from "../types";
import { B2AEF149 } from "./b2aef149";
import { IMG_7284 } from "./img7284";

export const VIDEOS = {
  img7284: IMG_7284,
  b2aef149: B2AEF149,
} satisfies Record<string, EditSource>;

export type VideoId = keyof typeof VIDEOS;
