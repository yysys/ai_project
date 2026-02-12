# Puzzle Simulation Generator

A high-performance C++ based puzzle level generator for the Douyin mini-game. This tool generates solvable puzzle levels with random tile placements, direction assignments, and includes built-in solvability verification.

## Features

- **Random Level Generation**: Generates puzzle levels with randomly placed rectangular tiles
- **No Overlap Guarantee**: Ensures tiles do not overlap and fill the diamond-shaped grid without gaps
- **Direction Assignment**: Each tile gets a random direction (up_left, up_right, down_left, down_right)
- **Solvability Verification**: Uses BFS/DFS algorithms to verify each level has a solution
- **Auto-fix Mechanism**: Attempts to fix unsolvable levels by adjusting tile directions
- **JSON Export**: Exports levels in JSON format compatible with the game engine
- **Mass Generation**: Can generate up to 100 levels efficiently

## Game Mechanics

The puzzle is played on a 14x14 diamond-shaped grid where:
- Tiles are rectangular blocks (1x1, 1x2, 2x1, or larger)
- Each tile has a direction indicating which way it can slide
- One special "dog" tile must escape the grid to win
- "Wolf" tiles block the dog's path
- Players click tiles to make them slide in their direction

## Project Structure

```
simulation/
├── src/
│   ├── main.cpp              # Main program entry point
│   ├── Tile.h/cpp           # Tile class definition
│   ├── PuzzleGenerator.h/cpp # Level generation logic
│   ├── PuzzleSolver.h/cpp   # Solvability verification (BFS/DFS)
│   ├── LevelExporter.h/cpp  # JSON export functionality
│   └── Utils.h/cpp          # Utility functions
├── CMakeLists.txt           # CMake build configuration
├── build.sh                # Build script for Unix-like systems
└── README.md               # This file
```

## Dependencies

- CMake 3.10 or higher
- C++17 compatible compiler (GCC, Clang, or MSVC)
- nlohmann/json library (https://github.com/nlohmann/json)

### Installing nlohmann/json

**On macOS (Homebrew):**
```bash
brew install nlohmann-json
```

**On Ubuntu/Debian:**
```bash
sudo apt-get install nlohmann-json3-dev
```

**On Windows (vcpkg):**
```bash
vcpkg install nlohmann-json
```

## Building

### On macOS/Linux

```bash
cd simulation
chmod +x build.sh
./build.sh
```

Or manually:
```bash
mkdir -p build
cd build
cmake ..
make
```

### On Windows

```bash
mkdir build
cd build
cmake ..
cmake --build .
```

## Usage

Run the compiled program:

```bash
./build/puzzle_sim
```

The program presents an interactive menu:

```
======================================
   Puzzle Simulation Generator v1.0
======================================

Select an option:
1. Generate Level 1 (Pattern 1)
2. Generate Level 2 (Pattern 2)
3. Generate Level 3 (Pattern 2)
4. Generate a random level
5. Generate 10 random levels
6. Generate 100 levels (for production)
0. Exit
```

### Example Output

When generating a level, the program will:
1. Generate tiles with random positions and sizes
2. Validate no overlaps and grid coverage
3. Verify solvability using search algorithms
4. Export to JSON format if solvable

Example JSON output:
```json
{
  "id": 1,
  "name": "第1关",
  "type": "normal",
  "unlocked": true,
  "timeLimit": 0,
  "tiles": [
    {
      "id": "123456789_123456",
      "type": "horizontal",
      "unitType": "wolf",
      "gridCol": 1,
      "gridRow": 1,
      "gridColSpan": 2,
      "gridRowSpan": 1,
      "direction": "up_right"
    },
    {
      "id": "123456790_234567",
      "type": "vertical",
      "unitType": "dog",
      "gridCol": 7,
      "gridRow": 7,
      "gridColSpan": 1,
      "gridRowSpan": 2,
      "direction": "up_left"
    }
  ]
}
```

## Integration with Game Code

The exported JSON files can be directly loaded in the JavaScript game code:

```javascript
const fs = require('fs');
const levelsData = JSON.parse(fs.readFileSync('simulation/all_levels.json', 'utf8'));

levelsData.forEach(levelConfig => {
    this.levels.push(new PuzzleLevel(levelConfig));
});
```

## Algorithm Details

### Grid Shape
The grid is diamond-shaped, calculated based on distance from center:
```cpp
maxColInRow = gridSize - abs(row - center)
startCol = (gridSize - maxColInRow) / 2 + 1
```

### Tile Placement
Tiles are placed randomly with the following constraints:
- No overlap with existing tiles
- Within diamond grid boundaries
- Rectangular shape (1x1, 1x2, 2x1, or larger)

### Solvability Check
Uses a combination of:
1. **BFS (Breadth-First Search)**: Finds the shortest solution
2. **DFS (Depth-First Search)**: Efficiently checks solvability
3. **State Hashing**: Avoids revisiting same board states
4. **Dog-First Strategy**: Prioritizes moves that advance the dog tile

## Performance

- Single level generation: < 10ms
- Solvability check: < 50ms for typical levels
- 100 levels generation: ~5-10 seconds

## Troubleshooting

### Build Errors

**"nlohmann/json not found"**
- Install the nlohmann/json library using your package manager
- Or download from GitHub and place in `/usr/local/include`

**"CMake not found"**
- Install CMake: `brew install cmake` (macOS) or `sudo apt-get install cmake` (Ubuntu)

### Runtime Issues

**"Segmentation fault"**
- Check that all tiles are properly initialized
- Verify grid boundaries are respected

**"No dog tile found"**
- Ensure the center position contains a tile
- Check grid size is odd (14 is used, center is 7.5 -> 8)

## Contributing

To extend the functionality:

1. Add new tile generation patterns in `PuzzleGenerator.cpp`
2. Implement alternative solvers in `PuzzleSolver.cpp`
3. Add custom export formats in `LevelExporter.cpp`

## License

This project is part of the Douyin mini-game project.
