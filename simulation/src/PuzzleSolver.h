#ifndef PUZZLE_SOLVER_H
#define PUZZLE_SOLVER_H

#include "Tile.h"
#include "PuzzleGenerator.h"
#include <vector>
#include <queue>
#include <unordered_set>
#include <memory>

struct Move {
    int tileIndex;
    int newCol;
    int newRow;
    bool disappeared;
};

struct GameState {
    std::vector<Tile> tiles;
    std::vector<Move> moves;
    int moveCount;
    
    GameState(const std::vector<Tile>& t) : tiles(t), moveCount(0) {}
    bool operator==(const GameState& other) const;
    size_t hash() const;
};

struct GameStateHash {
    size_t operator()(const GameState& state) const;
};

class PuzzleSolver {
private:
    int gridSize;
    int maxDepth;
    int maxStates;
    
    bool checkCollision(const std::vector<Tile>& tiles, int excludeIndex, int col, int row, int colSpan, int rowSpan);
    bool isOutOfBounds(int col, int row, int colSpan, int rowSpan);
    bool canSlideTile(const std::vector<Tile>& tiles, int tileIndex, Direction dir, int& newCol, int& newRow, bool& willDisappear);
    std::vector<Move> getPossibleMoves(const std::vector<Tile>& tiles);
    bool solveDFS(std::vector<Tile>& tiles, std::vector<Move>& solution, int depth, std::unordered_set<GameState, GameStateHash>& visited);
    bool solveBFS(const std::vector<Tile>& tiles, std::vector<Move>& solution);
    bool hasDogEscaped(const std::vector<Tile>& tiles);
    
public:
    PuzzleSolver(int size = 14);
    
    bool isSolvable(const PuzzleLevel& level);
    std::vector<Move> findSolution(const PuzzleLevel& level);
    bool fixLevel(PuzzleLevel& level);
    
    void setMaxDepth(int depth);
    void setMaxStates(int states);
};

#endif
