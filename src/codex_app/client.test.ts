import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { Logger } from '../logger.js';
import { CodexAppClient } from './client.js';

test('revealThread fails clearly on unsupported hosts', async () => {
  const logDir = fs.mkdtempSync(path.join(os.tmpdir(), 'telegram-codex-client-test-'));
  const logger = new Logger('error', path.join(logDir, 'bridge.log'));
  const client = new CodexAppClient('codex', '', false, logger, 'freebsd');

  await assert.rejects(
    () => client.revealThread('thread-123'),
    /desktop deep links are not supported on this host \(freebsd\)/,
  );
});
