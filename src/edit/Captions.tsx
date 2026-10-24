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

const SIZE = 74;

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
        fontWeight: 400,
        fontSize: SIZE * 1.4,
        letterSpacing: "-0.005em",
      }
    : {
        fontFamily: SANS,
        fontWeight: 700,
        fontSize: SIZE,
        letterSpacing: "-0.02em",
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
        top: "62%",
        bottom: "auto",
        alignItems: "center",
        opacity: fadeOut,
        // One colour throughout; the drop shadow carries it over the
        // light blouse.
        color: COLORS.white,
        textShadow:
          "0 3px 6px rgba(0, 0, 0, 0.45), 0 6px 22px rgba(0, 0, 0, 0.35)",
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
