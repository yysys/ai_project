#include "LevelExporter.h"
#include <fstream>
#include <iostream>

json LevelExporter::tileToJson(const Tile& tile) {
    json j;
    j["id"] = tile.id;
    j["type"] = Tile::tileTypeToString(tile.type);
    j["unitType"] = Tile::unitTypeToString(tile.unitType);
    j["gridCol"] = tile.gridCol;
    j["gridRow"] = tile.gridRow;
    j["gridColSpan"] = tile.gridColSpan;
    j["gridRowSpan"] = tile.gridRowSpan;
    j["direction"] = Tile::directionToString(tile.direction);
    return j;
}

json LevelExporter::levelToJson(const PuzzleLevel& level) {
    json j;
    j["id"] = level.id;
    j["name"] = level.name;
    j["type"] = level.type;
    j["unlocked"] = level.unlocked;
    j["timeLimit"] = level.timeLimit;
    
    json tilesArray = json::array();
    for (const auto& tile : level.tiles) {
        tilesArray.push_back(tileToJson(tile));
    }
    j["tiles"] = tilesArray;
    
    return j;
}

std::string LevelExporter::exportLevel(const PuzzleLevel& level) {
    json j = levelToJson(level);
    return j.dump(2);
}

std::string LevelExporter::exportLevels(const std::vector<PuzzleLevel>& levels) {
    json j = json::array();
    for (const auto& level : levels) {
        j.push_back(levelToJson(level));
    }
    return j.dump(2);
}

bool LevelExporter::exportToFile(const std::string& filename, const std::string& content) {
    std::ofstream file(filename);
    if (!file.is_open()) {
        std::cerr << "Failed to open file: " << filename << std::endl;
        return false;
    }
    
    file << content;
    file.close();
    
    std::cout << "Successfully exported to: " << filename << std::endl;
    return true;
}

bool LevelExporter::exportLevelsToFile(const std::string& filename, const std::vector<PuzzleLevel>& levels) {
    std::string content = exportLevels(levels);
    return exportToFile(filename, content);
}

bool LevelExporter::exportLevelsToSeparateFiles(const std::string& outputDir, const std::vector<PuzzleLevel>& levels) {
    bool allSuccess = true;
    
    for (const auto& level : levels) {
        std::string filename = outputDir + "/level_" + std::to_string(level.id) + ".json";
        
        json j = json::array();
        j.push_back(levelToJson(level));
        std::string content = j.dump(2);
        
        if (!exportToFile(filename, content)) {
            allSuccess = false;
        }
    }
    
    return allSuccess;
}
