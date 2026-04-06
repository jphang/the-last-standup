export type CharacterClass = 'ceo' | 'devops' | 'fullstack' | 'designer' | 'qa' | 'intern' | 'support' | 'pm' | 'sales' | 'recruiter';

export interface PlayerCharacter {
  id: string;
  user_id: string;
  name: string;
  character_key: string;
  level: number;
  exp: number;
  max_hp: number;
  current_hp: number;
  attack: number;
  defense: number;
  battles_won: number;
  battles_lost: number;
  boss_defeats: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string;
  is_premium: boolean;
  premium_expires_at: string | null;
  stripe_customer_id: string | null;
  subscription_status: 'free' | 'active' | 'cancelling';
  created_at: string;
  updated_at: string;
}

export type AlienSpriteKey = 'alien' | 'alien_brute' | 'alien_stalker' | 'alien_drone' | 'alien_spitter';

export interface AlienEnemy {
  name: string;
  title: string;
  description: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  level: number;
  isBoss: boolean;
  spriteKey: AlienSpriteKey;
}

export interface TriviaQuestion {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  difficulty: string;
  type: string;
  category: string;
}

export type BattlePhase =
  | 'player_choose'
  | 'trivia_attack'
  | 'player_attacking'
  | 'enemy_incoming'
  | 'trivia_defend'
  | 'enemy_attacking'
  | 'battle_won'
  | 'battle_lost';

export interface BattleState {
  playerHp: number;
  playerMaxHp: number;
  enemy: AlienEnemy;
  phase: BattlePhase;
  currentQuestion: TriviaQuestion | null;
  battleLog: string[];
  expGained: number;
  lastDamage: { target: 'player' | 'enemy'; amount: number } | null;
}

export interface CharacterClassInfo {
  name: string;
  title: string;
  description: string;
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  icon: string;
  color: string;
  bgGradient: string;
}

export const CHARACTER_CLASSES: Record<CharacterClass, CharacterClassInfo> = {
  ceo: {
    name: 'Chad Thunderpitch',
    title: 'The CEO',
    description: 'Motivational speeches that deal actual damage. "We\'re not just disrupting the market, we\'re disrupting the aliens."',
    baseHp: 50,
    baseAttack: 12,
    baseDefense: 8,
    icon: 'Briefcase',
    color: '#10b981',
    bgGradient: 'from-emerald-900/40 to-emerald-800/20',
  },
  devops: {
    name: 'Kay "K8s" Kubernetes',
    title: 'DevOps Engineer',
    description: 'Containerizes alien threats. If the defense goes down, she just spins up another pod.',
    baseHp: 45,
    baseAttack: 8,
    baseDefense: 14,
    icon: 'Server',
    color: '#06b6d4',
    bgGradient: 'from-cyan-900/40 to-cyan-800/20',
  },
  fullstack: {
    name: 'Devin Overflow',
    title: 'Full-Stack Developer',
    description: 'Attacks by copy-pasting solutions from Stack Overflow. Surprisingly effective against aliens.',
    baseHp: 40,
    baseAttack: 16,
    baseDefense: 6,
    icon: 'Code',
    color: '#f59e0b',
    bgGradient: 'from-amber-900/40 to-amber-800/20',
  },
  designer: {
    name: 'Pixel McFigma',
    title: 'UX Designer',
    description: 'Makes aliens question their life choices with empathy maps and user journey diagrams.',
    baseHp: 55,
    baseAttack: 10,
    baseDefense: 10,
    icon: 'Palette',
    color: '#f43f5e',
    bgGradient: 'from-rose-900/40 to-rose-800/20',
  },
  qa: {
    name: 'Bug Buster Betty',
    title: 'QA Tester',
    description: 'Finds bugs in the alien invasion plan. Every. Single. One. Then files a ticket about it.',
    baseHp: 42,
    baseAttack: 14,
    baseDefense: 8,
    icon: 'Bug',
    color: '#f97316',
    bgGradient: 'from-orange-900/40 to-orange-800/20',
  },
  support: {
    name: 'Patience "Ping" Patterson',
    title: 'Support Engineer',
    description: '"Have you tried turning Earth off and on again?" Weaponizes a thousand-yard customer service stare.',
    baseHp: 48,
    baseAttack: 8,
    baseDefense: 12,
    icon: 'Headphones',
    color: '#14b8a6',
    bgGradient: 'from-teal-900/40 to-teal-800/20',
  },
  pm: {
    name: 'Jira "Blocker" Jenkins',
    title: 'Product Manager',
    description: 'Defeats aliens by scheduling them into back-to-back meetings until they surrender. "Let\'s circle back on the invasion."',
    baseHp: 44,
    baseAttack: 10,
    baseDefense: 10,
    icon: 'ClipboardList',
    color: '#3b82f6',
    bgGradient: 'from-blue-900/40 to-blue-800/20',
  },
  sales: {
    name: 'Gary "Always Closing" Grimes',
    title: 'Sales Representative',
    description: 'Tries to sell the aliens a SaaS subscription before punching them. Surprisingly, sometimes it works.',
    baseHp: 38,
    baseAttack: 16,
    baseDefense: 4,
    icon: 'TrendingUp',
    color: '#22c55e',
    bgGradient: 'from-green-900/40 to-green-800/20',
  },
  recruiter: {
    name: 'Linda "Culture Fit" Liu',
    title: 'Recruiter',
    description: '"We\'re looking for someone with 10 years of alien combat experience in a 2-year-old field." Weaponizes rejection emails.',
    baseHp: 52,
    baseAttack: 6,
    baseDefense: 14,
    icon: 'UserSearch',
    color: '#ec4899',
    bgGradient: 'from-pink-900/40 to-pink-800/20',
  },
  intern: {
    name: 'Timmy "No-Salary"',
    title: 'The Intern',
    description: 'Works for "experience" and "exposure." Turns out alien combat counts as professional development.',
    baseHp: 35,
    baseAttack: 10,
    baseDefense: 6,
    icon: 'Coffee',
    color: '#0ea5e9',
    bgGradient: 'from-sky-900/40 to-sky-800/20',
  },
};

export type GameScreen = 'login' | 'dashboard' | 'create' | 'battle' | 'premium' | 'edit';
