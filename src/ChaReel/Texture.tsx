import React from "react";
import { AbsoluteFill, random } from "remotion";

// Static film grain: keeps flat colour fields feeling tactile and organic.
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.09 }) => (
  <AbsoluteFill style={{ opacity, mixBlendMode: "overlay" }}>
    <svg width="100%" height="100%">
      <filter id="grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="2"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  </AbsoluteFill>
);

// Slow-drifting warm out-of-focus lights.
export const Bokeh: React.FC<{
  t: number;
  width: number;
  height: number;
  count?: number;
  color: string;
  seed: string;
}> = ({ t, width, height, count = 14, color, seed }) => (
  <AbsoluteFill>
    {new Array(count).fill(0).map((_, i) => {
      const r = 40 + random(`${seed}-r-${i}`) * 110;
      const x =
        random(`${seed}-x-${i}`) * width +
        Math.sin(t * 0.25 + i) * 30 * random(`${seed}-dx-${i}`);
      const y =
        random(`${seed}-y-${i}`) * height -
        ((t * (6 + random(`${seed}-v-${i}`) * 10)) % (height + 2 * r)) +
        r;
      const o = 0.08 + random(`${seed}-o-${i}`) * 0.18;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x - r,
            top:
              (((y % (height + 2 * r)) + height + 2 * r) % (height + 2 * r)) -
              r,
            width: r * 2,
            height: r * 2,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 70%)`,
            opacity: o,
            filter: "blur(6px)",
          }}
        />
      );
    })}
  </AbsoluteFill>
);
