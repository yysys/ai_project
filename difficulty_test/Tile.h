#ifndef TILE_H
#define TILE_H

#include <string>
#include <array>

enum class Direction {
    UP_LEFT,
    UP_RIGHT,
    DOWN_LEFT,
    DOWN_RIGHT
};

enum class UnitType {
    DOG,
    WOLF
};

enum class TileType {
    HORIZONTAL,
    VERTICAL,
    SINGLE
};

struct Tile {
    std::string id;
    TileType type;
    UnitType unitType;
    int gridCol;
    int gridRow;
    int gridColSpan;
    int gridRowSpan;
    Direction direction;

    Tile();
    Tile(int col, int row, int colSpan, int rowSpan, UnitType type, Direction dir);
    
    int getRight() const;
    int getBottom() const;
    bool contains(int col, int row) const;
    bool overlaps(const Tile& other) const;
    
    static std::string directionToString(Direction dir);
    static Direction directionFromString(const std::string& str);
    static std::string unitTypeToString(UnitType type);
    static UnitType unitTypeFromString(const std::string& str);
    static std::string tileTypeToString(TileType type);
    static TileType tileTypeFromString(const std::string& str);
};

struct DirectionVector {
    int col;
    int row;
    int angle;
};

const std::array<DirectionVector, 4> DIRECTION_VECTORS = {
    DirectionVector{-1, -1, 225},
    DirectionVector{1, -1, 315},
    DirectionVector{-1, 1, 135},
    DirectionVector{1, 1, 45}
};

#endif
