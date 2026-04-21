import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { FileQuizPersistenceAdapter } from './app/quiz-store-file';
import { createApiHandler } from './api/api-handler';

const DEFAULT_PORT = 3000;
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_STORE_PATH = resolve(process.cwd(), '.mcq-anything', 'sessions.json');
const DEFAULT_ALLOWED_ORIGIN = 'http://localhost:5173';
type HeaderRecord = Record<string, string>;
const store = new FileQuizPersistenceAdapter(DEFAULT_STORE_PATH);
const apiHandler = createApiHandler({
  store,
  allowedOrigin: globalThis.process?.env?.MCQ_ANYTHING_ALLOWED_ORIGIN ?? DEFAULT_ALLOWED_ORIGIN,
});

function resolvePort(value: string | undefined): number {
  if (!value) {
    return DEFAULT_PORT;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return DEFAULT_PORT;
  }

  return parsed;
}

async function requestToFetchRequest(request: import('node:http').IncomingMessage): Promise<Request> {
  const host = request.headers.host ?? `${DEFAULT_HOST}:${DEFAULT_PORT}`;
  const url = new URL(request.url ?? '/', `http://${host}`);
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const body = Buffer.concat(chunks);
  const hasBody = body.length > 0;

  return new Request(url, {
    method: request.method,
    headers: Object.fromEntries(
      Object.entries(request.headers).map(([key, value]) => [
        key,
        Array.isArray(value) ? value.join(', ') : value ?? '',
      ]),
    ) as HeaderRecord,
    body: hasBody && request.method !== 'GET' && request.method !== 'HEAD' ? body : undefined,
  });
}

async function writeFetchResponse(
  response: Response,
  serverResponse: import('node:http').ServerResponse,
): Promise<void> {
  serverResponse.statusCode = response.status;
  serverResponse.statusMessage = response.statusText;

  response.headers.forEach((value, key) => {
    serverResponse.setHeader(key, value);
  });

  const text = await response.text();
  serverResponse.end(text);
}

async function handleRequest(
  request: import('node:http').IncomingMessage,
  response: import('node:http').ServerResponse,
): Promise<void> {
  try {
    const fetchRequest = await requestToFetchRequest(request);
    const fetchResponse = await apiHandler(fetchRequest);

    await writeFetchResponse(fetchResponse, response);
  } catch (error) {
    response.statusCode = 500;
    response.setHeader('content-type', 'application/json; charset=utf-8');
    response.end(
      JSON.stringify({
        ok: false,
        error: {
          code: 'GENERATION_FAILED',
          message: error instanceof Error ? error.message : 'Unexpected server failure.',
        },
      }),
    );
  }
}

async function main(): Promise<void> {
  const port = resolvePort(globalThis.process?.env?.PORT);
  const server = createServer((request, response) => {
    void handleRequest(request, response);
  });

  await new Promise<void>((resolveServer) => {
    server.listen(port, DEFAULT_HOST, () => {
      resolveServer();
    });
  });

  process.stdout.write(`MCQ Anything API listening on http://localhost:${port}\n`);
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
