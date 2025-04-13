import { MIURules } from './miu';
import { computeRuleChain, applyRuleToChain, deleteRuleFromChain } from './ruleChain';

describe('RuleChain', () => {
  const [ruleI, ruleII, ruleIII] = MIURules;

  describe('computeRuleChain', () => {
    it('should compute a valid chain of rules', () => {
      const chain = computeRuleChain('MI', [{ rule: ruleI, position: 0 }]); // MI -> MIU
      expect(chain.currentString).toBe('MIU');
      expect(chain.intermediateStrings).toEqual(['MI', 'MIU']);
      expect(chain.validUpTo).toBe(1);
    });

    it('should identify invalid rules in the chain', () => {
      const chain = computeRuleChain('MI', [
        { rule: ruleI, position: 0 },
        { rule: ruleI, position: 0 }
      ]); // MI -> MIU -> MIU (invalid)
      expect(chain.currentString).toBe('MIU');
      expect(chain.intermediateStrings).toEqual(['MI', 'MIU']);
      expect(chain.validUpTo).toBe(1);
    });
  });

  describe('applyRuleToChain', () => {
    it('should add a valid rule to the chain', () => {
      const initialChain = computeRuleChain('MI', [{ rule: ruleII, position: 0 }]); // MI -> MII
      const newChain = applyRuleToChain(initialChain, ruleI, 0); // MI -> MII -> MIIU
      expect(newChain.currentString).toBe('MIIU');
      expect(newChain.intermediateStrings).toEqual(['MI', 'MII', 'MIIU']);
      expect(newChain.validUpTo).toBe(2);
    });

    it('should handle invalid rule additions', () => {
      const initialChain = computeRuleChain('MI', [{ rule: ruleI, position: 0 }]); // MI -> MIU
      const newChain = applyRuleToChain(initialChain, ruleI, 0); // MI -> MIU -> MIU (invalid)
      expect(newChain.currentString).toBe('MIU');
      expect(newChain.intermediateStrings).toEqual(['MI', 'MIU']);
      expect(newChain.validUpTo).toBe(1);
    });
  });

  describe('deleteRuleFromChain', () => {
    it('should remove a rule and recompute the chain', () => {
      const initialChain = computeRuleChain('MI', [
        { rule: ruleI, position: 0 },
        { rule: ruleI, position: 0 }
      ]); // MI -> MIU -> MIU (invalid)
      const newChain = deleteRuleFromChain(initialChain, 1); // MI -> MIU
      expect(newChain.currentString).toBe('MIU');
      expect(newChain.intermediateStrings).toEqual(['MI', 'MIU']);
      expect(newChain.validUpTo).toBe(1);
    });

    it('should handle deletion that makes subsequent rules valid', () => {
      const initialChain = computeRuleChain('MI', [
        { rule: ruleII, position: 0 },
        { rule: ruleII, position: 0 },
        { rule: ruleIII, position: 0 }
      ]);
      const newChain = deleteRuleFromChain(initialChain, 1);
      expect(newChain.currentString).toBe('MII');
      expect(newChain.intermediateStrings).toEqual(['MI', 'MII']);
      expect(newChain.validUpTo).toBe(1);
    });
  });
});