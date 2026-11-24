<script setup lang="ts">
import { onMounted, ref } from 'vue'

const families = [
  {
    name: 'Blue · Interaction',
    description: 'Current code, inspected values and controls.',
    tokens: [
      { name: 'accent', use: 'Primary emphasis' },
      { name: 'accent-hover', use: 'Primary button hover' },
      { name: 'accent-soft', use: 'Gentle highlight' },
      { name: 'accent-line', use: 'Outlines and stronger fills' },
    ],
  },
  {
    name: 'Muted violet · Patterns',
    description: 'The pattern that guides the approach.',
    tokens: [
      { name: 'pattern', use: 'Symbol and accent rail' },
      { name: 'pattern-fill', use: 'Symbol background' },
      { name: 'pattern-soft', use: 'Heading fade' },
    ],
  },
  {
    name: 'Amber · Computed values',
    description: 'Assignment results beside the pseudocode.',
    tokens: [
      { name: 'result', use: 'Value text' },
      { name: 'result-soft', use: 'Value background' },
      { name: 'result-line', use: 'Value border' },
    ],
  },
  {
    name: 'Green · Answers & selection',
    description: 'Saved answers, true results and active rules.',
    tokens: [
      { name: 'success', use: 'Answer and success text' },
      { name: 'success-soft', use: 'Answer background' },
      { name: 'success-line', use: 'Answer border' },
      { name: 'selected-soft', use: 'Active rule fill', alias: 'success-soft' },
      { name: 'selected-line', use: 'Active rule border', alias: 'success-line' },
    ],
  },
  {
    name: 'Red · Errors',
    description: 'Invalid inputs and failed comparisons.',
    tokens: [{ name: 'error', use: 'Error text and markers' }],
  },
  {
    name: 'Neutrals · Structure',
    description: 'Text, backgrounds and separators.',
    tokens: [
      { name: 'ink', use: 'Primary text' },
      { name: 'secondary', use: 'Supporting text and arrows' },
      { name: 'muted', use: 'Captions and indices' },
      { name: 'canvas', use: 'Page background' },
      { name: 'paper', use: 'Cards and labels' },
      { name: 'soft', use: 'Quiet fills' },
      { name: 'line', use: 'Borders and dividers' },
    ],
  },
]

const reference = ref<HTMLElement | null>(null)
const values = ref<Record<string, string>>({})
const tokenCount = families.reduce((total, family) => total + family.tokens.length, 0)

onMounted(() => {
  if (!reference.value) return
  const theme = getComputedStyle(reference.value)
  // Read the theme itself so the reference does not maintain a second palette.
  values.value = Object.fromEntries(
    families.flatMap((family) =>
      family.tokens.map((token) => [
        token.name,
        theme.getPropertyValue(`--algo-${token.name}`).trim().toUpperCase(),
      ]),
    ),
  )
})
</script>

<template>
  <section id="color-tokens" ref="reference" class="color-reference" aria-labelledby="colors-title">
    <header class="reference-heading">
      <div>
        <h2 id="colors-title">Color tokens</h2>
        <p>The colors used across the lessons, and the job each one does.</p>
      </div>
      <span class="token-count algo-mono">{{ tokenCount }} tokens</span>
    </header>

    <div class="color-families">
      <section v-for="family in families" :key="family.name" class="color-family">
        <header>
          <h3>{{ family.name }}</h3>
          <p>{{ family.description }}</p>
        </header>
        <ul class="token-list">
          <li v-for="token in family.tokens" :key="token.name" :data-color-token="token.name">
            <span
              class="color-swatch"
              :style="{ background: `var(--algo-${token.name})` }"
              aria-hidden="true"
            />
            <div class="token-copy">
              <code class="token-name">--algo-{{ token.name }}</code>
              <span class="token-use">{{ token.use }}</span>
              <span v-if="token.alias" class="token-alias">Uses {{ token.alias }}</span>
            </div>
            <code class="color-value">{{ values[token.name] }}</code>
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>

<style scoped>
.color-reference {
  margin-top: var(--algo-space-12);
  scroll-margin-top: var(--algo-space-8);
}
.reference-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--algo-space-4);
  margin-bottom: var(--algo-space-4);
}
.reference-heading h2 {
  font-size: var(--algo-text-body);
  font-weight: 500;
}
.reference-heading p,
.color-family p {
  margin: var(--algo-space-1) 0 0;
  color: var(--algo-secondary);
  font-size: var(--algo-text-sm);
}
.token-count {
  color: var(--algo-muted);
  font-size: var(--algo-text-sm);
  white-space: nowrap;
}
.color-families {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: start;
  gap: var(--algo-space-3);
}
.color-family {
  padding: var(--algo-space-4);
  border: 1px solid var(--algo-line);
  border-radius: var(--algo-radius);
  background: var(--algo-paper);
}
.color-family h3 {
  margin: 0;
  font-size: var(--algo-text-base);
  font-weight: 600;
}
.token-list {
  display: grid;
  gap: var(--algo-space-3);
  padding: 0;
  margin: var(--algo-space-4) 0 0;
  list-style: none;
}
.token-list li {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: start;
  gap: var(--algo-space-2);
}
.color-swatch {
  width: 24px;
  height: 28px;
  margin-top: 2px;
  border-radius: var(--algo-radius-sm);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--algo-ink) 10%, transparent);
}
.token-copy {
  display: grid;
  min-width: 0;
  gap: 2px;
}
.token-name,
.color-value {
  font: var(--algo-text-xs) / 1.5 var(--algo-mono);
  white-space: nowrap;
}
.color-value {
  color: var(--algo-secondary);
}
.token-use,
.token-alias {
  color: var(--algo-muted);
  font-size: var(--algo-text-xs);
  line-height: 1.5;
}
.token-alias {
  font-style: italic;
}
</style>
