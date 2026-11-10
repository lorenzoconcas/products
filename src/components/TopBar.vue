<script setup lang="ts">
defineProps<{ back?: boolean; links: { label: string; href: string }[] }>()
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3 pb-7 pt-2 text-[15px]">
    <RouterLink to="/" class="font-bold tracking-tight !text-fg no-underline">
      {{ back ? '← Lorenzo Concas' : 'Lorenzo Concas' }}
    </RouterLink>
    <nav class="flex flex-wrap gap-5">
      <a v-for="l in links" :key="l.href" :href="l.href" class="!text-muted no-underline transition hover:!text-fg">{{ l.label }}</a>
    </nav>
  </div>
</template>
