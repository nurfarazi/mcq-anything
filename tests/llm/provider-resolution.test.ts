import { DEFAULT_PROVIDER_KEY, parseProviderConfig, type ProviderConfig, type ProviderKey } from '../../src/llm/config';
import { resolveActiveProviderKey } from '../../src/llm/provider-resolution';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false;

type Expect<T extends true> = T;

type ReturnShape = Expect<Equal<ReturnType<typeof resolveActiveProviderKey>, ProviderKey>>;
type DefaultArgShape = Expect<Equal<Parameters<typeof resolveActiveProviderKey>[0], Readonly<ProviderConfig>>>;

function assertSame(actual: unknown, expected: unknown, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${String(expected)}, received ${String(actual)}`);
  }
}

const defaultConfig = parseProviderConfig({});
assertSame(
  resolveActiveProviderKey(defaultConfig),
  DEFAULT_PROVIDER_KEY,
  'uses the default provider from config without duplicating fallback logic in resolution',
);

const openAiConfig = { provider: 'openai' } as const satisfies ProviderConfig;
assertSame(
  resolveActiveProviderKey(openAiConfig),
  'openai',
  'returns the provider key from config without additional branching',
);

const lmStudioConfig = Object.freeze({ provider: DEFAULT_PROVIDER_KEY }) as Readonly<ProviderConfig>;
assertSame(
  resolveActiveProviderKey(lmStudioConfig),
  DEFAULT_PROVIDER_KEY,
  'resolves deterministically from an existing config object',
);
