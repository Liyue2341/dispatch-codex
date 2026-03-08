import { spawn } from 'node:child_process';
import { getOpenUrlCommand as getPlatformOpenUrlCommand, type OpenUrlCommand } from '../platform/capabilities.js';

export function buildThreadDeepLink(threadId: string): string {
  return `codex://threads/${encodeURIComponent(threadId)}`;
}

export function getOpenUrlCommand(url: string, platform: NodeJS.Platform = process.platform): OpenUrlCommand {
  return getPlatformOpenUrlCommand(url, platform);
}

export async function openUrl(url: string, platform: NodeJS.Platform = process.platform): Promise<void> {
  const { command, args } = getOpenUrlCommand(url, platform);
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'ignore',
      detached: true,
      windowsHide: true,
    });

    child.once('error', reject);
    child.once('spawn', () => {
      child.unref();
      resolve();
    });
  });
}
