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
  startPvEBattle: (characterId: string, monsterId: string, monsterLevel?: number) => void;
  sendMove: (characterId: string, attack: BodyPart, block: [BodyPart, BodyPart]) => void;
  socket: typeof socket; // Expose socket
}

export const useBattleStore = create<BattleState>((set, get) => ({
  socket, // Expose socket
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
    const currentBlocks = selectedBlocks || []; // Safety check
    
    if (currentBlocks.includes(part)) {
      set({ selectedBlocks: currentBlocks.filter(p => p !== part) });
    } else {
      if (currentBlocks.length < 2) {
        set({ selectedBlocks: [...currentBlocks, part] });
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
      const pData = Object.values(state.players).find(
        (p: any) => p.characterId === characterId
      ) as any;

      const oData = Object.values(state.players).find(
        (p: any) => p.characterId !== characterId
      ) as any;

      set({ 
        battleId: state.id,
        player: pData ? { ...pData, avatarUrl: pData.avatar } : null,
        opponent: oData ? { ...oData, avatarUrl: oData.avatar } : null,
        round: state.round,
        logs: state.logs,
        status: state.status,
        timeLeft: Math.max(0, 30 - Math.floor((Date.now() - state.timerStart) / 1000)),
        isReady: !!pData?.currentMove
      });
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

  startPvEBattle: (characterId: string, monsterId: string, monsterLevel?: number) => {
    socket.emit('battle_start_pve', { characterId, monsterId, monsterLevel });
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
