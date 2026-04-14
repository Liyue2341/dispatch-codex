import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveClaudePermissionModeForAccess } from './claude_provider.js';

test('resolveClaudePermissionModeForAccess maps full access to bypassPermissions', () => {
  assert.equal(resolveClaudePermissionModeForAccess({
    approvalPolicy: 'never',
    sandboxMode: 'danger-full-access',
    fallbackMode: 'default',
  }), 'bypassPermissions');
});

test('resolveClaudePermissionModeForAccess maps read-only to plan mode', () => {
  assert.equal(resolveClaudePermissionModeForAccess({
    approvalPolicy: 'on-request',
    sandboxMode: 'read-only',
    fallbackMode: 'default',
  }), 'plan');
});

test('resolveClaudePermissionModeForAccess keeps standard fallback modes for default access', () => {
  assert.equal(resolveClaudePermissionModeForAccess({
    approvalPolicy: 'on-request',
    sandboxMode: 'workspace-write',
    fallbackMode: 'acceptEdits',
  }), 'acceptEdits');
  assert.equal(resolveClaudePermissionModeForAccess({
    approvalPolicy: 'on-request',
    sandboxMode: 'workspace-write',
    fallbackMode: 'auto',
  }), 'auto');
  assert.equal(resolveClaudePermissionModeForAccess({
    approvalPolicy: 'on-request',
    sandboxMode: 'workspace-write',
    fallbackMode: 'dontAsk',
  }), 'dontAsk');
});

test('resolveClaudePermissionModeForAccess normalizes dangerous fallback modes back to default for standard access', () => {
  assert.equal(resolveClaudePermissionModeForAccess({
    approvalPolicy: 'on-request',
    sandboxMode: 'workspace-write',
    fallbackMode: 'bypassPermissions',
  }), 'default');
  assert.equal(resolveClaudePermissionModeForAccess({
    approvalPolicy: 'on-request',
    sandboxMode: 'workspace-write',
    fallbackMode: 'plan',
  }), 'default');
});
