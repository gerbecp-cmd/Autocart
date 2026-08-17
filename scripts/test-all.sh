#!/usr/bin/env bash
set -euo pipefail
node web/test-core.cjs
node --check web/app.js
node --check web/sw.js
(cd worker && npm test)
echo "AutoCart core checks PASS"
