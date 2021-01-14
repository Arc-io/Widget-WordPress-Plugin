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

trunkVersionLine=$(grep '^* Version' trunk/arc.php)
trunkVersion=${trunkVersionLine/* Version: /''}

if [[ "$version" != "$trunkVersion" ]]
then
    echo "Version ($version) does not match the version in trunk/arc.php ($trunkVersion)"
    exit 1
fi

readmeVersionLine=$(grep '^Stable tag' trunk/readme.txt)
readmeVersion=${readmeVersionLine/Stable tag: /''}

if [[ "$version" != "$readmeVersion" ]]
then
    echo "Version ($version) does not match the version in trunk/readme.txt ($readmeVersion)"
    exit 1
fi

echo "Deploying version $version to svn."

svn cp trunk tags/"$version"

svn ci -m "Tagging version $version"

echo
echo
echo ">> Arc Wordpress Plugin deployed successfully. <<"
