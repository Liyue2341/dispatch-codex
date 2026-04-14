#!/usr/bin/env bash
set -euo pipefail

REAL_BIN="${CODEX_REAL_BIN:-}"
if [[ -z "$REAL_BIN" ]]; then
  REAL_BIN="$(command -v codex || true)"
fi
if [[ -z "$REAL_BIN" || ! -x "$REAL_BIN" ]]; then
  echo "codex binary not found; set CODEX_REAL_BIN to a runnable codex path" >&2
  exit 1
fi
if [[ "$(readlink -f "$REAL_BIN")" == "$(readlink -f "$0")" ]]; then
  echo "CODEX_REAL_BIN points back to the wrapper; refusing to recurse" >&2
  exit 1
fi

PROVIDER_ID="${CODEX_PROVIDER_ID:-cliproxyminimax}"
PROVIDER_NAME="${CODEX_PROVIDER_NAME:-CLIProxyAPI MiniMax}"
BASE_URL="${CODEX_PROVIDER_BASE_URL:-http://127.0.0.1:8320/api/provider/minimax-codex/v1}"
DEFAULT_MODEL="${CODEX_PROVIDER_DEFAULT_MODEL:-MiniMax-M2.7}"
ENV_KEY_NAME="${CODEX_PROVIDER_ENV_KEY:-CLIPROXY_CODEX_API_KEY}"

exec "$REAL_BIN" \
  -c "model_provider=\"${PROVIDER_ID}\"" \
  -c "model=\"${DEFAULT_MODEL}\"" \
  -c "model_providers.${PROVIDER_ID}.name=\"${PROVIDER_NAME}\"" \
  -c "model_providers.${PROVIDER_ID}.base_url=\"${BASE_URL}\"" \
  -c "model_providers.${PROVIDER_ID}.wire_api=\"responses\"" \
  -c "model_providers.${PROVIDER_ID}.env_key=\"${ENV_KEY_NAME}\"" \
  -c "model_providers.${PROVIDER_ID}.requires_openai_auth=false" \
  -c "model_providers.${PROVIDER_ID}.supports_websockets=false" \
  "$@"
