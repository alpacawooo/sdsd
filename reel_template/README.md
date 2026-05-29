# Korean Song Context Reel Template

This is a repeatable ffmpeg-based template for vertical music curation reels.

Format:

1. Hook
2. Context
3. Meaning bridge / translation
4. Song moment
5. Closing line

## Quick Start

Edit `sample_config.json`, then run:

```bash
/Users/woojinyoung/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 make_reel.py sample_config.json
```

The rendered MP4 will be written to the `output` path in the config.

## Config Fields

- `input`: Source MP4 path.
- `output`: Rendered MP4 path.
- `start`: Start time in seconds from the source video.
- `duration`: Output duration in seconds.
- `title`: Small top-left song title.
- `artist`: Small top-left artist name.
- `credit`: Optional source/curator credit at the bottom.
- `sections`: Timed text blocks.

Each section supports:

- `start`: Start time in the output timeline.
- `end`: End time in the output timeline.
- `kind`: `hook`, `context`, `bridge`, `lyrics`, or `closing`.
- `text`: Main text.

## Notes

- Output is fixed to `1080x1920`, ready for Instagram Reels and YouTube Shorts.
- The script crops the input into a centered 9:16 frame.
- Text is rendered as ASS subtitles, so Korean and English can be mixed.
- Text is rendered as transparent PNG overlays, so it works even when ffmpeg was built without subtitle filters.
- Use short lines. For English, 7-10 words per line usually feels best.
