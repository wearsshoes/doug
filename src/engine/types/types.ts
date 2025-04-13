export interface RuleApplication {
  startIndex: number;
  endIndex: number;
  replacement: string;
  preview: string;
}

export interface RuleDirection {
  name: string;
  description: string;
  findApplications: (s: string) => RuleApplication[];
  transform: (s: string, position: number) => string;
}

export interface BidirectionalRule {
  id: string;
  name: string;
  description: string;
  forward: RuleDirection;
  backward: RuleDirection;
}

export interface Level {
  id: string;
  startString: string;
  targetString: string;
  description: string;
  difficulty: string;
}

export interface GameConfig {
  rules: BidirectionalRule[];
  levels: Level[];
}

export interface GameState {
  currentString: string;
  targetString: string;
  appliedRules: BidirectionalRule[];
  isComplete: boolean;
}

export function canApplyRule(rule: BidirectionalRule, direction: 'forward' | 'backward', currentString: string): boolean {
  const ruleDirection = direction === 'forward' ? rule.forward : rule.backward;
  return ruleDirection.findApplications(currentString).length > 0;
}