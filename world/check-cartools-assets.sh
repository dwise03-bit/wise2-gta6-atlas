#!/usr/bin/env bash
set -euo pipefail
exec 9>/home/dwise/wise2-asset-inbox/cartools/import.lock
flock -n 9 || exit 0
python3 /home/dwise/apps/wise2-gta6-atlas-work/world/import-cartools-assets.py >> /home/dwise/apps/wise2-gta6-atlas-work/world/logs/assets-import.log 2>&1
