---
name: "map-tester"
description: "Tests map levels from simulation_json folder using difficulty_test tool. Invoke when user wants to test map difficulty, validate level design, or generate test reports for puzzle levels."
---

# Map Level Tester

This skill tests game levels by validating their structure and measuring difficulty. Level configurations are read from `./simulation_json`, testing code is stored in `./difficulty`, and test reports are generated with analysis results.

## Directory Structure

```
./simulation_json/        # Input: Level configuration files to test
├── level_001.json
├── level_002.json
└── ...

./difficulty/             # Testing code directory
├── difficulty_test.py    # Main testing script (DFS/BFS algorithms)
├── level_validator.py    # Level structure validation
├── performance_metrics.py # Performance measurement utilities
└── reports/              # Generated test reports
    ├── level_001_report.json
    ├── level_002_report.json
    └── summary_report.md
```

## Core Testing Capabilities

### 1. Level Structure Validation
- Validate JSON format and schema
- Check required fields and data types
- Verify entity and obstacle configurations
- Detect unreachable or invalid configurations

### 2. Pathfinding Testing (DFS/BFS)
- Use **BFS** to find shortest path solutions
- Use **DFS** to explore all possible paths
- Verify level solvability
- Identify dead-ends and unreachable areas
- Test multiple solution paths

### 3. Difficulty Assessment
Measure difficulty across multiple dimensions:
- **Execution Time**: Time taken by BFS/DFS to solve
- **Path Length**: Shortest and longest path lengths
- **Branching Factor**: Average number of choices per decision
- **State Space**: Total number of possible states
- **Solution Complexity**: Number of steps to complete level

### 4. Performance Metrics
- CPU usage during testing
- Memory consumption
- Algorithm efficiency
- Scalability with level size

## Testing Workflow

1. **Load Level**: Read level JSON from `./simulation_json`
2. **Validate Structure**: Check level configuration validity
3. **Run Algorithms**:
   - Execute BFS to find optimal solution
   - Execute DFS to explore full state space
   - Measure execution time for each algorithm
4. **Analyze Results**: Calculate difficulty metrics
5. **Generate Report**: Save test results to `./difficulty/reports/`

## Test Report Format

```json
{
  "level_id": "level_001",
  "test_timestamp": "2026-02-12T10:30:00Z",
  "validation": {
    "status": "passed",
    "errors": []
  },
  "solvability": {
    "is_solvable": true,
    "bfs_solution_found": true,
    "dfs_solution_found": true
  },
  "difficulty_metrics": {
    "bfs_execution_time_ms": 45.2,
    "dfs_execution_time_ms": 234.7,
    "shortest_path_length": 12,
    "longest_path_length": 28,
    "state_space_size": 156,
    "branching_factor": 2.3
  },
  "difficulty_rating": {
    "overall": "medium",
    "score": 6.5,
    "scale": 10
  },
  "recommendations": []
}
```

## Algorithm Implementation

### BFS (Breadth-First Search)
```python
# Finds shortest path, optimal for solvability testing
def bfs_test(level_config):
    visited = set()
    queue = [(start_state, [])]
    
    while queue:
        state, path = queue.pop(0)
        if is_goal(state):
            return path, len(visited)
        for next_state in get_next_states(state):
            if next_state not in visited:
                visited.add(next_state)
                queue.append((next_state, path + [state]))
```

### DFS (Depth-First Search)
```python
# Explores all paths, useful for difficulty assessment
def dfs_test(level_config):
    visited = set()
    all_paths = []
    
    def dfs(state, path):
        if is_goal(state):
            all_paths.append(path)
            return
        for next_state in get_next_states(state):
            if next_state not in visited:
                visited.add(next_state)
                dfs(next_state, path + [state])
                visited.remove(next_state)
    
    dfs(start_state, [])
    return all_paths
```

## Difficulty Rating Criteria

| Score Range | Rating | Description |
|-------------|--------|-------------|
| 0-3 | Easy | BFS < 10ms, path length < 10 |
| 4-6 | Medium | BFS 10-50ms, path length 10-20 |
| 7-8 | Hard | BFS 50-200ms, path length 20-30 |
| 9-10 | Expert | BFS > 200ms, path length > 30 |

## When to Use This Skill

Invoke this skill when:
- Testing levels from `./simulation_json` directory
- Validating level structure and configuration
- Measuring level difficulty using DFS/BFS
- Generating test reports for game levels
- Checking level solvability and pathfinding
- Analyzing performance metrics of level algorithms
- Comparing difficulty across multiple levels
