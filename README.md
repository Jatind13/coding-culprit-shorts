# coding-culprit-shorts

Pipeline for the @CodingCulprit YouTube Shorts: a topic spec (JSON) becomes a narrated, captioned Blueprint-style short.
Everything is code: Kokoro voice (local), faster-whisper word timing, canvas scenes captured by headless Chrome, ffmpeg.

## Make a video (you review it, nothing is published)
1. GitHub, Actions tab, **Make a short**, **Run workflow**, type a topic id such as `T03`.
2. When it finishes, open the run and download the artifact: `T03.mp4`, the cover, the review sheet and the script.
3. Watch it, check the facts against the sources in `T03-script.json`, then publish by hand.

Locally: `pip install -r requirements.txt`, `python scripts/voice.py --download`, then `./make_short.sh T03` (needs Node 22, ffmpeg, Chrome).

## Layout
- `topics/backlog.json`: the topic bank (also kept as a spreadsheet). `topics/specs/<id>.json`: script + scenes for one topic.
- `engine/`: Blueprint renderer. Scenes are JSON, validated before rendering (stage bounds, overlaps, idle gaps).
- `scripts/`: voice, word timing. `make_short.sh`: the whole pipeline with gates.

## Gates (a video that fails any of these is not produced)
narration <= 55.7 s, scene validation passes, mean volume -30..-10 dB, rendered length <= 59 s.

## Rules
Every claim needs a source in the spec's `sources`. Invented example numbers are labelled on screen. No "next video" teaser at the end.
