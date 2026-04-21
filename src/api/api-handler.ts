import { generateAndStoreQuiz, getQuizSession, listPastQuizzes } from '../app/quiz-lifecycle';
import type { QuizPersistencePort } from '../app/quiz-store';
import type { AppError, QuizGenerationInput, QuizGenerationResult } from '../app/quiz-types';
import { renderHomePageHtml } from '../ui/home-page';

type ApiHandler = (request: Request) => Promise<Response>;
type HeaderRecord = Record<string, string>;

export interface ApiHandlerDependencies {
  readonly healthMessage?: string;
  readonly store?: QuizPersistencePort;
  readonly allowedOrigin?: string;
}

function withCorsHeaders(allowedOrigin: string | undefined, headers: HeaderRecord | undefined): HeaderRecord {
  const corsHeaders: HeaderRecord = {
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
  };

  if (allowedOrigin) {
    corsHeaders['access-control-allow-origin'] = allowedOrigin;
    corsHeaders.vary = 'Origin';
  }

  return {
    ...corsHeaders,
    ...(headers ?? {}),
  };
}

function jsonResponse(body: unknown, allowedOrigin: string | undefined, init?: ResponseInit): Response {
  const headers = new Headers();
  headers.set('content-type', 'application/json; charset=utf-8');

  const initHeaders = init?.headers as Record<string, string> | undefined;

  if (initHeaders) {
    for (const [key, value] of Object.entries(initHeaders)) {
      headers.set(key, value);
    }
  }

  return new Response(JSON.stringify(body), {
    ...init,
    headers: withCorsHeaders(allowedOrigin, Object.fromEntries(headers.entries())),
  });
}

function normalizePath(url: URL): string {
  const path = url.pathname.trim();

  if (path.length === 0) {
    return '/';
  }

  return path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path;
}

function parseJsonBody(body: string): QuizGenerationInput | null {
  try {
    const parsed = JSON.parse(body) as unknown;

    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }

    const candidate = parsed as Record<string, unknown>;

    if (typeof candidate.topic !== 'string' || typeof candidate.questionCount !== 'number') {
      return null;
    }

    return {
      topic: candidate.topic,
      questionCount: candidate.questionCount,
    };
  } catch {
    return null;
  }
}

function appErrorToHttpStatus(error: AppError): number {
  switch (error.code) {
    case 'INVALID_INPUT':
      return 400;
    case 'INVALID_MODEL_OUTPUT':
      return 500;
    case 'GENERATION_FAILED':
      return 500;
  }
}

function renderAppError(error: AppError, allowedOrigin?: string): Response {
  return jsonResponse(
    {
      ok: false,
      error,
    },
    allowedOrigin,
    { status: appErrorToHttpStatus(error) },
  );
}

function renderNotFound(message: string, allowedOrigin?: string): Response {
  return jsonResponse(
    {
      ok: false,
      error: {
        code: 'NOT_FOUND',
        message,
      },
    },
    allowedOrigin,
    { status: 404 },
  );
}

function renderServerError(message: string, allowedOrigin?: string): Response {
  return jsonResponse(
    {
      ok: false,
      error: {
        code: 'GENERATION_FAILED',
        message,
      },
    },
    allowedOrigin,
    { status: 500 },
  );
}

function htmlResponse(body: string): Response {
  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
    },
  });
}

export function createApiHandler(dependencies: ApiHandlerDependencies = {}): ApiHandler {
  const healthMessage = dependencies.healthMessage ?? 'ok';
  const store = dependencies.store;
  const allowedOrigin = dependencies.allowedOrigin;

  return async (request: Request): Promise<Response> => {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: withCorsHeaders(allowedOrigin, undefined),
      });
    }

    const url = new URL(request.url);
    const path = normalizePath(url);

    if (request.method === 'GET' && path === '/') {
      return htmlResponse(renderHomePageHtml());
    }

    if (request.method === 'GET' && path === '/health') {
      return jsonResponse({ status: healthMessage }, allowedOrigin, { status: 200 });
    }

    if (request.method === 'POST' && path === '/quizzes') {
      if (!store) {
        return renderServerError('Storage is not configured.', allowedOrigin);
      }

      const parsedBody = parseJsonBody(await request.text());

      if (!parsedBody) {
        return renderAppError({
          code: 'INVALID_INPUT',
          message: 'Request body must include a topic string and questionCount number.',
        }, allowedOrigin);
      }

      const result = await generateAndStoreQuiz(parsedBody, store);

      if (!result.ok) {
        return renderAppError(result.error, allowedOrigin);
      }

      return jsonResponse(result, allowedOrigin, { status: 201 });
    }

    if (request.method === 'GET' && path === '/quizzes') {
      if (!store) {
        return renderServerError('Storage is not configured.', allowedOrigin);
      }

      const result = await listPastQuizzes(store);

      if (!result.ok) {
        return renderAppError(result.error, allowedOrigin);
      }

      return jsonResponse(result, allowedOrigin, { status: 200 });
    }

    if (request.method === 'GET' && path.startsWith('/quizzes/')) {
      if (!store) {
        return renderServerError('Storage is not configured.', allowedOrigin);
      }

      const id = path.slice('/quizzes/'.length).trim();

      if (id.length === 0) {
        return renderNotFound('Quiz not found.', allowedOrigin);
      }

      const result = await getQuizSession(id, store);

      if (!result.ok) {
        return renderAppError(result.error, allowedOrigin);
      }

      if (result.value === null) {
        return renderNotFound(`Quiz not found: ${id}`, allowedOrigin);
      }

      return jsonResponse({ ok: true, value: result.value }, allowedOrigin, { status: 200 });
    }

    return renderNotFound(`Route not found: ${path}`, allowedOrigin);
  };
}
