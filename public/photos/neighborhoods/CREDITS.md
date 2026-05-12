# Neighborhood photo credits

This directory should contain one photo per neighborhood in `src/lib/constants.ts`:
- `sengoku.jpg`
- `hakusan.jpg`
- `sugamo.jpg`
- `gokokuji.jpg`
- `zoshigaya.jpg`

## Status: candidates identified, downloads pending

The cloud session that drafted this directory could not reach external image
hosts (Wikimedia, Unsplash, Pexels, Flickr all returned 403 from the sandbox
egress proxy — only `github.com` / `raw.githubusercontent.com` are allowlisted).
The script `scripts/fetch-neighborhood-photos.sh` will download the candidates
below from a workstation that has normal internet access.

Each candidate was identified from a third-party HTML mirror or wiki XML export
on GitHub that referenced the Wikimedia Commons filename. The licence column
must still be verified by opening the Commons file page (linked) before any
photo is used in production — Wikimedia Commons files are typically CC BY,
CC BY-SA, or public domain, but each file has its own terms.

---

## hakusan (Hakusan Shrine, Bunkyō)

- **File**: `Hakusanjinja-bunkyoku-main-a-June13-2015.jpg`
- **Commons page**: https://commons.wikimedia.org/wiki/File:Hakusanjinja-bunkyoku-main-a-June13-2015.jpg
- **Direct URL**: https://upload.wikimedia.org/wikipedia/commons/7/7a/Hakusanjinja-bunkyoku-main-a-June13-2015.jpg
- **Subject**: Main hall (haiden) of Hakusan Shrine, Bunkyō, photographed June 13, 2015 — likely captures the hydrangea-season setting.
- **Source trail**: Filename referenced in the infobox of the Shinto wiki XML archive `Hakusan_Shrine__Bunkyo_Ward_.xml` (github.com/EmmaLeonhart/shintowiki-xml-archives), which copies from English Wikipedia’s article on Hakusan Shrine (Bunkyō).
- **Author / licence**: TODO — verify on the Commons file page before use.

## sugamo (Jizō-dōri area, Toshima)

- **File**: `Honmyoji_temple_sugamo.JPG`
- **Commons page**: https://commons.wikimedia.org/wiki/File:Honmyoji_temple_sugamo.JPG
- **Direct URL**: https://upload.wikimedia.org/wikipedia/commons/3/3e/Honmyoji_temple_sugamo.JPG
- **Subject**: Honmyō-ji temple in Sugamo. Honmyō-ji sits on Jizō-dōri so it’s a plausible stand-in for the “old shopping-street Sugamo” aesthetic, but it is **not** Togenuki-Jizō (Kōgan-ji) and not a busy street shot. Consider replacing with a Togenuki Jizō / shopping arcade photo when network access is available.
- **Source trail**: Used as a Sugamo gallery thumbnail on the Wikivoyage HTML mirror at github.com/magical-web-organization/Travellers (`en/.../tokyo/toshima/index.html`).
- **Author / licence**: TODO — verify on Commons.

## zoshigaya (Zōshigaya cemetery / Kishimojin area)

- **File**: `Zoshigaya-inside-april2013.jpg`
- **Commons page**: https://commons.wikimedia.org/wiki/File:Zoshigaya-inside-april2013.jpg
- **Direct URL**: https://upload.wikimedia.org/wikipedia/commons/c/cc/Zoshigaya-inside-april2013.jpg
- **Subject**: Inside Zōshigaya Cemetery (where Natsume Sōseki and Lafcadio Hearn are buried), April 2013.
- **Source trail**: Used as a Zōshigaya cemetery thumbnail on the same Wikivoyage Toshima mirror.
- **Author / licence**: TODO — verify on Commons.

## gokokuji (Gokoku-ji temple)

- **Candidate file**: `Gokokuji.JPG` *(suggested — TBD; the Commons category at https://commons.wikimedia.org/wiki/Category:Gokokuji has 76 photos, search for the main hall / Niōmon / Yakushi-dō wide shots).*
- **Commons category**: https://commons.wikimedia.org/wiki/Category:Gokokuji
- **Subject wanted**: Wide shot of the Hondō (main hall) or Niōmon gate of Gokoku-ji, Bunkyō. The 1697 main hall is one of the rare WWII-survivor large wooden temple buildings in Tokyo, so the shot should emphasise the dark roof and scale.
- **Source trail**: Need to open the Commons category page to pick a specific filename. Wikipedia article: https://en.wikipedia.org/wiki/Gokoku-ji
- **Author / licence**: TODO — pick one and document.

## sengoku (Sengoku, Bunkyō)

- **Candidate file**: *(none confirmed)*. Sengoku 千石 in Bunkyō is sparsely photographed on Commons. The user has approved a fallback: a generic "quiet Tokyo residential alley" image.
- **Commons category to search**: https://commons.wikimedia.org/wiki/Category:Sengoku,_Bunky%C5%8D (may not exist) or https://commons.wikimedia.org/wiki/Category:Bunky%C5%8D
- **Fallback options**:
  1. Unsplash search for "tokyo residential alley", "tokyo backstreet" — Unsplash License, free commercial use.
  2. A nearby-Bunkyō residential photo such as Hakusan back streets (overlaps with the hakusan slug, so prefer something else).
- **Author / licence**: TODO — document whichever is picked. If a substitution is used, note "Substituted — Sengoku 千石 not directly photographed; ‘quiet Tokyo residential street’ fallback per user instruction (2026-05-12)."
