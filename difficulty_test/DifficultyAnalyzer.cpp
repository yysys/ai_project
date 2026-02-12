#include "DifficultyAnalyzer.h"
#include <algorithm>
#include <functional>
#include <iostream>
#include <iomanip>
#include <cmath>
#include <queue>
#include <set>

DifficultyAnalyzer::DifficultyAnalyzer(int size) : gridSize(size), maxDepth(500), maxStates(50000) {}

bool GameState::operator==(const GameState& other) const {
    if (tiles.size() != other.tiles.size()) return false;
    
    for (size_t i = 0; i < tiles.size(); i++) {
        if (tiles[i].gridCol != other.tiles[i].gridCol ||
            tiles[i].gridRow != other.tiles[i].gridRow ||
            tiles[i].unitType != other.tiles[i].unitType) {
            return false;
        }
    }
    return true;
}

size_t GameState::hash() const {
    size_t h = 0;
    for (const auto& tile : tiles) {
        h ^= std::hash<int>{}(tile.gridCol) + 0x9e3779b9 + (h << 6) + (h >> 2);
        h ^= std::hash<int>{}(tile.gridRow) + 0x9e3779b9 + (h << 6) + (h >> 2);
        h ^= std::hash<int>{}(static_cast<int>(tile.unitType)) + 0x9e3779b9 + (h << 6) + (h >> 2);
    }
    return h;
}

size_t GameStateHash::operator()(const GameState& state) const {
    return state.hash();
}

bool DifficultyAnalyzer::isOutOfBounds(int col, int row, int colSpan, int rowSpan) {
    return col < 1 || col + colSpan - 1 > gridSize ||
           row < 1 || row + rowSpan - 1 > gridSize;
}

bool DifficultyAnalyzer::checkCollision(const std::vector<Tile>& tiles, int excludeIndex, 
                                       int col, int row, int colSpan, int rowSpan) {
    int tileLeft = col;
    int tileRight = col + colSpan - 1;
    int tileTop = row;
    int tileBottom = row + rowSpan - 1;
    
    for (size_t i = 0; i < tiles.size(); i++) {
        if (i == static_cast<size_t>(excludeIndex)) continue;
        
        const Tile& other = tiles[i];
        int otherLeft = other.gridCol;
        int otherRight = other.gridCol + other.gridColSpan - 1;
        int otherTop = other.gridRow;
        int otherBottom = other.gridRow + other.gridRowSpan - 1;
        
        if (tileLeft <= otherRight && tileRight >= otherLeft &&
            tileTop <= otherBottom && tileBottom >= otherTop) {
            return true;
        }
    }
    return false;
}

bool DifficultyAnalyzer::canSlideTile(const std::vector<Tile>& tiles, int tileIndex, 
                                    Direction dir, int& newCol, int& newRow, bool& willDisappear) {
    const Tile& tile = tiles[tileIndex];
    const DirectionVector& vec = DIRECTION_VECTORS[static_cast<int>(dir)];
    
    int currentCol = tile.gridCol;
    int currentRow = tile.gridRow;
    newCol = currentCol;
    newRow = currentRow;
    willDisappear = false;
    
    while (true) {
        int nextCol = newCol + vec.col;
        int nextRow = newRow + vec.row;
        
        if (isOutOfBounds(nextCol, nextRow, tile.gridColSpan, tile.gridRowSpan)) {
            willDisappear = true;
            return true;
        }
        
        if (checkCollision(tiles, tileIndex, nextCol, nextRow, tile.gridColSpan, tile.gridRowSpan)) {
            return newCol != currentCol || newRow != currentRow;
        }
        
        newCol = nextCol;
        newRow = nextRow;
    }
}

std::vector<Move> DifficultyAnalyzer::getPossibleMoves(const std::vector<Tile>& tiles) {
    std::vector<Move> moves;
    
    for (size_t i = 0; i < tiles.size(); i++) {
        for (int dir = 0; dir < 4; dir++) {
            int newCol, newRow;
            bool willDisappear;
            
            if (canSlideTile(tiles, i, static_cast<Direction>(dir), newCol, newRow, willDisappear)) {
                if (newCol != tiles[i].gridCol || newRow != tiles[i].gridRow || willDisappear) {
                    moves.push_back({static_cast<int>(i), newCol, newRow, willDisappear});
                }
            }
        }
    }
    
    return moves;
}

bool DifficultyAnalyzer::hasDogEscaped(const std::vector<Tile>& tiles) {
    for (const auto& tile : tiles) {
        if (tile.unitType == UnitType::DOG) {
            int right = tile.gridCol + tile.gridColSpan - 1;
            int bottom = tile.gridRow + tile.gridRowSpan - 1;
            return tile.gridCol < 1 || right > gridSize || 
                   tile.gridRow < 1 || bottom > gridSize;
        }
    }
    return false;
}

bool DifficultyAnalyzer::solveBFS(std::vector<Tile> tiles, std::vector<Move>& solution, int& statesExplored) {
    std::queue<std::pair<std::vector<Tile>, std::vector<Move>>> queue;
    std::unordered_set<GameState, GameStateHash> visited;
    
    GameState initialState(tiles);
    visited.insert(initialState);
    queue.push({tiles, {}});
    
    statesExplored = 0;
    
    while (!queue.empty()) {
        statesExplored++;
        if (statesExplored > maxStates) return false;
        
        auto current = queue.front();
        queue.pop();
        
        auto currentTiles = current.first;
        auto currentMoves = current.second;
        
        if (hasDogEscaped(currentTiles)) {
            solution = currentMoves;
            return true;
        }
        
        auto moves = getPossibleMoves(currentTiles);
        
        for (const auto& move : moves) {
            auto newTiles = currentTiles;
            newTiles[move.tileIndex].gridCol = move.newCol;
            newTiles[move.tileIndex].gridRow = move.newRow;
            
            GameState newState(newTiles);
            if (!visited.count(newState)) {
                visited.insert(newState);
                
                auto newMoves = currentMoves;
                newMoves.push_back(move);
                
                queue.push({newTiles, newMoves});
            }
        }
    }
    
    return false;
}

bool DifficultyAnalyzer::solveDFS(std::vector<Tile> tiles, int depth, 
                                   std::unordered_set<GameState, GameStateHash>& visited,
                                   int& deadEnds, int& maxDepthReached) {
    if (depth > maxDepth) return false;
    
    maxDepthReached = std::max(maxDepthReached, depth);
    
    GameState currentState(tiles);
    if (visited.count(currentState)) {
        deadEnds++;
        return false;
    }
    visited.insert(currentState);
    
    if (hasDogEscaped(tiles)) return true;
    
    auto moves = getPossibleMoves(tiles);
    
    std::vector<Move> dogMoves;
    std::vector<Move> otherMoves;
    
    for (const auto& move : moves) {
        if (tiles[move.tileIndex].unitType == UnitType::DOG) {
            dogMoves.push_back(move);
        } else {
            otherMoves.push_back(move);
        }
    }
    
    for (const auto& move : dogMoves) {
        Tile& tile = tiles[move.tileIndex];
        int oldCol = tile.gridCol;
        int oldRow = tile.gridRow;
        
        tile.gridCol = move.newCol;
        tile.gridRow = move.newRow;
        
        if (move.disappeared) {
            return true;
        }
        
        if (solveDFS(tiles, depth + 1, visited, deadEnds, maxDepthReached)) {
            return true;
        }
        
        tile.gridCol = oldCol;
        tile.gridRow = oldRow;
    }
    
    for (const auto& move : otherMoves) {
        Tile& tile = tiles[move.tileIndex];
        int oldCol = tile.gridCol;
        int oldRow = tile.gridRow;
        
        tile.gridCol = move.newCol;
        tile.gridRow = move.newRow;
        
        if (solveDFS(tiles, depth + 1, visited, deadEnds, maxDepthReached)) {
            return true;
        }
        
        tile.gridCol = oldCol;
        tile.gridRow = oldRow;
    }
    
    deadEnds++;
    return false;
}

int DifficultyAnalyzer::calculateDogDistanceToEdge(const PuzzleLevel& level) {
    if (!level.dogTile) return 0;
    
    const Tile& dog = *level.dogTile;
    int minDist = gridSize;
    
    int distToLeft = dog.gridCol - 1;
    int distToRight = gridSize - dog.getRight();
    int distToTop = dog.gridRow - 1;
    int distToBottom = gridSize - dog.getBottom();
    
    minDist = std::min({distToLeft, distToRight, distToTop, distToBottom});
    
    return minDist;
}

double DifficultyAnalyzer::calculateWolfDensity(const PuzzleLevel& level) {
    int wolfCount = 0;
    for (const auto& tile : level.tiles) {
        if (tile.unitType == UnitType::WOLF) {
            wolfCount++;
        }
    }
    
    int diamondCells = 0;
    int center = gridSize / 2;
    for (int row = 1; row <= gridSize; row++) {
        int maxColInRow = gridSize - std::abs(row - center);
        diamondCells += maxColInRow;
    }
    
    return static_cast<double>(wolfCount) / diamondCells;
}

double DifficultyAnalyzer::calculateAverageMoveOptions(const std::vector<Tile>& tiles) {
    double totalOptions = 0;
    
    for (size_t i = 0; i < tiles.size(); i++) {
        int options = 0;
        for (int dir = 0; dir < 4; dir++) {
            int newCol, newRow;
            bool willDisappear;
            if (canSlideTile(tiles, i, static_cast<Direction>(dir), newCol, newRow, willDisappear)) {
                if (newCol != tiles[i].gridCol || newRow != tiles[i].gridRow || willDisappear) {
                    options++;
                }
            }
        }
        totalOptions += options;
    }
    
    return tiles.empty() ? 0 : totalOptions / tiles.size();
}

int DifficultyAnalyzer::calculateBranchingFactor(const std::vector<Tile>& tiles) {
    return static_cast<int>(getPossibleMoves(tiles).size());
}

int DifficultyAnalyzer::countDeadEndStates(const std::vector<Tile>& tiles) {
    std::unordered_set<GameState, GameStateHash> visited;
    int deadEnds = 0;
    int maxDepthReached = 0;
    
    solveDFS(tiles, 0, visited, deadEnds, maxDepthReached);
    
    return deadEnds;
}

int DifficultyAnalyzer::calculateSolutionWidth(const PuzzleLevel& level) {
    std::vector<Tile> tiles = level.tiles;
    std::vector<Move> solution;
    int statesExplored = 0;
    
    if (!solveBFS(tiles, solution, statesExplored)) {
        return 0;
    }
    
    return statesExplored;
}

double DifficultyAnalyzer::calculatePathComplexity(const std::vector<Tile>& tiles, const std::vector<Move>& solution) {
    if (solution.empty()) return 0;
    
    double totalMoveDistance = 0;
    std::vector<Tile> currentTiles = tiles;
    
    for (const auto& move : solution) {
        Tile& tile = currentTiles[move.tileIndex];
        int colDist = std::abs(tile.gridCol - move.newCol);
        int rowDist = std::abs(tile.gridRow - move.newRow);
        totalMoveDistance += std::sqrt(colDist * colDist + rowDist * rowDist);
        
        tile.gridCol = move.newCol;
        tile.gridRow = move.newRow;
    }
    
    return totalMoveDistance / solution.size();
}

DifficultyLevel DifficultyAnalyzer::classifyDifficulty(const DifficultyMetrics& metrics) {
    double score = metrics.difficultyScore;
    
    if (score < 10) return DifficultyLevel::VERY_EASY;
    if (score < 25) return DifficultyLevel::EASY;
    if (score < 45) return DifficultyLevel::MEDIUM;
    if (score < 70) return DifficultyLevel::HARD;
    return DifficultyLevel::VERY_HARD;
}

double DifficultyAnalyzer::calculateDifficultyScore(const DifficultyMetrics& metrics) {
    double score = 0;
    
    score += metrics.optimalMoves * 2.0;
    score += metrics.branchingFactor * 0.5;
    score += metrics.wolfDensity * 100;
    score += (10 - metrics.dogDistanceToEdge) * 1.5;
    score += metrics.deadEndStates * 0.01;
    score += metrics.solutionWidth * 0.02;
    score += metrics.pathComplexity * 0.5;
    
    score /= (metrics.averageMoveOptions + 1);
    
    return score;
}

DifficultyMetrics DifficultyAnalyzer::analyzeLevel(const PuzzleLevel& level) {
    DifficultyMetrics metrics;
    
    std::vector<Tile> tiles = level.tiles;
    std::vector<Move> solution;
    int statesExplored = 0;
    
    bool solvable = solveBFS(tiles, solution, statesExplored);
    
    if (solvable) {
        metrics.optimalMoves = static_cast<int>(solution.size());
        metrics.pathComplexity = calculatePathComplexity(level.tiles, solution);
    } else {
        metrics.optimalMoves = -1;
        metrics.pathComplexity = 0;
    }
    
    metrics.totalPossibleMoves = calculateBranchingFactor(level.tiles);
    metrics.branchingFactor = metrics.totalPossibleMoves;
    metrics.wolfDensity = calculateWolfDensity(level);
    metrics.dogDistanceToEdge = calculateDogDistanceToEdge(level);
    metrics.averageMoveOptions = calculateAverageMoveOptions(level.tiles);
    metrics.deadEndStates = countDeadEndStates(level.tiles);
    metrics.solutionWidth = calculateSolutionWidth(level);
    
    metrics.difficultyScore = calculateDifficultyScore(metrics);
    metrics.level = classifyDifficulty(metrics);
    
    return metrics;
}

std::vector<Move> DifficultyAnalyzer::findOptimalSolution(const PuzzleLevel& level) {
    std::vector<Tile> tiles = level.tiles;
    std::vector<Move> solution;
    int statesExplored = 0;
    
    solveBFS(tiles, solution, statesExplored);
    
    return solution;
}

void DifficultyAnalyzer::setMaxDepth(int depth) {
    maxDepth = depth;
}

void DifficultyAnalyzer::setMaxStates(int states) {
    maxStates = states;
}

std::string DifficultyAnalyzer::difficultyToString(DifficultyLevel level) {
    switch (level) {
        case DifficultyLevel::VERY_EASY: return "Very Easy";
        case DifficultyLevel::EASY: return "Easy";
        case DifficultyLevel::MEDIUM: return "Medium";
        case DifficultyLevel::HARD: return "Hard";
        case DifficultyLevel::VERY_HARD: return "Very Hard";
    }
    return "Unknown";
}

void DifficultyAnalyzer::printMetrics(const DifficultyMetrics& metrics) {
    std::cout << std::fixed << std::setprecision(2);
    std::cout << "=== Difficulty Analysis Results ===" << std::endl;
    std::cout << "Difficulty Level: " << difficultyToString(metrics.level) << std::endl;
    std::cout << "Difficulty Score: " << metrics.difficultyScore << std::endl;
    std::cout << "Optimal Moves: " << metrics.optimalMoves << std::endl;
    std::cout << "Total Possible Moves: " << metrics.totalPossibleMoves << std::endl;
    std::cout << "Branching Factor: " << metrics.branchingFactor << std::endl;
    std::cout << "Wolf Density: " << (metrics.wolfDensity * 100) << "%" << std::endl;
    std::cout << "Dog Distance to Edge: " << metrics.dogDistanceToEdge << std::endl;
    std::cout << "Path Complexity: " << metrics.pathComplexity << std::endl;
    std::cout << "Dead End States: " << metrics.deadEndStates << std::endl;
    std::cout << "Solution Width (States Explored): " << metrics.solutionWidth << std::endl;
    std::cout << "Average Move Options: " << metrics.averageMoveOptions << std::endl;
    std::cout << "================================" << std::endl;
}
