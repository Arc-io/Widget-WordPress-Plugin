#!/usr/bin/env bash

# Copyright _!_
#
# License _!_

set -e

scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
projectDir="$scriptDir/../"

"$scriptDir/pre-deploy.sh"

cd "$projectDir"

trunkVersionLine=$(grep '^* Version' trunk/arc.php)
trunkVersion=${trunkVersionLine/* Version: /''}

readmeVersionLine=$(grep '^Stable tag' trunk/readme.txt)
readmeVersion=${readmeVersionLine/Stable tag: /''}

semverRegex='^([0-9]+\.){0,2}(\*|[0-9]+)$'

if [[ ! $trunkVersion =~ $semverRegex ]]
then
    echo "Version is not in semver format: '$trunkVersion'"
    exit 1
elif [ -d "tags/"$trunkVersion"" ]
then
    echo "Version $trunkVersion is already deployed."
    exit 1
elif [[ "$trunkVersion" != "$readmeVersion" ]]
then
    echo "Version mismatch detected"
    echo
    echo "1. Ensure that \"Version:\" in trunk/arc.php and \"Stable tag:\" in trunk/readme.txt are both $trunkVersion."
    echo "2. Commit and push to the remote git repo."
    echo "3. Run this script again."
    exit 1
fi

read -p "Deploy version $trunkVersion [y/n]" -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

svn cp trunk tags/"$trunkVersion"

svn ci -m "Tagging version $trunkVersion"

echo
echo
echo ">> Arc Wordpress Plugin version $trunkVersion deployed successfully. <<"
