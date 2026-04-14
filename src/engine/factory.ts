import type { AppConfig } from '../config.js';
import type { Logger } from '../logger.js';
import { createClaudeEngineProvider } from './claude_provider.js';
import { createCodexEngineProvider } from './codex_provider.js';
import { createGeminiEngineProvider } from './gemini_provider.js';
import { createOpenCodeEngineProvider } from './opencode_provider.js';
import type { EngineProvider } from './types.js';

export function createEngineProvider(
  config: AppConfig,
  logger: Logger,
  resolveProfileIdForScope: (scopeId?: string | null) => string = () => config.codexDefaultProviderProfileId,
): EngineProvider {
  switch (config.bridgeEngine) {
    case 'codex':
      return createCodexEngineProvider(config, logger, resolveProfileIdForScope);
    case 'gemini':
      return createGeminiEngineProvider(config, logger);
    case 'claude':
      return createClaudeEngineProvider(config, logger);
    case 'opencode':
      return createOpenCodeEngineProvider(config, logger);
  }
}
