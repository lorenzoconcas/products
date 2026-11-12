import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  cleanEntry, importAuto, importJSON, importM3U, initials, isFullBleed, cardStyle, normalizeHex, paletteIndex,
  parseBulk, toJSON, toM3U, validateEntry, exportable, relaxJSON,
} from './minitv-playlist'

describe('normalizeHex', () => {
  it('normalizza 3, 6 e 8 cifre, con o senza #', () => {
    expect(normalizeHex('abc')).toBe('#AABBCC')
    expect(normalizeHex('#a1b2c3')).toBe('#A1B2C3')
    expect(normalizeHex('#11223344')).toBe('#112233')
  })
  it('rifiuta valori non validi', () => {
    for (const v of ['', 'xyz', '#12345', '#1234567', undefined, 12]) expect(normalizeHex(v)).toBeUndefined()
  })
})

describe('validateEntry', () => {
  it('URL mancante e non valido', () => {
    expect(validateEntry({ name: 'a', url: '' }).errors).toEqual(['URL mancante'])
    expect(validateEntry({ name: 'a', url: 'esempio.it/x.m3u8' }).errors[0]).toMatch(/non valido/)
    expect(validateEntry({ name: 'a', url: 'rtmp://host/live' }).errors).toEqual([])
  })
  it('nome mancante è solo un avviso', () => {
    const r = validateEntry({ name: '  ', url: 'https://a.it/x' })
    expect(r.errors).toEqual([])
    expect(r.warnings.length).toBe(1)
  })
  it('logo: relativo ok, altri schemi no', () => {
    const base = { name: 'a', url: 'https://a.it/x' }
    expect(validateEntry({ ...base, logoURL: '../logos/rai1.png' }).errors).toEqual([])
    expect(validateEntry({ ...base, logoURL: 'javascript:alert(1)' }).errors.length).toBe(1)
    expect(validateEntry({ ...base, logoURL: 'file:///x.png' }).errors.length).toBe(1)
    expect(validateEntry({ ...base, audioURL: 'ftp://a.it/x' }).errors.length).toBe(1)
  })
  it('colore non valido non invalida la voce', () => {
    const r = validateEntry({ name: 'a', url: 'https://a.it/x', backgroundHex: 'zz' })
    expect(r.errors).toEqual([])
    expect(r.warnings.length).toBe(1)
  })
})

describe('import JSON tollerante', () => {
  it('version stringa, virgole finali, alias, BOM', () => {
    const txt = '﻿{"version":"1.0","title":"T","channels":[{"title":"A","streamURL":"https://a.it/x.m3u8","logo":"l.png","audioSlaveURL":"https://a.it/a.m3u8","hideTitle":"Sì","extra":1,},]}'
    const r = importJSON(txt)
    expect(r.title).toBe('T')
    expect(r.entries).toEqual([{ name: 'A', url: 'https://a.it/x.m3u8', logoURL: 'l.png', hideTitle: true, audioURL: 'https://a.it/a.m3u8' }])
  })
  it('array alla radice; voci rotte segnalate ma non bloccanti', () => {
    const r = importJSON('[{"name":"ok","url":"https://a.it/x"},{"name":"ko","url":"nope"},5]')
    expect(r.entries.length).toBe(2)
    expect(r.problems.length).toBe(2)
  })
  it('non rovina le virgole dentro le stringhe', () => {
    expect(JSON.parse(relaxJSON('{"a":"x,}",}'))).toEqual({ a: 'x,}' })
  })
  it('header: solo i quattro ammessi, Referrer alias, niente controlli', () => {
    const r = importJSON(JSON.stringify([{ name: 'a', url: 'https://a.it/x', headers: { referrer: 'https://r.it\r\nX: 1', 'X-Foo': 'no', cookie: 'a=b' } }]))
    expect(r.entries[0].headers).toEqual({ Referer: 'https://r.itX: 1', Cookie: 'a=b' })
  })
  it('errore su JSON o struttura non valida', () => {
    expect(() => importJSON('{')).toThrow(/JSON non valido/)
    expect(() => importJSON('{"a":1}')).toThrow(/Nessun elenco/)
  })
})

describe('import M3U', () => {
  const m3u = `#EXTM3U
#EXTINF:-1 tvg-logo="https://a.it/l.png" group-title="Radio, FM" tvg-color="#abc" tvg-color2="112233" tvg-hide-title="true",Radio Uno
#EXTVLCOPT:http-user-agent=UA/1
#EXTVLCOPT:http-referrer=https://r.it
#EXTVLCOPT:http-origin=https://o.it
https://a.it/uno.m3u8
#EXTINF:-1,Senza URL valido
non-un-url
#EXTINF:-1,Orfano
`
  it('legge attributi, opzioni VLC e scarta le righe non valide', () => {
    const r = importM3U(m3u)
    expect(r.entries).toEqual([{
      name: 'Radio Uno', url: 'https://a.it/uno.m3u8', logoURL: 'https://a.it/l.png', group: 'Radio, FM',
      backgroundHex: '#AABBCC', backgroundHex2: '#112233', hideTitle: true,
      headers: { 'User-Agent': 'UA/1', Referer: 'https://r.it', Origin: 'https://o.it' },
    }])
    expect(r.problems.length).toBe(2)
  })
  it('importAuto sceglie il parser', () => {
    expect(importAuto(m3u).entries.length).toBe(1)
    expect(importAuto('[{"url":"https://a.it/x"}]').entries.length).toBe(1)
    expect(() => importAuto('ciao')).toThrow()
  })
})

describe('export', () => {
  const entries = [
    { name: 'A', url: 'https://a.it/x', group: 'Radio', backgroundHex: 'abc', backgroundHex2: 'zz', hideTitle: true, audioURL: 'https://a.it/au', headers: { Cookie: 'c=1', 'User-Agent': 'UA' } },
    { name: '', url: '', logoURL: '' },
  ]
  it('JSON: ordine campi, campi vuoti omessi, version 1', () => {
    const o = JSON.parse(toJSON({ title: ' T ', entries: [entries[0]] }))
    expect(o.version).toBe(1)
    expect(o.title).toBe('T')
    expect(Object.keys(o.entries[0])).toEqual(['name', 'url', 'group', 'backgroundHex', 'hideTitle', 'audioURL', 'headers'])
    expect(o.entries[0].backgroundHex).toBe('#AABBCC')
  })
  it('esclude le voci non valide', () => {
    const r = exportable(entries)
    expect(r.valid.length).toBe(1)
    expect(r.skipped).toBe(1)
  })
  it('M3U: avvisa per audio e Cookie e fa round trip del resto', () => {
    const { text, warnings } = toM3U({ entries: [entries[0]] })
    expect(warnings.length).toBe(2)
    expect(text).toContain('#EXTVLCOPT:http-user-agent=UA')
    const back = importM3U(text).entries[0]
    expect(back).toEqual({ name: 'A', url: 'https://a.it/x', group: 'Radio', backgroundHex: '#AABBCC', hideTitle: true, headers: { 'User-Agent': 'UA' } })
  })
  it('parseBulk: "Nome, URL" e solo URL', () => {
    const r = parseBulk('Rai 1, https://a.it/1\nhttps://a.it/2\n\nrotto, boh')
    expect(r.entries).toEqual([{ name: 'Rai 1', url: 'https://a.it/1' }, { name: '', url: 'https://a.it/2' }])
    expect(r.problems.length).toBe(1)
  })
})

describe('anteprima', () => {
  it('indice palette stabile e indifferente a maiuscole/spazi', () => {
    expect(paletteIndex('Rai 1')).toBe(paletteIndex('  rai 1 '))
    expect(paletteIndex('Rai 1')).toBe(paletteIndex('Rai 1'))
    for (const n of ['', 'a', 'Città', 'Rai 1']) expect(paletteIndex(n)).toBeLessThan(12)
  })
  it('FNV-1a: valore noto ("a" → 0xE40C292C)', () => {
    expect(paletteIndex('a')).toBe(0xe40c292c % 12)
  })
  it('colori personalizzati e contrasto del testo', () => {
    expect(cardStyle({ name: 'x', backgroundHex: '#FFFFFF' })).toMatchObject({ from: '#FFFFFF', to: '#B3B3B3', dark: true })
    expect(cardStyle({ name: 'x', backgroundHex: '#000', backgroundHex2: '#fff' })).toMatchObject({ from: '#000000', to: '#FFFFFF', dark: false })
    expect(cardStyle({ name: 'x' }).dark).toBe(false)
  })
  it('iniziali', () => {
    expect(initials('Rai 1')).toBe('R1')
    expect(initials('Canale-5_news')).toBe('C5')
    expect(initials('Mediaset')).toBe('ME')
    expect(initials('  ')).toBe('?')
    expect(initials('!!! ???')).toBe('?')
  })
  it('regola del riquadro a pieno (±3% di 1.6)', () => {
    expect(isFullBleed(640, 400)).toBe(true)
    expect(isFullBleed(656, 400)).toBe(true) // +2,5%
    expect(isFullBleed(660, 400)).toBe(false) // +3,1%
    expect(isFullBleed(500, 500)).toBe(false)
    expect(isFullBleed(0, 0)).toBe(false)
  })
})

describe('playlist reali del sito', () => {
  const dir = join(__dirname, '../../public/minitv/playlists')
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'))
  it.each(files)('%s si importa e si riesporta senza perdite', (f) => {
    const text = readFileSync(join(dir, f), 'utf8')
    const a = importJSON(text)
    const out = importJSON(toJSON(a))
    expect(out.problems).toEqual([])
    expect(out.entries).toEqual(a.entries.map(cleanEntry))
    expect(out.title).toBe(a.title)
    // nessun campo noto perso rispetto al file originale
    const orig = JSON.parse(relaxJSON(text)).entries as Record<string, unknown>[]
    orig.forEach((o, i) => {
      expect(out.entries[i].name).toBe(o.name)
      expect(out.entries[i].url).toBe(o.url)
      if (o.group) expect(out.entries[i].group).toBe(o.group)
      if (o.logoURL) expect(out.entries[i].logoURL).toBe(o.logoURL)
    })
  })
})
