#!/usr/bin/env bash
set -o errexit
set -o pipefail
set -x

rm -rf coverage test-build

tsc --project tsconfig.test.json

playwright test $1 $2 $3
