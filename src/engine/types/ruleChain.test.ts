import { Rules } from '../../games/miu/rules';
import { computeRuleChain, applyRuleToChain, deleteRuleFromChain, computeBidirectionalChain } from './ruleChain';

describe('RuleChain', () => {
  const [ruleI, ruleII, ruleIII] = Rules;

  describe('computeRuleChain', () => {
    it('should compute a valid chain of forward rules', () => {
      const chain = computeRuleChain('MI', [
        { rule: ruleI, position: 0, direction: 'forward' }
      ]); // MI -> MIU
      expect(chain.currentString).toBe('MIU');
      expect(chain.intermediateStrings).toEqual(['MI', 'MIU']);
      expect(chain.validUpTo).toBe(1);
    });

    it('should compute a valid chain of backward rules', () => {
      const chain = computeRuleChain('MIU', [
        { rule: ruleI, position: 0, direction: 'backward' }
      ]); // MIU -> MI
      expect(chain.currentString).toBe('MI');
      expect(chain.intermediateStrings).toEqual(['MIU', 'MI']);
      expect(chain.validUpTo).toBe(1);
    });

    it('should identify invalid rules in the chain', () => {
      const chain = computeRuleChain('MI', [
        { rule: ruleI, position: 0, direction: 'forward' },
        { rule: ruleI, position: 0, direction: 'forward' }
      ]); // MI -> MIU -> MIU (invalid)
      expect(chain.currentString).toBe('MIU');
      expect(chain.intermediateStrings).toEqual(['MI', 'MIU']);
      expect(chain.validUpTo).toBe(1);
    });
  });

  describe('applyRuleToChain', () => {
    it('should add a valid forward rule to the chain', () => {
      const initialChain = computeRuleChain('MI', [
        { rule: ruleII, position: 0, direction: 'forward' }
      ]); // MI -> MII
      const newChain = applyRuleToChain(initialChain, ruleI, 0, 'forward'); // MI -> MII -> MIIU
      expect(newChain.currentString).toBe('MIIU');
      expect(newChain.intermediateStrings).toEqual(['MI', 'MII', 'MIIU']);
      expect(newChain.validUpTo).toBe(2);
    });

    it('should add a valid backward rule to the chain', () => {
      const initialChain = computeRuleChain('MIU', [
        { rule: ruleI, position: 0, direction: 'backward' }
      ]); // MIU -> MI
      const newChain = applyRuleToChain(initialChain, ruleII, 0, 'backward'); // MIU -> MI -> M
      expect(newChain.currentString).toBe('MI');
      expect(newChain.intermediateStrings).toEqual(['MIU', 'MI']);
      expect(newChain.validUpTo).toBe(1);
    });

    it('should handle invalid rule additions', () => {
      const initialChain = computeRuleChain('MI', [
        { rule: ruleI, position: 0, direction: 'forward' }
      ]); // MI -> MIU
      const newChain = applyRuleToChain(initialChain, ruleI, 0, 'forward'); // MI -> MIU -> MIU (invalid)
      expect(newChain.currentString).toBe('MIU');
      expect(newChain.intermediateStrings).toEqual(['MI', 'MIU']);
      expect(newChain.validUpTo).toBe(1);
    });
  });

  describe('deleteRuleFromChain', () => {
    it('should remove a rule and recompute the chain', () => {
      const initialChain = computeRuleChain('MI', [
        { rule: ruleI, position: 0, direction: 'forward' },
        { rule: ruleI, position: 0, direction: 'forward' }
      ]); // MI -> MIU -> MIU (invalid)
      const newChain = deleteRuleFromChain(initialChain, 1); // MI -> MIU
      expect(newChain.currentString).toBe('MIU');
      expect(newChain.intermediateStrings).toEqual(['MI', 'MIU']);
      expect(newChain.validUpTo).toBe(1);
    });

    it('should handle deletion that makes subsequent rules valid', () => {
      const initialChain = computeRuleChain('MI', [
        { rule: ruleII, position: 0, direction: 'forward' },
        { rule: ruleII, position: 0, direction: 'forward' },
        { rule: ruleIII, position: 0, direction: 'forward' }
      ]);
      const newChain = deleteRuleFromChain(initialChain, 1);
      expect(newChain.currentString).toBe('MII');
      expect(newChain.intermediateStrings).toEqual(['MI', 'MII']);
      expect(newChain.validUpTo).toBe(1);
    });
  });

  describe('computeBidirectionalChain', () => {
    it('should compute chains in both directions', () => {
      const chain = computeBidirectionalChain(
        'MI',
        'MIU',
        [{ rule: ruleI, position: 0, direction: 'forward' }],
        [{ rule: ruleI, position: 0, direction: 'backward' }]
      );
      
      expect(chain.forward.currentString).toBe('MIU');
      expect(chain.forward.intermediateStrings).toEqual(['MI', 'MIU']);
      expect(chain.reverse.currentString).toBe('MI');
      expect(chain.reverse.intermediateStrings).toEqual(['MIU', 'MI']);
      expect(chain.meetingPoint).toBe('MI');
    });

    it('should handle chains with no meeting point', () => {
      const chain = computeBidirectionalChain(
        'MI',
        'MIIII',
        [{ rule: ruleI, position: 0, direction: 'forward' }],
        [{ rule: ruleII, position: 0, direction: 'backward' }]
      );
      
      expect(chain.forward.currentString).toBe('MIU');
      expect(chain.reverse.currentString).toBe('MII');
      expect(chain.meetingPoint).toBeNull();
    });
  });
});