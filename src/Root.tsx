import { Composition, Folder } from "remotion";
import { Edit, editSchema } from "./edit/Edit";
import { FPS, totalDuration } from "./edit/timeline";
import { VideoId, VIDEOS } from "./edit/videos";

const EDITS: { id: string; video: VideoId }[] = [
  // npx remotion render Thiara out/thiara.mp4
  { id: "Thiara", video: "img7284" },
  // npx remotion render Thiara-DorLombar out/thiara-dor-lombar.mp4
  { id: "Thiara-DorLombar", video: "b2aef149" },
];

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="Thiara">
      {EDITS.map(({ id, video }) => (
        <Composition
          key={id}
          id={id}
          component={Edit}
          schema={editSchema}
          durationInFrames={Math.round(totalDuration(VIDEOS[video]) * FPS)}
          fps={FPS}
          width={1080}
          height={1920}
          defaultProps={{ video, instagram: "", music: "", musicVolume: 0.12 }}
        />
      ))}
    </Folder>
  );
};
