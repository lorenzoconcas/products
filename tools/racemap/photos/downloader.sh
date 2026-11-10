#!/bin/bash

URL="$1"
mkdir -p images
cd images || exit

# Scarica HTML
curl -s "$URL" | \
grep -oE 'src="[^"]+\.(webp|png|jpe?g)"' | \
sed -E 's/src="([^"]+)"/\1/' | \
while read -r IMG; do
  if [[ "$IMG" != http* ]]; then
    IMG="${URL%/}/$IMG"
  fi
  echo "Scarico $IMG"
  wget -q "$IMG"
done