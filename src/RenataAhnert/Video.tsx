import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";

// Palavras das legendas (estilo "palavra por palavra" da referência).
// "inicio" e "fim" em segundos.
export const legendaSchema = z.object({
  texto: z.string(),
  inicio: z.number(),
  fim: z.number(),
});

export const videoSchema = z.object({
  legendas: z.array(legendaSchema),
  inicioEncerramento: z.number(),
});

type Plano = {
  inicio: number; // segundos
  // enquadramento: escala e centro (0-1) do ponto em que a câmera está olhando
  escalaDe: number;
  escalaPara: number;
  focoX: number;
  focoY: number;
  derivaX: number; // movimento lateral em px ao longo do plano
  derivaY: number;
};

// Sequência de cortes inspirada na referência:
// entrada em movimento -> plano médio -> plano aberto -> detalhes -> plano médio.
const PLANOS: Plano[] = [
  { inicio: 0, escalaDe: 1.9, escalaPara: 1.55, focoX: 0.5, focoY: 0.68, derivaX: -60, derivaY: -40 },
  { inicio: 1.0, escalaDe: 1.35, escalaPara: 1.42, focoX: 0.48, focoY: 0.46, derivaX: 20, derivaY: 0 },
  { inicio: 2.6, escalaDe: 1.12, escalaPara: 1.18, focoX: 0.5, focoY: 0.52, derivaX: -15, derivaY: 5 },
  { inicio: 4.2, escalaDe: 1.75, escalaPara: 1.85, focoX: 0.47, focoY: 0.36, derivaX: 12, derivaY: -8 },
  { inicio: 5.6, escalaDe: 1.3, escalaPara: 1.36, focoX: 0.52, focoY: 0.5, derivaX: -18, derivaY: 0 },
  { inicio: 7.0, escalaDe: 2.1, escalaPara: 2.2, focoX: 0.5, focoY: 0.55, derivaX: 10, derivaY: 6 },
  { inicio: 8.2, escalaDe: 1.4, escalaPara: 1.48, focoX: 0.49, focoY: 0.44, derivaX: 14, derivaY: -6 },
  { inicio: 9.8, escalaDe: 1.6, escalaPara: 1.7, focoX: 0.48, focoY: 0.4, derivaX: -10, derivaY: 0 },
];

const Cena: React.FC<{ fimCena: number }> = ({ fimCena }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  let idx = 0;
  for (let i = 0; i < PLANOS.length; i++) if (t >= PLANOS[i].inicio) idx = i;
  const plano = PLANOS[idx];
  const fimPlano = idx + 1 < PLANOS.length ? PLANOS[idx + 1].inicio : fimCena;
  const p = interpolate(t, [plano.inicio, fimPlano], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  const escala = interpolate(p, [0, 1], [plano.escalaDe, plano.escalaPara]);

  // Leve tremor de câmera na mão
  const tremX = Math.sin(frame / 9) * 3 + Math.sin(frame / 23) * 4;
  const tremY = Math.cos(frame / 11) * 3 + Math.sin(frame / 31) * 3;

  const tx = (0.5 - plano.focoX) * width * escala + plano.derivaX * p + tremX;
  const ty = (0.5 - plano.focoY) * height * escala + plano.derivaY * p + tremY;

  // Primeiro plano entra com desfoque de movimento, como na referência
  const desfoqueEntrada = interpolate(t, [0, 0.6], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#1b1a18" }}>
      <AbsoluteFill
        style={{
          transform: `translate(${tx}px, ${ty}px) scale(${escala})`,
          filter: `blur(${desfoqueEntrada}px)`,
        }}
      >
        {/* Cenário: arara com as peças */}
        <Img
          src={staticFile("cenario.jpg")}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(5px) brightness(0.62) saturate(0.85) sepia(0.18)",
            transform: "scale(1.08) translateY(-4%)",
          }}
        />
        {/* Sombra de contato no chão */}
        <div
          style={{
            position: "absolute",
            left: "18%",
            width: "70%",
            top: "86%",
            height: "6%",
            borderRadius: "50%",
            background: "radial-gradient(ellipse at center, rgba(0,0,0,0.55), rgba(0,0,0,0) 70%)",
          }}
        />
        {/* Cliente recortada */}
        <Img
          src={staticFile("cliente-recorte.png")}
          style={{
            position: "absolute",
            height: "90%",
            left: "50%",
            bottom: "5%",
            transform: "translateX(-50%)",
            filter: "brightness(0.9) contrast(1.06) saturate(0.92) sepia(0.08)",
          }}
        />
      </AbsoluteFill>
      {/* Grade de cor quente + vinheta (look cinematográfico da referência) */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.6) 100%)",
        }}
      />
      <AbsoluteFill style={{ backgroundColor: "rgba(120, 90, 40, 0.08)", mixBlendMode: "multiply" }} />
    </AbsoluteFill>
  );
};

const Legenda: React.FC<{ legendas: z.infer<typeof legendaSchema>[] }> = ({ legendas }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const atual = legendas.find((l) => t >= l.inicio && t < l.fim);
  if (!atual) return null;
  const local = t - atual.inicio;
  const pop = interpolate(local, [0, 0.12], [0.85, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(2)),
  });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center" }}>
      <div
        style={{
          marginTop: "58%",
          fontFamily: "Montserrat, 'Helvetica Neue', Arial, sans-serif",
          fontWeight: 700,
          fontSize: 54,
          color: "white",
          letterSpacing: 0.5,
          textShadow: "0 2px 12px rgba(0,0,0,0.55)",
          transform: `scale(${pop})`,
        }}
      >
        {atual.texto}
      </div>
    </AbsoluteFill>
  );
};

const Encerramento: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [6, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const escala = interpolate(frame, [0, 110], [0.96, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "black", justifyContent: "center", alignItems: "center" }}>
      <Img
        src={staticFile("logo.png")}
        style={{ width: "62%", opacity, transform: `scale(${escala})` }}
      />
    </AbsoluteFill>
  );
};

export const VideoRenata: React.FC<z.infer<typeof videoSchema>> = ({ legendas, inicioEncerramento }) => {
  const { fps } = useVideoConfig();
  const corte = Math.round(inicioEncerramento * fps);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Sequence durationInFrames={corte} name="Cena">
        <Cena fimCena={inicioEncerramento} />
        <Legenda legendas={legendas} />
      </Sequence>
      <Sequence from={corte} name="Encerramento - logo">
        <Encerramento />
      </Sequence>
    </AbsoluteFill>
  );
};
