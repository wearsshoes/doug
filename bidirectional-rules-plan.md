# Refactoring Rules to Bidirectional Structure

## Current Structure
```typescript
interface Rule {
  id: string;
  name: string;
  description: string;
  findApplications: (s: string) => RuleApplication[];
  transform: (s: string, position: number) => string;
  direction?: 'forward' | 'reverse' | 'both';
  inverse?: Rule;
  isInverseOf?: string;
}
```

## New Structure
```typescript
interface BidirectionalRule {
  id: string;
  name: string;
  description: string;
  forward: {
    name: string;
    description: string;
    findApplications: (s: string) => RuleApplication[];
    transform: (s: string, position: number) => string;
  };
  backward: {
    name: string;
    description: string;
    findApplications: (s: string) => RuleApplication[];
    transform: (s: string, position: number) => string;
  };
}
```

## Implementation Steps

1. Update types.ts to define the new BidirectionalRule interface
2. Refactor rules.ts to combine each rule with its inverse into a single bidirectional rule
3. Update AlgebraGame.tsx to work with bidirectional rules:
   - Modify rule filtering and display
   - Update rule application logic
   - Remove inverse-specific code
4. Update DraggableRule component to handle bidirectional rules
5. Clean up any remaining inverse-related code

## Benefits
- More explicit relationship between forward and backward operations
- Simpler rule management (no need to link inverses)
- Clearer UI representation of bidirectional nature
- Better type safety (can't have a rule without both directions)