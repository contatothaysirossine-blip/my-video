import React, { useEffect, useMemo, useState } from "react";
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
import { BrandTag } from "./ChaReel";
import {
  panelAt,
  previousPanelAt,
  reelTiming,
  ReelConfig,
  resolveScenes,
  segmentIndexAt,
  splitAt,
} from "./engine";
import { ConceptPanel } from "./panels/ConceptPanel";
import { Speaker } from "./Speaker";
import { colors, loadBrandFonts } from "./theme";
import { HEIGHT, WIDTH } from "./timeline";

const SPLIT_VIDEO_H = 1010;
const PANEL_H = HEIGHT - SPLIT_VIDEO_H;

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

// Same visual language as the first reel, driven by a ReelConfig.
export const Reel: React.FC<{ config: ReelConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const [handle] = useState(() => delayRender("Loading brand fonts"));

  useEffect(() => {
    loadBrandFonts().then(() => continueRender(handle));
  }, [handle]);

  const scenes = useMemo(() => resolveScenes(config), [config]);
  const { speechEnd, cardStart } = reelTiming(config);

  const p = splitAt(scenes, t);
  const areaH = lerp(HEIGHT, SPLIT_VIDEO_H, p);
  const panel = panelAt(scenes, t);
  const prevPanel = previousPanelAt(scenes, t);

  const card = interpolate(t, [cardStart, speechEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const intro = interpolate(frame, [0, 5], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.plumDeep }}>
      {t < speechEnd ? (
        <AbsoluteFill style={{ opacity: intro }}>
          <Speaker
            t={t}
            frame={frame}
            areaHeight={areaH}
            split={p}
            src={config.video}
            face={config.face}
            segment={segmentIndexAt(config.captions, t)}
          />

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
              {prevPanel ? (
                <ConceptPanel
                  spec={prevPanel.panel}
                  captions={config.captions}
                  t={t}
                  from={prevPanel.from}
                  height={PANEL_H}
                  id={`${config.id}-${prevPanel.from}`}
                />
              ) : null}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity:
                    Math.min(1, p * 1.4) * (prevPanel ? prevPanel.mix : 1),
                }}
              >
                <ConceptPanel
                  spec={panel.panel}
                  captions={config.captions}
                  t={t}
                  from={panel.from}
                  height={PANEL_H}
                  id={`${config.id}-${panel.from}`}
                />
              </div>
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
          <Captions
            t={t}
            centerY={lerp(1560, areaH - 118, p)}
            words={config.captions.words}
            speechEnd={speechEnd}
          />
        </AbsoluteFill>
      ) : null}

      <Sequence from={Math.round(cardStart * fps)} premountFor={fps}>
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
