#!/usr/bin/env bash
#
# Generates the complete OpenAPI document of the HomeBook backend.
#
# The build-time document only covers the SETUP state. To get every route (account,
# info, user, search, storage, media and all module routes) the backend has to run in
# the RUNNING state, which is decided by the presence of Database:Provider. The backend
# reads configuration from environment variables with the HB_ prefix, so an in-memory
# SQLite provider is enough to reach RUNNING without touching the file system.
#
# Usage: ./scripts/generate-openapi.sh
# Environment overrides: OPENAPI_PORT (default 5199), OPENAPI_FILE, OPENAPI_TIMEOUT_SECONDS
#
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

BACKEND_CSPROJ="backend/HomeBook.Backend/HomeBook.Backend.csproj"
OPENAPI_FILE="${OPENAPI_FILE:-backend/HomeBook.Backend/HomeBook.Backend.json}"
OPENAPI_PORT="${OPENAPI_PORT:-5199}"
OPENAPI_TIMEOUT_SECONDS="${OPENAPI_TIMEOUT_SECONDS:-60}"
BASE_URL="http://127.0.0.1:${OPENAPI_PORT}"

for tool in dotnet jq curl; do
    if ! command -v "${tool}" >/dev/null 2>&1; then
        echo "error: '${tool}' is required but not found on PATH" >&2
        exit 1
    fi
done

WORK_DIR="$(mktemp -d)"
BACKEND_PID=""

cleanup() {
    local exit_code=$?
    if [[ -n "${BACKEND_PID}" ]] && kill -0 "${BACKEND_PID}" 2>/dev/null; then
        kill "${BACKEND_PID}" 2>/dev/null || true
        wait "${BACKEND_PID}" 2>/dev/null || true
    fi
    rm -rf "${WORK_DIR}"
    exit "${exit_code}"
}
trap cleanup EXIT

echo "==> Publishing backend (Release) to ${WORK_DIR}/app"
dotnet publish "${BACKEND_CSPROJ}" -c Release -o "${WORK_DIR}/app" --nologo -v quiet

echo "==> Starting backend on ${BASE_URL}"
(
    cd "${WORK_DIR}/app"
    ASPNETCORE_ENVIRONMENT=Development \
    ASPNETCORE_URLS="${BASE_URL}" \
    HB_Database__Provider=SQLITE \
    HB_Database__UseInMemory=true \
    DOTNET_NOLOGO=1 \
    exec dotnet HomeBook.Backend.dll
) >"${WORK_DIR}/backend.log" 2>&1 &
BACKEND_PID=$!

echo "==> Waiting for backend"
deadline=$(( $(date +%s) + OPENAPI_TIMEOUT_SECONDS ))
until curl -fsS "${BASE_URL}/version" >/dev/null 2>&1; do
    if ! kill -0 "${BACKEND_PID}" 2>/dev/null; then
        echo "error: backend exited before becoming ready" >&2
        cat "${WORK_DIR}/backend.log" >&2
        exit 1
    fi
    if (( $(date +%s) >= deadline )); then
        echo "error: backend did not become ready within ${OPENAPI_TIMEOUT_SECONDS}s" >&2
        cat "${WORK_DIR}/backend.log" >&2
        exit 1
    fi
    sleep 1
done

echo "==> Fetching ${BASE_URL}/openapi/v1.json"
# The runtime document lists the temporary local server, which must not end up in the clients.
curl -fsS "${BASE_URL}/openapi/v1.json" | jq -S 'del(.servers)' >"${WORK_DIR}/openapi.json"

echo "==> Verifying document"
verify() {
    local description="$1"
    local filter="$2"
    if ! jq -e "${filter}" "${WORK_DIR}/openapi.json" >/dev/null; then
        echo "error: verification failed: ${description}" >&2
        exit 1
    fi
}
verify "more than 21 paths" '.paths | length > 21'
for required_path in \
    "/account/login" \
    "/info" \
    "/user/preferences/locale" \
    "/search" \
    "/storage/files" \
    "/media/{mediaId}/url"; do
    verify "path ${required_path}" ".paths | has(\"${required_path}\")"
done
verify "kitchen module paths" '.paths | keys | any(startswith("/modules/homebook/kitchen"))'
verify "finances module paths" '.paths | keys | any(startswith("/modules/homebook/finances"))'
verify "security scheme" '.components.securitySchemes | length > 0'
verify "protected operation carries security" '.paths["/search"].get.security | length > 0'

cp "${WORK_DIR}/openapi.json" "${OPENAPI_FILE}"

path_count="$(jq '.paths | length' "${OPENAPI_FILE}")"
echo "==> Wrote ${OPENAPI_FILE} (${path_count} paths)"
