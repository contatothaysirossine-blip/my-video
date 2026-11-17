import { Composition, Folder } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { Reel, reelDurationInFrames } from "./Reel/Reel";
import { FPS } from "./Reel/brand";
import type { ReelData } from "./Reel/types";
import reels from "./reels.json";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Reels">
        {(reels as ReelData[]).map((data) => (
          <Composition
            key={data.id}
            id={data.id}
            component={Reel}
            durationInFrames={reelDurationInFrames(data)}
            fps={FPS}
            width={1080}
            height={1920}
            defaultProps={{ data }}
          />
        ))}
      </Folder>
      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
        }}
      />
    </>
  );
};
