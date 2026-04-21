export const SUPPORTED_PROVIDER_KEYS = ['lm-studio'] as const;

export type ProviderKey = (typeof SUPPORTED_PROVIDER_KEYS)[number];

export const DEFAULT_PROVIDER_KEY: ProviderKey = 'lm-studio';

export const PROVIDER_ENV_VAR = 'MCQ_ANYTHING_PROVIDER';

export interface ProviderConfig {
  provider: ProviderKey;
}

type EnvironmentLike = Readonly<Record<string, string | undefined>>;

function getProcessEnvironment(): EnvironmentLike {
  const processLike = globalThis as {
    process?: { env?: Record<string, string | undefined> };
  };

  return processLike.process?.env ?? {};
}

export function isProviderKey(value: string): value is ProviderKey {
  return (SUPPORTED_PROVIDER_KEYS as readonly string[]).includes(value);
}

/**
 * Parse provider selection from environment-like input.
 *
 * This module stays data-only: it validates and returns the chosen provider
 * key, but it does not create provider instances or embed routing logic.
 */
export function parseProviderConfig(
  env: EnvironmentLike = getProcessEnvironment(),
): ProviderConfig {
  const rawValue = env[PROVIDER_ENV_VAR];

  if (rawValue === undefined || rawValue.trim() === '') {
    return { provider: DEFAULT_PROVIDER_KEY };
  }

  const provider = rawValue.trim();

  if (!isProviderKey(provider)) {
    throw new Error(
      `Invalid provider key "${rawValue}". Expected one of: ${SUPPORTED_PROVIDER_KEYS.join(', ')}.`,
    );
  }

  return { provider };
}
