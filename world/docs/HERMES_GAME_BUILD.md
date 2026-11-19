# HERMES — WISE² CARTOOLS WORLD
Status: development only; no production deployment authorization.
Objective: build an original playable 3D open-world vertical slice based on the user's CARTOOLS concept visual.
Style: Queensbridge-inspired fictional NYC neighborhood, pink/purple dusk, blue WISE² neon, elevated train, street vendors, murals, wet roads, sports car, three original crew characters Eazy, Darrin, Harlem Cranch. No crowns. Do not copy GTA logos, protected maps, or game assets.
Phase 1: browser-playable Three.js prototype with keyboard/touch movement, third-person camera, collision, roads, blocks, mission marker, drivable original muscle-car-inspired vehicle, HUD, sound toggles, and mobile-responsive controls.
Phase 2: asset pipeline using Blender and glTF; LOD and texture budgets; visual quality audit.
Phase 3: optional Unreal Engine 5 source project on capable workstation after GPU/engine capacity audit. Do not assume Unreal Engine is installed or performant on this server.
Safety: audit first; never touch production Nginx, existing apps, ports, Docker services, tokens or secrets. Work only in this workspace. No deployment until tests pass and user explicitly requests deployment. Preserve existing files. Avoid copyrighted GTA branding/assets.
Acceptance: npm install succeeds, npm run build succeeds, playable scene responds to WASD/arrows/touch, camera tracks player, mission interaction works, no console errors; document screenshots and verified tests. No invented verification.
Hermes execution: use this file as project brief, split work into environment, gameplay, assets, QA; report results to logs/build-report.md.
