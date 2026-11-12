<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { cardStyle, initials, isFullBleed, isHttpUrl, isLogoUrl, isRadio, type MiniTVEntry } from '../lib/minitv-playlist'

const props = defineProps<{ entry: MiniTVEntry; baseUrl?: string }>()

const style = computed(() => cardStyle(props.entry))
const radio = computed(() => isRadio(props.entry))
const name = computed(() => props.entry.name?.trim() ?? '')

// logo relativo: si risolve rispetto all'indirizzo della playlist (se noto)
const logoSrc = computed(() => {
  const l = props.entry.logoURL?.trim()
  if (!l || !isLogoUrl(l)) return ''
  if (isHttpUrl(l)) return l
  if (!props.baseUrl) return ''
  try { return new URL(l, props.baseUrl).toString() } catch { return '' }
})

const status = ref<'none' | 'ok' | 'error'>('none')
const ratioFull = ref(false)
watch(logoSrc, (src) => {
  status.value = 'none'
  if (!src || typeof Image === 'undefined') return
  const img = new Image()
  img.onload = () => {
    if (src !== logoSrc.value) return
    ratioFull.value = isFullBleed(img.naturalWidth, img.naturalHeight)
    status.value = 'ok'
  }
  img.onerror = () => { if (src === logoSrc.value) status.value = 'error' }
  img.src = src
}, { immediate: true })

const showTitle = computed(() => !props.entry.hideTitle && !!name.value)
</script>

<template>
  <div class="relative aspect-[1.6] w-full overflow-hidden rounded-[14px] shadow-md"
    :style="{ background: `linear-gradient(135deg, ${style.from}, ${style.to})`, color: style.dark ? 'rgba(0,0,0,.85)' : '#fff' }"
    role="img" :aria-label="name || 'Scheda senza nome'">
    <img v-if="status === 'ok'" :src="logoSrc" alt=""
      class="absolute inset-0 size-full"
      :class="ratioFull ? 'object-cover' : 'object-contain'"
      :style="ratioFull ? undefined : { padding: `12px 12px ${showTitle ? 34 : 12}px` }" />
    <div v-else class="absolute inset-0 flex flex-col items-center justify-center gap-1">
      <span class="text-[clamp(28px,6vw,44px)] font-extrabold leading-none">{{ initials(name) }}</span>
      <svg v-if="radio" viewBox="0 0 24 24" class="size-5 opacity-60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="2" /><path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8" />
      </svg>
    </div>
    <div v-if="showTitle" class="absolute inset-x-0 bottom-0 truncate px-2.5 pb-1.5 pt-6 text-sm font-semibold text-white"
      style="background: linear-gradient(to top, rgba(0,0,0,.65), transparent)">{{ name }}</div>
  </div>
</template>
