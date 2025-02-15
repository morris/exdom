#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail
set -x

rm -rf dist

tsc --project tsconfig.build.json

terser dist/exdom.js --compress --mangle toplevel --output dist/exdom.min.js
