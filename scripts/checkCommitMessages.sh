#!/bin/bash

set -e

exitCode=0

# master=`git show master --pretty=format:"%h" --no-patch`

lastMerge=`git log --merges -n 1 --pretty=format:"%h" --no-patch`

commitsSinceLastMerge=`git log --pretty=format:"%h" $lastMerge..HEAD`

echo "lastMerge: $lastMerge"
echo "commits since lastMerge: $commitsSinceLastMerge"

# Loop over all commits since lastMerge
# Exit with exit code 1 if it does not match the desired pattern
while read commit; do
  msg=$(git show $commit --no-patch --pretty=format:"%s" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

  if ! [[ $msg =~ ^((chore|ci|docs|feat|fix|merge|perf|refact|refactor|style|test)(\([a-zA-Z0-9\-]+\))?:|Merge\ pull) ]]; then
    echo "commit: $commit has bad (or wip) commit message: \"$msg\""
    echo "remember to use semantic commit messages!"
    exitCode=1
  fi
done <<< $commitsSinceLastMerge

exit $exitCode
