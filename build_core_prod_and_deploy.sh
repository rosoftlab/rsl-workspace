#!/bin/bash
set -f

ng build @rosoftlab/core --configuration production


cd dist/rosoftlab/core

npm publish