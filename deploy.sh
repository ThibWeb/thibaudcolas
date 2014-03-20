#!/bin/bash

if [ "$TRAVIS_REPO_SLUG" == "ThibWeb/thibaudcolas" ] && [ "$TRAVIS_BRANCH" == "master" ]; then

  echo -e "Deploying to GitHub Pages...\n"

  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "travis-ci"

  cd build
  git init .
  git add -f .
  git commit -m "Lastest deploy on successful travis build $TRAVIS_BUILD_NUMBER auto-pushed to gh-pages"
  git push -fq "https://${GH_TOKEN}@github.com/ThibWeb/thibaudcolas" "master:gh-pages" > /dev/null

  echo -e "Finished deploy to GitHub Pages...\n"

fi
