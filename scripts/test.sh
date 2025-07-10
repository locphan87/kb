#!/bin/bash
# Check for a directory and print a message if it doesn't exist
if [ ! -d "$1" ]; then
  echo "Directory $1 does not exist."
else
  echo "Directory $1 exists."
fi

# Find all PDF files in my home directory and print the path to each one
find ~/ -type f -name "*.pdf" -print
