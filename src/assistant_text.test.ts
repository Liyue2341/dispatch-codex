import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeAssistantText } from './assistant_text.js';

test('sanitizeAssistantText strips complete think blocks and preserves visible text', () => {
  assert.equal(
    sanitizeAssistantText('<think>\ninternal\n</think>\n\nhi'),
    'hi',
  );
});

test('sanitizeAssistantText hides incomplete think blocks during streaming', () => {
  assert.equal(
    sanitizeAssistantText('visible\n<think>\ninternal'),
    'visible\n',
  );
});

test('sanitizeAssistantText preserves normal assistant text', () => {
  assert.equal(
    sanitizeAssistantText('正常回复'),
    '正常回复',
  );
});
