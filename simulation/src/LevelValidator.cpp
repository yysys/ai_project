#include "PuzzleSolver.h"
#include "Tile.h"
#include <iostream>
#include <fstream>
#include <filesystem>
#include <chrono>
#include <iomanip>
#include "json.hpp"

using json = nlohmann::json;
namespace fs = std::filesystem;

Tile jsonToTile(const json& j) {
    Tile tile;
    tile.id = j["id"];
    tile.gridCol = j["gridCol"];
    tile.gridRow = j["gridRow"];
    tile.gridColSpan = j["gridColSpan"];
    tile.gridRowSpan = j["gridRowSpan"];
    tile.direction = Tile::directionFromString(j["direction"]);
    tile.unitType = Tile::unitTypeFromString(j["unitType"]);
    tile.type = (tile.gridColSpan > 1 && tile.gridRowSpan > 1) ? TileType::SINGLE :
                (tile.gridColSpan > 1) ? TileType::HORIZONTAL :
                (tile.gridRowSpan > 1) ? TileType::VERTICAL : TileType::SINGLE;
    return tile;
}

PuzzleLevel jsonToLevel(const json& j) {
    PuzzleLevel level;
    level.id = j["id"];
    level.name = j["name"];
    level.type = j["type"];
    level.unlocked = j["unlocked"];
    level.timeLimit = j["timeLimit"];
    
    for (const auto& tileJson : j["tiles"]) {
        level.tiles.push_back(jsonToTile(tileJson));
    }
    
    for (auto& tile : level.tiles) {
        if (tile.unitType == UnitType::DOG) {
            level.dogTile = &tile;
            break;
        }
    }
    
    return level;
}

struct ValidationResult {
    int levelId;
    bool solvable;
    int tileCount;
    int checkTimeMs;
    std::string error;
};

int main(int argc, char* argv[]) {
    std::cout << "==========================================" << std::endl;
    std::cout << "   Level Validation Tool v1.0             " << std::endl;
    std::cout << "==========================================" << std::endl;
    std::cout << std::endl;
    
    std::string inputDir = "../simulation_json";
    bool regenerate = false;
    int maxRetries = 20;
    
    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "-d") == 0 && i + 1 < argc) {
            inputDir = argv[++i];
        } else if (strcmp(argv[i], "-r") == 0) {
            regenerate = true;
        } else if (strcmp(argv[i], "-m") == 0 && i + 1 < argc) {
            maxRetries = std::atoi(argv[++i]);
        }
    }
    
    std::cout << "Configuration:" << std::endl;
    std::cout << "  - Input directory: " << inputDir << std::endl;
    std::cout << "  - Max retries for regeneration: " << maxRetries << std::endl;
    std::cout << std::endl;
    
    std::vector<ValidationResult> results;
    std::vector<int> unsolvableLevels;
    
    PuzzleSolver solver(14);
    solver.setMaxDepth(500);
    solver.setMaxStates(50000);
    
    std::vector<std::string> levelFiles;
    for (const auto& entry : fs::directory_iterator(inputDir)) {
        if (entry.path().extension() == ".json") {
            std::string filename = entry.path().filename().string();
            if (filename.find("level_") == 0 && filename != "levels.json") {
                levelFiles.push_back(entry.path().string());
            }
        }
    }
    
    std::sort(levelFiles.begin(), levelFiles.end(), [](const std::string& a, const std::string& b) {
        auto extractNumber = [](const std::string& s) -> int {
            size_t lastUnderscore = s.rfind('_');
            size_t dot = s.rfind('.');
            if (lastUnderscore != std::string::npos && dot != std::string::npos) {
                return std::stoi(s.substr(lastUnderscore + 1, dot - lastUnderscore - 1));
            }
            return 0;
        };
        return extractNumber(a) < extractNumber(b);
    });
    
    std::cout << "Found " << levelFiles.size() << " level files to validate." << std::endl;
    std::cout << std::endl;
    
    for (const auto& filepath : levelFiles) {
        ValidationResult result;
        
        std::ifstream file(filepath);
        if (!file.is_open()) {
            result.error = "Could not open file";
            std::cerr << "ERROR: Could not open " << filepath << std::endl;
            continue;
        }
        
        json levelArray;
        try {
            file >> levelArray;
        } catch (const json::parse_error& e) {
            result.error = "JSON parse error: " + std::string(e.what());
            std::cerr << "ERROR: JSON parse error in " << filepath << ": " << e.what() << std::endl;
            continue;
        }
        
        if (!levelArray.is_array() || levelArray.empty()) {
            result.error = "Invalid level format";
            std::cerr << "ERROR: Invalid level format in " << filepath << std::endl;
            continue;
        }
        
        PuzzleLevel level = jsonToLevel(levelArray[0]);
        result.levelId = level.id;
        result.tileCount = level.tiles.size();
        
        std::cout << "Validating Level " << level.id << " (" << level.tiles.size() << " tiles)..." << std::flush;
        
        auto startTime = std::chrono::high_resolution_clock::now();
        result.solvable = solver.isSolvable(level);
        auto endTime = std::chrono::high_resolution_clock::now();
        
        result.checkTimeMs = std::chrono::duration_cast<std::chrono::milliseconds>(endTime - startTime).count();
        
        if (result.solvable) {
            std::cout << " SOLVABLE (" << result.checkTimeMs << "ms)" << std::endl;
        } else {
            std::cout << " NOT SOLVABLE (" << result.checkTimeMs << "ms)" << std::endl;
            unsolvableLevels.push_back(level.id);
        }
        
        results.push_back(result);
    }
    
    std::cout << std::endl;
    std::cout << "==========================================" << std::endl;
    std::cout << "        VALIDATION SUMMARY                " << std::endl;
    std::cout << "==========================================" << std::endl;
    std::cout << std::endl;
    
    int solvableCount = 0;
    int unsolvableCount = 0;
    
    for (const auto& result : results) {
        if (result.solvable) {
            solvableCount++;
        } else {
            unsolvableCount++;
        }
    }
    
    std::cout << "Total levels checked: " << results.size() << std::endl;
    std::cout << "Solvable levels: " << solvableCount << std::endl;
    std::cout << "Unsolvable levels: " << unsolvableCount << std::endl;
    
    if (!unsolvableLevels.empty()) {
        std::cout << std::endl;
        std::cout << "Unsolvable level IDs: ";
        for (size_t i = 0; i < unsolvableLevels.size(); i++) {
            if (i > 0) std::cout << ", ";
            std::cout << unsolvableLevels[i];
        }
        std::cout << std::endl;
    }
    
    std::cout << std::endl;
    
    if (unsolvableCount > 0) {
        std::cout << "ACTION REQUIRED: " << unsolvableCount << " levels need to be regenerated." << std::endl;
        return 1;
    } else {
        std::cout << "All levels are solvable!" << std::endl;
        return 0;
    }
}
