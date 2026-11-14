# WISE² GTA VI Atlas — Gameplay Hub

The existing static Atlas now includes `/gameplay/` and individual `/gameplay/videos/<id>/` pages. Deploy the repository root as static files; directory index routing is required. Node 22+ is only needed to edit, test, and research content.

## Development

Run `npm ci`, `npm run build`, `npm run check`, `npm test`, and `npm run test:e2e` (install Playwright Chromium first with `npx playwright install chromium`). `npm run serve` previews at http://127.0.0.1:4173. Generated HTML is committed for static hosting; update `data/gameplay.json`, run the build and commit both. Content validation rejects unknown sources, unsafe links, unsupported official evidence, invalid timestamps and speculative coordinates.

## Editorial process

The reviewed snapshot and its review date are explicit in `data/gameplay.json`. Publication dates, source links, labels, and source check dates are separate. Check original sources, distinguish footage from demonstrated mechanics, and describe only what the evidence supports. For corrections, append an entry to `corrections` with date, record ID, before, after, reason, and source IDs. Rebuild and review the resulting pages. The initial scene index contains only a zero-time source-level bookmark; detailed scene observations still require verification. Categories without reviewed mechanics intentionally say Awaiting verification.

The map is a region index connected to the original Explorer, not an official geographic map. No coordinates are published. Coordinate records require an official source and normalized official map system; actual map rendering needs an appropriately licensed map and an implementation for it. Mission, activity, vehicle, and discovery marker types are available as empty filters pending evidence.

## Research workflow

`.github/workflows/gameplay-research.yml` checks configured sources daily at 12:23 UTC and can run manually. It stores deduplicated metadata, original publication dates where provided, hashes and before/after history in `research/`. A draft PR proposes candidates; nothing enters the public feed until an editor reviews and updates `data/gameplay.json`. Missing dates stay null, changed sources return to pending, and failures appear in the run artifact and fail the job. The Rockstar VI page, official YouTube feed and PC Gamer RSS returned data on November 14, 2026. The configured Rockstar Newswire RSS endpoint returned 404; the official VI page includes selected Newswire links, but this is incomplete coverage. Replace the unavailable endpoint only after verifying an authorized feed or supported integration. The workflow requires GitHub Actions permission to write contents and create pull requests; repository settings may need adjustment. Scheduled workflows run only on the default branch after merge. The research branch retains pending baseline state; maintainers should merge its metadata PR before independently editing that branch.

## Licensing and unfinished integrations

Official YouTube embeds load only on user action and include source links and fallback links. The launch trailer uses Rockstar's official player link. No Rockstar footage is downloaded or rehosted. Existing Atlas imagery was inherited from the repository and credited there; its reuse permission should be reviewed by the site owner. The submission form is a client-only prototype: no transmission, storage or moderation queue exists. A real service needs secure persistence, spam protection, privacy policy, a private moderation interface and editorial publication controls. Release dates may change; verify against Rockstar. Community evidence, patch history, walkthroughs, comparisons and trackers remain future editorial/backend work, not fabricated launch content.

The Gameplay Hub hero uses a muted 15-second, 1280px excerpt of real-world Miami footage by Advancer Drones via Pexels: https://www.pexels.com/video/miami-beach-19109601/ (Pexels License: https://www.pexels.com/license/). It is not GTA VI footage. The video is compressed, has no audio, and falls back to the existing still for reduced motion or unavailable playback.
