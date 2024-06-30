set -ex

rm -rf test-build coverage

tsc --project tsconfig.test.json

playwright test $1 $2 $3
c8 report --reporter lcov --reporter text
