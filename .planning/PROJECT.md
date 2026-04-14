# MCQ Anything

## What This Is

MCQ Anything is a learning application that lets a user choose a topic, request a number of multiple-choice questions, receive generated MCQs with answers and explanations, and revisit previously generated quiz sessions. It is designed to work with interchangeable AI providers so the default local LM Studio model can be replaced with another provider, such as OpenAI ChatGPT, through configuration rather than business logic changes.

## Core Value

Generate reliable topic-based MCQs through a provider-agnostic system that can switch AI backends by configuration only.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] A user can select a learning topic for MCQ generation.
- [ ] A user can choose how many MCQ questions to generate.
- [ ] The app returns multiple-choice questions with answers and explanations.
- [ ] AI provider selection is configurable, so switching from LM Studio to another provider does not require business logic changes.
- [ ] The app validates generated output structure before presenting results.
- [ ] The app stores successful generated quizzes with topic, questions, answers, explanations, and timestamp.
- [ ] The app can list and retrieve past quiz sessions through a minimal local persistence layer.

### Out of Scope

- [ ] User accounts and authentication — not needed for the initial generation flow.
- [ ] Quiz scoring, grading, and review modes — reserved for future expansion.
- [ ] Provider-specific business logic branches — would undermine the configuration-only provider goal.

## Context

- Greenfield project in a fresh repository with no existing planning artifacts.
- Default AI provider is expected to be a locally hosted LM Studio model.
- The system should be designed so provider swaps are configuration changes only.
- The initial product vision is a flexible learning platform that can later expand into quizzes, scoring, review, and advanced history features.
- Phase 5 adds a minimal local persistence path for storing and retrieving generated quiz sessions.
- Future scoring and review features should not slow the first release.

## Constraints

- **Architecture**: AI provider behavior must be abstracted behind a stable interface — so backend logic stays provider-neutral.
- **Compatibility**: Default to LM Studio locally — because it is the baseline provider in the stated product vision.
- **Reliability**: Generated MCQ output must be validated — to protect the user experience from malformed model responses.
- **Scope**: Keep v1 focused on generation and lightweight lifecycle support — so future scoring and review features do not slow the first release.

## Key Decisions

| Decision | Rationale | Outcome |
| --- | --- | --- |
| Default provider is LM Studio locally hosted | Matches the requested baseline provider and supports local development | — Pending |
| Provider switching must be configuration-only | Prevents provider lock-in and keeps business logic stable | — Pending |
| Future scoring and review features are deferred | Keeps the initial release centered on the core generation loop | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):

1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):

1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

## Last updated

2026-04-15 after phase 5 planning update
