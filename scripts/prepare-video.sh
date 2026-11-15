#!/usr/bin/env bash
set -euo pipefail

# Only process files supplied/authorised by Taikonaut. Never download private media.
# Usage: bash scripts/prepare-video.sh /path/to/approved-desktop.mov /path/to/approved-mobile.mov
# Optional WebM versions: WEBM=1 bash scripts/prepare-video.sh desktop.mov mobile.mov
if [[ $# -ne 2 ]]; then
  echo 'Provide two authorised masters: desktop (16:9) and mobile (portrait, separately reframed).'
  exit 1
fi
command -v ffmpeg >/dev/null || { echo 'ffmpeg is required. Install it before processing supplied video.'; exit 1; }
[[ -s "$1" && -s "$2" ]] || { echo 'Both authorised source files must exist and be non-empty.'; exit 1; }
mkdir -p public/videos/campaigns/arrival

# Preserve the original framing. Mobile is NOT cropped automatically from desktop.
ffmpeg -hide_banner -y -i "$1" -t 18 -an -map_metadata -1 \
  -vf "scale='min(1920,iw)':-2,fps=24,format=yuv420p" \
  -c:v libx264 -profile:v high -preset slow -crf 26 -movflags +faststart \
  public/videos/campaigns/arrival/desktop.mp4
ffmpeg -hide_banner -y -i "$2" -t 18 -an -map_metadata -1 \
  -vf "scale='min(720,iw)':-2,fps=24,format=yuv420p" \
  -c:v libx264 -profile:v high -preset slow -crf 28 -movflags +faststart \
  public/videos/campaigns/arrival/mobile.mp4

if [[ "${WEBM:-0}" == 1 ]]; then
  for kind in desktop mobile; do
    ffmpeg -hide_banner -y -i "public/videos/campaigns/arrival/$kind.mp4" -an \
      -c:v libvpx-vp9 -b:v 0 -crf 34 -row-mt 1 -deadline good \
      "public/videos/campaigns/arrival/$kind.webm"
  done
fi

# Optimised posters from actual supplied footage, not generated imagery.
ffmpeg -hide_banner -y -ss 1 -i public/videos/campaigns/arrival/desktop.mp4 \
  -frames:v 1 -vf 'scale=1600:-2' -quality 82 public/images/campaigns/arrival/poster-desktop.webp
ffmpeg -hide_banner -y -ss 1 -i public/videos/campaigns/arrival/mobile.mp4 \
  -frames:v 1 -vf 'scale=720:-2' -quality 82 public/images/campaigns/arrival/poster-mobile.webp

# Reject footage that breaks the declared technical contract.
desktop_width=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 public/videos/campaigns/arrival/desktop.mp4)
mobile_width=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 public/videos/campaigns/arrival/mobile.mp4)
mobile_height=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 public/videos/campaigns/arrival/mobile.mp4)
[[ "$desktop_width" -le 1920 ]] || { echo "Desktop master wider than 1920px."; exit 1; }
[[ "$mobile_height" -gt "$mobile_width" ]] || { echo "Mobile master must be portrait (reframed separately)."; exit 1; }
node scripts/check-video.mjs

node - <<'NODE' 
const fs=require('fs');const file='src/data/asset-inventory.json';const inv=JSON.parse(fs.readFileSync(file));
(async()=>{
  const sharp=require('sharp');
  for(const item of inv.missing){if(item.path.startsWith('/videos/')&&fs.existsSync('public'+item.path))item.status='available';}
  for(const item of inv.images){if(/poster-(desktop|mobile)/.test(item.path)){const p='public'+item.path;const meta=await sharp(p).metadata();item.width=meta.width;item.height=meta.height;item.bytes=fs.statSync(p).size;item.provenance='Frame extracted from the authorised supplied Taikonaut video.';}}
  fs.writeFileSync(file,JSON.stringify(inv,null,2)+'\n');
})();
NODE

echo 'Encoding complete. Check the edit, loop seam and framing. Targets: desktop <5 MB; mobile <2 MB.'
echo 'Run node scripts/audit-assets.mjs, then the full production validation and redeploy.'
