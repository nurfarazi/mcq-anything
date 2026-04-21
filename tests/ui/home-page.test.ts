import { renderHomePageHtml } from '../../src/ui/home-page';

function assertContains(actual: string, expected: string, label: string): void {
  if (!actual.includes(expected)) {
    throw new Error(`${label}: expected output to include ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

const html = renderHomePageHtml();

assertContains(html, '<!doctype html>', 'renders a document shell');
assertContains(html, 'Generate multiple-choice questions from a topic.', 'renders the landing page headline');
assertContains(html, 'GET /health', 'renders the health endpoint help');
assertContains(html, 'POST /quizzes', 'renders the quiz creation endpoint help');
assertContains(html, 'API root · browser landing page', 'renders the browser-facing badge');