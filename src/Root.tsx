import { Composition, Folder } from "remotion";
import { ChaReel } from "./ChaReel/ChaReel";
import { FPS, HEIGHT, TOTAL_SECONDS, WIDTH } from "./ChaReel/timeline";
import { Reel } from "./ChaReel/Reel";
import { reelTiming } from "./ChaReel/engine";
import { reels } from "./reels/configs";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";
import { Title } from "./HelloWorld/Title";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Elements">
        <Composition
          id="Logo"
          component={Logo}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            logoColor1: "#91EAE4",
            logoColor2: "#86A8E7",
          }}
        />
        <Composition
          id="Title"
          component={Title}
          durationInFrames={115}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            titleText: "Welcome to Remotion",
            titleColor: "#000000",
          }}
        />
      </Folder>
      <Composition
        // You can take the "id" to render a video:
        // bunx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
        }}
      />
      <Composition
        // Reel 9:16 — "Chá pra Restaurar": controle × influência (três círculos)
        id="ChaPraRestaurar-TresCirculos"
        component={ChaReel}
        durationInFrames={Math.round(TOTAL_SECONDS * FPS)}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {reels.map((config) => (
        <Composition
          key={config.id}
          id={config.id}
          component={Reel}
          durationInFrames={Math.round(reelTiming(config).total * FPS)}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
          defaultProps={{ config }}
        />
      ))}
    </>
  );
};
