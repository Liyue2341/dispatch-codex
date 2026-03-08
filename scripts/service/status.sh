#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=scripts/service/_common.sh
source "${SCRIPT_DIR}/_common.sh"

require_supported_platform
case "$(platform_name)" in
  darwin)
    require_launchd_agent
    launchctl print "gui/${UID}/${SERVICE_LABEL}"
    ;;
  linux)
    require_systemctl
    require_systemd_unit
    systemctl --user status "$SYSTEMD_UNIT_NAME" --no-pager
    ;;
esac
