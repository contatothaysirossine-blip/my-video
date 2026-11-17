"""Turn picked time ranges of raw.mp4 into jump-cut segments + timed captions."""
import json, sys
words = [w for s in json.load(open(sys.argv[1])) for w in s["words"]]
picks = json.load(open(sys.argv[2]))
PAD_IN, PAD_OUT, MAX_GAP = 0.10, 0.18, 0.45
out = []
for p in picks:
    segs, caps, t = [], [], 0.0
    for a, b in p["ranges"]:
        ws = [w for w in words if w["s"] >= a - 0.05 and w["e"] <= b + 0.05]
        # split into runs separated by pauses (silence removal = jump cuts)
        runs, cur = [], [ws[0]]
        for w in ws[1:]:
            if w["s"] - cur[-1]["e"] > MAX_GAP: runs.append(cur); cur = [w]
            else: cur.append(w)
        runs.append(cur)
        for r in runs:
            s0 = max(r[0]["s"] - PAD_IN, a - 0.1); s1 = r[-1]["e"] + PAD_OUT
            s0 = round(s0 * 30) / 30; s1 = round(s1 * 30) / 30
            segs.append({"start": round(s0, 3), "end": round(s1, 3)})
            for w in r:
                caps.append({"text": w["w"].strip(), "start": round(t + w["s"] - s0, 3), "end": round(t + w["e"] - s0, 3)})
            t += s1 - s0
    out.append({k: v for k, v in p.items() if k != "ranges"} | {"segments": segs, "words": caps})
    print(p["id"], f"{t:.1f}s", len(segs), "cuts")
FIX={"agora":"Agora","transparentecer":"transparecer","Flá,":"Flávia,"}
for r in out:
    if r["words"][0]["text"] in FIX: r["words"][0]["text"]=FIX[r["words"][0]["text"]]
    for w in r["words"][1:]: w["text"]=FIX.get(w["text"],w["text"]) if w["text"]!="agora" else w["text"]
json.dump(out, open(sys.argv[3], "w"), ensure_ascii=False, indent=1)
