import { MIURules } from './miu';

describe('MIU Rules', () => {
  const [ruleI, ruleII, ruleIII, ruleIV] = MIURules;

  describe('Rule I: Add U after I', () => {
    it('should add U after I at the end', () => {
      expect(ruleI.transform('MI')).toBe('MIU');
      expect(ruleI.transform('MII')).toBe('MIIU');
    });

    it('should not modify strings not ending in I', () => {
      expect(ruleI.transform('MIU')).toBe('MIU');
      expect(ruleI.transform('M')).toBe('M');
    });
  });

  describe('Rule II: Double after M', () => {
    it('should double everything after M', () => {
      expect(ruleII.transform('MI')).toBe('MII');
      expect(ruleII.transform('MII')).toBe('MIIII');
      expect(ruleII.transform('MIU')).toBe('MIUIU');
    });

    it('should not modify strings not starting with M', () => {
      expect(ruleII.transform('I')).toBe('I');
      expect(ruleII.transform('UI')).toBe('UI');
    });
  });

  describe('Rule III: Replace III with U', () => {
    it('should replace III with U', () => {
      expect(ruleIII.transform('MIII')).toBe('MU');
      expect(ruleIII.transform('MIIII')).toBe('MUI');
    });

    it('should replace multiple III occurrences', () => {
      expect(ruleIII.transform('MIIIII')).toBe('MUII');
      expect(ruleIII.transform('MIIIIII')).toBe('MUU');
    });
  });

  describe('Rule IV: Remove UU', () => {
    it('should remove UU', () => {
      expect(ruleIV.transform('MUU')).toBe('M');
      expect(ruleIV.transform('MUUI')).toBe('MI');
    });

    it('should remove multiple UU occurrences', () => {
      expect(ruleIV.transform('MUUUU')).toBe('M');
      expect(ruleIV.transform('MUUUUI')).toBe('MI');
    });
  });

  describe('Rule combinations', () => {
    it('MI → MII → MIIU (Rule II then Rule I)', () => {
      const step1 = ruleII.transform('MI');
      expect(step1).toBe('MII');

      const step2 = ruleI.transform(step1);
      expect(step2).toBe('MIIU');
    });

    it('MII → MIIII → MUI (Rule II then Rule III)', () => {
      const step1 = ruleII.transform('MII');
      expect(step1).toBe('MIIII');

      const step2 = ruleIII.transform(step1);
      expect(step2).toBe('MUI');
    });

    it('MI → MII → MIIII → MUI (Rule II twice then Rule III)', () => {
      const step1 = ruleII.transform('MI');
      expect(step1).toBe('MII');

      const step2 = ruleII.transform(step1);
      expect(step2).toBe('MIIII');

      const step3 = ruleIII.transform(step2);
      expect(step3).toBe('MUI');
    });

    it('MIII → MU → MUU → M (Rule III then Rule I then Rule IV)', () => {
      const step1 = ruleIII.transform('MIII');
      expect(step1).toBe('MU');

      const step2 = ruleI.transform(step1);
      expect(step2).toBe('MU');

      const step3 = ruleII.transform(step2);
      expect(step3).toBe('MUU');

      const step4 = ruleIV.transform(step3);
      expect(step4).toBe('M');
    });

    it('should handle complex III replacements', () => {
      expect(ruleIII.transform('MIIIII')).toBe('MUII');
      expect(ruleIII.transform('MIIIIII')).toBe('MUU');
      expect(ruleIII.transform('MUIII')).toBe('MUU');
    });

    it('should handle Rule II followed by Rule III correctly', () => {
      const step1 = ruleII.transform('MI');
      expect(step1).toBe('MII');

      const step2 = ruleII.transform(step1);
      expect(step2).toBe('MIIII');

      const step3 = ruleIII.transform(step2);
      expect(step3).toBe('MUI');
    });
  });
});