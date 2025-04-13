import { BidirectionalRule, RuleApplication } from '../../engine/types/types';

// The four MIU rules with their forward and backward transformations
export const Rules: BidirectionalRule[] = [
  // Rule I: Add/Remove U after I
  {
    id: 'rule1',
    name: 'Rule I',
    description: 'Add or remove U after I',
    forward: {
      name: 'Add U',
      description: 'Add U to any string ending in I',
      findApplications: (s: string) => {
        if (s.endsWith('I')) {
          return [{
            startIndex: s.length - 1,
            endIndex: s.length,
            replacement: 'IU',
            preview: s + 'U'
          }];
        }
        return [];
      },
      transform: (s: string, position: number) => {
        const apps = Rules[0].forward.findApplications(s);
        return apps[position]?.preview ?? s;
      }
    },
    backward: {
      name: 'Remove U',
      description: 'Remove U that follows I',
      findApplications: (s: string) => {
        const positions: RuleApplication[] = [];
        let i = 0;
        while (i < s.length - 1) {
          if (s.slice(i, i + 2) === 'IU') {
            positions.push({
              startIndex: i,
              endIndex: i + 2,
              replacement: 'I',
              preview: s.slice(0, i) + 'I' + s.slice(i + 2)
            });
          }
          i++;
        }
        return positions;
      },
      transform: (s: string, position: number) => {
        const apps = Rules[0].backward.findApplications(s);
        return apps[position]?.preview ?? s;
      }
    }
  },
  // Rule II: Double/Halve after M
  {
    id: 'rule2',
    name: 'Rule II',
    description: 'Double or halve the string after M',
    forward: {
      name: 'Double',
      description: 'Double everything after M',
      findApplications: (s: string) => {
        if (s.startsWith('M')) {
          const rest = s.slice(1);
          return [{
            startIndex: 1,
            endIndex: s.length,
            replacement: rest + rest,
            preview: 'M' + rest + rest
          }];
        }
        return [];
      },
      transform: (s: string, position: number) => {
        const apps = Rules[1].forward.findApplications(s);
        return apps[position]?.preview ?? s;
      }
    },
    backward: {
      name: 'Halve',
      description: 'If the part after M is doubled, remove half',
      findApplications: (s: string) => {
        if (!s.startsWith('M')) return [];

        const rest = s.slice(1);
        if (rest.length % 2 !== 0) return [];

        const half = rest.slice(0, rest.length / 2);
        const otherHalf = rest.slice(rest.length / 2);

        if (half === otherHalf) {
          return [{
            startIndex: 1,
            endIndex: s.length,
            replacement: half,
            preview: 'M' + half
          }];
        }
        return [];
      },
      transform: (s: string, position: number) => {
        const apps = Rules[1].backward.findApplications(s);
        return apps[position]?.preview ?? s;
      }
    }
  },
  // Rule III: Replace III with U or U with III
  {
    id: 'rule3',
    name: 'Rule III',
    description: 'Replace III with U or U with III',
    forward: {
      name: 'III → U',
      description: 'Replace III with U',
      findApplications: (s: string) => {
        const positions: RuleApplication[] = [];
        let i = 0;
        while (i <= s.length - 3) {
          if (s.slice(i, i + 3) === 'III') {
            positions.push({
              startIndex: i,
              endIndex: i + 3,
              replacement: 'U',
              preview: s.slice(0, i) + 'U' + s.slice(i + 3)
            });
            i += 1; // Move forward by 1 to catch overlapping patterns
          } else {
            i += 1;
          }
        }
        return positions;
      },
      transform: (s: string, position: number) => {
        const apps = Rules[2].forward.findApplications(s);
        return apps[position]?.preview ?? s;
      }
    },
    backward: {
      name: 'U → III',
      description: 'Replace U with III',
      findApplications: (s: string) => {
        const positions: RuleApplication[] = [];
        let i = 0;
        while (i < s.length) {
          if (s[i] === 'U') {
            positions.push({
              startIndex: i,
              endIndex: i + 1,
              replacement: 'III',
              preview: s.slice(0, i) + 'III' + s.slice(i + 1)
            });
          }
          i++;
        }
        return positions;
      },
      transform: (s: string, position: number) => {
        const apps = Rules[2].backward.findApplications(s);
        return apps[position]?.preview ?? s;
      }
    }
  },
  // Rule IV: Remove/Insert UU
  {
    id: 'rule4',
    name: 'Rule IV',
    description: 'Remove or insert UU',
    forward: {
      name: 'Remove UU',
      description: 'Remove UU',
      findApplications: (s: string) => {
        const positions: RuleApplication[] = [];
        let match;
        const regex = /UU/g;
        while ((match = regex.exec(s)) !== null) {
          positions.push({
            startIndex: match.index,
            endIndex: match.index + 2,
            replacement: '',
            preview: s.slice(0, match.index) + s.slice(match.index + 2)
          });
        }
        return positions;
      },
      transform: (s: string, position: number) => {
        const apps = Rules[3].forward.findApplications(s);
        return apps[position]?.preview ?? s;
      }
    },
    backward: {
      name: 'Insert UU',
      description: 'Insert UU anywhere (except before M)',
      findApplications: (s: string) => {
        const positions: RuleApplication[] = [];
        // Can insert UU at any position, except before M at the start
        for (let i = 0; i <= s.length; i++) {
          // Skip position 0 if string starts with M
          if (i === 0 && s.startsWith('M')) continue;
          positions.push({
            startIndex: i,
            endIndex: i,
            replacement: 'UU',
            preview: s.slice(0, i) + 'UU' + s.slice(i)
          });
        }
        return positions;
      },
      transform: (s: string, position: number) => {
        const apps = Rules[3].backward.findApplications(s);
        return apps[position]?.preview ?? s;
      }
    }
  }
];
