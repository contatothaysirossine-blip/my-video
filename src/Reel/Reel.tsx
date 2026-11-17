import React from "react";
import {
  AbsoluteFill,
  Easing,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/fonts";
import { BRAND, ENDING_FRAMES, FPS, TRANSITION_FRAMES } from "./brand";
import type { ReelData, Word } from "./types";

// Fonts are bundled in public/fonts so renders work offline.
const poppins = "Poppins";
const script = "Great Vibes";
loadFont({
  family: poppins,
  url: staticFile("fonts/Poppins-600.woff2"),
  weight: "600",
});
loadFont({
  family: poppins,
  url: staticFile("fonts/Poppins-800.woff2"),
  weight: "800",
});
loadFont({
  family: script,
  url: staticFile("fonts/GreatVibes.woff2"),
  weight: "400",
});

const VIDEO_BOX = { top: 400, size: 1000 };

export const reelDurationInFrames = (data: ReelData) => {
  const body = data.segments.reduce(
    (acc, s) => acc + Math.round((s.end - s.start) * FPS),
    0,
  );
  return body + ENDING_FRAMES - TRANSITION_FRAMES;
};

/** One jump-cut: a slice of the raw video, punched-in on alternating cuts. */
const Cut: React.FC<{
  index: number;
  startFrom: number;
  durationInFrames: number;
}> = ({ index, startFrom, durationInFrames }) => {
  const frame = useCurrentFrame();
  const zoomed = index % 2 === 1;
  const base = zoomed ? 1.32 : 1.12;
  // slow push-in over the cut keeps every frame alive
  const drift = interpolate(frame, [0, durationInFrames], [0, 0.04]);
  // tiny "snap" at the start of each cut
  const snap = interpolate(frame, [0, 4], [0.035, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const scale = base + drift + snap;
  // Speaker sits slightly left of centre in the source and her face is in the upper half.
  const originX = 47;
  const originY = zoomed ? 30 : 38;
  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={staticFile("raw.mp4")}
        startFrom={startFrom}
        style={{
          position: "absolute",
          height: "100%",
          // 1024x576 source -> fill the square box by height
          width: (VIDEO_BOX.size * 1024) / 576,
          left: (-(VIDEO_BOX.size * 1024) / 576) * 0.47 + VIDEO_BOX.size / 2,
          transform: `scale(${scale})`,
          transformOrigin: `${originX}% ${originY}%`,
        }}
      />
    </AbsoluteFill>
  );
};

const VideoBox: React.FC<{ data: ReelData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
  let cursor = 0;
  return (
    <div
      style={{
        position: "absolute",
        left: (1080 - VIDEO_BOX.size) / 2,
        top: VIDEO_BOX.top,
        width: VIDEO_BOX.size,
        height: VIDEO_BOX.size,
        borderRadius: 48,
        overflow: "hidden",
        boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
        border: `6px solid ${BRAND.cream}`,
        transform: `scale(${interpolate(enter, [0, 1], [0.9, 1])})`,
        opacity: enter,
        backgroundColor: "#000",
      }}
    >
      {data.segments.map((s, i) => {
        const dur = Math.round((s.end - s.start) * FPS);
        const from = cursor;
        cursor += dur;
        return (
          <Sequence key={i} from={from} durationInFrames={dur} premountFor={30}>
            <Cut
              index={i}
              startFrom={Math.round(s.start * FPS)}
              durationInFrames={dur}
            />
          </Sequence>
        );
      })}
    </div>
  );
};

const Header: React.FC<{ data: ReelData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pill = spring({ frame, fps, config: { damping: 14 } });
  return (
    <div
      style={{
        position: "absolute",
        top: 110,
        left: 60,
        right: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 22,
      }}
    >
      <div
        style={{
          fontFamily: script,
          fontSize: 64,
          color: BRAND.cream,
          lineHeight: 1,
          transform: `translateY(${interpolate(pill, [0, 1], [-30, 0])}px)`,
          opacity: pill,
        }}
      >
        Chá pra Restaurar
      </div>
      <div
        style={{
          fontFamily: poppins,
          fontWeight: 800,
          fontSize: 62,
          lineHeight: 1.12,
          color: "white",
          textAlign: "center",
          letterSpacing: -0.5,
        }}
      >
        {data.title.split(" ").map((w, i) => {
          const p = spring({
            frame: frame - 6 - i * 2,
            fps,
            config: { damping: 12, stiffness: 160 },
          });
          const highlighted = data.titleHighlight?.includes(
            w.toLowerCase().replace(/[^\p{L}]/gu, ""),
          );
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: 16,
                transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px) scale(${interpolate(p, [0, 1], [0.6, 1])})`,
                opacity: p,
                color: highlighted ? BRAND.gold : "white",
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const groupWords = (words: Word[]) => {
  // Short chunks (max 3 words / break on punctuation or pauses) read fast on Reels.
  const groups: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    const prev = words[i - 1];
    const gap = prev ? w.start - prev.end : 0;
    const chars =
      cur.reduce((a, c) => a + c.text.length + 1, 0) + w.text.length;
    if (
      cur.length &&
      (cur.length >= 3 ||
        chars > 20 ||
        gap > 0.35 ||
        /[.,!?;:]$/.test(prev?.text ?? ""))
    ) {
      groups.push(cur);
      cur = [];
    }
    cur.push(w);
  });
  if (cur.length) groups.push(cur);
  return groups;
};

const Captions: React.FC<{ data: ReelData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const groups = React.useMemo(() => groupWords(data.words), [data.words]);
  const gi = groups.findIndex(
    (g, i) =>
      t >= g[0].start &&
      t < (groups[i + 1]?.[0].start ?? g[g.length - 1].end + 0.6),
  );
  if (gi === -1) return null;
  const g = groups[gi];
  const pop = spring({
    frame: frame - Math.round(g[0].start * fps),
    fps,
    config: { damping: 11, stiffness: 220 },
  });
  return (
    <div
      style={{
        position: "absolute",
        top: VIDEO_BOX.top + VIDEO_BOX.size + 60,
        left: 50,
        right: 50,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        fontFamily: poppins,
        fontWeight: 800,
        fontSize: 72,
        lineHeight: 1.15,
        transform: `scale(${interpolate(pop, [0, 1], [0.75, 1])})`,
        opacity: interpolate(pop, [0, 1], [0, 1]),
      }}
    >
      {g.map((w, i) => {
        const active = t >= w.start && t < (g[i + 1]?.start ?? w.end + 0.6);
        const emph = data.emphasis?.includes(
          w.text.toLowerCase().replace(/[^\p{L}]/gu, ""),
        );
        return (
          <span
            key={i}
            style={{
              margin: "0 12px",
              padding: "0 14px",
              borderRadius: 16,
              color: active ? BRAND.plum : emph ? BRAND.gold : "white",
              backgroundColor: active ? BRAND.gold : "transparent",
              transform: active ? "scale(1.06)" : "scale(1)",
              textShadow: active ? "none" : "0 4px 18px rgba(0,0,0,0.35)",
            }}
          >
            {w.text.replace(/[,.;:]$/, "")}
          </span>
        );
      })}
    </div>
  );
};

const Progress: React.FC<{ bodyFrames: number }> = ({ bodyFrames }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, bodyFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        bottom: 110,
        left: 140,
        right: 140,
        height: 10,
        borderRadius: 5,
        backgroundColor: "rgba(255,255,255,0.18)",
      }}
    >
      <div
        style={{
          width: `${p * 100}%`,
          height: "100%",
          borderRadius: 5,
          backgroundColor: BRAND.gold,
        }}
      />
    </div>
  );
};

const Footer: React.FC = () => (
  <div
    style={{
      position: "absolute",
      bottom: 145,
      width: "100%",
      textAlign: "center",
      fontFamily: poppins,
      fontWeight: 600,
      fontSize: 32,
      color: "rgba(255,255,255,0.75)",
      letterSpacing: 1,
    }}
  >
    Flávia Bolzonello · Psicanalista & Terapeuta Integrativa
  </div>
);

export const Reel: React.FC<{ data: ReelData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const bodyFrames =
    reelDurationInFrames(data) - ENDING_FRAMES + TRANSITION_FRAMES;
  const fadeOut = interpolate(
    frame,
    [bodyFrames - TRANSITION_FRAMES, bodyFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.plum }}>
      <Sequence durationInFrames={bodyFrames} name="Body">
        <AbsoluteFill
          style={{
            opacity: fadeOut,
            background: `radial-gradient(ellipse at 50% 45%, ${BRAND.plumLight} 0%, ${BRAND.plum} 65%)`,
          }}
        >
          <Header data={data} />
          <VideoBox data={data} />
          <Captions data={data} />
          <Footer />
          <Progress bodyFrames={bodyFrames} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={bodyFrames - TRANSITION_FRAMES} name="Ending">
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, TRANSITION_FRAMES], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ opacity }}>
      <OffthreadVideo src={staticFile("ending.mp4")} />
    </AbsoluteFill>
  );
};
