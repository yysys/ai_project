#include "Utils.h"
#include "Tile.h"
#include <random>
#include <sstream>
#include <iomanip>

int Utils::getRandomInt(int min, int max) {
    static std::random_device rd;
    static std::mt19937 gen(rd() + std::chrono::system_clock::now().time_since_epoch().count());
    std::uniform_int_distribution<> dis(min, max);
    return dis(gen);
}

bool Utils::getRandomBool(double probability) {
    static std::random_device rd;
    static std::mt19937 gen(rd());
    std::bernoulli_distribution dist(probability);
    return dist(gen);
}

Direction Utils::getRandomDirection() {
    int choice = getRandomInt(0, 3);
    switch (choice) {
        case 0: return Direction::UP_LEFT;
        case 1: return Direction::UP_RIGHT;
        case 2: return Direction::DOWN_LEFT;
        case 3: return Direction::DOWN_RIGHT;
        default: return Direction::UP_RIGHT;
    }
}

std::string Utils::generateId() {
    auto now = std::chrono::system_clock::now();
    auto timestamp = std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch()).count();
    
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(100000, 999999);
    
    std::ostringstream oss;
    oss << timestamp << "_" << std::setw(6) << std::setfill('0') << dis(gen);
    return oss.str();
}

bool Utils::isPositionValid(int col, int row, int gridSize) {
    return col >= 1 && col <= gridSize && row >= 1 && row <= gridSize;
}

bool Utils::isInGridBounds(int col, int row, int gridSize) {
    return col >= 1 && col <= gridSize && row >= 1 && row <= gridSize;
}
