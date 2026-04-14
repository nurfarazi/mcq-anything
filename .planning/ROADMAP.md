# Roadmap: MCQ Anything

**Defined:** 2026-04-15
**Purpose:** Turn the topic-based MCQ generator vision into a small set of executable phases with clear requirement coverage.

## Phase Overview

| Phase | Focus | Requirements | Exit Criteria |
| --- | --- | --- | --- |
| 1 | Foundation and provider abstraction | PROV-01, PROV-02, PROV-03 | Provider interface, configuration path, and default LM Studio wiring exist without business-logic branching |
| 2 | Topic and count input flow | GEN-01, GEN-02 | User can choose a topic and number of questions and submit a generation request |
| 3 | MCQ generation and output validation | GEN-03, QUAL-01, QUAL-02 | Generated MCQs render with answers/explanations and invalid output is filtered or retried safely |
| 4 | Generated quiz quality hardening | GEN-03, QUAL-01, QUAL-02 | Duplicate, weak, or off-topic generated quizzes fail closed with app-safe errors while happy-path rendering stays intact |

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

**Plans:** 1 plan

Planned prompts:

- [ ] `02-01-PLAN.md` — Application quiz-generation workflow, validation gate, and minimal trigger path

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

**Plans:** 1 plan

Planned prompts:

- [ ] `03-01-PLAN.md` — Minimal user-facing trigger, MCQ rendering, and app-safe error display

### Phase 4 — Generated quiz quality hardening

**Goal:** Tighten the generation pipeline so accepted quizzes are not only well-formed, but also meaningfully usable.

**Scope:**

- Reject duplicate and near-duplicate questions.
- Reject questions that are weakly related to the requested topic.
- Reject weak, empty, or non-informative explanations.
- Reject malformed or inconsistent answer/option relationships.
- Keep exact question-count matching and app-safe error handling.

**Success looks like:**

- Low-quality generated quizzes fail closed before reaching the UI.
- Clear app-safe failure messages explain the quality rejection.
- Acceptable quizzes still render exactly as before.

**Plans:** 1 plan

Planned prompts:

- [ ] `04-01-PLAN.md` — Quality heuristics, stricter validation, and end-to-end failure coverage

## Future Expansion

These are intentionally not scheduled yet:

- Quiz scoring and grading
- Answer review modes
- Topic history and saved sets
- User accounts and persistence

---

## Last updated

2026-04-15 after initialization
