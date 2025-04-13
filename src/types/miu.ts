export interface Rule {
  id: string;
  name: string;
  description: string;
  transform: (s: string) => string;
}

export interface GameState {
  currentString: string;
  targetString: string;
  appliedRules: Rule[];
  isComplete: boolean;
}

// The four MIU rules as defined by Hofstadter
export const MIURules: Rule[] = [
  {
    id: 'rule1',
    name: 'Rule I',
    description: 'Add U to any string ending in I',
    transform: (s: string) => s.replace(/I$/, 'IU'),
  },
  {
    id: 'rule2',
    name: 'Rule II',
    description: 'Double everything after M (e.g., MI → MII, MII → MIIII)',
    transform: (s: string) => s.replace(/^M(.*)$/, (_, rest) => `M${rest}${rest}`),
  },
  {
    id: 'rule3',
    name: 'Rule III',
    description: 'Replace III with U',
    transform: (s: string) => {
      // Process the string from left to right
      let result = s;
      // Keep replacing until no more III patterns are found
      while (result.match(/III/)) {
        result = result.replace(/III/, 'U');
      }
      return result;
    },
  },
  {
    id: 'rule4',
    name: 'Rule IV',
    description: 'Remove UU',
    transform: (s: string) => {
      // Keep replacing until no more UU patterns are found
      let result = s;
      while (result.match(/UU/)) {
        result = result.replace(/UU/, '');
      }
      return result;
    },
  },
];

export function canApplyRule(rule: Rule, currentString: string): boolean {
  const newString = rule.transform(currentString);
  return newString !== currentString;
}

export interface Level {
  id: string;
  startString: string;
  targetString: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const MIULevels: Level[] = [
  {
    id: 'level1',
    startString: 'MI',
    targetString: 'MIU',
    description: 'Convert MI to MIU - Use Rule I to add U after I',
    difficulty: 'Easy',
  },
  {
    id: 'level2',
    startString: 'MI',
    targetString: 'MUI',
    description: 'Convert MI to MUI - Try using Rule II first!',
    difficulty: 'Medium',
  },
  {
    id: 'level3',
    startString: 'MII',
    targetString: 'MIUIU',
    description: 'Convert MII to MIUIU - Rule II might be helpful here',
    difficulty: 'Medium',
  },
  {
    id: 'level4',
    startString: 'MIII',
    targetString: 'MU',
    description: 'Convert MIII to MU - Use Rule III to replace III with U',
    difficulty: 'Hard',
  },
];