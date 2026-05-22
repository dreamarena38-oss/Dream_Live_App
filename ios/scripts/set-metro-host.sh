#!/bin/bash
# Writes the Mac's LAN IP into Info.plist so a physical device can reach Metro (not 127.0.0.1).
set -e

PLIST="${SRCROOT}/DreamLiveTV/Info.plist"
if [ ! -f "$PLIST" ]; then
  echo "warning: Info.plist not found at ${PLIST}"
  exit 0
fi

IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)
if [ -z "$IP" ]; then
  IP="localhost"
fi

if /usr/libexec/PlistBuddy -c "Print :MetroBundlerHost" "$PLIST" >/dev/null 2>&1; then
  /usr/libexec/PlistBuddy -c "Set :MetroBundlerHost ${IP}" "$PLIST"
else
  /usr/libexec/PlistBuddy -c "Add :MetroBundlerHost string ${IP}" "$PLIST"
fi

echo "MetroBundlerHost = ${IP}"
