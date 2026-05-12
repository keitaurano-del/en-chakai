#!/usr/bin/env bash
# Downloads the candidate Wikimedia Commons neighborhood photos for
# public/photos/neighborhoods/. Run from a machine with normal internet
# access (the cloud Claude session is sandboxed and cannot reach
# upload.wikimedia.org). After running, verify each file's licence on its
# Commons page (linked in CREDITS.md) before committing.
#
# Usage:
#   bash scripts/fetch-neighborhood-photos.sh
#
# Optional: pass a --dry-run to just print URLs.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="$ROOT_DIR/public/photos/neighborhoods"
mkdir -p "$DEST"

UA="en-chakai-content-bot/1.0 (https://en-chakai.com; keita.urano@gmail.com)"

declare -A FILES=(
  [hakusan]="https://upload.wikimedia.org/wikipedia/commons/7/7a/Hakusanjinja-bunkyoku-main-a-June13-2015.jpg"
  [sugamo]="https://upload.wikimedia.org/wikipedia/commons/3/3e/Honmyoji_temple_sugamo.JPG"
  [zoshigaya]="https://upload.wikimedia.org/wikipedia/commons/c/cc/Zoshigaya-inside-april2013.jpg"
  # TODO: pick a Gokokuji main-hall / Niomon photo from
  # https://commons.wikimedia.org/wiki/Category:Gokokuji
  # and add it here. Example URL pattern:
  #   https://upload.wikimedia.org/wikipedia/commons/<X>/<XX>/<Filename>.jpg
  # [gokokuji]="https://upload.wikimedia.org/wikipedia/commons/.../Gokokuji_Hondo.jpg"
  #
  # TODO: pick a quiet-Tokyo-residential-street photo (Unsplash or Commons)
  # for the sengoku slug. The user approved a generic fallback.
  # [sengoku]="https://images.unsplash.com/photo-..."
)

for slug in "${!FILES[@]}"; do
  url="${FILES[$slug]}"
  out="$DEST/$slug.jpg"
  echo "==> $slug"
  if [[ "${1:-}" == "--dry-run" ]]; then
    echo "    DRY: would fetch $url -> $out"
    continue
  fi
  curl -sSL -A "$UA" -o "$out" "$url"
  if [[ ! -s "$out" ]]; then
    echo "    !! download failed for $slug ($url)"
    rm -f "$out"
    continue
  fi
  size=$(stat -c%s "$out" 2>/dev/null || stat -f%z "$out")
  printf "    saved %s (%d bytes)\n" "$out" "$size"
done

echo
echo "Done. Next steps:"
echo "  1. Open each Commons file page (see CREDITS.md) and confirm the licence."
echo "  2. Update CREDITS.md with photographer name + licence."
echo "  3. Pick remaining gokokuji + sengoku photos and re-run."
echo "  4. Update src/lib/constants.ts NEIGHBORHOODS[].photo to /photos/neighborhoods/<slug>.jpg"
