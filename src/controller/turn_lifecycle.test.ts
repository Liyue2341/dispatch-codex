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

test('abandonTurnsByProfile only clears matching profile turns and restarts queued scopes once', async () => {
  const retired: Array<{ scopeId: string; messageId: number; text: string; turnId?: string }> = [];
  const restartedScopes: string[] = [];
  const deletedTurnIds: string[] = [];
  const activeTurns = new Map<string, any>();
  const coordinator = new TurnLifecycleCoordinator({
    logger: new Logger('error', path.join(os.tmpdir(), 'telegram-codex-turn-lifecycle-profile.test.log')),
    codexAppSyncOnTurnComplete: false,
    localeForChat: () => 'zh',
    setActiveTurn(turnId, active) {
      activeTurns.set(turnId, active);
    },
    deleteActiveTurn(turnId) {
      deletedTurnIds.push(turnId);
      activeTurns.delete(turnId);
    },
    listActiveTurns: () => [...activeTurns.values()],
    savePreviewRecord() {},
    listStoredPreviews: () => [],
    async queueRender() {},
    clearRenderRetry() {},
    clearToolBatchTimer() {},
    async cleanupFinishedPreview() {},
    async retirePreviewMessage(scopeId, messageId, text, turnId) {
      retired.push(turnId === undefined
        ? { scopeId, messageId, text }
        : { scopeId, messageId, text, turnId });
    },
    async sendMessage() {
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
    async autostartQueuedTurn(scopeId) {
      restartedScopes.push(scopeId);
    },
    async handleAsyncError() {},
  });

  activeTurns.set('turn-minimax', {
    scopeId: 'chat-1',
    profileId: 'cliproxyminimax',
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
    turnId: 'turn-minimax',
    queuedInputId: null,
    previewMessageId: 10,
    previewActive: true,
    draftId: null,
    draftText: null,
    buffer: '',
    finalText: null,
    completionState: 'completed',
    completionStatusText: null,
    completionErrorText: null,
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
  activeTurns.set('turn-openai', {
    scopeId: 'chat-2',
    profileId: 'openai-native',
    chatId: 'chat-2',
    topicId: null,
    renderRoute: {
      conversationKind: 'private_chat',
      preferredRenderer: 'segmented_stream',
      currentRenderer: 'segmented_stream',
      supportsDraftStreaming: true,
      usesMessageThread: false,
    },
    threadId: 'thread-2',
    turnId: 'turn-openai',
    queuedInputId: null,
    previewMessageId: 20,
    previewActive: true,
    draftId: null,
    draftText: null,
    buffer: '',
    finalText: null,
    completionState: 'completed',
    completionStatusText: null,
    completionErrorText: null,
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

  const abandoned = await coordinator.abandonTurnsByProfile('cliproxyminimax');

  assert.equal(abandoned, 1);
  assert.deepEqual(deletedTurnIds, ['turn-minimax']);
  assert.equal(activeTurns.has('turn-openai'), true);
  assert.deepEqual(restartedScopes, ['chat-1']);
  assert.equal(retired.length, 1);
  assert.equal(retired[0]?.turnId, 'turn-minimax');
  assert.match(retired[0]?.text ?? '', /实时预览/);
});
