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

    button, input, textarea { font: inherit; }

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

    .hero {
      position: relative;
      z-index: 1;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 20px;
      padding-bottom: 20px;
      margin-bottom: 28px;
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
      position: relative;
      z-index: 1;
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      margin-bottom: 24px;
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
      position: relative;
      z-index: 1;
      display: grid;
      gap: 18px;
    }

    .question-card,
    .error-card {
      padding: 22px;
      border-radius: 22px;
      border: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.88);
    }

    .question-card {
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

    .option-list {
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
    .controls button:focus-visible {
      outline: 3px solid rgba(38, 70, 83, 0.28);
      outline-offset: 2px;
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

    .option-text {
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

    .feedback {
      display: grid;
      gap: 8px;
      padding: 16px 18px;
      border-radius: 18px;
      background: rgba(45, 106, 79, 0.08);
      color: var(--text);
      line-height: 1.6;
      font-family: 'Trebuchet MS', 'Lucida Sans Unicode', sans-serif;
    }

    .feedback strong { color: var(--success); }

    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: flex-end;
    }

    .controls button {
      padding: 12px 16px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: white;
      color: var(--text);
      cursor: pointer;
      transition: transform 140ms ease, background 140ms ease, border-color 140ms ease;
    }

    .controls button:hover {
      transform: translateY(-1px);
      border-color: rgba(38, 70, 83, 0.32);
    }

    .controls .primary {
      background: var(--brand);
      color: white;
      border-color: var(--brand);
    }

    .controls .primary:hover { background: var(--brand-strong); }

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

    .empty-state {
      padding: 18px;
      border: 1px dashed rgba(38, 70, 83, 0.24);
      border-radius: 18px;
      color: var(--muted);
      font-family: 'Trebuchet MS', 'Lucida Sans Unicode', sans-serif;
    }

    @media (max-width: 720px) {
      body { padding: 14px; }
      .page { padding: 18px; border-radius: 22px; }
      .hero { margin-bottom: 20px; }
      .question-card, .error-card { padding: 18px; }
    }
  `;
}

function buildTemplate(): string {
  return `
    <div class="page">
      <header class="hero">
        <div>
          <p class="eyebrow">MCQ Anything</p>
          <h1>Practice one multiple-choice question at a time.</h1>
          <p class="subtitle">A tiny Vue-powered quiz page that keeps the generated MCQs visible, readable, and easy to answer.</p>
        </div>
        <div class="hero-badge">Vue 3 · static HTML shell</div>
      </header>

      <section v-if="model.kind === 'success'" class="stack" aria-label="Generated quiz">
        <div class="summary">
          <div class="summary-chip">Question set<strong>{{ model.questions.length }}</strong></div>
          <div class="summary-chip">Answers revealed<strong>{{ revealed ? 'Yes' : 'No' }}</strong></div>
          <div class="summary-chip">Selected answers<strong>{{ answeredCount }}</strong></div>
        </div>

        <article v-for="(question, questionIndex) in model.questions" :key="questionIndex" class="question-card">
          <div class="question-headline">
            <span class="question-index">Question {{ questionIndex + 1 }}</span>
            <span class="question-index">Answer {{ answerLabel(selectedAnswers[questionIndex]) }}</span>
          </div>

          <h2 class="question-title">{{ question.question }}</h2>

          <div class="option-list" role="list">
            <button
              v-for="(option, optionIndex) in question.options"
              :key="optionIndex"
              type="button"
              class="option"
              :class="optionClass(questionIndex, optionIndex, question.correctAnswer)"
              @click="selectAnswer(questionIndex, optionIndex)"
              :aria-pressed="selectedAnswers[questionIndex] === optionIndex"
            >
              <span class="option-label">{{ labels[optionIndex] }}</span>
              <span class="option-text">{{ option }}</span>
            </button>
          </div>

          <section v-if="revealed" class="feedback" :aria-label="'Feedback for question ' + (questionIndex + 1)">
            <strong>Correct answer: {{ question.correctAnswer }}</strong>
            <p>{{ question.explanation }}</p>
          </section>
        </article>

        <div class="controls">
          <button type="button" class="primary" @click="revealAnswers">Reveal answers</button>
          <button type="button" @click="resetQuiz">Reset quiz</button>
        </div>
      </section>

      <section v-else class="error-card" aria-label="Quiz generation error">
        <div class="error-code">Error: {{ model.error.code }}</div>
        <h2 class="question-title">We could not generate the quiz.</h2>
        <p>{{ model.error.message }}</p>
      </section>

      <section v-if="model.kind === 'success' && model.questions.length === 0" class="empty-state">
        No questions were generated.
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
    '          selectedAnswers: model.kind === "success" ? model.questions.map(() => null) : [],',
    '          revealed: false,',
    '        };',
    '      },',
    '      computed: {',
    '        answeredCount() {',
    '          return this.selectedAnswers.filter((value) => value !== null).length;',
    '        },',
    '      },',
    '      methods: {',
    '        selectAnswer(questionIndex, optionIndex) {',
    '          if (this.model.kind !== "success") {',
    '            return;',
    '          }',
    '',
    '          this.selectedAnswers[questionIndex] = optionIndex;',
    '        },',
    '        revealAnswers() {',
    '          this.revealed = true;',
    '        },',
    '        resetQuiz() {',
    '          if (this.model.kind !== "success") {',
    '            return;',
    '          }',
    '',
    '          this.selectedAnswers = this.model.questions.map(() => null);',
    '          this.revealed = false;',
    '        },',
    '        answerLabel(index) {',
    '          return index === null || index === undefined ? "Not answered" : this.labels[index];',
    '        },',
    '        correctIndex(correctAnswer) {',
    '          return this.labels.indexOf(correctAnswer);',
    '        },',
    '        optionClass(questionIndex, optionIndex, correctAnswer) {',
    '          const selected = this.selectedAnswers[questionIndex] === optionIndex;',
    '          const correct = this.correctIndex(correctAnswer) === optionIndex;',
    '          return {',
    '            selected,',
    '            correct: this.revealed && correct,',
    '            wrong: this.revealed && selected && !correct,',
    '          };',
    '        },',
    '      },',
    '      template: document.getElementById("quiz-template").innerHTML,',
    '    }).mount("#app");',
    '  </script>',
    '</body>',
    '</html>',
  ].join('\n');
}