import type { ProviderConfig, ProviderKey } from './config';

/**
 * Resolve the active provider key from already-parsed configuration.
 *
 * This module intentionally does not create provider instances yet. It only
 * provides a deterministic, config-only selection seam for later wiring.
 */
export function resolveActiveProviderKey(
  config: Readonly<ProviderConfig>,
): ProviderKey {
  return config.provider;
}
