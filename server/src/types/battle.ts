export enum BodyZone {
  HEAD = 'head',
  CHEST = 'chest',
  STOMACH = 'stomach',
  LEGS = 'legs'
}

export interface PlayerMove {
  attack: BodyZone;
  block: [BodyZone, BodyZone];
}

export interface BattlePlayer {
  socketId: string;
  characterId: string;
  name: string;
  hp: number;
  maxHp: number;
  stats: {
    strength: number;
    intuition: number;
  };
  currentMove?: PlayerMove;
  lastDamage: number;
  isCrit: boolean;
  avatar?: string;
}

export interface BattleState {
  id: string;
  players: Record<string, BattlePlayer>; // socketId -> Player
  round: number;
  logs: string[];
  status: 'waiting' | 'in_progress' | 'finished';
  timerStart: number;
  timerDuration: number;
}

export interface RoundResult {
  round: number;
  logs: string[];
  players: Record<string, { hp: number; damage: number; isCrit: boolean }>;
}
