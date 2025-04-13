# MIU Game State Management Refactor

## Current Issues
- State management is too complex with multiple interrelated pieces
- Rule validation and application logic is scattered
- History management is tied to rule application
- Deletion of rules doesn't properly maintain chain state
- String computation is repeated in multiple places

## Core Concepts
1. Game State should be derived from:
   - Current level configuration
   - Sequence of applied rules
   - Everything else should be computed

2. Key Operations:
   - Apply rule
   - Delete rule
   - Reset level
   - Select level

## Implementation Plan

1. Create a RuleChain type to manage rule sequences:
```typescript
interface RuleChain {
  rules: Rule[];
  // Computed properties
  currentString: string;
  intermediateStrings: string[];
  validUpTo: number; // Index of last valid rule
}
```

2. Create pure functions for rule chain operations:
```typescript
// Core operations
computeRuleChain(startString: string, rules: Rule[]): RuleChain
applyRuleToChain(chain: RuleChain, rule: Rule): RuleChain
deleteRuleFromChain(chain: RuleChain, index: number): RuleChain
```

3. Simplify MIUGame state to:
```typescript
interface GameState {
  currentLevelIndex: number;
  ruleChain: RuleChain;
}
```

4. Implementation Steps:
   a. Create RuleChain utilities in separate file
   b. Update MIUGame to use new state structure
   c. Simplify UI to derive everything from RuleChain
   d. Add validation highlighting based on validUpTo index

## Benefits
- Single source of truth for game state
- Clear separation between state and computed values
- Easier to test and maintain
- More predictable behavior
- Better performance (less recomputation)