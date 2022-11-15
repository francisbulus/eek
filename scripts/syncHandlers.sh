#!/bin/bash

# Print commands as they are executed
# Stop executing on first error
set +v
set +x
set -e

dir=$(dirname "$0")

TS_NODE_FILES=1 "$dir/../node_modules/.bin/ts-node" -T "$dir/syncHandlers.ts" $*
