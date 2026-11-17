import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
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
import type { Cue, ReelData, Word } from "./types";
import broll from "../broll.json";

// Fonts are bundled in public/fonts so renders work offline.
const poppins = "Poppins";
const script = "Great Vibes";
loadFont({ family: poppins, url: staticFile("fonts/Poppins-600.woff2"), weight: "600" });
loadFont({ family: poppins, url: staticFile("fonts/Poppins-800.woff2"), weight: "800" });
loadFont({ family: script, url: staticFile("fonts/GreatVibes.woff2"), weight: "400" });

const W = 1080;
const H = 1920;
const SEAM = 960; // split-screen divider
const SRC_ASPECT = 1024 / 576;
const FACE_X = 0.47; // speaker's horizontal position in the raw frame
const HOOK_FRAMES = 105;

const BROLL = broll as Record<string, { w: number; h: number }>;

export const reelDurationInFrames = (data: ReelData) => {
  const body = data.segments.reduce(
    (acc, s) => acc + Math.round((s.end - s.start) * FPS),
    0,
  );
  return body + ENDING_FRAMES - TRANSITION_FRAMES;
};

const cueAt = (cues: Cue[], t: number) => {
  let idx = 0;
  cues.forEach((c, i) => {
    if (t >= c.t) idx = i;
  });
  return idx;
};

/* ---------------------------------------------------------------- speaker */

const Cut: React.FC<{
  index: number;
  startFrom: number;
  durationInFrames: number;
  boxHeight: number;
}> = ({ index, startFrom, durationInFrames, boxHeight }) => {
  const frame = useCurrentFrame();
  const full = boxHeight > SEAM;
  // jump-cut punch-in on every other cut + slow push to keep it alive
  const base = index % 2 === 1 ? (full ? 1.07 : 1.12) : 1;
  const drift = interpolate(frame, [0, durationInFrames], [0, 0.035]);
  const snap = interpolate(frame, [0, 4], [0.04, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const vw = boxHeight * SRC_ASPECT;
  return (
    <OffthreadVideo
      src={staticFile("raw.mp4")}
      startFrom={startFrom}
      style={{
        position: "absolute",
        top: 0,
        height: boxHeight,
        width: vw,
        left: W / 2 - vw * FACE_X,
        transform: `scale(${base + drift + snap})`,
        transformOrigin: `${FACE_X * 100}% ${full ? 12 : 40}%`,
      }}
    />
  );
};

const Speaker: React.FC<{ data: ReelData; mode: Cue["mode"] }> = ({ data, mode }) => {
  const top = mode === "split" ? SEAM : 0;
  const boxHeight = mode === "split" ? H - SEAM : H;
  let cursor = 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: W,
        top,
        height: boxHeight,
        overflow: "hidden",
        // keep it mounted while an image covers the screen so the voice keeps playing
        opacity: mode === "image" ? 0 : 1,
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
              boxHeight={boxHeight}
            />
          </Sequence>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ b-roll */

const BrollImage: React.FC<{
  img: string;
  full: boolean;
  durationInFrames: number;
  seed: number;
}> = ({ img, full, durationInFrames, seed }) => {
  const frame = useCurrentFrame();
  const boxH = full ? H : SEAM;
  const meta = BROLL[img] ?? { w: 1, h: 1 };
  const landscape = meta.w / meta.h > W / boxH + 0.05;
  // Ken Burns: alternate zoom-in / zoom-out and a little pan
  const zoomIn = seed % 2 === 0;
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  const kb = zoomIn ? 1.04 + p * 0.1 : 1.14 - p * 0.1;
  const pan = ((seed % 3) - 1) * 20 * p;
  const snap = interpolate(frame, [0, 5], [0.06, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const flash = interpolate(frame, [0, 4], [0.35, 0], { extrapolateRight: "clamp" });
  const src = staticFile(`broll/${img}.jpg`);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: W,
        height: boxH,
        overflow: "hidden",
        backgroundColor: BRAND.plum,
      }}
    >
      {full && landscape ? (
        <>
          {/* landscape photo on a vertical screen: blurred fill + sharp photo */}
          <Img
            src={src}
            style={{
              position: "absolute",
              left: -60,
              top: -60,
              width: W + 120,
              height: boxH + 120,
              objectFit: "cover",
              filter: "blur(40px) brightness(0.55)",
            }}
          />
          <Img
            src={src}
            style={{
              position: "absolute",
              left: 0,
              width: W,
              top: boxH * 0.44 - 575,
              height: 1150,
              objectFit: "cover",
              transform: `scale(${kb + snap}) translateX(${pan}px)`,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          />
        </>
      ) : (
        <Img
          src={src}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: W,
            height: boxH,
            objectFit: "cover",
            transform: `scale(${kb + snap}) translateX(${pan}px)`,
          }}
        />
      )}
      <AbsoluteFill style={{ backgroundColor: "white", opacity: flash }} />
    </div>
  );
};

const Broll: React.FC<{ data: ReelData; bodyFrames: number }> = ({ data, bodyFrames }) => (
  <>
    {data.cues.map((c, i) => {
      if (!c.img || c.mode === "speaker") return null;
      const from = Math.round(c.t * FPS);
      const to =
        i + 1 < data.cues.length ? Math.round(data.cues[i + 1].t * FPS) : bodyFrames;
      if (to <= from) return null;
      return (
        <Sequence key={i} from={from} durationInFrames={to - from} premountFor={30}>
          <BrollImage
            img={c.img}
            full={c.mode === "image"}
            durationInFrames={to - from}
            seed={i}
          />
        </Sequence>
      );
    })}
  </>
);

/* ---------------------------------------------------------------- overlays */

const Hook: React.FC<{ data: ReelData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame > HOOK_FRAMES + 12) return null;
  const inP = spring({ frame, fps, config: { damping: 13, stiffness: 140 } });
  const out = interpolate(frame, [HOOK_FRAMES, HOOK_FRAMES + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 170,
        left: 60,
        right: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: `translateY(${interpolate(out, [0, 1], [0, -260])}px) scale(${interpolate(inP, [0, 1], [0.7, 1])})`,
        opacity: inP * (1 - out),
      }}
    >
      <div
        style={{
          backgroundColor: BRAND.plum,
          borderRadius: 28,
          padding: "26px 40px 30px",
          boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
          border: `4px solid ${BRAND.gold}`,
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: script, fontSize: 54, color: BRAND.gold, lineHeight: 1 }}>
          Chá pra Restaurar
        </div>
        <div
          style={{
            fontFamily: poppins,
            fontWeight: 800,
            fontSize: 64,
            lineHeight: 1.1,
            color: "white",
            marginTop: 10,
          }}
        >
          {data.title.split(" ").map((w, i) => {
            const hl = data.titleHighlight?.includes(
              w.toLowerCase().replace(/[^\p{L}]/gu, ""),
            );
            return (
              <span key={i} style={{ color: hl ? BRAND.gold : "white" }}>
                {w}{" "}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Watermark: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [HOOK_FRAMES + 6, HOOK_FRAMES + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 70,
        width: "100%",
        textAlign: "center",
        fontFamily: script,
        fontSize: 52,
        color: "white",
        opacity: o * 0.92,
        textShadow: "0 2px 14px rgba(0,0,0,0.7)",
      }}
    >
      Chá pra Restaurar
    </div>
  );
};

const groupWords = (words: Word[]) => {
  // Short chunks (max 3 words / ~20 chars / break on punctuation or pauses).
  const groups: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    const prev = words[i - 1];
    const gap = prev ? w.start - prev.end : 0;
    const chars = cur.reduce((a, c) => a + c.text.length + 1, 0) + w.text.length;
    if (
      cur.length &&
      (cur.length >= 3 || chars > 20 || gap > 0.35 || /[.,!?;:]$/.test(prev?.text ?? ""))
    ) {
      groups.push(cur);
      cur = [];
    }
    cur.push(w);
  });
  if (cur.length) groups.push(cur);
  return groups;
};

const Captions: React.FC<{ data: ReelData; mode: Cue["mode"] }> = ({ data, mode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const groups = React.useMemo(() => groupWords(data.words), [data.words]);
  const gi = groups.findIndex(
    (g, i) => t >= g[0].start && t < (groups[i + 1]?.[0].start ?? g[g.length - 1].end + 0.6),
  );
  if (gi === -1) return null;
  const g = groups[gi];
  const pop = spring({
    frame: frame - Math.round(g[0].start * fps),
    fps,
    config: { damping: 11, stiffness: 220 },
  });
  const centerY = mode === "split" ? SEAM : 1330;
  return (
    <div
      style={{
        position: "absolute",
        top: centerY,
        left: 40,
        right: 40,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: poppins,
        fontWeight: 800,
        fontSize: 76,
        lineHeight: 1.18,
        transform: `translateY(-50%) scale(${interpolate(pop, [0, 1], [0.75, 1])})`,
        opacity: interpolate(pop, [0, 1], [0, 1]),
      }}
    >
      {g.map((w, i) => {
        const active = t >= w.start && t < (g[i + 1]?.start ?? w.end + 0.6);
        const emph = data.emphasis?.includes(w.text.toLowerCase().replace(/[^\p{L}]/gu, ""));
        return (
          <span
            key={i}
            style={{
              margin: "4px 8px",
              padding: "0 16px",
              borderRadius: 16,
              color: active ? BRAND.plum : emph ? BRAND.gold : "white",
              backgroundColor: active ? BRAND.gold : "transparent",
              transform: active ? "scale(1.06)" : "scale(1)",
              textShadow: active
                ? "none"
                : "0 0 6px rgba(0,0,0,0.9), 0 4px 18px rgba(0,0,0,0.8), 3px 3px 0 rgba(72,33,54,0.9)",
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
  const p = interpolate(frame, [0, bodyFrames], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: `${p * 100}%`,
        height: 12,
        backgroundColor: BRAND.gold,
      }}
    />
  );
};

/* -------------------------------------------------------------------- reel */

export const Reel: React.FC<{ data: ReelData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const bodyFrames = reelDurationInFrames(data) - ENDING_FRAMES + TRANSITION_FRAMES;
  const cue = data.cues[cueAt(data.cues, frame / FPS)] ?? { t: 0, mode: "speaker" as const };
  const fadeOut = interpolate(frame, [bodyFrames - TRANSITION_FRAMES, bodyFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.plum }}>
      <Sequence durationInFrames={bodyFrames} name="Body">
        <AbsoluteFill style={{ opacity: fadeOut }}>
          <Speaker data={data} mode={cue.mode} />
          <Broll data={data} bodyFrames={bodyFrames} />
          {cue.mode === "split" ? (
            <div
              style={{
                position: "absolute",
                top: SEAM - 5,
                left: 0,
                width: W,
                height: 10,
                backgroundColor: BRAND.plum,
                borderTop: `2px solid ${BRAND.gold}`,
                borderBottom: `2px solid ${BRAND.gold}`,
              }}
            />
          ) : (
            <AbsoluteFill
              style={{
                background: `linear-gradient(180deg, rgba(0,0,0,0) 55%, ${BRAND.plum}cc 100%)`,
              }}
            />
          )}
          <AbsoluteFill
            style={{
              background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 12%)",
            }}
          />
          <Watermark />
          <Captions data={data} mode={cue.mode} />
          <Hook data={data} />
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
