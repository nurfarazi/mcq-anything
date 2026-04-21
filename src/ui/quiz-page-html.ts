import type { QuizPageViewModel } from './quiz-page-render';

function serializeViewModel(viewModel: QuizPageViewModel): string {
  return JSON.stringify(viewModel).replace(/</g, '\\u003c');
}

function buildStyles(): string {
  return `
    :root {
      color-scheme: light;
      --bg: #f4efe7;
      --bg-accent: #e9dfcf;
      --card: rgba(255, 252, 247, 0.92);
      --text: #201b17;
      --muted: #66584d;
      --border: rgba(47, 36, 26, 0.14);
      --brand: #264653;
      --brand-strong: #1b3b46;
      --success: #2d6a4f;
      --danger: #8c2f39;
      --shadow: 0 24px 70px rgba(39, 24, 13, 0.14);
    }

    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      min-height: 100%;
      background:
        radial-gradient(circle at top left, rgba(38, 70, 83, 0.14), transparent 32%),
        radial-gradient(circle at bottom right, rgba(140, 47, 57, 0.1), transparent 28%),
        linear-gradient(180deg, var(--bg) 0%, var(--bg-accent) 100%);
      color: var(--text);
      font-family: Georgia, 'Times New Roman', serif;
    }

    body { padding: 32px 18px 48px; }

    button { font: inherit; }

    .shell {
      width: min(1040px, 100%);
      margin: 0 auto;
    }

    .page {
      position: relative;
      overflow: hidden;
      padding: 28px;
      border: 1px solid var(--border);
      border-radius: 28px;
      background: var(--card);
      box-shadow: var(--shadow);
      backdrop-filter: blur(10px);
    }

    .page::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: linear-gradient(rgba(32, 27, 23, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(32, 27, 23, 0.03) 1px, transparent 1px);
      background-size: 24px 24px;
      pointer-events: none;
      mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.18), transparent 42%);
    }

    .hero,
    .stack {
      position: relative;
      z-index: 1;
    }

    .hero {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 20px;
      padding-bottom: 20px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border);
    }

    .eyebrow {
      margin: 0 0 8px;
      text-transform: uppercase;
      letter-spacing: 0.24em;
      font-size: 0.72rem;
      color: var(--brand);
    }

    h1, h2, p { margin: 0; }

    h1 {
      font-size: clamp(2.2rem, 4vw, 4rem);
      line-height: 0.95;
      letter-spacing: -0.04em;
      max-width: 10ch;
    }

    .subtitle {
      max-width: 40ch;
      margin-top: 12px;
      color: var(--muted);
      font-family: 'Trebuchet MS', 'Lucida Sans Unicode', sans-serif;
      font-size: 0.98rem;
      line-height: 1.6;
    }

    .hero-badge {
      align-self: flex-start;
      padding: 12px 16px;
      border-radius: 999px;
      border: 1px solid rgba(38, 70, 83, 0.18);
      background: rgba(255, 255, 255, 0.72);
      color: var(--brand-strong);
      font-family: 'Trebuchet MS', 'Lucida Sans Unicode', sans-serif;
      font-size: 0.88rem;
      white-space: nowrap;
    }

    .summary {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }

    .summary-chip {
      min-width: 140px;
      padding: 14px 16px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid var(--border);
    }

    .summary-chip strong {
      display: block;
      margin-top: 6px;
      font-size: 1.12rem;
      letter-spacing: -0.02em;
    }

    .stack {
      display: grid;
      gap: 18px;
    }

    .question-card,
    .result-card,
    .error-card {
      padding: 22px;
      border-radius: 22px;
      border: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.88);
    }

    .question-card,
    .result-card {
      display: grid;
      gap: 18px;
      box-shadow: 0 12px 30px rgba(39, 24, 13, 0.06);
    }

    .question-headline {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 10px;
      align-items: center;
    }

    .question-index {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 10px;
      border-radius: 999px;
      background: rgba(38, 70, 83, 0.08);
      color: var(--brand-strong);
      font-family: 'Trebuchet MS', 'Lucida Sans Unicode', sans-serif;
      font-size: 0.82rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .question-title {
      font-size: clamp(1.25rem, 2vw, 1.8rem);
      line-height: 1.2;
      letter-spacing: -0.03em;
      max-width: 28ch;
    }

    .option-list,
    .result-list {
      display: grid;
      gap: 10px;
    }

    .option {
      display: flex;
      gap: 14px;
      align-items: flex-start;
      width: 100%;
      padding: 14px 15px;
      border-radius: 18px;
      border: 1px solid var(--border);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(245, 238, 229, 0.92));
      color: var(--text);
      text-align: left;
      cursor: pointer;
      transition: transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease, background 140ms ease;
    }

    .option:hover {
      transform: translateY(-1px);
      border-color: rgba(38, 70, 83, 0.3);
      box-shadow: 0 10px 20px rgba(39, 24, 13, 0.06);
    }

    .option:focus-visible,
    .controls button:focus-visible,
    .link-button:focus-visible {
      outline: 3px solid rgba(38, 70, 83, 0.28);
      outline-offset: 2px;
    }

    .option[disabled] {
      cursor: default;
      transform: none;
    }

    .option-label {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      flex: 0 0 auto;
      background: rgba(38, 70, 83, 0.12);
      color: var(--brand-strong);
      font-family: 'Trebuchet MS', 'Lucida Sans Unicode', sans-serif;
      font-weight: 700;
    }

    .option-text,
    .feedback-copy,
    .status-copy {
      line-height: 1.5;
      font-family: 'Trebuchet MS', 'Lucida Sans Unicode', sans-serif;
    }

    .option.selected {
      border-color: rgba(38, 70, 83, 0.48);
      background: rgba(38, 70, 83, 0.1);
    }

    .option.correct {
      border-color: rgba(45, 106, 79, 0.6);
      background: rgba(45, 106, 79, 0.12);
    }

    .option.wrong {
      border-color: rgba(140, 47, 57, 0.55);
      background: rgba(140, 47, 57, 0.1);
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: space-between;
      align-items: center;
    }

    .controls button,
    .link-button {
      padding: 12px 16px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: white;
      color: var(--text);
      cursor: pointer;
      transition: transform 140ms ease, background 140ms ease, border-color 140ms ease;
      text-decoration: none;
      font-family: 'Trebuchet MS', 'Lucida Sans Unicode', sans-serif;
    }

    .controls button:hover,
    .link-button:hover {
      transform: translateY(-1px);
      border-color: rgba(38, 70, 83, 0.32);
    }

    .controls .primary,
    .link-button.primary {
      background: var(--brand);
      color: white;
      border-color: var(--brand);
    }

    .controls .primary:hover,
    .link-button.primary:hover { background: var(--brand-strong); }

    .controls button[disabled] {
      cursor: not-allowed;
      opacity: 0.58;
      transform: none;
    }

    .status-copy.error,
    .error-card {
      color: var(--danger);
    }

    .error-card { border-left: 6px solid var(--danger); }

    .error-card p {
      margin-top: 8px;
      color: var(--muted);
      line-height: 1.6;
      font-family: 'Trebuchet MS', 'Lucida Sans Unicode', sans-serif;
    }

    .error-code {
      display: inline-flex;
      margin-bottom: 12px;
      padding: 8px 11px;
      border-radius: 999px;
      background: rgba(140, 47, 57, 0.12);
      color: var(--danger);
      font-family: 'Trebuchet MS', 'Lucida Sans Unicode', sans-serif;
      font-size: 0.82rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .result-summary {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
    }

    .result-chip {
      padding: 14px 16px;
      border-radius: 18px;
      border: 1px solid var(--border);
      background: rgba(45, 106, 79, 0.08);
      min-width: 140px;
    }

    .result-chip strong {
      display: block;
      margin-top: 6px;
      font-size: 1.12rem;
      color: var(--success);
    }

    .result-item {
      padding: 16px 18px;
      border-radius: 18px;
      border: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.92);
      display: grid;
      gap: 8px;
    }

    .result-item.correct {
      border-color: rgba(45, 106, 79, 0.35);
      background: rgba(45, 106, 79, 0.08);
    }

    .result-item.wrong {
      border-color: rgba(140, 47, 57, 0.28);
      background: rgba(140, 47, 57, 0.06);
    }

    @media (max-width: 720px) {
      body { padding: 14px; }
      .page { padding: 18px; border-radius: 22px; }
      .question-card,
      .result-card,
      .error-card { padding: 18px; }
      .controls { justify-content: stretch; }
    }
  `;
}

function buildTemplate(): string {
  return `
    <div class="page">
      <header class="hero">
        <div>
          <p class="eyebrow">MCQ Anything</p>
          <h1>Answer one question at a time.</h1>
          <p class="subtitle">Move through the quiz step by step, submit once every question is answered, and let the server score the whole attempt.</p>
        </div>
        <div class="hero-badge">Vue 3 · session play page</div>
      </header>

      <section v-if="model.kind === 'success'" class="stack" aria-label="Stored quiz session">
        <div class="summary">
          <div class="summary-chip">Topic<strong>{{ model.topic }}</strong></div>
          <div class="summary-chip">Progress<strong>{{ questionProgress }}</strong></div>
          <div class="summary-chip">Answered<strong>{{ answeredCount }} / {{ model.questions.length }}</strong></div>
        </div>

        <article class="question-card">
          <div class="question-headline">
            <span class="question-index">{{ questionProgress }}</span>
            <span class="question-index">Selected {{ answerLabel(currentAnswer) }}</span>
          </div>

          <h2 class="question-title">{{ currentQuestion.question }}</h2>
          <p class="status-copy">Choose one option before moving on. The server will score everything after you submit.</p>

          <div class="option-list" role="list">
            <button
              v-for="(option, optionIndex) in currentQuestion.options"
              :key="optionIndex"
              type="button"
              class="option"
              :class="optionClass(currentQuestionIndex, optionIndex)"
              @click="selectAnswer(currentQuestionIndex, optionIndex)"
              :aria-pressed="selectedAnswers[currentQuestionIndex] === optionIndex"
              :disabled="submittedAttempt !== null || submitting"
            >
              <span class="option-label">{{ labels[optionIndex] }}</span>
              <span class="option-text">{{ option }}</span>
            </button>
          </div>

          <p v-if="submissionError" class="status-copy error" aria-live="polite">{{ submissionError }}</p>

          <div class="controls">
            <div class="actions-left">
              <button type="button" @click="goToPreviousQuestion" :disabled="!canGoPrevious">Previous question</button>
              <button type="button" @click="goToNextQuestion" :disabled="!canGoNext">Next question</button>
            </div>
            <div class="actions-right">
              <a class="link-button" href="/">Back to generator</a>
              <button type="button" class="primary" @click="submitAnswers" :disabled="!canSubmit">{{ submitButtonLabel }}</button>
            </div>
          </div>
        </article>

        <article v-if="submittedAttempt" class="result-card" aria-label="Quiz results">
          <div>
            <span class="question-index">Attempt saved</span>
            <h2 class="question-title">Your score is ready.</h2>
            <p class="status-copy">The server checked every answer and stored the result with this quiz session.</p>
          </div>

          <div class="result-summary">
            <div class="result-chip">Correct answers<strong>{{ submittedAttempt.score.correctCount }} / {{ submittedAttempt.score.totalQuestions }}</strong></div>
            <div class="result-chip">Percentage<strong>{{ submittedAttempt.score.percentage }}%</strong></div>
          </div>

          <div class="result-list">
            <article
              v-for="question in submittedAttempt.questions"
              :key="question.questionIndex"
              class="result-item"
              :class="question.isCorrect ? 'correct' : 'wrong'"
            >
              <strong>{{ question.questionIndex + 1 }}. {{ question.question }}</strong>
              <p class="feedback-copy">Your answer: {{ answerLabel(question.selectedAnswer) }} · Correct answer: {{ answerLabel(question.correctAnswer) }}</p>
              <p class="feedback-copy">{{ question.explanation }}</p>
            </article>
          </div>
        </article>
      </section>

      <section v-else class="error-card" aria-label="Quiz generation error">
        <div class="error-code">Error: {{ model.error.code }}</div>
        <h2 class="question-title">We could not prepare the quiz.</h2>
        <p>{{ model.error.message }}</p>
        <a class="link-button primary" href="/">Back to generator</a>
      </section>
    </div>
  `;
}

/** Render a minimal HTML page powered by Vue for displaying the quiz. */
export function renderQuizPageHtml(viewModel: QuizPageViewModel): string {
  const data = serializeViewModel(viewModel);
  const template = buildTemplate();
  const styles = buildStyles();

  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="utf-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1" />',
    '  <title>MCQ Anything</title>',
    '  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>',
    '  <style>',
    styles,
    '  </style>',
    '</head>',
    '<body>',
    '  <main id="app" class="shell"></main>',
    '  <template id="quiz-template">',
    template,
    '  </template>',
    `  <script type="application/json" id="quiz-data">${data}</script>`,
    '  <script>',
    '    const { createApp } = Vue;',
    '    const model = JSON.parse(document.getElementById("quiz-data").textContent);',
    '    createApp({',
    '      data() {',
    '        return {',
    '          model,',
    '          labels: ["A", "B", "C", "D"],',
    '          currentQuestionIndex: 0,',
    '          selectedAnswers: model.kind === "success" ? model.questions.map(() => null) : [],',
    '          submitting: false,',
    '          submissionError: "",',
    '          submittedAttempt: null,',
    '        };',
    '      },',
    '      computed: {',
    '        currentQuestion() {',
    '          return this.model.kind === "success" ? this.model.questions[this.currentQuestionIndex] : null;',
    '        },',
    '        currentAnswer() {',
    '          return this.model.kind === "success" ? this.selectedAnswers[this.currentQuestionIndex] : null;',
    '        },',
    '        answeredCount() {',
    '          return this.selectedAnswers.filter((value) => value !== null).length;',
    '        },',
    '        questionProgress() {',
    '          if (this.model.kind !== "success") {',
    '            return "Question 0 of 0";',
    '          }',
    '',
    '          return `Question ${this.currentQuestionIndex + 1} of ${this.model.questions.length}`;',
    '        },',
    '        canGoPrevious() {',
    '          return this.currentQuestionIndex > 0 && this.submitting === false;',
    '        },',
    '        canGoNext() {',
    '          return this.model.kind === "success" && this.currentQuestionIndex < this.model.questions.length - 1 && this.submitting === false;',
    '        },',
    '        canSubmit() {',
    '          return this.model.kind === "success" && this.answeredCount === this.model.questions.length && this.submitting === false && this.submittedAttempt === null;',
    '        },',
    '        submitButtonLabel() {',
    '          if (this.submitting) {',
    '            return "Submitting...";',
    '          }',
    '',
    '          return this.submittedAttempt === null ? "Submit answers" : "Answers submitted";',
    '        },',
    '      },',
    '      methods: {',
    '        selectAnswer(questionIndex, optionIndex) {',
    '          if (this.model.kind !== "success" || this.submittedAttempt !== null || this.submitting) {',
    '            return;',
    '          }',
    '',
    '          this.selectedAnswers[questionIndex] = optionIndex;',
    '          this.submissionError = "";',
    '        },',
    '        goToPreviousQuestion() {',
    '          if (this.canGoPrevious) {',
    '            this.currentQuestionIndex -= 1;',
    '          }',
    '        },',
    '        goToNextQuestion() {',
    '          if (this.canGoNext) {',
    '            this.currentQuestionIndex += 1;',
    '          }',
    '        },',
    '        answerLabel(index) {',
    '          return index === null || index === undefined ? "Not answered" : this.labels[index];',
    '        },',
    '        optionClass(questionIndex, optionIndex) {',
    '          if (this.submittedAttempt === null) {',
    '            return { selected: this.selectedAnswers[questionIndex] === optionIndex };',
    '          }',
    '',
    '          const questionResult = this.submittedAttempt.questions[questionIndex];',
    '          return {',
    '            selected: questionResult.selectedAnswer === optionIndex,',
    '            correct: questionResult.correctAnswer === optionIndex,',
    '            wrong: questionResult.selectedAnswer === optionIndex && questionResult.correctAnswer !== optionIndex,',
    '          };',
    '        },',
    '        async submitAnswers() {',
    '          if (!this.canSubmit || this.model.kind !== "success") {',
    '            return;',
    '          }',
    '',
    '          this.submitting = true;',
    '          this.submissionError = "";',
    '',
    '          try {',
    '            const response = await fetch(this.model.attemptEndpoint, {',
    '              method: "POST",',
    '              headers: { "content-type": "application/json" },',
    '              body: JSON.stringify({ answers: this.selectedAnswers }),',
    '            });',
    '',
    '            const payload = await response.json();',
    '',
    '            if (!response.ok || payload.ok !== true) {',
    '              throw new Error(payload?.error?.message ?? "Unable to submit answers.");',
    '            }',
    '',
    '            this.submittedAttempt = payload.value;',
    '          } catch (error) {',
    '            this.submissionError = error instanceof Error ? error.message : "Unable to submit answers.";',
    '          } finally {',
    '            this.submitting = false;',
    '          }',
    '        },',
    '      },',
    '      template: document.getElementById("quiz-template").innerHTML,',
    '    }).mount("#app");',
    '  </script>',
    '</body>',
    '</html>',
  ].join('\n');
}
