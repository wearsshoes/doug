import { Level } from '../../engine/types/types';

export const Levels: Level[] = [
  {
    id: 'level1',
    startString: 'MI',
    targetString: 'MIU',
    description: 'Convert MI to MIU - Use Rule I to add U after I',
    difficulty: 'Easy',
  },
  {
    id: 'level2',
    startString: 'MI',
    targetString: 'MUI',
    description: 'Convert MI to MUI - Try using Rule II first!',
    difficulty: 'Medium',
  },
  {
    id: 'level3',
    startString: 'MII',
    targetString: 'MIUIU',
    description: 'Convert MII to MIUIU - Rule II might be helpful here',
    difficulty: 'Medium',
  },
  {
    id: 'level4',
    startString: 'MIII',
    targetString: 'MU',
    description: 'Convert MIII to MU - Use Rule III to replace III with U',
    difficulty: 'Hard',
  },
];