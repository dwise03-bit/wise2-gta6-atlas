# Hermes assignment: WISE² CARTOOLS Android game continuation
Status: READY FOR AGENT PICKUP (this file does not imply a running Hermes job executor)
Repository: https://github.com/dwise03-bit/wise2-gta6-atlas
Worktree: /home/dwise/apps/wise2-gta6-atlas-work
Branch: feature/cartools-playable-world
Game: world/
Android: world/android/
Build script: world/build-android-on-server.sh
Build log: world/android-build.log
Output: world/android/app/build/outputs/apk/debug/app-debug.apk

## Immediate work
1. Audit Git status and the Android build log. Verify whether the APK exists and check its SHA256, file type, and manifest before reporting success. Repair Gradle/SDK errors if any.
2. Improve Android landscape layout, touch steering and action controls, framerate, performance and resize handling. Test actual browser/WebView runtime, not only Vite compilation.
3. Implement original assets and mechanics iteratively: better crew animation, mission state, driving feedback, environmental detail, collisions and mobile optimization. Do not import protected GTA assets.
4. Commit tested changes on feature/cartools-playable-world and push. Never merge main without authorization.
5. Maintain docs with test evidence, screenshots and a list of unverified features. Update Android build artifacts only after verifying.

## Guardrails
- Do not modify production sites, reverse proxy, DNS, system services or credentials.
- Preserve other WISE² work. Keep work in repository branch and development folders.
- Do not publish APK publicly, sign release APK, or deploy production without explicit approval.
- Do not claim 4K cinematic quality, multiplayer, finished character likeness, or successful Android runtime without tests.
- Follow audit -> fix -> test -> independent verification.
