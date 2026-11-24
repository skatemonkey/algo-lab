<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ArrowUpRight, Braces, Palette } from '@lucide/vue'
import { algorithmQuestions } from '../questions'
import { algorithmPatterns } from '../patterns'

const questions = algorithmQuestions.map((question) => ({
  ...question,
  pattern: algorithmPatterns.find((pattern) => pattern.id === question.patternId),
}))
const patterns = algorithmPatterns.map((pattern) => ({
  ...pattern,
  questionCount: algorithmQuestions.filter((question) => question.patternId === pattern.id).length,
}))
</script>

<template>
  <main class="algorithms-page">
    <header class="algorithms-heading">
      <span class="module-icon" aria-hidden="true"><Braces :size="24" /></span>
      <h1>Algo Lab</h1>
      <p>Practice a question or explore a reusable pattern.</p>
    </header>

    <section class="question-library" aria-labelledby="questions-title">
      <header class="library-heading">
        <h2 id="questions-title">Questions</h2>
        <span class="catalog-count algo-mono">
          {{ algorithmQuestions.length }}
          {{ algorithmQuestions.length === 1 ? 'question' : 'questions' }}
        </span>
      </header>
      <ul class="catalog-list" aria-label="Algorithm questions">
        <li v-for="(question, index) in questions" :key="question.id">
          <RouterLink
            :to="{ name: question.routeName }"
            class="catalog-link"
            :aria-label="`Open ${question.title}`"
          >
            <span class="question-number algo-mono" aria-hidden="true">
              {{ String(index + 1).padStart(2, '0') }}
            </span>
            <div class="catalog-copy">
              <h3>{{ question.title }}</h3>
              <p>{{ question.summary }}</p>
            </div>
            <span v-if="question.pattern" class="question-topic">{{ question.pattern.title }}</span>
            <ArrowUpRight class="catalog-arrow" :size="18" aria-hidden="true" />
          </RouterLink>
        </li>
      </ul>
    </section>
    <section class="pattern-library" aria-labelledby="patterns-title">
      <header class="library-heading">
        <h2 id="patterns-title">Patterns</h2>
        <span class="catalog-count algo-mono">
          {{ patterns.length }} {{ patterns.length === 1 ? 'pattern' : 'patterns' }}
        </span>
      </header>
      <ul class="catalog-list" aria-label="Algorithm patterns">
        <li v-for="pattern in patterns" :key="pattern.id">
          <RouterLink
            :to="{ name: pattern.routeName }"
            class="catalog-link pattern-link"
            :aria-label="`Open ${pattern.title} pattern`"
          >
            <div class="pattern-mark" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div class="catalog-copy">
              <h3>{{ pattern.title }}</h3>
              <p>{{ pattern.summary }}</p>
            </div>
            <span class="catalog-count">
              {{ pattern.questionCount }}
              {{ pattern.questionCount === 1 ? 'question' : 'questions' }}
            </span>
            <ArrowUpRight class="catalog-arrow" :size="18" aria-hidden="true" />
          </RouterLink>
        </li>
      </ul>
    </section>
    <footer class="catalog-footer">
      <RouterLink :to="{ name: 'design' }" class="design-link">
        <Palette :size="15" aria-hidden="true" />
        Design
      </RouterLink>
    </footer>
  </main>
</template>

<style scoped>
.algorithms-page {
  max-width: var(--algo-library-width);
  margin: 0 auto;
  padding: var(--algo-space-12);
}
.module-icon {
  display: grid;
  place-items: center;
  width: var(--algo-space-12);
  height: var(--algo-space-12);
  border: 1px solid var(--algo-accent-line);
  border-radius: var(--algo-radius);
  color: var(--algo-accent);
  background: var(--algo-accent-soft);
  margin-bottom: var(--algo-space-6);
}
h1 {
  font-size: var(--algo-text-heading);
  font-weight: 520;
  line-height: 1.25;
  letter-spacing: -0.9px;
}
.algorithms-heading p {
  margin-top: var(--algo-space-3);
  color: var(--algo-secondary);
  font-size: var(--algo-text-body);
}
.catalog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--algo-space-8);
}
.design-link {
  display: inline-flex;
  align-items: center;
  gap: var(--algo-space-2);
  color: var(--algo-secondary);
  font-size: var(--algo-text-base);
  text-decoration: none;
}
.design-link:hover {
  color: var(--algo-accent);
}
.question-library,
.pattern-library {
  margin-top: var(--algo-space-12);
}
.library-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--algo-space-4);
}
.library-heading h2 {
  font-size: var(--algo-text-body);
  font-weight: 500;
}
.catalog-count {
  color: var(--algo-muted);
  font-size: var(--algo-text-sm);
}
.catalog-list {
  padding: 0;
  margin: 0;
  list-style: none;
  border: 1px solid var(--algo-line);
  border-radius: var(--algo-radius-lg);
  background: var(--algo-paper);
}
.catalog-list li + li {
  border-top: 1px solid var(--algo-line);
}
.catalog-link {
  display: flex;
  align-items: center;
  gap: var(--algo-space-6);
  padding: var(--algo-space-6);
  color: inherit;
  border-radius: var(--algo-radius-lg);
  text-decoration: none;
  transition: background var(--algo-motion);
}
.catalog-link:hover {
  background: var(--algo-accent-soft);
}
.question-number {
  color: var(--algo-muted);
  font-size: var(--algo-text-sm);
}
.catalog-copy {
  flex: 1;
  min-width: 0;
}
.catalog-copy h3 {
  font-size: var(--algo-text-body);
  font-weight: 500;
}
.catalog-copy p {
  margin-top: var(--algo-space-1);
  color: var(--algo-secondary);
  font-size: var(--algo-text-base);
}
.question-topic {
  padding: var(--algo-space-1) var(--algo-space-2);
  border: 1px solid var(--algo-line);
  border-radius: var(--algo-radius-sm);
  color: var(--algo-secondary);
  font-size: var(--algo-text-sm);
  white-space: nowrap;
}
.catalog-arrow {
  color: var(--algo-muted);
}
.catalog-link:hover :is(h3, .catalog-arrow) {
  color: var(--algo-accent);
}
.pattern-mark {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--algo-space-1);
  width: var(--algo-space-10);
  height: var(--algo-space-10);
  flex-shrink: 0;
}
.pattern-mark span {
  height: var(--algo-space-1);
  width: 100%;
  border-radius: var(--algo-radius-sm);
  background: var(--algo-accent-line);
}
.pattern-mark span:nth-child(2) {
  width: 50%;
  background: var(--algo-accent);
  opacity: 0.65;
}
.pattern-mark span:nth-child(3) {
  width: 25%;
  background: var(--algo-accent);
}
</style>
