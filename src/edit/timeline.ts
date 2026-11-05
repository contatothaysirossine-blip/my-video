import { EditSource, Word } from "./types";

export const FPS = 30;

// Where captions and zooms stop: the end card, or the end of the footage.
export const contentEnd = (src: EditSource) =>
  src.endCard?.start ?? src.duration;

export const totalDuration = (src: EditSource) =>
  src.endCard?.totalDuration ?? src.duration;

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

export const buildChunks = (src: EditSource): Chunk[] => {
  const emphasis = new Set(src.emphasis);
  const end = contentEnd(src);
  const groups: CaptionWord[][] = [];
  let current: CaptionWord[] = [];
  src.words.forEach((w, i) => {
    const prev = current[current.length - 1];
    const chars = current.reduce((n, x) => n + x.text.length + 1, 0);
    const breakBefore =
      prev &&
      (endsPhrase(prev) ||
        current.length >= MAX_WORDS ||
        chars + w.text.length > MAX_CHARS ||
        w.start - prev.end > MAX_GAP ||
        src.cuts.some((c) => prev.end <= c + 0.05 && w.start >= c - 0.05));
    if (breakBefore) {
      groups.push(current);
      current = [];
    }
    current.push({ ...w, emphasis: emphasis.has(i) });
  });
  groups.push(current);

  return groups.map((group, i) => {
    const next = groups[i + 1];
    const last = group[group.length - 1];
    return {
      start: group[0].start,
      end:
        next && next[0].start - last.end < 0.6
          ? next[0].start
          : Math.min(last.end + 0.35, end),
      lines: splitLines(group),
    };
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
export const buildShots = (src: EditSource, chunks: Chunk[]): Shot[] => {
  const scales = [1.14, 1, 1.22, 1.06];
  const shots: Shot[] = [
    { start: 0, scale: 1, whoosh: false },
    ...src.cuts.map((start) => ({
      start,
      scale: 1,
      whoosh: start !== src.cutaway?.end,
    })),
  ];
  let i = 0;
  let last = 0;
  for (const { start } of chunks) {
    const nearCut = src.cuts.some((c) => Math.abs(c - start) < 1.2);
    if (nearCut) {
      last = start;
      continue;
    }
    if (start >= contentEnd(src) || start - last < 2.4) continue;
    shots.push({ start, scale: scales[i++ % scales.length], whoosh: false });
    last = start;
  }
  return shots.sort((a, b) => a.start - b.start);
};
