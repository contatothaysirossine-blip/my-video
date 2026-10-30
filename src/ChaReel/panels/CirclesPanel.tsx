import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { colors, fonts } from "../theme";
import { Bokeh, Grain } from "../Texture";
import { segments, wordTime } from "../timeline";

export const PANEL_W = 1080;
const CX = 540;
const CY = 360;
const RADII = [110, 200, 290];
const FILLS = [colors.wine, colors.terracotta, colors.sand];

const soft = Easing.bezier(0.33, 0, 0.2, 1);
const ramp = (t: number, a: number, d = 0.5) =>
  interpolate(t, [a, a + d], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: soft,
  });

// Moments taken from her own words so the graphic follows the speech.
const T = {
  title: segments[1].start + 0.1,
  reveal: [wordTime(1, "Um"), wordTime(1, "dois"), wordTime(1, "três", 1)],
  connect: wordTime(1, "conectam"),
  focus: [segments[2].start, segments[4].start, segments[7].start],
};

const FOCUS = [
  {
    title: "O que depende de você",
    chips: [
      { text: "como você fala", at: wordTime(3, "fala") },
      { text: "como se posiciona", at: wordTime(3, "posiciona") },
      { text: "seus limites", at: wordTime(3, "limites") },
      { text: "o cuidado consigo", at: wordTime(3, "cuidado") },
    ],
  },
  {
    title: "O que você pode influenciar",
    chips: [
      { text: "uma conversa", at: wordTime(5, "conversa") },
      { text: "sua casa", at: wordTime(6, "casa") },
      { text: "sua convivência", at: wordTime(6, "convivência") },
      { text: "sua família", at: wordTime(6, "filhos") },
    ],
  },
  {
    title: "O que você não controla",
    chips: [
      { text: "a resposta do outro", at: wordTime(9, "resposta") },
      { text: "o sentimento do outro", at: wordTime(9, "sentimento") },
      { text: "a decisão do outro", at: wordTime(9, "decisão") },
    ],
  },
];

export const CirclesPanel: React.FC<{ t: number; height: number }> = ({
  t,
  height,
}) => {
  const focusLevels = T.focus.map((f, i) => {
    const next = T.focus[i + 1];
    const on = ramp(t, f, 0.6);
    const off = next ? 1 - ramp(t, next, 0.6) : 1;
    return Math.min(on, off);
  });
  const anyFocus = Math.max(...focusLevels);
  const breathe = 1 + 0.012 * Math.sin(t * 1.6);
  const connect = ramp(t, T.connect, 1.2);
  const introTitle = 1 - ramp(t, T.focus[0] - 0.2, 0.5);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${colors.paper} 0%, #EEDFCF 100%)`,
      }}
    >
      <Bokeh
        t={t}
        width={PANEL_W}
        height={height}
        color={colors.roseGold}
        seed="circles"
      />
      <svg
        width={PANEL_W}
        height={height}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>
        {[2, 1, 0].map((i) => {
          const reveal = ramp(t, T.reveal[i], 0.7);
          const focus = focusLevels[i];
          const dim = 1 - 0.55 * anyFocus * (1 - focus);
          const r = RADII[i] * (0.86 + 0.14 * reveal) * breathe;
          return (
            <g key={i} opacity={reveal * dim}>
              {focus > 0 ? (
                <circle
                  cx={CX}
                  cy={CY}
                  r={r}
                  fill="none"
                  stroke={colors.gold}
                  strokeWidth={18}
                  opacity={0.55 * focus}
                  filter="url(#glow)"
                />
              ) : null}
              <circle
                cx={CX}
                cy={CY}
                r={r}
                fill={FILLS[i]}
                fillOpacity={0.22 + 0.5 * focus + (i === 0 ? 0.25 : 0)}
                stroke={focus > 0.5 ? colors.wine : "rgba(91,31,63,0.45)"}
                strokeWidth={2 + 1.5 * focus}
              />
            </g>
          );
        })}
        {/* soft connecting dashes once she says "se conectam" */}
        <circle
          cx={CX}
          cy={CY}
          r={RADII[2] + 26}
          fill="none"
          stroke={colors.wine}
          strokeOpacity={0.35 * connect}
          strokeWidth={1.5}
          strokeDasharray="2 14"
          transform={`rotate(${t * 6} ${CX} ${CY})`}
        />
        {[0, 1, 2].map((i) => {
          const reveal = ramp(t, T.reveal[i] + 0.15, 0.5);
          const y = i === 0 ? CY + 14 : CY - (RADII[i] + RADII[i - 1]) / 2 + 14;
          const focus = focusLevels[i];
          return (
            <text
              key={i}
              x={CX}
              y={y}
              textAnchor="middle"
              fontFamily={fonts.serif}
              fontStyle="italic"
              fontWeight={600}
              fontSize={i === 0 ? 54 : 44}
              fill={i === 0 || focus > 0.5 ? colors.cream : colors.wine}
              opacity={reveal * (1 - 0.5 * anyFocus * (1 - focus))}
            >
              {i + 1}
            </text>
          );
        })}
      </svg>

      {/* intro title */}
      <div
        style={{
          position: "absolute",
          top: 690,
          width: "100%",
          textAlign: "center",
          fontFamily: fonts.serif,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 60,
          color: colors.wine,
          opacity: ramp(t, T.title, 0.8) * introTitle,
        }}
      >
        Três círculos que se conectam
      </div>

      {FOCUS.map((f, i) => {
        const level = focusLevels[i];
        if (level <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 670,
              width: "100%",
              opacity: level,
              transform: `translateY(${(1 - level) * 14}px)`,
            }}
          >
            <div
              style={{
                textAlign: "center",
                fontFamily: fonts.serif,
                fontStyle: "italic",
                fontWeight: 600,
                fontSize: 62,
                color: colors.wine,
              }}
            >
              {f.title}
            </div>
            <div
              style={{
                marginTop: 18,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 14,
                padding: "0 50px",
              }}
            >
              {f.chips.map((c) => {
                const a = ramp(t, c.at - 0.05, 0.45);
                return (
                  <div
                    key={c.text}
                    style={{
                      opacity: a,
                      transform: `translateY(${(1 - a) * 10}px)`,
                      fontFamily: fonts.sans,
                      fontWeight: 500,
                      fontSize: 34,
                      color: colors.wine,
                      padding: "10px 24px",
                      borderRadius: 40,
                      border: `1.5px solid rgba(91,31,63,0.35)`,
                      background: "rgba(246,238,228,0.65)",
                    }}
                  >
                    {c.text}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <Grain />
    </AbsoluteFill>
  );
};
