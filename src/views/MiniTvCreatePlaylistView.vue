<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useHead } from '@unhead/vue'
import TopBar from '../components/TopBar.vue'
import SiteFooter from '../components/SiteFooter.vue'
import MiniTvCard from '../components/MiniTvCard.vue'
import { bySlug } from '../data/apps'
import {
  HEADER_NAMES, emptyEntry, exportable, importAuto, miniTvLink, normalizeHex, parseBulk, toJSON, toM3U,
  validateEntry, type ImportResult, type MiniTVEntry, type MiniTVHeaderName,
} from '../lib/minitv-playlist'

const app = bySlug('minitv')
const base = import.meta.env.BASE_URL
const title = 'MiniTV – Crea playlist'
const lead = 'Crea, importa ed esporta playlist per MiniTV direttamente dal browser.'
useHead({
  title,
  meta: [{ name: 'description', content: lead }, { property: 'og:title', content: title }, { property: 'og:description', content: lead }],
  link: [{ rel: 'icon', href: app.icon }],
})

interface Row { id: number; e: MiniTVEntry; open: boolean }
let seq = 0
const newRow = (e: MiniTVEntry = emptyEntry(), open = true): Row => ({ id: ++seq, e: reactive(e) as MiniTVEntry, open })

const playlistTitle = ref('')
const rows = ref<Row[]>([newRow()])
const baseUrl = ref('') // indirizzo da cui è stata importata la playlist (per i loghi relativi)
const publicUrl = ref('')
const problems = ref<string[]>([])
const notice = ref('')
const pasteText = ref('')
const bulkText = ref('')
const importUrl = ref('')
const busy = ref(false)

// ---------- persistenza locale ----------
const KEY = 'minitv-playlist-draft'
const loaded = ref(false)
onMounted(() => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const d = JSON.parse(raw)
      playlistTitle.value = typeof d.title === 'string' ? d.title : ''
      baseUrl.value = typeof d.baseUrl === 'string' ? d.baseUrl : ''
      publicUrl.value = typeof d.publicUrl === 'string' ? d.publicUrl : ''
      if (Array.isArray(d.entries) && d.entries.length) rows.value = d.entries.map((e: MiniTVEntry) => newRow(e, false))
    }
  } catch { /* storage non disponibile o bozza corrotta */ }
  loaded.value = true
})
watch([playlistTitle, rows, baseUrl, publicUrl], () => {
  if (!loaded.value) return
  try {
    localStorage.setItem(KEY, JSON.stringify({
      title: playlistTitle.value, baseUrl: baseUrl.value, publicUrl: publicUrl.value, entries: rows.value.map((r) => ({ ...r.e })),
    }))
  } catch { /* ignora */ }
}, { deep: true })

// ---------- editor ----------
const issues = computed(() => rows.value.map((r) => validateEntry(r.e)))
const summary = computed(() => {
  const invalid = issues.value.filter((i) => i.errors.length).length
  return { valid: rows.value.length - invalid, invalid }
})
const exp = computed(() => exportable(rows.value.map((r) => r.e)))

function add() { rows.value.push(newRow()) }
function remove(i: number) { rows.value.splice(i, 1) }
function duplicate(i: number) {
  rows.value.splice(i + 1, 0, newRow(JSON.parse(JSON.stringify(rows.value[i].e))))
}
function move(i: number, to: number) {
  if (to < 0 || to >= rows.value.length || to === i) return
  const [r] = rows.value.splice(i, 1)
  rows.value.splice(to, 0, r)
}
function clearAll() {
  if (!confirm('Svuotare la bozza?')) return
  rows.value = [newRow()]
  playlistTitle.value = ''
  baseUrl.value = ''
  problems.value = []
  notice.value = ''
}

const dragFrom = ref<number | null>(null)
const dragOver = ref<number | null>(null)
function onDragStart(ev: DragEvent, i: number) {
  dragFrom.value = i
  if (ev.dataTransfer) {
    ev.dataTransfer.effectAllowed = 'move'
    ev.dataTransfer.setData('text/plain', String(i))
    const row = (ev.target as HTMLElement).closest('[data-row]')
    if (row) ev.dataTransfer.setDragImage(row, 20, 20)
  }
}
function onDrop(i: number) {
  if (dragFrom.value !== null) move(dragFrom.value, i)
  dragFrom.value = dragOver.value = null
}

function setHeader(e: MiniTVEntry, name: MiniTVHeaderName, v: string) {
  const h = { ...(e.headers ?? {}) }
  if (v) h[name] = v
  else delete h[name]
  e.headers = Object.keys(h).length ? h : undefined
}
function setColor(e: MiniTVEntry, k: 'backgroundHex' | 'backgroundHex2', v: string) {
  if (v) e[k] = v
  else delete e[k]
}
const colorValue = (v?: string) => normalizeHex(v) ?? '#000000'

// ---------- import ----------
function apply(r: ImportResult, replace: boolean, source?: string) {
  const rowsNew = r.entries.map((e) => newRow(e, false))
  if (replace) {
    rows.value = rowsNew.length ? rowsNew : [newRow()]
    playlistTitle.value = r.title ?? ''
    baseUrl.value = source ?? ''
  } else {
    rows.value = [...rows.value.filter((x) => x.e.url || x.e.name), ...rowsNew]
  }
  problems.value = r.problems
  notice.value = `Importate ${r.entries.length} voci${r.problems.length ? `, ${r.problems.length} con problemi` : ''}.`
}
function run(fn: () => void) {
  try { fn() } catch (err) { problems.value = [(err as Error).message]; notice.value = 'Importazione non riuscita.' }
}
async function onFile(ev: Event) {
  const input = ev.target as HTMLInputElement
  const f = input.files?.[0]
  if (!f) return
  const text = await f.text()
  run(() => apply(importAuto(text), true))
  input.value = ''
}
function importPasted() {
  run(() => apply(importAuto(pasteText.value), true))
}
async function importFromUrl() {
  const u = importUrl.value.trim()
  if (!u) return
  busy.value = true
  try {
    const abs = new URL(u, window.location.href).toString()
    const res = await fetch(abs, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    run(() => apply(importAuto(text), true, abs))
  } catch (err) {
    problems.value = [`Impossibile scaricare la playlist (${(err as Error).message}). Se il server non permette l’accesso dal browser (CORS), scarica il file e caricalo qui.`]
    notice.value = 'Importazione non riuscita.'
  } finally { busy.value = false }
}
function addBulk() {
  const r = parseBulk(bulkText.value)
  apply(r, false)
  if (r.entries.length) bulkText.value = ''
}

// ---------- export ----------
const jsonText = computed(() => toJSON({ title: playlistTitle.value, entries: exp.value.valid }))
const m3u = computed(() => toM3U({ title: playlistTitle.value, entries: exp.value.valid }))
const fileName = computed(() => (playlistTitle.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'playlist'))
function download(text: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
const copied = ref('')
async function copy(text: string, what: string) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = `${what} copiato negli appunti.`
  } catch { copied.value = 'Copia non riuscita: seleziona il testo e copialo a mano.' }
}
const deepLink = computed(() => (publicUrl.value.trim() ? miniTvLink(publicUrl.value.trim()) : ''))

// ---------- stile ----------
const card = 'rounded-3xl border border-line bg-surface p-5 backdrop-blur-xl'
const btn = 'inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-[15px] font-semibold text-fg transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0'
const iconBtn = 'inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-line bg-surface-2 text-fg transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40'
const input = 'h-10 w-full rounded-xl border border-line bg-surface-2 px-3 text-[15px] text-fg placeholder:text-muted/70'
const lbl = 'mb-1 block text-[13px] font-medium text-muted'
const err = 'mt-1 text-[13px] text-red-500'
const warnCls = 'mt-1 text-[13px] text-amber-500'
</script>

<template>
  <div :style="{ '--accent': app.color }">
    <TopBar :links="[{ label: 'Playlist', href: `${base}minitv/playlists/` }, { label: 'MiniTV', href: `${base}minitv/` }]" />

    <header class="mb-7 flex flex-col items-start gap-3.5">
      <img :src="app.icon" alt="Icona MiniTV" width="96" height="96" class="size-24 rounded-[24px] object-cover ring-1 ring-line"
        :style="{ boxShadow: `0 18px 50px ${app.color}73` }" />
      <h1 class="m-0 text-[clamp(28px,5vw,44px)] font-bold leading-[1.12] tracking-[-0.03em]">Crea una playlist per MiniTV</h1>
      <p class="m-0 max-w-[62ch] text-[clamp(16px,2.6vw,19px)] text-muted">{{ lead }}</p>
      <p class="m-0 max-w-[62ch] rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-[14px] text-muted" role="note">
        🔒 Tutto resta nel tuo browser: niente viene caricato o inviato a nessun server. Gli URL degli stream e gli header
        (soprattutto i Cookie) possono contenere dati riservati: la bozza è salvata solo in questo browser, quindi non condividerne il contenuto.
      </p>
    </header>

    <div class="flex flex-col gap-5">
      <!-- import -->
      <section :class="card" aria-labelledby="h-import">
        <h2 id="h-import" class="m-0 text-xl font-bold tracking-tight">Importa</h2>
        <div class="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label :class="lbl" for="imp-file">File .json, .m3u o .m3u8</label>
            <input id="imp-file" type="file" accept=".json,.m3u,.m3u8,application/json" :class="input + ' py-1.5'" @change="onFile" />
          </div>
          <div>
            <label :class="lbl" for="imp-url">Da un indirizzo (anche una playlist di questo sito)</label>
            <div class="flex gap-2">
              <input id="imp-url" v-model="importUrl" type="url" inputmode="url" :class="input" placeholder="https://…/rai.json" @keydown.enter="importFromUrl" />
              <button type="button" :class="btn" :disabled="busy || !importUrl.trim()" @click="importFromUrl">Importa</button>
            </div>
          </div>
        </div>
        <details class="mt-3">
          <summary class="cursor-pointer text-[15px] font-medium">Incolla il testo di una playlist</summary>
          <textarea v-model="pasteText" rows="5" :class="input + ' mt-2 h-auto py-2 font-mono text-[13px]'" aria-label="Testo della playlist" placeholder="JSON oppure #EXTM3U…" />
          <button type="button" :class="btn + ' mt-2'" :disabled="!pasteText.trim()" @click="importPasted">Importa il testo</button>
        </details>
        <p v-if="notice" class="mb-0 mt-3 text-[15px]" role="status">{{ notice }}</p>
        <ul v-if="problems.length" class="mb-0 mt-2 list-disc pl-5 text-[14px] text-amber-500">
          <li v-for="p in problems" :key="p">{{ p }}</li>
        </ul>
        <p class="mb-0 mt-3 text-[13px] text-muted">L’importazione sostituisce la bozza attuale. Le voci con errori restano nell’editor per essere corrette.</p>
      </section>

      <!-- editor -->
      <section :class="card" aria-labelledby="h-edit">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 id="h-edit" class="m-0 text-xl font-bold tracking-tight">Voci</h2>
          <p class="m-0 text-[14px] text-muted" role="status">
            <span class="font-semibold text-fg">{{ summary.valid }}</span> valide ·
            <span :class="summary.invalid ? 'font-semibold text-red-500' : ''">{{ summary.invalid }}</span> non valide
          </p>
        </div>
        <div class="mt-3">
          <label :class="lbl" for="pl-title">Titolo della playlist</label>
          <input id="pl-title" v-model="playlistTitle" :class="input" placeholder="Es. Canali Italiani - Rai" />
        </div>

        <ul class="m-0 mt-4 flex list-none flex-col gap-3 p-0">
          <li v-for="(r, i) in rows" :key="r.id" data-row
            class="rounded-2xl border bg-surface-2 p-3 transition"
            :class="dragOver === i && dragFrom !== i ? 'border-accent' : 'border-line'"
            @dragover.prevent="dragOver = i" @dragleave="dragOver = null" @drop.prevent="onDrop(i)">
            <div class="flex flex-wrap items-center gap-2">
              <span :class="iconBtn + ' cursor-grab'" draggable="true" role="img" aria-label="Trascina per riordinare" title="Trascina per riordinare"
                @dragstart="onDragStart($event, i)" @dragend="dragFrom = dragOver = null">⠿</span>
              <span class="text-[14px] font-semibold text-muted">#{{ i + 1 }}</span>
              <span v-if="issues[i].errors.length" class="rounded-full bg-red-500/15 px-2 py-0.5 text-[12px] font-semibold text-red-500">Non valida</span>
              <div class="ml-auto flex gap-1.5">
                <button type="button" :class="iconBtn" :disabled="i === 0" aria-label="Sposta su" title="Sposta su" @click="move(i, i - 1)">↑</button>
                <button type="button" :class="iconBtn" :disabled="i === rows.length - 1" aria-label="Sposta giù" title="Sposta giù" @click="move(i, i + 1)">↓</button>
                <button type="button" :class="iconBtn" aria-label="Duplica" title="Duplica" @click="duplicate(i)">⧉</button>
                <button type="button" :class="iconBtn" aria-label="Elimina" title="Elimina" @click="remove(i)">✕</button>
              </div>
            </div>

            <div class="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_200px]">
              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label :class="lbl" :for="`n${r.id}`">Nome</label>
                  <input :id="`n${r.id}`" v-model="r.e.name" :class="input" autocomplete="off" />
                  <p v-if="issues[i].fields.name" :class="warnCls">{{ issues[i].fields.name }}</p>
                </div>
                <div>
                  <label :class="lbl" :for="`g${r.id}`">Gruppo <span class="font-normal">(“Radio” = scheda Radio)</span></label>
                  <input :id="`g${r.id}`" v-model="r.e.group" :class="input" autocomplete="off" />
                </div>
                <div class="sm:col-span-2">
                  <label :class="lbl" :for="`u${r.id}`">URL dello stream *</label>
                  <input :id="`u${r.id}`" v-model="r.e.url" :class="input" inputmode="url" autocomplete="off" spellcheck="false"
                    :aria-invalid="!!(issues[i].fields.url)" placeholder="https://…/playlist.m3u8" />
                  <p v-if="issues[i].fields.url" :class="err">{{ issues[i].fields.url }}</p>
                </div>
                <div class="sm:col-span-2">
                  <label :class="lbl" :for="`l${r.id}`">Logo (indirizzo o percorso relativo)</label>
                  <input :id="`l${r.id}`" v-model="r.e.logoURL" :class="input" inputmode="url" autocomplete="off" spellcheck="false" placeholder="https://…/logo.png" />
                  <p v-if="issues[i].fields.logoURL" :class="err">{{ issues[i].fields.logoURL }}</p>
                </div>
              </div>

              <div>
                <MiniTvCard :entry="r.e" :base-url="baseUrl" />
                <p class="mb-0 mt-1.5 text-[12px] text-muted">Immagine consigliata: 640 × 400 px (16:10)</p>
              </div>
            </div>

            <button type="button" class="mt-3 cursor-pointer text-[14px] font-medium text-muted hover:text-fg" :aria-expanded="r.open" @click="r.open = !r.open">
              {{ r.open ? '▾' : '▸' }} Opzioni avanzate (colori, audio, header)
            </button>
            <div v-show="r.open" class="mt-3 grid gap-3 sm:grid-cols-2">
              <div v-for="k in (['backgroundHex', 'backgroundHex2'] as const)" :key="k">
                <label :class="lbl" :for="`${k}${r.id}`">{{ k === 'backgroundHex' ? 'Colore sfondo' : 'Secondo colore (gradiente)' }}</label>
                <div class="flex gap-2">
                  <input type="color" :value="colorValue(r.e[k])" class="size-10 shrink-0 cursor-pointer rounded-lg border border-line bg-transparent p-1"
                    :aria-label="`Selettore: ${k === 'backgroundHex' ? 'colore sfondo' : 'secondo colore'}`" @input="setColor(r.e, k, ($event.target as HTMLInputElement).value)" />
                  <input :id="`${k}${r.id}`" :value="r.e[k] ?? ''" :class="input" placeholder="#RRGGBB" maxlength="9" spellcheck="false"
                    @input="setColor(r.e, k, ($event.target as HTMLInputElement).value.trim())" />
                  <button v-if="r.e[k]" type="button" :class="iconBtn + ' !size-10 shrink-0'" aria-label="Rimuovi colore" @click="setColor(r.e, k, '')">✕</button>
                </div>
                <p v-if="issues[i].fields[k]" :class="warnCls">{{ issues[i].fields[k] }}</p>
              </div>
              <label class="flex cursor-pointer items-center gap-2.5 text-[15px] sm:col-span-2">
                <input v-model="r.e.hideTitle" type="checkbox" role="switch" class="size-5 cursor-pointer accent-[var(--accent)]" />
                Nascondi il nome sulla scheda
              </label>
              <div class="sm:col-span-2">
                <label :class="lbl" :for="`a${r.id}`">URL audio separato</label>
                <input :id="`a${r.id}`" v-model="r.e.audioURL" :class="input" inputmode="url" autocomplete="off" spellcheck="false" />
                <p v-if="issues[i].fields.audioURL" :class="err">{{ issues[i].fields.audioURL }}</p>
              </div>
              <div v-for="h in HEADER_NAMES" :key="h">
                <label :class="lbl" :for="`h${h}${r.id}`">{{ h }}</label>
                <input :id="`h${h}${r.id}`" :value="r.e.headers?.[h] ?? ''" :class="input" autocomplete="off" spellcheck="false"
                  :type="h === 'Cookie' ? 'password' : 'text'" @input="setHeader(r.e, h, ($event.target as HTMLInputElement).value)" />
              </div>
            </div>
          </li>
        </ul>

        <div class="mt-4 flex flex-wrap gap-2.5">
          <button type="button" :class="btn" @click="add">＋ Aggiungi voce</button>
          <button type="button" :class="btn" @click="clearAll">Svuota bozza</button>
        </div>

        <details class="mt-4">
          <summary class="cursor-pointer text-[15px] font-medium">Aggiungi più voci da un elenco</summary>
          <label :class="lbl + ' mt-2'" for="bulk">Una riga per voce, nel formato “Nome, URL”</label>
          <textarea id="bulk" v-model="bulkText" rows="5" :class="input + ' h-auto py-2 font-mono text-[13px]'" placeholder="Rai 1, https://…/rai1.m3u8&#10;Rai 2, https://…/rai2.m3u8" />
          <button type="button" :class="btn + ' mt-2'" :disabled="!bulkText.trim()" @click="addBulk">Aggiungi all’elenco</button>
        </details>
      </section>

      <!-- anteprima -->
      <section :class="card" aria-labelledby="h-prev">
        <h2 id="h-prev" class="m-0 text-xl font-bold tracking-tight">Anteprima</h2>
        <div class="mt-3 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
          <MiniTvCard v-for="r in rows" :key="r.id" :entry="r.e" :base-url="baseUrl" />
        </div>
      </section>

      <!-- export -->
      <section :class="card" aria-labelledby="h-exp">
        <h2 id="h-exp" class="m-0 text-xl font-bold tracking-tight">Esporta</h2>
        <p v-if="exp.skipped" class="mb-0 mt-2 text-[14px] text-amber-500" role="status">
          {{ exp.skipped }} {{ exp.skipped === 1 ? 'voce non valida è esclusa' : 'voci non valide sono escluse' }} dall’export finché non {{ exp.skipped === 1 ? 'viene corretta' : 'vengono corrette' }}.
        </p>
        <ul v-if="m3u.warnings.length" class="mb-0 mt-2 list-disc pl-5 text-[13px] text-muted">
          <li v-for="w in m3u.warnings" :key="w">{{ w }}</li>
        </ul>
        <div class="mt-3 flex flex-wrap gap-2.5">
          <button type="button" :class="btn" :disabled="!exp.valid.length" @click="download(jsonText, `${fileName}.json`, 'application/json')">Scarica .json</button>
          <button type="button" :class="btn" :disabled="!exp.valid.length" @click="download(m3u.text, `${fileName}.m3u`, 'audio/x-mpegurl')">Scarica .m3u</button>
          <button type="button" :class="btn" :disabled="!exp.valid.length" @click="copy(jsonText, 'JSON')">Copia JSON</button>
          <button type="button" :class="btn" :disabled="!exp.valid.length" @click="copy(m3u.text, 'M3U')">Copia M3U</button>
        </div>
        <p v-if="copied" class="mb-0 mt-2 text-[14px]" role="status">{{ copied }}</p>

        <details class="mt-4">
          <summary class="cursor-pointer text-[15px] font-medium">Vedi il JSON</summary>
          <pre class="mt-2 max-h-96">{{ jsonText }}</pre>
        </details>

        <div class="mt-4 border-t border-line pt-4">
          <label :class="lbl" for="pub">Indirizzo pubblico della playlist (dopo averla pubblicata)</label>
          <div class="flex flex-wrap gap-2">
            <input id="pub" v-model="publicUrl" type="url" inputmode="url" :class="input + ' min-w-0 flex-1'" placeholder="https://…/mia-playlist.json" />
            <a v-if="deepLink" :href="deepLink" :class="btn + ' no-underline'">Aggiungi a MiniTV</a>
            <span v-else :class="btn + ' pointer-events-none opacity-50'" aria-disabled="true">Aggiungi a MiniTV</span>
          </div>
          <p class="mb-0 mt-1.5 text-[13px] text-muted">Funziona solo se il file è già raggiungibile online: il link apre MiniTV con quell’indirizzo.</p>
        </div>
      </section>
    </div>

    <SiteFooter owner="MiniTV" />
  </div>
</template>
