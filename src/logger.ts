import fs from 'node:fs';
import path from 'node:path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
const RANK: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const MAX_SIZE = 1_000_000;
const REDACTED = '[REDACTED]';

const SENSITIVE_KEY_PATTERN = /(token|secret|password|authorization|api[_-]?key|access[_-]?token|refresh[_-]?token|id[_-]?token|bot[_-]?token)/i;
const TELEGRAM_BOT_TOKEN_PATTERN = /\b\d{6,}:[A-Za-z0-9_-]{20,}\b/g;
const BEARER_TOKEN_PATTERN = /\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi;
const OPENAI_SESSION_TOKEN_PATTERN = /\b(?:sess|sk)-[A-Za-z0-9_-]{16,}\b/g;

export class Logger {
  constructor(private level: LogLevel, private filePath: string) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  debug(message: string, meta?: unknown): void { this.write('debug', message, meta); }
  info(message: string, meta?: unknown): void { this.write('info', message, meta); }
  warn(message: string, meta?: unknown): void { this.write('warn', message, meta); }
  error(message: string, meta?: unknown): void { this.write('error', message, meta); }

  private write(level: LogLevel, message: string, meta?: unknown): void {
    if (RANK[level] < RANK[this.level]) return;
    const record = {
      time: new Date().toISOString(),
      level,
      message: redactText(message),
      ...(meta === undefined ? {} : { meta: redactValue(meta) })
    };
    const line = JSON.stringify(record);
    if (level === 'error') {
      console.error(line);
    } else if (level === 'warn') {
      console.warn(line);
    } else {
      console.log(line);
    }
    this.rotateIfNeeded();
    fs.appendFileSync(this.filePath, line + '\n', 'utf8');
  }

  private rotateIfNeeded(): void {
    try {
      const stat = fs.statSync(this.filePath);
      if (stat.size < MAX_SIZE) return;
      const rotated = `${this.filePath}.1`;
      try {
        fs.rmSync(rotated, { force: true });
      } catch {
        return;
      }
      fs.renameSync(this.filePath, rotated);
    } catch {
      // ignore missing file
    }
  }
}

function redactValue(value: unknown, depth = 0): unknown {
  if (depth > 8) {
    return '[MaxDepth]';
  }
  if (typeof value === 'string') {
    return redactText(value);
  }
  if (typeof value !== 'object' || value === null) {
    return value;
  }
  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactText(value.message),
      stack: value.stack ? redactText(value.stack) : undefined,
    };
  }
  if (Array.isArray(value)) {
    return value.map((entry) => redactValue(entry, depth + 1));
  }
  const output: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    output[key] = SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : redactValue(entry, depth + 1);
  }
  return output;
}

function redactText(value: string): string {
  return value
    .replace(TELEGRAM_BOT_TOKEN_PATTERN, REDACTED)
    .replace(BEARER_TOKEN_PATTERN, `Bearer ${REDACTED}`)
    .replace(OPENAI_SESSION_TOKEN_PATTERN, REDACTED);
}
