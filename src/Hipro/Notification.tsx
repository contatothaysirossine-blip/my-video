import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT_SANS, FONT_SERIF } from "./theme";

export type NotificationData = {
  title: string;
  message: string;
};

export const CARD_HEIGHT = 190;
export const CARD_GAP = 22;

// Monogram "SP" usado como ícone do app (inspirado no logo da Dra. Siberlly Prates)
const AppIcon: React.FC = () => (
  <div
    style={{
      width: 92,
      height: 92,
      borderRadius: 24,
      background: `linear-gradient(145deg, ${COLORS.bronzeLight}, ${COLORS.bronze} 55%, ${COLORS.bronzeDark})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "inset 0 2px 4px rgba(255,255,255,0.45)",
      flexShrink: 0,
    }}
  >
    <span
      style={{
        fontFamily: FONT_SERIF,
        color: COLORS.cream,
        fontSize: 46,
        fontStyle: "italic",
        letterSpacing: -2,
      }}
    >
      SP
    </span>
  </div>
);

export const Notification: React.FC<{
  data: NotificationData;
  enterFrame: number;
}> = ({ data, enterFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - enterFrame,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });

  // Surge de baixo (de "dentro" do aparelho) com desfoque de movimento
  const translateY = interpolate(progress, [0, 1], [160, 0]);
  const scale = interpolate(progress, [0, 1], [0.82, 1]);
  const blur = interpolate(frame - enterFrame, [0, 9], [14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame - enterFrame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        height: CARD_HEIGHT,
        width: "100%",
        borderRadius: 52,
        padding: "0 40px",
        display: "flex",
        alignItems: "center",
        gap: 30,
        background: COLORS.glass,
        backdropFilter: "blur(28px) saturate(140%)",
        WebkitBackdropFilter: "blur(28px) saturate(140%)",
        border: "1.5px solid rgba(255,255,255,0.65)",
        boxShadow:
          "0 24px 50px rgba(70,40,15,0.22), inset 0 1px 0 rgba(255,255,255,0.8)",
        transform: `translateY(${translateY}px) scale(${scale})`,
        filter: `blur(${blur}px)`,
        opacity,
        position: "relative",
      }}
    >
      <AppIcon />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontWeight: 700,
            fontSize: 36,
            color: COLORS.ink,
            marginBottom: 6,
          }}
        >
          {data.title}
        </div>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontWeight: 500,
            fontSize: 34,
            lineHeight: 1.2,
            color: COLORS.inkSoft,
          }}
        >
          {data.message}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 30,
          right: 44,
          fontFamily: FONT_SANS,
          fontSize: 26,
          color: COLORS.muted,
        }}
      >
        agora
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 22,
          right: 44,
          fontFamily: FONT_SANS,
          fontStyle: "italic",
          fontSize: 22,
          color: COLORS.muted,
          opacity: 0.8,
        }}
      >
        Dra. Siberlly Prates
      </div>
    </div>
  );
};
