#!/bin/bash
set -f

ng build @rosoftlab/core --configuration development

rm -f -r /f/Work/Rosoftlab/nexity-ecosystem/src/web/nexity.web/node_modules/@rosoftlab/core/*.* -v

cp dist/rosoftlab/core /f/Work/Rosoftlab/nexity-ecosystem/src/web/nexity.web/node_modules/@rosoftlab/core -r