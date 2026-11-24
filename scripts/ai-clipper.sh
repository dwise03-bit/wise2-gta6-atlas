#!/usr/bin/env bash
set -euo pipefail

# WISE² GTA VI draft clipper. Processes local footage only and never publishes.
ROOT="${WISE2_CLIPPER_ROOT:-$HOME/wise2-clipper}"
REVIEW="$ROOT/review"
LOGS="$ROOT/logs"
MAX_CLIPS="${WISE2_CLIPPER_MAX_CLIPS:-6}"
MIN_SECONDS="${WISE2_CLIPPER_MIN_SECONDS:-12}"
MAX_SECONDS="${WISE2_CLIPPER_MAX_SECONDS:-58}"

usage() {
  printf '%s\n' "Usage: bash scripts/ai-clipper.sh check | process /absolute/path/to/authorized-video.mp4"
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || { printf 'Missing required command: %s\n' "$1" >&2; exit 1; }
}

safe_name() {
  basename "${1%.*}" | tr -cs '[:alnum:]_.-' '_'
}

write_manifest() {
  jq -n --arg source "$1" --arg output "$2" --arg transcript "$3" \
    --arg created_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" --argjson start "$4" --argjson duration "$5" \
    '{status:"needs_review",source:$source,output:$output,transcript:$transcript,start_seconds:$start,duration_seconds:$duration,created_at:$created_at,publish:{automatic:false,approved:false}}' > "$6"
}

transcribe() {
  local input="$1" output_dir="$2"
  [ -n "${WISE2_WHISPER_COMMAND:-}" ] || return 1
  mkdir -p "$output_dir"
  "${WISE2_WHISPER_COMMAND}" "$input" --output_dir "$output_dir" --output_format srt
}

main() {
  mkdir -p "$REVIEW" "$LOGS"
  require_command ffmpeg
  require_command ffprobe
  require_command jq
  case "${1:-}" in
    check)
      ffmpeg -version | head -1
      jq --version
      command -v scenedetect >/dev/null 2>&1 && printf 'Scene detection: PySceneDetect available\n' || printf 'Scene detection: fixed-window fallback\n'
      [ -n "${WISE2_WHISPER_COMMAND:-}" ] && printf 'Transcription: configured\n' || printf 'Transcription: disabled until WISE2_WHISPER_COMMAND is set\n'
      printf 'Review queue: %s\n' "$REVIEW"
      ;;
    process)
      [ "$#" -eq 2 ] || { usage; exit 2; }
      local source="$2"
      [ -f "$source" ] && [[ "$source" = /* ]] || { printf 'Use an existing absolute local source path.\n' >&2; exit 2; }
      local total stamp name job starts
      total="$(ffprobe -v error -show_entries format=duration -of default=nokey=1:noprint_wrappers=1 "$source")"
      awk -v total="$total" 'BEGIN { exit !(total > 0) }' || { printf 'Could not read source duration.\n' >&2; exit 1; }
      stamp="$(date -u +%Y%m%dT%H%M%SZ)"; name="$(safe_name "$source")"; job="$REVIEW/${name}_${stamp}"; starts="$job/starts.txt"
      mkdir -p "$job"
      if command -v scenedetect >/dev/null 2>&1; then
        mkdir -p "$job/scenes"
        scenedetect -i "$source" detect-content list-scenes -o "$job/scenes" > "$LOGS/${name}_${stamp}_scenes.log" 2>&1 || true
        find "$job/scenes" -type f -name '*.csv' -print0 | xargs -0 -r awk -F, 'NR > 2 && $1 ~ /^[0-9]+$/ { print $4 }' > "$starts" || true
      fi
      if [ ! -s "$starts" ]; then
        awk -v total="$total" -v max="$MAX_CLIPS" -v min="$MIN_SECONDS" 'BEGIN { for (s=0,n=0;s<total-min && n<max;s+=min*2,n++) print s }' > "$starts"
      fi
      local count=0 start length raw final transcript manifest subtitle
      while IFS= read -r start; do
        length="$MAX_SECONDS"
        awk -v start="$start" -v total="$total" -v length="$length" 'BEGIN { if (start+length>total) print total-start; else print length }' > "$job/.length"
        length="$(<"$job/.length")"
        raw="$job/$(printf '%02d' "$((count+1))")_raw.mp4"; final="$job/$(printf '%02d' "$((count+1))")_review.mp4"; transcript="$job/$(printf '%02d' "$((count+1))").srt"; manifest="$job/$(printf '%02d' "$((count+1))").json"
        ffmpeg -hide_banner -nostdin -y -ss "$start" -i "$source" -t "$length" -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih):color=0x101019" -c:v libx264 -preset veryfast -crf 22 -c:a aac -b:a 160k "$raw" > "$LOGS/${name}_${stamp}_$count.log" 2>&1
        subtitle=""
        if transcribe "$raw" "$job/transcripts"; then subtitle="$(find "$job/transcripts" -maxdepth 1 -name '*.srt' -print -quit || true)"; [ -n "$subtitle" ] && cp "$subtitle" "$transcript"; fi
        if [ -n "$subtitle" ]; then ffmpeg -hide_banner -nostdin -y -i "$raw" -vf "subtitles='$subtitle':force_style='FontName=DejaVu Sans,FontSize=18,PrimaryColour=&H00FFFFFF,OutlineColour=&H00101010,BorderStyle=1,Outline=3,Shadow=1,Alignment=2,MarginV=84'" -c:v libx264 -preset veryfast -crf 22 -c:a copy "$final" > "$LOGS/${name}_${stamp}_${count}_captioned.log" 2>&1; else mv "$raw" "$final"; fi
        write_manifest "$source" "$final" "$transcript" "$start" "$length" "$manifest"
        count=$((count+1))
      done < "$starts"
      rm -f "$job/.length"
      printf 'Created %s approval-ready drafts in %s\n' "$count" "$job"
      printf '%s\n' 'No clips were published.'
      ;;
    *) usage; exit 2 ;;
  esac
}
main "$@"
