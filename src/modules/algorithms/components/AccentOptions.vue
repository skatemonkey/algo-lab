<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowRight } from '@lucide/vue'
import AlgoButton from './AlgoButton.vue'
import LessonInspector from './LessonInspector.vue'
import PointerSequence from './PointerSequence.vue'

const options = [
  {
    id: 'original-blue',
    name: 'Original blue',
    colors: { accent: '#425EE8', hover: '#304ACB', soft: '#F0F3FF', line: '#CBD4FC' },
  },
  {
    id: 'charcoal',
    name: 'Warm charcoal',
    colors: { accent: '#55524E', hover: '#403D3A', soft: '#F3F2F0', line: '#D0CDC7' },
  },
  {
    id: 'graphite',
    name: 'Graphite',
    colors: { accent: '#4E5055', hover: '#393B40', soft: '#F1F2F4', line: '#CBCDD2' },
  },
  {
    id: 'taupe',
    name: 'Taupe',
    colors: { accent: '#74675C', hover: '#5B5047', soft: '#F6F3EF', line: '#D8CFC4' },
  },
  {
    id: 'umber',
    name: 'Umber',
    colors: { accent: '#795B45', hover: '#604735', soft: '#F8F2EC', line: '#DDC8B6' },
  },
  {
    id: 'yellow',
    name: 'Yellow',
    colors: { accent: '#8B7300', hover: '#6E5B00', soft: '#FFFBE5', line: '#EFDE7A' },
  },
  {
    id: 'gold',
    name: 'Gold',
    colors: { accent: '#977008', hover: '#785806', soft: '#FFF8E8', line: '#E8CC84' },
  },
  {
    id: 'ochre',
    name: 'Ochre',
    colors: { accent: '#89691E', hover: '#6D5217', soft: '#FBF6E9', line: '#E1D0A0' },
  },
  {
    id: 'amber',
    name: 'Amber',
    colors: { accent: '#A0640E', hover: '#804F0B', soft: '#FFF6E7', line: '#EDC58A' },
  },
  {
    id: 'orange',
    name: 'Orange',
    colors: { accent: '#B45A18', hover: '#934811', soft: '#FFF4EB', line: '#EDBF99' },
  },
  {
    id: 'tangerine',
    name: 'Tangerine',
    colors: { accent: '#BA4F19', hover: '#983E12', soft: '#FFF2EA', line: '#F0B599' },
  },
  {
    id: 'terracotta',
    name: 'Muted terracotta',
    colors: { accent: '#9B563F', hover: '#804532', soft: '#FCF3EE', line: '#DFB8A6' },
  },
  {
    id: 'coral',
    name: 'Coral',
    colors: { accent: '#B85547', hover: '#944337', soft: '#FFF1EE', line: '#E9BBB3' },
  },
  {
    id: 'red',
    name: 'Red',
    colors: { accent: '#B34A42', hover: '#903B34', soft: '#FCF0EE', line: '#E8BDB7' },
  },
  {
    id: 'rose',
    name: 'Dusty rose',
    colors: { accent: '#A25570', hover: '#85445C', soft: '#FBF0F4', line: '#E2BBC8' },
  },
  {
    id: 'burgundy',
    name: 'Burgundy',
    colors: { accent: '#8B4656', hover: '#703744', soft: '#F9EFF2', line: '#DDBAC3' },
  },
  {
    id: 'magenta',
    name: 'Magenta',
    colors: { accent: '#A44780', hover: '#843866', soft: '#FBEFF7', line: '#E0B7D3' },
  },
  {
    id: 'lavender',
    name: 'Lavender',
    colors: { accent: '#7D68A6', hover: '#635284', soft: '#F5F1FA', line: '#D4C7E5' },
  },
  {
    id: 'plum',
    name: 'Muted plum',
    colors: { accent: '#805476', hover: '#66415F', soft: '#F7F0F7', line: '#D6BCD2' },
  },
  {
    id: 'violet',
    name: 'Muted violet',
    colors: { accent: '#79569C', hover: '#60437E', soft: '#F5F0FA', line: '#D4C0E7' },
  },
  {
    id: 'olive',
    name: 'Olive',
    colors: { accent: '#68713E', hover: '#505830', soft: '#F4F6ED', line: '#CDD3B2' },
  },
  {
    id: 'sage',
    name: 'Sage',
    colors: { accent: '#5F7B5C', hover: '#4B6248', soft: '#F1F6EF', line: '#CAD9C3' },
  },
  {
    id: 'forest',
    name: 'Forest green',
    colors: { accent: '#376D4B', hover: '#2B563B', soft: '#EFF7F1', line: '#B7D4BF' },
  },
  {
    id: 'jade',
    name: 'Jade',
    colors: { accent: '#307661', hover: '#255D4C', soft: '#EDF7F2', line: '#ADD4C0' },
  },
  {
    id: 'teal',
    name: 'Muted teal',
    colors: { accent: '#36766E', hover: '#285C56', soft: '#EFF7F5', line: '#B3D3CB' },
  },
  {
    id: 'turquoise',
    name: 'Turquoise',
    colors: { accent: '#087D78', hover: '#05615D', soft: '#EAF9F6', line: '#98D6CD' },
  },
  {
    id: 'petrol',
    name: 'Petrol',
    colors: { accent: '#176B80', hover: '#115366', soft: '#EDF7FA', line: '#A9D1DD' },
  },
  {
    id: 'cyan',
    name: 'Deep cyan',
    colors: { accent: '#087995', hover: '#055D75', soft: '#EAF8FC', line: '#99D5E5' },
  },
  {
    id: 'ocean',
    name: 'Ocean blue',
    colors: { accent: '#086DA6', hover: '#065583', soft: '#EBF6FE', line: '#A1CEED' },
  },
  {
    id: 'indigo',
    name: 'Indigo',
    colors: { accent: '#5145CD', hover: '#4035A8', soft: '#F1EFFE', line: '#C4BDF3' },
  },
  {
    id: 'iris',
    name: 'Iris',
    colors: { accent: '#7040C8', hover: '#5830A2', soft: '#F5EFFE', line: '#D1B8F0' },
  },
  {
    id: 'purple',
    name: 'Royal purple',
    colors: { accent: '#873BB5', hover: '#6C2D94', soft: '#F8EFFD', line: '#DEB9EE' },
  },
  {
    id: 'fuchsia',
    name: 'Fuchsia',
    colors: { accent: '#A21CAF', hover: '#81148E', soft: '#FCEFFD', line: '#E7B4EC' },
  },
  {
    id: 'periwinkle',
    name: 'Periwinkle',
    colors: { accent: '#6465E9', hover: '#4D4FCA', soft: '#F1F2FF', line: '#C4C7FA' },
  },
  {
    id: 'bright-indigo',
    name: 'Bright indigo',
    colors: { accent: '#6652F5', hover: '#503DCE', soft: '#F2EFFF', line: '#C8BFFA' },
  },
  {
    id: 'electric-violet',
    name: 'Electric violet',
    colors: { accent: '#7C3AED', hover: '#6525CE', soft: '#F5F0FF', line: '#D4B9FA' },
  },
  {
    id: 'lilac',
    name: 'Lilac',
    colors: { accent: '#8D5BD0', hover: '#7443B4', soft: '#F7F1FD', line: '#DBC4F0' },
  },
  {
    id: 'amethyst',
    name: 'Amethyst',
    colors: { accent: '#9450D3', hover: '#783AB3', soft: '#F8F0FD', line: '#DFC0F1' },
  },
  {
    id: 'vivid-grape',
    name: 'Vivid grape',
    colors: { accent: '#9B28DE', hover: '#7C1BB7', soft: '#FAEFFE', line: '#E2B3F5' },
  },
  {
    id: 'electric-purple',
    name: 'Electric purple',
    colors: { accent: '#A321E0', hover: '#8416BA', soft: '#FBEFFE', line: '#E7B4F7' },
  },
  {
    id: 'bright-orchid',
    name: 'Bright orchid',
    colors: { accent: '#B22BC8', hover: '#9121A4', soft: '#FCEFFC', line: '#ECBCEC' },
  },
  {
    id: 'bright-magenta',
    name: 'Bright magenta',
    colors: { accent: '#BA21B2', hover: '#971890', soft: '#FDEFFC', line: '#EFAFE7' },
  },
  {
    id: 'berry-purple',
    name: 'Berry purple',
    colors: { accent: '#AE2A8E', hover: '#8C2072', soft: '#FCEFF8', line: '#E9B2D9' },
  },
]
const tones = [
  { key: 'accent', label: 'Main' },
  { key: 'hover', label: 'Hover' },
  { key: 'soft', label: 'Background' },
  { key: 'line', label: 'Border' },
] as const
const colorRoles = [
  { name: 'Active', color: 'accent', fill: 'accent-soft' },
  { name: 'Answer', color: 'success', fill: 'success-soft' },
  { name: 'Error', color: 'error', fill: 'paper' },
  { name: 'Value', color: 'result', fill: 'result-soft' },
  { name: 'Pattern', color: 'pattern', fill: 'pattern-soft' },
  { name: 'Neutral', color: 'secondary', fill: 'soft' },
]

const selectedId = ref('original-blue')
const selected = computed(() => options.find((option) => option.id === selectedId.value)!)
const position = ref(1)
const values = [1, 3, 5]
function movePointer() {
  position.value = (position.value + 1) % values.length
}
</script>

<template>
  <section id="accent-options" class="accent-options" aria-labelledby="accent-options-title">
    <header class="options-heading">
      <h2 id="accent-options-title">Accent options</h2>
      <p>Select a color to compare it with the lesson colors.</p>
    </header>

    <fieldset class="accent-picker">
      <legend class="algo-sr-only">Preview accent color</legend>
      <label
        v-for="option in options"
        :key="option.id"
        class="accent-choice"
        :style="{
          '--choice-color': option.colors.accent,
          '--choice-soft': option.colors.soft,
          '--choice-line': option.colors.line,
        }"
      >
        <input v-model="selectedId" type="radio" name="accent-color" :value="option.id" />
        <span>{{ option.name }}</span>
      </label>
    </fieldset>

    <article
      class="accent-preview"
      aria-labelledby="accent-preview-title"
      :style="{
        '--algo-accent': selected.colors.accent,
        '--algo-accent-hover': selected.colors.hover,
        '--algo-accent-soft': selected.colors.soft,
        '--algo-accent-line': selected.colors.line,
      }"
    >
      <header class="preview-heading">
        <h3 id="accent-preview-title">{{ selected.name }}</h3>
        <AlgoButton variant="primary" @click="movePointer">
          Try movement
          <ArrowRight :size="14" aria-hidden="true" />
        </AlgoButton>
      </header>

      <div class="preview-content">
        <PointerSequence
          class="pointer-preview"
          compact
          :values="values"
          :pointers="[{ name: 'mid', index: position, updated: true, highlighted: true }]"
          :highlighted="[position]"
        />
        <LessonInspector
          class="code-preview"
          title="Code preview"
          :lesson="{
            pseudocode: [
              { id: 'assign', text: `mid ← ${position}`, indent: 0 },
              { id: 'read', text: 'value ← A[mid]', indent: 0 },
            ],
          }"
          :execution="{
            instruction: 'assign',
            outcome: null,
            assignments: [{ name: 'mid', value: position }],
          }"
          announcement="Color preview"
        />
      </div>

      <div class="color-roles" role="group" aria-label="Color roles">
        <span class="roles-label">Compare</span>
        <span
          v-for="role in colorRoles"
          :key="role.name"
          class="role-sample"
          :data-color-role="role.name"
          :style="{
            '--role-color': `var(--algo-${role.color})`,
            '--role-fill': `var(--algo-${role.fill})`,
          }"
        >
          <span class="role-dot" aria-hidden="true" />
          {{ role.name }}
        </span>
      </div>

      <dl class="palette-tones">
        <div v-for="tone in tones" :key="tone.key">
          <dt>{{ tone.label }}</dt>
          <dd>
            <span :style="{ background: selected.colors[tone.key] }" aria-hidden="true" />
            <code>{{ selected.colors[tone.key] }}</code>
          </dd>
        </div>
      </dl>
    </article>
  </section>
</template>

<style scoped>
.accent-options {
  margin-top: var(--algo-space-12);
  scroll-margin-top: var(--algo-space-8);
}
.options-heading {
  margin-bottom: var(--algo-space-4);
}
.options-heading h2 {
  font-size: var(--algo-text-body);
  font-weight: 500;
}
.options-heading p {
  margin: var(--algo-space-1) 0 0;
  color: var(--algo-secondary);
  font-size: var(--algo-text-sm);
}
.accent-picker {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: var(--algo-space-2);
  padding: 0;
  margin: 0 0 var(--algo-space-4);
  border: 0;
}
.accent-choice {
  display: flex;
  align-items: center;
  gap: var(--algo-space-2);
  min-height: 36px;
  padding: var(--algo-space-2) var(--algo-space-3);
  border: 1px solid var(--algo-line);
  border-radius: var(--algo-radius-sm);
  background: var(--algo-paper);
  color: var(--algo-secondary);
  font-size: var(--algo-text-sm);
  cursor: pointer;
}
.accent-choice:hover {
  border-color: var(--choice-line);
}
.accent-choice:has(input:checked) {
  border-color: var(--choice-line);
  background: var(--choice-soft);
  color: var(--algo-ink);
}
.accent-choice input {
  appearance: none;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  margin: 0;
  border: 1px solid var(--choice-color);
  border-radius: 50%;
  background: var(--choice-color);
  cursor: inherit;
}
.accent-choice input:checked {
  box-shadow: inset 0 0 0 3px var(--algo-paper);
}
.accent-preview {
  display: grid;
  gap: var(--algo-space-3);
  min-width: 0;
  padding: var(--algo-space-4);
  border: 1px solid var(--algo-line);
  border-radius: var(--algo-radius);
  background: var(--algo-paper);
}
.preview-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--algo-space-3);
}
.preview-heading h3 {
  margin: 0;
  font-size: var(--algo-text-base);
  font-weight: 600;
}
.preview-content {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: center;
  gap: var(--algo-space-8);
}
.pointer-preview.pointer-visualization.compact {
  padding: 0;
}
.pointer-preview :deep(.sequence-stage) {
  padding: 50px 0 0;
}
.pointer-preview :deep(.sequence-cell) {
  height: 40px;
}
.pointer-preview :deep(.prefix-track) {
  display: none;
}
.code-preview {
  padding: 0;
  border: 0;
}
.code-preview :deep(.solution-heading) {
  display: none;
}
.color-roles {
  display: flex;
  align-items: center;
  gap: var(--algo-space-2);
  font-size: var(--algo-text-sm);
}
.roles-label {
  margin-right: var(--algo-space-1);
  color: var(--algo-muted);
}
.role-sample {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: var(--algo-space-1) var(--algo-space-2);
  border-radius: var(--algo-radius-sm);
  background: var(--role-fill);
  color: var(--role-color);
}
.role-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}
.palette-tones {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--algo-space-3);
  margin: var(--algo-space-1) 0 0;
}
.palette-tones dt {
  color: var(--algo-muted);
  font-size: var(--algo-text-xs);
}
.palette-tones dd {
  display: grid;
  gap: var(--algo-space-1);
  margin: var(--algo-space-1) 0 0;
}
.palette-tones dd span {
  height: 8px;
  border-radius: 3px;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--algo-ink) 8%, transparent);
}
.palette-tones code {
  color: var(--algo-secondary);
  font: var(--algo-text-xs) / 1.5 var(--algo-mono);
}
</style>
