# Final mix: python3 -I mix.py <cut.mov> <captions.json> <music.wav> <whoosh.wav> <cue segs> <out.wav>
# Voice -16 LUFS, music -33 LUFS (+6 dB on the silent end card), soft whooshes on layout changes.
import json, re, subprocess, sys

cut, caps, music, whoosh, cue_segs, out = sys.argv[1:7]
cap = json.load(open(caps))
segs = cap["segments"]
total = cap["total"]
card = total - 0.45
dur = card + 8.875
cues = [segs[int(i)]["start"] for i in cue_segs.split(",")] + [card]

# static gain so the music sits at -33 LUFS integrated
meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", music, "-af", "ebur128", "-f", "null", "-"],
                      capture_output=True, text=True).stderr
music_i = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", meas)[-1])
gain = -33 - music_i

inputs = ["-i", cut, "-i", music] + sum((["-i", whoosh] for _ in cues), [])
fc = [f"[0:a]aresample=44100,pan=stereo|c0=c0|c1=c0,loudnorm=I=-16:TP=-1.5:LRA=9,apad=whole_dur={dur}[v]",
      f"[1:a]atrim=0:{dur},volume={gain:.2f}dB,"
      f"volume='if(gte(t,{card}),1+min((t-{card})/1.2,1)*1.0,1)':eval=frame[m]"]
for k, c in enumerate(cues):
    d = int(max(0, c - 0.4) * 1000)
    fc.append(f"[{k + 2}:a]volume=0.028,adelay={d}|{d}[w{k}]")
fc.append("[v][m]" + "".join(f"[w{k}]" for k in range(len(cues)))
          + f"amix=inputs={2 + len(cues)}:normalize=0:duration=first,atrim=0:{dur},"
          f"afade=t=out:st={dur - 1.5}:d=1.5[out]")
subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(fc),
                "-map", "[out]", "-ar", "48000", "-c:a", "pcm_s16le", out], check=True)
print("cues", [round(c, 2) for c in cues], "dur", round(dur, 2))
