# Reel "Chá pra Restaurar": Controle × Influência (três círculos)

Pipeline used to produce the 9:16 reel `ChaPraRestaurar-TresCirculos`.
`$S` is a scratch folder holding `dl/podcast.mp4` and `dl/card.mov` (from Drive).

1. `python3 -I transcribe.py $S/dl/audio.wav $S/transcript.json`: faster-whisper (pt), word timestamps
2. `edl.json`: the 19 cuts chosen (source seconds); `python3 -I cut.py $S` → `work/cut.mov`
3. `python3 -I caps.py $S src/captions.json`: words remapped to the edited timeline
4. `python3 -I face.py $S/work/cut.mov src/face.json`: smoothed face track for auto-reframe
5. Copy `cut.mov` (video only, h264) and `card.mov` (h264) to `public/cut.mp4` and `public/card.mp4`
6. `npx remotion render ChaPraRestaurar-TresCirculos out/silent.mp4 --muted`
7. `music.py` / `whoosh.py`: synthesised ambient piano and soft whoosh (royalty-free)
8. `python3 -I mix.py $S`: voice −16 LUFS, music −33 LUFS (+6 dB on the end card), whooshes at layout changes
9. Mux: `ffmpeg -i silent.mp4 -i mix.wav -c:v copy -c:a aac -b:a 192k -shortest final.mp4`
