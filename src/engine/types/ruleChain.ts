import { Rule } from './types';

export interface RuleApplication {
  rule: Rule;
  position: number;
}

export interface RuleChain {
  rules: RuleApplication[];
  currentString: string;
  intermediateStrings: string[];
  validUpTo: number;
}

export interface BidirectionalChain {
  forward: RuleChain;
  reverse: RuleChain;
  meetingPoint: string | null;
}

export function computeRuleChain(startString: string, rules: RuleApplication[]): RuleChain {
  const intermediateStrings = [startString];
  let currentString = startString;
  let validUpTo = rules.length;

  // Apply each rule in sequence
  for (let i = 0; i < rules.length; i++) {
    const { rule, position } = rules[i];
    const newString = rule.transform(currentString, position);
    if (newString === currentString) {
      // This rule didn't change the string, mark it as the first invalid rule
      validUpTo = i;
      break;
    }
    currentString = newString;
    intermediateStrings.push(currentString);
  }

  return {
    rules,
    currentString,
    intermediateStrings,
    validUpTo,
  };
}

export function computeBidirectionalChain(
  startString: string,
  targetString: string,
  forwardRules: RuleApplication[],
  reverseRules: RuleApplication[]
): BidirectionalChain {
  const forward = computeRuleChain(startString, forwardRules);
  const reverse = computeRuleChain(targetString, reverseRules);

  // Find meeting point
  let meetingPoint: string | null = null;
  for (const fStr of forward.intermediateStrings) {
    for (const rStr of reverse.intermediateStrings) {
      if (fStr === rStr) {
        meetingPoint = fStr;
        break;
      }
    }
    if (meetingPoint) break;
  }

  return {
    forward,
    reverse,
    meetingPoint
  };
}

export function applyRuleToChain(chain: RuleChain, rule: Rule, position: number): RuleChain {
  return computeRuleChain(chain.intermediateStrings[0], [...chain.rules, { rule, position }]);
}

export function deleteRuleFromChain(chain: RuleChain, index: number): RuleChain {
  const newRules = [...chain.rules.slice(0, index), ...chain.rules.slice(index + 1)];
  return computeRuleChain(chain.intermediateStrings[0], newRules);
}

export function applyRuleToBidirectionalChain(
  chain: BidirectionalChain,
  rule: Rule,
  position: number,
  direction: 'forward' | 'reverse'
): BidirectionalChain {
  if (direction === 'forward') {
    return {
      forward: applyRuleToChain(chain.forward, rule, position),
      reverse: chain.reverse,
      meetingPoint: null // Recompute meeting point
    };
  } else {
    return {
      forward: chain.forward,
      reverse: applyRuleToChain(chain.reverse, rule, position),
      meetingPoint: null // Recompute meeting point
    };
  }
}

export function deleteRuleFromBidirectionalChain(
  chain: BidirectionalChain,
  index: number,
  direction: 'forward' | 'reverse'
): BidirectionalChain {
  if (direction === 'forward') {
    return {
      forward: deleteRuleFromChain(chain.forward, index),
      reverse: chain.reverse,
      meetingPoint: null // Recompute meeting point
    };
  } else {
    return {
      forward: chain.forward,
      reverse: deleteRuleFromChain(chain.reverse, index),
      meetingPoint: null // Recompute meeting point
    };
  }
}