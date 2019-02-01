set -e
ls .origin-push || git remote get-url --push origin > .origin-push
npm run format
npm run build
git pull -r
npm test
git remote set-url --push origin `cat .origin-push`
git push || git remote set-url --push origin no_push
git remote set-url --push origin no_push
