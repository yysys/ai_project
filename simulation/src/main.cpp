#include "PuzzleGenerator.h"
#include "PuzzleSolver.h"
#include "LevelExporter.h"
#include "Utils.h"
#include <iostream>
#include <chrono>
#include <iomanip>
#include <cstring>
#include <fstream>

void printUsage(const char* programName) {
    std::cout << "Usage: " << programName << " [options]" << std::endl;
    std::cout << std::endl;
    std::cout << "Options:" << std::endl;
    std::cout << "  -n <count>      Number of levels to generate (default: 1)" << std::endl;
    std::cout << "  --start-id <id> Starting level ID (default: 1)" << std::endl;
    std::cout << "  -o <filename>   Output filename (default: levels.json)" << std::endl;
    std::cout << "  -d <directory>  Output directory (default: ../simulation_json)" << std::endl;
    std::cout << "  -r <retries>    Max retries per level (default: 10)" << std::endl;
    std::cout << "  -s              Skip solvability check (faster generation)" << std::endl;
    std::cout << "  -v              Verbose output with detailed validation" << std::endl;
    std::cout << "  -h              Show this help message" << std::endl;
    std::cout << std::endl;
    std::cout << "Examples:" << std::endl;
    std::cout << "  " << programName << " -n 20                    # Generate 20 solvable levels" << std::endl;
    std::cout << "  " << programName << " -n 10 -r 20              # Generate 10 levels with 20 retries each" << std::endl;
    std::cout << "  " << programName << " -n 100 -s                # Generate 100 levels without solvability check" << std::endl;
    std::cout << "  " << programName << " -n 5 -v                  # Generate 5 levels with verbose output" << std::endl;
    std::cout << "  " << programName << " -n 1 --start-id 13       # Generate level 13 only" << std::endl;
}

void printBanner() {
    std::cout << "==========================================" << std::endl;
    std::cout << "   Puzzle Simulation Generator v2.0       " << std::endl;
    std::cout << "   With Solvability Verification          " << std::endl;
    std::cout << "==========================================" << std::endl;
    std::cout << std::endl;
}

struct GenerationStats {
    int totalAttempts;
    int successfulLevels;
    int failedLevels;
    double totalTime;
    std::vector<int> solvableLevels;
    std::vector<int> unsolvableLevels;
};

bool generateSingleLevel(int levelId, PuzzleGenerator& generator, PuzzleSolver& solver, 
                         bool checkSolvability, bool verbose, int maxRetries,
                         std::vector<PuzzleLevel>& validLevels, GenerationStats& stats) {
    std::cout << "\n----------------------------------------" << std::endl;
    std::cout << "Generating Level " << levelId << "..." << std::endl;
    std::cout << "----------------------------------------" << std::endl;
    
    PuzzleLevel level = generator.generateLevel(levelId);
    
    std::cout << "  Tiles generated: " << level.tiles.size() << std::endl;
    
    bool hasDog = false;
    for (const auto& tile : level.tiles) {
        if (tile.unitType == UnitType::DOG) {
            hasDog = true;
            std::cout << "  Dog tile at: (" << tile.gridCol << ", " << tile.gridRow << ")" << std::endl;
            std::cout << "  Dog tile size: " << tile.gridColSpan << "x" << tile.gridRowSpan << std::endl;
            std::cout << "  Dog direction: " << Tile::directionToString(tile.direction) << std::endl;
            break;
        }
    }
    
    if (!hasDog) {
        std::cout << "  ERROR: No dog tile found!" << std::endl;
        return false;
    }
    
    if (verbose) {
        ValidationReport report = generator.validateLevelWithReport(level);
        generator.printValidationReport(report);
    } else {
        std::cout << "  Validating level..." << std::endl;
        if (!generator.validateLevel(level)) {
            std::cout << "  ERROR: Level validation failed!" << std::endl;
            return false;
        }
        std::cout << "  Validation: PASSED" << std::endl;
    }
    
    if (checkSolvability) {
        std::cout << "  Checking solvability..." << std::endl;
        auto startTime = std::chrono::high_resolution_clock::now();
        
        bool solvable = solver.isSolvable(level);
        
        auto endTime = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(endTime - startTime);
        
        if (solvable) {
            std::cout << "  Solvability: SOLVABLE (checked in " << duration.count() << "ms)" << std::endl;
            stats.solvableLevels.push_back(levelId);
            validLevels.push_back(level);
            return true;
        } else {
            std::cout << "  Solvability: NOT SOLVABLE (checked in " << duration.count() << "ms)" << std::endl;
            stats.unsolvableLevels.push_back(levelId);
            
            std::cout << "  Attempting to regenerate..." << std::endl;
            for (int retry = 0; retry < maxRetries; retry++) {
                stats.totalAttempts++;
                PuzzleLevel newLevel = generator.generateLevel(levelId);
                
                if (generator.validateLevel(newLevel) && solver.isSolvable(newLevel)) {
                    std::cout << "  SUCCESS: Found solvable level after " << (retry + 1) << " retries" << std::endl;
                    stats.solvableLevels.push_back(levelId);
                    validLevels.push_back(newLevel);
                    return true;
                }
            }
            
            std::cout << "  WARNING: Could not generate solvable level after " << maxRetries << " retries" << std::endl;
            std::cout << "  Using last generated level (may not be solvable)" << std::endl;
            validLevels.push_back(level);
            return false;
        }
    } else {
        std::cout << "  Skipping solvability check" << std::endl;
        validLevels.push_back(level);
        return true;
    }
}

void printFinalReport(const GenerationStats& stats, int levelCount) {
    std::cout << "\n==========================================" << std::endl;
    std::cout << "        GENERATION COMPLETE               " << std::endl;
    std::cout << "==========================================" << std::endl;
    std::cout << std::endl;
    std::cout << "Summary:" << std::endl;
    std::cout << "  - Levels requested: " << levelCount << std::endl;
    std::cout << "  - Levels generated: " << stats.successfulLevels << std::endl;
    std::cout << "  - Failed levels: " << stats.failedLevels << std::endl;
    std::cout << "  - Total attempts: " << stats.totalAttempts << std::endl;
    std::cout << "  - Total time: " << std::fixed << std::setprecision(2) << stats.totalTime << " seconds" << std::endl;
    std::cout << std::endl;
    
    if (!stats.solvableLevels.empty()) {
        std::cout << "Solvable levels (" << stats.solvableLevels.size() << "): ";
        for (size_t i = 0; i < stats.solvableLevels.size(); i++) {
            if (i > 0) std::cout << ", ";
            std::cout << stats.solvableLevels[i];
        }
        std::cout << std::endl;
    }
    
    if (!stats.unsolvableLevels.empty()) {
        std::cout << "Unsolvable levels (" << stats.unsolvableLevels.size() << "): ";
        for (size_t i = 0; i < stats.unsolvableLevels.size(); i++) {
            if (i > 0) std::cout << ", ";
            std::cout << stats.unsolvableLevels[i];
        }
        std::cout << std::endl;
    }
    
    std::cout << std::endl;
}

int main(int argc, char* argv[]) {
    int levelCount = 1;
    int startId = 1;
    std::string outputDir = "../simulation_json";
    std::string outputFile = "levels.json";
    bool checkSolvability = true;
    bool verbose = false;
    int maxRetries = 10;
    
    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "-n") == 0 && i + 1 < argc) {
            levelCount = std::atoi(argv[++i]);
        } else if (strcmp(argv[i], "--start-id") == 0 && i + 1 < argc) {
            startId = std::atoi(argv[++i]);
        } else if (strcmp(argv[i], "-o") == 0 && i + 1 < argc) {
            outputFile = argv[++i];
        } else if (strcmp(argv[i], "-d") == 0 && i + 1 < argc) {
            outputDir = argv[++i];
        } else if (strcmp(argv[i], "-r") == 0 && i + 1 < argc) {
            maxRetries = std::atoi(argv[++i]);
        } else if (strcmp(argv[i], "-s") == 0) {
            checkSolvability = false;
        } else if (strcmp(argv[i], "-v") == 0) {
            verbose = true;
        } else if (strcmp(argv[i], "-h") == 0) {
            printUsage(argv[0]);
            return 0;
        }
    }
    
    printBanner();
    
    std::cout << "Configuration:" << std::endl;
    std::cout << "  - Starting level ID: " << startId << std::endl;
    std::cout << "  - Levels to generate: " << levelCount << std::endl;
    std::cout << "  - Output file: " << outputFile << std::endl;
    std::cout << "  - Output directory: " << outputDir << std::endl;
    std::cout << "  - Max retries per level: " << maxRetries << std::endl;
    std::cout << "  - Solvability check: " << (checkSolvability ? "enabled" : "disabled") << std::endl;
    std::cout << "  - Verbose output: " << (verbose ? "enabled" : "disabled") << std::endl;
    std::cout << std::endl;
    
    PuzzleGenerator generator(14, 18);
    PuzzleSolver solver(14);
    
    solver.setMaxDepth(500);
    solver.setMaxStates(50000);
    
    std::vector<PuzzleLevel> validLevels;
    GenerationStats stats;
    stats.totalAttempts = levelCount;
    stats.successfulLevels = 0;
    stats.failedLevels = 0;
    stats.totalTime = 0;
    
    auto totalStartTime = std::chrono::high_resolution_clock::now();
    
    for (int levelId = startId; levelId < startId + levelCount; levelId++) {
        if (generateSingleLevel(levelId, generator, solver, checkSolvability, verbose, maxRetries, validLevels, stats)) {
            stats.successfulLevels++;
        } else {
            stats.failedLevels++;
        }
    }
    
    auto totalEndTime = std::chrono::high_resolution_clock::now();
    auto totalDuration = std::chrono::duration_cast<std::chrono::seconds>(totalEndTime - totalStartTime);
    stats.totalTime = totalDuration.count();
    
    printFinalReport(stats, levelCount);
    
    if (!validLevels.empty()) {
        std::string fullPath = outputDir + "/" + outputFile;
        LevelExporter::exportLevelsToFile(fullPath, validLevels);
        std::cout << "Exported combined levels to: " << fullPath << std::endl;
        
        LevelExporter::exportLevelsToSeparateFiles(outputDir, validLevels);
        std::cout << "Exported individual level files to: " << outputDir << std::endl;
        
        std::cout << "\nLevel files created:" << std::endl;
        for (const auto& level : validLevels) {
            std::cout << "  - level_" << level.id << ".json" << std::endl;
        }
    } else {
        std::cout << "No valid levels generated!" << std::endl;
        return 1;
    }
    
    return 0;
}
