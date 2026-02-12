const { TileType, UnitType, Direction, DIRECTION_VECTORS, generateId } = require('./utils/constants');

const fs = require('fs');
const path = require('path');

class SimpleTile {
  constructor(config) {
    this.id = generateId();
    this.type = config.type;
    this.unitType = config.unitType || UnitType.WOLF;
    this.gridCol = config.gridCol;
    this.gridRow = config.gridRow;
    this.gridColSpan = config.gridColSpan || 1;
    this.gridRowSpan = config.gridRowSpan || 1;
    this.direction = config.direction || Direction.UP_RIGHT;
  }

  getRight() {
    return this.gridCol + this.gridColSpan - 1;
  }

  getBottom() {
    return this.gridRow + this.gridRowSpan - 1;
  }

  contains(col, row) {
    return col >= this.gridCol && col <= this.getRight() &&
           row >= this.gridRow && row <= this.getBottom();
  }

  overlaps(other) {
    const left = this.gridCol;
    const right = this.getRight();
    const top = this.gridRow;
    const bottom = this.getBottom();

    const otherLeft = other.gridCol;
    const otherRight = other.getRight();
    const otherTop = other.gridRow;
    const otherBottom = other.getBottom();

    return !(right < otherLeft || left > otherRight ||
             bottom < otherTop || top > otherBottom);
  }
}

class LevelTester {
  constructor(gridSize = 14, maxDepth = 100, maxStates = 10000) {
    this.gridSize = gridSize;
    this.maxDepth = maxDepth;
    this.maxStates = maxStates;
  }

  loadLevel(jsonPath) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const levelConfig = Array.isArray(data) ? data[0] : data;
    
    const tiles = [];
    let dogTile = null;

    levelConfig.tiles.forEach(tileConfig => {
      const tile = new SimpleTile(tileConfig);
      tiles.push(tile);
      if (tile.unitType === UnitType.DOG) {
        dogTile = tile;
      }
    });

    return {
      id: levelConfig.id,
      name: levelConfig.name,
      tiles,
      dogTile,
      wolfCount: tiles.filter(t => t.unitType === UnitType.WOLF).length
    };
  }

  isOutOfBounds(col, row, colSpan, rowSpan) {
    return col < 1 || col + colSpan - 1 > this.gridSize ||
           row < 1 || row + rowSpan - 1 > this.gridSize;
  }

  checkCollision(tiles, excludeIndex, col, row, colSpan, rowSpan) {
    const tileLeft = col;
    const tileRight = col + colSpan - 1;
    const tileTop = row;
    const tileBottom = row + rowSpan - 1;

    for (let i = 0; i < tiles.length; i++) {
      if (i === excludeIndex) continue;

      const other = tiles[i];
      const otherLeft = other.gridCol;
      const otherRight = other.gridCol + other.gridColSpan - 1;
      const otherTop = other.gridRow;
      const otherBottom = other.gridRow + other.gridRowSpan - 1;

      if (tileLeft <= otherRight && tileRight >= otherLeft &&
          tileTop <= otherBottom && tileBottom >= otherTop) {
        return true;
      }
    }
    return false;
  }

  canSlideTile(tiles, tileIndex, dir) {
    const tile = tiles[tileIndex];
    const vec = DIRECTION_VECTORS[dir];

    let newCol = tile.gridCol;
    let newRow = tile.gridRow;

    while (true) {
      const nextCol = newCol + vec.col;
      const nextRow = newRow + vec.row;

      if (this.isOutOfBounds(nextCol, nextRow, tile.gridColSpan, tile.gridRowSpan)) {
        return { canMove: newCol !== tile.gridCol || newRow !== tile.gridRow, willDisappear: true };
      }

      if (this.checkCollision(tiles, tileIndex, nextCol, nextRow, tile.gridColSpan, tile.gridRowSpan)) {
        return { canMove: newCol !== tile.gridCol || newRow !== tile.gridRow, willDisappear: false, newCol, newRow };
      }

      newCol = nextCol;
      newRow = nextRow;
    }
  }

  getPossibleMoves(tiles) {
    const moves = [];
    const directions = Object.values(Direction);
    for (let i = 0; i < tiles.length; i++) {
      for (const dir of directions) {
        const result = this.canSlideTile(tiles, i, dir);
        if (result.canMove) {
          moves.push({ tileIndex: i, dir, newCol: result.newCol, newRow: result.newRow, willDisappear: result.willDisappear });
        }
      }
    }
    return moves;
  }

  hashState(tiles) {
    return tiles.map(t => `${t.gridCol},${t.gridRow},${t.unitType}`).join('|');
  }

  hasDogEscaped(tiles) {
    for (const tile of tiles) {
      if (tile.unitType === UnitType.DOG) {
        return this.isOutOfBounds(tile.gridCol, tile.gridRow, tile.gridColSpan, tile.gridRowSpan);
      }
    }
    return false;
  }

  solveBFS(level) {
    const queue = [{ tiles: level.tiles, moves: [] }];
    const visited = new Set();
    const initialState = this.hashState(level.tiles);
    visited.add(initialState);

    let statesExplored = 0;

    while (queue.length > 0) {
      statesExplored++;
      if (statesExplored > this.maxStates) {
        return { solved: false, statesExplored, reason: 'maxStatesReached' };
      }

      const current = queue.shift();
      const currentTiles = current.tiles;
      const currentMoves = current.moves;

      if (this.hasDogEscaped(currentTiles)) {
        return { solved: true, solution: currentMoves, statesExplored };
      }

      const moves = this.getPossibleMoves(currentTiles);

      for (const move of moves) {
        const newTiles = currentTiles.map((t, i) => {
          if (i === move.tileIndex) {
            const newTile = { ...t };
            newTile.gridCol = move.newCol;
            newTile.gridRow = move.newRow;
            return newTile;
          }
          return t;
        });

        const stateHash = this.hashState(newTiles);
        if (!visited.has(stateHash)) {
          visited.add(stateHash);
          queue.push({ tiles: newTiles, moves: [...currentMoves, move] });
        }
      }
    }

    return { solved: false, statesExplored, reason: 'exhausted' };
  }

  calculateBasicMetrics(level) {
    const moves = this.getPossibleMoves(level.tiles);
    let dogMoves = 0;
    for (const move of moves) {
      if (level.tiles[move.tileIndex].unitType === UnitType.DOG) {
        dogMoves++;
      }
    }

    let dogDistance = this.gridSize;
    if (level.dogTile) {
      const dog = level.dogTile;
      dogDistance = Math.min(
        dog.gridCol - 1,
        this.gridSize - dog.getRight(),
        dog.gridRow - 1,
        this.gridSize - dog.getBottom()
      );
    }

    return {
      totalTiles: level.tiles.length,
      wolfCount: level.wolfCount,
      dogCount: 1,
      possibleMoves: moves.length,
      dogMoves,
      dogDistanceToEdge: dogDistance
    };
  }

  testLevel(jsonPath) {
    console.log('\n========================================');
    console.log(`Testing: ${path.basename(jsonPath)}`);
    console.log('========================================');

    const level = this.loadLevel(jsonPath);
    console.log(`\nLevel Info:`);
    console.log(`  Name: ${level.name}`);
    console.log(`  Total Tiles: ${level.tiles.length}`);
    console.log(`  Wolves: ${level.wolfCount}`);
    console.log(`  Dog Position: (${level.dogTile ? level.dogTile.gridCol : 'N/A'}, ${level.dogTile ? level.dogTile.gridRow : 'N/A'})`);

    const metrics = this.calculateBasicMetrics(level);
    console.log(`\nBasic Metrics:`);
    console.log(`  Possible Moves: ${metrics.possibleMoves}`);
    console.log(`  Dog Moves Available: ${metrics.dogMoves}`);
    console.log(`  Dog Distance to Edge: ${metrics.dogDistanceToEdge}`);

    console.log(`\nRunning BFS Solver (max states: ${this.maxStates})...`);
    const startTime = Date.now();
    let result;
    try {
      result = this.solveBFS(level);
    } catch (e) {
      console.error('Solver error:', e.message);
      result = { solved: false, statesExplored: 0, reason: 'error', error: e.message };
    }
    const duration = Date.now() - startTime;

    console.log(`\nSolvability Test Results:`);
    console.log(`  Status: ${result.solved ? 'SOLVABLE' : 'UNSOLVABLE (within limits)'}`);
    console.log(`  States Explored: ${result.statesExplored}`);
    console.log(`  Duration: ${duration}ms`);
    if (result.solved) {
      console.log(`  Solution Length: ${result.solution.length} moves`);
    } else {
      console.log(`  Reason: ${result.reason}`);
    }

    const difficultyLevel = this.classifyDifficulty(result, metrics);
    console.log(`\nDifficulty Assessment: ${difficultyLevel}`);

    return { level, metrics, result, difficultyLevel };
  }

  classifyDifficulty(result, metrics) {
    if (result.solved) {
      if (result.solution.length <= 10) return 'Easy';
      if (result.solution.length <= 20) return 'Medium';
      if (result.solution.length <= 30) return 'Hard';
      return 'Very Hard';
    } else {
      if (metrics.dogDistanceToEdge <= 2 && metrics.dogMoves > 0) return 'Easy (likely)';
      if (metrics.dogDistanceToEdge <= 4 && metrics.dogMoves > 0) return 'Medium (likely)';
      if (metrics.dogMoves > 0) return 'Hard (requires more analysis)';
      return 'Unknown (blocked)';
    }
  }
}

const main = () => {
  const tester = new LevelTester(14, 100, 2000);

  const jsonDir = path.join(__dirname, '..', 'simulation_json');
  const files = fs.readdirSync(jsonDir).filter(f => f.endsWith('.json'));

  console.log(`Found ${files.length} level files to test`);

  const results = [];

  for (const file of files) {
    const jsonPath = path.join(jsonDir, file);
    const result = tester.testLevel(jsonPath);
    results.push(result);
  }

  console.log('\n\n========================================');
  console.log('SUMMARY');
  console.log('========================================');
  
  let solvableCount = 0;
  for (const result of results) {
    if (result.result.solved) {
      solvableCount++;
    }
  }

  console.log(`Total Levels Tested: ${results.length}`);
  console.log(`Solvability Rate: ${solvableCount}/${results.length} (${Math.round(solvableCount/results.length*100)}%)`);

  console.log('\nPer-Level Summary:');
  for (const result of results) {
    const status = result.result.solved ? '✓ SOLVABLE' : '✗ UNKNOWN';
    const moves = result.result.solved ? `${result.result.solution.length} moves` : '-';
    console.log(`  ${status} - ${result.level.name}: ${moves}, ${result.difficultyLevel}`);
  }
};

if (require.main === module) {
  main();
}

module.exports = LevelTester;
