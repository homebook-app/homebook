#!/usr/bin/env bash
#
# Regenerates the OpenAPI document and both API clients (C# and TypeScript) with Kiota.
#
# Usage: ./scripts/generate-clients.sh
# Environment overrides: CLIENT_CLASS, CLIENT_NAMESPACE, OPENAPI_FILE, KIOTA_VERSION
#
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

CLIENT_CLASS="${CLIENT_CLASS:-BackendClient}"
CLIENT_NAMESPACE="${CLIENT_NAMESPACE:-HomeBook.Client}"
OPENAPI_FILE="${OPENAPI_FILE:-backend/HomeBook.Backend/HomeBook.Backend.json}"
KIOTA_VERSION="${KIOTA_VERSION:-1.35.0}"

CSHARP_OUTPUT_DIR="backend/HomeBook.Client"
CSHARP_CSPROJ="HomeBook.Client.csproj"
TS_OUTPUT_DIR="frontend/packages/api-client/src/generated"

export OPENAPI_FILE
./scripts/generate-openapi.sh

echo "==> Installing Kiota ${KIOTA_VERSION}"
dotnet tool update --global Microsoft.OpenApi.Kiota --version "${KIOTA_VERSION}" >/dev/null
export PATH="${PATH}:${HOME}/.dotnet/tools"

echo "==> Generating C# client into ${CSHARP_OUTPUT_DIR}"
# Clean the output directory but keep the project file, which is not generated.
find "${CSHARP_OUTPUT_DIR}" -mindepth 1 ! -name "${CSHARP_CSPROJ}" -exec rm -rf {} +
kiota generate \
    --language csharp \
    --class-name "${CLIENT_CLASS}" \
    --namespace-name "${CLIENT_NAMESPACE}" \
    --openapi "${OPENAPI_FILE}" \
    --output "${CSHARP_OUTPUT_DIR}"

# GET /storage/scopes returns a bare GUID. Kiota emits a "Guid" primitive for it that the TypeScript
# runtime cannot deserialize, so the operation is excluded here and implemented by hand in the package.
echo "==> Generating TypeScript client into ${TS_OUTPUT_DIR}"
kiota generate \
    --language typescript \
    --class-name "${CLIENT_CLASS}" \
    --namespace-name "${CLIENT_NAMESPACE}" \
    --openapi "${OPENAPI_FILE}" \
    --output "${TS_OUTPUT_DIR}" \
    --exclude-path "**/storage/scopes#GET" \
    --exclude-backward-compatible \
    --clean-output

echo "==> Restoring ${CSHARP_OUTPUT_DIR}/${CSHARP_CSPROJ}"
dotnet restore "${CSHARP_OUTPUT_DIR}/${CSHARP_CSPROJ}" --nologo -v quiet

echo "==> Client generation completed"
