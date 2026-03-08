#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
SERVICE_LABEL="com.ganxing.telegram-codex-app-bridge"
APP_HOME="${HOME}/.telegram-codex-app-bridge"
APP_LOG_DIR="${APP_HOME}/logs"
APP_BIN_DIR="${APP_HOME}/bin"
RUNNER_PATH="${APP_BIN_DIR}/run-bridge.sh"
LAUNCHD_PLIST="${HOME}/Library/LaunchAgents/${SERVICE_LABEL}.plist"
SYSTEMD_UNIT_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
SYSTEMD_UNIT_NAME="${SERVICE_LABEL}.service"
SYSTEMD_UNIT_PATH="${SYSTEMD_UNIT_DIR}/${SYSTEMD_UNIT_NAME}"
NODE_BIN="$(command -v node || true)"
PATH_VALUE="${PATH}"
HOME_VALUE="${HOME}"
USER_VALUE="${USER:-$(id -un)}"
LOGNAME_VALUE="${LOGNAME:-$USER_VALUE}"

platform_name() {
  local uname_value
  uname_value="$(uname -s)"
  case "$uname_value" in
    Darwin) echo "darwin" ;;
    Linux) echo "linux" ;;
    *) echo "unsupported" ;;
  esac
}

require_supported_platform() {
  local platform
  platform="$(platform_name)"
  if [[ "$platform" == "unsupported" ]]; then
    echo "unsupported platform: $(uname -s)" >&2
    exit 1
  fi
}

require_node_bin() {
  if [[ -z "$NODE_BIN" ]]; then
    echo "node not found in PATH" >&2
    exit 1
  fi
}

require_built_bridge() {
  if [[ ! -f "${ROOT_DIR}/dist/main.js" ]]; then
    echo "dist/main.js not found. Run 'npm run build' first." >&2
    exit 1
  fi
}

ensure_app_dirs() {
  mkdir -p "$APP_LOG_DIR" "$APP_BIN_DIR"
}

write_runner_script() {
  ensure_app_dirs
  cat > "$RUNNER_PATH" <<EOF
#!/usr/bin/env bash
set -euo pipefail
cd "${ROOT_DIR}"
exec "${NODE_BIN}" "${ROOT_DIR}/dist/main.js" serve
EOF
}

require_systemctl() {
  if ! command -v systemctl >/dev/null 2>&1; then
    echo "systemctl not found; systemd user services are unavailable on this host" >&2
    exit 1
  fi
}

require_journalctl() {
  if ! command -v journalctl >/dev/null 2>&1; then
    echo "journalctl not found" >&2
    exit 1
  fi
}

require_launchd_agent() {
  if [[ ! -f "$LAUNCHD_PLIST" ]]; then
    echo "launchd agent is not installed: $LAUNCHD_PLIST" >&2
    exit 1
  fi
}

require_systemd_unit() {
  if [[ ! -f "$SYSTEMD_UNIT_PATH" ]]; then
    echo "systemd user unit is not installed: $SYSTEMD_UNIT_PATH" >&2
    exit 1
  fi
}
