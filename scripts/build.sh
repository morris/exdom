set -ex

rm -rf dist

tsc --project tsconfig.build.json

esbuild dist/index.js --bundle --format=esm --outfile=dist/exdom.js
esbuild dist/index.js --bundle --format=esm --minify --outfile=dist/exdom.min.js
