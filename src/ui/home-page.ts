function buildStyles(): string {
  return `
    :root {
      color-scheme: light;
      --bg: #f4efe7;
      --card: rgba(255, 252, 247, 0.92);
      --text: #201b17;
      --muted: #66584d;
      --border: rgba(47, 36, 26, 0.14);
      --brand: #264653;
      --brand-strong: #1b3b46;
      --danger: #8c2f39;
      --shadow: 0 24px 70px rgba(39, 24, 13, 0.14);
    }

    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      min-height: 100%;
      background:
        radial-gradient(circle at top left, rgba(38, 70, 83, 0.14), transparent 32%),
        linear-gradient(180deg, var(--bg) 0%, #e9dfcf 100%);
      color: var(--text);
      font-family: Georgia, 'Times New Roman', serif;
    }

    body { padding: 32px 18px 48px; }

    a { color: inherit; }

    button, input { font: inherit; }

    .shell {
      width: min(1040px, 100%);
      margin: 0 auto;
    }

    .page {
      overflow: hidden;
      padding: 28px;
      border: 1px solid var(--border);
      border-radius: 28px;
      background: var(--card);
      box-shadow: var(--shadow);
      backdrop-filter: blur(10px);
    }

    .hero {
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
      max-width: 11ch;
    }

    .subtitle {
      max-width: 48ch;
      margin-top: 12px;
      color: var(--muted);
      font-family: 'Trebuchet MS', 'Lucida Sans Unicode', sans-serif;
      font-size: 0.98rem;
      line-height: 1.7;
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

    .layout {
      display: grid;
      gap: 18px;
      grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.9fr);
      align-items: start;
    }

    .grid {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      margin-top: 24px;
    }

    .card {
      padding: 20px;
      border-radius: 20px;
      border: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.82);
    }

    .card h2 {
      font-size: 1rem;
      letter-spacing: 0.02em;
    }

    .card p,
    .card li,
    .status,
    .field-note {
      margin-top: 8px;
      color: var(--muted);
      line-height: 1.6;
      font-family: 'Trebuchet MS', 'Lucida Sans Unicode', sans-serif;
    }

    .card ul {
      margin: 12px 0 0;
      padding-left: 20px;
    }

    .endpoint {
      display: block;
      margin-top: 10px;
      padding: 10px 12px;
      border-radius: 14px;
      background: rgba(38, 70, 83, 0.08);
      color: var(--brand-strong);
      font-family: 'Courier New', monospace;
      font-size: 0.92rem;
      overflow-x: auto;
    }

    .generator {
      display: grid;
      gap: 16px;
    }

    .field {
      display: grid;
      gap: 8px;
    }

    .field label {
      font-size: 0.96rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .input {
      width: 100%;
      padding: 14px 15px;
      border-radius: 16px;
      border: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.96);
      color: var(--text);
    }

    .input:focus-visible,
    .button:focus-visible {
      outline: 3px solid rgba(38, 70, 83, 0.28);
      outline-offset: 2px;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
    }

    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 12px 16px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: white;
      color: var(--text);
      text-decoration: none;
      font-family: 'Trebuchet MS', 'Lucida Sans Unicode', sans-serif;
      transition: transform 140ms ease, border-color 140ms ease;
      cursor: pointer;
    }

    .button.primary {
      background: var(--brand);
      border-color: var(--brand);
      color: white;
    }

    .button:hover {
      transform: translateY(-1px);
      border-color: rgba(38, 70, 83, 0.32);
    }

    .button[disabled] {
      cursor: wait;
      opacity: 0.78;
      transform: none;
    }

    .status[hidden] {
      display: none;
    }

    .status.error {
      color: var(--danger);
    }

    .footer-note {
      margin-top: 10px;
      color: var(--muted);
      line-height: 1.6;
      font-family: 'Trebuchet MS', 'Lucida Sans Unicode', sans-serif;
    }

    @media (max-width: 860px) {
      .layout {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 720px) {
      body { padding: 14px; }
      .page { padding: 18px; border-radius: 22px; }
    }
  `;
}

/** Render a browser-friendly landing page for the API root. */
export function renderHomePageHtml(): string {
  const styles = buildStyles();

  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="utf-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1" />',
    '  <title>MCQ Anything</title>',
    '  <style>',
    styles,
    '  </style>',
    '</head>',
    '<body>',
    '  <main class="shell">',
    '    <section class="page">',
    '      <header class="hero">',
    '        <div>',
    '          <p class="eyebrow">MCQ Anything</p>',
    '          <h1>Generate multiple-choice questions from a topic.</h1>',
    '          <p class="subtitle">Type a topic, pick how many questions you want, and jump straight into a browser-based quiz flow with server-side scoring.</p>',
    '        </div>',
    '        <div class="hero-badge">API root · browser landing page</div>',
    '      </header>',
    '',
    '      <section class="layout">',
    '        <article class="card">',
    '          <h2>Start a quiz</h2>',
    '          <p>Use the form below to generate a stored quiz session and continue to the one-question-at-a-time play page.</p>',
    '          <form id="generator-form" class="generator" novalidate>',
    '            <div class="field">',
    '              <label for="topic-input">Topic</label>',
    '              <input class="input" id="topic-input" name="topic" type="text" placeholder="Astronomy, biology, world history..." required />',
    '              <p class="field-note">Choose something specific enough to generate focused questions.</p>',
    '            </div>',
    '            <div class="field">',
    '              <label for="question-count">Question count</label>',
    '              <input class="input" id="question-count" name="questionCount" type="number" min="1" max="10" value="5" required />',
    '              <p class="field-note">The current API supports between 1 and 10 questions.</p>',
    '            </div>',
    '            <div class="actions">',
    '              <button class="button primary" id="generate-button" type="submit">Generate quiz</button>',
    '              <a class="button" href="/quizzes">View stored sessions</a>',
    '            </div>',
    '            <p class="status" id="form-status" aria-live="polite" hidden></p>',
    '          </form>',
    '        </article>',
    '',
    '        <aside class="card">',
    '          <h2>Useful endpoints</h2>',
    '          <p>You can still drive everything over JSON if you prefer scripts or Postman over buttons.</p>',
    '          <span class="endpoint">GET /health</span>',
    '          <span class="endpoint">POST /quizzes</span>',
    '          <span class="endpoint">GET /quizzes</span>',
    '          <p class="footer-note">The browser flow uses the same endpoints, so the UI stays honest.</p>',
    '        </aside>',
    '      </section>',
    '',
    '      <section class="grid" aria-label="Quick start">',
    '        <article class="card">',
    '          <h2>Health check</h2>',
    '          <p>Confirm the local server is alive before blaming the quiz gremlins.</p>',
    '          <span class="endpoint">GET /health</span>',
    '        </article>',
    '        <article class="card">',
    '          <h2>Example payload</h2>',
    '          <p>The browser submits the same JSON you would send manually.</p>',
    '          <span class="endpoint">{"topic":"Astronomy","questionCount":5}</span>',
    '        </article>',
    '        <article class="card">',
    '          <h2>What happens next</h2>',
    '          <ul>',
    '            <li>The server generates and stores a quiz session.</li>',
    '            <li>The browser redirects to a one-question-at-a-time play page.</li>',
    '            <li>Your submitted answers are scored and saved on the server.</li>',
    '          </ul>',
    '        </article>',
    '      </section>',
    '    </section>',
    '  </main>',
    '  <script>',
    '    const form = document.getElementById("generator-form");',
    '    const status = document.getElementById("form-status");',
    '    const button = document.getElementById("generate-button");',
    '    const topicInput = document.getElementById("topic-input");',
    '    const countInput = document.getElementById("question-count");',
    '',
    '    function setStatus(message, isError) {',
    '      status.hidden = message.length === 0;',
    '      status.textContent = message;',
    '      status.className = isError ? "status error" : "status";',
    '    }',
    '',
    '    form.addEventListener("submit", async (event) => {',
    '      event.preventDefault();',
    '      setStatus("Generating your quiz...", false);',
    '      button.disabled = true;',
    '',
    '      try {',
    '        const response = await fetch("/quizzes", {',
    '          method: "POST",',
    '          headers: { "content-type": "application/json" },',
    '          body: JSON.stringify({',
    '            topic: topicInput.value,',
    '            questionCount: Number(countInput.value),',
    '          }),',
    '        });',
    '',
    '        const payload = await response.json();',
    '',
    '        if (!response.ok || payload.ok !== true) {',
    '          throw new Error(payload?.error?.message ?? "Unable to generate quiz content.");',
    '        }',
    '',
    '        window.location.href = `/quizzes/${payload.value.id}/play`;',
    '      } catch (error) {',
    '        setStatus(error instanceof Error ? error.message : "Unable to generate quiz content.", true);',
    '        button.disabled = false;',
    '      }',
    '    });',
    '  </script>',
    '</body>',
    '</html>',
  ].join('\n');
}
