#!/bin/bash

# Check if a package name is provided as an argument
if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <package-name>"
  exit 1
fi

package_name="$1"
echo "Usage: $package_name"

# Get a list of versions
versions=$(npm view $package_name versions | sed  "s/[][',]//g" | tac)
echo "Versions : $versions"
# Loop through each version and uninstall it
for version in $versions
do
    echo "Version : $version"
  npm unpublish $package_name@$version
done
