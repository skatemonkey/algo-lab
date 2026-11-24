# Algo Lab

A desktop workspace for learning data structures and algorithms through interactive questions and reusable patterns. Built with Vue 3, TypeScript, Vue Router, and Vite.

The catalog opens directly when the app starts. Each question combines an explanation with a step-by-step visualization, editable inputs, and synchronized pseudocode.

## Run

Use Node.js `^22.18.0` or `>=24.12.0`.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:5174/`. On Windows, double-click `start.bat` after installing dependencies. Algo Lab uses its own port so it can run alongside Quant Lab.

## Explore

| Area          | Questions and patterns                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Binary search | First true, first occurrence, first element at least equal to a target, integer square root, minimum of a rotated array, and mountain peak |
| Two pointers  | Remove duplicates, linked-list middle, and move zeros                                                                                      |
| Patterns      | Binary search, linked to its related questions                                                                                             |

The catalog opens directly at `/`. Each question has its own `/<question>` path, such as `/binary-search` or `/move-zeros`. Reusable patterns use `/patterns/<pattern>`, including `/patterns/binary-search`.

The Design Playground at `/design` contains the color-token reference, accent choices, and motion preview. Open it from the catalog footer.

Playback supports stepping, rewinding, scrubbing, and speed changes. Question inputs and presets let you examine edge cases. Explanations and keyboard shortcuts remain local to the active lesson.

The interface is designed for desktop windows at least 1280px wide. Narrower windows scroll horizontally.

## Check and build

```sh
npm test          # Algorithm and playback tests
npm run build    # Type checking and production output in dist/
npm run test:ui  # Build, then test the production output in a browser
npm run preview  # View the latest build at http://127.0.0.1:4174/
```

Browser tests use installed Google Chrome by default. Set `PLAYWRIGHT_CHANNEL=msedge` to use Microsoft Edge, or install Playwright Chromium and set `PLAYWRIGHT_CHANNEL=chromium`. Tests start their own preview server on port 5184; screenshots and traces are stored in the ignored `.artifacts/` directory.

Vue DevTools is optional: set `VUE_DEVTOOLS=true` before starting the development server.

## Structure

| Location                      | Responsibility                                                             |
| ----------------------------- | -------------------------------------------------------------------------- |
| `src/app/`                    | Application shell, routing, and document titles                            |
| `src/modules/algorithms/`     | Catalogs, lessons, patterns, visualizations, playback, and algorithm logic |
| `src/shared/styles/reset.css` | Neutral reset and reduced-motion support                                   |
| `tests/`                      | Domain/playback tests and browser test entry points                        |

See [AGENTS.md](AGENTS.md) for development conventions. Algorithm frames are computed independently of Vue; playback renders those frames and supports rewinding. Fonts are bundled locally.

## Static hosting

Build with `npm run build` and publish `dist/`. Configure the host to serve `index.html` for application routes so direct lesson links and refreshes work. This application runs in the browser and does not require a backend service.

Algo Lab was extracted from Quant Lab at commit `977ad7c`. Algorithm development continues here; trading and quantitative experiments remain in Quant Lab.
