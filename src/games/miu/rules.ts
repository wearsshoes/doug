import { Rule, RuleApplication } from '../../engine/types/types';

// The four MIU rules as defined by Hofstadter
export const Rules: Rule[] = [
  {
    id: 'rule1',
    name: 'Rule I',
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
      const apps = Rules[0].findApplications(s);
      return apps[position]?.preview ?? s;
    }
  },
  {
    id: 'rule2',
    name: 'Rule II',
    description: 'Double everything after M (e.g., MI → MII, MII → MIIII)',
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
      const apps = Rules[1].findApplications(s);
      return apps[position]?.preview ?? s;
    }
  },
  {
    id: 'rule3',
    name: 'Rule III',
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
      const apps = Rules[2].findApplications(s);
      return apps[position]?.preview ?? s;
    }
  },
  {
    id: 'rule4',
    name: 'Rule IV',
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
      const apps = Rules[3].findApplications(s);
      return apps[position]?.preview ?? s;
    }
  },
];
