#!/usr/bin/env bash

# Copyright _!_
#
# License _!_

set -e

scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
projectDir="$scriptDir/../"

"$scriptDir/pre-deploy.sh"

cd "$projectDir"

if (( "$#" != 1 ))
then
    echo "Usage: ./deploy.sh <version>"
    echo "<version> should be a version number, like 1.3.2"
    exit 1
fi

version=$1

rx='^([0-9]+\.){0,2}(\*|[0-9]+)$'
if [[ ! $version =~ $rx ]]
then
    echo "Version is not in semver format: '$version'"
    exit 1
fi

if [ -d "tags/"$version"" ]
then
    echo "Version $version is already deployed."
    exit 1
fi

trunkVersionLine=$(grep '^* Version' trunk/arc.php)
trunkVersion=${trunkVersionLine/* Version: /''}

readmeVersionLine=$(grep '^Stable tag' trunk/readme.txt)
readmeVersion=${readmeVersionLine/Stable tag: /''}

if [[ "$version" != "$trunkVersion" || "$version" != "$readmeVersion" ]]
then
    echo "Version mismatch detected"
    echo
    echo "1. Ensure that the \"Version:\" in trunk/arc.php and \"Stable tag:\" in trunk/readme.txt are both $version."
    echo "2. Commit and push to the remote git repo."
    echo "3. Run this script again."
    exit 1
fi

echo "Deploying version $version to svn."

svn cp trunk tags/"$version"

svn ci -m "Tagging version $version"

echo
echo
echo ">> Arc Wordpress Plugin deployed successfully. <<"
