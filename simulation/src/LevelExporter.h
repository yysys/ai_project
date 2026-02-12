#ifndef LEVEL_EXPORTER_H
#define LEVEL_EXPORTER_H

#include "Tile.h"
#include "PuzzleGenerator.h"
#include <string>
#include <vector>
#include "json.hpp"

using json = nlohmann::json;

class LevelExporter {
public:
    static std::string exportLevel(const PuzzleLevel& level);
    static std::string exportLevels(const std::vector<PuzzleLevel>& levels);
    static bool exportToFile(const std::string& filename, const std::string& content);
    static bool exportLevelsToFile(const std::string& filename, const std::vector<PuzzleLevel>& levels);
    static bool exportLevelsToSeparateFiles(const std::string& outputDir, const std::vector<PuzzleLevel>& levels);
    
private:
    static json tileToJson(const Tile& tile);
    static json levelToJson(const PuzzleLevel& level);
};

#endif
