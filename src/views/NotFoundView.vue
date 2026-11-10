<script setup lang="ts">
import { useHead } from '@unhead/vue'
useHead({ title: 'Pagina non trovata – Lorenzo Concas', meta: [{ name: 'robots', content: 'noindex' }] })
</script>

<template>
  <header class="py-24 text-center">
    <h1 class="m-0 text-7xl font-bold tracking-tight">404</h1>
    <p class="mt-3 text-lg text-muted">Questa pagina non esiste.</p>
    <RouterLink to="/" class="mt-6 inline-flex rounded-xl bg-accent px-4 py-2.5 font-semibold !text-white no-underline">Torna alla home</RouterLink>
  </header>
</template>
