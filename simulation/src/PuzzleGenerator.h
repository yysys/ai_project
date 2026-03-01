#ifndef PUZZLE_GENERATOR_H
#define PUZZLE_GENERATOR_H

#include "Tile.h"
#include <vector>
#include <string>
#include <set>

struct DifficultyParams {
    int effectiveGridSize;
    int maxTileSize;
    int density;
    bool randomDirections;
    int dogEscapeBonus;
    int minMoves;
    int maxMoves;
    
    DifficultyParams() : effectiveGridSize(14), maxTileSize(2), density(100), 
                         randomDirections(true), dogEscapeBonus(0), minMoves(1), maxMoves(10) {}
};

struct ValidationReport {
    bool isValid;
    int tileCount;
    int dogTileCount;
    int wolfTileCount;
    bool hasDog;
    bool allCellsCovered;
    bool noOverlaps;
    std::vector<std::string> errors;
    std::vector<std::string> warnings;
    std::vector<std::string> uncoveredCells;
    std::vector<std::string> overlapPositions;
    
    ValidationReport() : isValid(false), tileCount(0), dogTileCount(0), wolfTileCount(0),
                         hasDog(false), allCellsCovered(false), noOverlaps(true) {}
};

struct PuzzleLevel {
    int id;
    std::string name;
    std::string type;
    int timeLimit;
    std::vector<Tile> tiles;
    Tile* dogTile;
    bool unlocked;
    int stars;
    int score;
    
    PuzzleLevel() : id(0), timeLimit(0), dogTile(nullptr), unlocked(false), stars(0), score(0) {}
};

class PuzzleGenerator {
private:
    int gridSize;
    int tileSize;
    int timeoutSeconds;
    int maxRetriesDefault;
    
    bool isPositionUsed(const std::vector<Tile>& tiles, int col, int row);
    bool canPlaceTile(const std::vector<Tile>& tiles, int col, int row, int colSpan, int rowSpan);
    void markUsedPositions(std::set<std::string>& used, int col, int row, int colSpan, int rowSpan);
    std::vector<std::pair<int, int>> getValidCellsInRow(int row, int gridSize);
    std::vector<std::pair<int, int>> getAllValidCells(int gridSize);
    bool isValidDiamondCell(int col, int row, int gridSize);
    DifficultyParams getDifficultyParams(int levelId);
    Direction getOptimalDogDirection(int dogCol, int dogRow, int gridSize);
    PuzzleLevel generateLevelWithParams(int levelId, const DifficultyParams& params);
    DifficultyParams degradeDifficulty(const DifficultyParams& params, int attemptCount);
    
public:
    PuzzleGenerator(int size = 14, int tSize = 18);
    
    PuzzleLevel generateLevel(int levelId);
    PuzzleLevel generateSolvableLevel(int levelId, int maxRetries = 50);
    std::vector<Tile> generateTiles();
    PuzzleLevel generateLevel1();
    PuzzleLevel generateLevel2();
    PuzzleLevel generateLevel3();
    PuzzleLevel generateRandomLevel(int levelId);
    PuzzleLevel generateLevelByDifficulty(int levelId, int maxTileSize, int density, bool randomDirections);
    PuzzleLevel generateLevelWithGridSize(int levelId, int effectiveGridSize, int maxTileSize, int density);
    
    void setDogTile(PuzzleLevel& level);
    void setTimeout(int seconds);
    void setMaxRetries(int retries);
    
    bool validateLevel(const PuzzleLevel& level);
    ValidationReport validateLevelWithReport(const PuzzleLevel& level);
    bool checkLevelSolvability(const PuzzleLevel& level);
    void printValidationReport(const ValidationReport& report);
};

#endif
