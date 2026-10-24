import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, SANS, SERIF } from "./brand";
import { CaptionWord, Chunk } from "./timeline";

const SIZE = 58;

const WordView: React.FC<{ word: CaptionWord; time: number }> = ({
  word,
  time,
}) => {
  const { fps } = useVideoConfig();
  // Each word settles in over ~7 frames: fade, de-blur, small rise.
  const t = interpolate(
    time,
    [word.start - 0.06, word.start + 7 / fps],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );
  const style: React.CSSProperties = word.emphasis
    ? {
        fontFamily: SERIF,
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: SIZE * 1.42,
        letterSpacing: "-0.01em",
        color: COLORS.gold,
        textShadow: "0 1px 2px rgba(61, 43, 31, 0.4)",
      }
    : {
        fontFamily: SANS,
        fontWeight: 600,
        fontSize: SIZE,
        letterSpacing: "-0.035em",
        color: COLORS.brown,
      };
  return (
    <span
      style={{
        ...style,
        display: "inline-block",
        margin: "0 0.13em",
        opacity: t,
        filter: `blur(${(1 - t) * 10}px)`,
        transform: `translateY(${(1 - t) * 14}px)`,
      }}
    >
      {word.text}
    </span>
  );
};

export const Captions: React.FC<{ chunks: Chunk[] }> = ({ chunks }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const chunk = chunks.find((c) => time >= c.start - 0.06 && time < c.end);
  if (!chunk) return null;
  const fadeOut = interpolate(time, [chunk.end - 0.08, chunk.end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        top: "57%",
        bottom: "auto",
        alignItems: "center",
        opacity: fadeOut,
        // Dark type sits on the cream blouse; a faint cream glow keeps it
        // legible where the blouse falls into shadow.
        textShadow: "0 0 18px rgba(255, 247, 216, 0.7)",
      }}
    >
      {chunk.lines.map((line, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            lineHeight: 1.02,
            maxWidth: 900,
            flexWrap: "wrap",
          }}
        >
          {line.map((w) => (
            <WordView key={w.start} word={w} time={time} />
          ))}
        </div>
      ))}
    </AbsoluteFill>
  );
};
