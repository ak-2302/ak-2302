#!/usr/bin/env bash

set -Eeuo pipefail

readonly APP_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
readonly SERVICE_NAME="${AK2302_SERVICE_NAME:-ak-2302.service}"
readonly HEALTH_URL="${AK2302_HEALTH_URL:-http://127.0.0.1:18080/}"
readonly HEALTH_ATTEMPTS="${AK2302_HEALTH_ATTEMPTS:-20}"

cd "$APP_ROOT"

printf 'Checking types...\n'
npm run lint

printf 'Running tests...\n'
npm test -- --run

printf 'Building production files...\n'
npm run build

printf 'Restarting %s...\n' "$SERVICE_NAME"
systemctl --user restart "$SERVICE_NAME"

printf 'Waiting for %s...\n' "$HEALTH_URL"
for ((attempt = 1; attempt <= HEALTH_ATTEMPTS; attempt += 1)); do
  if curl --fail --silent --output /dev/null "$HEALTH_URL"; then
    printf 'Published successfully: %s\n' "$HEALTH_URL"
    exit 0
  fi

  sleep 1
done

printf 'Health check failed after %s attempts.\n' "$HEALTH_ATTEMPTS" >&2
systemctl --user --no-pager --lines=20 status "$SERVICE_NAME" >&2 || true
exit 1
