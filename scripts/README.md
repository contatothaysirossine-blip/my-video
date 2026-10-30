# Reels "Chá pra Restaurar"

Pipeline used to cut the episode into 9:16 reels. `$S` is a scratch folder
holding `dl/podcast.mp4` and `dl/card.mov` (from Drive); `N` is the reel number.

| N | Composition | Theme |
|---|---|---|
| 1 | `ChaPraRestaurar-TresCirculos` | the three circles of control and influence |
| 2 | `ChaPraRestaurar-Posicionamento` | posicionamento não é ultimato |
| 3 | `ChaPraRestaurar-BaterFraco` | "isso me machuca muito", bater fraco |
| 4 | `ChaPraRestaurar-OQueOOutroPensa` | você não sabe o que o outro pensa |
| 5 | `ChaPraRestaurar-ExercicioGuiado` | exercício guiado com a xícara de chá |

1. `python3 -I transcribe.py $S/dl/audio.wav $S/transcript.json`: faster-whisper (pt), word timestamps
2. `edl/reelN.json`: the chosen cuts (source seconds) plus transcription fixes
3. `python3 -I cut.py $S/dl/podcast.mp4 edl/reelN.json $S/work/cutN.mov`
4. `python3 -I caps.py $S/transcript.json edl/reelN.json src/reels/reelN/captions.json`
5. `python3 -I face.py $S/work/cutN.mov src/reels/reelN/face.json`: smoothed face track for auto-reframe
6. Video only, h264: `public/reelN/cut.mp4` (reel 1 lives at `public/cut.mp4` and `src/*.json`);
   the end card is `public/card.mp4`
7. `npx remotion render <Composition> silent.mp4 --muted`
8. `python3 -I music.py musicN.wav 80 N` and `whoosh.py`: synthesised ambient piano and soft whoosh
9. `python3 -I mix.py cutN.mov captions.json musicN.wav whoosh.wav <scene segs> mixN.wav`:
   voice −16 LUFS, music −33 LUFS (+6 dB on the end card), whooshes at layout changes
10. `ffmpeg -i silent.mp4 -i mixN.wav -map 0:v -map 1:a -c:v libx264 -crf 19 -c:a aac -b:a 192k -shortest final.mp4`

Scenes and panel graphics for reels 2–5 are declared in `src/reels/configs.ts`.
