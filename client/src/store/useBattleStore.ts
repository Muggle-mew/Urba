import { create } from 'zustand';
import { socket } from '../services/socketService';

export type BodyPart = 'head' | 'chest' | 'stomach' | 'legs';

export interface Fighter {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  level: number;
  avatarUrl?: string;
  damage?: number; // Last received damage
  isCrit?: boolean;
}

interface BattleState {
  // Battle Info
  battleId: string | null;
  opponent: Fighter | null;
  player: Fighter | null;
  
  // Game State
  round: number;
  logs: string[];
  status: 'waiting' | 'in_progress' | 'finished' | null;
  winnerId: string | null;

  // Combat Logic
  selectedAttack: BodyPart | null;
  selectedBlocks: BodyPart[];
  
  // Timer
  timeLeft: number;
  isReady: boolean;
  
  // Actions
  setBattleState: (state: Partial<BattleState>) => void;
  setAttack: (part: BodyPart) => void;
  toggleBlock: (part: BodyPart) => void;
  resetTurn: () => void;
  addLog: (log: string) => void;
  updateFighters: (playerUpdates: Partial<Fighter>, opponentUpdates: Partial<Fighter>) => void;
  
  // Socket Actions
  initSocket: (characterId: string) => void;
  joinBattle: (characterId: string) => void;
  sendMove: (characterId: string, attack: BodyPart, block: [BodyPart, BodyPart]) => void;
}

export const useBattleStore = create<BattleState>((set, get) => ({
  battleId: null,
  player: null,
  opponent: null,
  round: 0,
  logs: [],
  status: null,
  winnerId: null,
  
  selectedAttack: null,
  selectedBlocks: [],
  timeLeft: 30,
  isReady: false,
  
  setBattleState: (newState) => set((state) => ({ ...state, ...newState })),
  
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
  
  resetTurn: () => set({ selectedAttack: null, selectedBlocks: [], isReady: false }),
  
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  
  updateFighters: (pUpdates, oUpdates) => set((state) => ({
    player: state.player ? { ...state.player, ...pUpdates } : null,
    opponent: state.opponent ? { ...state.opponent, ...oUpdates } : null
  })),

  initSocket: (characterId: string) => {
    // Remove old listeners to avoid duplicates
    socket.off('battle_state');
    socket.off('battle_result');
    socket.off('battle_end');

    socket.on('battle_state', (state: any) => {
      const playerEntry = Object.entries(state.players).find(
        ([_, p]: [string, any]) => p.characterId === characterId
      );
      
      const opponentEntry = Object.entries(state.players).find(
        ([_, p]: [string, any]) => p.characterId !== characterId
      );

      if (playerEntry) {
        const [_, pData] = playerEntry;
        const [__, oData] = opponentEntry || [null, null];

        set({
          battleId: state.id,
          status: state.status,
          round: state.round,
          timeLeft: Math.max(0, 30 - Math.floor((Date.now() - state.timerStart) / 1000)),
          player: {
            id: pData.characterId,
            name: pData.name,
            hp: pData.hp,
            maxHp: pData.maxHp,
            level: 1,
            damage: pData.lastDamage,
            isCrit: pData.isCrit
          },
          opponent: oData ? {
            id: oData.characterId,
            name: oData.name,
            hp: oData.hp,
            maxHp: oData.maxHp,
            level: 1,
            damage: oData.lastDamage,
            isCrit: oData.isCrit
          } : null,
          logs: state.logs
        });
      }
    });

    socket.on('battle_result', (result: any) => {
      if (result.logs && result.logs.length > 0) {
        result.logs.forEach((log: string) => get().addLog(log));
      }
      get().resetTurn();
    });

    socket.on('battle_end', (data: any) => {
      set({ status: 'finished', winnerId: data.winnerId });
    });
  },

  joinBattle: (characterId: string) => {
    socket.emit('battle_join', { characterId });
  },

  sendMove: (characterId: string, attack: BodyPart, block: [BodyPart, BodyPart]) => {
    const { battleId } = get();
    if (battleId) {
      socket.emit('battle_turn', {
        battleId,
        characterId,
        move: { attack, block }
      });
      set({ isReady: true });
    }
  }
}));
