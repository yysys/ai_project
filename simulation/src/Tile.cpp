#include "Tile.h"
#include <sstream>
#include <random>

Tile::Tile() : gridCol(0), gridRow(0), gridColSpan(1), gridRowSpan(1), 
               type(TileType::SINGLE), unitType(UnitType::WOLF), direction(Direction::UP_RIGHT) {}

Tile::Tile(int col, int row, int colSpan, int rowSpan, UnitType utype, Direction dir)
    : gridCol(col), gridRow(row), gridColSpan(colSpan), gridRowSpan(rowSpan),
      unitType(utype), direction(dir) {
    
    static std::random_device rd;
    static std::mt19937 gen(rd());
    static std::uniform_int_distribution<> dis(100000, 999999);
    
    std::ostringstream oss;
    oss << dis(gen) << "_" << dis(gen);
    id = oss.str();
    
    if (gridColSpan > 1) {
        this->type = TileType::HORIZONTAL;
    } else if (gridRowSpan > 1) {
        this->type = TileType::VERTICAL;
    } else {
        this->type = TileType::SINGLE;
    }
}

int Tile::getRight() const {
    return gridCol + gridColSpan - 1;
}

int Tile::getBottom() const {
    return gridRow + gridRowSpan - 1;
}

bool Tile::contains(int col, int row) const {
    return col >= gridCol && col <= getRight() && 
           row >= gridRow && row <= getBottom();
}

bool Tile::overlaps(const Tile& other) const {
    int left1 = gridCol, right1 = getRight(), top1 = gridRow, bottom1 = getBottom();
    int left2 = other.gridCol, right2 = other.getRight(), top2 = other.gridRow, bottom2 = other.getBottom();
    
    return left1 <= right2 && right1 >= left2 && 
           top1 <= bottom2 && bottom1 >= top2;
}

std::string Tile::directionToString(Direction dir) {
    switch (dir) {
        case Direction::UP_LEFT: return "up_left";
        case Direction::UP_RIGHT: return "up_right";
        case Direction::DOWN_LEFT: return "down_left";
        case Direction::DOWN_RIGHT: return "down_right";
        default: return "up_right";
    }
}

Direction Tile::directionFromString(const std::string& str) {
    if (str == "up_left") return Direction::UP_LEFT;
    if (str == "up_right") return Direction::UP_RIGHT;
    if (str == "down_left") return Direction::DOWN_LEFT;
    if (str == "down_right") return Direction::DOWN_RIGHT;
    return Direction::UP_RIGHT;
}

std::string Tile::unitTypeToString(UnitType type) {
    return type == UnitType::DOG ? "dog" : "wolf";
}

UnitType Tile::unitTypeFromString(const std::string& str) {
    return str == "dog" ? UnitType::DOG : UnitType::WOLF;
}

std::string Tile::tileTypeToString(TileType type) {
    switch (type) {
        case TileType::HORIZONTAL: return "horizontal";
        case TileType::VERTICAL: return "vertical";
        case TileType::SINGLE: return "single";
        default: return "single";
    }
}
