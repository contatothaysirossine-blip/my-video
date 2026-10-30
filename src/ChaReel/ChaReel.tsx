import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Captions } from "./Captions";
import { CirclesPanel } from "./panels/CirclesPanel";
import { EnergyPanel } from "./panels/EnergyPanel";
import { SelfPanel } from "./panels/SelfPanel";
import { Speaker } from "./Speaker";
import { colors, fonts, loadBrandFonts } from "./theme";
import {
  activePanel,
  CARD_START,
  HEIGHT,
  SPEECH_END,
  splitProgress,
  WIDTH,
} from "./timeline";

const SPLIT_VIDEO_H = 1010;
const PANEL_H = HEIGHT - SPLIT_VIDEO_H;

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

const BrandTag: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div
    style={{
      position: "absolute",
      top: 64,
      width: "100%",
      textAlign: "center",
      opacity,
    }}
  >
    <div
      style={{
        fontFamily: fonts.serif,
        fontStyle: "italic",
        fontWeight: 600,
        fontSize: 46,
        color: colors.wine,
        textShadow: "0 1px 12px rgba(246,238,228,0.8)",
      }}
    >
      Chá pra Restaurar
    </div>
    <div
      style={{
        marginTop: 2,
        fontFamily: fonts.sans,
        fontWeight: 500,
        fontSize: 18,
        letterSpacing: 5,
        textTransform: "uppercase",
        color: colors.wine,
        opacity: 0.75,
      }}
    >
      com Flávia Bolzonello
    </div>
  </div>
);

export const ChaReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const [handle] = useState(() => delayRender("Loading brand fonts"));

  useEffect(() => {
    loadBrandFonts().then(() => continueRender(handle));
  }, [handle]);

  const p = splitProgress(t);
  const areaH = lerp(HEIGHT, SPLIT_VIDEO_H, p);
  const panel = activePanel(t);

  const card = interpolate(t, [CARD_START, SPEECH_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const intro = interpolate(frame, [0, 5], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.plumDeep }}>
      {t < SPEECH_END ? (
        <AbsoluteFill style={{ opacity: intro }}>
          <Speaker t={t} frame={frame} areaHeight={areaH} split={p} />

          {/* legibility veil behind captions */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: lerp(1180, areaH - 320, p),
              height: areaH - lerp(1180, areaH - 320, p),
              background: `linear-gradient(180deg, rgba(42,12,29,0) 0%, rgba(42,12,29,${lerp(
                0.38,
                0.5,
                p,
              )}) 100%)`,
            }}
          />

          {p > 0 && panel ? (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: areaH,
                width: WIDTH,
                height: PANEL_H,
                overflow: "hidden",
                boxShadow: "0 -8px 40px rgba(42,12,29,0.35)",
              }}
            >
              <div style={{ opacity: Math.min(1, p * 1.4), width: "100%", height: "100%" }}>
                {panel.kind === "circles" ? (
                  <CirclesPanel t={t} height={PANEL_H} />
                ) : panel.kind === "self" ? (
                  <SelfPanel t={t} height={PANEL_H} />
                ) : (
                  <EnergyPanel t={t} height={PANEL_H} mode={panel.kind} />
                )}
              </div>
              {/* fine gold seam */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 140,
                  right: 140,
                  height: 2,
                  background: `linear-gradient(90deg, rgba(232,201,160,0), ${colors.gold}, rgba(232,201,160,0))`,
                  opacity: p,
                }}
              />
            </div>
          ) : null}

          <BrandTag opacity={0.92} />
          <Captions t={t} centerY={lerp(1560, areaH - 118, p)} />
        </AbsoluteFill>
      ) : null}

      <Sequence from={Math.round(CARD_START * fps)} premountFor={fps}>
        <AbsoluteFill
          style={{
            opacity: card,
            transform: `scale(${lerp(1.035, 1, card)})`,
          }}
        >
          <OffthreadVideo
            src={staticFile("card.mp4")}
            muted
            style={{ width: WIDTH, height: HEIGHT }}
          />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
