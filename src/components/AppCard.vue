<script setup lang="ts">
import SpotlightCard from './vuebits/SpotlightCard.vue'
import { privacyPath, type AppInfo } from '../data/apps'
defineProps<{ app: AppInfo }>()
</script>

<template>
  <SpotlightCard
    class-name="flex h-full flex-col gap-5 !rounded-3xl !p-6 border-line bg-bg/60 backdrop-blur-xl transition-transform duration-200 hover:-translate-y-1"
    :spotlight-color="app.color + '40'"
    :style="{ borderColor: `color-mix(in srgb, ${app.color} 30%, var(--border))` }"
  >
    <div class="flex items-center gap-4">
      <img :src="app.icon" :alt="`Icona ${app.name}`" width="84" height="84" class="size-[84px] flex-none rounded-[20px] object-cover ring-1 ring-line"
        :style="{ boxShadow: `0 12px 30px ${app.color}66` }" />
      <div>
        <h2 class="m-0 text-2xl font-bold tracking-tight">{{ app.name }}</h2>
        <div class="mt-2 flex flex-wrap gap-1.5">
          <span v-for="p in app.platforms" :key="p" class="rounded-full border px-2.5 py-0.5 text-[13px] font-medium"
            :style="{ background: `${app.color}24`, borderColor: `${app.color}4d` }">{{ p }}</span>
        </div>
      </div>
    </div>
    <p class="m-0 flex-1 text-muted">{{ app.summary }}</p>
    <div>
      <RouterLink :to="`/${app.slug}`" class="inline-flex rounded-xl px-4 py-2.5 text-base font-semibold !text-white no-underline shadow-lg transition hover:-translate-y-px"
        :style="{ background: app.color, boxShadow: `0 8px 20px ${app.color}66` }">Scopri l'app</RouterLink>
    </div>
    <div class="flex flex-wrap gap-x-[18px] gap-y-1 border-t border-line pt-3.5 text-[15px] font-medium">
      <a v-for="l in app.homeLinks" :key="l.href" :href="l.href" target="_blank" rel="noopener" class="!text-muted no-underline hover:!text-fg hover:underline">{{ l.label }}</a>
      <RouterLink :to="privacyPath(app)" class="!text-muted no-underline hover:!text-fg hover:underline">Privacy</RouterLink>
      <RouterLink :to="`/${app.slug}#support`" class="!text-muted no-underline hover:!text-fg hover:underline">Supporto</RouterLink>
    </div>
  </SpotlightCard>
</template>
