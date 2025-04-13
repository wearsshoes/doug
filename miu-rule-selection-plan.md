# MIU Game Rule Selection Enhancement

## Core Changes

### 1. Rule Application Logic
- Modify Rule III and Rule IV to not be recursive
- Add function to find all possible positions where a rule can be applied
- Create interface for rule application positions:
```typescript
interface RuleApplication {
  startIndex: number;
  endIndex: number;
  replacement: string;
  preview: string; // The full string after this transformation
}
```

### 2. Rule Chain Updates
- Modify RuleChain to include position information:
```typescript
interface EnhancedRuleChain {
  rules: Array<{
    rule: Rule;
    applicationIndex: number; // Which occurrence was chosen
  }>;
  currentString: string;
  intermediateStrings: string[];
  validUpTo: number;
}
```

### 3. UI Components

#### Position Selector Component
```typescript
interface PositionSelectorProps {
  positions: RuleApplication[];
  onSelect: (index: number) => void;
  onCancel: () => void;
}
```

Features:
- Display current string with highlighted sections for each possible application
- Arrow keys (← →) to cycle through positions
- Enter to confirm selection
- Escape to cancel
- Visual preview of result

#### DroppableArea Enhancements
- Add state for rule selection mode
- Show position selector when a rule has multiple application points
- Highlight the current selection in the string
- Add keyboard controls

### 4. Rule Modifications

Update rule definitions to return all possible applications:
```typescript
interface Rule {
  id: string;
  name: string;
  description: string;
  findApplications: (s: string) => RuleApplication[];
  transform: (s: string, position: number) => string;
}
```

Example for Rule III:
```typescript
{
  id: 'rule3',
  name: 'Rule III',
  description: 'Replace III with U',
  findApplications: (s: string) => {
    const positions: RuleApplication[] = [];
    let match;
    const regex = /III/g;
    while ((match = regex.exec(s)) !== null) {
      positions.push({
        startIndex: match.index,
        endIndex: match.index + 3,
        replacement: 'U',
        preview: s.slice(0, match.index) + 'U' + s.slice(match.index + 3)
      });
    }
    return positions;
  },
  transform: (s: string, position: number) => {
    const apps = findApplications(s);
    if (!apps[position]) return s;
    const app = apps[position];
    return app.preview;
  }
}
```

## Implementation Steps

1. Rule System Updates
   - Update Rule interface
   - Modify each rule to implement findApplications
   - Update transform to use position parameter
   - Add tests for new rule behavior

2. State Management
   - Add selection mode state
   - Track current rule being applied
   - Store available positions
   - Handle position selection

3. UI Components
   - Create PositionSelector component
   - Add keyboard event handlers
   - Style position highlighting
   - Add preview functionality

4. Integration
   - Update DroppableArea to handle selection mode
   - Modify rule application flow
   - Add keyboard navigation
   - Update tests

## UI/UX Details

1. Selection Mode
   - Dim background when in selection mode
   - Show clear instructions
   - Highlight current selection
   - Preview transformation result

2. Visual Feedback
   - Different colors for different rule applications
   - Clear indication of selected position
   - Preview of transformation result
   - Keyboard shortcut hints

3. Keyboard Controls
   - ← → : Navigate between positions
   - Enter: Confirm selection
   - Escape: Cancel selection
   - Tab: Cycle through UI elements

4. Accessibility
   - Keyboard navigation
   - Screen reader support
   - Clear visual indicators
   - Appropriate ARIA labels

## Testing Strategy

1. Unit Tests
   - Rule application finding
   - Position selection
   - Transformation preview
   - Keyboard navigation

2. Integration Tests
   - Complete rule application flow
   - State management
   - UI updates

3. User Testing
   - Keyboard navigation
   - Visual feedback
   - Error handling
   - Edge cases