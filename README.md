# MCQ Anything

MCQ Anything is a TypeScript codebase for generating multiple-choice questions from a topic, validating the model output, and optionally storing quiz sessions locally.

It is **not** a standalone web server or desktop app yet. The public entry points are library functions you can import from `src/app` or `src/ui`.

## What it does

- Generates MCQs for a requested topic and question count.
- Validates model output before it reaches callers.
- Supports a minimal quiz-session persistence layer.
- Renders quiz results as plain text through a small UI helper.

## Prerequisites

- Node.js 20 or newer.
- A local LM Studio server running at the default endpoint:
  - `http://127.0.0.1:1234/v1/mcq`

## Configuration

The app reads a small set of environment variables:

- `MCQ_ANYTHING_PROVIDER`
  - Defaults to `lm-studio`
  - Supported values today: `lm-studio`, `openai`
  - `openai` is listed in config, but provider support is not implemented yet
- `MCQ_ANYTHING_LM_STUDIO_ENDPOINT`
  - Optional override for the LM Studio endpoint
  - Defaults to `http://127.0.0.1:1234/v1/mcq`

If you want the default local setup, leave `MCQ_ANYTHING_PROVIDER` unset and start LM Studio on the default port.

## How to run it

Because this repository currently ships as source-only TypeScript, there is no committed `npm start` or similar launcher.

To use it locally:

1. Start LM Studio and make sure it is serving the MCQ endpoint.
2. Import the public API in your own script.
3. Run that script with your TypeScript runner of choice.

Example usage:

```ts
import { renderQuizPage } from './src/ui/quiz-page';

async function main() {
  const output = await renderQuizPage({
    topic: 'Astronomy',
    questionCount: 2,
  });

  console.log(output);
}

void main();
```

If you prefer the lower-level API, import from `src/app` instead:

- `generateQuiz(input)` for quiz generation only
- `generateAndStoreQuiz(input, store)` for generation plus persistence
- `listPastQuizzes(store)` to list stored sessions
- `getQuizSession(id, store)` to load one stored session

## Public output format

`renderQuizPage(...)` returns plain text. A successful result looks like this:

```text
Generated MCQs

1. Question text here
  A. Option 1
  B. Option 2
  C. Option 3
  D. Option 4
  Correct answer: C
  Explanation: Why the answer is correct.
```

If something fails, the render helper returns a safe error message instead of leaking provider or transport details.

## Testing

The repository includes TypeScript tests under `tests/` for the app, LLM adapters, and UI rendering.

At the moment there is no committed package manager manifest in the repository, so test execution depends on the TypeScript runner already available in your environment.

## Project structure

- `src/app/` — quiz generation, validation, lifecycle, and persistence helpers
- `src/llm/` — provider selection and LM Studio adapter code
- `src/ui/` — text rendering helpers for generated quizzes
- `tests/` — contract and regression tests for each layer

## Notes

- The default provider is LM Studio, which matches the current development setup.
- The app is intentionally provider-agnostic, so business logic stays separate from LLM-specific transport code.
- Generated quiz sessions can be stored and retrieved through the lifecycle layer once a persistence adapter is provided.
