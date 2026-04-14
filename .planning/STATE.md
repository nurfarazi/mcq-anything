# Project State

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-04-15)

**Core value:** Generate reliable topic-based MCQs through a provider-agnostic system that can switch AI backends by configuration only.
**Current focus:** Planning Phase 5 persistence and quiz lifecycle

## Current State

- Greenfield project initialized.
- V1 scope now extends beyond generation to include local quiz persistence and retrieval.
- The public generation boundary remains `generateQuiz`; persistence and retrieval are app-layer concerns.

## Recent Decisions

- Default AI provider is LM Studio locally hosted.
- Provider swaps must happen through configuration only.
- Malformed AI output must be validated before display.
- Generated quiz sessions will be stored through a minimal local persistence layer without touching provider or quality validation logic.
