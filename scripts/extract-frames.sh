#!/usr/bin/env bash
# Usage: bash scripts/extract-frames.sh <video.mp4> <name> [every-nth-frame=2] [eq-filter]
# Writes public/frames/<name>/NNNN.webp (1920x1080, lightly sharpened) + manifest.json
set -e
IN="${1:?video}"; NAME="${2:?name}"; NTH="${3:-2}"; EQ="${4:-eq=brightness=0.03:contrast=1.06:saturation=1.12}"
OUT="$(dirname "$0")/../public/frames/$NAME"; mkdir -p "$OUT"; rm -f "$OUT"/*.webp "$OUT"/manifest.json
ffmpeg -v error -i "$IN" -vf "select='not(mod(n\,$NTH))',scale=1920:1080:flags=lanczos,unsharp=3:3:0.45:3:3:0.0,$EQ" -vsync vfr -c:v libwebp -quality 82 -compression_level 5 "$OUT/%04d.webp"
N=$(ls "$OUT"/*.webp | wc -l)
echo "{\"count\":$N,\"ext\":\"webp\"}" > "$OUT/manifest.json"; echo "$NAME: $N frames"
