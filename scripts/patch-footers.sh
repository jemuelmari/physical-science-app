#!/usr/bin/env bash
# ============================================================
# patch-footers.sh
# Adds <div id="dev-credit"></div> to every .app-footer
# in all HTML files (except index.html, which is already patched).
#
# Usage:
#   chmod +x scripts/patch-footers.sh
#   ./scripts/patch-footers.sh
# ============================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "🔧 Patching footers in: $REPO_ROOT"
echo "────────────────────────────────────────"

PATCHED=0
SKIPPED=0
NO_FOOTER=0

# Find all HTML files, skip node_modules and backups
while IFS= read -r -d '' file; do
  # Skip files that already have the slot
  if grep -q 'id="dev-credit"' "$file"; then
    echo "⏭  Already patched: $file"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  # Skip files with no .app-footer
  if ! grep -q 'class="app-footer"' "$file"; then
    echo "⏭  No app-footer: $file"
    NO_FOOTER=$((NO_FOOTER + 1))
    continue
  fi

  # Backup, then patch
  cp "$file" "$file.bak"
  # Insert the slot immediately after the .app-footer opening tag
  # BSD sed (macOS) needs -i ''  / GNU sed (Linux) needs -i
  if sed --version >/dev/null 2>&1; then
    # GNU sed
    sed -i 's|\(<footer class="app-footer"[^>]*>\)|\1\n  <div id="dev-credit"></div>|' "$file"
  else
    # BSD sed
    sed -i '' 's|\(<footer class="app-footer"[^>]*>\)|\1\
  <div id="dev-credit"></div>|' "$file"
  fi

  echo "✔  Patched: $file"
  PATCHED=$((PATCHED + 1))
done < <(find . -name "*.html" -not -path "./node_modules/*" -not -name "*.bak" -print0)

echo "────────────────────────────────────────"
echo "✅ Patched:  $PATCHED"
echo "⏭  Skipped:  $SKIPPED (already patched)"
echo "⏭  No footer: $NO_FOOTER"
echo ""
echo "Backups saved as *.html.bak"
echo "To remove backups after verifying:"
echo "  find . -name '*.html.bak' -delete"
