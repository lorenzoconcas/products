<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Aurora from './components/vuebits/Aurora.vue'
import { apps } from './data/apps'

const route = useRoute()
const mounted = ref(false) // WebGL solo lato client
onMounted(() => (mounted.value = true))
const stops = computed<string[]>(() => {
  const app = apps.find((a) => route.path.replace(/\/$/, '') === `/${a.slug}`)
  return app
    ? [app.color, '#0b1020', app.color]
    : ['#ef4d44', '#3b9cf0', '#3aa384']
})
</script>

<template>
  <div class="fixed inset-0 -z-10 bg-bg" aria-hidden="true">
    <div v-if="mounted" class="size-full" style="opacity: var(--aurora-opacity)">
        <Aurora :key="route.path" :color-stops="stops" :amplitude="1.1" :blend="0.6" :speed="0.6" />
    </div>
  </div>
  <div class="mx-auto min-h-screen max-w-[920px] px-5 pb-16 pt-6">
    <router-view />
  </div>
</template>
