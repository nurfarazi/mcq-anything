# MCQ Anything

MCQ Anything is a TypeScript codebase for generating multiple-choice questions from a topic, validating the model output, and optionally storing quiz sessions locally.

It is now an **API-first backend**. The public entry points are the HTTP API plus library functions you can import from `src/app`.

## What it does

- Generates MCQs for a requested topic and question count.
- Validates model output before it reaches callers.
- Supports a minimal quiz-session persistence layer.

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

- Start the API server:

```bash
npm run dev
```

The API listens on `http://localhost:3000` by default and stores sessions locally in `.mcq-anything/sessions.json`.

Open `http://localhost:3000/` in a browser to see the landing page with the main API endpoints and quick-start hints.

## Configuration

The app reads a small set of environment variables:

- `MCQ_ANYTHING_PROVIDER`
  - Defaults to `lm-studio`
  - Supported values today: `lm-studio`
- `MCQ_ANYTHING_LM_STUDIO_ENDPOINT`
  - Optional override for the LM Studio endpoint
  - Defaults to `http://127.0.0.1:1234/v1/mcq`
- `MCQ_ANYTHING_ALLOWED_ORIGIN`
  - Optional exact browser origin allowed to call the API from a browser client
  - Defaults to `http://localhost:5173` for local React development
  - Leave it unset if you are calling the API from curl or another non-browser client

If you want the default local setup, leave `MCQ_ANYTHING_PROVIDER` unset and start LM Studio on the default port.

## HTTP API

The backend exposes a small JSON API:

- `GET /health` — health check
- `GET /` — browser-friendly landing page
- `POST /quizzes` — generate and store a quiz
- `GET /quizzes` — list stored quiz sessions
- `GET /quizzes/:id` — fetch one stored quiz session

Successful responses use this envelope:

```json
{ "ok": true, "value": {} }
```

Error responses use the same envelope with an error object:

```json
{ "ok": false, "error": { "code": "INVALID_INPUT", "message": "..." } }
```

Example request:

```bash
curl -X POST http://localhost:3000/quizzes \
  -H "content-type: application/json" \
  -d '{"topic":"Astronomy","questionCount":2}'
```

Example list request:

```bash
curl http://localhost:3000/quizzes
```

If you prefer the lower-level API, import from `src/app` instead:

- `generateQuiz(input)` for quiz generation only
- `generateAndStoreQuiz(input, store)` for generation plus persistence
- `listPastQuizzes(store)` to list stored sessions
- `getQuizSession(id, store)` to load one stored session
- `createQuizSession(topic, questions)` to create a session snapshot

If you need the browser-oriented HTML helpers, import from `src/ui`:

- `renderQuizPage(input)` to generate the browser-ready quiz HTML
- `renderQuizResult(result)` to format quiz output as plain text

## Testing

The repository includes TypeScript tests under `tests/` for the app, LLM adapters, and UI rendering.

Run the full suite with:

```bash
npm test
```

The test script walks the `tests/` directory and imports each `*.test.ts` file directly.

## Verifying the API locally

Start the server with `npm run dev`, then try these requests:

```bash
# Health check
curl http://localhost:3000/health

# Generate and store a quiz
curl -X POST http://localhost:3000/quizzes \
  -H "content-type: application/json" \
  -d '{"topic":"Astronomy","questionCount":2}'

# List stored quizzes
curl http://localhost:3000/quizzes
```

## Project structure

- `src/app/` — quiz generation, validation, lifecycle, and persistence helpers
- `src/api/` — HTTP request handling and response mapping
- `src/llm/` — provider selection and LM Studio adapter code
- `src/ui/` — optional browser/HTML rendering helpers for generated quizzes
- `tests/` — contract and regression tests for each layer

## Notes

- The default provider is LM Studio, which matches the current development setup.
- The app is intentionally provider-agnostic, so business logic stays separate from LLM-specific transport code.
- Generated quiz sessions can be stored and retrieved through the lifecycle layer once a persistence adapter is provided.
