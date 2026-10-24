import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Freeze,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { COLORS, SANS, SERIF } from "./brand";
import { Captions } from "./Captions";
import {
  buildChunks,
  buildShots,
  END_CARD_START,
  SOURCE_DURATION,
} from "./timeline";

export const editSchema = z.object({
  // Instagram handle shown as a corner tag and on the end card, e.g. "@thiara".
  instagram: z.string(),
  // Optional music bed in public/, e.g. "music.mp3".
  music: z.string(),
  musicVolume: z.number().min(0).max(1),
});

const sec = (s: number, fps: number) => Math.round(s * fps);

const Footage: React.FC<{ shots: ReturnType<typeof buildShots> }> = ({
  shots,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const shot = [...shots].reverse().find((s) => time >= s.start) ?? shots[0];
  // A barely-there push within each shot keeps the frame alive.
  const drift = interpolate(time - shot.start, [0, 4], [0, 0.015], {
    extrapolateRight: "clamp",
  });
  const lastFrame = sec(SOURCE_DURATION, fps) - 2;
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${shot.scale + drift})`,
        transformOrigin: "50% 30%",
      }}
    >
      <Sequence durationInFrames={lastFrame}>
        <OffthreadVideo src={staticFile("video.mp4")} />
      </Sequence>
      <Sequence from={lastFrame}>
        <Freeze frame={lastFrame}>
          <OffthreadVideo src={staticFile("video.mp4")} muted />
        </Freeze>
      </Sequence>
    </AbsoluteFill>
  );
};

const InstagramIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect
      x="2.5"
      y="2.5"
      width="19"
      height="19"
      rx="5.5"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="12" cy="12" r="4.3" stroke="currentColor" strokeWidth="2" />
    <circle cx="17.6" cy="6.4" r="1.3" fill="currentColor" />
  </svg>
);

const HandleTag: React.FC<{ handle: string; cuts: number[] }> = ({
  handle,
  cuts,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  // Switches side on every source cut, like the reference.
  const left = cuts.filter((c) => time >= c).length % 2 === 1;
  return (
    <AbsoluteFill
      style={{
        top: left ? "54%" : "25%",
        left: left ? 60 : "auto",
        right: left ? "auto" : 60,
        width: "auto",
        height: "auto",
        alignItems: left ? "flex-start" : "flex-end",
        color: COLORS.white,
        gap: 14,
        textShadow: "0 1px 6px rgba(61, 43, 31, 0.5)",
      }}
    >
      <InstagramIcon size={54} />
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
        }}
      >
        {handle}
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ handle: string }> = ({ handle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shade = interpolate(frame, [0, 12], [0, 0.82], {
    extrapolateRight: "clamp",
  });
  const appear = (delay: number) => {
    const t = interpolate(frame, [delay, delay + 10], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    return {
      opacity: t,
      filter: `blur(${(1 - t) * 8}px)`,
      transform: `translateY(${(1 - t) * 16}px)`,
    };
  };
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: COLORS.brown, opacity: shade }} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          color: COLORS.cream,
          gap: 18,
        }}
      >
        <div
          style={{
            ...appear(6),
            fontFamily: SANS,
            fontWeight: 500,
            fontSize: 34,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
          }}
        >
          método
        </div>
        <div
          style={{
            ...appear(10),
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 150,
            lineHeight: 0.9,
            color: COLORS.gold,
          }}
        >
          Viva Melhor
        </div>
        {handle ? (
          <div
            style={{
              ...appear(18),
              marginTop: 70,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              color: COLORS.white,
            }}
          >
            <InstagramIcon size={84} />
            <div
              style={{
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: 36,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
              }}
            >
              {handle}
            </div>
          </div>
        ) : null}
      </AbsoluteFill>
      <Sequence from={sec(0.2, fps)}>
        <Audio src={staticFile("sfx/whoosh-soft.wav")} volume={0.35} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Edit: React.FC<z.infer<typeof editSchema>> = ({
  instagram,
  music,
  musicVolume,
}) => {
  const { fps } = useVideoConfig();
  const chunks = useMemo(() => buildChunks(), []);
  const shots = useMemo(() => buildShots(chunks), [chunks]);
  const emphasisStarts = useMemo(
    () =>
      chunks.flatMap((c) =>
        c.lines
          .flat()
          .filter((w, i, all) => w.emphasis && !all[i - 1]?.emphasis),
      ),
    [chunks],
  );
  const cuts = shots.filter((s) => s.whoosh).map((s) => s.start);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.brown }}>
      <Footage shots={shots} />
      <Captions chunks={chunks} />
      {instagram ? (
        <Sequence durationInFrames={sec(END_CARD_START, fps)}>
          <HandleTag handle={instagram} cuts={cuts} />
        </Sequence>
      ) : null}
      <Sequence from={sec(END_CARD_START, fps)}>
        <EndCard handle={instagram} />
      </Sequence>

      {cuts.map((c) => (
        <Sequence key={c} from={Math.max(0, sec(c - 0.2, fps))}>
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.3} />
        </Sequence>
      ))}
      {emphasisStarts.map((w) => (
        <Sequence key={w.start} from={sec(w.start - 0.02, fps)}>
          <Audio src={staticFile("sfx/pop.wav")} volume={0.16} />
        </Sequence>
      ))}
      {music ? (
        <Audio src={staticFile(music)} volume={musicVolume} loop />
      ) : null}
    </AbsoluteFill>
  );
};
