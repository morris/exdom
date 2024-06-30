set -ex

rm -rf test-build coverage

tsc --project tsconfig.test.json

playwright test
c8 report --reporter lcov --reporter text
