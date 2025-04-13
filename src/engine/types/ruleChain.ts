import { BidirectionalRule } from './types';

export interface RuleApplication {
  rule: BidirectionalRule;
  position: number;
  direction: 'forward' | 'backward';
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
    const { rule, position, direction } = rules[i];
    const ruleDirection = direction === 'forward' ? rule.forward : rule.backward;
    const newString = ruleDirection.transform(currentString, position);
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

export function applyRuleToChain(chain: RuleChain, rule: BidirectionalRule, position: number, direction: 'forward' | 'backward'): RuleChain {
  return computeRuleChain(chain.intermediateStrings[0], [...chain.rules, { rule, position, direction }]);
}

export function deleteRuleFromChain(chain: RuleChain, index: number): RuleChain {
  const newRules = [...chain.rules.slice(0, index), ...chain.rules.slice(index + 1)];
  return computeRuleChain(chain.intermediateStrings[0], newRules);
}

export function applyRuleToBidirectionalChain(
  chain: BidirectionalChain,
  rule: BidirectionalRule,
  position: number,
  direction: 'forward' | 'backward'
): BidirectionalChain {
  if (direction === 'forward') {
    return {
      forward: applyRuleToChain(chain.forward, rule, position, 'forward'),
      reverse: chain.reverse,
      meetingPoint: null // Recompute meeting point
    };
  } else {
    return {
      forward: chain.forward,
      reverse: applyRuleToChain(chain.reverse, rule, position, 'backward'),
      meetingPoint: null // Recompute meeting point
    };
  }
}

export function deleteRuleFromBidirectionalChain(
  chain: BidirectionalChain,
  index: number,
  direction: 'forward' | 'backward'
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