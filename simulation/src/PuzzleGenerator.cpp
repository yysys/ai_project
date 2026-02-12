#include "PuzzleGenerator.h"
#include "Utils.h"
#include <algorithm>
#include <iostream>
#include <set>

PuzzleGenerator::PuzzleGenerator(int size, int tSize) 
    : gridSize(size), tileSize(tSize) {}

bool PuzzleGenerator::isPositionUsed(const std::vector<Tile>& tiles, int col, int row) {
    for (const auto& tile : tiles) {
        if (tile.contains(col, row)) {
            return true;
        }
    }
    return false;
}

bool PuzzleGenerator::canPlaceTile(const std::vector<Tile>& tiles, int col, int row, int colSpan, int rowSpan) {
    int right = col + colSpan - 1;
    int bottom = row + rowSpan - 1;
    
    if (col < 1 || right > gridSize || row < 1 || bottom > gridSize) {
        return false;
    }
    
    for (int c = col; c <= right; c++) {
        for (int r = row; r <= bottom; r++) {
            if (!isValidDiamondCell(c, r, gridSize) || isPositionUsed(tiles, c, r)) {
                return false;
            }
        }
    }
    
    return true;
}

void PuzzleGenerator::markUsedPositions(std::set<std::string>& used, int col, int row, int colSpan, int rowSpan) {
    for (int c = col; c < col + colSpan; c++) {
        for (int r = row; r < row + rowSpan; r++) {
            used.insert(std::to_string(c) + "," + std::to_string(r));
        }
    }
}

bool PuzzleGenerator::isValidDiamondCell(int col, int row, int gridSize) {
    int center = (gridSize + 1) / 2;
    int distanceFromCenter = std::abs(row - center);
    int maxColInRow = gridSize - distanceFromCenter;
    int startCol = (gridSize - maxColInRow) / 2 + 1;
    int endCol = startCol + maxColInRow - 1;
    
    return col >= startCol && col <= endCol;
}

std::vector<std::pair<int, int>> PuzzleGenerator::getValidCellsInRow(int row, int gridSize) {
    std::vector<std::pair<int, int>> cells;
    int center = (gridSize + 1) / 2;
    int distanceFromCenter = std::abs(row - center);
    int maxColInRow = gridSize - distanceFromCenter;
    int startCol = (gridSize - maxColInRow) / 2 + 1;
    
    for (int col = startCol; col < startCol + maxColInRow; col++) {
        cells.push_back({col, row});
    }
    
    return cells;
}

PuzzleLevel PuzzleGenerator::generateLevel(int levelId) {
    PuzzleLevel level;
    
    if (levelId >= 1 && levelId <= 5) {
        level = generateLevelWithGridSize(levelId, 10, 2, 100);
    } else if (levelId >= 6 && levelId <= 10) {
        level = generateLevelWithGridSize(levelId, 12, 3, 90);
    } else if (levelId >= 11 && levelId <= 15) {
        level = generateLevelByDifficulty(levelId, 3, 85, true);
    } else {
        level = generateLevelByDifficulty(levelId, 3, 80, true);
    }
    
    level.id = levelId;
    level.name = "第" + std::to_string(levelId) + "关";
    level.type = "normal";
    level.unlocked = (levelId == 1);
    level.timeLimit = 0;
    level.stars = 0;
    level.score = 0;
    
    setDogTile(level);
    
    return level;
}

PuzzleLevel PuzzleGenerator::generateLevel1() {
    PuzzleLevel level;
    std::vector<Tile> tiles;
    
    std::set<std::string> usedPositions;
    int tileId = 0;
    
    std::vector<Direction> directions = {
        Direction::UP_RIGHT, Direction::UP_LEFT, 
        Direction::DOWN_LEFT, Direction::DOWN_RIGHT
    };
    
    int center = (gridSize + 1) / 2;
    
    for (int row = 1; row <= gridSize; row++) {
        auto cells = getValidCellsInRow(row, gridSize);
        
        for (const auto& cell : cells) {
            int col = cell.first;
            
            if (usedPositions.count(std::to_string(col) + "," + std::to_string(row))) {
                continue;
            }
            
            Direction dir = directions[tileId % 4];
            bool isHorizontal = (tileId % 2 == 0);
            
            bool canPlaceHorizontal = canPlaceTile(tiles, col, row, 2, 1);
            bool canPlaceVertical = canPlaceTile(tiles, col, row, 1, 2);
            
            if (isHorizontal && canPlaceHorizontal) {
                tiles.push_back(Tile(col, row, 2, 1, UnitType::WOLF, dir));
                markUsedPositions(usedPositions, col, row, 2, 1);
                tileId++;
            } else if (!isHorizontal && canPlaceVertical) {
                tiles.push_back(Tile(col, row, 1, 2, UnitType::WOLF, dir));
                markUsedPositions(usedPositions, col, row, 1, 2);
                tileId++;
            } else if (canPlaceHorizontal) {
                tiles.push_back(Tile(col, row, 2, 1, UnitType::WOLF, dir));
                markUsedPositions(usedPositions, col, row, 2, 1);
                tileId++;
            } else if (canPlaceVertical) {
                tiles.push_back(Tile(col, row, 1, 2, UnitType::WOLF, dir));
                markUsedPositions(usedPositions, col, row, 1, 2);
                tileId++;
            }
        }
    }
    
    level.tiles = tiles;
    return level;
}

PuzzleLevel PuzzleGenerator::generateLevel2() {
    PuzzleLevel level;
    std::vector<Tile> tiles;
    
    std::set<std::string> usedPositions;
    int tileId = 0;
    
    std::vector<Direction> directions = {
        Direction::UP_RIGHT, Direction::UP_LEFT, 
        Direction::DOWN_LEFT, Direction::DOWN_RIGHT
    };
    
    int center = (gridSize + 1) / 2;
    
    for (int row = 1; row <= gridSize; row++) {
        auto cells = getValidCellsInRow(row, gridSize);
        
        for (const auto& cell : cells) {
            int col = cell.first;
            
            if (usedPositions.count(std::to_string(col) + "," + std::to_string(row))) {
                continue;
            }
            
            Direction dir = directions[tileId % 4];
            bool isHorizontal = (tileId % 2 == 0);
            bool isCenter = (col == center && row == center);
            
            if (isHorizontal && canPlaceTile(tiles, col, row, 2, 1)) {
                UnitType type = isCenter ? UnitType::DOG : UnitType::WOLF;
                tiles.push_back(Tile(col, row, 2, 1, type, dir));
                markUsedPositions(usedPositions, col, row, 2, 1);
                tileId++;
            } else if (!isHorizontal && canPlaceTile(tiles, col, row, 1, 2)) {
                UnitType type = isCenter ? UnitType::DOG : UnitType::WOLF;
                tiles.push_back(Tile(col, row, 1, 2, type, dir));
                markUsedPositions(usedPositions, col, row, 1, 2);
                tileId++;
            } else {
                UnitType type = isCenter ? UnitType::DOG : UnitType::WOLF;
                tiles.push_back(Tile(col, row, 1, 1, type, dir));
                markUsedPositions(usedPositions, col, row, 1, 1);
                tileId++;
            }
        }
    }
    
    level.tiles = tiles;
    return level;
}

PuzzleLevel PuzzleGenerator::generateLevel3() {
    return generateLevel2();
}

PuzzleLevel PuzzleGenerator::generateRandomLevel(int levelId) {
    PuzzleLevel level;
    std::vector<Tile> tiles;
    
    std::set<std::string> usedPositions;
    
    std::vector<Direction> directions = {
        Direction::UP_RIGHT, Direction::UP_LEFT, 
        Direction::DOWN_LEFT, Direction::DOWN_RIGHT
    };
    
    int center = (gridSize + 1) / 2;
    
    for (int row = 1; row <= gridSize; row++) {
        auto cells = getValidCellsInRow(row, gridSize);
        
        for (const auto& cell : cells) {
            int col = cell.first;
            
            if (usedPositions.count(std::to_string(col) + "," + std::to_string(row))) {
                continue;
            }
            
            Direction dir = directions[Utils::getRandomInt(0, 3)];
            bool isCenter = (col == center && row == center);
            
            int tileSize = Utils::getRandomInt(1, 3);
            int colSpan = Utils::getRandomInt(1, tileSize);
            int rowSpan = tileSize - colSpan + 1;
            
            if (colSpan == 0) colSpan = 1;
            if (rowSpan == 0) rowSpan = 1;
            
            if (canPlaceTile(tiles, col, row, colSpan, rowSpan)) {
                UnitType type = isCenter ? UnitType::DOG : UnitType::WOLF;
                tiles.push_back(Tile(col, row, colSpan, rowSpan, type, dir));
                markUsedPositions(usedPositions, col, row, colSpan, rowSpan);
            } else if (canPlaceTile(tiles, col, row, 2, 1)) {
                UnitType type = isCenter ? UnitType::DOG : UnitType::WOLF;
                tiles.push_back(Tile(col, row, 2, 1, type, dir));
                markUsedPositions(usedPositions, col, row, 2, 1);
            } else if (canPlaceTile(tiles, col, row, 1, 2)) {
                UnitType type = isCenter ? UnitType::DOG : UnitType::WOLF;
                tiles.push_back(Tile(col, row, 1, 2, type, dir));
                markUsedPositions(usedPositions, col, row, 1, 2);
            } else {
                UnitType type = isCenter ? UnitType::DOG : UnitType::WOLF;
                tiles.push_back(Tile(col, row, 1, 1, type, dir));
                markUsedPositions(usedPositions, col, row, 1, 1);
            }
        }
    }
    
    level.tiles = tiles;
    return level;
}

void PuzzleGenerator::setDogTile(PuzzleLevel& level) {
    int center = (gridSize + 1) / 2;
    
    for (auto& tile : level.tiles) {
        if (tile.contains(center, center)) {
            tile.unitType = UnitType::DOG;
            level.dogTile = &tile;
            break;
        }
    }
}

bool PuzzleGenerator::validateLevel(const PuzzleLevel& level) {
    std::set<std::string> used;
    
    for (const auto& tile : level.tiles) {
        for (int c = tile.gridCol; c < tile.gridCol + tile.gridColSpan; c++) {
            for (int r = tile.gridRow; r < tile.gridRow + tile.gridRowSpan; r++) {
                std::string key = std::to_string(c) + "," + std::to_string(r);
                if (used.count(key)) {
                    return false;
                }
                used.insert(key);
            }
        }
    }
    
    bool hasDog = false;
    for (const auto& tile : level.tiles) {
        if (tile.unitType == UnitType::DOG) {
            hasDog = true;
            break;
        }
    }
    
    return hasDog;
}

bool PuzzleGenerator::checkLevelSolvability(const PuzzleLevel& level) {
    return validateLevel(level);
}

PuzzleLevel PuzzleGenerator::generateLevelWithGridSize(int levelId, int effectiveGridSize, int maxTileSize, int density) {
    PuzzleLevel level;
    std::vector<Tile> tiles;
    
    std::set<std::string> usedPositions;
    int tileId = 0;
    
    std::vector<Direction> directions = {
        Direction::UP_RIGHT, Direction::UP_LEFT,
        Direction::DOWN_LEFT, Direction::DOWN_RIGHT
    };
    
    int startRow = (gridSize - effectiveGridSize) / 2 + 1;
    int endRow = startRow + effectiveGridSize - 1;
    
    for (int row = startRow; row <= endRow; row++) {
        auto cells = getValidCellsInRow(row, gridSize);
        
        for (const auto& cell : cells) {
            int col = cell.first;
            
            if (usedPositions.count(std::to_string(col) + "," + std::to_string(row))) {
                continue;
            }
            
            if (Utils::getRandomInt(1, 100) > density) {
                continue;
            }
            
            Direction dir = directions[tileId % 4];
            
            bool canPlace2x1 = canPlaceTile(tiles, col, row, 2, 1);
            bool canPlace1x2 = canPlaceTile(tiles, col, row, 1, 2);
            
            if (canPlace2x1) {
                tiles.push_back(Tile(col, row, 2, 1, UnitType::WOLF, dir));
                markUsedPositions(usedPositions, col, row, 2, 1);
                tileId++;
            } else if (canPlace1x2) {
                tiles.push_back(Tile(col, row, 1, 2, UnitType::WOLF, dir));
                markUsedPositions(usedPositions, col, row, 1, 2);
                tileId++;
            } else {
                tiles.push_back(Tile(col, row, 1, 1, UnitType::WOLF, dir));
                markUsedPositions(usedPositions, col, row, 1, 1);
                tileId++;
            }
        }
    }
    
    level.tiles = tiles;
    return level;
}

PuzzleLevel PuzzleGenerator::generateLevelByDifficulty(int levelId, int maxTileSize, int density, bool randomDirections) {
    PuzzleLevel level;
    std::vector<Tile> tiles;
    
    std::set<std::string> usedPositions;
    
    std::vector<Direction> directions = {
        Direction::UP_RIGHT, Direction::UP_LEFT,
        Direction::DOWN_LEFT, Direction::DOWN_RIGHT
    };
    
    int center = (gridSize + 1) / 2;
    
    for (int row = 1; row <= gridSize; row++) {
        auto cells = getValidCellsInRow(row, gridSize);
        
        for (const auto& cell : cells) {
            int col = cell.first;
            
            if (usedPositions.count(std::to_string(col) + "," + std::to_string(row))) {
                continue;
            }
            
            if (Utils::getRandomInt(1, 100) > density) {
                continue;
            }
            
            Direction dir = randomDirections ? directions[Utils::getRandomInt(0, 3)] : directions[tiles.size() % 4];
            bool isCenter = (col == center && row == center);
            
            int tileSize = Utils::getRandomInt(1, maxTileSize);
            int colSpan = Utils::getRandomInt(1, tileSize);
            int rowSpan = tileSize - colSpan + 1;
            
            if (colSpan == 0) colSpan = 1;
            if (rowSpan == 0) rowSpan = 1;
            
            if (canPlaceTile(tiles, col, row, colSpan, rowSpan)) {
                UnitType type = isCenter ? UnitType::DOG : UnitType::WOLF;
                tiles.push_back(Tile(col, row, colSpan, rowSpan, type, dir));
                markUsedPositions(usedPositions, col, row, colSpan, rowSpan);
            } else if (canPlaceTile(tiles, col, row, 2, 1)) {
                UnitType type = isCenter ? UnitType::DOG : UnitType::WOLF;
                tiles.push_back(Tile(col, row, 2, 1, type, dir));
                markUsedPositions(usedPositions, col, row, 2, 1);
            } else if (canPlaceTile(tiles, col, row, 1, 2)) {
                UnitType type = isCenter ? UnitType::DOG : UnitType::WOLF;
                tiles.push_back(Tile(col, row, 1, 2, type, dir));
                markUsedPositions(usedPositions, col, row, 1, 2);
            } else {
                UnitType type = isCenter ? UnitType::DOG : UnitType::WOLF;
                tiles.push_back(Tile(col, row, 1, 1, type, dir));
                markUsedPositions(usedPositions, col, row, 1, 1);
            }
        }
    }
    
    level.tiles = tiles;
    return level;
}
