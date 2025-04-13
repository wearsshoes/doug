import { Rule } from './miu';

export interface RuleChain {
  rules: Rule[];
  currentString: string;
  intermediateStrings: string[];
  validUpTo: number;
}

export function computeRuleChain(startString: string, rules: Rule[]): RuleChain {
  const intermediateStrings = [startString];
  let currentString = startString;
  let validUpTo = rules.length;

  // Apply each rule in sequence
  for (let i = 0; i < rules.length; i++) {
    const newString = rules[i].transform(currentString);
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

export function applyRuleToChain(chain: RuleChain, rule: Rule): RuleChain {
  return computeRuleChain(chain.intermediateStrings[0], [...chain.rules, rule]);
}

export function deleteRuleFromChain(chain: RuleChain, index: number): RuleChain {
  const newRules = [...chain.rules.slice(0, index), ...chain.rules.slice(index + 1)];
  return computeRuleChain(chain.intermediateStrings[0], newRules);
}