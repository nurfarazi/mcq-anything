import { renderHomePageHtml } from '../../src/ui/home-page';

function assertContains(actual: string, expected: string, label: string): void {
  if (!actual.includes(expected)) {
    throw new Error(`${label}: expected output to include ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

const html = renderHomePageHtml();

assertContains(html, '<!doctype html>', 'renders a document shell');
assertContains(html, 'Generate multiple-choice questions from a topic.', 'renders the landing page headline');
assertContains(html, 'label for="topic-input"', 'renders a labeled topic field');
assertContains(html, 'Question count', 'renders a labeled question-count field');
assertContains(html, 'Generate quiz', 'renders the generator submit action');
assertContains(html, 'fetch("/quizzes"', 'submits quiz generation requests through the browser UI');