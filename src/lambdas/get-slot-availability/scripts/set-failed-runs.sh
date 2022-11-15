#!/bin/bash

dir=$(dirname "$0")

cd "$dir/../../../../"

direnv allow . && eval "$(direnv export bash)"

echo $PWD

TS_NODE_FILES=true "node_modules/.bin/ts-node" -T "src/lambdas/get-slot-availability/set-failed-runs.ts"
