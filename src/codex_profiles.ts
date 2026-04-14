import type { BridgeEngineValue } from './config.js';

interface CodexProfileLike {
  id: string;
  capabilities?: {
    reasoningEffort?: boolean;
    serviceTier?: boolean;
  } | null;
}

export function resolveCodexProviderProfile<T extends CodexProfileLike>(
  config: {
    bridgeEngine: BridgeEngineValue;
    codexProviderProfiles: T[];
    codexDefaultProviderProfileId: string;
  },
  providerProfileId?: string | null,
): T | null {
  if (config.bridgeEngine !== 'codex') {
    return null;
  }
  return config.codexProviderProfiles.find((profile) => profile.id === (providerProfileId ?? ''))
    ?? config.codexProviderProfiles.find((profile) => profile.id === config.codexDefaultProviderProfileId)
    ?? config.codexProviderProfiles[0]
    ?? null;
}

export function resolveCodexProfileReasoningEffortSupport(
  profile: CodexProfileLike | null,
  fallback: boolean,
): boolean {
  return profile?.capabilities?.reasoningEffort ?? fallback;
}

export function resolveCodexProfileServiceTierSupport(
  profile: CodexProfileLike | null,
  fallback: boolean,
): boolean {
  return profile?.capabilities?.serviceTier ?? fallback;
}
