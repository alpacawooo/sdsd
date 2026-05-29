#!/usr/bin/env python3
import json
import math
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


WIDTH = 1080
HEIGHT = 1920


STYLE_BY_KIND = {
    "hook": {"size": 60, "y": 360, "max_width": 880, "weight": "bold"},
    "context": {"size": 50, "y": 890, "max_width": 840, "weight": "regular"},
    "bridge": {"size": 58, "y": 890, "max_width": 840, "weight": "bold"},
    "lyrics": {"size": 54, "y": 1010, "max_width": 820, "weight": "bold"},
    "closing": {"size": 50, "y": 860, "max_width": 840, "weight": "regular"},
}


def find_font(weight="regular"):
    bold_candidates = [
        "/System/Library/Fonts/AppleSDGothicNeo.ttc",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
    ]
    regular_candidates = [
        "/System/Library/Fonts/AppleSDGothicNeo.ttc",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
    ]
    for candidate in bold_candidates if weight == "bold" else regular_candidates:
        if Path(candidate).exists():
            return candidate
    return None


def load_font(size, weight="regular"):
    font_path = find_font(weight)
    if font_path:
        return ImageFont.truetype(font_path, size=size)
    return ImageFont.load_default(size=size)


def wrap_text(draw, text, font, max_width):
    lines = []
    for raw_line in str(text).splitlines():
        words = raw_line.split()
        if not words:
            lines.append("")
            continue
        current = ""
        for word in words:
            candidate = word if not current else f"{current} {word}"
            if draw.textbbox((0, 0), candidate, font=font)[2] <= max_width:
                current = candidate
            else:
                if current:
                    lines.append(current)
                current = word
        if current:
            lines.append(current)
    return lines


def draw_centered_text(draw, lines, font, center_y, fill, shadow=True):
    spacing = math.ceil(font.size * 0.28)
    heights = [
        draw.textbbox((0, 0), line or " ", font=font)[3]
        - draw.textbbox((0, 0), line or " ", font=font)[1]
        for line in lines
    ]
    total_h = sum(heights) + spacing * (len(lines) - 1)
    y = center_y - total_h / 2
    for line, line_h in zip(lines, heights):
        bbox = draw.textbbox((0, 0), line, font=font)
        x = (WIDTH - (bbox[2] - bbox[0])) / 2
        if shadow:
            for dx, dy in [(-2, 2), (2, 2), (0, 3)]:
                draw.text((x + dx, y + dy), line, font=font, fill=(0, 0, 0, 190))
        draw.text((x, y), line, font=font, fill=fill)
        y += line_h + spacing


def render_text_overlay(path, text, kind):
    style = STYLE_BY_KIND.get(kind, STYLE_BY_KIND["context"])
    image = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    font = load_font(style["size"], style["weight"])
    lines = wrap_text(draw, text, font, style["max_width"])

    # A soft center band keeps text readable over music-video footage.
    line_count = max(1, len(lines))
    band_h = min(520, max(210, int(style["size"] * line_count * 1.55)))
    band_y = int(style["y"] - band_h / 2)
    draw.rounded_rectangle(
        [70, band_y, WIDTH - 70, band_y + band_h],
        radius=28,
        fill=(0, 0, 0, 168),
    )
    draw_centered_text(draw, lines, font, style["y"], (255, 255, 255, 255))
    image.save(path)


def render_meta_overlay(path, title, artist, credit):
    image = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    title_font = load_font(52, "bold")
    artist_font = load_font(38, "regular")
    credit_font = load_font(32, "regular")

    y = 82
    if title:
        draw.text((58, y), title, font=title_font, fill=(255, 255, 255, 245))
        y += 58
    if artist:
        draw.text((58, y), artist, font=artist_font, fill=(235, 235, 235, 230))
    if credit:
        bbox = draw.textbbox((0, 0), credit, font=credit_font)
        draw.text(
            ((WIDTH - (bbox[2] - bbox[0])) / 2, HEIGHT - 108),
            credit,
            font=credit_font,
            fill=(220, 220, 220, 210),
        )
    image.save(path)


def render_overlays(config, temp_dir):
    overlays = []
    meta_path = temp_dir / "overlay_meta.png"
    render_meta_overlay(
        meta_path,
        config.get("title", ""),
        config.get("artist", ""),
        config.get("credit", ""),
    )
    overlays.append({"path": meta_path, "start": 0, "end": float(config["duration"])})

    for index, section in enumerate(config["sections"], start=1):
        overlay_path = temp_dir / f"overlay_{index:02d}.png"
        render_text_overlay(overlay_path, section["text"], section.get("kind", "context"))
        overlays.append(
            {
                "path": overlay_path,
                "start": float(section["start"]),
                "end": float(section["end"]),
            }
        )
    return overlays


def ffmpeg_between(start, end):
    return f"between(t\\,{start:.3f}\\,{end:.3f})"


def run_ffmpeg(config_path):
    config = json.loads(config_path.read_text(encoding="utf-8"))
    input_path = Path(config["input"]).expanduser()
    output_path = Path(config["output"]).expanduser()
    if not output_path.is_absolute():
        output_path = config_path.parent / output_path

    output_path.parent.mkdir(parents=True, exist_ok=True)
    if not input_path.exists():
        raise FileNotFoundError(f"Input not found: {input_path}")
    if shutil.which("ffmpeg") is None:
        raise RuntimeError("ffmpeg was not found in PATH.")

    with tempfile.TemporaryDirectory(prefix="reel_overlays_") as temp:
        temp_dir = Path(temp)
        overlays = render_overlays(config, temp_dir)

        cmd = [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-ss",
            str(config.get("start", 0)),
            "-i",
            str(input_path),
        ]
        for overlay in overlays:
            cmd.extend(["-loop", "1", "-i", str(overlay["path"])])

        filters = [
            "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,"
            "crop=1080:1920,"
            "eq=brightness=-0.04:contrast=1.05:saturation=0.92[base]"
        ]
        previous = "base"
        for index, overlay in enumerate(overlays, start=1):
            out = f"v{index}"
            filters.append(
                f"[{previous}][{index}:v]overlay=0:0:enable='{ffmpeg_between(overlay['start'], overlay['end'])}'[{out}]"
            )
            previous = out

        cmd.extend(
            [
                "-filter_complex",
                ";".join(filters),
                "-map",
                f"[{previous}]",
                "-map",
                "0:a?",
                "-t",
                str(config["duration"]),
                "-c:v",
                "libx264",
                "-preset",
                "medium",
                "-crf",
                "18",
                "-c:a",
                "aac",
                "-b:a",
                "192k",
                "-movflags",
                "+faststart",
                str(output_path),
            ]
        )

        subprocess.run(cmd, check=True)
    return output_path


def main():
    if len(sys.argv) != 2:
        print("Usage: python3 make_reel.py path/to/config.json", file=sys.stderr)
        return 2

    config_path = Path(sys.argv[1]).expanduser()
    if not config_path.is_absolute():
        config_path = Path.cwd() / config_path

    output_path = run_ffmpeg(config_path)
    print(f"Rendered: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
