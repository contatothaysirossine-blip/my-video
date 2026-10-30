import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { colors, fonts } from "../theme";
import { Bokeh, Grain } from "../Texture";
import { segments } from "../timeline";
import { PANEL_W } from "./CirclesPanel";

const CX = 540;
const CY = 360;
const RIPPLES = 6;

const ramp = (t: number, a: number, d = 0.5) =>
  interpolate(t, [a, a + d], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 0, 0.2, 1),
  });

// "Olhar para o primeiro círculo, para você": still water at golden hour,
// ripples opening from the centre — turning attention inward.
export const SelfPanel: React.FC<{ t: number; height: number }> = ({
  t,
  height,
}) => {
  const start = segments[13].start;
  const local = t - start;
  const bloom = ramp(t, start, 3);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, #F4E4D2 0%, #EBC9AF 55%, #D9A48E 100%)`,
      }}
    >
      {/* low sun */}
      <div
        style={{
          position: "absolute",
          left: CX - 420,
          top: CY - 420,
          width: 840,
          height: 840,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,240,220,0.95) 0%, rgba(255,226,196,0.4) 35%, rgba(255,226,196,0) 70%)`,
          transform: `scale(${0.9 + 0.1 * bloom})`,
        }}
      />
      <Bokeh
        t={t}
        width={PANEL_W}
        height={height}
        color="#FFF3E3"
        seed="self"
        count={12}
      />
      <svg
        width={PANEL_W}
        height={height}
        style={{ position: "absolute", inset: 0 }}
      >
        {new Array(RIPPLES).fill(0).map((_, i) => {
          const k = (local / 5 + i / RIPPLES) % 1;
          return (
            <ellipse
              key={i}
              cx={CX}
              cy={CY}
              rx={90 + k * 420}
              ry={(90 + k * 420) * 0.92}
              fill="none"
              stroke={colors.wine}
              strokeWidth={1.6}
              opacity={(1 - k) * 0.35 * ramp(t, start, 0.8)}
            />
          );
        })}
        <circle
          cx={CX}
          cy={CY}
          r={110}
          fill={colors.wine}
          fillOpacity={0.85}
          stroke={colors.gold}
          strokeWidth={2}
          opacity={ramp(t, start + 0.2, 0.8)}
        />
        <text
          x={CX}
          y={CY + 18}
          textAnchor="middle"
          fontFamily={fonts.serif}
          fontStyle="italic"
          fontWeight={600}
          fontSize={58}
          fill={colors.cream}
          opacity={ramp(t, start + 0.4, 0.8)}
        >
          você
        </text>
      </svg>
      <div
        style={{
          position: "absolute",
          top: 720,
          width: "100%",
          textAlign: "center",
          opacity: ramp(t, start + 0.5, 0.8),
        }}
      >
        <div
          style={{
            fontFamily: fonts.serif,
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: 62,
            color: colors.wine,
          }}
        >
          Olhar para o primeiro círculo
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: fonts.sans,
            fontWeight: 300,
            fontSize: 26,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: colors.plum,
            opacity: 0.8,
          }}
        >
          o que depende de você
        </div>
      </div>
      <Grain />
    </AbsoluteFill>
  );
};
