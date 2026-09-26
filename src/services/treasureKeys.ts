export interface TreasureKey {
  id: number;
  level: number;
  code: string;
  name: string;
  icon: string;
  hex: string;
  fragment: string;
  color: string;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  sourceSector: string;
  clue: string;
}

export const FINAL_TREASURE_ANSWER = 'Freshers 2026 on 30th';

export const TREASURE_KEYS: TreasureKey[] = [
  {
    id: 1,
    level: 1,
    code: 'TK-ALPHA-01',
    name: 'Cipher Key Alpha',
    icon: '🗝️',
    hex: '0x4672657368',
    fragment: 'Fresh',
    color: '#06b6d4',
    accentClass: 'text-cyan-400',
    borderClass: 'border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.4)]',
    bgClass: 'bg-cyan-950/40',
    sourceSector: 'Sector 01 // Tech Logic Matrix',
    clue: 'Inaugural foundation cipher shard salvaged from the core diagnostic matrix.',
  },
  {
    id: 2,
    level: 2,
    code: 'TK-BETA-02',
    name: 'Quantum Key Beta',
    icon: '🔐',
    hex: '0x65727320',
    fragment: 'ers ',
    color: '#a855f7',
    accentClass: 'text-purple-400',
    borderClass: 'border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    bgClass: 'bg-purple-950/40',
    sourceSector: 'Sector 02 // Quantum N-Queens Matrix',
    clue: 'Symmetric crown matrix key unlocked by resolving non-conflicting frequencies.',
  },
  {
    id: 3,
    level: 3,
    code: 'TK-GAMMA-03',
    name: 'Syntax Key Gamma',
    icon: '⚡',
    hex: '0x3230323620',
    fragment: '2026 ',
    color: '#f59e0b',
    accentClass: 'text-amber-400',
    borderClass: 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.4)]',
    bgClass: 'bg-amber-950/40',
    sourceSector: 'Sector 03 // Compiler & Syntax Matrix',
    clue: 'Lexical parsing token synthesized from the C, Python & Compiler keyword grid.',
  },
  {
    id: 4,
    level: 4,
    code: 'TK-DELTA-04',
    name: 'Deflector Key Delta',
    icon: '🧩',
    hex: '0x6F6E20',
    fragment: 'on ',
    color: '#10b981',
    accentClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.4)]',
    bgClass: 'bg-emerald-950/40',
    sourceSector: 'Sector 04 // Cyber Bug Smasher',
    clue: 'Dynamic runtime patch key recovered after eradicating anomalous glitches.',
  },
  {
    id: 5,
    level: 5,
    code: 'TK-OMEGA-05',
    name: 'Omega Master Key',
    icon: '👑',
    hex: '0x33307468',
    fragment: '30th',
    color: '#eab308',
    accentClass: 'text-yellow-400',
    borderClass: 'border-yellow-500/60 shadow-[0_0_25px_rgba(234,179,8,0.5)]',
    bgClass: 'bg-yellow-950/40',
    sourceSector: 'Sector 05 // Loop Snippet Predictor',
    clue: 'Recursive execution singularity key that triggers the Master Decryption Terminal.',
  },
];

export const getKeyByLevel = (level: number): TreasureKey | undefined => {
  return TREASURE_KEYS.find((k) => k.level === level);
};

export const decodeAssembledKeys = (unlockedLevels: number[]): {
  isFullyDecoded: boolean;
  assembledString: string;
  keysCount: number;
} => {
  const sorted = [...unlockedLevels].sort((a, b) => a - b);
  const fragments = sorted
    .map((lvl) => {
      const k = getKeyByLevel(lvl);
      return k ? k.fragment : '';
    })
    .join('');

  return {
    isFullyDecoded: unlockedLevels.length >= 5,
    assembledString: fragments,
    keysCount: unlockedLevels.length,
  };
};
