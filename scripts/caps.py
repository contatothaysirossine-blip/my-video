import json,sys
S=sys.argv[1]; t=json.load(open(f"{S}/transcript.json")); edl=json.load(open(f"{S}/edl.json"))
ws=[w for s in t for w in s["words"]]
out=[];segs=[];off=0
for i,(a,b) in enumerate(edl):
    segs.append({"start":round(off,3),"end":round(off+b-a,3)})
    for w in ws:
        mid=(w["s"]+w["e"])/2
        if a<=mid<=b:
            out.append({"text":w["w"].strip(),"start":round(max(w["s"],a)-a+off,3),"end":round(min(w["e"],b)-a+off,3),"seg":i})
    off+=b-a
# Sentence-start capitalisation for cuts that begin mid-sentence
for i in range(len(edl)):
    first=next(w for w in out if w["seg"]==i)
    if i in (11,15): first["text"]=first["text"][0].upper()+first["text"][1:]
json.dump({"words":out,"segments":segs,"total":round(off,3)},open(sys.argv[2],"w"),ensure_ascii=False,indent=0)
print(" ".join(w["text"] for w in out)); print(off)
