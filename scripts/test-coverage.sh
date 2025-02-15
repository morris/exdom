#!/usr/bin/env bash
set -o errexit
set -o pipefail
set -x

rm -rf coverage test-build

tsc --project tsconfig.test.json

c8 --include src --include test-build/src --reporter text --reporter lcov playwright test $1 $2 $3
