# Project State

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-04-15)

**Core value:** Generate reliable topic-based MCQs through a provider-agnostic system that can switch AI backends by configuration only.
**Current focus:** Initial planning

## Current State

- Greenfield project initialized.
- V1 scope centers on topic selection, question count input, MCQ generation, provider abstraction, and output validation.
- Future quiz, scoring, review, and topic history features are explicitly deferred.

## Recent Decisions

- Default AI provider is LM Studio locally hosted.
- Provider swaps must happen through configuration only.
- Malformed AI output must be validated before display.
