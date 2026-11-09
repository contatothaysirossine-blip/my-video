import React from "react";
import {
  AbsoluteFill,
  Freeze,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { CHUNKS } from "./captions";

export const FPS = 30;
export const DURATION = Math.round(78.3 * FPS);

const SRC = staticFile("raw.mp4");
const FONT = "Inter, 'Inter Display', sans-serif";
const PINK = "#ffa0ac";

// Trecho em que a mentorada aparece sobreposta no vídeo bruto (medido no arquivo).
const SPLIT_IN = 176; // 5,867s
const SPLIT_OUT = 900; // 30,0s
// Congelar quadro: depois de "130K" a cena dela para e a cliente segue comentando.
const FREEZE_AT = 819; // 27,3s

// Tela dividida.
const TOP_H = 780; // altura da metade de cima
const SEAM = 140; // degradê da divisão

/* ------------------------------ tela dividida ----------------------------- */

// Recorte do quadro bruto 1080x1920 exibido dentro de um painel.
const Crop: React.FC<{ x: number; y: number; w: number; panelW: number }> = ({
  x,
  y,
  w,
  panelW,
}) => {
  const k = panelW / w;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
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
  );
};

const Split: React.FC = () => {
  const frame = useCurrentFrame(); // relativo a SPLIT_IN
  const freezeRel = FREEZE_AT - SPLIT_IN;

  // Metade de cima: a cena (mentorada), recorte x 200–1080 do bruto.
  const top = <Crop x={200} y={0} w={880} panelW={1080} />;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: TOP_H + SEAM }}>
        {frame >= freezeRel ? <Freeze frame={freezeRel}>{top}</Freeze> : top}
      </div>

      {/* Metade de baixo: cliente comentando, com máscara "divisão" em degradê. */}
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

/* -------------------------------- legenda --------------------------------- */

// Legenda clean: branca, discreta, embaixo (longe do rosto), frases-chave em rosa.
const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const chunk = CHUNKS.find((c) => t >= c.s && t < c.e);
  if (!chunk) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 300 }}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 46,
          lineHeight: 1.2,
          color: "white",
          textAlign: "center",
          maxWidth: 900,
          textShadow: "0 2px 10px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.5)",
        }}
      >
        {chunk.words.map((w, i) => (
          <span key={i} style={{ color: w.h ? PINK : "white" }}>
            {w.w}
            {i < chunk.words.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------- composição ------------------------------- */

export const Mentoria: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Vídeo original em tela cheia: dá o áudio e as partes sem divisão. */}
      <OffthreadVideo src={SRC} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <Sequence from={SPLIT_IN} durationInFrames={SPLIT_OUT - SPLIT_IN} name="Tela dividida">
        <Split />
      </Sequence>
      <Captions />
    </AbsoluteFill>
  );
};
