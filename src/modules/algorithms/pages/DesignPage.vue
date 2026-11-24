<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ArrowLeft } from '@lucide/vue'
import ColorTokenReference from '../components/ColorTokenReference.vue'
import AccentOptions from '../components/AccentOptions.vue'
</script>

<template>
  <main class="design-page">
    <RouterLink :to="{ name: 'algorithms' }" class="back-link">
      <ArrowLeft :size="16" aria-hidden="true" />
      Back to Algo Lab
    </RouterLink>

    <header class="design-heading">
      <h1>Design Playground</h1>
      <p>Inspect the color tokens and try accent colors in context.</p>
    </header>

    <ColorTokenReference />
    <AccentOptions />
  </main>
</template>

<style scoped>
.design-page {
  max-width: var(--algo-library-width);
  margin: 0 auto;
  padding: var(--algo-space-12);
}
.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--algo-space-2);
  padding-block: var(--algo-space-2);
  color: var(--algo-secondary);
  font-size: var(--algo-text-base);
  text-decoration: none;
}
.back-link:hover {
  color: var(--algo-accent);
}
.design-heading {
  margin-top: var(--algo-space-8);
}
h1 {
  font-size: var(--algo-text-heading);
  font-weight: 520;
  line-height: 1.25;
  letter-spacing: -0.9px;
}
.design-heading p {
  margin-top: var(--algo-space-3);
  color: var(--algo-secondary);
  font-size: var(--algo-text-body);
}
</style>
