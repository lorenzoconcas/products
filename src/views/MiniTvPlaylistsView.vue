<script setup lang="ts">
import { useHead } from '@unhead/vue'
import TopBar from '../components/TopBar.vue'
import SiteFooter from '../components/SiteFooter.vue'
import { bySlug } from '../data/apps'

const app = bySlug('minitv')
const base = import.meta.env.BASE_URL
const dir = `${base}minitv/playlists/`
const title = 'MiniTV – Playlist di esempio'
const lead = 'Qui sono disponibili delle playlist di esempio con canali italiani'

useHead({
  title,
  meta: [
    { name: 'description', content: lead },
    { property: 'og:title', content: title },
    { property: 'og:description', content: lead },
  ],
  link: [{ rel: 'icon', href: app.icon }],
})

const groups = [
  { name: 'Rai', file: 'rai.json', logo: 'rai.png' },
  { name: 'Mediaset', file: 'mediaset.json', logo: 'mediaset.png' },
  { name: 'Radio', file: 'radio.json', logo: 'radio.png' },
  { name: 'Sky', file: 'sky.json', logo: 'sky.png' },
  { name: 'Altro', file: 'altro.json', logo: 'altro.png' },
  { name: 'Regionali', file: 'regionali.json', logo: 'altro.png' },
]

const abs = (file: string) => new URL(`${dir}${file}`, window.location.href).toString()

function view(file: string) {
  window.open(abs(file), '_blank', 'noopener,noreferrer')
}
async function save(file: string) {
  try {
    const res = await fetch(`${dir}${file}`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const url = URL.createObjectURL(await res.blob())
    const a = document.createElement('a')
    a.href = url
    a.download = file
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch (e) {
    console.error(e)
    alert('Impossibile scaricare il file in questo momento. Riprova più tardi.')
  }
}
async function copy(file: string) {
  try {
    await navigator.clipboard.writeText(abs(file))
    alert('Link copiato negli appunti.')
  } catch {
    alert(abs(file))
  }
}
function openInMiniTV(file: string) {
  window.open(`minitv://url=${encodeURIComponent(abs(file))}`, '_blank', 'noopener,noreferrer')
}

const btn = 'inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-4 text-base font-semibold text-fg transition hover:-translate-y-px'
</script>

<template>
  <div :style="{ '--accent': app.color }">
    <TopBar :links="[{ label: 'MiniTV', href: `${base}minitv/` }]" />

    <header class="mb-7 flex flex-col items-start gap-3.5">
      <img :src="app.icon" alt="Icona MiniTV" width="128" height="128"
        class="size-32 rounded-[30px] object-cover ring-1 ring-line" :style="{ boxShadow: `0 18px 50px ${app.color}73` }" />
      <h1 class="m-0 text-[clamp(28px,5vw,44px)] font-bold leading-[1.12] tracking-[-0.03em]">MiniTV – Playlist di esempio</h1>
      <p class="m-0 max-w-[62ch] text-[clamp(16px,2.6vw,19px)] text-muted">{{ lead }}</p>
      <RouterLink to="/minitv/crea-playlist" :class="btn + ' no-underline'">Crea la tua playlist</RouterLink>
    </header>

    <div class="flex flex-col gap-2">
      <section v-for="g in groups" :key="g.file"
        class="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-line bg-surface p-5 backdrop-blur-xl">
        <div class="flex items-center gap-3">
          <img :src="`${dir}${g.logo}`" :alt="g.name" class="w-16" />
          <span class="text-lg font-semibold">{{ g.name }}</span>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button type="button" :class="btn" :aria-label="`Apri ${g.file}`" @click="view(g.file)">
            <svg viewBox="0 0 24 24" fill="currentColor" class="size-5" aria-hidden="true"><path d="M12 5C5 5 2 12 2 12s3 7 10 7 10-7 10-7-3-7-10-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" /></svg>
            Vedi
          </button>
          <button type="button" :class="btn" :aria-label="`Scarica ${g.file}`" @click="save(g.file)">
            <svg viewBox="0 0 24 24" fill="currentColor" class="size-5" aria-hidden="true"><path d="M5 20h14v-2H5v2zm7-18-5 5h3v6h4V7h3l-5-5z" /></svg>
            Salva
          </button>
          <button type="button" :class="btn" :aria-label="`Copia link ${g.file}`" @click="copy(g.file)">
            <svg viewBox="0 0 24 24" fill="currentColor" class="size-5" aria-hidden="true"><path d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z" /></svg>
            Copia link
          </button>
          <button type="button" :class="btn" :aria-label="`Apri ${g.file} in MiniTV`" @click="openInMiniTV(g.file)">
            <img :src="`${dir}minitv.svg`" alt="" class="size-5" />
            Apri in MiniTV
          </button>
        </div>
      </section>
    </div>

    <SiteFooter owner="MiniTV" />
  </div>
</template>
