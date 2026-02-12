#!/bin/bash

mkdir -p build
cd build

cmake ..
make

if [ $? -eq 0 ]; then
    echo "Build successful!"
    echo "Run the program with: ./build/puzzle_sim"
else
    echo "Build failed!"
    exit 1
fi
