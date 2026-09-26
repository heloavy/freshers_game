export interface AdminMember {
  id: string;
  name: string;
  role: string;
  passcode: string; // passcode to authenticate as this admin
  email?: string;
  avatar: string;
}

export interface TeamLeaderboardEntry {
  team_id: string; // e.g. TEAM-01 ... or custom code TEAM-55, etc.
  team_name: string;
  avatar?: string; // Team chosen avatar icon/emoji (e.g. 🚀, 🤖, ⚡, 🐉, 🛸, 👾, 🐱‍💻, 🦊)
  current_level: number; // 1 to 5 (or 6 for completed)
  score: number;
  elapsed_time: number; // seconds
  penalties: number; // seconds
  updated_at: string;
  is_disqualified?: boolean;
}

export type GameLevelId = 1 | 2 | 3 | 4 | 5;

export interface GameState {
  teamId: string;
  teamName: string;
  avatar: string;
  isStarted: boolean;
  isCompleted: boolean;
  currentLevel: GameLevelId;
  elapsedTime: number; // seconds
  penalties: number; // seconds
  score: number;
  levelStartTime: number;
}

// 16 Futuristic Zero-G Cyberpunk Team Avatars
export const TEAM_AVATARS = [
  { id: 'rocket', emoji: '🚀', label: 'Hyperion Rocket' },
  { id: 'cyborg', emoji: '🤖', label: 'Matrix Android' },
  { id: 'alien', emoji: '👾', label: 'Quantum Impostor' },
  { id: 'lightning', emoji: '⚡', label: 'Tesla Arc' },
  { id: 'dragon', emoji: '🐉', label: 'Cyber Dragon' },
  { id: 'ufo', emoji: '🛸', label: 'Zero-G Saucer' },
  { id: 'ninja', emoji: '🥷', label: 'Stealth Root' },
  { id: 'hacker', emoji: '💻', label: 'Kernel Master' },
  { id: 'skull', emoji: '💀', label: 'Phreaker Skull' },
  { id: 'phoenix', emoji: '🦅', label: 'Neon Falcon' },
  { id: 'fire', emoji: '🔥', label: 'Solar Flare' },
  { id: 'saturn', emoji: '🪐', label: 'Orbital Ring' },
  { id: 'crystal', emoji: '💎', label: 'Quantum Diamond' },
  { id: 'fox', emoji: '🦊', label: 'Cyber Fox' },
  { id: 'shield', emoji: '🛡️', label: 'Firewall Aegis' },
  { id: 'crown', emoji: '👑', label: 'Monarch Prime' },
];

// 50 Sequential Standard Team Slots: TEAM_01 to TEAM_50
export const STANDARD_TEAM_SLOTS: string[] = Array.from({ length: 50 }, (_, i) => {
  const num = i + 1;
  const pad = num < 10 ? `0${num}` : `${num}`;
  return `TEAM_${pad}`;
});
