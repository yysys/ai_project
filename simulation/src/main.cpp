#include "PuzzleGenerator.h"
#include "PuzzleSolver.h"
#include "LevelExporter.h"
#include "Utils.h"
#include <iostream>
#include <chrono>
#include <iomanip>
#include <cstring>

void printUsage(const char* programName) {
    std::cout << "Usage: " << programName << " [options]" << std::endl;
    std::cout << std::endl;
    std::cout << "Options:" << std::endl;
    std::cout << "  -n <count>      Number of levels to generate (default: 1)" << std::endl;
    std::cout << "  -o <filename>   Output filename (default: levels.json)" << std::endl;
    std::cout << "  -s              Skip solvability check (faster generation)" << std::endl;
    std::cout << "  -h              Show this help message" << std::endl;
    std::cout << std::endl;
    std::cout << "Examples:" << std::endl;
    std::cout << "  " << programName << " -n 1              # Generate 1 level" << std::endl;
    std::cout << "  " << programName << " -n 10 -o game_levels.json  # Generate 10 levels" << std::endl;
    std::cout << "  " << programName << " -n 100 -s         # Generate 100 levels without solvability check" << std::endl;
}

void printBanner() {
    std::cout << "======================================" << std::endl;
    std::cout << "   Puzzle Simulation Generator v1.0   " << std::endl;
    std::cout << "======================================" << std::endl;
    std::cout << std::endl;
}

bool generateSingleLevel(int levelId, PuzzleGenerator& generator, PuzzleSolver& solver, 
                         bool checkSolvability, std::vector<PuzzleLevel>& validLevels) {
    std::cout << "Generating Level " << levelId << "..." << std::endl;
    
    PuzzleLevel level = generator.generateLevel(levelId);
    
    std::cout << "  - Tiles generated: " << level.tiles.size() << std::endl;
    
    bool hasDog = false;
    for (const auto& tile : level.tiles) {
        if (tile.unitType == UnitType::DOG) {
            hasDog = true;
            std::cout << "  - Dog tile at: (" << tile.gridCol << ", " << tile.gridRow << ")" << std::endl;
            break;
        }
    }
    
    if (!hasDog) {
        std::cout << "  - ERROR: No dog tile found!" << std::endl;
        return false;
    }
    
    std::cout << "  - Validating level..." << std::endl;
    if (!generator.validateLevel(level)) {
        std::cout << "  - ERROR: Level validation failed!" << std::endl;
        return false;
    }
    
    if (checkSolvability) {
        std::cout << "  - Checking solvability..." << std::endl;
        auto startTime = std::chrono::high_resolution_clock::now();
        
        bool solvable = solver.isSolvable(level);
        
        auto endTime = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(endTime - startTime);
        
        if (solvable) {
            std::cout << "  - Level is SOLVABLE (checked in " << duration.count() << "ms)" << std::endl;
            validLevels.push_back(level);
            return true;
        } else {
            std::cout << "  - WARNING: Level is NOT solvable (checked in " << duration.count() << "ms)" << std::endl;
            return false;
        }
    } else {
        std::cout << "  - Skipping solvability check" << std::endl;
        validLevels.push_back(level);
        return true;
    }
}

int main(int argc, char* argv[]) {
    int levelCount = 1;
    std::string outputDir = "../simulation_json";
    std::string outputFile = "levels.json";
    bool checkSolvability = true;
    
    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "-n") == 0 && i + 1 < argc) {
            levelCount = std::atoi(argv[++i]);
        } else if (strcmp(argv[i], "-o") == 0 && i + 1 < argc) {
            outputFile = argv[++i];
        } else if (strcmp(argv[i], "-s") == 0) {
            checkSolvability = false;
        } else if (strcmp(argv[i], "-h") == 0) {
            printUsage(argv[0]);
            return 0;
        }
    }
    
    printBanner();
    
    std::cout << "Configuration:" << std::endl;
    std::cout << "  - Levels to generate: " << levelCount << std::endl;
    std::cout << "  - Output file: " << outputFile << std::endl;
    std::cout << "  - Output directory: " << outputDir << std::endl;
    std::cout << "  - Solvability check: " << (checkSolvability ? "enabled" : "disabled") << std::endl;
    std::cout << std::endl;
    
    PuzzleGenerator generator(14, 18);
    PuzzleSolver solver(14);
    
    std::vector<PuzzleLevel> validLevels;
    int attempts = 0;
    int maxAttempts = levelCount * 5;
    
    auto totalStartTime = std::chrono::high_resolution_clock::now();
    
    while (static_cast<int>(validLevels.size()) < levelCount && attempts < maxAttempts) {
        attempts++;
        int levelId = static_cast<int>(validLevels.size()) + 1;
        
        std::cout << "[Attempt " << attempts << "/" << maxAttempts << "] ";
        
        if (generateSingleLevel(levelId, generator, solver, checkSolvability, validLevels)) {
            std::cout << "  - SUCCESS: Level " << levelId << " added" << std::endl;
        } else {
            std::cout << "  - FAILED: Retrying..." << std::endl;
        }
        std::cout << std::endl;
    }
    
    auto totalEndTime = std::chrono::high_resolution_clock::now();
    auto totalDuration = std::chrono::duration_cast<std::chrono::seconds>(totalEndTime - totalStartTime);
    
    std::cout << "======================================" << std::endl;
    std::cout << "Generation Complete!" << std::endl;
    std::cout << "======================================" << std::endl;
    std::cout << "  - Total levels generated: " << validLevels.size() << "/" << levelCount << std::endl;
    std::cout << "  - Total attempts: " << attempts << std::endl;
    std::cout << "  - Total time: " << totalDuration.count() << " seconds" << std::endl;
    std::cout << std::endl;
    
    if (!validLevels.empty()) {
        std::string fullPath = outputDir + "/" + outputFile;
        LevelExporter::exportLevelsToFile(fullPath, validLevels);
        std::cout << "Exported to: " << fullPath << std::endl;
        
        LevelExporter::exportLevelsToSeparateFiles(outputDir, validLevels);
        std::cout << "Also exported individual level files to: " << outputDir << std::endl;
        
        std::cout << "Full path: /Users/qinkuang.chen/traeProject/ai_project/simulation_json/" << outputFile << std::endl;
    } else {
        std::cout << "No valid levels generated!" << std::endl;
        return 1;
    }
    
    return 0;
}
