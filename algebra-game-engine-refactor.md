# Algebra Game Engine Refactor Plan

## Phase 1: File Organization
1. Create directories:
   - /old (copy of current implementation)
   - /src/engine (game-agnostic code)
   - /src/games/miu (MIU specific code)

## Phase 2: Engine Core
Create base interfaces in /src/engine:
```typescript
// types.ts
export interface Rule {
  id: string;
  name: string;
  description: string;
  findApplications: (s: string) => RuleApplication[];
  transform: (s: string, position: number) => string;
}

export interface RuleApplication {
  startIndex: number;
  endIndex: number;
  replacement: string;
  preview: string;
}

export interface Level {
  id: string;
  startString: string;
  targetString: string;
  description: string;
  difficulty: string;
}

export interface GameConfig {
  rules: Rule[];
  levels: Level[];
}
```

## Phase 3: Game Implementation
Move MIU specific code to /src/games/miu:
```typescript
// config.ts
import { GameConfig } from '../../engine/types';

export const MIUConfig: GameConfig = {
  rules: [...], // Current MIURules
  levels: [...], // Current MIULevels
};
```

## Phase 4: UI Components
1. Generic components in /src/engine/components:
   - AlgebraGame (base game component)
   - DraggableRule (generic rule card)
   - DroppableArea (generic drop zone)

2. Game-specific components in /src/games/miu/components:
   - MIUGame (extends AlgebraGame)
   - Any MIU-specific UI components

## Phase 5: Rule Chain Logic
Move rule chain logic to engine:
```typescript
// engine/ruleChain.ts
export interface RuleChain {
  rules: RuleApplication[];
  currentString: string;
  intermediateStrings: string[];
  validUpTo: number;
}
```

## Implementation Order
1. Create directory structure
2. Move current code to /old
3. Create engine interfaces
4. Implement MIU game using new structure
5. Update UI components
6. Test and verify UI remains identical