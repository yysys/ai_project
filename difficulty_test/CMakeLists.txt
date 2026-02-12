cmake_minimum_required(VERSION 3.10)
project(DifficultyTest)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(nlohmann_json 3.2.0 REQUIRED)

include_directories(${nlohmann_json_INCLUDE_DIR})

add_executable(difficulty_test
    main.cpp
    Tile.cpp
    DifficultyAnalyzer.cpp
)

target_link_libraries(difficulty_test PRIVATE nlohmann_json::nlohmann_json)
