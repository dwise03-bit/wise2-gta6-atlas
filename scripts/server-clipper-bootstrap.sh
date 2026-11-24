#!/usr/bin/env bash
set -euo pipefail
echo "WISE² clipper and Steam readiness"
if ! command -v apt-get >/dev/null; then echo "Ubuntu/Debian required"; exit 1; fi
sudo apt-get update
sudo apt-get install -y ffmpeg jq curl ca-certificates
mkdir -p "$HOME/wise2-clipper"/{inbox,clips,archive,logs}
bash "$(dirname "$0")/clipper.sh" check
bash "$(dirname "$0")/ai-clipper.sh" check
echo "Checking Steam prerequisites:"
uname -m
if [ -z "${DISPLAY:-}" ] && [ -z "${WAYLAND_DISPLAY:-}" ]; then
  echo "No graphical desktop detected. Steam login requires a graphical session; do not enter credentials here."
else
  echo "Graphical session detected. Steam may be installed via Ubuntu's official multiverse repository/package after confirming architecture and GPU drivers."
fi
echo "No Steam credentials collected. No Steam package installed automatically."
echo "Optional local captions require setting WISE2_WHISPER_COMMAND before using ai-clipper.sh process."
