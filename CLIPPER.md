# WISE² GTA Draft Clipper

This workflow creates vertical review drafts from local footage that you are authorized to use. It does not scrape streams, download media, sign into social accounts, or publish clips.

## Install on the WISE² server

```bash
git pull
bash scripts/server-clipper-bootstrap.sh
```

## Make review drafts

```bash
bash scripts/ai-clipper.sh process /absolute/path/to/authorized-gameplay.mp4
```

Drafts are stored in `~/wise2-clipper/review/`. Each `*_review.mp4` has a matching JSON manifest marked `needs_review`, with automatic publishing explicitly disabled.

## Optional local captions

Provide a Whisper-compatible local CLI. The source video remains on the server.

```bash
export WISE2_WHISPER_COMMAND=whisper
bash scripts/ai-clipper.sh process /absolute/path/to/authorized-gameplay.mp4
```

Watch each draft, confirm creator rights and caption accuracy, then upload manually to the chosen platform.
