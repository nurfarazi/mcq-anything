# Roadmap: MCQ Anything

**Defined:** 2026-04-15
**Purpose:** Turn the topic-based MCQ generator vision into a small set of executable phases with clear requirement coverage.

## Phase Overview

| Phase | Focus | Requirements | Exit Criteria |
| --- | --- | --- | --- |
| 1 | Foundation and provider abstraction | PROV-01, PROV-02, PROV-03 | Provider interface, configuration path, and default LM Studio wiring exist without business-logic branching |
| 2 | Topic and count input flow | GEN-01, GEN-02 | User can choose a topic and number of questions and submit a generation request |
| 3 | MCQ generation and output validation | GEN-03, QUAL-01, QUAL-02 | Generated MCQs render with answers/explanations and invalid output is filtered or retried safely |

## Phase Details

### Phase 1 — Foundation and provider abstraction

**Goal:** Create the provider-neutral backbone so AI backends can be swapped by configuration only.

**Scope:**

- Define the provider interface and configuration model.
- Wire LM Studio as the default local provider.
- Add the seam for swapping to another provider such as OpenAI without code-path changes in business logic.
- Establish the output contract expected from the model.

**Success looks like:**

- The application can identify the configured provider.
- The default provider resolves to the local LM Studio setup.
- Provider selection is not hard-coded into feature logic.

**Plans:** 1 plan

Planned prompts:

- [ ] `01-01-PLAN.md` — Provider-neutral foundation, LM Studio default wiring, and config-only swapping

### Phase 2 — Topic and count input flow

**Goal:** Let the user specify what they want and how much of it they want.

**Scope:**

- Present a topic selection/input experience.
- Capture the requested number of MCQs.
- Submit a generation request using the provider abstraction.
- Handle loading and basic request errors.

**Success looks like:**

- A user can pick a topic and quantity and initiate generation.
- The request payload is clean enough to support any configured provider.

### Phase 3 — MCQ generation and output validation

**Goal:** Turn model output into trustworthy learning content.

**Scope:**

- Render generated MCQs with answers and explanations.
- Validate generated structure before display.
- Guard against malformed, missing, or incomplete AI responses.
- Provide a safe fallback when output cannot be trusted.

**Success looks like:**

- Results consistently display as usable MCQs.
- Broken model output does not leak into the user-facing experience.
- The generation flow is ready for future quiz/scoring/history expansion.

## Future Expansion

These are intentionally not scheduled yet:

- Quiz scoring and grading
- Answer review modes
- Topic history and saved sets
- User accounts and persistence

---

## Last updated

2026-04-15 after initialization
