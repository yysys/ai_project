const PuzzleManager = require('../utils/puzzleManager');
const { UnitState, Direction, UnitType, TileType } = require('../utils/constants');

describe('PuzzleManager 边界检测', () => {
  let puzzleManager;

  beforeEach(() => {
    puzzleManager = new PuzzleManager();
    puzzleManager.setScreenSize(375, 667);
  });

  describe('isPositionInDiamond', () => {
    it('中心位置应该在菱形内', () => {
      const center = Math.ceil(puzzleManager.gridSize / 2);
      
      const result = puzzleManager.isPositionInDiamond(center, center, 1, 1);
      
      expect(result).toBe(true);
    });

    it('角落位置应该在菱形外', () => {
      const result1 = puzzleManager.isPositionInDiamond(1, 1, 1, 1);
      const result2 = puzzleManager.isPositionInDiamond(14, 1, 1, 1);
      const result3 = puzzleManager.isPositionInDiamond(1, 14, 1, 1);
      const result4 = puzzleManager.isPositionInDiamond(14, 14, 1, 1);
      
      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
      expect(result4).toBe(false);
    });

    it('多尺寸格子应该正确检测', () => {
      const center = Math.ceil(puzzleManager.gridSize / 2);
      
      const result = puzzleManager.isPositionInDiamond(center, center, 2, 1);
      
      expect(result).toBe(true);
    });

    it('超出菱形边界的多尺寸格子应该返回 false', () => {
      const result = puzzleManager.isPositionInDiamond(1, 1, 2, 2);
      
      expect(result).toBe(false);
    });

    it('菱形边缘位置应该正确检测', () => {
      const gridSize = puzzleManager.gridSize;
      const center = Math.ceil(gridSize / 2);
      
      for (let row = 1; row <= gridSize; row++) {
        const distanceFromCenter = Math.abs(row - center);
        const maxColInRow = gridSize - distanceFromCenter;
        const startCol = Math.ceil((gridSize - maxColInRow) / 2);
        
        const leftEdge = startCol;
        const rightEdge = startCol + maxColInRow - 1;
        
        expect(puzzleManager.isPositionInDiamond(leftEdge, row, 1, 1)).toBe(true);
        expect(puzzleManager.isPositionInDiamond(rightEdge, row, 1, 1)).toBe(true);
        
        if (leftEdge > 1) {
          expect(puzzleManager.isPositionInDiamond(leftEdge - 1, row, 1, 1)).toBe(false);
        }
        if (rightEdge < gridSize) {
          expect(puzzleManager.isPositionInDiamond(rightEdge + 1, row, 1, 1)).toBe(false);
        }
      }
    });
  });

  describe('calculateTargetPosition', () => {
    beforeEach(() => {
      puzzleManager.setCurrentLevel(1);
    });

    it('应该正确计算目标位置', () => {
      const tiles = puzzleManager.getTiles();
      const tile = tiles[0];
      
      const vector = puzzleManager.getDirectionVector(tile.direction);
      const result = puzzleManager.calculateTargetPosition(tile, vector);
      
      expect(result).toHaveProperty('gridCol');
      expect(result).toHaveProperty('gridRow');
      expect(result).toHaveProperty('canMove');
      expect(result).toHaveProperty('willDisappear');
    });

    it('格子应该停在边界处而不是消失', () => {
      const tiles = puzzleManager.getTiles();
      const center = Math.ceil(puzzleManager.gridSize / 2);
      
      const centerTile = tiles.find(t => 
        t.gridCol <= center && 
        t.gridCol + t.gridColSpan - 1 >= center &&
        t.gridRow <= center && 
        t.gridRow + t.gridRowSpan - 1 >= center
      );
      
      if (centerTile) {
        const vector = puzzleManager.getDirectionVector(centerTile.direction);
        const result = puzzleManager.calculateTargetPosition(centerTile, vector);
        
        if (result.canMove && !result.willDisappear) {
          expect(puzzleManager.isPositionInDiamond(
            result.gridCol, 
            result.gridRow, 
            centerTile.gridColSpan, 
            centerTile.gridRowSpan
          )).toBe(true);
        }
      }
    });
  });

  describe('getDirectionVector', () => {
    it('应该返回正确的方向向量', () => {
      expect(puzzleManager.getDirectionVector(Direction.UP_LEFT)).toEqual({ col: -1, row: -1, angle: 225 });
      expect(puzzleManager.getDirectionVector(Direction.UP_RIGHT)).toEqual({ col: 1, row: -1, angle: 315 });
      expect(puzzleManager.getDirectionVector(Direction.DOWN_LEFT)).toEqual({ col: -1, row: 1, angle: 135 });
      expect(puzzleManager.getDirectionVector(Direction.DOWN_RIGHT)).toEqual({ col: 1, row: 1, angle: 45 });
    });

    it('无效方向应该返回 null', () => {
      expect(puzzleManager.getDirectionVector('invalid')).toBeNull();
    });
  });
});

describe('PuzzleManager 碰撞检测', () => {
  let puzzleManager;

  beforeEach(() => {
    puzzleManager = new PuzzleManager();
    puzzleManager.setScreenSize(375, 667);
    puzzleManager.setCurrentLevel(1);
  });

  describe('checkCollision', () => {
    it('与自身不应该碰撞', () => {
      const tiles = puzzleManager.getTiles();
      const tile = tiles[0];
      
      const result = puzzleManager.checkCollision(tile, tile.gridCol, tile.gridRow);
      
      expect(result).toBe(false);
    });

    it('与其他格子重叠应该返回 true', () => {
      const tiles = puzzleManager.getTiles();
      
      if (tiles.length >= 2) {
        const tile1 = tiles[0];
        const tile2 = tiles[1];
        
        const result = puzzleManager.checkCollision(tile1, tile2.gridCol, tile2.gridRow);
        
        expect(result).toBe(true);
      }
    });

    it('空位置不应该碰撞', () => {
      const tiles = puzzleManager.getTiles();
      const tile = tiles[0];
      
      const farPosition = {
        col: tile.gridCol,
        row: tile.gridRow
      };
      
      let found = false;
      for (let c = 1; c <= puzzleManager.gridSize && !found; c++) {
        for (let r = 1; r <= puzzleManager.gridSize && !found; r++) {
          const hasTile = tiles.some(t => 
            t.gridCol === c && t.gridRow === r && t.id !== tile.id
          );
          if (!hasTile) {
            farPosition.col = c;
            farPosition.row = r;
            found = true;
          }
        }
      }
      
      if (found) {
        const result = puzzleManager.checkCollision(tile, farPosition.col, farPosition.row);
        expect(result).toBe(false);
      }
    });

    it('多尺寸格子碰撞检测应该正确', () => {
      const tiles = puzzleManager.getTiles();
      const multiSizeTile = tiles.find(t => t.gridColSpan > 1 || t.gridRowSpan > 1);
      
      if (multiSizeTile) {
        const result = puzzleManager.checkCollision(
          multiSizeTile, 
          multiSizeTile.gridCol, 
          multiSizeTile.gridRow
        );
        
        expect(result).toBe(false);
      }
    });
  });
});

describe('PuzzleManager 胜利条件', () => {
  let puzzleManager;

  beforeEach(() => {
    puzzleManager = new PuzzleManager();
    puzzleManager.setScreenSize(375, 667);
    puzzleManager.setCurrentLevel(1);
  });

  describe('checkWinCondition', () => {
    it('初始状态不应该胜利', () => {
      const result = puzzleManager.checkWinCondition();
      
      expect(result).toBe(false);
    });

    it('菜狗消失后应该胜利', () => {
      const dogTile = puzzleManager.getDogTile();
      
      if (dogTile) {
        dogTile.state = UnitState.DISAPPEARED;
        
        const result = puzzleManager.checkWinCondition();
        
        expect(result).toBe(true);
      }
    });

    it('菜狗正在淡出时不应该胜利', () => {
      const dogTile = puzzleManager.getDogTile();
      
      if (dogTile) {
        dogTile.state = UnitState.FADING_OUT;
        
        const result = puzzleManager.checkWinCondition();
        
        expect(result).toBe(false);
      }
    });

    it('菜狗移出边界并消失后应该胜利', () => {
      const dogTile = puzzleManager.getDogTile();
      
      if (dogTile) {
        dogTile.gridCol = -1;
        dogTile.gridRow = -1;
        dogTile.state = UnitState.DISAPPEARED;
        
        const result = puzzleManager.checkWinCondition();
        
        expect(result).toBe(true);
      }
    });
  });

  describe('getDogTile', () => {
    it('应该返回菜狗格子', () => {
      const dogTile = puzzleManager.getDogTile();
      
      expect(dogTile).toBeDefined();
      expect(dogTile.unitType).toBe(UnitType.DOG);
    });
  });
});

describe('PuzzleManager 关卡管理', () => {
  let puzzleManager;

  beforeEach(() => {
    puzzleManager = new PuzzleManager();
    puzzleManager.setScreenSize(375, 667);
  });

  describe('关卡加载', () => {
    it('应该正确加载关卡', () => {
      const result = puzzleManager.setCurrentLevel(1);
      
      expect(result).toBe(true);
      expect(puzzleManager.getCurrentLevel()).toBeDefined();
    });

    it('未解锁关卡不应该加载', () => {
      const result = puzzleManager.setCurrentLevel(2);
      
      expect(result).toBe(false);
    });

    it('应该正确获取关卡列表', () => {
      const levels = puzzleManager.getLevels();
      
      expect(levels.length).toBeGreaterThan(0);
      expect(levels[0].unlocked).toBe(true);
    });
  });

  describe('关卡进度', () => {
    beforeEach(() => {
      puzzleManager.setCurrentLevel(1);
    });

    it('应该正确完成关卡', () => {
      const nextLevel = puzzleManager.completeLevel(3, 1000);
      
      expect(puzzleManager.getCurrentLevel().completed).toBe(true);
      expect(puzzleManager.getCurrentLevel().stars).toBe(3);
      expect(puzzleManager.getCurrentLevel().score).toBe(1000);
    });

    it('完成关卡应该解锁下一关', () => {
      puzzleManager.completeLevel(3, 1000);
      
      const levels = puzzleManager.getLevels();
      const nextLevel = levels.find(l => l.id === 2);
      
      expect(nextLevel.unlocked).toBe(true);
    });
  });

  describe('历史记录', () => {
    beforeEach(() => {
      puzzleManager.setCurrentLevel(1);
    });

    it('应该正确保存状态', () => {
      const initialHistoryLength = puzzleManager.history.length;
      
      puzzleManager.saveState();
      
      expect(puzzleManager.history.length).toBe(initialHistoryLength + 1);
    });

    it('应该正确撤销', () => {
      const tiles = puzzleManager.getTiles();
      const tile = tiles[0];
      const originalCol = tile.gridCol;
      const originalRow = tile.gridRow;
      
      puzzleManager.saveState();
      tile.gridCol = 5;
      tile.gridRow = 5;
      puzzleManager.saveState();
      
      const result = puzzleManager.undo();
      
      expect(result).toBe(true);
    });
  });
});
