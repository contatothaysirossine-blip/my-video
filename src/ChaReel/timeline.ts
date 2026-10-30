import { Easing, interpolate } from "remotion";
import captions from "../captions.json";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export type Word = {
  text: string;
  start: number;
  end: number;
  seg: number;
};

export const words: Word[] = captions.words;
export const segments: { start: number; end: number }[] = captions.segments;
export const SPEECH_END = captions.total;

// The end card cross-dissolves in just before the last word's tail ends.
export const CARD_START = SPEECH_END - 0.45;
export const CARD_DURATION = 8.875;
export const TOTAL_SECONDS = CARD_START + CARD_DURATION;

export type PanelKind = "circles" | "drain" | "self" | "restore";

type Scene =
  | { from: number; to: number; layout: "full" }
  | { from: number; to: number; layout: "split"; panel: PanelKind };

const seg = (i: number) => segments[i];

// Layout follows the narrative: full face on emotional beats,
// split screen whenever she builds the mental picture of the circles.
export const scenes: Scene[] = [
  { from: 0, to: seg(1).start, layout: "full" },
  { from: seg(1).start, to: seg(10).start, layout: "split", panel: "circles" },
  { from: seg(10).start, to: seg(11).start, layout: "full" },
  { from: seg(11).start, to: seg(12).start, layout: "split", panel: "drain" },
  { from: seg(12).start, to: seg(13).start, layout: "full" },
  { from: seg(13).start, to: seg(15).start, layout: "split", panel: "self" },
  { from: seg(15).start, to: seg(17).start, layout: "full" },
  { from: seg(17).start, to: seg(18).start, layout: "split", panel: "restore" },
  { from: seg(18).start, to: TOTAL_SECONDS, layout: "full" },
];

export const LAYOUT_TRANSITION = 0.6;

const ease = Easing.bezier(0.45, 0, 0.2, 1);

// 0 = full-frame speaker, 1 = split screen. Each change eases in from the cut.
export const splitProgress = (t: number) => {
  let p = 0;
  for (const s of scenes) {
    if (s.layout !== "split") continue;
    const inP = interpolate(t, [s.from, s.from + LAYOUT_TRANSITION], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: ease,
    });
    const outP = interpolate(t, [s.to, s.to + LAYOUT_TRANSITION], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: ease,
    });
    p = Math.max(p, Math.min(inP, outP));
  }
  return p;
};

// The split panel that should be on screen (it lingers during its exit).
export const activePanel = (t: number) => {
  let current: { kind: PanelKind; from: number; to: number } | null = null;
  for (const s of scenes) {
    if (s.layout === "split" && s.from <= t) {
      current = { kind: s.panel, from: s.from, to: s.to };
    }
  }
  return current;
};

// Moments where the layout changes — used for the soft whoosh cues.
export const layoutChanges = scenes.slice(1).map((s) => s.from);

export const segmentAt = (t: number) => {
  const i = segments.findIndex((s) => t >= s.start && t < s.end);
  return i === -1 ? segments.length - 1 : i;
};

// First occurrence of a word inside a given segment (accents/punctuation ignored).
const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z]/g, "");

export const wordTime = (segIndex: number, text: string, nth = 0) => {
  const matches = words.filter(
    (w) => w.seg === segIndex && normalize(w.text) === normalize(text),
  );
  const w = matches[nth] ?? matches[0];
  if (!w) {
    throw new Error(`Word "${text}" not found in segment ${segIndex}`);
  }
  return w.start;
};
