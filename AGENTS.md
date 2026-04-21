# Repository Guidelines

## Project Structure & Module Organization
`src/` contains the production code. Keep quiz domain logic in `src/app/`, HTTP handling in `src/api/`, provider selection and transport code in `src/llm/`, and browser-facing HTML helpers in `src/ui/`. The local API entry point is [`src/server.ts`](D:/git/Hobby/mcq-anything/src/server.ts). Tests mirror these layers under `tests/app/`, `tests/api/`, `tests/llm/`, and `tests/ui/`. Utility scripts live in `scripts/`, and build output goes to `dist/`. Local persisted quiz sessions are stored in `.mcq-anything/sessions.json`.

## Build, Test, and Development Commands
Use Node 20+.

- `npm run dev` starts the API locally with `tsx src/server.ts`.
- `npm run build` compiles TypeScript into `dist/` using `tsconfig.build.json`.
- `npm run start` runs the compiled server from `dist/src/server.js`.
- `npm run typecheck` performs a strict no-emit TypeScript check.
- `npm test` runs every `*.test.ts` file through `scripts/run-tests.ts`.

For a quick manual check, run `curl http://localhost:3000/health` after `npm run dev`.

## Coding Style & Naming Conventions
This repo uses strict TypeScript with ESM modules and Node built-ins. Match the existing style: single quotes, semicolons, trailing commas where multiline objects/arrays already use them, and small focused modules. Use 2-space indentation. Prefer descriptive kebab-case filenames such as `quiz-generation.ts` and keep exported types and functions named in PascalCase and camelCase respectively.

## Testing Guidelines
Add tests beside the matching layer under `tests/` and name files `*.test.ts`. The current runner imports tests directly, so keep tests side-effect free apart from assertions and explicit setup. Cover both success and failure paths for new quiz, API, and provider logic. Run `npm test` and `npm run typecheck` before opening a PR.

## Commit & Pull Request Guidelines
Recent history uses short Conventional Commit subjects like `feat: refactor project to API-first architecture`. Follow that format when possible: `feat: ...`, `fix: ...`, `test: ...`, `docs: ...`. Keep each commit scoped to one change. PRs should explain the user-visible impact, list validation steps, and include sample requests or screenshots when changing API responses or rendered HTML.

## Configuration & Security Tips
Configuration is environment-driven. Document any new variables in `README.md` and keep local secrets in `.env` only. Current keys include `MCQ_ANYTHING_PROVIDER`, `MCQ_ANYTHING_LM_STUDIO_ENDPOINT`, `MCQ_ANYTHING_ALLOWED_ORIGIN`, and `PORT`.

## Agent Workflow Expectations
When work can be cleanly split, prefer delegating to dedicated agents for focused tasks instead of doing everything in one pass. After any implementation or refactor, always verify the result with the most relevant checks before considering the task complete, typically `npm test`, `npm run typecheck`, or a targeted manual API check such as `curl http://localhost:3000/health`.
