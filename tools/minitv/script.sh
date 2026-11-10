#!/bin/bash
# Script per generare uno stream HLS demo da un file MP4
# Uso: ./make-demo.sh demo.mp4

# Controllo argomento
if [ -z "$1" ]; then
  echo "Uso: $0 input.mp4"
  exit 1
fi

INPUT="$1"
BASENAME=$(basename "$INPUT" .mp4)
OUTDIR="demo"

# Crea cartella di output
mkdir -p "$OUTDIR"

# Conversione con FFmpeg (taglio a 20 secondi)
ffmpeg -i "$INPUT" \
  -t 20 \
  -c:v libx264 -c:a aac \
  -strict -2 \
  -f hls \
  -hls_time 5 \
  -hls_list_size 0 \
  -hls_segment_filename "$OUTDIR/segment_%03d.ts" \
  "$OUTDIR/${BASENAME}.m3u8"
  
echo "Conversione completata!"
echo "Carica la cartella '$OUTDIR' su GitHub Pages."
echo "URL finale della playlist: https://lroenzoconcas.github.io/products/minitv/$OUTDIR/${BASENAME}.m3u8"