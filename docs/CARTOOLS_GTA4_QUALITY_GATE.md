# CARTOOLS — GTA IV-class atmosphere, original WISE² assets

## Status and scope
This is an implementation branch and acceptance contract, **not a deployed graphics upgrade**. Preserve the working Android TV APK and never overwrite the live build without a verified rollback. The server working copy contains uncommitted changes not necessarily represented by this GitHub branch.

## First playable vertical slice
Build one original Queensbridge-inspired city block with four traversable intersections, distinct weathered facades, sidewalk props, storefronts, a driveable original blue muscle car, and three original rigged Trade Gang characters. Do not copy Rockstar geometry, textures, maps, characters, branding, audio, or missions.

## Quality gates
1. Baseline: record current APK SHA-256, screenshot, package version, frame times and WebGL capabilities on ONN 4K Pro.
2. Source audit: inspect server-only modifications and reconcile them before cherry-picking any changes.
3. Geometry: replace repeated box facades with reusable modular building kits; use texture atlases, LOD, frustum culling, and instancing for repetitive props.
4. Characters: glTF 2.0 skinned meshes with idle/walk/run/turn clips, blended by velocity. Respect approved references; no unapproved likeness substitutions.
5. Vehicle: physically plausible acceleration, braking, steering and follow camera; add wheel rotation and suspension visuals.
6. Lighting: filmic tone mapping, dusk/night presets, practical streetlights and baked ambient occlusion; selectively use dynamic lights on the ONN GPU.
7. Gameplay: collision meshes must correspond to the active world; implement interaction markers and at least one end-to-end mission.
8. Android: build with the existing Capacitor/Gradle pipeline; install using adb install -r without clearing app data.
9. Independent verification: capture ONN screenshots for menu, original city, driving, each imported world and mission completion. Verify visible geometry, no WebGL exceptions, no black canvas, and responsive remote controls.
10. Performance: aim for 30 FPS on ONN with dynamic resolution and graphics presets. Report measured median/1% low and frame-time spikes; do not claim success without measurements.

## Known defect history
The 3D loop previously failed because showMenu(true) accessed the keys binding before initialization. Ensure keys is initialized before showMenu(true), and include a startup smoke test that detects a non-rendering canvas. The original-city building collision volumes must not block imported worlds.

## Rollback and release
Tag the last verified APK; retain the previous APK and checksum; release only after visual screenshot inspection and successful on-device navigation. A successful Gradle build alone is not a visual verification.
