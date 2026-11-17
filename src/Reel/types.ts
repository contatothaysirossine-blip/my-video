export type Word = { text: string; start: number; end: number };

export type CueMode = "speaker" | "split" | "image";

/** From time `t` (reel seconds) on, show this layout until the next cue. */
export type Cue = { t: number; mode: CueMode; img?: string };

export type ReelData = {
  id: string;
  /** Hook shown at the start of the reel */
  title: string;
  /** Lowercased words of the title painted in gold */
  titleHighlight?: string[];
  /** Lowercased words painted in gold in the captions */
  emphasis?: string[];
  /** Slices of raw.mp4 (seconds), concatenated as jump cuts */
  segments: { start: number; end: number }[];
  /** Caption words, times relative to the reel timeline (seconds) */
  words: Word[];
  /** Layout changes: talking head, split screen (image on top) or full image */
  cues: Cue[];
};
