# Jump-cut a reel from the long episode: python3 -I cut.py <podcast.mp4> <edl.json> <out.mov>
import json, subprocess, sys

src, edl_path, out = sys.argv[1:4]
edl = json.load(open(edl_path))["cuts"]
parts = []
f = 0.035  # micro-fades so jump cuts never click
for i, (a, b) in enumerate(edl):
    d = b - a
    parts.append(
        f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS,fps=30[v{i}];"
        f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d={f},afade=t=out:st={d - f}:d={f}[a{i}]"
    )
n = len(edl)
fc = ";".join(parts) + ";" + "".join(f"[v{i}][a{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=1[v][a]"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-filter_complex", fc,
                "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "14", "-preset", "medium",
                "-g", "15", "-c:a", "pcm_s16le", out], check=True)
