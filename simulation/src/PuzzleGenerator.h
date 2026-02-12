#ifndef PUZZLE_GENERATOR_H
#define PUZZLE_GENERATOR_H

#include "Tile.h"
#include <vector>
#include <string>
#include <set>

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
    
    bool isPositionUsed(const std::vector<Tile>& tiles, int col, int row);
    bool canPlaceTile(const std::vector<Tile>& tiles, int col, int row, int colSpan, int rowSpan);
    void markUsedPositions(std::set<std::string>& used, int col, int row, int colSpan, int rowSpan);
    std::vector<std::pair<int, int>> getValidCellsInRow(int row, int gridSize);
    bool isValidDiamondCell(int col, int row, int gridSize);
    
public:
    PuzzleGenerator(int size = 14, int tSize = 18);
    
    PuzzleLevel generateLevel(int levelId);
    std::vector<Tile> generateTiles();
    PuzzleLevel generateLevel1();
    PuzzleLevel generateLevel2();
    PuzzleLevel generateLevel3();
    PuzzleLevel generateRandomLevel(int levelId);
    PuzzleLevel generateLevelByDifficulty(int levelId, int maxTileSize, int density, bool randomDirections);
    PuzzleLevel generateLevelWithGridSize(int levelId, int effectiveGridSize, int maxTileSize, int density);
    
    void setDogTile(PuzzleLevel& level);
    
    bool validateLevel(const PuzzleLevel& level);
    bool checkLevelSolvability(const PuzzleLevel& level);
};

#endif
