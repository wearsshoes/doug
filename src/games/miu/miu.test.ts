import { Rules } from './rules';

describe('MIU Rules', () => {
  const [ruleI, ruleII, ruleIII, ruleIV] = Rules;

  describe('Rule I: Add/Remove U after I', () => {
    describe('forward: Add U after I', () => {
      it('should add U after I at the end', () => {
        expect(ruleI.forward.transform('MI', 0)).toBe('MIU');
        expect(ruleI.forward.transform('MII', 0)).toBe('MIIU');
      });

      it('should not modify strings not ending in I', () => {
        expect(ruleI.forward.transform('MIU', 0)).toBe('MIU');
        expect(ruleI.forward.transform('M', 0)).toBe('M');
      });
    });

    describe('backward: Remove U after I', () => {
      it('should remove U after I', () => {
        expect(ruleI.backward.transform('MIU', 0)).toBe('MI');
        expect(ruleI.backward.transform('MIIU', 0)).toBe('MII');
      });

      it('should not modify strings without IU', () => {
        expect(ruleI.backward.transform('MI', 0)).toBe('MI');
        expect(ruleI.backward.transform('MUI', 0)).toBe('MUI');
      });
    });
  });

  describe('Rule II: Double/Halve after M', () => {
    describe('forward: Double after M', () => {
      it('should double everything after M', () => {
        expect(ruleII.forward.transform('MI', 0)).toBe('MII');
        expect(ruleII.forward.transform('MII', 0)).toBe('MIIII');
        expect(ruleII.forward.transform('MIU', 0)).toBe('MIUIU');
      });

      it('should not modify strings not starting with M', () => {
        expect(ruleII.forward.transform('I', 0)).toBe('I');
        expect(ruleII.forward.transform('UI', 0)).toBe('UI');
      });
    });

    describe('backward: Halve after M', () => {
      it('should halve doubled content after M', () => {
        expect(ruleII.backward.transform('MII', 0)).toBe('MI');
        expect(ruleII.backward.transform('MIIII', 0)).toBe('MII');
        expect(ruleII.backward.transform('MIUIU', 0)).toBe('MIU');
      });

      it('should not modify strings that are not doubled', () => {
        expect(ruleII.backward.transform('MI', 0)).toBe('MI');
        expect(ruleII.backward.transform('MIII', 0)).toBe('MIII');
      });
    });
  });

  describe('Rule III: Replace III with U or U with III', () => {
    describe('forward: Replace III with U', () => {
      it('should replace III with U', () => {
        expect(ruleIII.forward.transform('MIII', 0)).toBe('MU');
        expect(ruleIII.forward.transform('MIIII', 0)).toBe('MUI');
        expect(ruleIII.forward.transform('MIIII', 1)).toBe('MIU');
      });

      it('should handle overlapping III patterns', () => {
        const str = 'MIIII';
        const positions = ruleIII.forward.findApplications(str);
        expect(positions.length).toBe(2);
        expect(ruleIII.forward.transform(str, 0)).toBe('MUI');
        expect(ruleIII.forward.transform(str, 1)).toBe('MIU');
      });
    });

    describe('backward: Replace U with III', () => {
      it('should replace U with III', () => {
        expect(ruleIII.backward.transform('MU', 0)).toBe('MIII');
        expect(ruleIII.backward.transform('MUI', 0)).toBe('MIIII');
      });

      it('should handle multiple U replacements', () => {
        const str = 'MUU';
        const positions = ruleIII.backward.findApplications(str);
        expect(positions.length).toBe(2);
        expect(ruleIII.backward.transform(str, 0)).toBe('MIIIU');
        expect(ruleIII.backward.transform(str, 1)).toBe('MUIII');
      });
    });
  });

  describe('Rule IV: Remove/Insert UU', () => {
    describe('forward: Remove UU', () => {
      it('should remove UU', () => {
        expect(ruleIV.forward.transform('MUU', 0)).toBe('M');
        expect(ruleIV.forward.transform('MUUI', 0)).toBe('MI');
      });

      it('should handle multiple UU occurrences based on position', () => {
        const str = 'MUUUU';
        const positions = ruleIV.forward.findApplications(str);
        expect(positions.length).toBe(2);
        expect(ruleIV.forward.transform(str, 0)).toBe('MUU');
        expect(ruleIV.forward.transform(str, 1)).toBe('MUU');
      });
    });

    describe('backward: Insert UU', () => {
      it('should insert UU at any position', () => {
        const str = 'MI';
        const positions = ruleIV.backward.findApplications(str);
        expect(positions.length).toBe(3); // Start, between M and I, end
        expect(ruleIV.backward.transform(str, 0)).toBe('UUMI');
        expect(ruleIV.backward.transform(str, 1)).toBe('MUUI');
        expect(ruleIV.backward.transform(str, 2)).toBe('MIUU');
      });
    });
  });
});