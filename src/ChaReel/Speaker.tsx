import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import face from "../face.json";
import { WIDTH, segmentAt } from "./timeline";

const SRC_W = 1024;
const SRC_H = 576;

// Full layout: a wider, more elegant framing (the source is 576p, so a full
// 9:16 crop would be too tight and soft) floating over a blurred fill.
const FULL_WINDOW_H = 1500;
const FULL_WINDOW_TOP = 170;

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

const grade = "saturate(0.92) contrast(1.03) sepia(0.07) brightness(1.01)";

// Auto-reframe: the face track (smoothed in pre-processing) keeps her
// centred, and alternating cuts get a gentle punch-in to soften jump cuts.
export const Speaker: React.FC<{
  t: number;
  frame: number;
  areaHeight: number;
  split: number;
}> = ({ t, frame, areaHeight, split }) => {
  const i = clamp(frame, 0, face.x.length - 1);
  const fx = face.x[i];
  const fy = face.y[i];

  const seg = segmentAt(t);
  const punch = seg % 2 === 1 ? 1.07 : 1;
  // Very slow drift so even long takes keep breathing.
  const drift = 1 + 0.012 * Math.sin(t / 3.2);

  const windowH = lerp(FULL_WINDOW_H, areaHeight, split);
  const windowTop = lerp(FULL_WINDOW_TOP, 0, split);

  const s = Math.max(windowH / SRC_H, WIDTH / SRC_W) * punch * drift;
  const left = clamp(WIDTH / 2 - fx * s, WIDTH - SRC_W * s, 0);
  const anchor = lerp(0.36, 0.42, split);
  const top = clamp(anchor * windowH - fy * s, windowH - SRC_H * s, 0);

  const bgS = Math.max(areaHeight / SRC_H, WIDTH / SRC_W) * 1.1;
  const feather = 140 * (1 - split);

  return (
    <AbsoluteFill style={{ height: areaHeight, overflow: "hidden" }}>
      {split < 1 ? (
        <OffthreadVideo
          src={staticFile("cut.mp4")}
          muted
          style={{
            position: "absolute",
            width: SRC_W * bgS,
            height: SRC_H * bgS,
            left: clamp(WIDTH / 2 - fx * bgS, WIDTH - SRC_W * bgS, 0),
            top: 0,
            filter: `blur(38px) ${grade} brightness(0.92)`,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: windowTop,
          width: WIDTH,
          height: windowH,
          overflow: "hidden",
          WebkitMaskImage: `linear-gradient(180deg, transparent 0px, black ${feather}px, black calc(100% - ${feather}px), transparent 100%)`,
        }}
      >
        <OffthreadVideo
          src={staticFile("cut.mp4")}
          muted
          style={{
            position: "absolute",
            width: SRC_W * s,
            height: SRC_H * s,
            left,
            top,
            filter: grade,
          }}
        />
      </div>
      {/* gentle vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 55%, rgba(42,12,29,0.28) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
