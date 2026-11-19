# CARTOOLS / Trade Gang integration — 2026-11-18
Status: queued instructions only; autonomous Hermes pickup NOT verified.
Source: /home/dwise/apps/wise2-gta6-atlas-work (feature/cartools-playable-world)
Reference spec: world/docs/LOCKED_VISUAL_REFERENCES.md
Android instructions: world/docs/HERMES_ANDROID_CONTINUATION.md
New GLB blockouts: /home/dwise/wise2-game-lab/worlds/{wise_square,trade_gang_hq,soundlabs_district}.glb
Approved visual images: six attached images in current ChatGPT conversation; originals NOT yet transferred to server. Do not substitute synthetic images or claim reference art installed.
Verified on server: Android debug APK exists at world/android/app/build/outputs/apk/debug/app-debug.apk, 4265338 bytes, SHA256 fcca6b6a850d14509ddc7bf6d66a10371dc8a888cd7174fb3978492cf70ac664. This is not proof of device gameplay.
Next:
1. Audit current game branch and working tree; preserve untracked scripts/logs and production.
2. Import the three original GLBs into an isolated development world, add collision/navigation/LOD and test.
3. When reference artwork arrives through private asset inbox, validate checksums, import and map to main menu, command dashboard, crew, garage, Sound Labs and Trade Gang.
4. Test APK on actual Android hardware/emulator; check landscape controls, driving, performance, mission trigger.
5. Audit Hermes runner/auth; never claim autonomous operation without observed pickup.
6. Build/test/verify before commit; push only feature branch, no production deployment or merge.
