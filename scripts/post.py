"""Writes out/<ID>/<ID>-post.txt: YouTube + Instagram title/description/hashtags, from topics/posts.json and the spec's sources."""
import json, re, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
ID, out = sys.argv[1], pathlib.Path(sys.argv[2])
posts = json.load(open(root / "topics/posts.json"))
if ID not in posts:
    sys.exit(f"POST FAILED: no entry for {ID} in topics/posts.json")
p = posts[ID]
spec = json.load(open(root / f"topics/specs/{ID}.json"))
urls = []
for s in spec.get("sources", []):
    for u in re.findall(r"https?://[^\s)\]>,;]+", s if isinstance(s, str) else json.dumps(s)):
        u = u.rstrip(".")
        if u not in urls: urls.append(u)
tags = ["#" + t.lstrip("#") for t in p["tags"]]
yt_tags = ["#shorts"] + tags[:4]          # YouTube shows the first 3 above the title; keep few
ig_tags = tags[:4] + ["#codingculprit"]   # Instagram caps hashtags at 5
src = "\n".join("• " + u for u in urls[:3])
yt_desc = f"{p['summary']}\n\n" + (f"Sources:\n{src}\n\n" if src else "") + f"@CodingCulprit: software engineering concepts in under a minute.\n\n{' '.join(yt_tags)}"
ig_cap = f"{p['title']}\n\n{p['summary']}\n\nFollow @codingculprit for more.\n\n{' '.join(ig_tags)}"
txt = f"""=== YOUTUBE SHORTS ===
TITLE ({len(p['title'])}/100):
{p['title']}

DESCRIPTION:
{yt_desc}

TAGS (paste in 'Tags' field, optional):
{', '.join(t.lstrip('#') for t in p['tags'])}, shorts

=== INSTAGRAM REEL ===
CAPTION:
{ig_cap}

=== CHECK BEFORE POSTING ===
- Facts reviewed against {ID}-script.json sources
- Cover: pick your own frame/thumbnail
"""
assert len(p["title"]) <= 100
out.write_text(txt, encoding="utf-8")
print("POST OK", out)
