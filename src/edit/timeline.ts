import { WORDS, Word } from "./words";

export const FPS = 30;
export const SOURCE_DURATION = 93.34;
export const END_CARD_START = 92.75;
export const TOTAL_DURATION = 96;

// Words set in the condensed italic serif (indexes into WORDS).
const EMPHASIS = new Set([
  11, 15, 19, 33, 43, 44, 65, 77, 88, 93, 102, 103, 114, 115, 129, 138, 144,
  153, 157, 166, 167, 168, 170, 186, 195, 196, 203, 204, 211, 212,
]);

// Hard cuts already present in the source footage.
export const SOURCE_CUTS = [
  11.07, 20.4, 30.03, 40.3, 45.63, 51.27, 51.9, 53.77, 60.23, 63.87, 74.17,
  79.9,
];
// Cutaway of the kids: keep it untouched.
const CUTAWAY = { start: 51.27, end: 51.9 };

export type CaptionWord = Word & { emphasis: boolean };
export type Chunk = {
  start: number;
  end: number;
  lines: CaptionWord[][];
};

const MAX_WORDS = 6;
const MAX_CHARS = 30;
const MAX_GAP = 0.35;

const endsPhrase = (w: Word) => /[.,!?;:]$/.test(w.text);

export const buildChunks = (): Chunk[] => {
  const groups: CaptionWord[][] = [];
  let current: CaptionWord[] = [];
  WORDS.forEach((w, i) => {
    const prev = current[current.length - 1];
    const chars = current.reduce((n, x) => n + x.text.length + 1, 0);
    const breakBefore =
      prev &&
      (endsPhrase(prev) ||
        current.length >= MAX_WORDS ||
        chars + w.text.length > MAX_CHARS ||
        w.start - prev.end > MAX_GAP ||
        SOURCE_CUTS.some((c) => prev.end <= c + 0.05 && w.start >= c - 0.05));
    if (breakBefore) {
      groups.push(current);
      current = [];
    }
    current.push({ ...w, emphasis: EMPHASIS.has(i) });
  });
  groups.push(current);

  return groups.map((group, i) => {
    const next = groups[i + 1];
    const last = group[group.length - 1];
    const end =
      next && next[0].start - last.end < 0.6
        ? next[0].start
        : Math.min(last.end + 0.35, END_CARD_START);
    return { start: group[0].start, end, lines: splitLines(group) };
  });
};

// Two balanced lines once a chunk has more than three words.
const splitLines = (group: CaptionWord[]): CaptionWord[][] => {
  if (group.length <= 3) return [group];
  const total = group.reduce((n, w) => n + w.text.length, 0);
  let acc = 0;
  let best = 1;
  let bestDiff = Infinity;
  group.forEach((w, i) => {
    acc += w.text.length;
    const diff = Math.abs(total / 2 - acc);
    if (i < group.length - 1 && diff < bestDiff) {
      bestDiff = diff;
      best = i + 1;
    }
  });
  return [group.slice(0, best), group.slice(best)];
};

export type Shot = { start: number; scale: number; whoosh: boolean };

// Punch-in framing, as in the reference: the zoom jumps on hard cuts
// every couple of seconds instead of animating.
export const buildShots = (chunks: Chunk[]): Shot[] => {
  const scales = [1.14, 1, 1.22, 1.06];
  const shots: Shot[] = [
    { start: 0, scale: 1, whoosh: false },
    ...SOURCE_CUTS.map((start) => ({
      start,
      scale: 1,
      whoosh: start !== CUTAWAY.end,
    })),
  ];
  let i = 0;
  let last = 0;
  for (const { start } of chunks) {
    const nearCut = SOURCE_CUTS.some((c) => Math.abs(c - start) < 1.2);
    if (nearCut) {
      last = start;
      continue;
    }
    if (start >= END_CARD_START || start - last < 2.4) continue;
    shots.push({ start, scale: scales[i++ % scales.length], whoosh: false });
    last = start;
  }
  return shots.sort((a, b) => a.start - b.start);
};
