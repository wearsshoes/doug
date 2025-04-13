# MIU Game Implementation Plan

## Core Components

### 1. Game State
```typescript
interface GameState {
  currentString: string;
  targetString: string;
  appliedRules: Rule[];
  isComplete: boolean;
}

interface Rule {
  id: string;
  name: string;
  description: string;
  transform: (s: string) => string;
}
```

### 2. MIU Rules
Four transformation rules:
1. If string ends in 'I', add 'U'
2. Double everything after 'M'
3. Replace 'III' with 'U'
4. Remove 'UU'

### 3. Component Structure

```typescript
// Main game container
<MIUGame>
  <StringDisplay current={currentString} target={targetString} />
  <RulesPalette rules={availableRules} />
  <TransformationSequence rules={appliedRules} />
</MIUGame>
```

## Implementation Steps

1. Setup Project Structure
   - Install react-dnd
   - Create component files
   - Setup basic styling

2. Core Game Logic
   - Implement rule transformations
   - Create game state management
   - Add win condition checking

3. Drag and Drop Interface
   - Setup DnD context
   - Create draggable rule components
   - Add drop zones for sequence

4. UI Components
   - Build string display
   - Create rules palette
   - Implement transformation sequence
   - Add visual feedback

5. Game Flow
   - Initialize game state
   - Handle rule applications
   - Manage win condition
   - Add reset/undo

6. Polish
   - Add animations
   - Improve styling
   - Add instructions
   - Error handling

## Technical Details

### Rule Implementation
```typescript
const rules = {
  appendU: {
    id: 'rule1',
    name: 'Rule 1',
    description: 'If string ends in I, add U',
    transform: (s: string) => s.endsWith('I') ? s + 'U' : s
  },
  // ... other rules
};
```

### Drag and Drop
- Use react-dnd
- Draggable rule components
- Droppable sequence area
- Reorderable applied rules

### String Transformation
- Step-by-step application
- Visual transition between states
- Highlight changes

## First Implementation Phase
1. Basic game board layout
2. Rule implementation
3. Simple drag and drop
4. String display and updates