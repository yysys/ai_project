#include "PuzzleSolver.h"
#include "Utils.h"
#include <algorithm>
#include <functional>
#include <iostream>
#include <chrono>

PuzzleSolver::PuzzleSolver(int size) : gridSize(size), maxDepth(1000), maxStates(100000), timeoutSeconds(10), shouldTerminate(false) {}

bool PuzzleSolver::checkTimeout() {
    if (timeoutSeconds <= 0) return false;
    
    auto currentTime = std::chrono::high_resolution_clock::now();
    auto elapsed = std::chrono::duration_cast<std::chrono::seconds>(currentTime - startTime).count();
    
    if (elapsed >= timeoutSeconds) {
        shouldTerminate = true;
        return true;
    }
    return false;
}

void PuzzleSolver::setTimeout(int seconds) {
    timeoutSeconds = seconds;
}

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

bool PuzzleSolver::isOutOfBounds(int col, int row, int colSpan, int rowSpan) {
    return col < 1 || col + colSpan - 1 > gridSize ||
           row < 1 || row + rowSpan - 1 > gridSize;
}

bool PuzzleSolver::checkCollision(const std::vector<Tile>& tiles, int excludeIndex, 
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

bool PuzzleSolver::canSlideTile(const std::vector<Tile>& tiles, int tileIndex, 
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

std::vector<Move> PuzzleSolver::getPossibleMoves(const std::vector<Tile>& tiles) {
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

bool PuzzleSolver::hasDogEscaped(const std::vector<Tile>& tiles) {
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

bool PuzzleSolver::solveDFS(std::vector<Tile>& tiles, std::vector<Move>& solution, 
                            int depth, std::unordered_set<GameState, GameStateHash>& visited) {
    if (shouldTerminate || checkTimeout()) return false;
    if (depth > maxDepth) return false;
    if (static_cast<int>(visited.size()) > maxStates) return false;
    
    if (depth % 100 == 0 && checkTimeout()) return false;
    
    GameState currentState(tiles);
    if (visited.count(currentState)) return false;
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
        if (shouldTerminate) return false;
        
        Tile& tile = tiles[move.tileIndex];
        int oldCol = tile.gridCol;
        int oldRow = tile.gridRow;
        
        tile.gridCol = move.newCol;
        tile.gridRow = move.newRow;
        
        if (move.disappeared) {
            return true;
        }
        
        solution.push_back(move);
        if (solveDFS(tiles, solution, depth + 1, visited)) {
            return true;
        }
        solution.pop_back();
        
        tile.gridCol = oldCol;
        tile.gridRow = oldRow;
    }
    
    for (const auto& move : otherMoves) {
        if (shouldTerminate) return false;
        
        Tile& tile = tiles[move.tileIndex];
        int oldCol = tile.gridCol;
        int oldRow = tile.gridRow;
        
        tile.gridCol = move.newCol;
        tile.gridRow = move.newRow;
        
        solution.push_back(move);
        if (solveDFS(tiles, solution, depth + 1, visited)) {
            return true;
        }
        solution.pop_back();
        
        tile.gridCol = oldCol;
        tile.gridRow = oldRow;
    }
    
    return false;
}

bool PuzzleSolver::solveBFS(const std::vector<Tile>& tiles, std::vector<Move>& solution) {
    std::queue<std::pair<std::vector<Tile>, std::vector<Move>>> queue;
    std::unordered_set<GameState, GameStateHash> visited;
    
    GameState initialState(tiles);
    visited.insert(initialState);
    queue.push({tiles, {}});
    
    int iterations = 0;
    
    while (!queue.empty()) {
        if (shouldTerminate || checkTimeout()) return false;
        
        iterations++;
        if (iterations > maxStates) return false;
        
        if (iterations % 1000 == 0 && checkTimeout()) return false;
        
        auto current = queue.front();
        queue.pop();
        
        auto currentTiles = current.first;
        auto currentMoves = current.second;
        
        auto moves = getPossibleMoves(currentTiles);
        
        for (const auto& move : moves) {
            if (shouldTerminate) return false;
            
            auto newTiles = currentTiles;
            newTiles[move.tileIndex].gridCol = move.newCol;
            newTiles[move.tileIndex].gridRow = move.newRow;
            
            if (move.disappeared) {
                solution = currentMoves;
                solution.push_back(move);
                return true;
            }
            
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

bool PuzzleSolver::isSolvable(const PuzzleLevel& level) {
    shouldTerminate = false;
    startTime = std::chrono::high_resolution_clock::now();
    
    std::vector<Tile> tiles = level.tiles;
    std::vector<Move> solution;
    std::unordered_set<GameState, GameStateHash> visited;
    
    return solveDFS(tiles, solution, 0, visited);
}

std::vector<Move> PuzzleSolver::findSolution(const PuzzleLevel& level) {
    shouldTerminate = false;
    startTime = std::chrono::high_resolution_clock::now();
    
    std::vector<Tile> tiles = level.tiles;
    std::vector<Move> solution;
    
    solveBFS(tiles, solution);
    
    return solution;
}

bool PuzzleSolver::fixLevel(PuzzleLevel& level) {
    if (isSolvable(level)) {
        return true;
    }
    
    for (auto& tile : level.tiles) {
        if (tile.unitType == UnitType::WOLF) {
            Direction oldDir = tile.direction;
            for (int d = 0; d < 4; d++) {
                tile.direction = static_cast<Direction>(d);
                if (isSolvable(level)) {
                    return true;
                }
            }
            tile.direction = oldDir;
        }
    }
    
    return false;
}

void PuzzleSolver::setMaxDepth(int depth) {
    maxDepth = depth;
}

void PuzzleSolver::setMaxStates(int states) {
    maxStates = states;
}
