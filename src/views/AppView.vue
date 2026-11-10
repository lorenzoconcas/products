<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import TopBar from '../components/TopBar.vue'
import SiteFooter from '../components/SiteFooter.vue'
import SupportSection from '../components/SupportSection.vue'
import StoreBadges from '../components/StoreBadges.vue'
import MiniTvExtras from '../components/MiniTvExtras.vue'
import SpotlightCard from '../components/vuebits/SpotlightCard.vue'
import { bySlug } from '../data/apps'

const props = defineProps<{ slug: string }>()
const app = computed(() => bySlug(props.slug))
const route = useRoute()
const router = useRouter()

useHead(() => ({
  title: `${app.value.title}`,
  meta: [
    { name: 'description', content: app.value.lead },
    { property: 'og:title', content: app.value.title },
    { property: 'og:description', content: app.value.lead },
    { name: 'theme-color', content: '#0b1020' },
  ],
  link: [{ rel: 'icon', href: app.value.icon }],
}))

const multi = computed(() => app.value.privacy.length > 1)
const lang = ref(app.value.privacy[0].lang)
const privacyRef = ref<HTMLElement | null>(null)

function syncFromHash() {
  const m = /^#privacy-(\w+)$/.exec(route.hash)
  if (m && app.value.privacy.some((p) => p.lang === m[1])) lang.value = m[1]
  if (route.hash.startsWith('#privacy')) {
    nextTick(() => privacyRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
}
function pick(l: string) {
  lang.value = l
  router.replace({ hash: `#privacy-${l}` })
}
onMounted(syncFromHash)
watch(() => route.hash, syncFromHash)

const links = computed(() => [
  { label: 'Privacy', href: multi.value ? '#privacy-it' : '#privacy' },
  { label: 'Supporto', href: '#support' },
])
const card = 'rounded-3xl border border-line bg-surface p-6 backdrop-blur-xl'
</script>

<template>
  <div :style="{ '--accent': app.color }">
  <TopBar back :links="links" />

  <header class="mb-7 flex flex-col items-start gap-3.5">
    <img :src="app.icon" :alt="`Icona ${app.name}`" width="128" height="128"
      class="size-32 rounded-[30px] object-cover ring-1 ring-line" :style="{ boxShadow: `0 18px 50px ${app.color}73` }" />
    <h1 class="m-0 text-[clamp(28px,5vw,44px)] font-bold leading-[1.12] tracking-[-0.03em]">{{ app.title }}</h1>
    <p class="m-0 max-w-[62ch] text-[clamp(16px,2.6vw,19px)] text-muted">{{ app.lead }}</p>
    <p v-if="app.version" class="m-0 text-[15px] text-muted">Versione {{ app.version }}</p>
  </header>

  <div class="flex flex-col gap-5">
    <section v-if="slug === 'minitv'" :class="card" :style="{ background: `color-mix(in srgb, ${app.color} 12%, var(--surface))` }">
      <h2 class="m-0 text-2xl font-bold tracking-tight">Versione tvOS</h2>
      <p class="mb-0 mt-1.5 text-muted">La versione dedicata per Apple TV è in fase di sviluppo!</p>
      <p class="mb-0 mt-3 text-[15px] text-muted">Gli acquisti in-app saranno comuni e condivisi fra tutte le versioni</p>
    </section>

    <section :class="card">
      <div class="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
        <div v-for="f in app.features" :key="f.title" class="rounded-2xl border border-line bg-surface-2 px-4 py-3.5">
          <strong class="mb-1 block"><span class="mr-2 font-extrabold text-accent">✓</span>{{ f.title }}</strong>
          <span class="text-base text-muted">{{ f.text }}</span>
        </div>
      </div>
      <StoreBadges :stores="app.stores" />
      <MiniTvExtras v-if="slug === 'minitv'" />
      <p v-for="n in app.notes" :key="n" class="mb-0 mt-3 text-[15px] text-muted">{{ n }}</p>
    </section>

    <SpotlightCard v-if="!multi" id="privacy" ref="privacyRef" class-name="!rounded-3xl !p-6 border-line bg-surface backdrop-blur-xl" :spotlight-color="app.color + '30'">
      <h2 class="mt-0 text-2xl font-bold tracking-tight">Privacy Policy</h2>
      <div class="policy" v-html="app.privacy[0].html" />
    </SpotlightCard>

    <section v-else id="privacy" ref="privacyRef" :class="card">
      <div class="mb-2 flex flex-wrap gap-2" role="tablist" aria-label="Lingua">
        <button v-for="p in app.privacy" :key="p.lang" type="button" role="tab" :aria-selected="lang === p.lang"
          class="cursor-pointer rounded-full border px-3.5 py-1 text-[15px] font-medium transition"
          :class="lang === p.lang ? 'border-transparent text-white' : 'border-line bg-surface-2 text-muted hover:text-fg'"
          :style="lang === p.lang ? { background: app.color } : undefined" @click="pick(p.lang)">{{ p.label }}</button>
      </div>
      <div v-for="p in app.privacy" v-show="lang === p.lang" :id="`privacy-${p.lang}`" :key="p.lang" :lang="p.lang" role="tabpanel">
        <h2 class="mb-1 mt-4 text-2xl font-bold tracking-tight">{{ p.heading }}</h2>
        <div class="policy" v-html="p.html" />
      </div>
    </section>

    <SupportSection :name="app.name" />
  </div>

  <SiteFooter :owner="app.name" />
  </div>
</template>
