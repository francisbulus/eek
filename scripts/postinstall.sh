#!/bin/bash

# Print commands as they are executed
# Stop executing on first error
set +v
set +x
set -e

dir=$(dirname "$0")

cd $dir/..

direnv allow . && eval "$(direnv export bash)"

node -e "process.exitCode = process.env.npm_execpath.includes('pnpm') ? 1 : 0;" && npx pnpm@5 install || echo "dependencies installed with pnpm"

scripts/syncHandlers.sh
