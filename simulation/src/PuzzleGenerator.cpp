#include "PuzzleGenerator.h"
#include "PuzzleSolver.h"
#include "Utils.h"
#include <algorithm>
#include <iostream>
#include <set>
#include <random>
#include <chrono>

PuzzleGenerator::PuzzleGenerator(int size, int tSize) 
    : gridSize(size), tileSize(tSize), timeoutSeconds(30), maxRetriesDefault(50) {}

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

std::vector<std::pair<int, int>> PuzzleGenerator::getAllValidCells(int gridSize) {
    std::vector<std::pair<int, int>> cells;
    for (int row = 1; row <= gridSize; row++) {
        auto rowCells = getValidCellsInRow(row, gridSize);
        cells.insert(cells.end(), rowCells.begin(), rowCells.end());
    }
    return cells;
}

DifficultyParams PuzzleGenerator::getDifficultyParams(int levelId) {
    DifficultyParams params;
    
    if (levelId == 1) {
        params.effectiveGridSize = 6;
        params.maxTileSize = 1;
        params.density = 6;
        params.randomDirections = false;
        params.dogEscapeBonus = 0;
        params.minMoves = 1;
        params.maxMoves = 2;
    } else if (levelId >= 2 && levelId <= 3) {
        params.effectiveGridSize = 6;
        params.maxTileSize = 2;
        params.density = 35 + (levelId - 2) * 5;
        params.randomDirections = false;
        params.dogEscapeBonus = 0;
        params.minMoves = 2 + (levelId - 2);
        params.maxMoves = 4 + (levelId - 2) * 2;
    } else if (levelId >= 4 && levelId <= 6) {
        params.effectiveGridSize = 8;
        params.maxTileSize = 2;
        params.density = 50 + (levelId - 4) * 3;
        params.randomDirections = (levelId >= 5);
        params.dogEscapeBonus = 0;
        params.minMoves = 4 + (levelId - 4);
        params.maxMoves = 7 + (levelId - 4) * 2;
    } else if (levelId >= 7 && levelId <= 10) {
        params.effectiveGridSize = 10;
        params.maxTileSize = 3;
        params.density = 60 + (levelId - 7) * 2;
        params.randomDirections = true;
        params.dogEscapeBonus = 0;
        params.minMoves = 7 + (levelId - 7);
        params.maxMoves = 10 + (levelId - 7) * 2;
    } else {
        params.effectiveGridSize = 14;
        params.maxTileSize = 3;
        params.density = 70;
        params.randomDirections = true;
        params.dogEscapeBonus = 0;
        params.minMoves = 8;
        params.maxMoves = 25;
    }
    
    return params;
}

Direction PuzzleGenerator::getOptimalDogDirection(int dogCol, int dogRow, int gridSize) {
    std::vector<Direction> directions = {
        Direction::UP_RIGHT, Direction::UP_LEFT,
        Direction::DOWN_LEFT, Direction::DOWN_RIGHT
    };
    
    unsigned seed = std::chrono::system_clock::now().time_since_epoch().count();
    std::mt19937 g(seed);
    std::uniform_int_distribution<> dis(0, 3);
    
    return directions[dis(g)];
}

PuzzleLevel PuzzleGenerator::generateLevel(int levelId) {
    PuzzleLevel level;
    
    DifficultyParams params = getDifficultyParams(levelId);
    level = generateLevelWithParams(levelId, params);
    
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

PuzzleLevel PuzzleGenerator::generateLevelWithParams(int levelId, const DifficultyParams& params) {
    PuzzleLevel level;
    std::vector<Tile> tiles;
    
    std::set<std::string> usedPositions;
    
    std::vector<Direction> directions = {
        Direction::UP_RIGHT, Direction::UP_LEFT,
        Direction::DOWN_LEFT, Direction::DOWN_RIGHT
    };
    
    int center = (gridSize + 1) / 2;
    int startRow = (gridSize - params.effectiveGridSize) / 2 + 1;
    int endRow = startRow + params.effectiveGridSize - 1;
    
    std::vector<std::pair<int, int>> allCells;
    for (int row = startRow; row <= endRow; row++) {
        auto cells = getValidCellsInRow(row, gridSize);
        allCells.insert(allCells.end(), cells.begin(), cells.end());
    }
    
    unsigned seed = std::chrono::system_clock::now().time_since_epoch().count();
    std::mt19937 g(seed);
    std::shuffle(allCells.begin(), allCells.end(), g);
    
    int dogCol = center;
    int dogRow = center;
    
    Direction dogDir = getOptimalDogDirection(dogCol, dogRow, gridSize);
    
    Tile dogTile(dogCol, dogRow, 1, 1, UnitType::DOG, dogDir);
    tiles.push_back(dogTile);
    markUsedPositions(usedPositions, dogCol, dogRow, 1, 1);
    
    const DirectionVector& dogVec = DIRECTION_VECTORS[static_cast<int>(dogDir)];
    int blockerCol = dogCol + dogVec.col;
    int blockerRow = dogRow + dogVec.row;
    
    if (isValidDiamondCell(blockerCol, blockerRow, gridSize)) {
        Direction blockerDir = directions[Utils::getRandomInt(0, 3)];
        tiles.push_back(Tile(blockerCol, blockerRow, 1, 1, UnitType::WOLF, blockerDir));
        markUsedPositions(usedPositions, blockerCol, blockerRow, 1, 1);
    }
    
    int tilesToPlace = static_cast<int>(allCells.size() * params.density / 100.0);
    int tilesPlaced = tiles.size();
    
    for (const auto& cell : allCells) {
        if (tilesPlaced >= tilesToPlace) {
            break;
        }
        
        int col = cell.first;
        int row = cell.second;
        
        if (usedPositions.count(std::to_string(col) + "," + std::to_string(row))) {
            continue;
        }
        
        Direction dir;
        if (params.randomDirections) {
            dir = directions[Utils::getRandomInt(0, 3)];
        } else {
            dir = directions[tilesPlaced % 4];
        }
        
        std::vector<std::pair<int, int>> tileSizes;
        if (params.maxTileSize >= 3) {
            tileSizes = {{2, 1}, {1, 2}, {1, 1}};
        } else if (params.maxTileSize >= 2) {
            tileSizes = {{2, 1}, {1, 2}, {1, 1}};
        } else {
            tileSizes = {{1, 1}};
        }
        
        std::shuffle(tileSizes.begin(), tileSizes.end(), g);
        
        bool placed = false;
        for (const auto& size : tileSizes) {
            int colSpan = size.first;
            int rowSpan = size.second;
            
            if (canPlaceTile(tiles, col, row, colSpan, rowSpan)) {
                tiles.push_back(Tile(col, row, colSpan, rowSpan, UnitType::WOLF, dir));
                markUsedPositions(usedPositions, col, row, colSpan, rowSpan);
                placed = true;
                tilesPlaced++;
                break;
            }
        }
        
        if (!placed && !usedPositions.count(std::to_string(col) + "," + std::to_string(row))) {
            tiles.push_back(Tile(col, row, 1, 1, UnitType::WOLF, dir));
            markUsedPositions(usedPositions, col, row, 1, 1);
            tilesPlaced++;
        }
    }
    
    level.tiles = tiles;
    return level;
}

PuzzleLevel PuzzleGenerator::generateSolvableLevel(int levelId, int maxRetries) {
    DifficultyParams params = getDifficultyParams(levelId);
    PuzzleSolver solver(gridSize);
    
    solver.setMaxDepth(500);
    solver.setMaxStates(50000);
    solver.setTimeout(10);
    
    PuzzleLevel lastLevel;
    auto startTime = std::chrono::high_resolution_clock::now();
    int actualRetries = (maxRetries > 0) ? maxRetries : maxRetriesDefault;
    
    for (int attempt = 0; attempt < actualRetries; attempt++) {
        auto currentTime = std::chrono::high_resolution_clock::now();
        auto elapsed = std::chrono::duration_cast<std::chrono::seconds>(currentTime - startTime).count();
        
        if (elapsed >= timeoutSeconds) {
            std::cout << "Level " << levelId << " generation timed out after " << elapsed << " seconds" << std::endl;
            break;
        }
        
        if (attempt > 0 && attempt % 5 == 0) {
            params = degradeDifficulty(params, attempt);
            std::cout << "  Degrading difficulty for level " << levelId << " (attempt " << (attempt + 1) << ")" << std::endl;
        }
        
        PuzzleLevel level = generateLevelWithParams(levelId, params);
        
        level.id = levelId;
        level.name = "第" + std::to_string(levelId) + "关";
        level.type = "normal";
        level.unlocked = (levelId == 1);
        level.timeLimit = 0;
        level.stars = 0;
        level.score = 0;
        
        setDogTile(level);
        lastLevel = level;
        
        if (validateLevel(level)) {
            if (solver.isSolvable(level)) {
                auto endTime = std::chrono::high_resolution_clock::now();
                auto duration = std::chrono::duration_cast<std::chrono::seconds>(endTime - startTime).count();
                std::cout << "Level " << levelId << " generated and verified solvable (attempt " << (attempt + 1) 
                          << ", time: " << duration << "s)" << std::endl;
                return level;
            }
        }
        
        if (attempt % 10 == 9) {
            std::cout << "Level " << levelId << " attempt " << (attempt + 1) << " not solvable, continuing..." << std::endl;
        }
    }
    
    std::cout << "Warning: Could not generate solvable level " << levelId << " after " << actualRetries << " attempts." << std::endl;
    std::cout << "  Creating simplified level as fallback..." << std::endl;
    
    DifficultyParams simpleParams;
    simpleParams.effectiveGridSize = 6;
    simpleParams.maxTileSize = 1;
    simpleParams.density = 30;
    simpleParams.randomDirections = false;
    simpleParams.minMoves = 1;
    simpleParams.maxMoves = 3;
    
    PuzzleLevel simpleLevel = generateLevelWithParams(levelId, simpleParams);
    simpleLevel.id = levelId;
    simpleLevel.name = "第" + std::to_string(levelId) + "关";
    simpleLevel.type = "normal";
    simpleLevel.unlocked = (levelId == 1);
    setDogTile(simpleLevel);
    
    return simpleLevel;
}

DifficultyParams PuzzleGenerator::degradeDifficulty(const DifficultyParams& params, int attemptCount) {
    DifficultyParams degraded = params;
    
    degraded.density = std::max(25, params.density - 5);
    
    if (attemptCount > 15 && params.effectiveGridSize > 6) {
        degraded.effectiveGridSize = params.effectiveGridSize - 1;
    }
    
    if (attemptCount > 20 && params.maxTileSize > 1) {
        degraded.maxTileSize = params.maxTileSize - 1;
    }
    
    return degraded;
}

void PuzzleGenerator::setTimeout(int seconds) {
    timeoutSeconds = seconds;
}

void PuzzleGenerator::setMaxRetries(int retries) {
    maxRetriesDefault = retries;
}

PuzzleLevel PuzzleGenerator::generateLevel1() {
    return generateLevel(1);
}

PuzzleLevel PuzzleGenerator::generateLevel2() {
    return generateLevel(2);
}

PuzzleLevel PuzzleGenerator::generateLevel3() {
    return generateLevel(3);
}

PuzzleLevel PuzzleGenerator::generateRandomLevel(int levelId) {
    return generateLevel(levelId);
}

void PuzzleGenerator::setDogTile(PuzzleLevel& level) {
    for (auto& tile : level.tiles) {
        if (tile.unitType == UnitType::DOG) {
            level.dogTile = &tile;
            break;
        }
    }
}

bool PuzzleGenerator::validateLevel(const PuzzleLevel& level) {
    if (level.tiles.empty()) {
        std::cout << "Validation failed: No tiles in level" << std::endl;
        return false;
    }
    
    std::set<std::string> used;
    
    for (const auto& tile : level.tiles) {
        for (int c = tile.gridCol; c < tile.gridCol + tile.gridColSpan; c++) {
            for (int r = tile.gridRow; r < tile.gridRow + tile.gridRowSpan; r++) {
                std::string key = std::to_string(c) + "," + std::to_string(r);
                if (used.count(key)) {
                    std::cout << "Validation failed: Overlapping tiles at " << key << std::endl;
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
    
    if (!hasDog) {
        std::cout << "Validation failed: No dog tile found" << std::endl;
        return false;
    }
    
    for (const auto& tile : level.tiles) {
        for (int c = tile.gridCol; c < tile.gridCol + tile.gridColSpan; c++) {
            for (int r = tile.gridRow; r < tile.gridRow + tile.gridRowSpan; r++) {
                if (!isValidDiamondCell(c, r, gridSize)) {
                    std::cout << "Validation failed: Tile at (" << c << "," << r << ") is outside diamond grid" << std::endl;
                    return false;
                }
            }
        }
    }
    
    return true;
}

ValidationReport PuzzleGenerator::validateLevelWithReport(const PuzzleLevel& level) {
    ValidationReport report;
    report.isValid = true;
    report.tileCount = level.tiles.size();
    report.hasDog = false;
    report.allCellsCovered = true;
    report.noOverlaps = true;
    
    std::set<std::string> used;
    int dogTiles = 0;
    int wolfTiles = 0;
    
    for (const auto& tile : level.tiles) {
        if (tile.unitType == UnitType::DOG) {
            dogTiles++;
            report.hasDog = true;
        } else {
            wolfTiles++;
        }
        
        for (int c = tile.gridCol; c < tile.gridCol + tile.gridColSpan; c++) {
            for (int r = tile.gridRow; r < tile.gridRow + tile.gridRowSpan; r++) {
                std::string key = std::to_string(c) + "," + std::to_string(r);
                if (used.count(key)) {
                    report.noOverlaps = false;
                    report.overlapPositions.push_back(key);
                    report.isValid = false;
                }
                used.insert(key);
            }
        }
    }
    
    report.dogTileCount = dogTiles;
    report.wolfTileCount = wolfTiles;
    
    auto allCells = getAllValidCells(gridSize);
    for (const auto& cell : allCells) {
        std::string key = std::to_string(cell.first) + "," + std::to_string(cell.second);
        if (used.find(key) == used.end()) {
            report.allCellsCovered = false;
            report.uncoveredCells.push_back(key);
        }
    }
    
    if (!report.hasDog) {
        report.isValid = false;
        report.errors.push_back("No dog tile found in level");
    }
    
    if (!report.allCellsCovered) {
        report.warnings.push_back("Not all cells are covered by tiles");
    }
    
    if (!report.noOverlaps) {
        report.isValid = false;
        report.errors.push_back("Overlapping tiles detected");
    }
    
    return report;
}

bool PuzzleGenerator::checkLevelSolvability(const PuzzleLevel& level) {
    PuzzleSolver solver(gridSize);
    return solver.isSolvable(level);
}

std::vector<Tile> PuzzleGenerator::generateTiles() {
    PuzzleLevel level = generateLevel(1);
    return level.tiles;
}

PuzzleLevel PuzzleGenerator::generateLevelWithGridSize(int levelId, int effectiveGridSize, int maxTileSize, int density) {
    DifficultyParams params;
    params.effectiveGridSize = effectiveGridSize;
    params.maxTileSize = maxTileSize;
    params.density = density;
    params.randomDirections = true;
    params.dogEscapeBonus = 0;
    params.minMoves = 1;
    params.maxMoves = 10;
    
    return generateLevelWithParams(levelId, params);
}

PuzzleLevel PuzzleGenerator::generateLevelByDifficulty(int levelId, int maxTileSize, int density, bool randomDirections) {
    DifficultyParams params;
    params.effectiveGridSize = gridSize;
    params.maxTileSize = maxTileSize;
    params.density = density;
    params.randomDirections = randomDirections;
    params.dogEscapeBonus = 0;
    params.minMoves = 1;
    params.maxMoves = 10;
    
    return generateLevelWithParams(levelId, params);
}

void PuzzleGenerator::printValidationReport(const ValidationReport& report) {
    std::cout << "\n=== Validation Report ===" << std::endl;
    std::cout << "Valid: " << (report.isValid ? "YES" : "NO") << std::endl;
    std::cout << "Total tiles: " << report.tileCount << std::endl;
    std::cout << "Dog tiles: " << report.dogTileCount << std::endl;
    std::cout << "Wolf tiles: " << report.wolfTileCount << std::endl;
    std::cout << "Has dog: " << (report.hasDog ? "YES" : "NO") << std::endl;
    std::cout << "All cells covered: " << (report.allCellsCovered ? "YES" : "NO") << std::endl;
    std::cout << "No overlaps: " << (report.noOverlaps ? "YES" : "NO") << std::endl;
    
    if (!report.errors.empty()) {
        std::cout << "\nErrors:" << std::endl;
        for (const auto& error : report.errors) {
            std::cout << "  - " << error << std::endl;
        }
    }
    
    if (!report.warnings.empty()) {
        std::cout << "\nWarnings:" << std::endl;
        for (const auto& warning : report.warnings) {
            std::cout << "  - " << warning << std::endl;
        }
    }
    
    if (!report.uncoveredCells.empty() && report.uncoveredCells.size() <= 10) {
        std::cout << "\nUncovered cells:" << std::endl;
        for (const auto& cell : report.uncoveredCells) {
            std::cout << "  - " << cell << std::endl;
        }
    } else if (report.uncoveredCells.size() > 10) {
        std::cout << "\nUncovered cells: " << report.uncoveredCells.size() << " cells" << std::endl;
    }
    
    std::cout << "========================\n" << std::endl;
}
