# MCQ Anything

MCQ Anything is a TypeScript codebase for generating multiple-choice questions from a topic, validating the model output, and optionally storing quiz sessions locally.

It is **not** a standalone web server or desktop app. The public entry points are library functions you can import from `src/app` or `src/ui`, plus a small CLI you can run locally.

## What it does

- Generates MCQs for a requested topic and question count.
- Validates model output before it reaches callers.
- Supports a minimal quiz-session persistence layer.
- Renders quiz results either as plain text for the CLI or as a browser-ready HTML page with Vue.

## Prerequisites

- Node.js 20 or newer.
- A local LM Studio server running at the default endpoint:
  - `http://127.0.0.1:1234/v1/mcq`

## Start here

- Install dependencies:

```bash
npm install
```

- Make sure LM Studio is running and serving the MCQ endpoint.

- Generate your first quiz:

```bash
npm run cli -- Astronomy 2
```

That command will print the generated quiz to the terminal and store the session locally in `.mcq-anything/sessions.json` by default.

## Configuration

The app reads a small set of environment variables:

- `MCQ_ANYTHING_PROVIDER`
  - Defaults to `lm-studio`
  - Supported values today: `lm-studio`
- `MCQ_ANYTHING_LM_STUDIO_ENDPOINT`
  - Optional override for the LM Studio endpoint
  - Defaults to `http://127.0.0.1:1234/v1/mcq`

If you want the default local setup, leave `MCQ_ANYTHING_PROVIDER` unset and start LM Studio on the default port.

## CLI commands

After installing dependencies, you can use these commands:

```bash
npm run cli -- Astronomy 2
```

- `npm run cli -- Astronomy 2`
- `npm run cli -- history`
- `npm run cli -- show <session-id>`

You can also disable session storage for a one-off generation run:

```bash
npm run cli -- Astronomy 2 --no-store
```

If you prefer the lower-level API, import from `src/app` instead:

- `generateQuiz(input)` for quiz generation only
- `generateAndStoreQuiz(input, store)` for generation plus persistence
- `listPastQuizzes(store)` to list stored sessions
- `getQuizSession(id, store)` to load one stored session

## Public output format

`renderQuizPage(...)` returns a complete HTML document that mounts a small Vue quiz page in the browser. If you want the legacy plain-text format, use `renderQuizResult(...)` from `src/ui/quiz-page-render.ts`.

The HTML renderer is intended for browser use, while the CLI still uses the text renderer.

If you need to preview the HTML page, write the returned string to an `.html` file and open it in a browser.

If something fails, the render helper returns a safe error message instead of leaking provider or transport details.

## Testing

The repository includes TypeScript tests under `tests/` for the app, LLM adapters, and UI rendering.

Run the full suite with:

```bash
npm test
```

The test script walks the `tests/` directory and imports each `*.test.ts` file directly.

## Project structure

- `src/app/` — quiz generation, validation, lifecycle, and persistence helpers
- `src/llm/` — provider selection and LM Studio adapter code
- `src/ui/` — quiz rendering helpers for generated quizzes, including the Vue HTML page
- `tests/` — contract and regression tests for each layer

## Notes

- The default provider is LM Studio, which matches the current development setup.
- The app is intentionally provider-agnostic, so business logic stays separate from LLM-specific transport code.
- Generated quiz sessions can be stored and retrieved through the lifecycle layer once a persistence adapter is provided.
