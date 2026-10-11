#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
launchctl submit -l com.intrepion.little-lights -o "$ROOT/server.log" -e "$ROOT/server.log" -- /opt/homebrew/bin/node "$ROOT/node_modules/vite/bin/vite.js" preview "$ROOT" --host 127.0.0.1 --port 5178 --strictPort
