import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CaptionData, findWordTime, PanelSpec } from "../engine";
import { colors, fonts } from "../theme";
import { Bokeh, Grain } from "../Texture";
import { PANEL_W } from "./CirclesPanel";
import { palettes, PanelVisual } from "./visuals";

const ramp = (t: number, a: number, d = 0.5) =>
  interpolate(t, [a, a + d], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 0, 0.2, 1),
  });

export const ConceptPanel: React.FC<{
  spec: PanelSpec;
  captions: CaptionData;
  t: number;
  from: number;
  height: number;
  id: string;
}> = ({ spec, captions, t, from, height, id }) => {
  const pal = palettes[spec.tone];
  const dark = spec.tone === "dark";
  const list = spec.itemsStyle === "list";
  const local = t - from;

  const items = (spec.items ?? []).map((it) => ({
    ...it,
    at: findWordTime(captions, it.seg, it.word, it.nth),
  }));
  const active = items.reduce((acc, it, i) => (t >= it.at ? i : acc), -1);

  // List panels give more room to text, so the graphic gets smaller.
  const cy = list ? 250 : 330;
  const R = list ? 200 : 265;
  const titleTop = list ? 490 : 640;

  return (
    <AbsoluteFill style={{ background: pal.bg }}>
      <Bokeh
        t={t}
        width={PANEL_W}
        height={height}
        color={pal.bokeh}
        seed={id}
        count={12}
      />
      <svg
        width={PANEL_W}
        height={height}
        style={{ position: "absolute", inset: 0 }}
      >
        <PanelVisual
          visual={spec.visual}
          local={local}
          cx={540}
          cy={cy}
          R={R}
          pal={pal}
          dark={dark}
          center={spec.center}
          active={active}
          id={id}
        />
      </svg>

      <div
        style={{
          position: "absolute",
          top: titleTop,
          width: "100%",
          textAlign: "center",
          opacity: ramp(t, from + 0.3, 0.8),
          transform: `translateY(${(1 - ramp(t, from + 0.3, 0.8)) * 12}px)`,
        }}
      >
        {spec.kicker ? (
          <div
            style={{
              fontFamily: fonts.sans,
              fontWeight: 300,
              fontSize: 24,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: pal.soft,
              marginBottom: 6,
            }}
          >
            {spec.kicker}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: fonts.serif,
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: 60,
            lineHeight: 1.1,
            padding: "0 60px",
            color: pal.text,
          }}
        >
          {spec.title}
        </div>
      </div>

      {items.length ? (
        <div
          style={{
            position: "absolute",
            top: titleTop + (spec.kicker ? 120 : 90),
            left: 50,
            right: 50,
            display: "flex",
            flexDirection: list ? "column" : "row",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: list ? 8 : 14,
          }}
        >
          {items.map((it, i) => {
            const a = ramp(t, it.at - 0.05, 0.45);
            const current = i === active;
            const muted = it.muted;
            const common: React.CSSProperties = {
              opacity: a * (muted ? 0.6 : list && !current ? 0.62 : 1),
              transform: `translateY(${(1 - a) * 10}px)`,
              textDecoration: muted ? "line-through" : "none",
              textDecorationThickness: 2,
            };
            if (list) {
              return (
                <div
                  key={i}
                  style={{
                    ...common,
                    fontFamily: fonts.serif,
                    fontStyle: "italic",
                    fontWeight: current ? 600 : 500,
                    fontSize: 46,
                    color:
                      current && !muted
                        ? dark
                          ? colors.gold
                          : colors.wine
                        : pal.text,
                    textAlign: "center",
                  }}
                >
                  {it.text}
                </div>
              );
            }
            return (
              <div
                key={i}
                style={{
                  ...common,
                  fontFamily: fonts.sans,
                  fontWeight: 500,
                  fontSize: 32,
                  color: dark ? colors.gold : colors.wine,
                  padding: "10px 24px",
                  borderRadius: 40,
                  border: `1.5px solid ${dark ? "rgba(232,201,160,0.45)" : "rgba(91,31,63,0.35)"}`,
                  background: dark
                    ? "rgba(42,12,29,0.35)"
                    : "rgba(246,238,228,0.65)",
                }}
              >
                {it.text}
              </div>
            );
          })}
        </div>
      ) : null}
      <Grain opacity={dark ? 0.12 : 0.09} />
    </AbsoluteFill>
  );
};
