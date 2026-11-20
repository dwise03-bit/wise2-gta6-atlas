#!/usr/bin/env bash
set -euo pipefail
# WISE² GTA VI Clipper — safe local media pipeline (no scraping or auto-posting)
ROOT="${WISE2_CLIPPER_ROOT:-$HOME/wise2-clipper}"
mkdir -p "$ROOT"/{inbox,clips,archive,logs}
command -v ffmpeg >/dev/null || { echo "Install ffmpeg first: sudo apt-get install ffmpeg"; exit 1; }
if [ "${1:-}" = "check" ]; then
  ffmpeg -version | head -1
  echo "Ready: $ROOT/inbox (input), $ROOT/clips (output)"
  exit 0
fi
if [ "${1:-}" != "clip" ] || [ "$#" -lt 4 ]; then
  echo "Usage: bash scripts/clipper.sh check | clip /path/to/authorized-video.mp4 START_SECONDS DURATION_SECONDS"
  exit 2
fi
SOURCE="$2"; START="$3"; DURATION="$4"
[ -f "$SOURCE" ] || { echo "Input not found"; exit 1; }
[[ "$START" =~ ^[0-9]+([.][0-9]+)?$ && "$DURATION" =~ ^[0-9]+([.][0-9]+)?$ ]] || { echo "Start and duration must be positive numbers"; exit 2; }
OUT="$ROOT/clips/$(basename "${SOURCE%.*}")-$(date +%Y%m%d-%H%M%S).mp4"
ffmpeg -hide_banner -nostdin -y -ss "$START" -i "$SOURCE" -t "$DURATION" -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -preset veryfast -crf 23 -c:a aac -b:a 128k "$OUT"
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1 "$OUT"
echo "Clip created: $OUT"
