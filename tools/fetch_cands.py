import json, subprocess, urllib.parse, sys, os
themes = json.load(open(sys.argv[1]))
out = {}
for key, q in themes.items():
    u = "https://api.openverse.org/v1/images/?" + urllib.parse.urlencode({"q": q, "source": "stocksnap", "page_size": 8, "mature": "false"})
    r = json.loads(subprocess.run(["curl", "-s", "-m", "30", "-A", "reel-editor/1.0", u], capture_output=True, text=True).stdout)
    out[key] = []
    for i, x in enumerate(r.get("results", [])[:8]):
        f = f"/home/user/media/broll/c/{key}_{i}.jpg"
        subprocess.run(["curl", "-s", "-m", "60", "-A", "reel-editor/1.0", "-o", f, f"https://api.openverse.org/v1/images/{x['id']}/thumb/?full_size=true&compressed=false"])
        out[key].append({"file": f, "url": x["url"], "id": x["id"], "title": x["title"], "w": x["width"], "h": x["height"], "license": x["license"], "landing": x.get("foreign_landing_url")})
    print(key, len(out[key]), flush=True)
json.dump(out, open(sys.argv[2], "w"), indent=1)
