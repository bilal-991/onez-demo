#!/usr/bin/env bash
# Usage: bash scripts/make-scrub-video.sh <in.mp4> <name> [eq-filter]
# Makes an ALL-KEYFRAME h264 mp4 (every frame seekable instantly) + a poster jpg in public/video/
set -e
IN="${1:?video}"; NAME="${2:?name}"; EQ="${3:-eq=brightness=0.03:contrast=1.06:saturation=1.12}"
OUT="$(dirname "$0")/../public/video"; mkdir -p "$OUT"
ffmpeg -v error -y -i "$IN" -vf "scale=1920:1080:flags=lanczos,unsharp=3:3:0.45:3:3:0.0,$EQ" \
  -c:v libx264 -g 1 -crf 24 -preset slow -pix_fmt yuv420p -movflags +faststart -an "$OUT/$NAME.mp4"
ffmpeg -v error -y -i "$OUT/$NAME.mp4" -frames:v 1 -q:v 3 "$OUT/$NAME.jpg"
ls -la "$OUT/$NAME.mp4"
