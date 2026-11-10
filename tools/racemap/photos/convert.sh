#!/bin/bash

INPUT_DIR="images"
OUTPUT_DIR="converted"

mkdir -p "$OUTPUT_DIR"

# converte jpeg/jpg
for f in "$INPUT_DIR"/*.{jpg,jpeg,webp}; do
  [ -e "$f" ] || continue   # salta se non ci sono file
  base=$(basename "$f")
  name="${base%.*}"
  echo "Converto $f → $OUTPUT_DIR/$name.png"
  convert "$f" "$OUTPUT_DIR/$name.png"
done