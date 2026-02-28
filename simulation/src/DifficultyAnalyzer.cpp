#include "PuzzleSolver.h"
#include "Tile.h"
#include <iostream>
#include <fstream>
#include <filesystem>
#include <chrono>
#include <iomanip>
#include <map>
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

struct DifficultyMetrics {
    int levelId;
    int tileCount;
    int wolfCount;
    int singleTiles;
    int horizontalTiles;
    int verticalTiles;
    int solutionLength;
    int solveTimeMs;
    std::string difficultyRating;
};

std::string getDifficultyRating(int tileCount, int solutionLength) {
    if (tileCount <= 35 && solutionLength <= 3) return "非常简单";
    if (tileCount <= 45 && solutionLength <= 5) return "简单";
    if (tileCount <= 60 && solutionLength <= 8) return "中等";
    if (tileCount <= 75 && solutionLength <= 12) return "困难";
    return "非常困难";
}

int main(int argc, char* argv[]) {
    std::cout << "==========================================" << std::endl;
    std::cout << "   Level Difficulty Analyzer v1.0        " << std::endl;
    std::cout << "==========================================" << std::endl;
    std::cout << std::endl;
    
    std::string inputDir = "../simulation_json";
    
    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "-d") == 0 && i + 1 < argc) {
            inputDir = argv[++i];
        }
    }
    
    std::vector<DifficultyMetrics> metrics;
    
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
    
    std::cout << "Analyzing " << levelFiles.size() << " levels..." << std::endl;
    std::cout << std::endl;
    
    std::cout << std::left << std::setw(8) << "Level" 
              << std::setw(10) << "Tiles" 
              << std::setw(10) << "Wolves"
              << std::setw(10) << "1x1"
              << std::setw(10) << "1x2"
              << std::setw(10) << "2x1"
              << std::setw(12) << "Moves"
              << std::setw(12) << "Time(ms)"
              << "Rating" << std::endl;
    std::cout << std::string(100, '-') << std::endl;
    
    for (const auto& filepath : levelFiles) {
        std::ifstream file(filepath);
        if (!file.is_open()) {
            continue;
        }
        
        json levelArray;
        try {
            file >> levelArray;
        } catch (const json::parse_error&) {
            continue;
        }
        
        if (!levelArray.is_array() || levelArray.empty()) {
            continue;
        }
        
        PuzzleLevel level = jsonToLevel(levelArray[0]);
        DifficultyMetrics m;
        m.levelId = level.id;
        m.tileCount = level.tiles.size();
        m.wolfCount = 0;
        m.singleTiles = 0;
        m.horizontalTiles = 0;
        m.verticalTiles = 0;
        
        for (const auto& tile : level.tiles) {
            if (tile.unitType == UnitType::WOLF) m.wolfCount++;
            if (tile.gridColSpan == 1 && tile.gridRowSpan == 1) m.singleTiles++;
            else if (tile.gridColSpan > 1 && tile.gridRowSpan == 1) m.horizontalTiles++;
            else if (tile.gridColSpan == 1 && tile.gridRowSpan > 1) m.verticalTiles++;
        }
        
        auto startTime = std::chrono::high_resolution_clock::now();
        auto solution = solver.findSolution(level);
        auto endTime = std::chrono::high_resolution_clock::now();
        
        m.solutionLength = solution.size();
        m.solveTimeMs = std::chrono::duration_cast<std::chrono::milliseconds>(endTime - startTime).count();
        m.difficultyRating = getDifficultyRating(m.tileCount, m.solutionLength);
        
        metrics.push_back(m);
        
        std::cout << std::left << std::setw(8) << m.levelId
                  << std::setw(10) << m.tileCount
                  << std::setw(10) << m.wolfCount
                  << std::setw(10) << m.singleTiles
                  << std::setw(10) << m.horizontalTiles
                  << std::setw(10) << m.verticalTiles
                  << std::setw(12) << m.solutionLength
                  << std::setw(12) << m.solveTimeMs
                  << m.difficultyRating << std::endl;
    }
    
    std::cout << std::endl;
    std::cout << "==========================================" << std::endl;
    std::cout << "        DIFFICULTY DISTRIBUTION           " << std::endl;
    std::cout << "==========================================" << std::endl;
    std::cout << std::endl;
    
    std::map<std::string, int> difficultyCounts;
    for (const auto& m : metrics) {
        difficultyCounts[m.difficultyRating]++;
    }
    
    for (const auto& [rating, count] : difficultyCounts) {
        std::cout << rating << ": " << count << " levels" << std::endl;
    }
    
    std::cout << std::endl;
    
    double avgTiles = 0, avgMoves = 0;
    for (const auto& m : metrics) {
        avgTiles += m.tileCount;
        avgMoves += m.solutionLength;
    }
    avgTiles /= metrics.size();
    avgMoves /= metrics.size();
    
    std::cout << "Average tiles per level: " << std::fixed << std::setprecision(1) << avgTiles << std::endl;
    std::cout << "Average solution length: " << std::fixed << std::setprecision(1) << avgMoves << std::endl;
    
    std::cout << std::endl;
    
    bool hasGoodProgression = true;
    int prevTiles = 0;
    for (const auto& m : metrics) {
        if (m.tileCount < prevTiles - 5) {
            std::cout << "Warning: Level " << m.levelId << " has fewer tiles than previous level" << std::endl;
            hasGoodProgression = false;
        }
        prevTiles = m.tileCount;
    }
    
    if (hasGoodProgression) {
        std::cout << "Difficulty progression: GOOD - Tiles increase smoothly across levels" << std::endl;
    }
    
    return 0;
}
