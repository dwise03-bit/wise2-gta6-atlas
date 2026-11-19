# WISE² CARTOOLS — Claude Code Implementation Handoff
Date: 2026-11-18
Owner-approved direction: original cinematic 3D NYC-inspired Trade Gang universe.
Repository: https://github.com/dwise03-bit/wise2-gta6-atlas
Branch: feature/cartools-playable-world
Checkout: /home/dwise/apps/wise2-gta6-atlas-work
App: world/ (Vite + Three.js + Capacitor Android)
Android package: net.wise2.cartools
Target device: onn 4K Pro Streaming Device (Google TV, Android 14), local ADB 192.168.8.231:5555.
Tailscale device googletv2516 at 100.97.228.116; WISE² server LAN 192.168.8.191.
Do not assume ADB address is permanent: verify device identity before installing.

## Current verified baseline
- TV installation, launch, foreground activity, and user screenshots confirm game/launcher render.
- User confirmed D-pad gameplay works.
- Cinematic-styled TV launcher with Play Game, Command Dashboard, Missions, Crew, Garage, Sound Labs, Trade Gang HQ, Wise Square.
- Three original Blender blockout GLBs: world/public/worlds/wise_square.glb, trade_gang_hq.glb, soundlabs_district.glb; synced to Android assets.
- Procedural original city, basic crew, blue muscle car, marker mission, gamepad and remote controls.
- Last observed Git commit f57df25. Inspect git log before working.
- Original approved reference artwork NOT on server: world/assets/references is empty. Do not invent asset delivery.
- Existing asset inbox watcher and importer: /home/dwise/wise2-asset-inbox/cartools/; world/import-cartools-assets.py.
- Claude Code installed at /home/dwise/.local/bin/claude; last checked 'claude auth status' loggedIn=false. Do not claim autonomous execution until signed in and verified.

## Approved design direction
Use world/docs/LOCKED_VISUAL_REFERENCES.md and world/docs/CARTOOLS_INTEGRATION_20261118.md.
Dark metallic WISE² identity, electric blue and magenta, neon NYC skyline, blue 392-inspired ORIGINAL muscle car, original Eazy (blue), Darrin (red), Harlem Cranch (black) game avatars. No crowns. Do not copy GTA trademarks or other proprietary game assets. Do not use unapproved saved personal likeness images.
Visual targets: cinematic game main menu, command dashboard, mission system, garage, Sound Labs, Trade Gang HQ, Wise Square. Target 1920x1080 TV with readable safe margins and remote focus.

## Priority implementation
1. AUDIT first: git status, full world/src/main.js and world/index.html, renderer errors, asset manifest, Android logs, memory/FPS. Preserve all existing production services.
2. Fix TV navigation: D-pad focus, OK/Back behavior, gamepad controls, menu/game state transitions. Ensure focus doesn't cause simultaneous player movement. Test each menu route.
3. Replace primitive character and vehicle geometry with ORIGINAL detailed, optimized 3D models. Use Blender or licensed original sources only; track provenance. Keep stable game performance on onn 4K Pro. No placeholder screenshots as gameplay.
4. Build cinematic scene, improved materials/lighting, skyline, textured streets, environmental props, HUD/dashboard. Optimize texture size, geometry count, draw calls, shadows and loading.
5. Connect three blockout worlds to actual navigation and gameplay with collision, spawn points, interactable objects, missions and return-to-menu. World selector should work via remote and gamepad.
6. Import approved image reference ZIP only when physically available in the private inbox. Verify hashes and archive safety. Do not assume ChatGPT attachments are present on server.
7. Run npm run build, npm run android:sync, Gradle assembleDebug. Independently inspect APK package, packaged worlds, checksum. Install via adb only after identifying target. Launch and inspect logcat and foreground activity.
8. Request screenshot / verify visually; compare against approved references. Report specific mismatches honestly. Push only to feature branch with descriptive commits; no production deploy or main merge without review.

## Commands
cd /home/dwise/apps/wise2-gta6-atlas-work/world
npm run build
npm run android:sync
cd android && JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 ANDROID_HOME=/home/dwise/android-sdk ./gradlew assembleDebug --no-daemon
adb devices -l
adb -s 192.168.8.231:5555 install -r app/build/outputs/apk/debug/app-debug.apk
adb -s 192.168.8.231:5555 shell monkey -p net.wise2.cartools 1
adb -s 192.168.8.231:5555 shell dumpsys activity activities | grep topResumedActivity

## Non-negotiable acceptance criteria
- Working TV remote Play/Back/World selection; no regression.
- Original detailed models; no false 'photorealistic' claims for procedural placeholders.
- All worlds load with no fatal JS or Android crash.
- Build, APK integrity, on-device launch verified, performance observations documented.
- Visual comparison and remaining gaps recorded.
- Keep untracked local build-android-on-server.sh and logs intact; do not delete unrelated files.
