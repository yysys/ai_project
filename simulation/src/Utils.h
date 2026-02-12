#ifndef UTILS_H
#define UTILS_H

#include "Tile.h"
#include <vector>
#include <string>
#include <set>
#include <random>
#include <chrono>
#include <algorithm>

class Utils {
public:
    static int getRandomInt(int min, int max);
    static bool getRandomBool(double probability = 0.5);
    static Direction getRandomDirection();
    static std::string generateId();
    
    static bool isPositionValid(int col, int row, int gridSize);
    static bool isInGridBounds(int col, int row, int gridSize);
    
    template<typename T>
    static void shuffle(std::vector<T>& vec) {
        std::random_device rd;
        std::mt19937 g(rd());
        std::shuffle(vec.begin(), vec.end(), g);
    }
};

#endif
