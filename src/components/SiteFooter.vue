<script setup lang="ts">
import { apps, CONTACT_EMAIL, privacyPath } from '../data/apps'
defineProps<{ owner?: string }>()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-12 flex flex-wrap justify-between gap-x-6 gap-y-3 border-t border-line pt-5 text-[15px] text-muted">
    <p class="m-0">© {{ year }} Lorenzo Concas{{ owner ? ` – ${owner}` : '' }}. Tutti i marchi appartengono ai rispettivi proprietari.</p>
    <nav class="flex flex-wrap gap-4">
      <RouterLink v-if="owner" to="/" class="!text-muted no-underline hover:!text-fg">Tutte le app</RouterLink>
      <RouterLink v-for="a in apps" :key="a.slug" :to="privacyPath(a)" class="!text-muted no-underline hover:!text-fg">Privacy {{ a.name }}</RouterLink>
      <a :href="`mailto:${CONTACT_EMAIL}`" class="!text-muted no-underline hover:!text-fg">Contatti</a>
    </nav>
  </footer>
</template>
