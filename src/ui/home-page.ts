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
      max-width: 12ch;
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

    .grid {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      margin-bottom: 24px;
    }

    .card {
      padding: 18px;
      border-radius: 20px;
      border: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.82);
    }

    .card h2 {
      font-size: 1rem;
      letter-spacing: 0.02em;
    }

    .card p,
    .card li {
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

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
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

    .footer-note {
      margin-top: 8px;
      color: var(--muted);
      line-height: 1.6;
      font-family: 'Trebuchet MS', 'Lucida Sans Unicode', sans-serif;
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
    '          <p class="subtitle">This server is API-first, but the home page gives you a friendly starting point instead of a blank screen. Use the JSON endpoints below to generate quizzes and inspect saved sessions.</p>',
    '        </div>',
    '        <div class="hero-badge">API root · browser landing page</div>',
    '      </header>',
    '',
    '      <section class="grid" aria-label="Quick start">',
    '        <article class="card">',
    '          <h2>Health check</h2>',
    '          <p>Use this endpoint to confirm the server is alive.</p>',
    '          <span class="endpoint">GET /health</span>',
    '        </article>',
    '        <article class="card">',
    '          <h2>Create a quiz</h2>',
    '          <p>Send a topic and question count to generate and store a quiz session.</p>',
    '          <span class="endpoint">POST /quizzes</span>',
    '        </article>',
    '        <article class="card">',
    '          <h2>List sessions</h2>',
    '          <p>View stored quiz sessions or fetch a single session by id.</p>',
    '          <span class="endpoint">GET /quizzes</span>',
    '        </article>',
    '      </section>',
    '',
    '      <section class="grid">',
    '        <article class="card">',
    '          <h2>Try it from the terminal</h2>',
    '          <p>Example request body:</p>',
    '          <span class="endpoint">{"topic":"Astronomy","questionCount":2}</span>',
    '        </article>',
    '        <article class="card">',
    '          <h2>What to do next</h2>',
    '          <ul>',
    '            <li>Start LM Studio on the default local endpoint.</li>',
    '            <li>Call <code>/quizzes</code> to generate a quiz.</li>',
    '            <li>Use <code>/health</code> to verify the server.</li>',
    '          </ul>',
    '        </article>',
    '      </section>',
    '',
    '      <div class="actions">',
    '        <a class="button primary" href="/health">Check health</a>',
    '        <a class="button" href="/quizzes">View quizzes</a>',
    '      </div>',
    '      <p class="footer-note">If you expected an interactive quiz UI here, the current project exposes that functionality through the API and the reusable HTML renderer in <code>src/ui</code>.</p>',
    '    </section>',
    '  </main>',
    '</body>',
    '</html>',
  ].join('\n');
}