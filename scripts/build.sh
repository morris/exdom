set -ex

rm -rf dist

tsc --project tsconfig.build.json

terser dist/exdom.js --compress --mangle toplevel --output dist/exdom.min.js
