#include "DifficultyAnalyzer.h"
#include <iostream>
#include <fstream>
#include "json.hpp"
#include <filesystem>

using json = nlohmann::json;

PuzzleLevel loadLevelFromJsonObj(const json& j);

PuzzleLevel loadLevelFromJson(const std::string& filename) {
    PuzzleLevel level;
    
    std::ifstream file(filename);
    if (!file.is_open()) {
        std::cerr << "Error: Could not open file " << filename << std::endl;
        return level;
    }
    
    json j;
    file >> j;
    
    if (j.is_array() && j.size() > 0) {
        level = loadLevelFromJsonObj(j[0]);
    } else if (j.contains("id")) {
        level = loadLevelFromJsonObj(j);
    }
    
    return level;
}

PuzzleLevel loadLevelFromJsonObj(const json& j) {
    PuzzleLevel level;
    
    level.id = j.value("id", 0);
    level.name = j.value("name", "");
    level.type = j.value("type", "normal");
    level.timeLimit = j.value("timeLimit", 0);
    level.unlocked = j.value("unlocked", false);
    level.stars = j.value("stars", 0);
    level.score = j.value("score", 0);
    
    if (j.contains("tiles")) {
        for (const auto& tileJson : j["tiles"]) {
            Tile tile;
            tile.id = tileJson.value("id", "");
            tile.type = Tile::tileTypeFromString(tileJson.value("type", "single"));
            tile.unitType = Tile::unitTypeFromString(tileJson.value("unitType", "wolf"));
            tile.gridCol = tileJson.value("gridCol", 1);
            tile.gridRow = tileJson.value("gridRow", 1);
            tile.gridColSpan = tileJson.value("gridColSpan", 1);
            tile.gridRowSpan = tileJson.value("gridRowSpan", 1);
            tile.direction = Tile::directionFromString(tileJson.value("direction", "up_right"));
            
            level.tiles.push_back(tile);
            
            if (tile.unitType == UnitType::DOG) {
                level.dogTile = &level.tiles.back();
            }
        }
    }
    
    return level;
}

std::vector<PuzzleLevel> loadLevelsFromDirectory(const std::string& dirPath) {
    std::vector<PuzzleLevel> levels;
    
    for (const auto& entry : std::filesystem::directory_iterator(dirPath)) {
        if (entry.path().extension() == ".json") {
            PuzzleLevel level = loadLevelFromJson(entry.path().string());
            if (!level.tiles.empty()) {
                levels.push_back(level);
            }
        }
    }
    
    std::sort(levels.begin(), levels.end(), [](const PuzzleLevel& a, const PuzzleLevel& b) {
        return a.id < b.id;
    });
    
    return levels;
}

void printLevelInfo(const PuzzleLevel& level) {
    std::cout << "Level " << level.id << ": " << level.name << std::endl;
    std::cout << "  Tiles: " << level.tiles.size() << std::endl;
    
    int wolfCount = 0;
    int dogCount = 0;
    for (const auto& tile : level.tiles) {
        if (tile.unitType == UnitType::DOG) {
            dogCount++;
        } else {
            wolfCount++;
        }
    }
    
    std::cout << "  Dogs: " << dogCount << std::endl;
    std::cout << "  Wolves: " << wolfCount << std::endl;
    
    if (level.dogTile) {
        std::cout << "  Dog position: (" << level.dogTile->gridCol 
                  << ", " << level.dogTile->gridRow << ")" << std::endl;
    }
}

void exportDifficultyReport(const std::string& filename, const std::vector<PuzzleLevel>& levels, 
                             const std::vector<DifficultyMetrics>& metrics) {
    json report;
    
    report["total_levels"] = levels.size();
    report["generated_at"] = "2025-02-12";
    
    json levels_data = json::array();
    for (size_t i = 0; i < levels.size() && i < metrics.size(); i++) {
        json level_data;
        level_data["id"] = levels[i].id;
        level_data["name"] = levels[i].name;
        level_data["difficulty_level"] = static_cast<int>(metrics[i].level);
        level_data["difficulty_level_name"] = 
            (metrics[i].level == DifficultyLevel::VERY_EASY) ? "Very Easy" :
            (metrics[i].level == DifficultyLevel::EASY) ? "Easy" :
            (metrics[i].level == DifficultyLevel::MEDIUM) ? "Medium" :
            (metrics[i].level == DifficultyLevel::HARD) ? "Hard" : "Very Hard";
        level_data["difficulty_score"] = metrics[i].difficultyScore;
        level_data["optimal_moves"] = metrics[i].optimalMoves;
        level_data["branching_factor"] = metrics[i].branchingFactor;
        level_data["wolf_density"] = metrics[i].wolfDensity;
        level_data["dog_distance_to_edge"] = metrics[i].dogDistanceToEdge;
        level_data["path_complexity"] = metrics[i].pathComplexity;
        level_data["dead_end_states"] = metrics[i].deadEndStates;
        level_data["solution_width"] = metrics[i].solutionWidth;
        
        levels_data.push_back(level_data);
    }
    
    report["levels"] = levels_data;
    
    std::ofstream file(filename);
    file << std::setw(4) << report << std::endl;
}

void showMenu() {
    std::cout << "\n======================================" << std::endl;
    std::cout << "   Difficulty Analyzer v1.0" << std::endl;
    std::cout << "======================================" << std::endl;
    std::cout << "\nSelect an option:" << std::endl;
    std::cout << "1. Test single level file" << std::endl;
    std::cout << "2. Test all levels in simulation folder" << std::endl;
    std::cout << "3. Test all levels in custom folder" << std::endl;
    std::cout << "4. Run unit tests" << std::endl;
    std::cout << "0. Exit" << std::endl;
    std::cout << "\nEnter your choice: ";
}

void runUnitTests(DifficultyAnalyzer& analyzer) {
    std::cout << "\n=== Running Unit Tests ===" << std::endl;
    
    int passed = 0;
    int total = 0;
    
    total++;
    std::cout << "\n[Test 1] Tile basic operations... ";
    Tile tile1(5, 5, 1, 1, UnitType::WOLF, Direction::UP_RIGHT);
    if (tile1.gridCol == 5 && tile1.gridRow == 5 && tile1.unitType == UnitType::WOLF) {
        std::cout << "PASSED" << std::endl;
        passed++;
    } else {
        std::cout << "FAILED" << std::endl;
    }
    
    total++;
    std::cout << "[Test 2] Tile contains() method... ";
    if (tile1.contains(5, 5) && !tile1.contains(6, 6)) {
        std::cout << "PASSED" << std::endl;
        passed++;
    } else {
        std::cout << "FAILED" << std::endl;
    }
    
    total++;
    std::cout << "[Test 3] Tile overlaps() method... ";
    Tile tile2(5, 5, 2, 1, UnitType::DOG, Direction::UP_LEFT);
    if (tile1.overlaps(tile2)) {
        std::cout << "PASSED" << std::endl;
        passed++;
    } else {
        std::cout << "FAILED" << std::endl;
    }
    
    total++;
    std::cout << "[Test 4] Direction string conversion... ";
    std::string dirStr = Tile::directionToString(Direction::UP_LEFT);
    Direction backDir = Tile::directionFromString(dirStr);
    if (dirStr == "up_left" && backDir == Direction::UP_LEFT) {
        std::cout << "PASSED" << std::endl;
        passed++;
    } else {
        std::cout << "FAILED" << std::endl;
    }
    
    total++;
    std::cout << "[Test 5] UnitType string conversion... ";
    std::string typeStr = Tile::unitTypeToString(UnitType::DOG);
    UnitType backType = Tile::unitTypeFromString(typeStr);
    if (typeStr == "dog" && backType == UnitType::DOG) {
        std::cout << "PASSED" << std::endl;
        passed++;
    } else {
        std::cout << "FAILED" << std::endl;
    }
    
    total++;
    std::cout << "[Test 6] GameState hashing... ";
    std::vector<Tile> tiles = {tile1, tile2};
    GameState state1(tiles);
    GameState state2(tiles);
    if (state1 == state2 && state1.hash() == state2.hash()) {
        std::cout << "PASSED" << std::endl;
        passed++;
    } else {
        std::cout << "FAILED" << std::endl;
    }
    
    total++;
    std::cout << "[Test 7] Create a simple solvable level... ";
    PuzzleLevel simpleLevel;
    simpleLevel.id = 999;
    simpleLevel.name = "Test Level";
    simpleLevel.tiles.push_back(Tile(8, 8, 1, 1, UnitType::DOG, Direction::UP_RIGHT));
    simpleLevel.dogTile = &simpleLevel.tiles.back();
    
    DifficultyMetrics metrics = analyzer.analyzeLevel(simpleLevel);
    if (metrics.optimalMoves >= 0) {
        std::cout << "PASSED" << std::endl;
        passed++;
    } else {
        std::cout << "FAILED" << std::endl;
    }
    
    total++;
    std::cout << "[Test 8] Difficulty classification... ";
    if (metrics.level != DifficultyLevel::VERY_EASY) {
        std::cout << "PASSED" << std::endl;
        passed++;
    } else {
        std::cout << "FAILED" << std::endl;
    }
    
    total++;
    std::cout << "[Test 9] Find optimal solution... ";
    std::vector<Move> solution = analyzer.findOptimalSolution(simpleLevel);
    if (!solution.empty()) {
        std::cout << "PASSED" << std::endl;
        passed++;
    } else {
        std::cout << "FAILED" << std::endl;
    }
    
    total++;
    std::cout << "[Test 10] Metrics calculation... ";
    if (metrics.difficultyScore >= 0 && metrics.wolfDensity >= 0) {
        std::cout << "PASSED" << std::endl;
        passed++;
    } else {
        std::cout << "FAILED" << std::endl;
    }
    
    std::cout << "\n=== Test Results: " << passed << "/" << total << " passed ===" << std::endl;
}

int main() {
    DifficultyAnalyzer analyzer(14);
    
    while (true) {
        showMenu();
        int choice;
        std::cin >> choice;
        
        switch (choice) {
            case 1: {
                std::string filename;
                std::cout << "Enter level JSON file path: ";
                std::cin >> filename;
                
                PuzzleLevel level = loadLevelFromJson(filename);
                if (level.tiles.empty()) {
                    std::cout << "Failed to load level!" << std::endl;
                    break;
                }
                
                printLevelInfo(level);
                
                std::cout << "\nAnalyzing difficulty..." << std::endl;
                DifficultyMetrics metrics = analyzer.analyzeLevel(level);
                analyzer.printMetrics(metrics);
                break;
            }
            case 2: {
                std::string simPath = "../simulation";
                std::vector<PuzzleLevel> levels = loadLevelsFromDirectory(simPath);
                
                if (levels.empty()) {
                    std::cout << "No levels found in simulation folder!" << std::endl;
                    break;
                }
                
                std::cout << "\nFound " << levels.size() << " levels." << std::endl;
                
                std::vector<DifficultyMetrics> allMetrics;
                
                for (const auto& level : levels) {
                    printLevelInfo(level);
                    DifficultyMetrics metrics = analyzer.analyzeLevel(level);
                    analyzer.printMetrics(metrics);
                    allMetrics.push_back(metrics);
                }
                
                exportDifficultyReport("difficulty_report.json", levels, allMetrics);
                std::cout << "\nDifficulty report exported to: difficulty_report.json" << std::endl;
                break;
            }
            case 3: {
                std::string dirPath;
                std::cout << "Enter folder path containing level JSON files: ";
                std::cin >> dirPath;
                
                std::vector<PuzzleLevel> levels = loadLevelsFromDirectory(dirPath);
                
                if (levels.empty()) {
                    std::cout << "No levels found in specified folder!" << std::endl;
                    break;
                }
                
                std::cout << "\nFound " << levels.size() << " levels." << std::endl;
                
                std::vector<DifficultyMetrics> allMetrics;
                
                for (const auto& level : levels) {
                    printLevelInfo(level);
                    DifficultyMetrics metrics = analyzer.analyzeLevel(level);
                    analyzer.printMetrics(metrics);
                    allMetrics.push_back(metrics);
                }
                
                std::string reportFile = "difficulty_report_custom.json";
                exportDifficultyReport(reportFile, levels, allMetrics);
                std::cout << "\nDifficulty report exported to: " << reportFile << std::endl;
                break;
            }
            case 4:
                runUnitTests(analyzer);
                break;
            case 0:
                std::cout << "Exiting..." << std::endl;
                return 0;
            default:
                std::cout << "Invalid choice. Please try again." << std::endl;
        }
        
        std::cout << "\nPress Enter to continue...";
        std::cin.ignore();
        std::cin.get();
    }
    
    return 0;
}
