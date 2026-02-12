cmake_minimum_required(VERSION 3.10)
project(PuzzleSimulation)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(${PROJECT_SOURCE_DIR}/src)

set(SOURCES
    src/main.cpp
    src/Tile.cpp
    src/PuzzleGenerator.cpp
    src/PuzzleSolver.cpp
    src/LevelExporter.cpp
    src/Utils.cpp
)

add_executable(puzzle_sim ${SOURCES})

if(UNIX AND NOT APPLE)
    target_link_libraries(puzzle_sim pthread)
endif()
