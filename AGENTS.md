# Algo Lab

Algo Lab is a desktop application for learning data structures and algorithms through interactive questions, patterns, and visualizations.

## Structure

- `src/app/`: application entry, routes, and document titles.
- `src/modules/algorithms/`: lesson content, domain logic, components, styles, and module-owned tests.
- `src/shared/`: domain-neutral primitives and utilities.
- `tests/`: Node test and Playwright browser test entry points.

The catalog opens directly at `/`. Question routes use `/<question>` and pattern routes use `/patterns/<pattern>`. Questions and Patterns are separate sections, and each entry opens its own page. `questions.ts` and `patterns.ts` register the catalog and routes. Link questions to patterns by ID.

`pages/DesignPage.vue` owns the Design Playground at `/design`. Keep the color-token reference, accent choices, and motion preview there; the catalog footer provides its entry point.

## Implementation

- Preserve the existing desktop design. Do not add mobile or responsive layouts unless requested.
- Keep algorithm domain logic independent of Vue. The application renders deterministic execution frames.
- Keep the algorithm module independent of `app/`. The shared layer imports neither `app/` nor feature modules.
- `AlgorithmsModule.vue` owns the theme root and child route outlet. Keep pages in `pages/`.
- Use `LessonWalkthrough` for tabbed reasoning and `LessonWorkspace` for execution UI. Keep question content in `lessons/` and pattern content in `patterns/`.
- Centralize reusable design values and UI primitives. Scope algorithm styles and theme tokens under `.algorithms-module`.
- Keep this repository focused on algorithms. Trading and quantitative experiments belong in Quant Lab.
- Preserve unrelated edits when sharing a checkout. Store temporary work in `.codex_tmp/<task-name>/` and clean up only the current task's files.

## Keyboard navigation

| Keys                 | Action                                                    |
| -------------------- | --------------------------------------------------------- |
| Left / Right         | Previous / next visualization step; pauses playback.      |
| Space                | Play / pause.                                             |
| Shift + Left / Right | Cycle Approach, Reasoning, and Solution sections.         |
| [ / ]                | Previous / next question; stops at list boundaries.       |
| Shift + [ / ]        | Cycle steps in the visible Approach or Reasoning section. |

`useLessonKeyboard.ts` owns the bindings, input guards, and shortcut reference. Register playback and navigation through its composables; do not add page-level keyboard listeners.

Playback shortcuts apply only to the visible solution or pattern. Section and step shortcuts change selection without forcing tab focus. Section changes pause playback and preserve progress; hidden steps do not respond. Inputs, sliders, text editing, native button activation, and browser shortcuts retain their normal behavior. One key press performs one action.

## Validation

Use `npm test` for domain and playback behavior, `npm run build` for type checking and production output, and `npm run test:ui` for affected browser flows. Browser tests build and serve the production output on their own port, 5184. The development server uses 5174; manual production preview uses 4174.

For static hosting, publish `dist/` with an `index.html` fallback for application routes. Keep local preview and publication separate unless the user requests deployment.
