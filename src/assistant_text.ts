export function sanitizeAssistantText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return value ?? null;
  }
  const normalized = value.replace(/\r\n?/g, '\n');
  let output = '';
  let cursor = 0;
  while (cursor < normalized.length) {
    const openIndex = normalized.indexOf('<think>', cursor);
    if (openIndex === -1) {
      output += normalized.slice(cursor);
      break;
    }
    output += normalized.slice(cursor, openIndex);
    const closeIndex = normalized.indexOf('</think>', openIndex + '<think>'.length);
    if (closeIndex === -1) {
      break;
    }
    cursor = closeIndex + '</think>'.length;
  }
  const cleaned = output
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trimStart();
  return cleaned;
}
