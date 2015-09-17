#!/bin/sh
cd $(dirname $0)
cd ../
npm-check-updates
echo -e "\n####### Don't update browserify #######\n"
