import json,subprocess,sys
S=sys.argv[1]; W=f"{S}/work"
cap=json.load(open("/home/user/my-video/src/captions.json"))
segs=cap["segments"]; total=cap["total"]; card=total-0.45; dur=card+8.875
cues=[segs[i]["start"] for i in (1,10,11,12,13,15,17,18)]+[card]
inputs=["-i",f"{W}/cut.mov","-i",f"{W}/music.wav"]+sum((["-i",f"{W}/whoosh.wav"] for _ in cues),[])
fc=[f"[0:a]aresample=44100,pan=stereo|c0=c0|c1=c0,loudnorm=I=-16:TP=-1.5:LRA=9,apad=whole_dur={dur}[v]",
    # music sits at about -33 LUFS under the voice and rises gently (+6 dB) only on the end card
    f"[1:a]atrim=0:{dur},volume=-20.3dB,volume='if(gte(t,{card}),1+min((t-{card})/1.2,1)*1.0,1)':eval=frame[m]"]
for k,c in enumerate(cues):
    d=int(max(0,c-0.4)*1000)
    fc.append(f"[{k+2}:a]volume=0.028,adelay={d}|{d}[w{k}]")
fc.append("[v][m]"+"".join(f"[w{k}]" for k in range(len(cues)))+f"amix=inputs={2+len(cues)}:normalize=0:duration=first,atrim=0:{dur},afade=t=out:st={dur-1.5}:d=1.5[out]")
subprocess.run(["ffmpeg","-v","error","-y",*inputs,"-filter_complex",";".join(fc),"-map","[out]","-ar","48000","-c:a","pcm_s16le",f"{W}/mix.wav"],check=True)
print("cues",[round(c,2) for c in cues],"dur",dur)
