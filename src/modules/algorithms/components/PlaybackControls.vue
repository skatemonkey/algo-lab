<script setup lang="ts">
import { computed } from 'vue'
import { Pause, Play, RotateCcw, StepBack, StepForward } from '@lucide/vue'
import AlgoButton from './AlgoButton.vue'
const props = withDefaults(
  defineProps<{
    cursor: number
    last: number
    playing: boolean
    speed: number
    waiting?: boolean
    showTotal?: boolean
    compact?: boolean
    disabled?: boolean
  }>(),
  { waiting: false, showTotal: true, compact: false, disabled: false },
)
const emit = defineEmits<{
  toggle: []
  previous: []
  next: []
  reset: []
  seek: [index: number]
  'update:speed': [speed: number]
}>()
const progress = computed(() => (props.last > 0 ? props.cursor / props.last : 0))
</script>

<template>
  <div
    class="playback"
    :class="{ compact }"
    :inert="disabled"
    :aria-disabled="disabled || undefined"
    role="group"
    aria-label="Visualization playback"
  >
    <template v-if="compact">
      <AlgoButton
        icon
        variant="quiet"
        aria-label="Reset visualization"
        title="Reset"
        :disabled="cursor === 0 && !playing"
        @click="emit('reset')"
      >
        <RotateCcw :size="16" />
      </AlgoButton>
      <AlgoButton
        icon
        variant="quiet"
        aria-label="Previous step"
        title="Previous statement (←)"
        :disabled="cursor === 0"
        @click="emit('previous')"
      >
        <StepBack :size="17" />
      </AlgoButton>
      <AlgoButton
        icon
        variant="quiet"
        class="compact-play"
        :disabled="waiting"
        :aria-label="
          playing
            ? 'Pause visualization'
            : cursor === last
              ? 'Replay visualization'
              : 'Play visualization'
        "
        title="Play / pause (Space)"
        @click="emit('toggle')"
      >
        <Pause v-if="playing" :size="17" />
        <Play v-else :size="17" />
      </AlgoButton>
      <AlgoButton
        icon
        variant="quiet"
        aria-label="Next step"
        title="Next statement (→)"
        :disabled="cursor === last"
        @click="emit('next')"
      >
        <StepForward :size="17" />
      </AlgoButton>
      <div class="compact-progress" :style="{ '--playback-progress': `${progress * 100}%` }">
        <span
          class="current-step algo-mono"
          data-testid="current-step"
          aria-hidden="true"
          :style="{
            left: `calc(${progress * 100}% + ${0.5 - progress} * var(--playback-thumb-size))`,
          }"
        >
          {{ cursor + 1 }}
        </span>
        <input
          class="timeline"
          aria-label="Playback position"
          :aria-valuetext="`Step ${cursor + 1} of ${last + 1}`"
          type="range"
          min="0"
          :max="last"
          :value="cursor"
          @input="emit('seek', Number(($event.target as HTMLInputElement).value))"
        />
      </div>
      <span
        class="total-steps algo-mono"
        data-testid="total-steps"
        title="Total steps"
        :aria-label="`${last + 1} steps`"
      >
        {{ last + 1 }}
      </span>
    </template>
    <template v-else>
      <div class="playback-main">
        <div class="playback-buttons">
          <AlgoButton
            icon
            variant="quiet"
            aria-label="Previous step"
            title="Previous statement (←)"
            :disabled="cursor === 0"
            @click="emit('previous')"
          >
            <StepBack :size="17" />
          </AlgoButton>
          <AlgoButton
            variant="primary"
            :disabled="waiting"
            :aria-label="
              playing
                ? 'Pause visualization'
                : cursor === last && !waiting
                  ? 'Replay visualization'
                  : 'Play visualization'
            "
            title="Play / pause (Space)"
            @click="emit('toggle')"
          >
            <Pause v-if="playing" :size="14" fill="currentColor" />
            <RotateCcw v-else-if="cursor === last && !waiting" :size="14" />
            <Play v-else :size="14" fill="currentColor" />
            {{ playing ? 'Pause' : cursor === last && !waiting ? 'Replay' : 'Play' }}
          </AlgoButton>
          <AlgoButton
            icon
            variant="quiet"
            aria-label="Next step"
            title="Next statement (→)"
            :disabled="cursor === last"
            @click="emit('next')"
          >
            <StepForward :size="17" />
          </AlgoButton>
        </div>
        <div class="playback-meta">
          <span class="step-count algo-mono">
            <span v-if="!showTotal">Step</span>
            {{ cursor + 1 }}
            <span v-if="showTotal">/ {{ last + 1 }}</span>
          </span>
          <label>
            <span class="algo-sr-only">Playback speed</span>
            <select
              :value="speed"
              @change="emit('update:speed', Number(($event.target as HTMLSelectElement).value))"
            >
              <option :value="0.5">0.5×</option>
              <option :value="1">1×</option>
              <option :value="2">2×</option>
            </select>
          </label>
          <AlgoButton
            icon
            variant="quiet"
            aria-label="Reset visualization"
            title="Reset"
            :disabled="cursor === 0 && !playing"
            @click="emit('reset')"
          >
            <RotateCcw :size="15" />
          </AlgoButton>
        </div>
      </div>
      <input
        class="timeline"
        aria-label="Playback position"
        type="range"
        min="0"
        :max="last"
        :value="cursor"
        @input="emit('seek', Number(($event.target as HTMLInputElement).value))"
      />
    </template>
  </div>
</template>

<style scoped>
.playback {
  padding: var(--algo-space-5) var(--algo-space-8) var(--algo-space-6);
  border-top: 1px solid var(--algo-line);
}
.playback-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--algo-space-4);
}
.playback-buttons,
.playback-meta {
  display: flex;
  align-items: center;
  gap: var(--algo-space-2);
}
.playback-meta {
  gap: var(--algo-space-4);
}
.step-count {
  color: var(--algo-ink);
  font-size: var(--algo-text-sm);
  white-space: nowrap;
}
.step-count > span {
  color: var(--algo-muted);
}
.playback-meta select {
  background: var(--algo-paper);
  color: var(--algo-secondary);
  font: var(--algo-text-sm) var(--algo-mono);
  border: 0;
  padding: 4px 0;
  cursor: pointer;
}
.timeline {
  display: block;
  width: 100%;
  height: 3px;
  margin: var(--algo-space-5) 0 0;
  accent-color: var(--algo-accent);
  cursor: pointer;
}
.playback.compact {
  --playback-thumb-size: 11px;
  display: flex;
  align-items: center;
  gap: var(--algo-space-2);
  padding: var(--algo-space-3) var(--algo-space-6);
  border: 0;
}
.compact[aria-disabled='true'] {
  opacity: 0.4;
}
.compact > button {
  flex: 0 0 32px;
  width: 32px;
}
.compact .compact-play {
  color: var(--algo-accent);
  background: var(--algo-accent-soft);
  border-radius: 50%;
}
.compact-progress {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 32px;
  height: 38px;
  margin-left: var(--algo-space-3);
}
.current-step {
  position: absolute;
  top: -4px;
  transform: translateX(-50%);
  color: var(--algo-accent);
  font-size: var(--algo-text-xs);
  line-height: 1;
  pointer-events: none;
}
.compact .timeline {
  appearance: none;
  width: 100%;
  height: 28px;
  margin: 0;
  background: transparent;
}
.compact .timeline::-webkit-slider-runnable-track {
  height: 3px;
  border-radius: 3px;
  background: linear-gradient(
    to right,
    var(--algo-accent) 0 var(--playback-progress),
    var(--algo-line) var(--playback-progress) 100%
  );
}
.compact .timeline::-webkit-slider-thumb {
  appearance: none;
  width: var(--playback-thumb-size);
  height: var(--playback-thumb-size);
  margin-top: -4px;
  border: 0;
  border-radius: 50%;
  background: var(--algo-accent);
}
.compact .timeline::-moz-range-track {
  height: 3px;
  background: var(--algo-line);
  border: 0;
  border-radius: 3px;
}
.compact .timeline::-moz-range-progress {
  height: 3px;
  background: var(--algo-accent);
}
.compact .timeline::-moz-range-thumb {
  width: var(--playback-thumb-size);
  height: var(--playback-thumb-size);
  border: 0;
  border-radius: 50%;
  background: var(--algo-accent);
}
.total-steps {
  min-width: 2ch;
  color: var(--algo-muted);
  font-size: var(--algo-text-xs);
  text-align: right;
}
</style>
