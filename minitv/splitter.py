#!/usr/bin/env python3
import json
import os

INPUT_FILE = "CanaliItaliani.json"
OUTPUT_DIR = "groups"

def main():
    # Carica il file JSON di input
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    entries = data.get("entries", [])

    grouped = {}
    for entry in entries:
        group = entry.get("group", "Altro")
        grouped.setdefault(group, []).append(entry)

    # Crea cartella di output
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Scrivi i file divisi per gruppo
    for group, items in grouped.items():
        filename = f"{group.lower()}.json".replace(" ", "_")
        path = os.path.join(OUTPUT_DIR, filename)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(
                {
                    "version": data.get("version", 1),
                    "title": data.get("title", "") + f" - {group}",
                    "entries": items,
                },
                f,
                ensure_ascii=False,
                indent=2,
            )
        print(f"Creato: {path}")

if __name__ == "__main__":
    main()