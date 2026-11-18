#!/bin/bash
# ./make_short.sh T03            -> renders topics/specs/T03.json into out/T03/ (MP4 + cover + review sheet)
# Stops at the first failed gate: narration length, scene check, audio level, rendered length.
set -e
ID="$1"; HERE="$(cd "$(dirname "$0")" && pwd)"; LEG="$HERE/topics/legacy/$ID"; SPEC="$HERE/topics/specs/$ID.json"; [ -f "$LEG/script.json" ] && SPEC="$LEG/script.json"; B="$HERE/build/$ID"; OUT="$HERE/out/$ID"
PY="${PYTHON:-python3}"
[ -f "$SPEC" ] || { echo "usage: ./make_short.sh <topic id>   (needs topics/specs/<id>.json)"; exit 2; }
if [ -z "$CHROME" ]; then for c in google-chrome google-chrome-stable chromium chromium-browser; do command -v $c >/dev/null && export CHROME="$(command -v $c)" && break; done; fi
mkdir -p "$HERE/build" "$OUT"; rm -rf "$B"; cp -r "$HERE/engine" "$B"; cp "$SPEC" "$B/script.json"; [ -f "$LEG/shots.js" ] && cp "$LEG/shots.js" "$B/src/shots.js"; mkdir -p "$B/data" "$B/review"
cd "$B"
$PY "$HERE/scripts/voice.py" . | tail -1
$PY "$HERE/scripts/words.py" . | tail -1
MAXN=55.7; [ -f "$LEG/script.json" ] && MAXN=57.6  # legacy videos were already posted at up to ~57 s; the 59 s video gate below still applies
DUR=$($PY -c "import json;print(json.load(open('data/lines.json'))['duration'])")
$PY -c "d=$DUR; print(f'narration {d:.1f} s'); assert d<=$MAXN, f'GATE FAILED: narration {d:.1f} s is too long for a Short (max $MAXN)'"
node tools/capture.mjs check > review/check.txt 2>&1 || true
grep -q "CHECK OK" review/check.txt || { echo "GATE FAILED: scene check"; grep -E "^  S|ERROR" review/check.txt | sort -u | head -20; exit 4; }
node tools/capture.mjs cues | tail -1
$PY tools/mix.py . | tail -1
node tools/capture.mjs sheet review/all.jpg 0.5 10 | tail -1
node tools/capture.mjs video "$OUT/$ID.mp4" 2>&1 | tr '\r' '\n' | tail -1
# cover = a frame inside the catch shot (second to last line) 1.5 s in
CT=$($PY -c "import json;L=json.load(open('data/lines.json'))['lines'];print(round(L[-2]['start']+1.5,2))")
node tools/capture.mjs frames review/cover "$CT" | tail -1; cp review/cover/*.jpg "$OUT/$ID-cover.jpg"; cp review/all.jpg "$OUT/$ID-review-sheet.jpg"; cp script.json "$OUT/$ID-script.json"; python3 "$HERE/scripts/post.py" "$ID" "$OUT/$ID-post.txt"
$PY - <<PY2
import subprocess,re
o="$OUT/$ID.mp4"
d=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',o]).decode())
v=subprocess.run(['ffmpeg','-hide_banner','-i',o,'-af','volumedetect','-vn','-f','null','-'],capture_output=True,text=True).stderr
m=float(re.search(r'mean_volume: (-?[\d.]+)',v).group(1))
print(f"video {d:.1f} s, mean volume {m} dB")
assert d<=59.0, f"GATE FAILED: {d:.1f} s too long"
assert -30<=m<=-10, f"GATE FAILED: mean volume {m} dB"
PY2
echo "DONE $OUT"
