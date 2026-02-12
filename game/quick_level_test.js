const { TileType, UnitType, Direction, DIRECTION_VECTORS } = require('./utils/constants');
const fs = require('fs');
const path = require('path');

class QuickLevelTester {
  constructor(gridSize = 14) {
    this.gridSize = gridSize;
  }

  loadLevel(jsonPath) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const levelConfig = Array.isArray(data) ? data[0] : data;
    
    const tiles = [];
    let dogTile = null;

    levelConfig.tiles.forEach(tileConfig => {
      tiles.push({
        id: tileConfig.id,
        type: tileConfig.type,
        unitType: tileConfig.unitType || UnitType.WOLF,
        gridCol: tileConfig.gridCol,
        gridRow: tileConfig.gridRow,
        gridColSpan: tileConfig.gridColSpan || 1,
        gridRowSpan: tileConfig.gridRowSpan || 1,
        direction: tileConfig.direction || Direction.UP_RIGHT
      });
      if (tiles[tiles.length - 1].unitType === UnitType.DOG) {
        dogTile = tiles[tiles.length - 1];
      }
    });

    return {
      id: levelConfig.id,
      name: levelConfig.name,
      tiles,
      dogTile
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

  getDogPossibleMoves(level) {
    if (!level.dogTile) {
      return [];
    }

    const moves = [];
    const dogIndex = level.tiles.findIndex(t => t.unitType === UnitType.DOG);
    const dog = level.dogTile;

    for (const dir of Object.values(Direction)) {
      const vec = DIRECTION_VECTORS[dir];
      let newCol = dog.gridCol;
      let newRow = dog.gridRow;
      let canMove = false;
      let willDisappear = false;

      while (true) {
        const nextCol = newCol + vec.col;
        const nextRow = newRow + vec.row;

        if (this.isOutOfBounds(nextCol, nextRow, dog.gridColSpan, dog.gridRowSpan)) {
          willDisappear = true;
          canMove = newCol !== dog.gridCol || newRow !== dog.gridRow;
          break;
        }

        if (this.checkCollision(level.tiles, dogIndex, nextCol, nextRow, dog.gridColSpan, dog.gridRowSpan)) {
          canMove = newCol !== dog.gridCol || newRow !== dog.gridRow;
          break;
        }

        newCol = nextCol;
        newRow = nextRow;
      }

      if (canMove) {
        moves.push({
          direction: dir,
          newCol,
          newRow,
          willDisappear,
          canEscape: willDisappear
        });
      }
    }

    return moves;
  }

  getAllPossibleMoves(level) {
    const moves = [];
    for (let i = 0; i < level.tiles.length; i++) {
      const tile = level.tiles[i];
      for (const dir of Object.values(Direction)) {
        const vec = DIRECTION_VECTORS[dir];
        let newCol = tile.gridCol;
        let newRow = tile.gridRow;
        let canMove = false;

        while (true) {
          const nextCol = newCol + vec.col;
          const nextRow = newRow + vec.row;

          if (this.isOutOfBounds(nextCol, nextRow, tile.gridColSpan, tile.gridRowSpan)) {
            canMove = newCol !== tile.gridCol || newRow !== tile.gridRow;
            break;
          }

          if (this.checkCollision(level.tiles, i, nextCol, nextRow, tile.gridColSpan, tile.gridRowSpan)) {
            canMove = newCol !== tile.gridCol || newRow !== tile.gridRow;
            break;
          }

          newCol = nextCol;
          newRow = nextRow;
        }

        if (canMove) {
          moves.push({
            tileIndex: i,
            unitType: tile.unitType,
            direction: dir,
            newCol,
            newRow,
            isDog: tile.unitType === UnitType.DOG
          });
        }
      }
    }
    return moves;
  }

  analyzeLevel(jsonPath) {
    console.log('\n' + '='.repeat(50));
    console.log(`Level: ${path.basename(jsonPath)}`);
    console.log('='.repeat(50));

    const level = this.loadLevel(jsonPath);
    
    const wolfCount = level.tiles.filter(t => t.unitType === UnitType.WOLF).length;
    const dogCount = level.tiles.filter(t => t.unitType === UnitType.DOG).length;

    console.log('\n📊 Basic Info:');
    console.log(`   Name: ${level.name}`);
    console.log(`   Total Tiles: ${level.tiles.length}`);
    console.log(`   Wolves: ${wolfCount}`);
    console.log(`   Dogs: ${dogCount}`);
    
    if (level.dogTile) {
      console.log(`   Dog Position: (${level.dogTile.gridCol}, ${level.dogTile.gridRow})`);
      
      const dog = level.dogTile;
      const distToLeft = dog.gridCol - 1;
      const distToRight = this.gridSize - (dog.gridCol + dog.gridColSpan - 1);
      const distToTop = dog.gridRow - 1;
      const distToBottom = this.gridSize - (dog.gridRow + dog.gridRowSpan - 1);
      
      console.log(`   Dog Distance to Edges: Left=${distToLeft}, Right=${distToRight}, Top=${distToTop}, Bottom=${distToBottom}`);
    }

    console.log('\n🎯 Move Analysis:');
    const allMoves = this.getAllPossibleMoves(level);
    const dogMoves = allMoves.filter(m => m.isDog);
    const wolfMoves = allMoves.filter(m => !m.isDog);

    console.log(`   Total Possible Moves: ${allMoves.length}`);
    console.log(`   Dog Possible Moves: ${dogMoves.length}`);
    console.log(`   Wolf Possible Moves: ${wolfMoves.length}`);

    console.log('\n🐕 Dog Move Details:');
    if (dogMoves.length === 0) {
      console.log('   ❌ BLOCKED - Dog has no possible moves!');
      console.log('   This means the dog is completely surrounded by wolves and cannot escape.');
    } else {
      const escapeMoves = dogMoves.filter(m => m.canEscape);
      console.log(`   Can Move: Yes`);
      console.log(`   Can Escape Immediately: ${escapeMoves.length > 0 ? 'Yes (' + escapeMoves.length + ' directions)' : 'No - needs wolf movement first'}`);
      
      if (escapeMoves.length > 0) {
        console.log('   ✅ Level appears SOLVABLE - Dog can escape!');
      } else {
        console.log('   ⚠️  Level requires wolf movement to clear a path for the dog.');
      }
    }

    console.log('\n🔍 Grid Analysis:');
    const directions = Object.values(Direction);
    const blockedDirs = [];
    
    for (const dir of directions) {
      const vec = DIRECTION_VECTORS[dir];
      let blocked = false;
      let dist = 0;
      
      let checkCol = level.dogTile.gridCol;
      let checkRow = level.dogTile.gridRow;
      
      while (true) {
        const nextCol = checkCol + vec.col;
        const nextRow = checkRow + vec.row;
        
        if (this.isOutOfBounds(nextCol, nextRow, level.dogTile.gridColSpan, level.dogTile.gridRowSpan)) {
          blockedDirs.push({ direction: dir, reason: 'edge', dist });
          break;
        }
        
        if (this.checkCollision(level.tiles, level.tiles.indexOf(level.dogTile), nextCol, nextRow, level.dogTile.gridColSpan, level.dogTile.gridRowSpan)) {
          blockedDirs.push({ direction: dir, reason: 'blocked', dist });
          blocked = true;
          break;
        }
        
        checkCol = nextCol;
        checkRow = nextRow;
        dist++;
      }
    }
    
    console.log('   Direction Analysis from Dog:');
    for (const bd of blockedDirs) {
      const icon = bd.reason === 'edge' ? '🚪' : '🐺';
      const status = bd.reason === 'edge' ? 'Open to Edge' : 'Blocked by Wolf';
      console.log(`     ${bd.direction}: ${status} (${bd.dist} steps)`);
    }

    console.log('\n📋 Assessment:');
    let assessment = '';
    let status = '';

    if (dogMoves.length === 0) {
      assessment = 'UNSOLVABLE';
      status = '❌ The dog is completely blocked. This level needs redesign.';
    } else if (dogMoves.some(m => m.canEscape)) {
      assessment = 'EASY / SOLVABLE';
      status = '✅ Dog can escape directly. Level is playable.';
    } else {
      assessment = 'REQUIRES STRATEGY';
      status = '⚠️  Dog needs wolves to move first. Level may be solvable with proper moves.';
    }

    console.log(`   Difficulty: ${assessment}`);
    console.log(`   Status: ${status}`);

    console.log('\n' + '='.repeat(50) + '\n');

    return {
      levelName: level.name,
      totalTiles: level.tiles.length,
      wolfCount,
      dogCount,
      dogMoves: dogMoves.length,
      wolfMoves: wolfMoves.length,
      canEscapeImmediately: dogMoves.some(m => m.canEscape),
      assessment,
      status
    };
  }
}

const main = async () => {
  const tester = new QuickLevelTester();

  const jsonDir = path.join(__dirname, '..', 'simulation_json');
  const files = fs.readdirSync(jsonDir).filter(f => f.endsWith('.json'));

  console.log('🎮 Quick Level Solvability Test');
  console.log(`Found ${files.length} level files to test\n`);

  const results = [];
  const TIMEOUT_MS = 180000;

  for (const file of files) {
    const jsonPath = path.join(jsonDir, file);
    
    const startTime = Date.now();
    let timedOut = false;
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        timedOut = true;
        reject(new Error('TIMEOUT'));
      }, TIMEOUT_MS);
    });
    
    const analysisPromise = new Promise(resolve => {
      try {
        const result = tester.analyzeLevel(jsonPath);
        resolve(result);
      } catch (e) {
        resolve({ levelName: file, error: e.message, assessment: 'ERROR', status: 'Analysis failed' });
      }
    });
    
    let result;
    try {
      result = await Promise.race([analysisPromise, timeoutPromise]);
    } catch (e) {
      if (timedOut) {
        console.log(`\n⏱️  TIMEOUT: Level analysis exceeded 3 minutes, skipping...\n`);
        continue;
      }
      throw e;
    }
    
    results.push(result);
  }

  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY REPORT');
  console.log('='.repeat(50));

  let solvableCount = 0;
  let blockedCount = 0;
  let needsStrategyCount = 0;

  for (const result of results) {
    if (result.assessment === 'EASY / SOLVABLE') {
      solvableCount++;
    } else if (result.assessment === 'UNSOLVABLE') {
      blockedCount++;
    } else {
      needsStrategyCount++;
    }
  }

  console.log(`\n📊 Overall Statistics:`);
  console.log(`   Total Levels: ${results.length}`);
  console.log(`   ✅ Solvable (Easy): ${solvableCount}`);
  console.log(`   ⚠️  Needs Strategy: ${needsStrategyCount}`);
  console.log(`   ❌ Unsolved/Blocked: ${blockedCount}`);
  console.log(`   Success Rate: ${Math.round(solvableCount / results.length * 100)}%`);

  console.log('\n📝 Level-by-Level Summary:');
  for (const result of results) {
    const icon = result.assessment === 'EASY / SOLVABLE' ? '✅' : 
                 result.assessment === 'UNSOLVABLE' ? '❌' : '⚠️';
    console.log(`   ${icon} ${result.levelName}: ${result.assessment} (Dog moves: ${result.dogMoves})`);
  }

  console.log('\n' + '='.repeat(50) + '\n');
};

main();
