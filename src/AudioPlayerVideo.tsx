import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import waveform from "./waveform.json";

// Player de áudio no estilo "mensagem de voz" sobreposto ao vídeo.
const BAR_WIDTH = 7;
const BAR_GAP = 9;
const MAX_BAR_HEIGHT = 64;
const PLAYED = "rgba(255,255,255,0.95)";
const UNPLAYED = "rgba(255,255,255,0.35)";
const DOT = "#3B8EF5";

const PauseIcon: React.FC = () => (
  <div style={{ display: "flex", gap: 9, marginRight: 46 }}>
    {[0, 1].map((i) => (
      <div
        key={i}
        style={{
          width: 10,
          height: 42,
          borderRadius: 4,
          backgroundColor: "rgba(255,255,255,0.75)",
        }}
      />
    ))}
  </div>
);

// Trecho do vídeo em que a fala acontece (3,03s até 41,48s, a 60 fps).
const AUDIO_START = 182;
const AUDIO_END = 2489;

export const AudioPlayerVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <OffthreadVideo src={staticFile("video.mp4")} />
      <Sequence
        from={AUDIO_START}
        durationInFrames={AUDIO_END - AUDIO_START}
        layout="none"
      >
        <AudioPlayer />
      </Sequence>
    </AbsoluteFill>
  );
};

const AudioPlayer: React.FC = () => {
  // Dentro da Sequence o frame começa em 0 no início da fala.
  const frame = useCurrentFrame();
  const durationInFrames = AUDIO_END - AUDIO_START;

  const bars = waveform as number[];
  const totalWidth = bars.length * BAR_WIDTH + (bars.length - 1) * BAR_GAP;
  const progress = frame / (durationInFrames - 1);
  const playheadX = progress * totalWidth;

  // Fade-in quando a fala começa e fade-out quando termina
  const opacity = interpolate(
    frame,
    [0, 16, durationInFrames - 16, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 1050,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity,
          filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.55))",
        }}
      >
        <PauseIcon />
        <div
          style={{
            position: "relative",
            width: totalWidth,
            height: MAX_BAR_HEIGHT,
            display: "flex",
            alignItems: "center",
            gap: BAR_GAP,
          }}
        >
          {bars.map((amp, i) => {
            const barCenter = i * (BAR_WIDTH + BAR_GAP) + BAR_WIDTH / 2;
            const played = barCenter <= playheadX;
            return (
              <div
                key={i}
                style={{
                  width: BAR_WIDTH,
                  height: Math.max(10, amp * MAX_BAR_HEIGHT),
                  borderRadius: BAR_WIDTH / 2,
                  backgroundColor: played ? PLAYED : UNPLAYED,
                }}
              />
            );
          })}
          <div
            style={{
              position: "absolute",
              left: playheadX - 14,
              top: MAX_BAR_HEIGHT / 2 - 14,
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: DOT,
              boxShadow: "0 0 12px rgba(59,142,245,0.6)",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
