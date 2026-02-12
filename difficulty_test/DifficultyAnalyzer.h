#ifndef DIFFICULTY_ANALYZER_H
#define DIFFICULTY_ANALYZER_H

#include "Tile.h"
#include <vector>
#include <string>
#include <memory>
#include <unordered_set>

enum class DifficultyLevel {
    VERY_EASY,
    EASY,
    MEDIUM,
    HARD,
    VERY_HARD
};

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

struct DifficultyMetrics {
    int optimalMoves;
    int totalPossibleMoves;
    int branchingFactor;
    double wolfDensity;
    int dogDistanceToEdge;
    double pathComplexity;
    int deadEndStates;
    int solutionWidth;
    double averageMoveOptions;
    DifficultyLevel level;
    double difficultyScore;
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

class DifficultyAnalyzer {
private:
    int gridSize;
    int maxDepth;
    int maxStates;
    
    bool checkCollision(const std::vector<Tile>& tiles, int excludeIndex, int col, int row, int colSpan, int rowSpan);
    bool isOutOfBounds(int col, int row, int colSpan, int rowSpan);
    bool canSlideTile(const std::vector<Tile>& tiles, int tileIndex, Direction dir, int& newCol, int& newRow, bool& willDisappear);
    std::vector<Move> getPossibleMoves(const std::vector<Tile>& tiles);
    bool hasDogEscaped(const std::vector<Tile>& tiles);
    
    bool solveBFS(std::vector<Tile> tiles, std::vector<Move>& solution, int& statesExplored);
    bool solveDFS(std::vector<Tile> tiles, int depth, 
                  std::unordered_set<GameState, GameStateHash>& visited, 
                  int& deadEnds, int& maxDepthReached);
    
    int calculateDogDistanceToEdge(const PuzzleLevel& level);
    double calculateWolfDensity(const PuzzleLevel& level);
    double calculateAverageMoveOptions(const std::vector<Tile>& tiles);
    int calculateBranchingFactor(const std::vector<Tile>& tiles);
    int countDeadEndStates(const std::vector<Tile>& tiles);
    int calculateSolutionWidth(const PuzzleLevel& level);
    double calculatePathComplexity(const std::vector<Tile>& tiles, const std::vector<Move>& solution);
    
    DifficultyLevel classifyDifficulty(const DifficultyMetrics& metrics);
    double calculateDifficultyScore(const DifficultyMetrics& metrics);
    
public:
    DifficultyAnalyzer(int size = 14);
    
    DifficultyMetrics analyzeLevel(const PuzzleLevel& level);
    std::vector<Move> findOptimalSolution(const PuzzleLevel& level);
    
    void setMaxDepth(int depth);
    void setMaxStates(int states);
    
    std::string difficultyToString(DifficultyLevel level);
    void printMetrics(const DifficultyMetrics& metrics);
};

#endif
