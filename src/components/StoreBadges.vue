<script setup lang="ts">
import type { Store } from '../data/apps'
import appStore from '../assets/badges/appStore.svg'
import macAppStore from '../assets/badges/macAppStore.svg'
import androidApk from '../assets/badges/androidapk.svg'
defineProps<{ stores: Store[] }>()
const badge = {
  ios: { src: appStore, alt: 'Scarica da App Store', w: 180 },
  mac: { src: macAppStore, alt: 'Scarica da Mac App Store', w: 230 },
  apk: { src: androidApk, alt: 'Scarica APK per Android', w: 230 },
} as const
</script>

<template>
  <div class="mt-6 flex flex-wrap items-center gap-3">
    <template v-for="s in stores" :key="s.kind + s.href">
      <a v-if="s.kind !== 'web'" :href="s.href" target="_blank" rel="noopener noreferrer" :aria-label="badge[s.kind].alt">
        <img :src="badge[s.kind].src" :alt="badge[s.kind].alt" :style="{ width: badge[s.kind].w + 'px' }" />
      </a>
      <a v-else :href="s.href" target="_blank" rel="noopener noreferrer"
        class="inline-flex rounded-xl bg-accent px-4 py-2.5 text-base font-semibold !text-white no-underline transition hover:-translate-y-px">Apri l'app web</a>
    </template>
  </div>
</template>
