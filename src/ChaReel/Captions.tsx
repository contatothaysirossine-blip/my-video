import React, { useMemo } from "react";
import { interpolate, interpolateColors } from "remotion";
import { colors, fonts } from "./theme";
import { Word } from "./timeline";

const KEYWORDS = new Set([
  "energia",
  "circulo",
  "circulos",
  "terceiro",
  "primeiro",
  "segundo",
  "depende",
  "influenciar",
  "controlo",
  "controlar",
  "limites",
  "cuidado",
  "resposta",
  "sentimento",
  "decisao",
  "recuperamos",
  "transformar",
  "vida",
  "conectam",
]);

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z]/g, "");

const isKeyword = (w: Word) =>
  KEYWORDS.has(normalize(w.text)) ||
  // "...para você." closes a thought: give it the same quiet emphasis
  (normalize(w.text) === "voce" && /[.]$/.test(w.text));

const display = (text: string) => text.replace(/[.,;:!]+$/, "");

type Group = { words: Word[]; start: number; end: number };

// Small blocks (max ~4 words / 22 chars), broken on punctuation and pauses.
const buildGroups = (words: Word[]): Group[] => {
  const groups: Group[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) {
      groups.push({
        words: cur,
        start: cur[0].start,
        end: cur[cur.length - 1].end,
      });
    }
    cur = [];
  };
  words.forEach((w, i) => {
    const prev = words[i - 1];
    if (prev) {
      const chars = cur.map((c) => c.text).join(" ").length + w.text.length;
      const pause = w.start - prev.end > 0.32;
      const punct = /[.?!,]$/.test(prev.text);
      if (
        cur.length >= 4 ||
        chars > 22 ||
        pause ||
        punct ||
        prev.seg !== w.seg
      ) {
        flush();
      }
    }
    cur.push(w);
  });
  flush();
  return groups;
};

export const Captions: React.FC<{
  t: number;
  centerY: number;
  words: Word[];
  speechEnd: number;
}> = ({ t, centerY, words, speechEnd }) => {
  const groups = useMemo(() => buildGroups(words), [words]);
  if (t > speechEnd + 0.2) return null;

  const idx = groups.findIndex((g, i) => {
    const next = groups[i + 1];
    const until = next ? Math.min(next.start, g.end + 0.7) : g.end + 0.5;
    return t >= g.start - 0.08 && t < until;
  });
  if (idx === -1) return null;
  const g = groups[idx];
  const next = groups[idx + 1];
  const until = next ? Math.min(next.start, g.end + 0.7) : g.end + 0.5;

  const appear = interpolate(t, [g.start - 0.08, g.start + 0.12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const vanish = interpolate(t, [until - 0.1, until], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(appear, vanish);

  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: centerY,
        transform: `translateY(-50%) translateY(${(1 - appear) * 10}px)`,
        opacity,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "baseline",
        columnGap: 18,
        rowGap: 4,
        textAlign: "center",
      }}
    >
      {g.words.map((w, i) => {
        const key = isKeyword(w);
        // smooth 0..1 "lit" state while the word is spoken
        const lit = Math.min(
          interpolate(t, [w.start - 0.05, w.start + 0.1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          interpolate(t, [w.end + 0.05, w.end + 0.35], [1, 0.55], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        );
        const spoken = t >= w.start - 0.05;
        const base = key ? colors.roseGold : "rgba(246,238,228,0.82)";
        const bright = key ? colors.gold : "#FFFFFF";
        return (
          <span
            key={i}
            style={{
              fontFamily: key ? fonts.serif : fonts.sans,
              fontStyle: key ? "italic" : "normal",
              fontWeight: key ? 600 : 500,
              fontSize: key ? 76 : 56,
              letterSpacing: key ? 0.5 : 0.2,
              lineHeight: 1.15,
              color: interpolateColors(lit, [0, 1], [base, bright]),
              opacity: spoken ? 1 : 0.72,
              textShadow: `0 2px 18px rgba(42,12,29,0.55), 0 0 ${
                22 * lit
              }px rgba(232,201,160,${0.35 * lit})`,
            }}
          >
            {display(w.text)}
          </span>
        );
      })}
    </div>
  );
};
