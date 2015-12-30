#!/usr/bin/env bash
set -eu

# Run the tests with the hapi version supported by current version of nodejs

if [[ "$( node --version )" =~ v([0-9])\.[0-9]{1,2}\.[0-9]{1,2} ]]; then
    node_version_major=${BASH_REMATCH[1]}
else
    echo "Can't determine version of nodejs"
    exit 1
fi

case "$node_version_major" in

0)
    hapi_versions=( 8 9 )
    ;;
4)
    hapi_versions=( 10 11 )
    ;;
5)
    hapi_versions=( 11 )
    ;;
*)
    echo "Unexpected nodejs version"
    exit 1
    ;;
esac

for version in "${hapi_versions[@]}"
do
    echo "Testing with hapi version $version"
    npm install "hapi@$version"
    npm test
done
