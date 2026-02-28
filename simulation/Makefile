CXX = clang++
CXXFLAGS = -std=c++17 -Wall -Wextra -O2 -Isrc
SRC_DIR = src
BUILD_DIR = build
TARGET = puzzle_sim
VALIDATOR = level_validator
ANALYZER = difficulty_analyzer

COMMON_SOURCES = $(SRC_DIR)/Tile.cpp \
                 $(SRC_DIR)/PuzzleGenerator.cpp \
                 $(SRC_DIR)/PuzzleSolver.cpp \
                 $(SRC_DIR)/LevelExporter.cpp \
                 $(SRC_DIR)/Utils.cpp

MAIN_SOURCES = $(SRC_DIR)/main.cpp
VALIDATOR_SOURCES = $(SRC_DIR)/LevelValidator.cpp
ANALYZER_SOURCES = $(SRC_DIR)/DifficultyAnalyzer.cpp

COMMON_OBJECTS = $(COMMON_SOURCES:$(SRC_DIR)/%.cpp=$(BUILD_DIR)/%.o)
MAIN_OBJECT = $(MAIN_SOURCES:$(SRC_DIR)/%.cpp=$(BUILD_DIR)/%.o)
VALIDATOR_OBJECT = $(VALIDATOR_SOURCES:$(SRC_DIR)/%.cpp=$(BUILD_DIR)/%.o)
ANALYZER_OBJECT = $(ANALYZER_SOURCES:$(SRC_DIR)/%.cpp=$(BUILD_DIR)/%.o)

all: $(BUILD_DIR)/$(TARGET) $(BUILD_DIR)/$(VALIDATOR) $(BUILD_DIR)/$(ANALYZER)

$(BUILD_DIR)/$(TARGET): $(MAIN_OBJECT) $(COMMON_OBJECTS) | $(BUILD_DIR)
	$(CXX) $(CXXFLAGS) -o $@ $(MAIN_OBJECT) $(COMMON_OBJECTS)

$(BUILD_DIR)/$(VALIDATOR): $(VALIDATOR_OBJECT) $(COMMON_OBJECTS) | $(BUILD_DIR)
	$(CXX) $(CXXFLAGS) -o $@ $(VALIDATOR_OBJECT) $(COMMON_OBJECTS)

$(BUILD_DIR)/$(ANALYZER): $(ANALYZER_OBJECT) $(COMMON_OBJECTS) | $(BUILD_DIR)
	$(CXX) $(CXXFLAGS) -o $@ $(ANALYZER_OBJECT) $(COMMON_OBJECTS)

$(BUILD_DIR)/%.o: $(SRC_DIR)/%.cpp | $(BUILD_DIR)
	$(CXX) $(CXXFLAGS) -c $< -o $@

$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

clean:
	rm -rf $(BUILD_DIR)

test: $(BUILD_DIR)/$(TARGET)
	./$(BUILD_DIR)/$(TARGET) < test_input.txt

validate: $(BUILD_DIR)/$(VALIDATOR)
	./$(BUILD_DIR)/$(VALIDATOR) -d ../simulation_json

analyze: $(BUILD_DIR)/$(ANALYZER)
	./$(BUILD_DIR)/$(ANALYZER) -d ../simulation_json

.PHONY: all clean test validate analyze
