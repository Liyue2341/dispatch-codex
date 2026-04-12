import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { Logger } from '../logger.js';
import { TurnRenderingCoordinator } from './turn_rendering.js';

test('active tool status keeps in-progress previews summarized', () => {
  const coordinator = new TurnRenderingCoordinator({
    logger: new Logger('error', path.join(os.tmpdir(), 'telegram-turn-rendering-test.log')),
    config: {
      telegramPreviewThrottleMs: 250,
    },
    localeForChat: () => 'en',
    countQueuedTurns: () => 0,
    async sendMessage() { return 1; },
    async editMessage() {},
    async deleteMessage() {},
    async sendDraft() {},
    async syncTurnStatus() {},
    scheduleRenderRetry() {},
    isTurnActive: () => true,
  });

  const text = coordinator.renderActiveStatus({
    scopeId: 'scope-1',
    threadId: 'thread-1',
    turnId: 'turn-1',
    renderRoute: { currentRenderer: 'timeline' },
    previewMessageId: 0,
    previewActive: false,
    draftId: null,
    draftText: null,
    interruptRequested: false,
    statusMessageText: null,
    statusNeedsRebase: false,
    segments: [],
    reasoningActiveCount: 0,
    pendingApprovalKinds: new Set<'command' | 'fileChange'>(),
    pendingUserInputId: null,
    toolBatch: {
      openCallIds: new Set(['call-1']),
      actionKeys: new Set(['read:src/app.ts']),
      actionLines: ['Read src/app.ts'],
      counts: { files: 1, searches: 0, edits: 0, commands: 0 },
      finalizeTimer: null,
    },
    pendingArchivedStatus: null,
    renderRetryTimer: null,
    lastStreamFlushAt: 0,
    renderRequested: false,
    forceStatusFlush: false,
    forceStreamFlush: false,
    preferStatusBeforeStream: false,
    renderTask: null,
  });

  assert.equal(text, 'Browsing 1 file');
});

test('completion flushes archived status before final stream output when requested', async () => {
  const order: string[] = [];
  const coordinator = new TurnRenderingCoordinator({
    logger: new Logger('error', path.join(os.tmpdir(), 'telegram-turn-rendering-test.log')),
    config: {
      telegramPreviewThrottleMs: 0,
    },
    localeForChat: () => 'en',
    countQueuedTurns: () => 0,
    async sendMessage() {
      order.push('stream');
      return 1;
    },
    async editMessage() {},
    async deleteMessage() {},
    async sendDraft() {},
    async syncTurnStatus() {
      order.push('status');
    },
    scheduleRenderRetry() {},
    isTurnActive: () => true,
  });

  const active = {
    scopeId: 'scope-1',
    threadId: 'thread-1',
    turnId: 'turn-1',
    renderRoute: { currentRenderer: 'timeline' },
    previewMessageId: 0,
    previewActive: false,
    draftId: null,
    draftText: null,
    interruptRequested: false,
    statusMessageText: null,
    statusNeedsRebase: false,
    segments: [{
      itemId: 'item-1',
      phase: 'final',
      outputKind: 'final_answer' as const,
      text: 'Done.',
      completed: true,
      messages: [],
    }],
    reasoningActiveCount: 0,
    pendingApprovalKinds: new Set<'command' | 'fileChange'>(),
    pendingUserInputId: null,
    toolBatch: null,
    pendingArchivedStatus: { text: 'Browsed 1 file', html: null },
    renderRetryTimer: null,
    lastStreamFlushAt: 0,
    renderRequested: false,
    forceStatusFlush: false,
    forceStreamFlush: false,
    preferStatusBeforeStream: false,
    renderTask: null,
  };

  await coordinator.queueRender(active, {
    forceStatus: true,
    forceStream: true,
    preferStatusBeforeStream: true,
  });

  assert.deepEqual(order, ['status', 'stream']);
});
