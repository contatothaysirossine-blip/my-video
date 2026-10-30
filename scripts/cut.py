import json,subprocess,sys
S=sys.argv[1]; edl=json.load(open(f"{S}/edl.json")); src=f"{S}/dl/podcast.mp4"
parts=[];f=0.035
for i,(a,b) in enumerate(edl):
    d=b-a
    parts.append(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS,fps=30[v{i}];[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d={f},afade=t=out:st={d-f}:d={f}[a{i}]")
n=len(edl)
fc=";".join(parts)+";"+"".join(f"[v{i}][a{i}]" for i in range(n))+f"concat=n={n}:v=1:a=1[v][a]"
subprocess.run(["ffmpeg","-v","error","-y","-i",src,"-filter_complex",fc,"-map","[v]","-map","[a]","-c:v","libx264","-crf","14","-preset","medium","-g","15","-c:a","pcm_s16le",f"{S}/work/cut.mov"],check=True)
