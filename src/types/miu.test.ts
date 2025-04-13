import { MIURules } from './miu';

describe('MIU Rules', () => {
  const [ruleI, ruleII, ruleIII, ruleIV] = MIURules;

  describe('Rule I: Add U after I', () => {
    it('should add U after I at the end', () => {
      expect(ruleI.transform('MI', 0)).toBe('MIU');
      expect(ruleI.transform('MII', 0)).toBe('MIIU');
    });

    it('should not modify strings not ending in I', () => {
      expect(ruleI.transform('MIU', 0)).toBe('MIU');
      expect(ruleI.transform('M', 0)).toBe('M');
    });
  });

  describe('Rule II: Double after M', () => {
    it('should double everything after M', () => {
      expect(ruleII.transform('MI', 0)).toBe('MII');
      expect(ruleII.transform('MII', 0)).toBe('MIIII');
      expect(ruleII.transform('MIU', 0)).toBe('MIUIU');
    });

    it('should not modify strings not starting with M', () => {
      expect(ruleII.transform('I', 0)).toBe('I');
      expect(ruleII.transform('UI', 0)).toBe('UI');
    });
  });

  describe('Rule III: Replace III with U', () => {
    it('should replace III with U', () => {
      expect(ruleIII.transform('MIII', 0)).toBe('MU');
      expect(ruleIII.transform('MIIII', 0)).toBe('MUI');
      expect(ruleIII.transform('MIIII', 1)).toBe('MIU');
    });

    it('should handle overlapping III patterns', () => {
      const str = 'MIIII';
      const positions = ruleIII.findApplications(str);
      expect(positions.length).toBe(2);
      expect(ruleIII.transform(str, 0)).toBe('MUI');
      expect(ruleIII.transform(str, 1)).toBe('MIU');
    });

    it('should handle multiple non-overlapping III occurrences', () => {
      const str = 'MIIIIII';
      const positions = ruleIII.findApplications(str);
      expect(positions.length).toBe(3);
      expect(ruleIII.transform(str, 0)).toBe('MUIII');
      expect(ruleIII.transform(str, 1)).toBe('MIUII');
      expect(ruleIII.transform(str, 2)).toBe('MIIIU');
    });
  });

  describe('Rule IV: Remove UU', () => {
    it('should remove UU', () => {
      expect(ruleIV.transform('MUU', 0)).toBe('M');
      expect(ruleIV.transform('MUUI', 0)).toBe('MI');
    });

    it('should handle multiple UU occurrences based on position', () => {
      const str = 'MUUUU';
      const positions = ruleIV.findApplications(str);
      expect(positions.length).toBe(2);
      expect(ruleIV.transform(str, 0)).toBe('MUU');
      expect(ruleIV.transform(str, 1)).toBe('MUU');
    });
  });
});