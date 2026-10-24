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

const Footage: React.FC<{
  shots: ReturnType<typeof buildShots>;
  cuts: number[];
  pops: number[];
}> = ({ shots, cuts, pops }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const shot = [...shots].reverse().find((s) => time >= s.start) ?? shots[0];
  // A barely-there push within each shot keeps the frame alive.
  const drift = interpolate(time - shot.start, [0, 4], [0, 0.015], {
    extrapolateRight: "clamp",
  });

  // Whoosh: the frame rushes forward with motion blur into the cut, then
  // settles on the new shot.
  const cut = cuts.find((c) => time >= c - 0.12 && time < c + 0.3);
  const rush =
    cut === undefined
      ? 0
      : time < cut
        ? interpolate(time, [cut - 0.12, cut], [0, 1], {
            easing: Easing.in(Easing.quad),
          })
        : interpolate(time, [cut, cut + 0.3], [1, 0], {
            easing: Easing.out(Easing.cubic),
          });

  // Pop: a short zoom punch on each key word.
  const pop = pops.find((p) => time >= p && time < p + 0.3);
  const punch =
    pop === undefined
      ? 0
      : interpolate(time - pop, [0, 0.06, 0.3], [0, 1, 0], {
          easing: Easing.out(Easing.quad),
        });

  const lastFrame = sec(SOURCE_DURATION, fps) - 2;
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${shot.scale + drift + rush * 0.12 + punch * 0.035})`,
        transformOrigin: "50% 30%",
        filter: rush > 0.01 ? `blur(${rush * 6}px)` : undefined,
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

// Warm light wash in the brand gold and cream (like CapCut's "Impressão"),
// fired with each whoosh and on the opening frame.
const GlowFlash: React.FC<{ times: number[] }> = ({ times }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const at = times.find((t) => time >= t - 0.08 && time < t + 0.5);
  if (at === undefined) return null;
  const k = interpolate(time, [at - 0.08, at, at + 0.5], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 45%, ${COLORS.cream} 0%, ${COLORS.gold} 100%)`,
        mixBlendMode: "screen",
        opacity: k * 0.82,
      }}
    />
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

const Name: React.FC<{ size: number }> = ({ size }) => (
  <div
    style={{
      fontFamily: SANS,
      fontSize: size,
      letterSpacing: "-0.01em",
      color: COLORS.white,
    }}
  >
    <span style={{ fontWeight: 700 }}>Thiara</span>{" "}
    <span style={{ fontWeight: 500 }}>Fumiere</span>
  </div>
);

// Her name over the opening seconds, same white-with-shadow look as the
// captions.
const NameTag: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = interpolate(
    frame,
    [0, 10, durationInFrames - 8, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const rise = interpolate(frame, [0, 12], [16, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill
      style={{
        top: "80%",
        bottom: "auto",
        alignItems: "center",
        opacity: t,
        filter: `blur(${(1 - Math.min(1, frame / (fps / 3))) * 8}px)`,
        transform: `translateY(${rise}px)`,
        textShadow:
          "0 3px 6px rgba(0, 0, 0, 0.45), 0 6px 22px rgba(0, 0, 0, 0.35)",
      }}
    >
      <Name size={62} />
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
            fontSize: 170,
            lineHeight: 0.9,
            color: COLORS.gold,
          }}
        >
          Viva Melhor
        </div>
        <div style={{ ...appear(16), marginTop: 46 }}>
          <Name size={46} />
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
      <Footage
        shots={shots}
        cuts={cuts}
        pops={emphasisStarts.map((w) => w.start - 0.02)}
      />
      <GlowFlash times={[0, ...cuts]} />
      <Captions chunks={chunks} />
      <Sequence from={sec(0.3, fps)} durationInFrames={sec(4.5, fps)}>
        <NameTag />
      </Sequence>
      {instagram ? (
        <Sequence durationInFrames={sec(END_CARD_START, fps)}>
          <HandleTag handle={instagram} cuts={cuts} />
        </Sequence>
      ) : null}
      <Sequence from={sec(END_CARD_START, fps)}>
        <EndCard handle={instagram} />
      </Sequence>

      <Audio src={staticFile("sfx/whoosh-soft.wav")} volume={0.3} />
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
