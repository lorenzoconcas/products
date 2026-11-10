<script setup lang="ts">
import { CONTACT_EMAIL } from '../data/apps'
defineProps<{ name: string }>()
</script>

<template>
  <section id="support" class="rounded-3xl border border-line bg-surface p-6 backdrop-blur-xl">
    <h2 class="mb-2 mt-0 text-2xl font-bold tracking-tight">Supporto</h2>
    <p class="m-0">Per assistenza o domande relative all'app <strong>{{ name }}</strong>, puoi contattarci via email all'indirizzo: <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>.</p>
    <p class="mb-6 mt-2 text-muted">Risponderemo alle tue richieste il prima possibile.</p>
    <h2 class="mb-2 mt-0 text-2xl font-bold tracking-tight">Support</h2>
    <p class="m-0">For help or questions regarding <strong>{{ name }}</strong>, please contact us by email at: <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>.</p>
    <p class="mb-0 mt-2 text-muted">We will reply to your request as soon as possible.</p>
  </section>
</template>
