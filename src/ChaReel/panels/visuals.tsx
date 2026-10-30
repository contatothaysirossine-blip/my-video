import React from "react";
import { Easing, interpolate, random } from "remotion";
import type { Visual } from "../engine";
import { colors, fonts } from "../theme";

export type Palette = {
  bg: string;
  text: string;
  soft: string;
  accent: string;
  stroke: string;
  bokeh: string;
};

export const palettes: Record<"light" | "dark" | "dawn", Palette> = {
  light: {
    bg: `linear-gradient(180deg, ${colors.paper} 0%, #EEDFCF 100%)`,
    text: colors.wine,
    soft: "rgba(91,31,63,0.7)",
    accent: colors.terracotta,
    stroke: "rgba(91,31,63,0.45)",
    bokeh: colors.roseGold,
  },
  dark: {
    bg: `radial-gradient(ellipse at 50% 35%, ${colors.wine} 0%, ${colors.plum} 55%, ${colors.plumDeep} 100%)`,
    text: colors.cream,
    soft: colors.roseGold,
    accent: colors.gold,
    stroke: "rgba(246,238,228,0.28)",
    bokeh: colors.gold,
  },
  dawn: {
    bg: "linear-gradient(180deg, #F4E4D2 0%, #EBC9AF 55%, #D9A48E 100%)",
    text: colors.wine,
    soft: "rgba(58,18,41,0.75)",
    accent: colors.cream,
    stroke: "rgba(91,31,63,0.4)",
    bokeh: "#FFF3E3",
  },
};

const frac = (v: number) => v - Math.floor(v);
const ramp = (t: number, a: number, d = 0.6) =>
  interpolate(t, [a, a + d], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 0, 0.2, 1),
  });

const Label: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  opacity?: number;
  children: React.ReactNode;
}> = ({ x, y, size, color, opacity = 1, children }) => (
  <text
    x={x}
    y={y + size * 0.3}
    textAnchor="middle"
    fontFamily={fonts.serif}
    fontStyle="italic"
    fontWeight={600}
    fontSize={size}
    fill={color}
    opacity={opacity}
  >
    {children}
  </text>
);

// Calm, explanatory graphics for the lower half of the split screen.
// `local` is seconds since the panel appeared; `active` is the index of the
// latest item revealed (used to make the rings follow a list of questions).
export const PanelVisual: React.FC<{
  visual: Visual;
  local: number;
  cx: number;
  cy: number;
  R: number;
  pal: Palette;
  dark: boolean;
  center?: string;
  active: number;
  id: string;
}> = ({ visual, local, cx, cy, R, pal, dark, center, active, id }) => {
  const appear = ramp(local, 0, 0.8);
  const breathe = 1 + 0.012 * Math.sin(local * 1.6);

  if (visual.kind === "rings") {
    const radii = [0.38, 0.69, 1].map((k) => k * R * breathe);
    const fills = [colors.wine, colors.terracotta, colors.sand];
    const hl = visual.highlight === "list" ? active : (visual.highlight ?? -1);
    return (
      <g opacity={appear}>
        <defs>
          <filter
            id={`glow-${id}`}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>
        {[2, 1, 0].map((i) => {
          const on = hl === i ? 1 : 0;
          const dim = hl >= 0 && !on ? 0.45 : 1;
          return (
            <g key={i} opacity={dim}>
              {on ? (
                <circle
                  cx={cx}
                  cy={cy}
                  r={radii[i]}
                  fill="none"
                  stroke={colors.gold}
                  strokeWidth={18}
                  opacity={0.6}
                  filter={`url(#glow-${id})`}
                />
              ) : null}
              <circle
                cx={cx}
                cy={cy}
                r={radii[i]}
                fill={fills[i]}
                fillOpacity={
                  (dark ? 0.35 : 0.22) + 0.45 * on + (i === 0 ? 0.25 : 0)
                }
                stroke={on ? colors.gold : pal.stroke}
                strokeWidth={2 + on}
              />
            </g>
          );
        })}
        {[0, 1, 2].map((i) => (
          <Label
            key={i}
            x={cx}
            y={i === 0 ? cy : cy - (radii[i] + radii[i - 1]) / 2}
            size={i === 0 ? 44 : 36}
            color={i === 0 ? colors.cream : pal.text}
            opacity={hl >= 0 && hl !== i ? 0.5 : 0.95}
          >
            {i === 0 && center ? center : i + 1}
          </Label>
        ))}
      </g>
    );
  }

  if (visual.kind === "ripples") {
    return (
      <g opacity={appear}>
        <circle
          cx={cx}
          cy={cy}
          r={R * 1.25}
          fill="rgba(255,240,220,0.55)"
          opacity={0.6}
        />
        {new Array(6).fill(0).map((_, i) => {
          const k = (local / 5 + i / 6) % 1;
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={R * (0.3 + k * 1.15)}
              ry={R * (0.3 + k * 1.15) * 0.92}
              fill="none"
              stroke={dark ? colors.gold : colors.wine}
              strokeWidth={1.6}
              opacity={(1 - k) * 0.4}
            />
          );
        })}
        <circle
          cx={cx}
          cy={cy}
          r={R * 0.36}
          fill={colors.wine}
          fillOpacity={0.85}
          stroke={colors.gold}
          strokeWidth={2}
        />
        <Label x={cx} y={cy} size={50} color={colors.cream}>
          {center ?? "você"}
        </Label>
      </g>
    );
  }

  if (visual.kind === "flow") {
    const out = visual.dir === "out";
    const grow = ramp(local, 0, 4);
    return (
      <g opacity={appear}>
        <defs>
          <radialGradient id={`core-${id}`}>
            <stop offset="0%" stopColor={colors.gold} stopOpacity={0.95} />
            <stop offset="100%" stopColor={colors.roseGold} stopOpacity={0} />
          </radialGradient>
        </defs>
        {[0.38, 0.69, 1].map((k) => (
          <circle
            key={k}
            cx={cx}
            cy={cy}
            r={k * R}
            fill="none"
            stroke={pal.stroke}
            strokeWidth={1.5}
          />
        ))}
        <circle
          cx={cx}
          cy={cy}
          r={R * 0.38 * (out ? 1 - 0.15 * grow : 0.85 + 0.35 * grow)}
          fill={`url(#core-${id})`}
          opacity={out ? 0.35 : 0.3 + 0.7 * grow}
        />
        {new Array(64).fill(0).map((_, i) => {
          const angle = random(`${id}-a-${i}`) * Math.PI * 2;
          const k = frac(
            local * (0.18 + random(`${id}-s-${i}`) * 0.22) +
              random(`${id}-p-${i}`),
          );
          const r = 40 + (out ? k : 1 - k) * (R - 30);
          const w = Math.sin(local * 1.3 + i) * 0.08;
          return (
            <circle
              key={i}
              cx={cx + Math.cos(angle + w) * r}
              cy={cy + Math.sin(angle + w) * r}
              r={2 + random(`${id}-r-${i}`) * 3.5}
              fill={dark ? colors.gold : colors.terracotta}
              opacity={Math.sin(k * Math.PI) * 0.85}
            />
          );
        })}
        <Label
          x={cx}
          y={cy}
          size={44}
          color={dark ? colors.cream : colors.wine}
          opacity={0.8}
        >
          {center ?? "você"}
        </Label>
      </g>
    );
  }

  if (visual.kind === "breathe") {
    // ~5 s cycle: inhale (grow) then exhale (soften)
    const phase = (local % 5.2) / 5.2;
    const inhale = phase < 0.5;
    const s = 0.5 - 0.5 * Math.cos(phase * Math.PI * 2);
    return (
      <g opacity={appear}>
        <defs>
          <radialGradient id={`breath-${id}`}>
            <stop offset="0%" stopColor="#FFF4E6" stopOpacity={0.95} />
            <stop offset="70%" stopColor={colors.roseGold} stopOpacity={0.45} />
            <stop offset="100%" stopColor={colors.roseGold} stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle
          cx={cx}
          cy={cy}
          r={R * (0.62 + 0.38 * s)}
          fill={`url(#breath-${id})`}
        />
        <circle
          cx={cx}
          cy={cy}
          r={R * (0.45 + 0.3 * s)}
          fill="none"
          stroke={colors.wine}
          strokeOpacity={0.35}
          strokeWidth={1.5}
        />
        {/* steam from the cup */}
        {[0, 1, 2].map((i) => {
          const x0 = cx - 40 + i * 40;
          const rise = frac(local / 3.5 + i / 3);
          const pts = new Array(12).fill(0).map((_, j) => {
            const y = cy + R * 0.2 - j * 16 - rise * 30;
            const x = x0 + Math.sin(j * 0.6 + local * 1.4 + i) * 10;
            return `${x},${y}`;
          });
          return (
            <polyline
              key={i}
              points={pts.join(" ")}
              fill="none"
              stroke={colors.wine}
              strokeOpacity={0.28 * Math.sin(rise * Math.PI) + 0.08}
              strokeWidth={3}
              strokeLinecap="round"
            />
          );
        })}
        <path
          d={`M ${cx - 70} ${cy + R * 0.26} h 140 q -6 70 -70 74 q -64 -4 -70 -74 z`}
          fill={colors.wine}
          opacity={0.88}
        />
        <path
          d={`M ${cx + 66} ${cy + R * 0.3} q 34 4 26 30 q -8 20 -34 16`}
          fill="none"
          stroke={colors.wine}
          strokeWidth={8}
          opacity={0.88}
        />
        <Label
          x={cx}
          y={cy - R * 0.62}
          size={38}
          color={colors.wine}
          opacity={0.85}
        >
          {inhale ? "inspira" : "expira"}
        </Label>
      </g>
    );
  }

  if (visual.kind === "pair") {
    const mode = visual.mode;
    const prog = ramp(local, 0.2, 3.5);
    const d =
      mode === "apart"
        ? R * (0.42 + 0.38 * prog)
        : mode === "together"
          ? R * (0.85 - 0.5 * prog)
          : R * 0.62;
    const r = R * 0.48;
    // keep the names readable once the circles overlap
    const labelShift = mode === "together" ? r * 0.38 * prog : 0;
    const lx = cx - d;
    const rx = cx + d;
    return (
      <g opacity={appear}>
        <circle
          cx={lx}
          cy={cy}
          r={r}
          fill={colors.wine}
          fillOpacity={dark ? 0.55 : 0.75}
          stroke={colors.gold}
          strokeOpacity={0.6}
          strokeWidth={2}
        />
        <circle
          cx={rx}
          cy={cy}
          r={r}
          fill={dark ? colors.roseGold : colors.terracotta}
          fillOpacity={dark ? 0.3 : 0.45}
          stroke={pal.stroke}
          strokeWidth={2}
        />
        {mode === "together" ? (
          <circle
            cx={cx}
            cy={cy}
            r={Math.max(0, r - d) * 0.9 + 10 * prog}
            fill={colors.gold}
            opacity={0.35 * prog}
          />
        ) : null}
        {mode === "apart" ? (
          <line
            x1={lx + r}
            y1={cy}
            x2={rx - r}
            y2={cy}
            stroke={pal.text}
            strokeOpacity={0.4 * (1 - prog * 0.6)}
            strokeDasharray="4 10"
            strokeWidth={2}
          />
        ) : null}
        {mode === "exchange"
          ? new Array(6).fill(0).map((_, i) => {
              const k = frac(local / 2.4 + i / 6);
              const dir = i % 2 === 0 ? 1 : -1;
              const x = dir > 0 ? lx + (rx - lx) * k : rx - (rx - lx) * k;
              const y =
                cy - Math.sin(k * Math.PI) * R * 0.55 * (dir > 0 ? 1 : -1);
              return (
                <g key={i} opacity={Math.sin(k * Math.PI)}>
                  <circle
                    cx={x}
                    cy={y}
                    r={13}
                    fill={colors.gold}
                    stroke={colors.wine}
                    strokeWidth={2}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={6}
                    fill="none"
                    stroke={colors.wine}
                    strokeWidth={1.5}
                  />
                </g>
              );
            })
          : null}
        {mode === "question"
          ? [0, 1, 2].map((i) => {
              const k = frac(local / 3 + i / 3);
              return (
                <Label
                  key={i}
                  x={rx + (i - 1) * 55}
                  y={cy - r - 10 - k * 70}
                  size={52}
                  color={dark ? colors.gold : colors.wine}
                  opacity={Math.sin(k * Math.PI) * 0.8}
                >
                  ?
                </Label>
              );
            })
          : null}
        <Label x={lx - labelShift} y={cy} size={44} color={colors.cream}>
          você
        </Label>
        <Label
          x={rx + labelShift}
          y={cy}
          size={44}
          color={dark ? colors.cream : colors.wine}
        >
          o outro
        </Label>
      </g>
    );
  }

  // wave: a strong, agitated line that gradually calms down
  const calm = ramp(local, 0.5, 6);
  return (
    <g opacity={appear}>
      {[0, 1, 2].map((i) => {
        const amp = R * (0.55 - 0.45 * calm) * (1 - i * 0.22);
        const pts = new Array(120).fill(0).map((_, j) => {
          const x = 60 + (j / 119) * 960;
          const env = Math.sin((j / 119) * Math.PI);
          const y =
            cy +
            Math.sin(
              j * (0.22 - 0.1 * calm) + local * (3.2 - 2 * calm) + i * 1.2,
            ) *
              amp *
              env;
          return `${x},${y}`;
        });
        return (
          <polyline
            key={i}
            points={pts.join(" ")}
            fill="none"
            stroke={i === 0 ? colors.gold : pal.text}
            strokeOpacity={i === 0 ? 0.9 : 0.35}
            strokeWidth={i === 0 ? 4 : 2}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};
