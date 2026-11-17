export type Word = { text: string; start: number; end: number };

export type ReelData = {
  id: string;
  /** Hook shown on top of the reel */
  title: string;
  /** Lowercased words of the title painted in gold */
  titleHighlight?: string[];
  /** Lowercased words painted in gold in the captions */
  emphasis?: string[];
  /** Slices of raw.mp4 (seconds), concatenated as jump cuts */
  segments: { start: number; end: number }[];
  /** Caption words, times relative to the reel timeline (seconds) */
  words: Word[];
};
