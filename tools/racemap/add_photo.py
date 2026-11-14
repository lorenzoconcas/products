#!/usr/bin/env python3
"""
Adds a driver photo from Wikimedia Commons to Race Map, with its credit.

  python3 tools/racemap/add_photo.py search "Oliver Bearman"
      Lists freely licensed Commons files that mention the name (newest first).

  python3 tools/racemap/add_photo.py add <driverId> "<Commons file name or URL>" ["Driver Name"]
      Downloads the file, checks that the licence is free (CC BY, CC BY-SA, CC0, public domain),
      crops it on the face (macOS Vision), saves 256x256 PNG to public/racemap/photos/<driverId>.png,
      and updates credits.json and CREDITS.md next to it.

driverId must be the Ergast id (e.g. norris, max_verstappen, arvid_lindblad).
Nothing is committed or pushed: review the result, then commit and push yourself.
Requires macOS with swiftc (Xcode command line tools).
"""
import html, json, os, re, subprocess, sys, tempfile, time, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.environ.get("RACEMAP_REPO", os.path.abspath(os.path.join(HERE, "..", "..")))
PHOTOS = os.path.join(REPO, "public", "racemap", "photos")
UA = {"User-Agent": "RaceMapPhotoTool/1.0 (driver headshot licence lookup)"}
API = "https://commons.wikimedia.org/w/api.php"


def api(**params):
    params["format"] = "json"
    url = API + "?" + urllib.parse.urlencode(params)
    for i in range(4):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40))
        except Exception:
            time.sleep(3 + 3 * i)
    sys.exit("Wikimedia Commons non risponde, riprova più tardi.")


def clean(s):
    s = html.unescape(re.sub(r"<[^>]+>", "", s or ""))
    s = re.sub(r"\s+", " ", s)
    return re.sub(r"^Original:\s*", "", s).strip()


def is_free(lic):
    lic = lic or ""
    if re.search(r"-NC|-ND|\bNC\b|\bND\b", lic):
        return False
    return bool(re.search(r"CC[ -]BY|CC0|public domain|^PD", lic, re.I))


def file_info(title):
    r = api(action="query", titles=title, prop="imageinfo", iiprop="url|extmetadata|size", iiurlwidth=900)
    page = list((r.get("query", {}).get("pages") or {}).values())
    ii = ((page[0].get("imageinfo") if page else None) or [None])[0]
    if not ii:
        sys.exit(f"File non trovato su Commons: {title}")
    m = ii.get("extmetadata", {})
    val = lambda k: clean((m.get(k) or {}).get("value"))
    return {
        "file": title.split(":", 1)[1], "thumb": ii.get("thumburl"), "source": ii.get("descriptionurl"),
        "license": val("LicenseShortName"), "licenseUrl": val("LicenseUrl"), "author": val("Artist"),
        "date": val("DateTimeOriginal") or val("DateTime"), "w": ii.get("width"), "h": ii.get("height"),
    }


def cmd_search(query):
    r = api(action="query", generator="search", gsrsearch=query, gsrnamespace=6, gsrlimit=50,
            prop="imageinfo", iiprop="url|extmetadata|size")
    rows = []
    for p in (r.get("query", {}).get("pages") or {}).values():
        ii = (p.get("imageinfo") or [{}])[0]
        m = ii.get("extmetadata", {})
        lic = clean((m.get("LicenseShortName") or {}).get("value"))
        if not is_free(lic) or min(ii.get("width", 0), ii.get("height", 0)) < 500:
            continue
        date = clean((m.get("DateTimeOriginal") or m.get("DateTime") or {}).get("value"))[:10]
        rows.append((date, p["title"], lic, ii.get("width"), ii.get("height"),
                     clean((m.get("Artist") or {}).get("value"))[:30]))
    for d, t, lic, w, h, a in sorted(rows, reverse=True):
        print(f"{d:10}  {t}  [{lic}, {w}x{h}, {a}]")
    print(f"\n{len(rows)} file con licenza libera. Poi: add <driverId> \"File:...\"")


def build_cropper():
    exe = os.path.join(tempfile.gettempdir(), "racemap_facecrop")
    src = os.path.join(HERE, "facecrop.swift")
    if not os.path.exists(exe) or os.path.getmtime(exe) < os.path.getmtime(src):
        subprocess.run(["swiftc", "-O", src, "-o", exe], check=True)
    return exe


def write_credits(credits):
    credits.sort(key=lambda c: c["name"])
    with open(os.path.join(PHOTOS, "credits.json"), "w") as f:
        json.dump(credits, f, ensure_ascii=False, indent=1)
    lines = ["# Crediti delle foto dei piloti (Race Map)", "",
             "Le immagini in questa cartella provengono da Wikimedia Commons, sono state ritagliate sul volto e ridimensionate a 256x256 px.",
             "Ogni foto resta sotto la licenza indicata; le versioni modificate sono distribuite con la stessa licenza (CC BY / CC BY-SA / CC0).",
             "", "| Pilota | File | Autore | Licenza | Fonte |", "|---|---|---|---|---|"]
    for c in credits:
        lines.append(f"| {c['name']} | `{c['driverId']}.png` | {c['author']} | [{c['license']}]({c['licenseUrl']}) | [Commons]({c['source']}) |")
    with open(os.path.join(PHOTOS, "CREDITS.md"), "w") as f:
        f.write("\n".join(lines) + "\n")


def cmd_add(driver_id, ref, name=None):
    title = urllib.parse.unquote(ref.split("/wiki/")[-1]) if "/wiki/" in ref else ref
    title = title if title.startswith("File:") else "File:" + title
    info = file_info(title.replace("_", " "))
    if not is_free(info["license"]):
        sys.exit(f"Licenza non libera ({info['license'] or 'sconosciuta'}): non uso questa foto.")
    if not info["author"]:
        sys.exit("Autore non indicato su Commons: serve per l'attribuzione, scegli un'altra foto.")
    os.makedirs(PHOTOS, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        raw = os.path.join(tmp, "src.jpg")
        open(raw, "wb").write(urllib.request.urlopen(urllib.request.Request(info["thumb"], headers=UA), timeout=60).read())
        out = os.path.join(PHOTOS, f"{driver_id}.png")
        res = subprocess.run([build_cropper(), raw, out, "256"], capture_output=True, text=True).stdout.strip()
    if res != "FACE":
        if os.path.exists(out):
            os.remove(out)
        sys.exit("Nessun volto riconosciuto (casco, profilo o inquadratura troppo larga): scegli un'altra foto.")
    path = os.path.join(PHOTOS, "credits.json")
    credits = json.load(open(path)) if os.path.exists(path) else []
    old = next((c for c in credits if c["driverId"] == driver_id), None)
    entry = {"driverId": driver_id, "name": name or (old or {}).get("name") or driver_id.replace("_", " ").title(),
             "author": info["author"], "license": info["license"], "licenseUrl": info["licenseUrl"],
             "source": info["source"], "file": info["file"]}
    credits = [c for c in credits if c["driverId"] != driver_id] + [entry]
    write_credits(credits)
    print(f"OK  {driver_id}.png  <-  {info['file']}\n    {info['author']}  |  {info['license']}  |  {info['date'][:10]}")
    print("Controlla la foto, poi: git add public/racemap && git commit && git push")


if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) >= 2 and a[0] == "search":
        cmd_search(" ".join(a[1:]))
    elif len(a) >= 3 and a[0] == "add":
        cmd_add(a[1], a[2], a[3] if len(a) > 3 else None)
    else:
        print(__doc__)
