import { Easing, interpolate } from "remotion";
import type { FaceTrack } from "./Speaker";
import { CARD_DURATION, LAYOUT_TRANSITION, Word } from "./timeline";

// Data-driven version of timeline.ts, shared by every reel after the first.

export type Tone = "light" | "dark" | "dawn";

export type Visual =
  | { kind: "rings"; highlight?: number | "list" }
  | { kind: "ripples" }
  | { kind: "flow"; dir: "in" | "out" }
  | { kind: "breathe" }
  | { kind: "pair"; mode: "apart" | "together" | "exchange" | "question" }
  | { kind: "wave" };

export type PanelItem = {
  text: string;
  seg: number;
  word: string;
  nth?: number;
  muted?: boolean;
};

export type PanelSpec = {
  tone: Tone;
  visual: Visual;
  center?: string;
  kicker?: string;
  title: string;
  items?: PanelItem[];
  itemsStyle?: "chips" | "list";
};

export type SceneSpec =
  | { seg: number; layout: "full" }
  | { seg: number; layout: "split"; panel: PanelSpec };

export type CaptionData = {
  words: Word[];
  segments: { start: number; end: number }[];
  total: number;
};

export type ReelConfig = {
  id: string;
  video: string;
  captions: CaptionData;
  face: FaceTrack;
  scenes: SceneSpec[];
};

export type ResolvedScene = {
  from: number;
  to: number;
  spec: SceneSpec;
  // neighbouring split scenes keep the layout and only swap panel content
  prevSplit: boolean;
  nextSplit: boolean;
};

export const reelTiming = (c: ReelConfig) => {
  const speechEnd = c.captions.total;
  const cardStart = speechEnd - 0.45;
  return { speechEnd, cardStart, total: cardStart + CARD_DURATION };
};

export const resolveScenes = (c: ReelConfig): ResolvedScene[] => {
  const { total } = reelTiming(c);
  return c.scenes.map((s, i) => ({
    from: c.captions.segments[s.seg].start,
    to:
      i + 1 < c.scenes.length
        ? c.captions.segments[c.scenes[i + 1].seg].start
        : total,
    spec: s,
    prevSplit: c.scenes[i - 1]?.layout === "split",
    nextSplit: c.scenes[i + 1]?.layout === "split",
  }));
};

const ease = Easing.bezier(0.45, 0, 0.2, 1);

export const splitAt = (scenes: ResolvedScene[], t: number) => {
  let p = 0;
  for (const s of scenes) {
    if (s.spec.layout !== "split") continue;
    if (t < s.from || t > s.to + LAYOUT_TRANSITION) continue;
    const inP = s.prevSplit
      ? 1
      : interpolate(t, [s.from, s.from + LAYOUT_TRANSITION], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: ease,
        });
    const outP = s.nextSplit
      ? 1
      : interpolate(t, [s.to, s.to + LAYOUT_TRANSITION], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: ease,
        });
    p = Math.max(p, Math.min(inP, outP));
  }
  return p;
};

export const PANEL_SWAP = 0.5;

// The split panel that was on screen just before `current` (for a dissolve).
export const previousPanelAt = (scenes: ResolvedScene[], t: number) => {
  const i = scenes.findIndex((s) => s.from <= t && t < s.to);
  const cur = scenes[i];
  const prev = scenes[i - 1];
  if (!cur || !prev || !cur.prevSplit || t - cur.from > PANEL_SWAP) return null;
  if (prev.spec.layout !== "split") return null;
  return {
    ...prev,
    panel: prev.spec.panel,
    mix: (t - cur.from) / PANEL_SWAP,
  };
};

export const panelAt = (scenes: ResolvedScene[], t: number) => {
  let current: (ResolvedScene & { panel: PanelSpec }) | null = null;
  for (const s of scenes) {
    if (s.spec.layout === "split" && s.from <= t) {
      current = { ...s, panel: s.spec.panel };
    }
  }
  return current;
};

export const segmentIndexAt = (c: CaptionData, t: number) => {
  const i = c.segments.findIndex((s) => t >= s.start && t < s.end);
  return i === -1 ? c.segments.length - 1 : i;
};

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z]/g, "");

export const findWordTime = (
  c: CaptionData,
  seg: number,
  text: string,
  nth = 0,
) => {
  const matches = c.words.filter(
    (w) => w.seg === seg && normalize(w.text) === normalize(text),
  );
  const w = matches[nth] ?? matches[0];
  if (!w) {
    throw new Error(`Word "${text}" not found in segment ${seg}`);
  }
  return w.start;
};
