import {
  DEFAULT_PROVIDER_KEY,
  PROVIDER_ENV_VAR,
  parseProviderConfig,
  SUPPORTED_PROVIDER_KEYS,
  type ProviderConfig,
  type ProviderKey,
} from '../../src/llm/config';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false;

type Expect<T extends true> = T;

type ProviderKeyShape = Expect<Equal<ProviderKey, 'lm-studio'>>;
type ProviderConfigShape = Expect<Equal<ProviderConfig, { provider: ProviderKey }>>;
type SupportedKeysShape = Expect<
  Equal<typeof SUPPORTED_PROVIDER_KEYS, readonly ['lm-studio']>
>;

function assertDeepEqual(actual: unknown, expected: unknown, label: string): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, received ${actualJson}`);
  }
}

function assertThrows(fn: () => unknown, messagePart: string, label: string): void {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (!message.includes(messagePart)) {
      throw new Error(`${label}: expected error message to include ${messagePart}, received ${message}`);
    }

    return;
  }

  throw new Error(`${label}: expected function to throw`);
}

assertDeepEqual(
  parseProviderConfig({}),
  { provider: DEFAULT_PROVIDER_KEY },
  'defaults to LM Studio when provider env is missing',
);

assertDeepEqual(
  parseProviderConfig({ [PROVIDER_ENV_VAR]: '  lm-studio  ' }),
  { provider: 'lm-studio' },
  'trims surrounding whitespace before validation',
);

assertDeepEqual(
  parseProviderConfig({ [PROVIDER_ENV_VAR]: '   ' }),
  { provider: DEFAULT_PROVIDER_KEY },
  'treats blank provider env as unset',
);

assertThrows(
  () => parseProviderConfig({ [PROVIDER_ENV_VAR]: 'anthropic' }),
  'Invalid provider key',
  'rejects unknown provider keys',
);

assertThrows(
  () => parseProviderConfig({ [PROVIDER_ENV_VAR]: 'OpenAI' }),
  'Invalid provider key',
  'requires strict provider key matching',
);
