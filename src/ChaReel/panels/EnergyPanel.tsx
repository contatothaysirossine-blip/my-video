import React from "react";
import { AbsoluteFill, Easing, interpolate, random } from "remotion";
import { colors, fonts } from "../theme";
import { Bokeh, Grain } from "../Texture";
import { segments, wordTime } from "../timeline";
import { PANEL_W } from "./CirclesPanel";

const CX = 540;
const CY = 360;
const RADII = [110, 200, 290];
const PARTICLES = 70;

const ramp = (t: number, a: number, d = 0.5) =>
  interpolate(t, [a, a + d], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 0, 0.2, 1),
  });

const frac = (v: number) => v - Math.floor(v);

// "drain": energy flowing out of you into the circle you don't control.
// "restore": energy returning to the centre — to what you can transform.
export const EnergyPanel: React.FC<{
  t: number;
  height: number;
  mode: "drain" | "restore";
}> = ({ t, height, mode }) => {
  const drain = mode === "drain";
  const start = drain ? segments[11].start : segments[17].start;
  const local = t - start;
  const grow = ramp(t, start, 4);

  const outerGlow = drain ? 0.25 + 0.6 * grow : 0.12;
  const innerGlow = drain ? 0.25 * (1 - grow) + 0.1 : 0.3 + 0.7 * grow;

  const orbitWords = drain
    ? [
        { text: "falar", at: wordTime(11, "falar"), angle: -140 },
        { text: "pensar", at: wordTime(11, "pensar"), angle: -40 },
        { text: "responder", at: wordTime(11, "responder"), angle: 40 },
        { text: "agir", at: wordTime(11, "agir"), angle: 140 },
      ]
    : [];

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${colors.wine} 0%, ${colors.plum} 55%, ${colors.plumDeep} 100%)`,
      }}
    >
      <Bokeh t={t} width={PANEL_W} height={height} color={colors.gold} seed={mode} count={10} />
      <svg width={PANEL_W} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id={`soft-${mode}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <radialGradient id={`core-${mode}`}>
            <stop offset="0%" stopColor={colors.gold} stopOpacity={0.95} />
            <stop offset="100%" stopColor={colors.roseGold} stopOpacity={0} />
          </radialGradient>
        </defs>

        {RADII.map((r, i) => (
          <circle
            key={r}
            cx={CX}
            cy={CY}
            r={r}
            fill="none"
            stroke={colors.cream}
            strokeOpacity={i === 2 && drain ? 0.25 + 0.35 * grow : 0.2}
            strokeWidth={1.5}
          />
        ))}
        <circle
          cx={CX}
          cy={CY}
          r={RADII[2]}
          fill="none"
          stroke={colors.gold}
          strokeWidth={22}
          opacity={outerGlow}
          filter={`url(#soft-${mode})`}
        />
        <circle
          cx={CX}
          cy={CY}
          r={RADII[0] * (drain ? 1 - 0.15 * grow : 0.85 + 0.35 * grow)}
          fill={`url(#core-${mode})`}
          opacity={innerGlow}
        />

        {new Array(PARTICLES).fill(0).map((_, i) => {
          const angle = random(`${mode}-a-${i}`) * Math.PI * 2;
          const speed = 0.18 + random(`${mode}-s-${i}`) * 0.22;
          const phase = random(`${mode}-p-${i}`);
          const k = frac(local * speed + phase);
          const travel = drain ? k : 1 - k;
          const r = 40 + travel * (RADII[2] - 30);
          const wobble = Math.sin(local * 1.3 + i) * 0.08;
          const x = CX + Math.cos(angle + wobble) * r;
          const y = CY + Math.sin(angle + wobble) * r;
          const o = Math.sin(k * Math.PI) * 0.85 * ramp(t, start, 0.8);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={2 + random(`${mode}-r-${i}`) * 3.5}
              fill={colors.gold}
              opacity={o}
            />
          );
        })}

        <text
          x={CX}
          y={CY + 16}
          textAnchor="middle"
          fontFamily={fonts.serif}
          fontStyle="italic"
          fontWeight={600}
          fontSize={48}
          fill={drain ? colors.cream : colors.plum}
          opacity={drain ? 0.75 : 0.35 + 0.65 * grow}
        >
          você
        </text>
      </svg>

      {orbitWords.map((w) => {
        const a = ramp(t, w.at - 0.05, 0.45);
        const rad = (w.angle * Math.PI) / 180;
        const r = RADII[2] + 70;
        return (
          <div
            key={w.text}
            style={{
              position: "absolute",
              left: CX + Math.cos(rad) * r * 1.15 - 150,
              top: CY + Math.sin(rad) * r - 26,
              width: 300,
              textAlign: "center",
              fontFamily: fonts.sans,
              fontWeight: 300,
              fontSize: 34,
              letterSpacing: 3,
              color: colors.gold,
              opacity: a,
              transform: `scale(${0.94 + 0.06 * a})`,
            }}
          >
            {w.text}
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          top: 720,
          width: "100%",
          textAlign: "center",
          opacity: ramp(t, start + 0.3, 0.8),
        }}
      >
        <div
          style={{
            fontFamily: fonts.serif,
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: 60,
            color: colors.cream,
          }}
        >
          {drain ? "Toda a energia no que não controlo" : "Recuperar a nossa energia"}
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: fonts.sans,
            fontWeight: 300,
            fontSize: 26,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: colors.roseGold,
          }}
        >
          {drain ? "o terceiro círculo" : "para transformar o que é possível"}
        </div>
      </div>
      <Grain opacity={0.12} />
    </AbsoluteFill>
  );
};
