#!/bin/bash
set -eu
IFS="`printf '\n\t'`"

githubRepo="git@github.com:bsheth711/LeetcodeSolutions.git"
localFolder="../REPO"

cd "$(dirname "$0")"

if ! test -d $localFolder; then
	git clone $githubRepo $localFolder
	echo -e "# Leetcode Solutions\nThis repository is programatically generated and updated by [LeetCodeExtract](https://github.com/bsheth711/LeetCodeExtract)." > "${localFolder}/README.md"
fi

# FYI: a unix style path does not work from windows mingw environment variable path for node.exe
node main.js
cd $localFolder
git add .
git commit -m "update"
git push