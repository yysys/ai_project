CXX = clang++
CXXFLAGS = -std=c++17 -Wall -Wextra -O2 -Isrc
SRC_DIR = src
BUILD_DIR = build
TARGET = puzzle_sim

SOURCES = $(SRC_DIR)/main.cpp \
          $(SRC_DIR)/Tile.cpp \
          $(SRC_DIR)/PuzzleGenerator.cpp \
          $(SRC_DIR)/PuzzleSolver.cpp \
          $(SRC_DIR)/LevelExporter.cpp \
          $(SRC_DIR)/Utils.cpp

OBJECTS = $(SOURCES:$(SRC_DIR)/%.cpp=$(BUILD_DIR)/%.o)

all: $(BUILD_DIR)/$(TARGET)

$(BUILD_DIR)/$(TARGET): $(OBJECTS) | $(BUILD_DIR)
	$(CXX) $(CXXFLAGS) -o $@ $(OBJECTS)

$(BUILD_DIR)/%.o: $(SRC_DIR)/%.cpp | $(BUILD_DIR)
	$(CXX) $(CXXFLAGS) -c $< -o $@

$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

clean:
	rm -rf $(BUILD_DIR)

test: $(BUILD_DIR)/$(TARGET)
	./$(BUILD_DIR)/$(TARGET) < test_input.txt

.PHONY: all clean test
