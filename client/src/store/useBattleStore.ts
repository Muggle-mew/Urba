import { create } from 'zustand';

export type BodyPart = 'HEAD' | 'CHEST' | 'STOMACH' | 'LEGS';

interface Fighter {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  level: number;
  avatarUrl?: string;
}

interface BattleState {
  // Battle Info
  battleId: string | null;
  opponent: Fighter | null;
  player: Fighter | null;
  
  // Combat Logic
  selectedAttack: BodyPart | null;
  selectedBlocks: BodyPart[];
  
  // Timer
  timeLeft: number;
  isReady: boolean;
  
  // Actions
  setAttack: (part: BodyPart) => void;
  toggleBlock: (part: BodyPart) => void;
  commitTurn: () => void;
  resetTurn: () => void;
}

export const useBattleStore = create<BattleState>((set, get) => ({
  battleId: 'test-battle-1',
  player: {
    id: 'hero',
    name: 'Hero',
    hp: 100,
    maxHp: 100,
    level: 5,
  },
  opponent: {
    id: 'villain',
    name: 'Rat Mutant',
    hp: 80,
    maxHp: 80,
    level: 4,
  },
  
  selectedAttack: null,
  selectedBlocks: [],
  timeLeft: 30,
  isReady: false,
  
  setAttack: (part) => set({ selectedAttack: part }),
  
  toggleBlock: (part) => {
    const { selectedBlocks } = get();
    if (selectedBlocks.includes(part)) {
      set({ selectedBlocks: selectedBlocks.filter(p => p !== part) });
    } else {
      if (selectedBlocks.length < 2) {
        set({ selectedBlocks: [...selectedBlocks, part] });
      }
    }
  },
  
  commitTurn: () => {
    const { selectedAttack, selectedBlocks } = get();
    if (selectedAttack && selectedBlocks.length === 2) {
      set({ isReady: true });
      // Here we would send data to WebSocket
      console.log('Committing turn:', { attack: selectedAttack, blocks: selectedBlocks });
    }
  },
  
  resetTurn: () => set({ selectedAttack: null, selectedBlocks: [], isReady: false }),
}));
