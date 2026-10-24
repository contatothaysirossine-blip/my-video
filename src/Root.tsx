import { Composition } from "remotion";
import { Edit, editSchema } from "./edit/Edit";
import { FPS, TOTAL_DURATION } from "./edit/timeline";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      // npx remotion render Thiara out/thiara.mp4
      id="Thiara"
      component={Edit}
      schema={editSchema}
      durationInFrames={Math.round(TOTAL_DURATION * FPS)}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{ instagram: "", music: "", musicVolume: 0.12 }}
    />
  );
};
