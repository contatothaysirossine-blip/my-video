import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import {
  CARD_GAP,
  CARD_HEIGHT,
  Notification,
  NotificationData,
} from "./Notification";
import { COLORS, FONT_SANS } from "./theme";

export const hiproSchema = z.object({
  notifications: z.array(z.object({ title: z.string(), message: z.string() })),
});

export const hiproDefaultProps: z.infer<typeof hiproSchema> = {
  notifications: [
    {
      title: "HIPRO | Tecnologia coreana",
      message: "Novidade chegando em São Mateus.",
    },
    {
      title: "Lifting sem cortes",
      message: "Firmeza e definição com tecnologia HIFU.",
    },
    { title: "Data marcada", message: "17/11 está chegando." },
    { title: "Não perca", message: "Fique de olho nas novidades!" },
  ],
};

// Linha do tempo (30 fps)
const ENTER_FRAMES = [25, 70, 120, 165];
const TAP_FRAME = 215;
const EXIT_START = 240;
const EXIT_END = 285;
const SWEEP_START = 315;

const STACK_LEFT = 80;
const STACK_WIDTH = 920;
const STACK_BOTTOM = 1500;
const STEP = CARD_HEIGHT + CARD_GAP;

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const Background: React.FC = () => {
  const frame = useCurrentFrame();

  // Cena 1: câmera próxima do aparelho, desfocada (profundidade de campo)
  // Cena 2: afasta e revela o post completo
  const scale =
    frame < EXIT_START
      ? interpolate(frame, [0, EXIT_START], [1.8, 1.68], clamp)
      : frame < EXIT_END
        ? interpolate(frame, [EXIT_START, EXIT_END], [1.68, 1.0], {
            ...clamp,
            easing: Easing.inOut(Easing.cubic),
          })
        : interpolate(frame, [EXIT_END, 450], [1.0, 1.04], clamp);

  const originX = interpolate(frame, [EXIT_START, EXIT_END], [70, 50], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const originY = interpolate(frame, [EXIT_START, EXIT_END], [40, 50], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

  // Pulso de foco quando a 3ª notificação chega (como na inspiração)
  const focusPulse = interpolate(
    frame,
    [ENTER_FRAMES[2] - 4, ENTER_FRAMES[2] + 2, ENTER_FRAMES[2] + 12],
    [0, 10, 0],
    clamp,
  );
  const baseBlur = interpolate(frame, [EXIT_START, EXIT_END], [9, 0], clamp);
  const fadeIn = interpolate(frame, [0, 18], [0, 1], clamp);
  const overlay = interpolate(frame, [EXIT_START, EXIT_END], [0.28, 0], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.beige }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          transformOrigin: `${originX}% ${originY}%`,
          filter: `blur(${baseBlur + focusPulse}px)`,
          opacity: fadeIn,
        }}
      >
        <Img
          src={staticFile("hipro-post.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 55%, rgba(231,221,209,0) 30%, rgba(94,53,23,${overlay}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const ShowLessPill: React.FC<{ y: number }> = ({ y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - (ENTER_FRAMES[0] + 18), fps });
  const pillStyle: React.CSSProperties = {
    height: 64,
    borderRadius: 32,
    background: COLORS.glass,
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1.5px solid rgba(255,255,255,0.65)",
    boxShadow: "0 12px 30px rgba(70,40,15,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: FONT_SANS,
    fontWeight: 500,
    color: COLORS.inkSoft,
  };
  return (
    <div
      style={{
        position: "absolute",
        top: y - 90,
        right: 1080 - STACK_LEFT - STACK_WIDTH + 10,
        display: "flex",
        gap: 18,
        opacity: p,
        transform: `scale(${interpolate(p, [0, 1], [0.7, 1])})`,
        transformOrigin: "right center",
      }}
    >
      <div style={{ ...pillStyle, padding: "0 32px", fontSize: 28 }}>
        ⌄&nbsp;&nbsp;Mostrar menos
      </div>
      <div style={{ ...pillStyle, width: 64, fontSize: 30 }}>✕</div>
    </div>
  );
};

const NotificationStack: React.FC<{ items: NotificationData[] }> = ({
  items,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const arrivals = ENTER_FRAMES.slice(0, items.length).map((f) =>
    spring({
      frame: frame - f,
      fps,
      config: { damping: 16, stiffness: 110 },
    }),
  );

  // Cada nova notificação empurra as anteriores para cima
  const topOf = (i: number) => {
    let shift = 0;
    for (let j = i + 1; j < arrivals.length; j++) shift += arrivals[j] * STEP;
    return STACK_BOTTOM - CARD_HEIGHT - shift;
  };

  const visible = arrivals.map((a, i) => (frame >= ENTER_FRAMES[i] ? a : 0));
  const firstVisible = visible.findIndex((v) => v > 0);
  const topY = firstVisible === -1 ? STACK_BOTTOM : topOf(firstVisible);

  // Saída: a pilha "voa" em direção à câmera com desfoque
  const exit = interpolate(frame, [EXIT_START, EXIT_END - 10], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });

  // Toque na última notificação
  const tapPress = interpolate(
    frame,
    [TAP_FRAME, TAP_FRAME + 4, TAP_FRAME + 10],
    [1, 0.96, 1],
    clamp,
  );
  const ripple = interpolate(frame, [TAP_FRAME, TAP_FRAME + 18], [0, 1], clamp);
  const lastIndex = items.length - 1;

  if (exit >= 1) return null;

  return (
    <AbsoluteFill
      style={{
        transform: `translateY(${-260 * exit}px) scale(${1 + 0.25 * exit})`,
        filter: `blur(${30 * exit}px)`,
        opacity: 1 - exit,
      }}
    >
      {firstVisible !== -1 && <ShowLessPill y={topY} />}
      {items.map((item, i) =>
        frame < ENTER_FRAMES[i] ? null : (
          <div
            key={i}
            style={{
              position: "absolute",
              left: STACK_LEFT,
              width: STACK_WIDTH,
              top: topOf(i),
              transform: i === lastIndex ? `scale(${tapPress})` : undefined,
            }}
          >
            <Notification data={item} enterFrame={ENTER_FRAMES[i]} />
            {i === lastIndex && frame >= TAP_FRAME && (
              <div
                style={{
                  position: "absolute",
                  left: STACK_WIDTH * 0.72 - 60,
                  top: CARD_HEIGHT / 2 - 60,
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  border: `4px solid ${COLORS.bronzeLight}`,
                  background: "rgba(255,255,255,0.35)",
                  transform: `scale(${0.4 + ripple * 1.2})`,
                  opacity: 1 - ripple,
                }}
              />
            )}
          </div>
        ),
      )}
    </AbsoluteFill>
  );
};

// Brilho dourado que atravessa o post na revelação final
const LightSweep: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [SWEEP_START, SWEEP_START + 50], [-120, 220], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  if (frame < SWEEP_START || frame > SWEEP_START + 50) return null;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(115deg, transparent ${x - 25}%, rgba(255,236,205,0.55) ${x}%, transparent ${x + 25}%)`,
        mixBlendMode: "soft-light",
      }}
    />
  );
};

export const HiproMotion: React.FC<z.infer<typeof hiproSchema>> = ({
  notifications,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames],
    [0, 1],
    clamp,
  );

  return (
    <AbsoluteFill>
      <Background />
      <NotificationStack items={notifications} />
      <LightSweep />
      <AbsoluteFill style={{ backgroundColor: COLORS.cream, opacity: fadeOut }} />
    </AbsoluteFill>
  );
};
