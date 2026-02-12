#include "Tile.h"
#include <sstream>
#include <algorithm>

Tile::Tile() : id(""), type(TileType::SINGLE), unitType(UnitType::WOLF),
               gridCol(0), gridRow(0), gridColSpan(1), gridRowSpan(1),
               direction(Direction::UP_RIGHT) {}

Tile::Tile(int col, int row, int colSpan, int rowSpan, UnitType type, Direction dir)
    : id(""), unitType(type), gridCol(col), gridRow(row),
      gridColSpan(colSpan), gridRowSpan(rowSpan), direction(dir) {
    if (colSpan > rowSpan) {
        this->type = TileType::HORIZONTAL;
    } else if (rowSpan > colSpan) {
        this->type = TileType::VERTICAL;
    } else {
        this->type = TileType::SINGLE;
    }
    
    std::ostringstream oss;
    oss << gridCol << "_" << gridRow << "_" << colSpan << "x" << rowSpan;
    id = oss.str();
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
    int left = gridCol;
    int right = getRight();
    int top = gridRow;
    int bottom = getBottom();
    
    int otherLeft = other.gridCol;
    int otherRight = other.getRight();
    int otherTop = other.gridRow;
    int otherBottom = other.getBottom();
    
    return !(right < otherLeft || left > otherRight ||
             bottom < otherTop || top > otherBottom);
}

std::string Tile::directionToString(Direction dir) {
    switch (dir) {
        case Direction::UP_LEFT: return "up_left";
        case Direction::UP_RIGHT: return "up_right";
        case Direction::DOWN_LEFT: return "down_left";
        case Direction::DOWN_RIGHT: return "down_right";
    }
    return "up_right";
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
    if (str == "dog") return UnitType::DOG;
    return UnitType::WOLF;
}

std::string Tile::tileTypeToString(TileType type) {
    switch (type) {
        case TileType::HORIZONTAL: return "horizontal";
        case TileType::VERTICAL: return "vertical";
        case TileType::SINGLE: return "single";
    }
    return "single";
}

TileType Tile::tileTypeFromString(const std::string& str) {
    if (str == "horizontal") return TileType::HORIZONTAL;
    if (str == "vertical") return TileType::VERTICAL;
    return TileType::SINGLE;
}
