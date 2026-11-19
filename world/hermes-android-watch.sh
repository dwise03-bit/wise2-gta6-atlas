#!/usr/bin/env bash
set -euo pipefail
ROOT=/home/dwise/apps/wise2-gta6-atlas-work/world
exec 9>"$ROOT/logs/android-watch.lock"
flock -n 9 || exit 0
export ANDROID_HOME=/home/dwise/android-sdk
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:/home/dwise/.local/bin:$PATH"
APK="$ROOT/android/app/build/outputs/apk/debug/app-debug.apk"
LOG="$ROOT/logs/android-watch.log"
{
echo "=== $(date -Is) ==="
if [ -s "$APK" ]; then
  echo "APK_PRESENT $(stat -c %s "$APK") bytes"
  sha256sum "$APK"
else
  echo "APK_MISSING"
  if pgrep -f '[g]radle.*assembleDebug|[b]uild-android-on-server.sh' >/dev/null; then
    echo "BUILD_ALREADY_RUNNING"
  elif [ -x "$JAVA_HOME/bin/java" ] && [ -x "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" ]; then
    echo "BUILD_RETRY_START"
    timeout 2700 "$ROOT/build-android-on-server.sh" || echo "BUILD_RETRY_FAILED"
  else
    echo "BUILD_PREREQUISITES_MISSING"
  fi
fi
if command -v claude >/dev/null; then
  claude auth status 2>/dev/null | grep -E '"loggedIn"|"authMethod"' || true
fi
echo "=== end ==="
} >>"$LOG" 2>&1
