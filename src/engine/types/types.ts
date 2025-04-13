export interface RuleApplication {
  startIndex: number;
  endIndex: number;
  replacement: string;
  preview: string;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  findApplications: (s: string) => RuleApplication[];
  transform: (s: string, position: number) => string;
  direction?: 'forward' | 'reverse' | 'both';
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

export interface GameState {
  currentString: string;
  targetString: string;
  appliedRules: Rule[];
  isComplete: boolean;
}

export function canApplyRule(rule: Rule, currentString: string): boolean {
  return rule.findApplications(currentString).length > 0;
}