export type MiniTVHeaderName = 'User-Agent' | 'Referer' | 'Origin' | 'Cookie'
export interface MiniTVEntry {
  name: string // se manca l'app usa l'host dell'URL
  url: string // obbligatorio: schema + host (HLS .m3u8, DASH .mpd, mp4, audio…)
  group?: string // "Radio" (senza distinzione di maiuscole) = scheda Radio, altrimenti TV
  logoURL?: string // http/https, oppure relativo all'indirizzo della playlist
  backgroundHex?: string // "#RRGGBB" | "#RGB" (anche senza "#"; l'alfa si ignora)
  backgroundHex2?: string // secondo colore: gradiente
  hideTitle?: boolean // niente nome sulla scheda
  audioURL?: string // traccia audio separata (http/https)
  headers?: Partial<Record<MiniTVHeaderName, string>>
}
export interface MiniTVPlaylist {
  version: 1
  title?: string
  entries: MiniTVEntry[]
}

export const HEADER_NAMES: MiniTVHeaderName[] = ['User-Agent', 'Referer', 'Origin', 'Cookie']

// ---------- utilità ----------

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i

/** Normalizza a "#RRGGBB" maiuscolo. Restituisce undefined se non valido. */
export function normalizeHex(input: unknown): string | undefined {
  if (typeof input !== 'string') return undefined
  const m = HEX_RE.exec(input.trim())
  if (!m) return undefined
  let h = m[1]
  if (h.length === 3) h = [...h].map((c) => c + c).join('')
  else if (h.length === 8) h = h.slice(0, 6)
  return `#${h.toUpperCase()}`
}

const trim = (v: unknown): string => (typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '')
// eslint-disable-next-line no-control-regex
const stripControl = (s: string) => s.replace(/[\u0000-\u001F\u007F]/g, '')

function parseUrl(s: string): URL | undefined {
  try {
    return new URL(s)
  } catch {
    return undefined
  }
}

/** URL con schema e host (qualunque schema). */
export function isStreamUrl(s: string): boolean {
  const u = parseUrl(s)
  return !!u && u.protocol.length > 1 && u.host.length > 0
}
export function isHttpUrl(s: string): boolean {
  const u = parseUrl(s)
  return !!u && (u.protocol === 'http:' || u.protocol === 'https:') && u.host.length > 0
}
/** logoURL: http/https oppure relativo (nessuno schema). */
export function isLogoUrl(s: string): boolean {
  if (isHttpUrl(s)) return true
  // relativo: niente "schema:" iniziale e niente "//" iniziale (protocol-relative)
  if (/^[a-z][a-z0-9+.-]*:/i.test(s) || s.startsWith('//')) return false
  return s.length > 0
}

export function parseBool(v: unknown): boolean {
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v === 1
  if (typeof v === 'string') return ['true', '1', 'yes', 'si', 'sì'].includes(v.trim().toLowerCase())
  return false
}

export const isRadio = (e: Pick<MiniTVEntry, 'group'>) => (e.group ?? '').trim().toLowerCase() === 'radio'

export function emptyEntry(): MiniTVEntry {
  return { name: '', url: '' }
}

// ---------- validazione ----------

export interface EntryIssues {
  errors: string[] // la voce non è valida
  warnings: string[] // la voce è valida ma qualcosa viene ignorato
  fields: Partial<Record<'name' | 'url' | 'logoURL' | 'backgroundHex' | 'backgroundHex2' | 'audioURL', string>>
}

export function validateEntry(e: MiniTVEntry): EntryIssues {
  const r: EntryIssues = { errors: [], warnings: [], fields: {} }
  const err = (f: keyof EntryIssues['fields'], m: string) => {
    r.errors.push(m)
    r.fields[f] = m
  }
  const warn = (f: keyof EntryIssues['fields'], m: string) => {
    r.warnings.push(m)
    r.fields[f] = m
  }
  const url = trim(e.url)
  if (!url) err('url', 'URL mancante')
  else if (!isStreamUrl(url)) err('url', 'URL non valido: servono schema e host (es. https://esempio.it/stream.m3u8)')
  if (!trim(e.name)) warn('name', 'Nome mancante: l’app userà l’host dell’URL')
  const logo = trim(e.logoURL)
  if (logo && !isLogoUrl(logo)) err('logoURL', 'Logo non valido: usa un indirizzo http/https o un percorso relativo')
  const audio = trim(e.audioURL)
  if (audio && !isHttpUrl(audio)) err('audioURL', 'Audio non valido: usa un indirizzo http/https')
  for (const k of ['backgroundHex', 'backgroundHex2'] as const) {
    const v = trim(e[k])
    if (v && !normalizeHex(v)) warn(k, 'Colore non valido: verrà ignorato')
  }
  if (!trim(e.backgroundHex) && trim(e.backgroundHex2)) warn('backgroundHex2', 'Secondo colore ignorato senza il primo')
  return r
}

export const isEntryValid = (e: MiniTVEntry) => validateEntry(e).errors.length === 0

// ---------- pulizia / export ----------

function cleanHeaders(h: unknown): Partial<Record<MiniTVHeaderName, string>> | undefined {
  if (!h || typeof h !== 'object') return undefined
  const out: Partial<Record<MiniTVHeaderName, string>> = {}
  for (const [k, v] of Object.entries(h as Record<string, unknown>)) {
    const key = k.trim().toLowerCase()
    const name: MiniTVHeaderName | undefined =
      key === 'user-agent' ? 'User-Agent'
      : key === 'referer' || key === 'referrer' ? 'Referer'
      : key === 'origin' ? 'Origin'
      : key === 'cookie' ? 'Cookie'
      : undefined
    if (!name) continue
    const val = stripControl(trim(v)).trim()
    if (val) out[name] = val
  }
  return Object.keys(out).length ? out : undefined
}

/** Voce "pulita" per l'export: campi vuoti omessi, colori normalizzati, header filtrati. Ordine dei campi fisso. */
export function cleanEntry(e: MiniTVEntry): MiniTVEntry {
  const out: MiniTVEntry = { name: trim(e.name), url: trim(e.url) }
  const group = trim(e.group)
  if (group) out.group = group
  const logo = trim(e.logoURL)
  if (logo) out.logoURL = logo
  const bg = normalizeHex(e.backgroundHex)
  if (bg) {
    out.backgroundHex = bg
    const bg2 = normalizeHex(e.backgroundHex2)
    if (bg2) out.backgroundHex2 = bg2
  }
  if (e.hideTitle) out.hideTitle = true
  const audio = trim(e.audioURL)
  if (audio) out.audioURL = audio
  const headers = cleanHeaders(e.headers)
  if (headers) out.headers = headers
  return out
}

export function toJSON(p: { title?: string; entries: MiniTVEntry[] }): string {
  const title = trim(p.title)
  const out: MiniTVPlaylist = { version: 1, ...(title ? { title } : {}), entries: p.entries.map(cleanEntry) }
  return JSON.stringify(out, null, 2)
}

/** Voci valide da esportare e numero di quelle escluse. */
export function exportable(entries: MiniTVEntry[]) {
  const valid = entries.filter(isEntryValid)
  return { valid, skipped: entries.length - valid.length }
}

const m3uAttr = (s: string) => stripControl(s).replace(/"/g, "'")

export function toM3U(p: { title?: string; entries: MiniTVEntry[] }): { text: string; warnings: string[] } {
  const warnings: string[] = []
  const lines = ['#EXTM3U']
  p.entries.map(cleanEntry).forEach((e, i) => {
    const label = e.name || `voce ${i + 1}`
    const attrs: string[] = []
    if (e.logoURL) attrs.push(`tvg-logo="${m3uAttr(e.logoURL)}"`)
    if (e.group) attrs.push(`group-title="${m3uAttr(e.group)}"`)
    if (e.backgroundHex) attrs.push(`tvg-color="${e.backgroundHex}"`)
    if (e.backgroundHex2) attrs.push(`tvg-color2="${e.backgroundHex2}"`)
    if (e.hideTitle) attrs.push('tvg-hide-title="true"')
    const nm = stripControl(e.name).replace(/\s+/g, ' ')
    lines.push(`#EXTINF:-1${attrs.length ? ' ' + attrs.join(' ') : ''},${nm}`)
    if (e.headers?.['User-Agent']) lines.push(`#EXTVLCOPT:http-user-agent=${e.headers['User-Agent']}`)
    if (e.headers?.Referer) lines.push(`#EXTVLCOPT:http-referrer=${e.headers.Referer}`)
    if (e.headers?.Origin) lines.push(`#EXTVLCOPT:http-origin=${e.headers.Origin}`)
    lines.push(e.url)
    if (e.audioURL) warnings.push(`“${label}”: l’audio separato non è supportato dall’M3U e verrà perso`)
    if (e.headers?.Cookie) warnings.push(`“${label}”: il Cookie non è supportato dall’M3U e verrà perso`)
  })
  return { text: lines.join('\n') + '\n', warnings }
}

export function miniTvLink(playlistUrl: string): string {
  return `minitv://url=${encodeURIComponent(playlistUrl)}`
}

// ---------- import ----------

export interface ImportResult {
  title?: string
  entries: MiniTVEntry[]
  /** Motivi per cui alcune voci sono state scartate (non blocca le altre). */
  problems: string[]
}

/** Rimuove BOM e virgole finali fuori dalle stringhe. */
export function relaxJSON(text: string): string {
  const src = text.replace(/^﻿/, '')
  let out = ''
  let inStr = false
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (inStr) {
      out += c
      if (c === '\\') out += src[++i] ?? ''
      else if (c === '"') inStr = false
      continue
    }
    if (c === '"') {
      inStr = true
      out += c
    } else if (c === ',') {
      let j = i + 1
      while (j < src.length && /\s/.test(src[j])) j++
      if (src[j] === '}' || src[j] === ']') continue // virgola finale
      out += c
    } else out += c
  }
  return out
}

function pick(o: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) if (o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k]
  return undefined
}

function entryFromObject(o: Record<string, unknown>): MiniTVEntry {
  const e: MiniTVEntry = { name: trim(pick(o, 'name', 'title')), url: trim(pick(o, 'url', 'streamURL')) }
  const group = trim(o.group)
  if (group) e.group = group
  const logo = trim(pick(o, 'logoURL', 'logo'))
  if (logo) e.logoURL = logo
  const bg = trim(o.backgroundHex)
  if (bg) e.backgroundHex = normalizeHex(bg) ?? bg // un colore non valido resta visibile nell'editor (avviso)
  const bg2 = trim(o.backgroundHex2)
  if (bg2) e.backgroundHex2 = normalizeHex(bg2) ?? bg2
  if (parseBool(o.hideTitle)) e.hideTitle = true
  const audio = trim(pick(o, 'audioURL', 'audioSlaveURL'))
  if (audio) e.audioURL = audio
  const headers = cleanHeaders(o.headers)
  if (headers) e.headers = headers
  return e
}

export function importJSON(text: string): ImportResult {
  let data: unknown
  try {
    data = JSON.parse(relaxJSON(text))
  } catch (err) {
    throw new Error(`JSON non valido: ${(err as Error).message}`)
  }
  let list: unknown
  let title: string | undefined
  if (Array.isArray(data)) list = data
  else if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>
    list = o.entries ?? o.channels
    title = trim(o.title) || undefined
  }
  if (!Array.isArray(list)) throw new Error('Nessun elenco di voci trovato (“entries” o “channels”)')
  const entries: MiniTVEntry[] = []
  const problems: string[] = []
  list.forEach((item, i) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      problems.push(`Voce ${i + 1}: non è un oggetto, scartata`)
      return
    }
    const e = entryFromObject(item as Record<string, unknown>)
    const issues = validateEntry(e)
    if (issues.errors.length) problems.push(`Voce ${i + 1}${e.name ? ` (${e.name})` : ''}: ${issues.errors.join('; ')}`)
    entries.push(e) // le voci con errori restano nell'editor per essere corrette
  })
  return { title, entries, problems }
}

export function importM3U(text: string): ImportResult {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/)
  const entries: MiniTVEntry[] = []
  const problems: string[] = []
  let cur: MiniTVEntry | null = null
  let curLine = 0
  const attr = (s: string, key: string) => new RegExp(`${key}="([^"]*)"`, 'i').exec(s)?.[1]?.trim()
  lines.forEach((raw, idx) => {
    const line = raw.trim()
    if (!line || line.startsWith('#EXTM3U')) return
    if (line.startsWith('#EXTINF')) {
      if (cur) problems.push(`Riga ${curLine}: voce senza URL, scartata`)
      cur = { name: '', url: '' }
      curLine = idx + 1
      // il nome è dopo l'ultima virgola fuori dagli attributi tra virgolette
      let last = -1
      let q = false
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') q = !q
        else if (line[i] === ',' && !q) last = i
      }
      cur.name = last >= 0 ? line.slice(last + 1).trim() : ''
      const logo = attr(line, 'tvg-logo')
      if (logo) cur.logoURL = logo
      const group = attr(line, 'group-title')
      if (group) cur.group = group
      const c1 = attr(line, 'tvg-color')
      if (c1) cur.backgroundHex = normalizeHex(c1) ?? c1
      const c2 = attr(line, 'tvg-color2')
      if (c2) cur.backgroundHex2 = normalizeHex(c2) ?? c2
      if (parseBool(attr(line, 'tvg-hide-title'))) cur.hideTitle = true
      return
    }
    if (line.startsWith('#EXTVLCOPT:')) {
      if (!cur) return
      const body = line.slice('#EXTVLCOPT:'.length)
      const eq = body.indexOf('=')
      if (eq < 0) return
      const key = body.slice(0, eq).trim().toLowerCase()
      const val = stripControl(body.slice(eq + 1)).trim()
      const map: Record<string, MiniTVHeaderName> = {
        'http-user-agent': 'User-Agent',
        'http-referrer': 'Referer',
        'http-referer': 'Referer',
        'http-origin': 'Origin',
      }
      if (map[key] && val) cur.headers = { ...cur.headers, [map[key]]: val }
      return
    }
    if (line.startsWith('#')) return
    // riga URL
    const e: MiniTVEntry = cur ?? { name: '', url: '' }
    e.url = line
    const ln = cur ? curLine : idx + 1
    cur = null
    if (!isStreamUrl(e.url)) {
      problems.push(`Riga ${ln}${e.name ? ` (${e.name})` : ''}: URL non valido, scartata`)
      return
    }
    entries.push(e)
  })
  if (cur) problems.push(`Riga ${curLine}: voce senza URL, scartata`)
  return { entries, problems }
}

/** Sceglie il parser dal contenuto. */
export function importAuto(text: string): ImportResult {
  const t = text.replace(/^﻿/, '').trimStart()
  if (t.startsWith('#EXTM3U') || t.startsWith('#EXTINF')) return importM3U(text)
  if (t.startsWith('{') || t.startsWith('[')) return importJSON(text)
  throw new Error('Formato non riconosciuto: usa JSON oppure M3U/M3U8')
}

/** Elenco incollato: una riga "Nome, URL" (anche solo "URL"). */
export function parseBulk(text: string): ImportResult {
  const entries: MiniTVEntry[] = []
  const problems: string[] = []
  text.split(/\r?\n/).forEach((raw, idx) => {
    const line = raw.trim()
    if (!line) return
    const comma = line.indexOf(',')
    let name = ''
    let url = line
    if (comma >= 0 && !isStreamUrl(line.slice(0, comma).trim())) {
      name = line.slice(0, comma).trim()
      url = line.slice(comma + 1).trim()
    }
    if (!isStreamUrl(url)) {
      problems.push(`Riga ${idx + 1}: URL non valido, scartata`)
      return
    }
    entries.push({ name, url })
  })
  return { entries, problems }
}

// ---------- anteprima scheda ----------

export const PALETTE: [string, string][] = [
  ['#3A7BD5', '#2753A8'], ['#7B5FE0', '#4B34A6'], ['#D6558B', '#9B2A5E'], ['#E4574B', '#A52B2B'],
  ['#E8873A', '#B0521A'], ['#D9A02B', '#9A6C0E'], ['#3DA878', '#1F6F4E'], ['#2AA9A9', '#17727A'],
  ['#5B8DEF', '#3558C9'], ['#A3568F', '#6B2F5E'], ['#6C7A89', '#3E4A57'], ['#8C6E4E', '#5A4129'],
]

/** FNV-1a 32 bit sui byte UTF-8 del nome (minuscolo, senza spazi ai bordi). */
export function paletteIndex(name: string): number {
  let h = 2166136261
  for (const b of new TextEncoder().encode(name.trim().toLowerCase())) {
    h ^= b
    h = Math.imul(h, 16777619) >>> 0
  }
  return h % PALETTE.length
}

function mixWithBlack(hex: string, keep: number): string {
  const n = parseInt(hex.slice(1), 16)
  const ch = (v: number) => Math.round(v * keep).toString(16).padStart(2, '0')
  return `#${ch((n >> 16) & 255)}${ch((n >> 8) & 255)}${ch(n & 255)}`.toUpperCase()
}

/** Luminanza relativa WCAG di "#RRGGBB". */
export function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16)
  const lin = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
}

export interface CardStyle {
  from: string
  to: string
  dark: boolean // testo scuro (sfondo personalizzato chiaro)
}

export function cardStyle(e: Pick<MiniTVEntry, 'name' | 'backgroundHex' | 'backgroundHex2'>): CardStyle {
  const bg = normalizeHex(e.backgroundHex)
  if (bg) {
    const bg2 = normalizeHex(e.backgroundHex2) ?? mixWithBlack(bg, 0.7)
    // il testo dipende dallo sfondo personalizzato (primo colore)
    return { from: bg, to: bg2, dark: luminance(bg) > 0.45 }
  }
  const [from, to] = PALETTE[paletteIndex(e.name)]
  return { from, to, dark: false }
}

export const CARD_RATIO = 1.6

/** Logo a tutto riquadro se il rapporto è entro ±3% di 1.6. */
export function isFullBleed(width: number, height: number): boolean {
  if (!width || !height) return false
  return Math.abs(width / height / CARD_RATIO - 1) <= 0.03
}

/** Iniziali: prime lettere/cifre delle prime due parole; con una parola sola, le prime due. "?" se vuoto. */
export function initials(name: string): string {
  const words = name.split(/[\s\-_]+/).filter(Boolean)
  const alnum = (w: string) => [...w].filter((c) => /[\p{L}\p{N}]/u.test(c))
  const parts = words.map(alnum).filter((w) => w.length)
  if (!parts.length) return '?'
  const chars = parts.length === 1 ? parts[0].slice(0, 2) : [parts[0][0], parts[1][0]]
  return chars.join('').toUpperCase()
}
