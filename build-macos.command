#!/bin/bash
set -e
cd "$(dirname "$0")"
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
if ! command -v node >/dev/null 2>&1; then
  echo "Install Node.js 22+ on the build Mac, then open this file again."
  read -r -p "Press Enter to close..." _wb_wait
  exit 1
fi
_wb_status=0
if node desktop/build-macos.mjs; then
  echo "Done. Open release in Finder."
  open release
else
  _wb_status=$?
  echo "Build failed. Read the message above."
fi
read -r -p "Press Enter to close..." _wb_wait

exit "$_wb_status"
