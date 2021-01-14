#!/usr/bin/env bash

# Copyright _!_
#
# License _!_

if ! git diff-index --quiet HEAD --; then
    echo "Cannot deploy. The git index is dirty, you can only deploy with a clean index."
    echo
    echo "Git command to clean the index before deploying:"
    echo "$ git stash"
    echo "$ ./deploy"
    echo "$ git stash pop "
    exit 1
fi

git fetch

localHeadHash=$(git rev-parse master)
remoteHeadHash=$(git rev-parse origin/master)

if [ "$localHeadHash" != "$remoteHeadHash" ]; then
    echo "Cannot deploy. The local repo is out of sync with the remote repo."
    echo
    echo "If remote repo is ahead of local repo"
    echo "$ git pull --rebase"
    echo
    echo "If remote repo is behind local repo"
    echo "$ git push"
    exit 1
else
    echo "Started deployment at `date`..."
    printf "\n"
fi
