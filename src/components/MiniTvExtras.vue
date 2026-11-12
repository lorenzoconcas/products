<script setup lang="ts">
const base = import.meta.env.BASE_URL
const web = `${base}minitv/web/`
const m3u = `#EXTM3U
# NOTE: Playlist di esempio senza contenuti protetti. Sostituisci gli URL con sorgenti autorizzate.
#EXTINF:-1 tvg-id="" tvg-name="Canale Pubblico 1 (Esempio)" tvg-logo="" group-title="Italia", Canale Pubblico 1 (Esempio)
https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8
#EXTINF:-1 tvg-id="" tvg-name="Canale Pubblico 2 (Esempio)" tvg-logo="" group-title="Italia", Canale Pubblico 2 (Esempio)
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
#EXTINF:-1 tvg-id="" tvg-name="Sostituisci con la tua sorgente autorizzata" tvg-logo="" group-title="Italia", Tuo Canale (Esempio)
https://example.com/tua-sorgente-autorizzata.m3u8`
const json = `{
  "version": 1,
  "title": "Titolo Playlist",
  "entries": [
    {
      "name": "Nome Canale",
      "url": "https://example.com/tua-sorgente-autorizzata.m3u8",
      "group": "Gruppo Canale"
    }
  ]
}`
const btn = 'inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-base font-semibold !text-fg no-underline transition hover:-translate-y-px'
</script>

<template>
  <div class="mt-5 flex flex-wrap gap-3">
    <a :href="web" target="_blank" rel="noopener" :class="btn">Prova la versione online <span class="font-normal text-muted">(non tutte le sorgenti sono supportate)</span></a>
  </div>
  <details class="mt-5">
    <summary class="cursor-pointer font-medium">Vedi un esempio di playlist M3U</summary>
    <pre class="mt-3">{{ m3u }}</pre>
  </details>
  <details class="mt-4">
    <summary class="cursor-pointer font-medium">Esempio di playlist JSON</summary>
    <pre class="mt-3">{{ json }}</pre>
  </details>
</template>
