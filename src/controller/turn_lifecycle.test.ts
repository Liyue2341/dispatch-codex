import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { Logger } from '../logger.js';
import { TurnLifecycleCoordinator } from './turn_lifecycle.js';

test('handleTurnCompleted sends quota guidance instead of a generic completed message', async () => {
  const sentMessages: string[] = [];
  const coordinator = new TurnLifecycleCoordinator({
    logger: new Logger('error', path.join(os.tmpdir(), 'telegram-codex-turn-lifecycle.test.log')),
    codexAppSyncOnTurnComplete: false,
    localeForChat: () => 'zh',
    setActiveTurn() {},
    deleteActiveTurn() {},
    listActiveTurns: () => [],
    savePreviewRecord() {},
    listStoredPreviews: () => [],
    async queueRender() {},
    clearRenderRetry() {},
    clearToolBatchTimer() {},
    async cleanupFinishedPreview() {},
    async retirePreviewMessage() {},
    async sendMessage(_scopeId: string, text: string) {
      sentMessages.push(text);
      return 1;
    },
    async renderPlanCard() {},
    async finalizeGuidedPlanTurn() {},
    markQueuedTurnCompleted() {},
    async syncGuidedPlanQueueDepth() {},
    async tryRevealThread() {
      return null;
    },
    updateStatus() {},
    async autostartQueuedTurn() {},
    async handleAsyncError() {},
  });

  await coordinator.handleTurnCompleted({
    scopeId: 'chat-1',
    chatId: 'chat-1',
    topicId: null,
    renderRoute: {
      conversationKind: 'private_chat',
      preferredRenderer: 'segmented_stream',
      currentRenderer: 'segmented_stream',
      supportsDraftStreaming: true,
      usesMessageThread: false,
    },
    threadId: 'thread-1',
    turnId: 'turn-1',
    queuedInputId: null,
    previewMessageId: 0,
    previewActive: false,
    draftId: null,
    draftText: null,
    buffer: '',
    finalText: null,
    completionState: 'quota_exhausted',
    completionStatusText: 'failed',
    completionErrorText: 'Insufficient quota',
    interruptRequested: false,
    statusMessageText: null,
    statusNeedsRebase: false,
    segments: [],
    reasoningActiveCount: 0,
    pendingApprovalKinds: new Set(),
    pendingUserInputId: null,
    toolBatch: null,
    pendingArchivedStatus: null,
    planMessageId: null,
    planText: null,
    planExplanation: null,
    planSteps: [],
    planDraftText: null,
    planLastRenderedAt: 0,
    planRenderRequested: false,
    forcePlanRender: false,
    planRenderTask: null,
    guidedPlanSessionId: null,
    guidedPlanDraftOnly: false,
    guidedPlanExecutionBlocked: false,
    renderRetryTimer: null,
    lastStreamFlushAt: 0,
    renderRequested: false,
    forceStatusFlush: false,
    forceStreamFlush: false,
    preferStatusBeforeStream: false,
    renderTask: null,
    resolver() {},
  });

  assert.equal(sentMessages.length, 1);
  assert.match(sentMessages[0] ?? '', /额度已用尽/);
});
