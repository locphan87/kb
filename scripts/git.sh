#!/bin/bash

# create an empty git repository
git init

# set my name and email
git config user.name "Loc Phan"
git config user.email "phanhoangloc@gmail.com"

# create a new branch develop and switch to it
git checkout -b develop

# add a file to the repository
echo "Hello, World!" >hello.txt
git add hello.txt

# commit the file and push it to the remote repository
git commit -m "Initial commit"
git remote add origin

# back to main branch
git checkout main

# merge the develop branch into main
git merge develop

# rebase the develop branch onto main
git checkout develop
git rebase main

# show me the last 10 commits on develop
git log -n 10
# Show me the last 10 commits on all branches
git log --all -n 10
# Show me the last 10 commits on all branches and show the commit graph
git log --all --graph -n 10
# Show me the last 10 commits on all branches and show the graph and author
git log --all --graph --pretty=format:"%h %an %s" -n 10
# revert last commit
git revert HEAD
# revert last commit and keep changes
git revert --no-commit HEAD
# remove all merged branches
git branch --merged | grep -v "main" | xargs git branch -d
