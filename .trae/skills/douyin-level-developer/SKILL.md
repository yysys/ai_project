---
name: "douyin-level-developer"
description: "Develops game levels for Douyin mini-games. Works in ./simulation and outputs to ./simulation_json. Invoke when creating or modifying game levels."
---

# Douyin Game Level Developer

This skill develops game levels specifically for Douyin mini-games. Development work is done in the `./simulation` directory, with final level files saved to `./simulation_json`.

## Directory Structure

```
./simulation/              # Working directory for level development
├── templates/            # Level templates
├── drafts/               # Work-in-progress levels
└── resources/            # Level-specific resources

./simulation_json/        # Output directory for finalized levels
├── level_001.json        # Level configuration files
├── level_002.json
└── ...
```

## Core Tasks

### 1. Level Design
- Design level layouts and structures
- Define game objectives and win conditions
- Plan difficulty progression
- Create level-specific mechanics

### 2. Level Configuration
- Generate JSON level files in `./simulation_json`
- Configure game objects, entities, and obstacles
- Set level parameters (time limit, score goals, etc.)
- Define spawn points and triggers

### 3. Level Testing
- Test level playability
- Adjust difficulty balance
- Verify level logic and rules
- Ensure compatibility with Douyin mini-game platform

### 4. Level Optimization
- Optimize level performance
- Reduce memory usage
- Ensure smooth gameplay experience
- Test on different device specs

## Level JSON Format

Levels saved in `./simulation_json` should follow this structure:

```json
{
  "level_id": "level_001",
  "name": "Level Name",
  "description": "Level description",
  "difficulty": 1,
  "time_limit": 60,
  "objectives": [],
  "entities": [],
  "obstacles": [],
  "triggers": []
}
```

## Development Workflow

1. **Design Phase**: Work in `./simulation` to draft and prototype levels
2. **Development**: Implement level logic and configurations
3. **Testing**: Test level functionality and balance
4. **Export**: Save finalized level files to `./simulation_json`
5. **Integration**: Ensure levels work with the Douyin mini-game

## Best Practices

- Keep level files organized with clear naming conventions
- Document level design decisions
- Test levels on actual Douyin environment when possible
- Consider mobile device constraints and performance
- Follow Douyin mini-game level design guidelines
- Ensure levels are engaging and progressively challenging

## When to Use This Skill

Invoke this skill when:
- Creating new game levels for Douyin mini-games
- Modifying existing level configurations
- Designing level mechanics and objectives
- Testing and balancing game levels
- Exporting levels to `./simulation_json` directory
- Optimizing level performance
