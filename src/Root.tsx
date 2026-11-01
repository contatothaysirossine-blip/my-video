import { Composition } from "remotion";
import { VideoRenata, videoSchema } from "./RenataAhnert/Video";

// Vídeo vertical (Reels/Stories) no mesmo formato da referência: 9:16, 30fps, 15,5s.
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="RenataAhnert"
      component={VideoRenata}
      schema={videoSchema}
      durationInFrames={465}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        inicioEncerramento: 11.8,
        legendas: [
          { texto: "Sentou", inicio: 0.9, fim: 1.6 },
          { texto: "tá ótimo", inicio: 2.0, fim: 2.7 },
          { texto: "Make", inicio: 2.8, fim: 3.5 },
          { texto: "isso", inicio: 5.0, fim: 5.6 },
          { texto: "ajeita", inicio: 6.4, fim: 7.0 },
          { texto: "cabelo", inicio: 7.0, fim: 7.6 },
          { texto: "respira", inicio: 8.4, fim: 9.1 },
          { texto: "já", inicio: 9.9, fim: 10.3 },
          { texto: "eu", inicio: 10.4, fim: 10.8 },
          { texto: "uma coisa", inicio: 10.8, fim: 11.3 },
          { texto: "pra falar", inicio: 11.3, fim: 11.8 },
        ],
      }}
    />
  );
};
