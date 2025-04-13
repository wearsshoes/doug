# Bidirectional Rule Chain Solving

## Data Structure Changes

1. Enhance RuleChain type:
```typescript
interface BidirectionalChain {
  forward: RuleChain;
  reverse: RuleChain;
  meetingPoint: string | null; // The string where the chains meet, if they do
}
```

2. Add inverse rules to the Rule type:
```typescript
interface Rule {
  // ... existing properties ...
  inverse?: Rule; // Optional inverse rule
}
```

## Implementation Steps

### 1. Rule System Enhancement
- Add inverse rules for each existing rule in the MIU game
- Create helper functions to validate inverse rules
- Update rule application logic to work in both directions

### 2. State Management
- Modify AlgebraGame component to maintain two chains
- Add state for tracking which direction user is working in
- Implement logic to detect when chains meet
- Update win condition to check for meeting chains

### 3. UI Updates
- Split the workspace into two sections:
  - Top: Forward chain (Start → Target)
  - Bottom: Reverse chain (Target → Start)
- Add visual indicator when chains meet
- Add UI controls to:
  - Switch between forward/reverse
  - Show progress in both directions
  - Highlight meeting point

### 4. Component Updates

#### AlgebraGame.tsx
- Add new state variables for reverse chain
- Implement bidirectional rule application
- Update win condition logic
- Add reverse chain rendering

#### DroppableArea.tsx
- Add direction prop
- Handle rule application in correct direction

#### DraggableRule.tsx
- Add indication of which direction(s) rule can be applied
- Update applicability check for both directions

## Implementation Order

1. Data structure updates
2. Add inverse rules
3. Basic UI split
4. Chain management logic
5. Meeting point detection
6. Polish UI and interactions

## Technical Details

### Rule Inverse Examples
```typescript
// Example for MIU game:
const Rules = [
  {
    id: 'rule1',
    name: 'Add U to I',
    inverse: {
      id: 'rule1_inverse',
      name: 'Remove U after I'
    }
  },
  // ... other rules
];
```

### Meeting Point Detection
```typescript
function checkMeetingPoint(forward: RuleChain, reverse: RuleChain): string | null {
  // Check if any string in forward chain matches any in reverse chain
  for (const fStr of forward.intermediateStrings) {
    for (const rStr of reverse.intermediateStrings) {
      if (fStr === rStr) return fStr;
    }
  }
  return null;
}
```

### Win Condition
```typescript
const isComplete = Boolean(meetingPoint);
```