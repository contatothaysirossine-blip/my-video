import React from "react";
import {
  AbsoluteFill,
  Freeze,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CHUNKS } from "./captions";

export const FPS = 30;
export const DURATION = Math.round(78.3 * FPS);

const SRC = staticFile("raw.mp4");
const FONT = "Inter, 'Inter Display', sans-serif";
const ACCENT = "#F5D547"; // amarelo da blusa da cliente

// Trecho em que a mentorada aparece sobreposta no vídeo bruto (medido no arquivo).
const SPLIT_IN = 176; // 5,867s
const SPLIT_OUT = 900; // 30,0s
// Congelar quadro: logo depois de "130K", a mentorada fica parada e a cliente reage.
const FREEZE_AT = 819; // 27,3s

// Tela dividida (altura do painel de cima).
const TOP_H = 780;
const SEAM = 140; // altura do degradê entre as duas metades

// Zooms de corte nas partes em tela cheia (início em segundos -> escala).
const ZOOMS: [number, number][] = [
  [0, 1],
  [2.0, 1.12],
  [30, 1],
  [42.6, 1.14],
  [51.4, 1],
  [61.9, 1.14],
  [71.66, 1.04],
];

const zoomAt = (t: number) => {
  let z = 1;
  for (const [s, v] of ZOOMS) if (t >= s) z = v;
  return z;
};

const textShadow =
  "0 4px 18px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.6), 0 0 2px rgba(0,0,0,0.8)";

/* ---------------------------------- base ---------------------------------- */

const FullScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const z = zoomAt(frame / FPS);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <OffthreadVideo
        src={SRC}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${z})`,
          transformOrigin: "50% 42%",
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------ tela dividida ----------------------------- */

// Recorte do quadro bruto 1080x1920 exibido dentro de um painel.
const Crop: React.FC<{
  x: number;
  y: number;
  w: number;
  panelW: number;
  extraScale?: number;
}> = ({ x, y, w, panelW, extraScale = 1 }) => {
  const k = panelW / w;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${extraScale})`,
          transformOrigin: "50% 40%",
        }}
      >
        <OffthreadVideo
          src={SRC}
          muted
          trimBefore={SPLIT_IN}
          style={{
            position: "absolute",
            width: 1080 * k,
            height: 1920 * k,
            left: -x * k,
            top: -y * k,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Split: React.FC = () => {
  const frame = useCurrentFrame(); // relativo a SPLIT_IN
  const { fps } = useVideoConfig();
  const freezeRel = FREEZE_AT - SPLIT_IN;
  const frozen = frame >= freezeRel;

  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 12 });
  const punch = frozen
    ? spring({ frame: frame - freezeRel, fps, config: { damping: 14, mass: 0.6 } })
    : 0;
  const flash = frozen
    ? interpolate(frame - freezeRel, [0, 2, 8], [0, 0.85, 0], {
        extrapolateRight: "clamp",
      })
    : 0;

  // Painel de cima: mentorada (recorte x 200–1080 do bruto).
  const top = <Crop x={200} y={0} w={880} panelW={1080} extraScale={1 + 0.08 * punch} />;

  return (
    <AbsoluteFill style={{ backgroundColor: "black", opacity: enter }}>
      {/* metade de cima */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: TOP_H + SEAM }}>
        {frozen ? <Freeze frame={freezeRel}>{top}</Freeze> : top}
        <AbsoluteFill style={{ backgroundColor: "white", opacity: flash }} />
        {frozen ? <FrozenBadge frame={frame - freezeRel} /> : null}
      </div>

      {/* metade de baixo: cliente reagindo, com máscara em degradê no topo */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: TOP_H - SEAM / 2,
          width: 1080,
          height: 1920 - TOP_H + SEAM / 2,
          WebkitMaskImage: `linear-gradient(to bottom, transparent 0px, black ${SEAM}px)`,
          maskImage: `linear-gradient(to bottom, transparent 0px, black ${SEAM}px)`,
        }}
      >
        <Crop x={0} y={470} w={1080} panelW={1080} />
      </div>
    </AbsoluteFill>
  );
};

const FrozenBadge: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 3, fps, config: { damping: 10, mass: 0.7 } });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 170 }}>
      <div
        style={{
          transform: `scale(${s}) rotate(-4deg)`,
          backgroundColor: ACCENT,
          color: "#1a1a1a",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 120,
          letterSpacing: -2,
          padding: "10px 44px",
          borderRadius: 28,
          boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
        }}
      >
        R$ 130K
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------- textos ---------------------------------- */

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inS = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 14 });
  const out = interpolate(frame, [SPLIT_IN - 10, SPLIT_IN], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 230, opacity: out }}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 78,
          lineHeight: 1.08,
          color: "white",
          textAlign: "center",
          width: 900,
          textShadow,
          transform: `translateY(${(1 - inS) * 40}px)`,
          opacity: inS,
        }}
      >
        Como minha mentorada chegou a{" "}
        <span style={{ color: ACCENT }}>R$&nbsp;130K</span> no mês
      </div>
    </AbsoluteFill>
  );
};

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const chunk = CHUNKS.find((c) => t >= c.s && t < c.e);
  if (!chunk) return null;
  const split = frame >= SPLIT_IN && frame < SPLIT_OUT;
  const local = frame - Math.round(chunk.s * FPS);
  const pop = interpolate(local, [0, 4], [0.85, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: split ? TOP_H - 52 : 1330,
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 66,
          color: "white",
          textAlign: "center",
          maxWidth: 940,
          lineHeight: 1.1,
          textShadow,
          transform: `scale(${pop})`,
        }}
      >
        {chunk.words.map((w, i) => {
          const active = t >= w.s && t < (chunk.words[i + 1]?.s ?? chunk.e);
          return (
            <span key={i} style={{ color: active ? ACCENT : "white" }}>
              {w.w}
              {i < chunk.words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame, fps, config: { damping: 14 } });
  const b = spring({ frame: frame - 70, fps, config: { damping: 14 } });
  const pill: React.CSSProperties = {
    fontFamily: FONT,
    fontWeight: 900,
    textAlign: "center",
    borderRadius: 999,
    boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
  };
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 210, gap: 26 }}>
      <div
        style={{
          ...pill,
          transform: `scale(${a})`,
          backgroundColor: ACCENT,
          color: "#1a1a1a",
          fontSize: 50,
          padding: "18px 40px",
        }}
      >
        AULA AO VIVO · 15 DE NOVEMBRO
      </div>
      <div
        style={{
          ...pill,
          transform: `scale(${b})`,
          backgroundColor: "white",
          color: "#1a1a1a",
          fontSize: 48,
          padding: "16px 40px",
        }}
      >
        Clique em <span style={{ textDecoration: "underline" }}>Saiba Mais</span>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------- composição ------------------------------- */

export const Mentoria: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Faixa principal: dá o áudio do vídeo inteiro e as partes em tela cheia. */}
      <FullScreen />
      <Sequence from={SPLIT_IN} durationInFrames={SPLIT_OUT - SPLIT_IN} name="Tela dividida">
        <Split />
      </Sequence>
      <Sequence durationInFrames={SPLIT_IN} name="Gancho">
        <Hook />
      </Sequence>
      <Sequence from={Math.round(71.66 * FPS)} name="CTA">
        <CTA />
      </Sequence>
      <Captions />
    </AbsoluteFill>
  );
};
