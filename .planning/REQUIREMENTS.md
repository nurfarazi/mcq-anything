# Requirements: MCQ Anything

**Defined:** 2026-04-15
**Core Value:** Generate reliable topic-based MCQs through a provider-agnostic system that can switch AI backends by configuration only.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Generation Flow

- [ ] **GEN-01**: User can select a learning topic before generating questions.
- [ ] **GEN-02**: User can choose the number of MCQ questions to generate.
- [ ] **GEN-03**: User receives multiple-choice questions with answers and explanations.

### AI Provider Abstraction

- [ ] **PROV-01**: The app uses LM Studio as the default provider for local generation.
- [ ] **PROV-02**: The app can switch to another AI provider through configuration only.
- [ ] **PROV-03**: Provider-specific behavior stays behind a stable abstraction layer.

### Output Quality

- [ ] **QUAL-01**: Generated output is validated against an expected MCQ structure before display.
- [ ] **QUAL-02**: The app handles malformed or incomplete AI output without exposing broken results to users.

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Learning Experience

- **LEARN-01**: User can run scored quizzes from generated questions.
- **LEARN-02**: User can review correct and incorrect answers after a quiz.
- **LEARN-03**: User can save or revisit past topics and generated question sets.
- **LEARN-04**: User can track progress over time.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
| --- | --- |
| Authentication and user accounts | Not required for the core single-user generation flow |
| Scoring and grading | Deferred to v2 to keep the initial release focused |
| Review mode and topic history | Deferred until persistence and quiz workflows are intentionally added |
| Provider-specific feature branching | Conflicts with the configuration-only provider requirement |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
| --- | --- | --- |
| GEN-01 | Phase 2 | Pending |
| GEN-02 | Phase 2 | Pending |
| GEN-03 | Phase 3 | Pending |
| PROV-01 | Phase 1 | Pending |
| PROV-02 | Phase 1 | Pending |
| PROV-03 | Phase 1 | Pending |
| QUAL-01 | Phase 3 | Pending |
| QUAL-02 | Phase 3 | Pending |

**Coverage:**

- v1 requirements: 8 total
- Mapped to phases: 8
- Unmapped: 0 ✓

---

## Last updated

2026-04-15 after initial definition
