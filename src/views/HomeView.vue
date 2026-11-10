<script setup lang="ts">
import { useHead } from '@unhead/vue'
import TopBar from '../components/TopBar.vue'
import SiteFooter from '../components/SiteFooter.vue'
import AppCard from '../components/AppCard.vue'
import BlurText from '../components/vuebits/BlurText.vue'
import SpotlightCard from '../components/vuebits/SpotlightCard.vue'
import { apps, CONTACT_EMAIL, privacyPath } from '../data/apps'

const desc = 'Le app di Lorenzo Concas: MiniTV, RaceMap, CuraLink e Spese Immobili.'
useHead({
  title: 'Lorenzo Concas – App per iOS, macOS e Android',
  meta: [
    { name: 'description', content: desc },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'Lorenzo Concas – App' },
    { property: 'og:description', content: desc },
  ],
})
const links = [
  { label: 'App', href: '#app' },
  { label: 'Privacy', href: '#privacy' },
  { label: 'Contatti', href: '#contatti' },
]
const label = 'mb-3.5 mt-12 text-sm font-bold uppercase tracking-[0.12em] text-muted'
</script>

<template>
  <TopBar :links="links" />

  <header class="flex flex-col items-center pb-11 pt-8 text-center">
    <div class="mb-7 flex justify-center">
      <img v-for="(a, i) in apps" :key="a.slug" :src="a.icon" alt="" width="64" height="64"
        class="-ml-3.5 size-16 rounded-2xl border-[3px] border-bg object-cover shadow-xl first:ml-0"
        :style="{ transform: `translateY(${i % 2 ? 0 : 6}px) rotate(${i % 2 ? 4 : -4}deg)` }" />
    </div>
    <h1 class="m-0 text-[clamp(40px,9vw,76px)] font-bold leading-[1.1] tracking-[-0.035em]">
      <BlurText text="Lorenzo Concas" :delay="120" animate-by="words" direction="top" class-name="justify-center" />
    </h1>
    <p class="mt-2.5 text-lg text-muted">Sviluppatore di app</p>
  </header>

  <p id="app" :class="[label, '!mt-0']">App</p>
  <section class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] gap-[18px]">
    <AppCard v-for="a in apps" :key="a.slug" :app="a" />
  </section>

  <p id="privacy" :class="label">Privacy</p>
  <SpotlightCard class-name="!rounded-3xl border-line bg-surface backdrop-blur-xl">
    <p class="m-0">Informativa sulla privacy di ciascuna app:</p>
    <div class="mt-3 flex flex-wrap gap-3">
      <RouterLink v-for="a in apps" :key="a.slug" :to="privacyPath(a)"
        class="rounded-xl border border-line bg-surface px-4 py-2.5 font-semibold !text-fg no-underline transition hover:-translate-y-px">{{ a.name }}</RouterLink>
    </div>
  </SpotlightCard>

  <p id="contatti" :class="label">Contatti e supporto</p>
  <SpotlightCard class-name="!rounded-3xl border-line bg-surface backdrop-blur-xl">
    <p class="m-0">Domande, segnalazioni o richieste sui dati? Scrivimi a <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>.</p>
  </SpotlightCard>

  <SiteFooter />
</template>
