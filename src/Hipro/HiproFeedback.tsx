import React from "react";
import {
  AbsoluteFill,
  Easing,
  Html5Audio,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useWindowedAudioData, visualizeAudio } from "@remotion/media-utils";
import { z } from "zod";

// O post original tem 941x1672 px; a composição é 1080x1920.
const SRC_W = 941;
const K = 1080 / SRC_W;
const BG = "rgb(240, 232, 224)";

// Posição das 26 barras da onda sonora no post (medidas em px do original)
const BARS_X0 = 359.5;
const BARS_PITCH = 14.66;
const BAR_W = 7.5;
const BARS_CY = 502;
// Altura de cada barra no desenho original: mantém o "formato" da onda
const BAR_SHAPE = [
  18, 36, 54, 88, 60, 40, 60, 84, 60, 40, 60, 80, 112, 84, 60, 36, 54, 84, 66,
  50, 40, 60, 88, 54, 36, 18,
];
const MAX_BAR = 120;

export const hiproFeedbackSchema = z.object({
  audioFile: z.string(),
});

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const Waveform: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioFrame = frame;
  const { audioData, dataOffsetInSeconds } = useWindowedAudioData({
    src,
    frame: audioFrame,
    fps,
    windowInSeconds: 10,
  });

  let levels = new Array(BAR_SHAPE.length).fill(0);
  if (audioData) {
    const spectrum = visualizeAudio({
      fps,
      frame: audioFrame,
      audioData,
      numberOfSamples: 64,
      optimizeFor: "speed",
      dataOffsetInSeconds,
      smoothing: true,
    });
    // Usa as frequências da voz e espelha (centro = graves, bordas = agudos)
    const half = Math.ceil(BAR_SHAPE.length / 2);
    levels = BAR_SHAPE.map((_, i) => {
      const d = Math.abs(i - (BAR_SHAPE.length - 1) / 2);
      const bin = Math.min(Math.round((d / half) * 18) + 1, spectrum.length - 1);
      return Math.min(1, Math.sqrt(spectrum[bin]) * 3.2);
    });
  }

  return (
    <>
      {/* cobre a onda estática do post */}
      <div
        style={{
          position: "absolute",
          left: 345 * K,
          top: 432 * K,
          width: 400 * K,
          height: 140 * K,
          background: BG,
        }}
      />
      {BAR_SHAPE.map((h, i) => {
        const height = Math.min(
          MAX_BAR,
          Math.max(8, h * (0.3 + 1.3 * levels[i])),
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: (BARS_X0 + i * BARS_PITCH - BAR_W / 2) * K,
              top: (BARS_CY - height / 2) * K,
              width: BAR_W * K,
              height: height * K,
              borderRadius: 99,
              background: "#0b0b0b",
            }}
          />
        );
      })}
    </>
  );
};

// Anéis pulsando em volta do microfone
const MicPulse: React.FC = () => {
  const frame = useCurrentFrame();
  const cx = 271 * K;
  const cy = 500 * K;
  const r = 63 * K;
  return (
    <>
      {[0, 20].map((offset) => {
        const t = ((frame + offset) % 40) / 40;
        return (
          <div
            key={offset}
            style={{
              position: "absolute",
              left: cx - r,
              top: cy - r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              border: "3px solid rgba(11,11,11,0.5)",
              transform: `scale(${1 + t * 0.45})`,
              opacity: (1 - t) * 0.6,
            }}
          />
        );
      })}
    </>
  );
};

export const HiproFeedback: React.FC<z.infer<typeof hiproFeedbackSchema>> = ({
  audioFile,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const src = staticFile(audioFile);

  const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.04], clamp);
  const fadeIn = interpolate(frame, [0, 12], [1, 0], clamp);
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [0, 1],
    clamp,
  );
  // brilho suave atravessando a foto do antes/depois
  const sweep = interpolate(frame, [20, 80], [-30, 130], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Html5Audio src={src} />
      <AbsoluteFill
        style={{ transform: `scale(${zoom})`, transformOrigin: "50% 45%" }}
      >
        <Img
          src={staticFile("hipro-feedback.png")}
          style={{ width: "100%", height: "100%" }}
        />
        <MicPulse />
        <Waveform src={src} />
        <div
          style={{
            position: "absolute",
            left: 10 * K,
            top: 696 * K,
            width: 920 * K,
            height: 513 * K,
            background: `linear-gradient(110deg, transparent ${sweep - 20}%, rgba(255,240,220,0.45) ${sweep}%, transparent ${sweep + 20}%)`,
            mixBlendMode: "soft-light",
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: BG, opacity: fadeIn }} />
      <AbsoluteFill style={{ backgroundColor: BG, opacity: fadeOut }} />
    </AbsoluteFill>
  );
};
