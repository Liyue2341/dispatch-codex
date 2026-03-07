import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveTelegramRenderRoute } from './rendering.js';

test('private chat prefers draft streaming while keeping segmented fallback for now', () => {
  const route = resolveTelegramRenderRoute('private', null);
  assert.deepEqual(route, {
    conversationKind: 'private_chat',
    preferredRenderer: 'draft_stream',
    currentRenderer: 'draft_stream',
    supportsDraftStreaming: true,
    usesMessageThread: false,
  });
});

test('private topic still routes as private and keeps thread metadata', () => {
  const route = resolveTelegramRenderRoute('private', 9);
  assert.deepEqual(route, {
    conversationKind: 'private_topic',
    preferredRenderer: 'draft_stream',
    currentRenderer: 'draft_stream',
    supportsDraftStreaming: true,
    usesMessageThread: true,
  });
});

test('group topic stays on segmented renderer', () => {
  const route = resolveTelegramRenderRoute('supergroup', 8);
  assert.deepEqual(route, {
    conversationKind: 'group_topic',
    preferredRenderer: 'segmented_stream',
    currentRenderer: 'segmented_stream',
    supportsDraftStreaming: false,
    usesMessageThread: true,
  });
});
