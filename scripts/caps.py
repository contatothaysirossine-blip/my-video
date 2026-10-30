# Remap word timestamps onto the edited timeline:
# python3 -I caps.py <transcript.json> <edl.json> <captions.json>
import json, sys

t = json.load(open(sys.argv[1]))
edl = json.load(open(sys.argv[2]))
ws = [w for s in t for w in s["words"]]
fixes = {round(at, 2): text for at, text in edl["fixes"]}
out, segs, off = [], [], 0
for i, (a, b) in enumerate(edl["cuts"]):
    segs.append({"start": round(off, 3), "end": round(off + b - a, 3)})
    for w in ws:
        if a <= (w["s"] + w["e"]) / 2 <= b:
            out.append({"text": fixes.get(round(w["s"], 2), w["w"].strip()),
                        "start": round(max(w["s"], a) - a + off, 3),
                        "end": round(min(w["e"], b) - a + off, 3), "seg": i})
    off += b - a
# A cut that opens a new sentence starts with a capital letter.
for i in range(len(segs)):
    seg_words = [w for w in out if w["seg"] == i]
    prev = [w for w in out if w["seg"] == i - 1]
    if seg_words and (not prev or prev[-1]["text"][-1:] in ".?!"):
        w = seg_words[0]
        w["text"] = w["text"][0].upper() + w["text"][1:]
json.dump({"words": out, "segments": segs, "total": round(off, 3)}, open(sys.argv[3], "w"),
          ensure_ascii=False, indent=0)
for i in range(len(segs)):
    print(i, segs[i]["start"], " ".join(w["text"] for w in out if w["seg"] == i))
print("total", round(off, 2))
